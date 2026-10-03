import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "..");

function htmlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return htmlFiles(p);
    return name.endsWith(".html") ? [p] : [];
  });
}

describe("llms.txt stays invisible (founder rule)", () => {
  const pages = [join(root, "index.html"), ...htmlFiles(join(root, "public"))];

  it.each(pages)("%s does not link to or mention llms.txt", (file) => {
    expect(readFileSync(file, "utf8").toLowerCase()).not.toContain("llms");
  });

  it("the sitemap does not list llms.txt", () => {
    expect(
      readFileSync(join(root, "public", "sitemap.xml"), "utf8"),
    ).not.toContain("llms");
  });
});
