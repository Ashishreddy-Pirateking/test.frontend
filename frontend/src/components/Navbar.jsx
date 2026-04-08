import { useRef, useState, useEffect } from "react";
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

  const handleNavClick = (e, targetId, offset = 0) => {
    e.preventDefault();
    if (isMobileMenuOpen) closeMenu();

    if (targetId === "footer") {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      return;
    }

    const element = document.getElementById(targetId);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition + offset,
        behavior: "smooth"
      });
    }
  };

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

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
    <nav className="fixed top-0 w-full z-40 bg-black/80 backdrop-blur-md border-b border-[#333] py-3 px-5 md:px-6 flex justify-between items-center">
      <div className="flex items-center gap-1">
        <a href="#" className="scroll-to-top" onClick={handleLogoClick}>
          <img className="logo w-36 md:w-[184px] h-auto object-contain" src={logo} alt="Prasthanam logo" />
        </a>
        {showBackstage && (
          <a
            href="/admin"
            className="hidden md:inline-flex -ml-4 items-center px-4 py-2 rounded-full border border-[#FFD700]/45 text-[#FFD700] text-xs font-bold tracking-[0.2em] uppercase hover:bg-[#FFD700] hover:text-black transition-all"
          >
            Backstage
          </a>
        )}
      </div>

      <button
        className="md:hidden text-gray-300 hover:text-[#FFD700] p-2 focus:outline-none z-50"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle Menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      <div className="hidden md:flex space-x-7 text-xs font-['Syncopate'] font-bold tracking-widest text-gray-300">
        <a href="#about" className="hover:text-[#FFD700] transition-colors">
          THE SCRIPT
        </a>
        <a href="#latest-event" className="hover:text-[#FFD700] transition-colors">
          POSTER
        </a>
        <WarpGalleryLink className="hover:text-[#FFD700] transition-colors">
          GALLERY
        </WarpGalleryLink>
        <a href="#navarasas" className="hover:text-[#FFD700] transition-colors">
          NAVARASAS
        </a>
        <a href="#team" className="hover:text-[#FFD700] transition-colors">
          CAST
        </a>
        <a href="#contact" onClick={(e) => handleNavClick(e, 'footer')} className="hover:text-[#FFD700] transition-colors">
          CONTACT US
        </a>
      </div>

      {/* Backdrop — tap outside to close */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm md:hidden z-30 transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Mobile menu — always mounted, slides in/out via transform */}
      <div
        className={`fixed top-0 left-0 w-full h-svh bg-black/95 backdrop-blur-xl border-t border-[#333] flex flex-col items-center pt-[72px] space-y-8 text-sm font-['Syncopate'] font-bold tracking-widest text-gray-300 md:hidden overflow-y-auto pb-[env(safe-area-inset-bottom,28px)] z-40 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"
          }`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="flex flex-col items-center space-y-8 pt-8 w-full px-8">
          <a href="#about" onClick={closeMenu} className="hover:text-[#FFD700] transition-colors">THE SCRIPT</a>
          <a href="#latest-event" onClick={closeMenu} className="hover:text-[#FFD700] transition-colors">POSTER</a>
          <div onClick={closeMenu}><WarpGalleryLink className="hover:text-[#FFD700] transition-colors">GALLERY</WarpGalleryLink></div>
          <a href="#navarasas" onClick={closeMenu} className="hover:text-[#FFD700] transition-colors">NAVARASAS</a>
          <a href="#team" onClick={closeMenu} className="hover:text-[#FFD700] transition-colors">CAST</a>
          <a href="#contact" onClick={(e) => handleNavClick(e, 'footer')} className="hover:text-[#FFD700] transition-colors">CONTACT US</a>
          {showBackstage && (
            <a href="/admin" className="px-6 py-3 mt-4 rounded-full border border-[#FFD700]/45 text-[#FFD700] text-xs font-bold tracking-[0.2em] uppercase hover:bg-[#FFD700] hover:text-black transition-all">
              Backstage
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}