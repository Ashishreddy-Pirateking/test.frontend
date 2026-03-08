import { useRef } from "react";
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
    <nav className="fixed top-0 w-full z-40 bg-black/80 backdrop-blur-md border-b border-[#333] py-4 px-6 flex justify-between items-center">
      <div className="flex items-center gap-1">
        <a href="#" className="scroll-to-top" onClick={handleLogoClick}>
          <img className="logo" src={logo} alt="Prasthanam logo" />
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
      <div className="hidden md:flex space-x-8 text-sm font-bold tracking-widest text-gray-300">
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
        <a href="#contact" className="hover:text-[#FFD700] transition-colors">
          TICKETS
        </a>
      </div>
    </nav>
  );
}
