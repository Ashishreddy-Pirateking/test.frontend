import WarpGalleryLink from "./WarpGalleryLink";

export default function GalleryCTA() {
  const bulbs = Array.from({ length: 18 }, (_, index) => index);

  return (
    <section className="gallery-cta-container" id="galleryCta" aria-label="Gallery call to action">
      <div className="gallery-cta-spotlight" aria-hidden="true" />
      <div className="gallery-cta-marquee">
        <div className="gallery-cta-bulbs" aria-hidden="true">
          {bulbs.map((bulb) => (
            <span key={`bulb-${bulb}`} className="gallery-cta-bulb" />
          ))}
        </div>

        <p className="gallery-cta-kicker">Curtain Call Archive</p>
        <h3 className="gallery-cta-heading">Backstage Constellation</h3>
        <p className="gallery-cta-copy">
          Rehearsals, props, stage chaos, and everything that happens before the applause.
        </p>

        <WarpGalleryLink className="gold-cta-button gallery-cta-prop gallery-cta-galaxy-btn">
          <span className="gallery-cta-clapboard" aria-hidden="true" />
          <span className="gallery-cta-button-main">Gallery Galaxy</span>
          <span className="gallery-cta-button-sub">Launch into the archive</span>
          <span className="gallery-cta-comet gallery-cta-comet-a" aria-hidden="true" />
          <span className="gallery-cta-comet gallery-cta-comet-b" aria-hidden="true" />
        </WarpGalleryLink>
      </div>
    </section>
  );
}
