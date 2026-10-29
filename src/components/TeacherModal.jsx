import { useEffect, useMemo, useState } from "react";
import { canEmbedYouTube, getOptions, thumb, youtubeEmbedUrl } from "../lib.js";

export default function TeacherModal({ lesson, subject, sid, watched, onClose, onToggleWatched, toast }) {
  const { videos, pending } = useMemo(() => getOptions(lesson, subject, sid), [lesson, subject, sid]);
  const [playing, setPlaying] = useState(null);
  const [warn, setWarn] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const choose = (o) => {
    if (!canEmbedYouTube()) {
      setWarn(true);
      toast("YouTube يمنع التضمين من file:// — شغّل المنصة عبر localhost أو HTTPS.");
      return;
    }
    setPlaying(o);
  };

  const idx = playing ? videos.indexOf(playing) : -1;

  return (
    <div className="modal open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <div className="modal-head">
          <div><small>{playing ? "يعمل الآن داخل المنصة" : "اختر المعلم ثم شاهد هنا مباشرة"}</small><h4 id="modalTitle">{lesson.title}</h4></div>
          <button className="close" onClick={onClose} aria-label="إغلاق">✕</button>
        </div>
        {!playing ? (
          <div className="chooser">
            {warn && (
              <div className="chooser-tip warn">
                <div style={{ fontSize: 21 }}>⚠️</div>
                <div>
                  <b>التشغيل من file:// غير مدعوم من YouTube</b>
                  <p>شغّل المشروع عبر <code>npm run dev</code> أو انشره على Vercel/Netlify.</p>
                </div>
              </div>
            )}
            <div className="chooser-tip">
              <div style={{ fontSize: 21 }}>🎓</div>
              <div>
                <b>{videos.length ? `${videos.length} شرح متاح — كلها تعمل داخل المنصة` : "لم يُنشر شرح لهذا الدرس بعد"}</b>
                <p>
                  <span className="year-current">● 2026/2027</span> شرح هذا العام •{" "}
                  <span className="year-old">● 2025/2026</span> شرح العام السابق لنفس المحتوى.
                </p>
              </div>
            </div>
            <div className="teacher-grid">
              {videos.map((o) => (
                <button className="teacher-card" key={o.videoId} onClick={() => choose(o)}>
                  <div className="teacher-thumb">
                    <img loading="lazy" src={thumb(o.videoId)} alt={o.teacher} />
                    <span className="tplay">▶</span>
                  </div>
                  <div className="teacher-info">
                    <b>{o.teacher}</b>
                    <small className={o.year === "2026/2027" ? "year-current" : "year-old"}>● {o.year} • {o.verified || ""}</small>
                    {o.videoTitle && <em className="vtitle">{o.videoTitle}</em>}
                  </div>
                </button>
              ))}
              {pending.map((p) => (
                <div className="teacher-card pending" key={p.teacher}>
                  <div className="teacher-thumb"><div className="search-thumb">⏳</div></div>
                  <div className="teacher-info">
                    <b>{p.teacher}</b>
                    <small className="kind-search">● لم يُنشر شرح هذا الدرس بعد</small>
                    <em className="vtitle">سيُضاف فور نشره هذا العام</em>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="player-view open">
            <div className="video-wrap">
              <iframe
                key={playing.videoId}
                src={youtubeEmbedUrl(playing.videoId)}
                referrerPolicy="strict-origin-when-cross-origin"
                title={`${lesson.title} - ${playing.teacher}`}
                allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture;web-share"
                allowFullScreen
              />
            </div>
            <div className="player-info">
              <div className="who">
                <b>{playing.teacher}</b>
                <small>{playing.videoTitle || lesson.title} • {playing.year}</small>
              </div>
              <button className="ghost" onClick={() => setPlaying(null)}>← معلم آخر</button>
              {videos.length > 1 && (
                <button className="ghost" onClick={() => setPlaying(videos[(idx + 1) % videos.length])}>الشرح التالي ⟵</button>
              )}
              <button className="primary" onClick={onToggleWatched}>{watched ? "✓ مُشاهد — تراجع" : "✓ علّم كمُشاهد"}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
