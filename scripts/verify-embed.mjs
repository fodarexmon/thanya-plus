// Drops videos that cannot be embedded (oEmbed returns 401/404 for those).
// Usage: node scripts/verify-embed.mjs
import fs from "node:fs";
import D from "../src/data/curriculum.js";

const resolvedPath = new URL("../src/data/resolved.json", import.meta.url);
const R = JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
const cache = new Map();
async function ok(id) {
  if (cache.has(id)) return cache.get(id);
  let res = false;
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch("https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=" + id);
      res = r.status === 200;
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  cache.set(id, res);
  return res;
}

let dropped = 0;
for (const s of Object.values(D))
  for (const l of s.units.flatMap((u) => u.lessons)) {
    const keep = [];
    for (const v of l.videos || []) (await ok(v.videoId)) ? keep.push(v) : (dropped++, console.log("drop", l.id, v.teacher, v.videoId));
    l.videos = keep;
  }
for (const k of Object.keys(R)) {
  const keep = [];
  for (const v of R[k]) (await ok(v.videoId)) ? keep.push(v) : (dropped++, console.log("drop", k, v.teacher, v.videoId));
  keep.length ? (R[k] = keep) : delete R[k];
}
fs.writeFileSync(new URL("../src/data/curriculum.js", import.meta.url), "export default " + JSON.stringify(D) + ";\n");
fs.writeFileSync(resolvedPath, JSON.stringify(R, null, 1));
console.log("checked", cache.size, "dropped", dropped);
