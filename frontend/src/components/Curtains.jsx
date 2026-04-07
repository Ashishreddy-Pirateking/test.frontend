import { useEffect } from "react";
import { useIsMobile } from "../utils/media";

export default function Curtains({ isOpen, onOpen }) {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isOpen) {
      document.body.classList.remove("no-scroll");
    } else {
      document.body.classList.add("no-scroll");
    }
  }, [isOpen]);

  const handleKey = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen();
    }
  };

  /*
    On mobile:
    - Snap the curtains open quickly (0.15s) — the theatrical
      slow-open is hard to appreciate on a small screen and
      feels sluggish on lower-end devices.
    - Disable any looping CSS animations (e.g. shimmer / fabric
      ripple) that may be defined in App.css for the curtain panels.
    - isolation: isolate prevents z-index conflicts with the
      navbar drawer which sits at z-index: 999.
  */
  const mobileCurtainStyle = isMobile
    ? {
      animationDuration: "0.01s",
      animationIterationCount: "1",
    }
    : {};

  return (
    <div
      id="curtainWrapper"
      className="fixed inset-0 z-50 flex"
      style={isMobile ? { isolation: "isolate" } : {}}
    >
      {/* ── Left curtain ── */}
      <div
        id="leftCurtain"
        className={`curtain curtain-left w-1/2 h-full relative flex items-center justify-end border-r-4 border-[#2a0505]${isOpen ? " open" : ""
          }`}
        style={mobileCurtainStyle}
      >
        <div className="pr-2 md:pr-4 pointer-events-none z-20 opacity-100 translate-y-[-10%]">
          <h2 className="text-4xl md:text-7xl font-bold text-[#FFD700] tracking-widest text-right leading-tight uppercase">
            THE <br /> STAGE
          </h2>
          <p className="text-[#e2c4a4] font-cinzel font-bold tracking-[0.2em] text-[10px] md:text-xs mt-4 text-right opacity-80 border-t border-[#e2c4a4]/30 pt-2">
            {/* "TAP TO" on touch devices, "CLICK TO" on desktop */}
            {isMobile ? "TAP TO" : "CLICK TO"}
          </p>
        </div>
        <div
          id="leftPull"
          className="absolute inset-0 z-30 cursor-pointer"
          role="button"
          aria-label="Open curtains"
          tabIndex={0}
          onClick={onOpen}
          onKeyDown={handleKey}
        />
      </div>

      {/* ── Right curtain ── */}
      <div
        id="rightCurtain"
        className={`curtain curtain-right w-1/2 h-full relative flex items-center justify-start border-l-4 border-[#2a0505]${isOpen ? " open" : ""
          }`}
        style={mobileCurtainStyle}
      >
        <div className="pl-2 md:pl-4 pointer-events-none z-20 opacity-100 translate-y-[-10%]">
          <h2 className="text-4xl md:text-7xl font-bold text-[#FFD700] tracking-widest text-left leading-tight uppercase">
            IS <br /> YOURS
          </h2>
          <p className="text-[#e2c4a4] font-cinzel font-bold tracking-[0.2em] text-[10px] md:text-xs mt-4 text-left opacity-80 border-t border-[#e2c4a4]/30 pt-2">
            ENTER
          </p>
        </div>
        <div
          id="rightPull"
          className="absolute inset-0 z-30 cursor-pointer"
          role="button"
          aria-label="Open curtains"
          tabIndex={0}
          onClick={onOpen}
          onKeyDown={handleKey}
        />
      </div>
    </div>
  );
}

