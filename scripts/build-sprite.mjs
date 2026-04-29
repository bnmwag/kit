import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const srcDir = join(root, "public/assets/images/sprite");
const outFile = join(root, "public/assets/images/sprite.svg");

const files = readdirSync(srcDir).filter((f) => f.endsWith(".svg"));

const symbols = files.map((file) => {
  const id = basename(file, ".svg");
  const raw = readFileSync(join(srcDir, file), "utf-8");

  const openMatch = raw.match(/<svg\b([^>]*)>/);
  if (!openMatch) return "";

  const attrs = openMatch[1];
  const viewBox = attrs.match(/viewBox\s*=\s*"([^"]+)"/i)?.[1] ?? "0 0 24 24";

  const inner = raw
    .replace(/<svg\b[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .replace(/<\?xml[^>]*\?>/g, "")
    .replace(/<!DOCTYPE[^>]*>/g, "")
    .trim();

  return `<symbol id="${id}" viewBox="${viewBox}">${inner}</symbol>`;
});

const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">${symbols.join("")}</svg>`;

writeFileSync(outFile, sprite, "utf-8");
console.log(`Wrote ${files.length} symbols to ${outFile}`);
