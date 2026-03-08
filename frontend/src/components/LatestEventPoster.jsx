import { useSiteContent } from "../context/SiteContentContext";
import { resolveMediaUrl } from "../utils/media";

export default function LatestEventPoster() {
  const { siteContent } = useSiteContent();
  const latestEvent = siteContent?.latestEvent || {};
  const title = String(latestEvent.title || "Latest Production");
  const posterSrc = resolveMediaUrl(latestEvent.poster || "logo");
  const date = String(latestEvent.date || "TBA");
  const time = String(latestEvent.time || "TBA");
  const venue = String(latestEvent.venue || "Venue TBA");
  const description = String(latestEvent.description || "");

  return (
    <section id="latest-event" className="latest-event-section">
      <div className="latest-event-shell">
        <div className="latest-event-poster-card">
          <p className="latest-event-caption">Latest Production</p>
          <div className="latest-event-poster-frame">
            {posterSrc ? (
              <img src={posterSrc} alt={`${title} poster`} className="latest-event-poster-image" />
            ) : (
              <div className="latest-event-poster-placeholder">Poster Coming Soon</div>
            )}
          </div>
        </div>

        <div className="latest-event-details-card">
          <p className="latest-event-overline">Now On Stage</p>
          <h2 className="latest-event-title">{title}</h2>
          {description ? <p className="latest-event-description">{description}</p> : null}

          <div className="latest-event-meta-grid">
            <article className="latest-event-meta-item">
              <span className="latest-event-meta-label">Date</span>
              <span className="latest-event-meta-value">{date}</span>
            </article>
            <article className="latest-event-meta-item">
              <span className="latest-event-meta-label">Time</span>
              <span className="latest-event-meta-value">{time}</span>
            </article>
            <article className="latest-event-meta-item">
              <span className="latest-event-meta-label">Venue</span>
              <span className="latest-event-meta-value">{venue}</span>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
