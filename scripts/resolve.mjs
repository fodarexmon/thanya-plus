// Resolves every lesson to real embeddable YouTube videos (no external search links).
// Usage: node scripts/resolve.mjs   -> writes src/data/resolved.json
import fs from "node:fs";
import D from "../src/data/curriculum.js";

const H = {
  "accept-language": "ar,en;q=0.8",
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
  cookie: "CONSENT=YES+cb; SOCS=CAESEwgDEgk0ODE3Nzk3MjQaAmVuIAEaBgiA_LyaBg",
};
async function search(q) {
  for (let i = 0; i < 3; i++) {
    try {
      const h = await (await fetch("https://www.youtube.com/results?search_query=" + encodeURIComponent(q) + "&hl=ar&gl=EG", { headers: H })).text();
      const m = h.match(/var ytInitialData = (\{.*?\});<\/script>/s);
      if (!m) return [];
      const out = [];
      (function walk(o) {
        if (!o || typeof o !== "object") return;
        const v = o.videoRenderer;
        if (v && v.videoId) {
          out.push({
            id: v.videoId,
            title: (v.title?.runs || []).map((x) => x.text).join(""),
            channel: (v.ownerText?.runs || []).map((x) => x.text).join(""),
            age: v.publishedTimeText?.simpleText || "",
            live: !v.lengthText,
          });
          return;
        }
        for (const k in o) walk(o[k]);
      })(JSON.parse(m[1]));
      return out;
    } catch {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  return [];
}

// months since publish, from Arabic relative text
function months(age) {
  const n = Number((age.match(/\d+/) || [1])[0]);
  if (/دقيق|ساع|يوم|أيام/.test(age)) return 0;
  if (/أسبوع|أسابيع/.test(age)) return /أسبوعين/.test(age) ? 0.5 : n / 4;
  if (/شهرين/.test(age)) return 2;
  if (/شهر|أشهر/.test(age)) return n;
  if (/سنتين/.test(age)) return 24;
  if (/سنة|سنوات|عام/.test(age)) return /سنة واحدة/.test(age) ? 12 : n * 12;
  return 99;
}
const yearOf = (v) => {
  const m = months(v.age);
  if (m <= 2 || /2027/.test(v.title)) return "2026/2027";
  if (m <= 14) return "2025/2026";
  return null;
};

const norm = (s) =>
  s.replace(/[إأآا]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/[ًٌٍَُِّْـ]/g, "").toLowerCase();
const GRADE = /(تاني|ثاني|تانيه|ثانيه|2\s*اعدادي|الصف الثاني)/;
const PREP = /(اعدادي|اعدادى)/;
const EN_GRADE = /(2nd|second|grade 8|prep\s*2)/i;
const BAD = /(اولي|الاول الاعدادي|اولى اعدادي|تالت|ثالث|ثانوي|ابتدائي|رابعه|خامسه|سادسه|الترم الثاني|الترم التاني|ترم تاني|ترم ثاني|second term|term 2)/i;
const STOP = new Set(["في", "من", "علي", "الي", "مع", "عن", "the", "and", "for", "درس", "الدرس", "شرح", "الوحده", "مراجعه"]);
const words = (t) => norm(t).split(/[^\p{L}\p{N}]+/u).filter((w) => w.length >= 3 && !STOP.has(w));

function relevant(v, lesson) {
  const t = norm(v.title);
  if (v.live || BAD.test(t)) return false;
  if (!((GRADE.test(t) && PREP.test(t)) || EN_GRADE.test(v.title))) return false;
  const lw = words(lesson.title);
  const hit = lw.filter((w) => t.includes(w)).length;
  return lw.length ? hit >= Math.min(2, lw.length) : true;
}

const PASS2 = process.argv.includes("--fill");
const ACTIVITY = new Set(["art"]);
const resolvedUrl = new URL("../src/data/resolved.json", import.meta.url);
const out = PASS2 ? JSON.parse(fs.readFileSync(resolvedUrl, "utf8")) : {};
for (const [sid, s] of Object.entries(D)) {
  for (const u of s.units) for (const l of u.lessons) {
    if (PASS2 && (out[sid + ":" + l.id] || (l.videos || []).length)) continue;
    const have = new Set((l.videos || []).map((v) => v.videoId));
    const teachers = new Set((l.videos || []).map((v) => v.teacher));
    const need = 5 - have.size;
    if (need <= 0) continue;
    const queries = PASS2
      ? ACTIVITY.has(sid)
        ? [`${l.title} ${s.name} الصف الثاني الاعدادي`, `${l.title} ${s.name}`, `شرح ${l.title}`]
        : [`${l.title} ${u.title} ${s.name} تانية اعدادي 2027`, `${u.title} ${s.name} تانية اعدادي ترم اول 2027`, `${l.title} ${s.name} 2nd prep`]
      : [
      `${l.title} ${s.name} تانية اعدادي ترم اول 2027`,
      `${l.title} ${s.name} الصف الثاني الاعدادي الترم الاول`,
    ];
    const picks = [];
    for (const q of queries) {
      if (picks.length >= need) break;
      for (const v of await search(q)) {
        if (picks.length >= need) break;
        if (have.has(v.id) || teachers.has(v.channel) || picks.some((p) => p.videoId === v.id || p.teacher === v.channel)) continue;
        let year = yearOf(v);
        let tag = "مطابقة بعنوان الدرس";
        if (PASS2 && ACTIVITY.has(sid)) {
          if (months(v.age) > 48 || v.live || /ثانوي|ابتدائي|اولي اعدادي|تالته اعدادي/.test(norm(v.title))) continue;
          if (words(l.title).filter((w) => norm(v.title).includes(w)).length < Math.min(2, words(l.title).length)) continue;
          year = year || "مورد عام";
          tag = "مورد نشاط";
        } else if (PASS2) {
          if (!year || v.live || BAD.test(norm(v.title))) continue;
          const t = norm(v.title);
          if (!((GRADE.test(t) && PREP.test(t)) || EN_GRADE.test(v.title))) continue;
          if (![...words(l.title), ...words(u.title)].some((w) => t.includes(w))) continue;
          tag = "شرح الوحدة";
        } else if (!year || !relevant(v, l)) continue;
        const un = (u.title.match(/unit\s*(\d+)/i) || [])[1];
        const vn = (v.title.match(/unit\s*(\d+)/i) || [])[1];
        if (un && vn && un !== vn) continue;
        picks.push({ teacher: v.channel, videoId: v.id, year, verified: tag, videoTitle: v.title });
      }
    }
    if (picks.length) out[sid + ":" + l.id] = picks;
    console.log(sid, l.id, l.title, "->", picks.length);
  }
}
fs.writeFileSync(resolvedUrl, JSON.stringify(out, null, 1));


