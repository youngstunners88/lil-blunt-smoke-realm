/**
 * Record the Godot HTML5 build straight from a headless browser.
 *
 * Why this exists: off-the-shelf recorders (clipy, screencli) drive a browser
 * at a public URL, and this sandbox drops browser traffic to the internet.
 * 127.0.0.1 is exempt from that, so serving the export locally (see
 * serve_game.py, which adds the COOP/COEP headers Godot 4 needs) puts the real
 * game in a real browser where frames can be captured.
 *
 * Frames come from CDP Page.startScreencast rather than a screenshot loop:
 * screenshots serialise against the render loop and stall a WebGL canvas to a
 * few fps, while the screencast pushes frames the compositor has already
 * produced. Each frame carries its own timestamp, so the assembled video uses
 * real inter-frame gaps instead of assuming a constant rate.
 *
 * Usage:
 *   node record_game.mjs --url http://127.0.0.1:8900/ --out /tmp/rec \
 *       --script shots.json
 */

import { chromium } from '/tmp/node_modules/playwright-core/index.mjs';
import { mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

function arg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const URL_    = arg('url', 'http://127.0.0.1:8900/');
const OUT     = arg('out', '/tmp/rec');
const WIDTH   = parseInt(arg('width', '1280'), 10);
const HEIGHT  = parseInt(arg('height', '720'), 10);
const BOOT_MS = parseInt(arg('boot', '45000'), 10);
const QUALITY = parseInt(arg('quality', '90'), 10);

// Godot listens for real key events on the window. CDP rawKeyDown/keyUp with
// the right windowsVirtualKeyCode is what the engine's input layer reads;
// Playwright's page.keyboard is a thin wrapper over the same thing but does
// not let us hold a key down across other actions, which platformers need.
const KEYS = {
  right: { code: 'ArrowRight', key: 'ArrowRight', vk: 39 },
  left:  { code: 'ArrowLeft',  key: 'ArrowLeft',  vk: 37 },
  up:    { code: 'ArrowUp',    key: 'ArrowUp',    vk: 38 },
  down:  { code: 'ArrowDown',  key: 'ArrowDown',  vk: 40 },
  space: { code: 'Space',      key: ' ',          vk: 32 },
  enter: { code: 'Enter',      key: 'Enter',      vk: 13 },
  shift: { code: 'ShiftLeft',  key: 'Shift',      vk: 16 },
  x:     { code: 'KeyX',       key: 'x',          vk: 88 },
  z:     { code: 'KeyZ',       key: 'z',          vk: 90 },
};

async function keyDown(cdp, name) {
  const k = KEYS[name];
  if (!k) throw new Error(`unknown key: ${name}`);
  await cdp.send('Input.dispatchKeyEvent', {
    type: 'rawKeyDown', code: k.code, key: k.key,
    windowsVirtualKeyCode: k.vk, nativeVirtualKeyCode: k.vk,
  });
}

async function keyUp(cdp, name) {
  const k = KEYS[name];
  await cdp.send('Input.dispatchKeyEvent', {
    type: 'keyUp', code: k.code, key: k.key,
    windowsVirtualKeyCode: k.vk, nativeVirtualKeyCode: k.vk,
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(join(OUT, 'frames'), { recursive: true });

  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: [
      '--no-sandbox', '--disable-dev-shm-usage',
      // SwiftShader gives a real WebGL2 context with no GPU present. Without
      // it Godot's renderer never initialises in this container.
      '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox',
      '--autoplay-policy=no-user-gesture-required',
      '--mute-audio',
    ],
  });

  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
  const cdp = await page.context().newCDPSession(page);

  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e.message).slice(0, 120)));

  console.log(`loading ${URL_}`);
  await page.goto(URL_, { timeout: 90000, waitUntil: 'domcontentloaded' });

  // Wait for the engine to actually present a canvas rather than a fixed sleep.
  const deadline = Date.now() + BOOT_MS;
  let booted = false;
  while (Date.now() < deadline) {
    const ok = await page.evaluate(() => {
      const c = document.querySelector('canvas');
      return !!c && c.width > 100;
    });
    if (ok) { booted = true; break; }
    await sleep(2000);
  }
  if (!booted) {
    console.error('engine did not present a canvas before timeout');
    await browser.close();
    process.exit(1);
  }
  console.log('engine booted');
  await sleep(4000);   // let the menu settle and finish its intro

  // --- frame capture -------------------------------------------------------
  const frames = [];
  cdp.on('Page.screencastFrame', async ({ data, sessionId, metadata }) => {
    frames.push({ data, ts: metadata.timestamp });
    // Must ack or the stream stalls after a handful of frames.
    try { await cdp.send('Page.screencastFrameAck', { sessionId }); } catch {}
  });

  async function startCapture() {
    await cdp.send('Page.startScreencast', {
      format: 'jpeg', quality: QUALITY,
      maxWidth: WIDTH, maxHeight: HEIGHT, everyNthFrame: 1,
    });
  }
  async function stopCapture() {
    try { await cdp.send('Page.stopScreencast'); } catch {}
  }

  // --- drive the game ------------------------------------------------------
  await startCapture();
  const t0 = Date.now();
  const marks = [];
  const mark = (label) => {
    marks.push({ label, at: (Date.now() - t0) / 1000 });
    console.log(`  mark ${label} @ ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  };

  // The action sequence lives in a JSON script so shots can be re-cut without
  // editing this file. Fractional coordinates keep it viewport-independent.
  const script = JSON.parse(
    readFileSync(arg('script', new URL('./shots.json', import.meta.url).pathname), 'utf8')
  );

  for (const step of script.steps) {
    switch (step.do) {
      case 'mark':
        mark(step.label);
        break;
      case 'wait':
        await sleep(step.ms);
        break;
      case 'click':
        // The game is one canvas, so there is nothing to query — targets are
        // fractions of the viewport, read off a screenshot.
        await page.mouse.click(
          Math.round(WIDTH * step.x), Math.round(HEIGHT * step.y)
        );
        break;
      case 'tap':
        await keyDown(cdp, step.key);
        await sleep(step.ms ?? 90);
        await keyUp(cdp, step.key);
        break;
      case 'hold':
        await keyDown(cdp, step.key);
        break;
      case 'release':
        await keyUp(cdp, step.key);
        break;
      case 'run': {
        // Hold a direction and jump on a cadence — enough to produce genuine
        // motion through a level. Not skilled play; bosses need a human.
        await keyDown(cdp, step.key ?? 'right');
        const jumps = step.jumps ?? 10;
        const jumpKey = step.jump ?? 'up';
        for (let i = 0; i < jumps; i++) {
          await sleep(step.every ?? 700);
          await keyDown(cdp, jumpKey);
          await sleep(120);
          await keyUp(cdp, jumpKey);
          if (step.attack) {
            await keyDown(cdp, 'enter'); await sleep(80); await keyUp(cdp, 'enter');
          }
        }
        await keyUp(cdp, step.key ?? 'right');
        break;
      }
      case 'shot':
        await page.screenshot({ path: join(OUT, `shot-${step.name}.png`) });
        break;
      default:
        console.warn(`  unknown step: ${step.do}`);
    }
  }

  await stopCapture();

  // --- write frames --------------------------------------------------------
  console.log(`captured ${frames.length} frames`);
  if (frames.length < 10) {
    console.error('too few frames captured; aborting');
    await browser.close();
    process.exit(1);
  }

  const base = frames[0].ts;
  const manifest = [];
  frames.forEach((f, i) => {
    const name = `f${String(i).padStart(5, '0')}.jpg`;
    writeFileSync(join(OUT, 'frames', name), Buffer.from(f.data, 'base64'));
    manifest.push({ file: name, t: +(f.ts - base).toFixed(4) });
  });

  writeFileSync(join(OUT, 'manifest.json'), JSON.stringify({
    width: WIDTH, height: HEIGHT,
    duration: +(frames[frames.length - 1].ts - base).toFixed(3),
    frames: manifest, marks, errors: errors.slice(0, 5),
  }, null, 2));

  console.log(`duration ${(frames[frames.length - 1].ts - base).toFixed(1)}s -> ${OUT}`);
  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
