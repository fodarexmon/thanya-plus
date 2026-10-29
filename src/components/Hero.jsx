export default function Hero({ subject, subjects, lessons, direct, pct, onStart, onRandom }) {
  const stats = [
    [subjects, "مادة"],
    [lessons, "درس / مورد"],
    [direct, "دروس بفيديو مباشر"],
    [pct + "%", "تقدمك"],
  ];
  return (
    <section className="hero">
      <div className="hero-copy">
        <span className="eyebrow">● الصف الثاني الإعدادي • الترم الأول • 2026/2027</span>
        <h2>كل المواد، <em>ومعلمك أنت الذي تختاره.</em></h2>
        <p>{subject.description} اختر الدرس ثم المعلم قبل التشغيل؛ بحد أقصى 5 اختيارات.</p>
        <div className="hero-actions">
          <button className="primary" onClick={onStart}>ابدأ المذاكرة ←</button>
          <button className="ghost" onClick={onRandom}>🎲 درس عشوائي</button>
        </div>
        <div className="stats">
          {stats.map(([n, l], i) => (
            <div className={"stat s" + i} key={l}><strong>{n}</strong><small>{l}</small></div>
          ))}
        </div>
      </div>
      <div className="hero-art">
        <div className="hero-orb" key={subject.icon}>{subject.icon}</div>
        <span className="float f1">🎓 حتى 5 معلمين</span>
        <span className="float f2">🟢 2026/2027</span>
        <span className="float f3">🟣 2025/2026 مطابق</span>
      </div>
    </section>
  );
}
