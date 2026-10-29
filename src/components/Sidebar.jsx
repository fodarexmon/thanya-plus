import { DATA } from "../lib.js";

export default function Sidebar({ open, sid, filter, favCount, seenCount, onSubject, onSpecial }) {
  return (
    <aside id="sidebar" className={open ? "open" : ""}>
      <div className="brand">
        <div className="logo">✦</div>
        <div>
          <h1>ثانية<span>+</span> <b>V4</b></h1>
          <p>كل المواد • 2026/2027</p>
        </div>
      </div>
      <div className="side-label">المواد</div>
      <div className="subject-nav">
        {Object.entries(DATA).map(([id, s]) => {
          const n = s.units.reduce((a, u) => a + u.lessons.length, 0);
          return (
            <button
              key={id}
              className={"nav-btn" + (id === sid ? " active" : "")}
              style={{ "--c1": s.accent[0], "--c2": s.accent[1] }}
              onClick={() => onSubject(id)}
            >
              <i>{s.icon}</i>
              <span><strong>{s.name}</strong><small>{n} درس / مورد</small></span>
            </button>
          );
        })}
      </div>
      <div className="side-label">مكتبتي</div>
      <button className={"nav-btn" + (filter === "fav" ? " active" : "")} onClick={() => onSpecial("fav")}>
        <i>❤️</i><span><strong>المفضلة</strong><small>{favCount} درس</small></span>
      </button>
      <button className={"nav-btn" + (filter === "watched" ? " active" : "")} onClick={() => onSpecial("watched")}>
        <i>✅</i><span><strong>تمت مشاهدتها</strong><small>{seenCount} درس</small></span>
      </button>
      <div className="policy">
        <b>سياسة V4</b>
        <p>الأولوية لـ 2026/2027. يُسمح بـ 2025/2026 إذا كان الدرس مطابقًا، مع إظهار السنة. ولا نضع رابطًا مباشرًا غير متحقق منه.</p>
      </div>
    </aside>
  );
}
