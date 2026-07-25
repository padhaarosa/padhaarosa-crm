import { readFileSync } from "fs";
const buf = readFileSync("tests/shots/fit.pdf");
const s = buf.toString("latin1");
const m = s.match(/MediaBox ?\[ ?([0-9.]+) ?([0-9.]+) ?([0-9.]+) ?([0-9.]+)/);
if (m) {
  const w = parseFloat(m[3]);
  const h = parseFloat(m[4]);
  console.log(`page size: ${w.toFixed(0)} x ${h.toFixed(0)} pt (${((w / 72) * 25.4).toFixed(0)}mm x ${((h / 72) * 25.4).toFixed(0)}mm)`);
  console.log(`A4 would be 595 x 842 pt — content-fit height ${h < 842 ? "SHORTER ✅ (no empty space)" : h.toFixed(0) + "pt (long doc, single page)"}`);
} else console.log("MediaBox not found");
