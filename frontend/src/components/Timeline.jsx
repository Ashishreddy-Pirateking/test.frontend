import { useEffect, useMemo, useRef, useState } from "react";
import { TIMELINE } from "../data/legacyData";
import { useSiteContent } from "../context/SiteContentContext";

const DESKTOP_PIN_BREAKPOINT = 1024;
const PIN_EXTRA_SCROLL = 260;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export default function Timeline() {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(null);
  const [pinMetrics, setPinMetrics] = useState({
    enabled: false,
    maxTranslate: 0,
    sectionHeight: 0,
  });
  const [pinnedTranslate, setPinnedTranslate] = useState(0);
  const { siteContent } = useSiteContent();
  const timelineItems = siteContent?.timeline?.length ? siteContent.timeline : TIMELINE;

  const frames = useMemo(() => {
    return timelineItems.map((item, i) => {
      const frequency = 0.6;
      const amplitude = 80;
      const yOffset = Math.sin(i * frequency) * amplitude;
      const rotation = Math.cos(i * frequency) * 15;
      return {
        ...item,
        style: { transform: `translateY(${yOffset}px) rotate(${rotation}deg)` },
        id: String(i + 1).padStart(3, "0"),
      };
    });
  }, [timelineItems]);

  useEffect(() => {
    const computeMetrics = () => {
      const section = sectionRef.current;
      const container = containerRef.current;
      const track = trackRef.current;
      if (!section || !container || !track) return;

      const prefersReducedMotion =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const isDesktop = window.innerWidth >= DESKTOP_PIN_BREAKPOINT;
      const maxTranslate = Math.max(0, track.scrollWidth - container.clientWidth);

      if (!isDesktop || prefersReducedMotion || maxTranslate < 24) {
        setPinMetrics((prev) =>
          prev.enabled || prev.maxTranslate || prev.sectionHeight
            ? { enabled: false, maxTranslate: 0, sectionHeight: 0 }
            : prev
        );
        setPinnedTranslate(0);
        return;
      }

      const sectionHeight = Math.ceil(window.innerHeight + maxTranslate + PIN_EXTRA_SCROLL);
      setPinMetrics((prev) => {
        if (
          prev.enabled &&
          Math.abs(prev.maxTranslate - maxTranslate) < 1 &&
          Math.abs(prev.sectionHeight - sectionHeight) < 1
        ) {
          return prev;
        }
        return { enabled: true, maxTranslate, sectionHeight };
      });
    };

    computeMetrics();
    window.addEventListener("resize", computeMetrics);

    let observer;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(computeMetrics);
      if (containerRef.current) observer.observe(containerRef.current);
      if (trackRef.current) observer.observe(trackRef.current);
    }

    return () => {
      window.removeEventListener("resize", computeMetrics);
      if (observer) observer.disconnect();
    };
  }, [frames.length]);

  const handleScrollBy = (direction) => {
    const container = containerRef.current;
    if (!container) return;
    const frameWidth =
      Number.parseInt(
        getComputedStyle(document.documentElement).getPropertyValue("--frame-width")
      ) || 260;
    const gap = 60;
    const itemFullWidth = frameWidth + gap;

    if (pinMetrics.enabled) {
      const section = sectionRef.current;
      if (!section) return;
      const totalScrollable = Math.max(1, pinMetrics.sectionHeight - window.innerHeight);
      const nextTranslate = clamp(
        pinnedTranslate + direction * itemFullWidth,
        0,
        pinMetrics.maxTranslate
      );
      const progress = pinMetrics.maxTranslate > 0 ? nextTranslate / pinMetrics.maxTranslate : 0;
      const sectionTop = window.scrollY + section.getBoundingClientRect().top;
      window.scrollTo({
        top: sectionTop + progress * totalScrollable,
        behavior: "smooth",
      });
      return;
    }

    container.scrollBy({ left: direction * itemFullWidth, behavior: "smooth" });
  };

  const handleMouseDown = (event) => {
    if (pinMetrics.enabled) return;
    const container = containerRef.current;
    if (!container) return;
    isDownRef.current = true;
    container.classList.add("active");
    startXRef.current = event.pageX - container.offsetLeft;
    scrollLeftRef.current = container.scrollLeft;
  };

  const handleMouseLeave = () => {
    if (pinMetrics.enabled) return;
    const container = containerRef.current;
    if (!container) return;
    isDownRef.current = false;
    container.classList.remove("active");
  };

  const handleMouseUp = () => {
    if (pinMetrics.enabled) return;
    const container = containerRef.current;
    if (!container) return;
    isDownRef.current = false;
    container.classList.remove("active");
  };

  const handleMouseMove = (event) => {
    if (pinMetrics.enabled) return;
    const container = containerRef.current;
    if (!container || !isDownRef.current) return;
    event.preventDefault();
    const x = event.pageX - container.offsetLeft;
    const walk = (x - startXRef.current) * 2;
    container.scrollLeft = scrollLeftRef.current - walk;
  };

  useEffect(() => {
    if (!pinMetrics.enabled) {
      setPinnedTranslate(0);
      return;
    }

    let rafId = 0;
    const updatePinnedTranslate = () => {
      rafId = 0;
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const totalScrollable = Math.max(1, pinMetrics.sectionHeight - window.innerHeight);
      const progress = clamp(-rect.top / totalScrollable, 0, 1);
      const nextTranslate = progress * pinMetrics.maxTranslate;
      setPinnedTranslate((prev) => (Math.abs(prev - nextTranslate) < 0.5 ? prev : nextTranslate));
    };

    const onScrollOrResize = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(updatePinnedTranslate);
    };

    updatePinnedTranslate();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [pinMetrics.enabled, pinMetrics.maxTranslate, pinMetrics.sectionHeight]);

  useEffect(() => {
    if (pinMetrics.enabled) return;
    const handleWheel = (event) => {
      const section = sectionRef.current;
      const container = containerRef.current;
      if (!section || !container) return;

      if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;

      const rect = section.getBoundingClientRect();
      const viewportH = window.innerHeight || document.documentElement.clientHeight;
      const isSectionInFocus = rect.top <= viewportH * 0.25 && rect.bottom >= viewportH * 0.75;
      if (!isSectionInFocus) return;

      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      if (maxScrollLeft <= 0) return;

      const atStart = container.scrollLeft <= 1;
      const atEnd = container.scrollLeft >= maxScrollLeft - 1;
      const releaseThreshold = 220;
      const nearStart = container.scrollLeft <= releaseThreshold;
      const nearEnd = maxScrollLeft - container.scrollLeft <= releaseThreshold;
      const scrollingDown = event.deltaY > 0;
      const scrollingUp = event.deltaY < 0;

      const shouldConsumeScroll =
        (scrollingDown && !atEnd && !nearEnd) || (scrollingUp && !atStart && !nearStart);
      if (!shouldConsumeScroll) return;

      event.preventDefault();
      const nextLeft = Math.max(0, Math.min(maxScrollLeft, container.scrollLeft + event.deltaY * 1.15));
      container.scrollLeft = nextLeft;
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [pinMetrics.enabled]);

  const activeItem = activeIndex !== null ? frames[activeIndex] : null;
  const sectionStyle = pinMetrics.enabled
    ? { height: `${pinMetrics.sectionHeight}px` }
    : undefined;
  const trackStyle = pinMetrics.enabled
    ? { transform: `translate3d(${-pinnedTranslate}px, 0, 0)` }
    : undefined;

  return (
    <section
      id="about"
      ref={sectionRef}
      style={sectionStyle}
      className={`timeline-scroll-section pt-10 pb-16 px-6 max-w-6xl mx-auto ${
        pinMetrics.enabled ? "is-pinned-mode" : ""
      }`}
    >
      <div className="timeline-sticky-shell">
        <h2 className="text-4xl md:text-5xl font-cinzel text-center mb-4 text-[#FFD700]">
          The Script (About us)
        </h2>
        <div className="timeline-stage">
          <button className="nav-btn prev" id="prevBtn" aria-label="Previous" onClick={() => handleScrollBy(-1)}>
            &#10094;
          </button>
          <div
            className="reel-container"
            id="reelContainer"
            aria-label="Timeline reel"
            role="region"
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            <div className="film-strip-track" id="track" ref={trackRef} style={trackStyle}>
              {frames.map((item, index) => (
                <div
                  key={`${item.year}-${index}`}
                  className="frame-wrapper"
                  style={item.style}
                  onClick={() => setActiveIndex(index)}
                >
                  <div className="frame-inner">
                    <div className="frame-content">
                      <div className="year">{item.year}</div>
                      <div className="title">{item.title}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button className="nav-btn next" id="nextBtn" aria-label="Next" onClick={() => handleScrollBy(1)}>
            &#10095;
          </button>
        </div>
      </div>

      <div
        className={`projector-modal${activeItem ? " active" : ""}`}
        id="modal"
        aria-hidden={activeItem ? "false" : "true"}
        role="dialog"
        aria-modal="true"
        onClick={(event) => {
          if (event.target.id === "modal") setActiveIndex(null);
        }}
      >
        <div className="projector-beam"></div>
        <div className="scratch"></div>
        <div className="modal-content" role="document">
          <button className="close-btn" id="modalClose" aria-label="Close" onClick={() => setActiveIndex(null)}>
            &times;
          </button>
          <h2 className="modal-year" id="mYear">
            {activeItem?.year ?? ""}
          </h2>
          <h3 className="modal-title" id="mTitle">
            {activeItem?.title ?? ""}
          </h3>
          <p className="modal-desc" id="mDesc">
            {activeItem?.desc ?? ""}
          </p>
          <div style={{ fontSize: "0.8rem", color: "#5a4230", marginTop: 20 }}>
            REEL ID: <span id="mId">{activeItem?.id ?? ""}</span> // ARCHIVE DEPT.
          </div>
        </div>
      </div>
    </section>
  );
}
