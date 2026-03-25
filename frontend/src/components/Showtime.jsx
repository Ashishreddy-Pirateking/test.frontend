import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import html2canvas from "html2canvas";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import stageImg from "../Legacy/stage.jpg";
import logoImg from "../Legacy/logo.png";
import cheeringSfx from "../Legacy/cheering.m4a";
gsap.registerPlugin(ScrollToPlugin);

export default function Showtime({ pageContentRef }) {
  const fxLayerRef = useRef(null);
  const fxCanvasRef = useRef(null);
  const stageOverlayRef = useRef(null);
  const stageImgRef = useRef(null);
  const logoDropRef = useRef(null);
  const curtainLeftRef = useRef(null);
  const curtainRightRef = useRef(null);
  const finalTextRef = useRef(null);
  const backBtnRef = useRef(null);
  const showtimeBtnRef = useRef(null);

  const particlesRef = useRef([]);
  const runningRef = useRef(false);
  const rafRef = useRef(null);
  const applauseRef = useRef(null);
  const isClosingStageRef = useRef(false);
  const hasPlayedApplauseRef = useRef(false);

  useEffect(() => {
    const audio = new Audio(cheeringSfx);
    audio.preload = "auto";
    applauseRef.current = audio;
    return () => {
      if (applauseRef.current) {
        applauseRef.current.pause();
        applauseRef.current.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    const canvas = fxCanvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getCtx = () => {
    const canvas = fxCanvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d");
  };

  const createParticlesFromImage = (imgData) => {
    const particles = [];
    const step = 6;

    for (let y = 0; y < imgData.height; y += step) {
      for (let x = 0; x < imgData.width; x += step) {
        const index = (y * imgData.width + x) * 4;
        const r = imgData.data[index];
        const g = imgData.data[index + 1];
        const b = imgData.data[index + 2];
        const a = imgData.data[index + 3];

        if (a > 50 && r + g + b > 80) {
          particles.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            tx: window.innerWidth / 2,
            ty: window.innerHeight / 2,
            r,
            g,
            b,
            a,
            size: 2,
          });
        }
      }
    }
    particlesRef.current = particles;
  };

  const renderParticles = () => {
    const ctx = getCtx();
    const canvas = fxCanvasRef.current;
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of particlesRef.current) {
      ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.a / 255})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const animateParticlesToCenter = (speed = 0.01) => {
    for (const p of particlesRef.current) {
      p.vx += (p.tx - p.x) * speed;
      p.vy += (p.ty - p.y) * speed;
      p.vx *= 0.85;
      p.vy *= 0.85;
      p.x += p.vx;
      p.y += p.vy;
    }
  };

  const swirlParticles = (strength = 0.35) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    for (const p of particlesRef.current) {
      const dx = p.x - cx;
      const dy = p.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;

      p.vx += (-dy / dist) * strength;
      p.vy += (dx / dist) * strength;

      p.x += p.vx;
      p.y += p.vy;
    }
  };

  const loop = () => {
    if (!runningRef.current) return;
    swirlParticles(0.42);
    animateParticlesToCenter(0.006);
    renderParticles();
    rafRef.current = requestAnimationFrame(loop);
  };

  const kaboomFlash = () => {
    const ctx = getCtx();
    const canvas = fxCanvasRef.current;
    if (!ctx || !canvas) return;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const showStageSequence = () => {
    const stageOverlay = stageOverlayRef.current;
    if (!stageOverlay) return;
    isClosingStageRef.current = false;
    hasPlayedApplauseRef.current = false;

    stageOverlay.classList.add("active");
    gsap.set(stageImgRef.current, { opacity: 0 });
    gsap.set(logoDropRef.current, { opacity: 0, top: "-350px", left: "50%", xPercent: -50 });
    gsap.set(curtainLeftRef.current, { left: "-50%" });
    gsap.set(curtainRightRef.current, { right: "-50%" });
    gsap.set(finalTextRef.current, { opacity: 0 });
    gsap.set(backBtnRef.current, { opacity: 0 });

    const tl = gsap.timeline();
    tl.to(stageImgRef.current, { opacity: 1, duration: 0.5 });
    tl.to(logoDropRef.current, { opacity: 1, duration: 0.2 }, "<");
    tl.to(logoDropRef.current, {
      top: "55%",
      duration: 1,
      ease: "bounce.out",
      left: "50%",
      xPercent: -50,
      x: window.innerWidth * 0.05,
      onComplete: () => {
        if (isClosingStageRef.current || hasPlayedApplauseRef.current) return;
        hasPlayedApplauseRef.current = true;
        if (applauseRef.current) {
          applauseRef.current.currentTime = 0;
          applauseRef.current.play().catch(() => {});
        }
      },
    });

    tl.to(curtainLeftRef.current, { left: "0%", duration: 1, ease: "power2.inOut" }, "+=0.6");
    tl.to(curtainRightRef.current, { right: "0%", duration: 1, ease: "power2.inOut" }, "<");

    tl.to(finalTextRef.current, { opacity: 1, duration: 1 }, "+=0.5");
    tl.to(backBtnRef.current, { opacity: 1, duration: 0.8 }, "<");
  };

  const startShowtime = async () => {
    const page = pageContentRef.current;
    const fxLayer = fxLayerRef.current;
    const canvas = fxCanvasRef.current;
    const ctx = getCtx();
    if (!page || !fxLayer || !canvas || !ctx) return;

    if (showtimeBtnRef.current) showtimeBtnRef.current.disabled = true;
    isClosingStageRef.current = false;
    hasPlayedApplauseRef.current = false;

    gsap.to(window, {
      duration: 2,
      scrollTo: "#contact",
      ease: "power2.inOut",
      onComplete: async () => {
        const canvasShot = await html2canvas(page, { backgroundColor: "#000" });
        fxLayer.classList.add("active");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(canvasShot, 0, 0, window.innerWidth, window.innerHeight);

        const shotData = ctx.getImageData(0, 0, window.innerWidth, window.innerHeight);
        createParticlesFromImage(shotData);

        page.style.opacity = "0";

        runningRef.current = true;
        loop();

        setTimeout(() => {
          runningRef.current = false;
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          kaboomFlash();
          setTimeout(() => {
            fxLayer.classList.remove("active");
            showStageSequence();
          }, 200);
        }, 3000);
      },
    });
  };

  useEffect(() => {
    const backBtn = backBtnRef.current;
    if (!backBtn) return;
    const handleBack = () => {
      const stageOverlay = stageOverlayRef.current;
      const page = pageContentRef.current;
      isClosingStageRef.current = true;
      hasPlayedApplauseRef.current = true;
      if (applauseRef.current) {
        applauseRef.current.pause();
        applauseRef.current.currentTime = 0;
      }
      gsap.to(finalTextRef.current, { opacity: 0, duration: 0.3 });
      gsap.to(backBtnRef.current, { opacity: 0, duration: 0.3 });
      gsap.to(curtainLeftRef.current, { left: "-50%", duration: 1, ease: "power2.inOut" });
      gsap.to(curtainRightRef.current, { right: "-50%", duration: 1, ease: "power2.inOut" });

      setTimeout(() => {
        if (stageOverlay) stageOverlay.classList.remove("active");
        if (page) page.style.opacity = "1";
        if (showtimeBtnRef.current) showtimeBtnRef.current.disabled = false;
      }, 1000);
    };
    backBtn.addEventListener("click", handleBack);
    return () => backBtn.removeEventListener("click", handleBack);
  }, [pageContentRef]);

  const overlays =
    typeof document === "undefined"
      ? null
      : createPortal(
          <>
            <div id="fxLayer" ref={fxLayerRef}>
              <canvas id="fxCanvas" ref={fxCanvasRef}></canvas>
            </div>

            <div id="stageOverlay" ref={stageOverlayRef}>
              <img src={stageImg} id="stageImg" ref={stageImgRef} alt="Stage" />
              <img src={logoImg} id="logoDrop" ref={logoDropRef} alt="Logo" />

              <div id="curtainLeft" ref={curtainLeftRef}></div>
              <div id="curtainRight" ref={curtainRightRef}></div>

              <div id="finalText" ref={finalTextRef}>
                The show&apos;s over, do visit again
              </div>

              <button id="backToDramaBtn" className="back-to-drama" ref={backBtnRef}>
                Back to Drama
              </button>
            </div>
          </>,
          document.body
        );

  return (
    <>
      <div className="showtime-holder">
        <button id="showtimeBtn" ref={showtimeBtnRef} onClick={startShowtime}>
          SHOWTIME
        </button>
      </div>
      {overlays}
    </>
  );
}
