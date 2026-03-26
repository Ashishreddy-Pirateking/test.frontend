import { useEffect, useRef, useState } from "react";

const CREDIT_LINKS = [
  {
    name: "Ashish Reddy",
    href: "https://www.instagram.com/ashishreddy_02?igsh=Y2Q3Z2V6NDgzZjNw",
  },
  {
    name: "Sameera",
    href: "https://www.instagram.com/sameerajenna_25?igsh=YXBnZnMybWhpMzd3",
  },
  {
    name: "Santhosh",
    href: "https://www.instagram.com/m.santhosh06?igsh=MTZvbXF4enNlbDc4ZQ==",
  },
  {
    name: "Vikas",
    href: "https://www.instagram.com/vikas_pragada?igsh=MXJveGhweWQ3djJhYQ==",
  },
];

export default function Footer() {
  const [creditTapCount, setCreditTapCount] = useState(0);
  const [showCredits, setShowCredits] = useState(false);
  const tapResetRef = useRef(null);

  useEffect(() => {
    return () => {
      if (tapResetRef.current) clearTimeout(tapResetRef.current);
    };
  }, []);

  const handleCreditTap = () => {
    const nextCount = creditTapCount + 1;
    setCreditTapCount(nextCount);

    if (tapResetRef.current) clearTimeout(tapResetRef.current);

    if (nextCount >= 3) {
      setShowCredits((prev) => !prev);
      setCreditTapCount(0);
      tapResetRef.current = null;
      return;
    }

    tapResetRef.current = setTimeout(() => {
      setCreditTapCount(0);
    }, 1400);
  };

  return (
    <footer className="site-footer py-8 bg-black border-t border-[#222] text-center">
      <p className="text-sm">
        <span
          className="text-[#87ceeb] text-sm md:text-base font-semibold tracking-wide"
          style={{ fontFamily: "'Akaya Telivigala', system-ui" }}
        >
          6. YO Prasthanam
        </span>
      </p>
      <div className="mt-2 flex flex-col items-center gap-2">
        <div
          className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-gray-500 transition-all duration-300 ${
            showCredits ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 -translate-y-1"
          }`}
        >
          <span className="text-gray-600/90">Creators of the page</span>
          {CREDIT_LINKS.map((item) => (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#87ceeb] transition-colors"
            >
              {item.name}
            </a>
          ))}
        </div>
        <p className="text-[14px] text-gray-600 opacity-90 font-mono">
          <button
            type="button"
            onClick={handleCreditTap}
            className="inline bg-transparent border-0 p-0 m-0 align-baseline text-inherit hover:text-gray-500 transition-colors"
            aria-label="Show footer credits"
          >
            ©
          </button>{" "}
          2025 Governing Batch- Prasthanam
        </p>
      </div>
    </footer>
  );
}
