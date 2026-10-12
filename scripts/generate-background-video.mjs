#!/usr/bin/env node
/**
 * Generate the Smoke Realm cinematic background loop.
 *
 * Seedance 2 (ByteDance) image-to-video via the MuAPI aggregator, using the
 * first-and-last-frame model with the SAME reference image supplied for both
 * frames. That end-frame conditioning is what makes the loop seamless: the
 * model is constrained to return to its starting state, so the clip can cut
 * back to 0:00 without a visible jump.
 *
 * Credentials are read from the MUAPI_API_KEY environment variable. Never
 * hardcode or log the key.
 *
 * Usage:
 *   MUAPI_API_KEY=... node scripts/generate-background-video.mjs [--fast] [--duration 10]
 *
 * Cost (dynamic, confirm with --estimate first):
 *   seedance-2-first-last-frame        ~$2.50 for 10s  (default, "Pro")
 *   seedance-2-first-last-frame-fast   ~$1.50 for 10s  (--fast)
 */

import { writeFile } from "node:fs/promises";

const API_BASE = "https://api.muapi.ai/api/v1";

/**
 * The founder-supplied "Lil Blunt Prospecting Co." canvas.
 *
 * Served from GitHub raw, NOT from smokegame.win. This matters: the upstream
 * generator fetches reference frames by URL and evidently applies a short
 * timeout. The ICP-hosted copy answers in ~5.9s, which was slow enough that
 * the frames were silently dropped and the model fell back to pure
 * text-to-video — producing an invented night-time saloon town instead of
 * this scene, with hallucinated signage. GitHub raw answers in ~0.8s and the
 * frames are honored.
 *
 * If this URL is ever changed, re-verify the first frame against the
 * reference before trusting the output.
 */
const REFERENCE_IMAGE =
  "https://raw.githubusercontent.com/youngstunners88/lil-blunt-smoke-realm/claude/caffeine-ai-website-aks8ds/src/frontend/public/assets/generated/lil-blunt-prospecting-co-background.png";

const OUTPUT_PATH = "src/frontend/public/assets/video/smoke-realm-background.mp4";

/**
 * Motion direction. Written as environmental description rather than camera
 * direction: Seedance will invent camera moves if the prompt implies them,
 * and this is a background that must sit still underneath site UI.
 */
const PROMPT = [
  "Locked-off static camera. No camera movement whatsoever — no zoom, no pan, no dolly, no parallax, no push-in.",
  "The composition, architecture, and framing stay exactly as in the reference image.",
  "Only the environment is alive, with restrained cinematic motion:",
  "chimney and locomotive smoke curls gently upward with natural turbulence;",
  "thin atmospheric haze drifts slowly across the dusty main street;",
  "cannabis leaves and frontier grass sway lightly in a soft breeze;",
  "lantern flames flicker warmly and window lights pulse faintly;",
  "fine dust motes float through the shafts of golden sunset light;",
  "an occasional restrained specular glint travels across the gold nuggets;",
  "small crystalline sparkles catch on the green gemstones.",
  "The scene begins and ends in the same calm equilibrium so it loops seamlessly.",
  "Photorealistic, warm golden-hour light, cinematic depth, premium quality.",
  "No people, no animals, no vehicles moving, no new objects appearing.",
  "No text, no signage changes, no logos, no watermarks, no UI overlays.",
  "Buildings, signs, and terrain must remain structurally identical throughout — no morphing or hallucinated architecture.",
].join(" ");

function parseArgs(argv) {
  return {
    fast: argv.includes("--fast"),
    estimateOnly: argv.includes("--estimate"),
    duration: Number(
      argv[argv.indexOf("--duration") + 1] > 0
        ? argv[argv.indexOf("--duration") + 1]
        : 10,
    ),
  };
}

async function callApi(path, { method = "GET", body, apiKey } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "x-api-key": apiKey,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${method} ${path} -> ${response.status}: ${text.slice(0, 300)}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${method} ${path} returned non-JSON: ${text.slice(0, 200)}`);
  }
}

async function main() {
  const apiKey = process.env.MUAPI_API_KEY;
  if (!apiKey) {
    console.error("MUAPI_API_KEY is not set. Export it and rerun.");
    process.exit(1);
  }

  const { fast, estimateOnly, duration } = parseArgs(process.argv.slice(2));
  const model = fast
    ? "seedance-2-first-last-frame-fast"
    : "seedance-2-first-last-frame";

  // Same image for both frames — this is the loop mechanism.
  const payload = {
    prompt: PROMPT,
    images_list: [REFERENCE_IMAGE, REFERENCE_IMAGE],
    aspect_ratio: "adaptive",
    duration,
  };

  const estimate = await callApi(`/models/${model}/estimate-cost`, {
    method: "POST",
    body: payload,
    apiKey,
  });
  console.log(`Model: ${model}`);
  console.log(`Duration: ${duration}s`);
  console.log(`Estimated cost: $${estimate.cost} ${estimate.currency}`);
  if (estimateOnly) return;

  console.log("Submitting generation request…");
  const created = await callApi(`/${model}`, {
    method: "POST",
    body: payload,
    apiKey,
  });

  const requestId = created.request_id ?? created.id ?? created.requestId;
  if (!requestId) {
    throw new Error(`No request id in response: ${JSON.stringify(created).slice(0, 300)}`);
  }
  console.log(`Request id: ${requestId}`);

  // Poll. Video generation routinely takes several minutes.
  const deadline = Date.now() + 20 * 60 * 1000;
  let videoUrl = null;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 15_000));
    const status = await callApi(`/predictions/${requestId}/result`, { apiKey });
    const state = status.status ?? status.state;
    process.stdout.write(`  status: ${state}\n`);
    if (state === "completed" || state === "succeeded") {
      videoUrl = status.outputs?.[0] ?? status.output?.video_url ?? status.video_url;
      break;
    }
    if (state === "failed" || state === "error") {
      throw new Error(`Generation failed: ${JSON.stringify(status).slice(0, 400)}`);
    }
  }

  if (!videoUrl) throw new Error("Timed out waiting for the video.");
  console.log(`Video ready: ${videoUrl}`);

  const video = await fetch(videoUrl);
  if (!video.ok) throw new Error(`Download failed: ${video.status}`);
  const bytes = Buffer.from(await video.arrayBuffer());
  await writeFile(OUTPUT_PATH, bytes);
  console.log(`Wrote ${OUTPUT_PATH} (${(bytes.length / 1024 / 1024).toFixed(2)} MB)`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
