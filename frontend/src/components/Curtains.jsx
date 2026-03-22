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
    <div id="curtainWrapper" className="fixed inset-0 z-50 flex">
      {/* Narrow viewports: one readable block (split columns otherwise read as "THE IS" / "STAGE YOURS") */}
      <div
        className="pointer-events-none absolute inset-0 z-[45] flex items-center justify-center px-6 md:hidden"
        aria-hidden
      >
        <div className="max-w-[min(92vw,24rem)] text-center">
          <h2 className="text-3xl font-bold uppercase leading-tight tracking-[0.12em] text-[#FFD700] drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] sm:text-4xl">
            THE STAGE
            <br />
            IS YOURS
          </h2>
          <p className="mt-5 border-t border-[#e2c4a4]/35 pt-4 font-cinzel text-[10px] font-bold uppercase tracking-[0.28em] text-[#e2c4a4] opacity-90">
            Click to enter
          </p>
        </div>
      </div>

      <div
        id="leftCurtain"
        className={`curtain curtain-left w-1/2 h-full relative flex items-center justify-end border-r-4 border-[#2a0505]${
          isOpen ? " open" : ""
        }`}
      >
        <div className="pointer-events-none z-20 hidden translate-y-[-10%] pr-2 opacity-100 md:block md:pr-4">
          <h2 className="text-5xl font-bold uppercase leading-tight tracking-widest text-[#FFD700] md:text-7xl">
            THE <br /> STAGE
          </h2>
          <p className="mt-4 border-t border-[#e2c4a4]/30 pt-2 text-right font-cinzel text-[10px] font-bold uppercase tracking-[0.2em] text-[#e2c4a4] opacity-80 md:text-xs">
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
        className={`curtain curtain-right w-1/2 h-full relative flex items-center justify-start border-l-4 border-[#2a0505]${
          isOpen ? " open" : ""
        }`}
      >
        <div className="pointer-events-none z-20 hidden translate-y-[-10%] pl-2 opacity-100 md:block md:pl-4">
          <h2 className="text-5xl font-bold uppercase leading-tight tracking-widest text-[#FFD700] md:text-7xl">
            IS <br /> YOURS
          </h2>
          <p className="mt-4 border-t border-[#e2c4a4]/30 pt-2 text-left font-cinzel text-[10px] font-bold uppercase tracking-[0.2em] text-[#e2c4a4] opacity-80 md:text-xs">
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
