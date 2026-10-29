import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { DATA, allVideos, getOptions, isCurrent, useLocalStorage } from "./lib.js";
import Sidebar from "./components/Sidebar.jsx";
import Hero from "./components/Hero.jsx";
import LessonCard from "./components/LessonCard.jsx";
import TeacherModal from "./components/TeacherModal.jsx";

const FILTERS = [
  ["all", "الكل"],
  ["direct", "فيديو مباشر"],
  ["current", "2026/2027"],
  ["fav", "المفضلة"],
  ["watched", "تمت المشاهدة"],
];

export default function App() {
  const [sidRaw, setSid] = useLocalStorage("tpv3_subject", "science");
  const sid = DATA[sidRaw] ? sidRaw : "science";
  const subject = DATA[sid];
  const [favArr, setFav] = useLocalStorage("tpv3_favs", []);
  const [seenArr, setSeen] = useLocalStorage("tpv3_seen", []);
  const [theme, setTheme] = useLocalStorage("tpv3_theme", "light");
  const fav = useMemo(() => new Set(favArr), [favArr]);
  const seen = useMemo(() => new Set(seenArr), [seenArr]);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [lessonNow, setLessonNow] = useState(null);
  const [toastMsg, setToastMsg] = useState("");
  const toastTimer = useRef();
  const curriculumRef = useRef();

  const toast = useCallback((m) => {
    setToastMsg(m);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(""), 2100);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty("--brand", subject.accent[0]);
    document.documentElement.style.setProperty("--brand2", subject.accent[1]);
  }, [subject]);

  const K = (id) => sid + ":" + id;
  const allLessons = useMemo(
    () => subject.units.flatMap((u) => u.lessons.map((l) => ({ ...l, unitTitle: u.title }))),
    [subject]
  );
  const totalSubjects = Object.keys(DATA).length;
  const directCount = allLessons.filter((l) => allVideos(l, sid).length).length;
  const seenCount = allLessons.filter((l) => seen.has(K(l.id))).length;
  const favCount = allLessons.filter((l) => fav.has(K(l.id))).length;
  const pct = allLessons.length ? Math.round((seenCount / allLessons.length) * 100) : 0;

  const units = useMemo(() => {
    const q = query.trim().toLowerCase();
    return subject.units
      .map((u) => ({
        ...u,
        lessons: u.lessons.filter((l) => {
          const hay = (l.title + " " + u.title + " " + getOptions(l, subject, sid).videos.map((x) => x.teacher + " " + (x.videoTitle || "")).join(" ")).toLowerCase();
          const f =
            filter === "all" ||
            (filter === "direct" && allVideos(l, sid).length) ||
            (filter === "current" && isCurrent(l, sid)) ||
            (filter === "fav" && fav.has(sid + ":" + l.id)) ||
            (filter === "watched" && seen.has(sid + ":" + l.id));
          return (!q || hay.includes(q)) && f;
        }),
      }))
      .filter((u) => u.lessons.length);
  }, [subject, sid, query, filter, fav, seen]);
  const shown = units.reduce((a, u) => a + u.lessons.length, 0);

  const toggle = (setter, set, id, onMsg) => {
    const k = K(id);
    const has = set.has(k);
    setter(has ? [...set].filter((x) => x !== k) : [...set, k]);
    toast(onMsg(!has));
  };
  const toggleFav = (id) => toggle(setFav, fav, id, (on) => (on ? "أضيف للمفضلة ❤️" : "أزيل من المفضلة"));
  const toggleSeen = (id) => toggle(setSeen, seen, id, (on) => (on ? "تم تسجيل الدرس ✅" : "تم التراجع"));

  const switchSubject = (id) => {
    setSid(id);
    setFilter("all");
    setQuery("");
    setMenuOpen(false);
  };
  const goFilter = (f, scroll) => {
    setFilter(f);
    setMenuOpen(false);
    if (scroll) curriculumRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const closeModal = useCallback(() => setLessonNow(null), []);
  const random = () => {
    if (allLessons.length) setLessonNow(allLessons[Math.floor(Math.random() * allLessons.length)]);
  };

  return (
    <>
      <div className="orb-bg one" />
      <div className="orb-bg two" />
      <div className="orb-bg three" />
      <div className="app">
        <Sidebar
          open={menuOpen}
          sid={sid}
          filter={filter}
          favCount={favCount}
          seenCount={seenCount}
          onSubject={switchSubject}
          onSpecial={(f) => goFilter(f, true)}
        />
        {menuOpen && <div className="scrim" onClick={() => setMenuOpen(false)} />}
        <main>
          <header className="topbar">
            <button className="icon-btn mobile-menu" onClick={() => setMenuOpen((o) => !o)} aria-label="قائمة المواد">☰</button>
            <div className="search">
              <span>⌕</span>
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث عن درس أو معلم..." autoComplete="off" />
            </div>
            <button className="icon-btn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="الوضع الليلي">
              {theme === "dark" ? "☀" : "◐"}
            </button>
          </header>
          <div className="content">
            <Hero
              subject={subject}
              subjects={totalSubjects}
              lessons={allLessons.length}
              direct={directCount}
              pct={pct}
              onStart={() => curriculumRef.current?.scrollIntoView({ behavior: "smooth" })}
              onRandom={random}
            />
            <section className="notice">
              <span>🧭</span>
              <div>
                <b>كل الشروح تعمل داخل المنصة.</b> لا توجد روابط تنقلك خارج الموقع — كل اختيار (حتى 5 لكل درس) فيديو مُضمَّن يعمل هنا مباشرة، مع إظهار سنة الشرح (2026/2027 أو 2025/2026 المطابق) وعنوان الفيديو قبل التشغيل.
              </div>
            </section>
            <section id="curriculum" ref={curriculumRef}>
              <div className="section-head">
                <div>
                  <h3>{subject.icon} {subject.name}</h3>
                  <p>الترم الأول • 2026/2027، مع بدائل 2025/2026 المطابقة</p>
                </div>
                <div className="tabs">
                  {FILTERS.map(([f, label]) => (
                    <button key={f} className={"tab" + (filter === f ? " active" : "")} onClick={() => setFilter(f)}>{label}</button>
                  ))}
                </div>
              </div>
              <div className="progress-row"><span>تقدمك في المادة</span><span>{seenCount} / {allLessons.length}</span></div>
              <div className="progress-track"><div className="progress-bar" style={{ width: pct + "%" }} /></div>
              {units.map((u, ui) => (
                <section className="unit" key={sid + u.title} style={{ "--hue": (ui * 47) % 360 }}>
                  <div className="unit-head">
                    <div className="unit-icon">{u.icon || subject.icon}</div>
                    <h4>{u.title}</h4>
                    <div className="unit-count">{u.lessons.length} درس</div>
                  </div>
                  <div className="lessons">
                    {u.lessons.map((l) => (
                      <LessonCard
                        key={l.id}
                        lesson={l}
                        subject={subject}
                        sid={sid}
                        watched={seen.has(K(l.id))}
                        faved={fav.has(K(l.id))}
                        onOpen={() => setLessonNow(l)}
                        onFav={() => toggleFav(l.id)}
                        onWatch={() => toggleSeen(l.id)}
                      />
                    ))}
                  </div>
                </section>
              ))}
              {!shown && <div className="empty">🔎 لا توجد نتائج مطابقة.</div>}
            </section>
            <section className="publish-note">
              <div>🚀</div>
              <div><b>React + Vite PWA</b><p>لا API keys ولا Backend. جاهزة للنشر على Vercel وNetlify وأي استضافة ملفات ثابتة.</p></div>
            </section>
            <footer>
              <span>ثانية+ V4 • منصة تجميع تعليمية مستقلة.</span>
            </footer>
          </div>
        </main>
      </div>
      {lessonNow && (
        <TeacherModal
          key={lessonNow.id}
          lesson={lessonNow}
          subject={subject}
          sid={sid}
          watched={seen.has(K(lessonNow.id))}
          onClose={closeModal}
          onToggleWatched={() => toggleSeen(lessonNow.id)}
          toast={toast}
        />
      )}
      <div className={"toast" + (toastMsg ? " show" : "")} role="status" aria-live="polite">{toastMsg}</div>
    </>
  );
}
