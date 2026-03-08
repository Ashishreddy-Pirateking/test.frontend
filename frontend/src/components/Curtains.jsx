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
      <div
        id="leftCurtain"
        className={`curtain curtain-left w-1/2 h-full relative flex items-center justify-end border-r-4 border-[#2a0505]${
          isOpen ? " open" : ""
        }`}
      >
        <div className="pr-2 md:pr-4 pointer-events-none z-20 opacity-100 translate-y-[-10%]">
          <h2 className="text-5xl md:text-7xl font-bold text-[#FFD700] tracking-widest text-right leading-tight uppercase">
            THE <br /> STAGE
          </h2>
          <p className="text-[#e2c4a4] font-cinzel font-bold tracking-[0.2em] text-[10px] md:text-xs mt-4 text-right opacity-80 border-t border-[#e2c4a4]/30 pt-2">
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
        <div className="pl-2 md:pl-4 pointer-events-none z-20 opacity-100 translate-y-[-10%]">
          <h2 className="text-5xl md:text-7xl font-bold text-[#FFD700] tracking-widest text-left leading-tight uppercase">
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
