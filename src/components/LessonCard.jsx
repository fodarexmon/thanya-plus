import { badge, getOptions, thumb } from "../lib.js";

export default function LessonCard({ lesson: l, subject, sid, watched, faved, onOpen, onFav, onWatch }) {
  const { videos: d, pending } = getOptions(l, subject, sid);
  const [bText, bKind] = badge(l, sid);
  const first = d[0];
  return (
    <article className={"lesson" + (watched ? " watched" : "")}>
      <div className="thumb" onClick={onOpen}>
        {first ? (
          <>
            <img loading="lazy" src={thumb(first.videoId)} alt={"صورة مصغرة " + l.title} />
            <button className="play" aria-label="اختيار المعلم">▶</button>
          </>
        ) : (
          <div className="placeholder"><div><span>{subject.icon}</span>الشرح قيد الإضافة</div></div>
        )}
        <span className="watched-badge">✓ تمت المشاهدة</span>
        <span className={"badge " + bKind}>{bText}</span>
        <span className="option-count">{d.length} شرح</span>
      </div>
      <div className="lesson-body">
        <div className="meta">
          <span className="meta-dot">🎓</span>
          <span>{d.length ? `${d.length} فيديو يعمل داخل المنصة` : "لم يُنشر شرح بعد"}</span>
        </div>
        <h5>{l.title}</h5>
        {l.note && <div className="lesson-note">{l.note}</div>}
        {pending.length > 0 && <div className="lesson-note pending-note">⏳ قريبًا: {pending.map((p) => p.teacher).join(" • ")}</div>}
        <div className="actions">
          <button className="choose" onClick={onOpen}>اختر المعلم</button>
          <button className={"mini" + (faved ? " on" : "")} onClick={onFav} aria-label="مفضلة">♥</button>
          <button className="mini" onClick={onWatch} aria-label="تمت المشاهدة">✓</button>
        </div>
      </div>
    </article>
  );
}
