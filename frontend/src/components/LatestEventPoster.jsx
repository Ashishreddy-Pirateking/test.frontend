import { useSiteContent } from "../context/SiteContentContext";
import { resolveMediaUrl } from "../utils/media";

export default function LatestEventPoster() {
  const { siteContent, loading } = useSiteContent();

  if (!siteContent && loading) {
    return (
      <section id="latest-event" className="latest-event-section">
        <div className="latest-event-shell">
          <div className="latest-event-details-card">
            <p className="latest-event-overline">Now On Stage</p>
            <h2 className="latest-event-title">Loading latest production...</h2>
          </div>
        </div>
      </section>
    );
  }

  const latestEvent = siteContent?.latestEvent || {};
  const title = String(latestEvent.title || "");
  const posterSrc = resolveMediaUrl(latestEvent.poster || "");
  const date = String(latestEvent.date || "");
  const time = String(latestEvent.time || "");
  const venue = String(latestEvent.venue || "");
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
