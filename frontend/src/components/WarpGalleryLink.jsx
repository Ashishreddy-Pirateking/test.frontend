import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function WarpGalleryLink({ className = "", children }) {
  const [showWarp, setShowWarp] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const hasNavigatedRef = useRef(false);
  const fallbackTimerRef = useRef(null);
  const videoRef = useRef(null);
  const galleryHref = useMemo(() => {
    const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash || ""}`;
    return `/gallery?returnTo=${encodeURIComponent(returnTo)}`;
  }, []);

  const navigateToGallery = () => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;
    window.location.href = galleryHref;
  };

  const handleClick = (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    setShowWarp(true);
  };

  useEffect(() => {
    if (!showWarp) return;

    document.body.classList.add("no-scroll");
    setTimeout(() => setOverlayVisible(true), 10);

    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.volume = 1;
      videoRef.current.play().catch(() => {});
    }

    // Safety fallback: only used if media events fail. Main path waits for full video end.
    fallbackTimerRef.current = setTimeout(navigateToGallery, 30000);

    return () => {
      document.body.classList.remove("no-scroll");
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    };
  }, [showWarp]);

  return (
    <>
      <a href={galleryHref} className={className} onClick={handleClick}>
        {children}
      </a>

      {showWarp &&
        createPortal(
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 2147483000,
              background: "#000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              opacity: overlayVisible ? 1 : 0,
              transition: "opacity 420ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              onEnded={navigateToGallery}
              onError={navigateToGallery}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: overlayVisible ? "scale(1)" : "scale(1.02)",
                filter: overlayVisible ? "brightness(1)" : "brightness(0.85)",
                transition:
                  "transform 420ms cubic-bezier(0.4, 0, 0.2, 1), filter 420ms cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <source src="/warp-speed.mp4" type="video/mp4" />
            </video>
          </div>,
          document.body
        )}
    </>
  );
}
