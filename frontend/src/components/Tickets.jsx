import { useEffect, useMemo, useRef, useState } from "react";
import { CAPTCHA_EMOJIS } from "../data/legacyData";

const TICKET_WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycby-RVV8ZvDlRq_bAB92QTgNfKPEaeZ8UMZOG-BVVfZD40LyL7l4YRDgK4oetQ07IQDjgg/exec";

const getRandomEmojis = (target) => {
  const distractors = CAPTCHA_EMOJIS.filter((e) => e.name !== target.name)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);
  return [target, ...distractors].sort(() => 0.5 - Math.random());
};

export default function Tickets() {
  const ticketFieldStyle = { fontFamily: "'SourGummy', sans-serif", fontStyle: "italic" };
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [ticketBooked, setTicketBooked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [captchaTarget, setCaptchaTarget] = useState(CAPTCHA_EMOJIS[0]);
  const [captchaOptions, setCaptchaOptions] = useState([]);
  const [captchaMessage, setCaptchaMessage] = useState("Loading Check...");
  const [captchaColor, setCaptchaColor] = useState("");
  const [captchaMode, setCaptchaMode] = useState("prompt");
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const [loudness, setLoudness] = useState(0);
  const [micActive, setMicActive] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState("Click Start Test 🎤");
  const [voiceType, setVoiceType] = useState("neutral");
  const ticketRef = useRef(null);



  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const dataArrayRef = useRef(null);
  const streamRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    let ticking = false;
    
    const handleOrientation = (event) => {
      let gamma = event.gamma; 
      let beta = event.beta;
      
      if (gamma === null || beta === null || !ticketRef.current) return;
      
      gamma = Math.max(-35, Math.min(35, gamma));
      beta = Math.max(-35, Math.min(35, beta));
      
      const rotateX = beta * -0.6;
      const rotateY = gamma * 0.6;
      
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (ticketRef.current) {
            ticketRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            ticketRef.current.style.transition = 'transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    if (typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
      window.addEventListener("deviceorientation", handleOrientation);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener("deviceorientation", handleOrientation);
      }
      if (ticketRef.current) {
        ticketRef.current.style.transform = '';
      }
    };
  }, []);

  const initCaptcha = () => {
    const target = CAPTCHA_EMOJIS[Math.floor(Math.random() * CAPTCHA_EMOJIS.length)];
    setCaptchaTarget(target);
    setCaptchaOptions(getRandomEmojis(target));
    setCaptchaVerified(false);
    setCaptchaMessage("Verify you are human: Select the");
    setCaptchaColor("");
    setCaptchaMode("prompt");
  };

  useEffect(() => {
    initCaptcha();
  }, []);

  useEffect(() => {
    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const handleCaptchaClick = (option) => {
    if (option.name === captchaTarget.name) {
      setCaptchaVerified(true);
      setCaptchaMessage("✅ Verified! You have feelings.");
      setCaptchaColor("#15803d");
      setCaptchaMode("success");
    } else {
      setCaptchaVerified(false);
      setCaptchaMessage("❌ WRONG! Emotion not detected.");
      setCaptchaColor("#dc2626");
      setCaptchaMode("error");
      setTimeout(initCaptcha, 500);
    }
  };

  const handleConfirm = async (event) => {
    event?.preventDefault();
    setSubmitError("");
    setSubmitMessage("");

    if (!captchaVerified) {
      setSubmitError("Please complete the security check.");
      return;
    }
    if (!name.trim() || !email.trim()) {
      setSubmitError("Please enter your name and email.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(TICKET_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Could not submit your booking right now. Please try again.");
      }

      let successMessage = "Your booking request has been received.";
      const responseText = await response.text();
      if (responseText) {
        try {
          const data = JSON.parse(responseText);
          successMessage = data?.message || successMessage;
        } catch {
          successMessage = responseText || successMessage;
        }
      }

      setTicketBooked(true);
      setSubmitMessage(successMessage);
    } catch (error) {
      setSubmitError(error?.message || "Could not submit your booking right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const setResult = (text, type = "neutral") => {
    setVoiceMessage(text);
    setVoiceType(type);
  };

  const stopMic = () => {
    if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setLoudness(0);
    setMicActive(false);
    setResult("Test stopped. Click Start again 🎤");
  };

  const startMic = async () => {
    try {
      setMicActive(true);
      setResult("");

      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 1024;

      microphoneRef.current = audioContextRef.current.createMediaStreamSource(streamRef.current);
      microphoneRef.current.connect(analyserRef.current);
      dataArrayRef.current = new Uint8Array(analyserRef.current.fftSize);

      const update = () => {
  analyserRef.current.getByteTimeDomainData(dataArrayRef.current);

  // Compute raw RMS amplitude (0.0 to 1.0)
  let sum = 0;
  for (let i = 0; i < dataArrayRef.current.length; i += 1) {
    const val = (dataArrayRef.current[i] - 128) / 128;
    sum += val * val;
  }
  const rms = Math.sqrt(sum / dataArrayRef.current.length);

  // Map RMS to 0-100 display scale using a curve that's honest:
  // rms < 0.01 → near silence (0-5)
  // rms ~0.05  → normal talking (30-40)
  // rms ~0.10  → loud talking (55-65)
  // rms ~0.18+ → real shout (85-100)
  // Formula: power curve so soft sounds stay low, shouts register high
  const SHOUT_THRESHOLD = 0.18; // RMS where max score is reached
  const curved = Math.pow(rms / SHOUT_THRESHOLD, 1.8);
  let loud = Math.round(Math.min(1, curved) * 100);
  loud = Math.max(0, loud);

  setLoudness(loud);

  if (loud >= 85) {
    setResult("✅ Peace ra!", "good");
  } else if (loud > 8) {
    setResult("❌ Gattiga, vinapadelaaa!!!!!", "bad");
  }

  animationIdRef.current = requestAnimationFrame(update);
};

      update();
    } catch (err) {
      console.error(err);
      setMicActive(false);
      alert("Mic permission denied. Allow microphone access to use this feature.");
    }
  };

  const voiceResultStyles = useMemo(() => {
    if (voiceType === "good") {
      return {
        background: "rgba(34,197,94,0.12)",
        border: "1px solid rgba(34,197,94,0.65)",
        boxShadow: "0 0 18px rgba(34,197,94,0.45)",
        color: "#bbf7d0",
      };
    }
    if (voiceType === "bad") {
      return {
        background: "rgba(239,68,68,0.12)",
        border: "1px solid rgba(239,68,68,0.65)",
        boxShadow: "0 0 18px rgba(239,68,68,0.45)",
        color: "#fecaca",
      };
    }
    return {
      background: "rgba(0,0,0,0.35)",
      border: "1px solid rgba(255,255,255,0.12)",
      boxShadow: "none",
      color: "rgba(255,255,255,0.92)",
    };
  }, [voiceType]);

  return (
    <section id="contact" className="py-20 px-4 bg-[#0a0a0a]">
      <div className="max-w-3xl mx-auto">
        <div className="max-w-4xl mx-auto mb-10 px-2">
          <div className="voice-card">
            <div className="voice-left">
              <p className="voice-mini-title">AUDITION SIMULATOR</p>
              <h3 className="voice-title">Voice Testing Mic</h3>
              <p className="voice-sub">
                Click the mic and shout your name like you're on stage 🎭{" "}
                <span className="voice-rule">(Target: 80+ loudness)</span>
              </p>

              <div className="voice-controls">
                <button id="voiceStartBtn" className="voice-btn" onClick={startMic} disabled={micActive}>
                  🎙 Start Test
                </button>
                <button id="voiceStopBtn" className="voice-btn danger" onClick={stopMic} disabled={!micActive}>
                  ⛔ Stop
                </button>
              </div>

              <div className="voice-meter-wrap">
                <div className="voice-meter-bar" id="voiceMeterBar" style={{ width: `${loudness}%` }}></div>
              </div>

              <div className="voice-readings">
                Loudness: <span id="voiceDbValue">{loudness}</span>/100
              </div>

              <div
                className="voice-result"
                id="voiceResult"
                style={{ ...voiceResultStyles, display: voiceMessage ? "block" : "none" }}
              >
                {voiceMessage}
              </div>
            </div>

            <div className="voice-right">
              <div className="mic-circle" id="micCircle" style={{ transform: `scale(${1 + loudness / 300})` }}>
                <div className="mic-icon">🎤</div>
                <div className="mic-glow"></div>
              </div>
              <p className="voice-tip">Tip: Try shouting your name once 😄</p>
            </div>
          </div>
        </div>

        <h2 className="text-3xl md:text-4xl text-center mb-10 text-[#FFD700]" style={{ fontFamily: "'Walter Turncoat', cursive" }}>Ticket Counter </h2>

        <p className="md:hidden text-center text-[#e2c4a4] text-xs font-mono uppercase tracking-widest mb-4 opacity-60">
          Tilt phone to move ticket
        </p>

        <div
          ref={ticketRef}
          className={`ticket-card bg-[#e2c4a4] text-[#2c1810] rounded-lg overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row w-full max-w-3xl mx-auto transform-gpu ${ticketBooked ? "is-booked" : ""
            }`}
        >
          <div className="absolute left-0 top-0 bottom-0 w-4 ticket-edge"></div>
          <div className="ticket-stub bg-[#2c1810] text-[#e2c4a4] p-6 w-full md:w-1/3 flex flex-col justify-between border-r-2 border-dashed border-[#e2c4a4] relative">
            <div className="text-center">
              <h3 className="font-cinzel font-bold text-2xl mb-2">REGISTER FOR</h3>
              <p className="text-xs uppercase tracking-widest opacity-70">Prasthanam TDS</p>
            </div>
            <div className="text-center my-8">
              <div className="text-4xl font-bold font-mono">2025</div>
              <div className="text-xs uppercase">Season</div>
            </div>
            <div className="barcode h-12 bg-[#e2c4a4] w-full"></div>
          </div>

          <div className="ticket-body-wrap w-full md:w-2/3 md:ml-4">
            <div className="ticket-body p-6">
            <h3 className="font-playfair font-bold text-2xl mb-6 border-b-2 border-[#2c1810] pb-2">
              Book Your Seat (Contact Us)
            </h3>
            <form id="ticketForm" className="space-y-4" onSubmit={handleConfirm}>
              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={ticketFieldStyle}>Name and Roll Number</label>
                <input
                  id="nameInput"
                  type="text"
                  placeholder="Enter your name"
                  className="w-full bg-transparent border-b border-[#2c1810] focus:outline-none focus:border-[#4a0404] py-1 font-playfair placeholder-[#2c1810]/50"
                  style={ticketFieldStyle}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={ticketBooked || submitting}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={ticketFieldStyle}>Gmail</label>
                <input
                  id="emailInput"
                  type="email"
                  placeholder="email@iitkgp.ac.in"
                  className="w-full bg-transparent border-b border-[#2c1810] focus:outline-none focus:border-[#4a0404] py-1 font-playfair placeholder-[#2c1810]/50"
                  style={ticketFieldStyle}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={ticketBooked || submitting}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={ticketFieldStyle}>Review / Message</label>
                <textarea
                  id="msgInput"
                  rows="2"
                  placeholder="Tell us something dramatic..."
                  className="w-full bg-transparent border-b border-[#2c1810] focus:outline-none focus:border-[#4a0404] py-1 font-playfair placeholder-[#2c1810]/50"
                  style={ticketFieldStyle}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  disabled={ticketBooked || submitting}
                ></textarea>
              </div>
              <div className="captcha-container">
                <p
                  className="text-sm font-bold uppercase mb-2 tracking-wide"
                  id="captchaInstruction"
                  style={{ color: captchaColor || undefined }}
                >
                  {captchaMode === "prompt" ? (
                    <>
                      {captchaMessage}{" "}
                      <span style={{ color: "#FFD700", textDecoration: "underline" }}>
                        {captchaTarget.name}
                      </span>{" "}
                      emoji
                    </>
                  ) : (
                    captchaMessage
                  )}
                </p>
                <div className="captcha-grid" id="captchaGrid">
                  {captchaOptions.map((opt) => (
                    <span
                      key={opt.name}
                      className="captcha-item"
                      onClick={() => handleCaptchaClick(opt)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") handleCaptchaClick(opt);
                      }}
                    >
                      {opt.char}
                    </span>
                  ))}
                </div>
              </div>
              {submitError && (
                <p className="text-sm font-semibold text-[#7f0000]" aria-live="polite">
                  {submitError}
                </p>
              )}
              {submitMessage && (
                <p className="text-sm font-semibold text-[#14532d]" aria-live="polite">
                  {submitMessage}
                </p>
              )}
              <button
                id="confirmBtn"
                type="submit"
                className="w-full bg-[#2c1810] text-[#e2c4a4] font-cinzel font-bold py-3 mt-4 hover:bg-[#4a0404] transition-colors"
                disabled={!captchaVerified || ticketBooked || submitting}
              >
                {ticketBooked ? "BOOKED" : submitting ? "SENDING..." : "CONFIRM BOOKING"}
              </button>
            </form>
          </div>

            <div className="ticket-booked-banner" aria-live="polite">
              <span className="ticket-booked-title">Your Ticket Has Been Booked</span>
              <span className="ticket-booked-sub">See you at the stage</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 mt-16 border-t border-[#222] pt-8">
          <a
            href="https://www.facebook.com/Prasthanam.TDS"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-gray-400 hover:text-[#FFD700] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
            <span>/Prasthanam.TDS</span>
          </a>
          <a
            href="https://www.instagram.com/prasthanam_iitkgp/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-gray-400 hover:text-[#FFD700] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
            <span>@prasthanam_iitkgp</span>
          </a>
          <a
            href="https://whatsapp.com/channel/0029VbBP8Pt4SpkESvDNYF0l"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-gray-400 hover:text-[#FFD700] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 11.5a8.5 8.5 0 0 1-12.57 7.48L3 20l1.13-5.08A8.5 8.5 0 1 1 21 11.5Z" />
              <path d="M8.8 9.4c.2-.4.4-.4.6-.4h.5c.2 0 .4 0 .5.4l.5 1.3c.1.3.1.5-.1.7l-.4.5c-.1.1-.2.3-.1.5.3.6.8 1.2 1.4 1.7.6.5 1.3.9 2 1.1.2.1.4 0 .5-.1l.6-.7c.2-.2.4-.2.6-.1l1.2.6c.3.1.4.3.3.6l-.2.8c-.1.3-.2.5-.5.6-.5.2-1.2.3-1.9.1-1.1-.3-2.2-.9-3.2-1.8-1-.8-1.8-1.8-2.3-2.9-.5-1-.6-1.9-.3-2.5Z" />
            </svg>
            <span>WhatsApp Channel</span>
          </a>
          <a
            href="mailto:prasthanam.iitkgp@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-gray-400 hover:text-[#FFD700] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <span>prasthanam.iitkgp@gmail.com</span>
          </a>
        </div>
      </div>
    </section>
  );
}
