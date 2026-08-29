/**
 * Drive the game inside an already-running browser, over CDP.
 *
 * The Xvfb path splits capture from control: ffmpeg grabs the X display while
 * this connects to the same Chromium over its debugging port and sends input.
 * Playwright's connectOverCDP attaches to the live browser rather than
 * launching one, so the window ffmpeg is filming is the window being driven.
 *
 * --check   prints "ready" once the engine has presented a canvas
 * --script  runs an action script (same format as record_game.mjs)
 * --budget  seconds to stay within, so the driver finishes before ffmpeg stops
 */

import { chromium } from '/tmp/node_modules/playwright-core/index.mjs';
import { readFileSync } from 'node:fs';

function arg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
const has = (name) => process.argv.includes(`--${name}`);

const CDP = arg('cdp', 'http://127.0.0.1:9333');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Bindings come from the game's own HUD: MOVE A/D, JUMP W/Space, ATTACK J,
// DASH K. Arrow keys are not bound.
const KEYS = {
  a: { code: 'KeyA', key: 'a', vk: 65 },
  d: { code: 'KeyD', key: 'd', vk: 68 },
  w: { code: 'KeyW', key: 'w', vk: 87 },
  j: { code: 'KeyJ', key: 'j', vk: 74 },
  k: { code: 'KeyK', key: 'k', vk: 75 },
  space: { code: 'Space', key: ' ', vk: 32 },
  enter: { code: 'Enter', key: 'Enter', vk: 13 },
};

async function keyDown(cdp, n) {
  const k = KEYS[n];
  await cdp.send('Input.dispatchKeyEvent', {
    type: 'rawKeyDown', code: k.code, key: k.key,
    windowsVirtualKeyCode: k.vk, nativeVirtualKeyCode: k.vk,
  });
}
async function keyUp(cdp, n) {
  const k = KEYS[n];
  await cdp.send('Input.dispatchKeyEvent', {
    type: 'keyUp', code: k.code, key: k.key,
    windowsVirtualKeyCode: k.vk, nativeVirtualKeyCode: k.vk,
  });
}

async function main() {
  const browser = await chromium.connectOverCDP(CDP);
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find((p) => !p.url().startsWith('devtools://')) || ctx.pages()[0];

  const canvasReady = async () => page.evaluate(() => {
    const c = document.querySelector('canvas');
    return !!c && c.width > 100;
  }).catch(() => false);

  if (has('check')) {
    console.log((await canvasReady()) ? 'ready' : 'not-ready');
    await browser.close();
    return;
  }

  const cdp = await ctx.newCDPSession(page);
  const vp = await page.evaluate(() => ({ w: innerWidth, h: innerHeight }));
  const budgetMs = parseInt(arg('budget', '55'), 10) * 1000;
  const started = Date.now();
  const left = () => budgetMs - (Date.now() - started);

  const script = JSON.parse(readFileSync(arg('script'), 'utf8'));
  console.log(`driving ${vp.w}x${vp.h}, budget ${budgetMs / 1000}s`);

  for (const step of script.steps) {
    if (left() <= 1500) { console.log('  budget spent, stopping'); break; }
    switch (step.do) {
      case 'wait':
        await sleep(Math.min(step.ms, Math.max(0, left() - 1000)));
        break;
      case 'click':
        await page.mouse.click(Math.round(vp.w * step.x), Math.round(vp.h * step.y));
        break;
      case 'tap':
        await keyDown(cdp, step.key); await sleep(step.ms ?? 90); await keyUp(cdp, step.key);
        break;
      case 'run': {
        // Keep running until the budget runs out rather than a fixed count —
        // the recording length, not the script, decides how long play lasts.
        const dir = step.key ?? 'd';
        const jump = step.jump ?? 'space';
        await keyDown(cdp, dir);
        while (left() > 2500) {
          await sleep(step.every ?? 650);
          await keyDown(cdp, jump); await sleep(120); await keyUp(cdp, jump);
          if (step.attack) { await keyDown(cdp, 'j'); await sleep(80); await keyUp(cdp, 'j'); }
        }
        await keyUp(cdp, dir);
        break;
      }
      case 'mark':
      case 'shot':
        break;   // capture-side concepts; x11grab records continuously
      default:
        break;
    }
  }

  console.log(`driver done after ${((Date.now() - started) / 1000).toFixed(1)}s`);
  await browser.close();   // detaches from the browser, does not kill it
}

main().catch((e) => { console.error(String(e.message).slice(0, 200)); process.exit(1); });
