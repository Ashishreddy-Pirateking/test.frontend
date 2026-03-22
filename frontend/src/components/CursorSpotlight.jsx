import { useEffect, useRef, useState } from "react";

export default function CursorSpotlight() {
  const cursRef = useRef(null);
  const spotRef = useRef(null);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setIsTouch(true);
      return;
    }

    const handleMove = (event) => {
      const x = event.clientX;
      const y = event.clientY;
      if (cursRef.current) {
        cursRef.current.style.left = `${x}px`;
        cursRef.current.style.top = `${y}px`;
      }
      if (spotRef.current) {
        spotRef.current.style.left = `${x}px`;
        spotRef.current.style.top = `${y}px`;
      }
    };

    const handleBlur = () => {
      if (spotRef.current) {
        spotRef.current.style.width = "0px";
        spotRef.current.style.height = "0px";
      }
    };

    const handleFocus = () => {
      if (spotRef.current) {
        const size =
          getComputedStyle(document.documentElement).getPropertyValue("--spotlight-size")?.trim() || "200px";
        spotRef.current.style.width = size;
        spotRef.current.style.height = size;
      }
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  if (isTouch) return null;

  return (
    <>
      <div id="spot" ref={spotRef} className="spotlight" aria-hidden="true"></div>
      <div id="curs" ref={cursRef} className="cursor-dot" aria-hidden="true"></div>
    </>
  );
}
