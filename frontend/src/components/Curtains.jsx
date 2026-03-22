import { useEffect } from "react";

export default function Curtains({ isOpen, onOpen }) {
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

  return (
    <div
      id="curtainWrapper"
      className="fixed inset-0 z-50 flex overflow-hidden"
      aria-hidden={isOpen}
    >
      {/* Slightly wider than 50% each so panels overlap at the seam — feels “closer” / more closed */}
      <div
        id="leftCurtain"
        className={`curtain curtain-left relative flex h-full w-[54%] max-w-[54%] shrink-0 items-center justify-end border-r-4 border-[#2a0505] pr-1 sm:pr-4 ${
          isOpen ? "open" : ""
        }`}
      >
        <div className="pointer-events-none relative z-20 w-full max-w-[min(48vw,20rem)] translate-y-[-8%] pr-1 sm:pr-2">
          <h2 className="text-right uppercase">
            THE <br /> STAGE
          </h2>
          <p className="mt-3 border-t border-[#e2c4a4]/35 pt-3 text-right font-cinzel text-[clamp(9px,2.4vw,12px)] font-bold uppercase tracking-[0.22em] text-[#e2c4a4] opacity-90">
            CLICK TO
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

      <div
        id="rightCurtain"
        className={`curtain curtain-right relative flex h-full w-[54%] max-w-[54%] shrink-0 items-center justify-start border-l-4 border-[#2a0505] pl-1 sm:pl-4 ${
          isOpen ? "open" : ""
        }`}
      >
        <div className="pointer-events-none relative z-20 w-full max-w-[min(48vw,20rem)] translate-y-[-8%] pl-1 sm:pl-2">
          <h2 className="text-left uppercase">
            IS <br /> YOURS
          </h2>
          <p className="mt-3 border-t border-[#e2c4a4]/35 pt-3 text-left font-cinzel text-[clamp(9px,2.4vw,12px)] font-bold uppercase tracking-[0.22em] text-[#e2c4a4] opacity-90">
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
