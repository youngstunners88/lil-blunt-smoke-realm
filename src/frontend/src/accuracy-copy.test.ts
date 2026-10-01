import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return sources(p);
    return /\.(tsx?)$/.test(name) && !/\.test\./.test(name) ? [p] : [];
  });
}

// Present-tense claims AGENTS.md blocks until the feature ships (Public Claims Accuracy).
const BLOCKED = [
  "on-chain saves",
  "nft collectibles",
  "play-to-earn",
  "own your progress",
  "connect your wallet",
  "trade rare items",
  "collect on-chain",
];

describe("blocked public claims (AGENTS.md)", () => {
  const files = sources(__dirname).filter(
    (f) => !f.includes("declarations") && !f.endsWith("backend.ts"),
  );

  it.each(BLOCKED)("no source file contains %j", (phrase) => {
    const hits = files.filter((f) =>
      readFileSync(f, "utf8").toLowerCase().includes(phrase),
    );
    expect(hits).toEqual([]);
  });

  it("the on-chain points figures are labelled as demo data", () => {
    const src = readFileSync(
      join(__dirname, "components/sections/OnChainPoints.tsx"),
      "utf8",
    );
    expect(src).toContain("<DemoBadge");
  });
});
