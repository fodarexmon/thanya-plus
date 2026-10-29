import { useEffect, useState } from "react";
import D from "./data/curriculum.js";
import RESOLVED from "./data/resolved.json";

export const DATA = D;

export const thumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

export const canEmbedYouTube = () => location.protocol === "http:" || location.protocol === "https:";

export function youtubeEmbedUrl(id) {
  const u = new URL(`https://www.youtube.com/embed/${encodeURIComponent(id)}`);
  u.searchParams.set("autoplay", "1");
  u.searchParams.set("rel", "0");
  u.searchParams.set("playsinline", "1");
  if (canEmbedYouTube()) u.searchParams.set("origin", location.origin);
  return u.toString();
}

const norm = (t) => t.replace(/[إأآا]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه");

// All options are embeddable videos; external search links are no longer used.
export function getOptions(lesson, subject, sid) {
  const seen = new Set();
  const out = [];
  for (const v of [...(lesson.videos || []), ...(RESOLVED[sid + ":" + lesson.id] || [])]) {
    if (!v.videoId || seen.has(v.videoId) || out.length >= 5) continue;
    seen.add(v.videoId);
    out.push({ ...v, kind: "video" });
  }
  const pending = (subject.pinned || [])
    .filter((p) => !out.some((o) => norm(o.teacher).includes(norm(p.replace(/^(مس|مستر)\s+/, "")))))
    .map((p) => ({ teacher: p, kind: "pending" }));
  return { videos: out, pending };
}

export const directs = (l) => (l.videos || []).filter((v) => v.videoId);
export const allVideos = (l, sid) => getOptions(l, {}, sid).videos;
export const isCurrent = (l, sid) => allVideos(l, sid).some((v) => v.year === "2026/2027");

export function badge(l, sid) {
  const v = allVideos(l, sid);
  if (v.some((x) => x.year === "2026/2027")) return ["2026/2027", "current"];
  if (v.length) return ["2025/2026", "previous"];
  return ["قريبًا", "searchonly"];
}

export function useLocalStorage(key, initial) {
  const [v, setV] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? initial : JSON.parse(raw);
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(v));
  }, [key, v]);
  return [v, setV];
}
