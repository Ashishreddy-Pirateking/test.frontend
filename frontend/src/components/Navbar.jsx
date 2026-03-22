import { useRef, useState } from "react";
import logo from "../Legacy/logo.png";
import WarpGalleryLink from "./WarpGalleryLink";

const decodeJwtPayload = (token) => {
  try {
    const parts = String(token || "").split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};

const hasValidAdminSession = () => {
  try {
    const token = localStorage.getItem("admin_token");
    const profileRaw = localStorage.getItem("admin_profile");
    if (!token || !profileRaw) return false;

    const profile = JSON.parse(profileRaw);
    if (String(profile?.role || "").toLowerCase() !== "admin") return false;

    const payload = decodeJwtPayload(token);
    if (!payload) return false;
    if (String(payload?.role || "").toLowerCase() !== "admin") return false;

    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp <= now) return false;
    return true;
  } catch {
    return false;
  }
};

export default function Navbar() {
  const showBackstage = hasValidAdminSession();
  const logoClickCountRef = useRef(0);
  const logoTimerRef = useRef(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMenu = () => setIsMobileMenuOpen(false);

  const handleLogoClick = (event) => {
    event.preventDefault();
    logoClickCountRef.current += 1;

    if (logoTimerRef.current) clearTimeout(logoTimerRef.current);
    logoTimerRef.current = setTimeout(() => {
      logoClickCountRef.current = 0;
    }, 1400);

    if (logoClickCountRef.current >= 5) {
      logoClickCountRef.current = 0;
      window.location.href = "/admin-login";
      return;
    }

    window.location.hash = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav className="fixed left-0 right-0 top-0 z-40 px-4 pt-[max(0.65rem,env(safe-area-inset-top))] md:px-0 md:pt-0">
      <div className="relative mx-auto max-w-7xl md:max-w-none">
        <div className="flex items-center justify-between gap-3 rounded-b-2xl border border-white/10 bg-black/85 px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl md:rounded-none md:border-0 md:border-b md:border-[#333] md:bg-black/80 md:px-6 md:py-4 md:shadow-none">
          <div className="flex min-w-0 flex-1 items-center gap-1">
            <a href="#" className="scroll-to-top shrink-0" onClick={handleLogoClick}>
              <img
                className="h-10 w-auto max-w-[168px] object-contain md:h-[50px] md:max-w-[200px]"
                src={logo}
                alt="Prasthanam logo"
              />
            </a>
            {showBackstage && (
              <a
                href="/admin"
                className="hidden shrink-0 md:inline-flex -ml-4 items-center rounded-full border border-[#FFD700]/45 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#FFD700] transition-all hover:bg-[#FFD700] hover:text-black"
              >
                Backstage
              </a>
            )}
          </div>

          <button
            type="button"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-gray-200 transition-colors hover:text-[#FFD700] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700]/50 md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle menu"
          >
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <div className="hidden items-center gap-6 text-xs font-['Syncopate'] font-bold tracking-widest text-gray-300 md:flex md:gap-8">
            <a href="#about" className="transition-colors hover:text-[#FFD700]">
              THE SCRIPT
            </a>
            <a href="#latest-event" className="transition-colors hover:text-[#FFD700]">
              POSTER
            </a>
            <WarpGalleryLink className="transition-colors hover:text-[#FFD700]">GALLERY</WarpGalleryLink>
            <a href="#navarasas" className="transition-colors hover:text-[#FFD700]">
              NAVARASAS
            </a>
            <a href="#team" className="transition-colors hover:text-[#FFD700]">
              CAST
            </a>
            <a href="#contact" className="transition-colors hover:text-[#FFD700]">
              CONTACT US
            </a>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[min(70vh,520px)] overflow-y-auto rounded-2xl border border-white/10 bg-black/95 py-6 shadow-[0_24px_60px_rgba(0,0,0,0.65)] backdrop-blur-xl md:hidden">
            <div className="flex flex-col items-stretch gap-1 px-2">
              <a
                href="#about"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-center text-sm font-['Syncopate'] font-bold tracking-widest text-gray-200 transition-colors hover:bg-white/5 hover:text-[#FFD700]"
              >
                THE SCRIPT
              </a>
              <a
                href="#latest-event"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-center text-sm font-['Syncopate'] font-bold tracking-widest text-gray-200 transition-colors hover:bg-white/5 hover:text-[#FFD700]"
              >
                POSTER
              </a>
              <div onClick={closeMenu} className="rounded-xl px-4 py-3 text-center">
                <WarpGalleryLink className="font-['Syncopate'] text-sm font-bold tracking-widest text-gray-200 transition-colors hover:text-[#FFD700]">
                  GALLERY
                </WarpGalleryLink>
              </div>
              <a
                href="#navarasas"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-center text-sm font-['Syncopate'] font-bold tracking-widest text-gray-200 transition-colors hover:bg-white/5 hover:text-[#FFD700]"
              >
                NAVARASAS
              </a>
              <a
                href="#team"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-center text-sm font-['Syncopate'] font-bold tracking-widest text-gray-200 transition-colors hover:bg-white/5 hover:text-[#FFD700]"
              >
                CAST
              </a>
              <a
                href="#contact"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-center text-sm font-['Syncopate'] font-bold tracking-widest text-gray-200 transition-colors hover:bg-white/5 hover:text-[#FFD700]"
              >
                CONTACT US
              </a>
              {showBackstage && (
                <a
                  href="/admin"
                  className="mx-4 mt-2 rounded-full border border-[#FFD700]/45 px-6 py-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-[#FFD700] transition-all hover:bg-[#FFD700] hover:text-black"
                >
                  Backstage
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
