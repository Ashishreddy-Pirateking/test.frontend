import { useEffect, useMemo, useRef, useState } from "react";
import Curtains from "./components/Curtains";
import CursorSpotlight from "./components/CursorSpotlight";
import Gallery from "./components/Gallery";
import GalleryCTA from "./components/GalleryCTA";
import Hero from "./components/Hero";
import LatestEventPoster from "./components/LatestEventPoster";
import Navbar from "./components/Navbar";
import Timeline from "./components/Timeline";
import Navarasas from "./components/Navarasas";
import Team from "./components/Team";
import Tickets from "./components/Tickets";
import Showtime from "./components/Showtime";
import Footer from "./components/Footer";
import CastPage from "./components/CastPage";
import AdminLogin from "./components/AdminLogin";
import AdminPanel from "./components/AdminPanel";
import AdminGalleryManager from "./components/AdminGalleryManager";

function App() {
  const pageContentRef = useRef(null);
  const curtainTimeoutRef = useRef(null);
  const [curtainsOpen, setCurtainsOpen] = useState(false);
  const [curtainHidden, setCurtainHidden] = useState(false);

  const isGallery = useMemo(() => {
    const path = window.location.pathname;
    return (
      (path.endsWith("/gallery") || path.endsWith("/gallery.html")) &&
      !path.includes("/admin/")
    );
  }, []);

  const isCastPage = useMemo(() => {
    const path = window.location.pathname;
    return path.endsWith("/cast");
  }, []);

  const isAdminLoginPage = useMemo(() => {
    const path = window.location.pathname;
    return path.endsWith("/admin-login");
  }, []);

  const isAdminPanelPage = useMemo(() => {
    const path = window.location.pathname;
    return path.endsWith("/admin");
  }, []);

  const isAdminGalleryPage = useMemo(() => {
    const path = window.location.pathname;
    return path.endsWith("/admin/gallery");
  }, []);

  const scrollToHashTarget = () => {
  const hash = window.location.hash;
  if (!hash) return;

  const targetId = hash.replace("#", "");
  const target = document.getElementById(targetId);

  if (!target) return;

  setTimeout(() => {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 300);
};

  useEffect(() => {
    if (history.scrollRestoration) {
      history.scrollRestoration = "manual";
    }
    const urlParams = new URLSearchParams(window.location.search);
    const fromCast = urlParams.get("fromCast");
    const fromGallery = urlParams.get("fromGallery");
    const skipCurtain = urlParams.get("skipCurtain");
    const shouldRestoreHash =
      Boolean(window.location.hash) &&
      (fromCast === "1" || fromGallery === "1" || skipCurtain === "1");
    if (shouldRestoreHash) {
  setTimeout(scrollToHashTarget, 500);
} else {
      window.scrollTo(0, 0);
    }
  }, []);

  useEffect(() => {
    if (isGallery) return;
    const urlParams = new URLSearchParams(window.location.search);
    const skipCurtain = urlParams.get("skipCurtain");
    if (skipCurtain === "1") {
      setTimeout(() => {
        openCurtains();
        if (window.location.hash) {
          scrollToHashTarget();
          setTimeout(scrollToHashTarget, 300);
        }
      }, 100);
      history.replaceState(null, "", window.location.pathname + window.location.hash);
    }
  }, [isGallery]);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === "Escape") openCurtains();
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        window.location.href = "/admin-login";
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    return () => {
      if (curtainTimeoutRef.current) clearTimeout(curtainTimeoutRef.current);
    };
  }, []);

  const openCurtains = () => {
    if (curtainsOpen) return;
    setCurtainsOpen(true);
    curtainTimeoutRef.current = setTimeout(() => {
      setCurtainHidden(true);
    }, 1200);
  };

  if (isAdminGalleryPage) return <AdminGalleryManager />;
  if (isGallery)
    return (
      <>
        <CursorSpotlight />
        <Gallery />
      </>
    );
  if (isCastPage)
    return (
      <>
        <CursorSpotlight />
        <CastPage />
      </>
    );
  if (isAdminLoginPage) return <AdminLogin />;
  if (isAdminPanelPage) return <AdminPanel />;

  return (
    <>
      <CursorSpotlight />
      {!curtainHidden && (
        <Curtains isOpen={curtainsOpen} onOpen={openCurtains} />
      )}

      <div id="pageContent" ref={pageContentRef}>
        <div
          id="page"
          className={`transition-opacity duration-700 ${
            curtainsOpen ? "opacity-100" : "opacity-0"
          }`}
        >
          <Navbar />
          <Hero />
          <Timeline />
          <LatestEventPoster />
          <GalleryCTA />
          <Navarasas />
          <Team />
          <Tickets />
          <Showtime pageContentRef={pageContentRef} />
          <Footer />
        </div>
      </div>
    </>
  );
}

export default App;
