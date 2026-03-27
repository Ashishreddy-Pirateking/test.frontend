import { useEffect, useRef, useState } from "react";

const EMOTIONS_LIST = [
  "SHRINGARA (Love/Beauty)",
  "RAUDRA (Fury)",
  "HASYA (Laughter)",
  "KARUNA (Sorrow)",
  "BHAYANAKA (Terror)",
  "BIBHATSA (Disgust)",
  "SHANTA (Peace)",
  "VEERA (Heroism)",
  "ADBHUTA (Wonder)",
];

const AI_PREDICT_URL = import.meta.env.VITE_AI_API_URL || "https://navarasa-ai-api.onrender.com/predict";

const SCAN_DURATION_MS = 3000;
const FRAME_INTERVAL_MS = 600;

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const toCode = (label) => String(label || "").split(" ")[0].trim().toUpperCase();
const mean = (arr) => arr.length ? arr.reduce((s, v) => s + Number(v || 0), 0) / arr.length : 0;
const shuffled = (arr) => {
  const c = [...arr];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
};

const NAVARASA_COMMENTS = {
  HASYA: {0:'Mokam endhuku ala pettav',11:'Muthi meedha mekulu kottara',21:'Endhuku pudutharo kuuda thelidhu',31:'Navvu bro koncham em kaadhu',41:'Parledhu serials lo act cheyochu',51:'Okay Movies lo side character cheyochu',61:'Noiceeee',71:'Heroooooooo',81:'Koncham lo national award miss ayyindhi bro',91:'Attttt Kamal Hassan'},
  KARUNA: {0:'karuna chupinchali, kaamam kaadhu',11:'Nidra po analedhu, karuna chupinchamanam',21:'Kothi la pettav enti bro mokam',31:'Ni meedha evaraina karunisthe baagundu',41:'Parledhu, okay',51:'Noiceee, keep it up',61:'Acting ochu ayithe baane',71:'Mercy mercy mercy, ankara Mercy',81:'Anthe anthe ochesindhi, inkoncham',91:'Attttt Sai Baba'},
  RAUDRA: {0:'Edsinatte undhi',11:'mokam sarey, kopam ekkada undhi',21:'Pilla bacha kopam idhi',31:'Pandu kothi la bale unnav bhaii',41:'kallu pedhaga chesthe kopam avvadhu nana',51:'Oopiri pilchuko lekapothe poye la unnav',61:'Eyyuuu anna',71:'Ammo bayam vesthundhi baboi',81:'Pedha actor eh',91:'Hey Arjun Reddy lo hero nuvve ga?'},
  VEERA: {0:'Comedian la unnav',11:'Mokam enti ila undhi',21:'Enti ala chusthunav, ee score eh ekkuva peh',31:'Raju kaadhu kani, mantri ayithe okay',41:'Close, inkocham try cheyi',51:'Parledhu, okka chinna rajyam ivvochu',61:'Antha okay kaani edho missing king gaaru',71:'Abba abba em tejasuu bidda',81:'Meeru KGP Rajyam Prince ah?',91:'Raju Ekkada unna Raju eh'},
  BHAYANAKA: {0:'Enthasepu inka act cheyadaniki',11:'Asalu baale',21:'abacha enti idhi bayame?',31:'Bayapettu analedhu, bayapadu annam',41:'Not bad, kaani inka bayam la ledhu',51:'Eyuuuu',61:'Baane bayapaduthunav',71:'Crush ni make-up lekunda chusava?',81:'Results annouce ayinattu unnayi, chaala bayapaduthunadu paapam',91:'Mana Main character Dhorikesar ayya'},
  BIBHATSA: {0:'Nuvve disgusting ga unnav',11:'inkoncham pettochu ga expression',21:'inkoncham pettochu ga expression',31:'inkoncham pettochu ga expression',41:'Parledhu, okay',51:'Antha dharidranga undha?',61:'Em act chesthunav bro. Wah',71:'Yes idhi actor ki undalsina skill level',81:'Em chusav Mowa antha dhaarunanga',91:'Eyuuu actor'},
  ADBHUTA: {0:'Chi',11:'Adbhutanga cheyi annam, asahyanga kaadhu',21:'idhi acting ah?',31:'Endhuku intha lazy ga unnav',41:'Koncham expression kuuda pettalsindhi',51:'Parledhu, okay',61:'Anni subjects pass ayipoyava',71:'Crush ni saree lo chusina moment',81:'Chaala Adbhutanga undhi Chowdharaa',91:'WOWwww Noiceee'},
  SHANTA: {0:'Yukkkkk',11:'Shantanga ekkada unnav?',21:'Enti idhi peaceful ah?',31:'Asale baaledhu',41:'Idhi eh ekkuva peh',51:'Peace',61:'Wars ni aapesela unnav ga',71:'Ah chiru navvu chudu eyuuu',81:'Gandhi jayanti ni birthday roju eh na?',91:'Bhudhudi la bale shantanga unnav ayya'},
  SHRINGARA: {0:'blehhh ewww',11:'Enti idhi, ah maaku enti idhi antunna',21:'Chi',31:'kastame bro ila ayithe partner raavadam',41:'Ela padutharu anukuntunav ila evarraina',51:'Ayya baboiiii siguuuu ehhhhh',61:'ey ey eyyyyyyy',71:'Edho anukunamu kaani andi, maamulu vaaru kaadhandi',81:'Ahaaaannnn',91:'Rasikudive'},
};

const getComment = (emotionCode, score) => {
  const bank = NAVARASA_COMMENTS[emotionCode] || NAVARASA_COMMENTS['HASYA'];
  for (const t of [91,81,71,61,51,41,31,21,11,0]) {
    if (score >= t) return bank[t];
  }
  return bank[0];
};

export default function Challenge() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const deckRef = useRef([]);
  const lastEmotionRef = useRef("");

  const [phase, setPhase] = useState("idle");
  const [targetEmotion, setTargetEmotion] = useState("...");
  const [scanActive, setScanActive] = useState(false);
  const [scanText, setScanText] = useState("Hold still...");
  const [scanProgress, setScanProgress] = useState(0);
  const [scanBoxes, setScanBoxes] = useState({ eyeL: false, eyeR: false, mouth: false });
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("...");
  const [faceBox, setFaceBox] = useState(null);

  useEffect(() => {
    return () => stopStream();
  }, []);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const getNextEmotion = () => {
    if (!deckRef.current.length) deckRef.current = shuffled(EMOTIONS_LIST);
    const next = deckRef.current.pop() || EMOTIONS_LIST[0];
    lastEmotionRef.current = next;
    return next;
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setTargetEmotion(getNextEmotion());
      setPhase("camera");
      setScanActive(false);
      setScanProgress(0);
      setFaceBox(null);
    } catch {
      alert("Camera access denied. Please allow camera permissions.");
    }
  };

  const stopChallenge = () => {
    stopStream();
    setPhase("idle");
    setScanActive(false);
    setScanProgress(0);
    setFaceBox(null);
  };

  const captureFrame = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return null;
    const c = document.createElement("canvas");
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d").drawImage(v, 0, 0);
    return c.toDataURL("image/jpeg", 0.85);
  };

  const analyzePhoto = async () => {
    if (scanActive) return;
    if (!videoRef.current || videoRef.current.readyState < 2) {
      alert("Camera not ready. Wait a moment.");
      return;
    }

    setScanActive(true);
    setScanProgress(0);
    setScanBoxes({ eyeL: false, eyeR: false, mouth: false });
    setScanText("Scanning... hold expression steady.");

    const required = toCode(targetEmotion);
    const totalFrames = Math.ceil(SCAN_DURATION_MS / FRAME_INTERVAL_MS);
    const samples = [];
    const scanStart = Date.now();

    try {
      for (let i = 0; i < totalFrames; i++) {
        const imageData = captureFrame();
        if (!imageData) { await sleep(FRAME_INTERVAL_MS); continue; }

        try {
          const resp = await fetch(AI_PREDICT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: imageData, targetEmotion: required }),
          });

          if (resp.ok) {
            const data = await resp.json();
            const emotion = String(data.emotion || "").toUpperCase();

            if (data.face_box) {
              setFaceBox(data.face_box);
              const v = videoRef.current;
              if (v) {
                const sx = v.clientWidth / v.videoWidth;
                const sy = v.clientHeight / v.videoHeight;
                setFaceBox({
                  x: data.face_box.x * sx,
                  y: data.face_box.y * sy,
                  w: data.face_box.w * sx,
                  h: data.face_box.h * sy,
                });
              }
            }

            if (emotion && emotion !== "NO_FACE" && emotion !== "ERROR") {
              samples.push(data);
            }
          }
        } catch { /* continue scanning even if one frame fails */ }

        const elapsed = Date.now() - scanStart;
        const progress = clamp(elapsed / SCAN_DURATION_MS, 0, 1);
        setScanProgress(progress);
        const secs = Math.max(0, Math.ceil((SCAN_DURATION_MS - elapsed) / 1000));
        setScanText(secs > 0 ? `Scanning... ${secs}s left.` : "Finalizing...");
        setScanBoxes({
          eyeL: progress >= 0.25,
          eyeR: progress >= 0.55,
          mouth: progress >= 0.85,
        });

        if (i < totalFrames - 1) await sleep(FRAME_INTERVAL_MS);
      }

      const remaining = SCAN_DURATION_MS - (Date.now() - scanStart);
      if (remaining > 0) await sleep(remaining);

      stopStream();
      setScanActive(false);

      if (!samples.length) {
        setScore(0);
        setComment("Face not detected. Use better lighting and keep your face centered.");
        setPhase("result");
        return;
      }

      // Calculate final score from all samples
      const avgTargetConf = mean(samples.map((s) => Number(s.target_confidence || 0)));
      const votes = {};
      samples.forEach((s) => {
        const e = String(s.emotion || "").toUpperCase();
        votes[e] = (votes[e] || 0) + 1;
      });
      const dominant = Object.entries(votes).sort((a, b) => b[1] - a[1])[0]?.[0] || required;
      const matchRatio = (votes[required] || 0) / samples.length;
      const dominantIsTarget = dominant === required;

      let finalScore;
      if (dominantIsTarget) {
        finalScore = Math.round(clamp(avgTargetConf * 100 * 0.7 + matchRatio * 100 * 0.3, 28, 100));
      } else {
        finalScore = Math.round(clamp(avgTargetConf * 100 * 0.5 + matchRatio * 100 * 0.2, 5, 60));
      }
      finalScore = clamp(finalScore, 0, 100);

      setScore(finalScore);
      setComment(getComment(required, finalScore));
      setPhase("result");

    } catch (err) {
      setScanActive(false);
      alert(`Scan failed: ${err.message}`);
    }
  };

  return (
    <section id="challenge" className="py-16 bg-black border-b border-[#222] relative overflow-hidden">
      <div className="max-w-4xl mx-auto text-center px-6">
        <div className="flex items-center justify-center gap-4 mb-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2" className="animate-pulse">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
          <h2 className="text-3xl text-white" style={{ fontFamily: "'Kavoon', cursive" }}>
            The Navarasa Challenge
          </h2>
        </div>

        <p className="text-gray-400 mb-8">
          Think you can express? Test your acting skills with our AI Director.
        </p>

        {phase === "idle" && (
          <button
            className="px-8 py-4 bg-[#FFD700] text-black hover:scale-105 transition-transform rounded shadow-[0_0_20px_rgba(255,215,0,0.3)]"
            style={{ fontFamily: "'Eagle Lake', cursive" }}
            onClick={openCamera}
          >
            Test your talent
          </button>
        )}

        <div className={`${phase === "idle" ? "hidden" : ""} relative bg-[#111] border-2 border-[#FFD700] rounded-lg p-2 max-w-lg mx-auto`}>

          {/* Camera phase */}
          <div className={phase === "camera" ? "" : "hidden"}>
            <div className="absolute top-4 left-0 w-full text-center z-20">
              <span className="bg-black/70 px-4 py-1 rounded text-[#FFD700] font-bold animate-pulse">
                ACT NOW: {targetEmotion}
              </span>
            </div>

            <div className="relative overflow-hidden rounded-lg aspect-video bg-black">
              <video ref={videoRef} autoPlay playsInline muted
                className="w-full h-full object-cover transform scale-x-[-1]" />
              {faceBox && (
                <div style={{
                  position: "absolute",
                  border: "3px solid #22c55e",
                  left: `${faceBox.x}px`, top: `${faceBox.y}px`,
                  width: `${faceBox.w}px`, height: `${faceBox.h}px`,
                  pointerEvents: "none"
                }} />
              )}
              {scanActive && (
                <div className="absolute inset-0 z-10">
                  <div className="scanner-line" style={{ animationDuration: "3s" }} />
                </div>
              )}
            </div>

            {scanActive && (
              <>
                <div className="mt-3 text-xs text-[#a4f4c5] uppercase tracking-[0.09em]">{scanText}</div>
                <div className="mt-2 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#22c55e] to-[#FFD700] transition-all duration-300"
                    style={{ width: `${Math.round(scanProgress * 100)}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em]">
                  {["eyeL","eyeR","mouth"].map((k, idx) => (
                    <span key={k} className={`px-2 py-1 rounded border ${scanBoxes[k] ? "border-[#22c55e] text-[#9cf7bb]" : "border-white/15 text-gray-500"}`}>
                      {["Eye L","Eye R","Mouth"][idx]}
                    </span>
                  ))}
                </div>
              </>
            )}

            <div className="mt-4 flex gap-4 justify-center pb-2">
              <button className="px-4 py-2 border border-red-500 text-red-500 text-xs uppercase hover:bg-red-900 transition-colors"
                onClick={stopChallenge}>Cancel</button>
              <button
                className="px-6 py-2 bg-[#FFD700] text-black font-bold uppercase hover:bg-white transition-colors disabled:opacity-50"
                onClick={analyzePhoto} disabled={scanActive}>
                {scanActive ? "Scanning..." : "Judge Me"}
              </button>
            </div>
          </div>

          {/* Result phase */}
          {phase === "result" && (
            <div className="p-8 text-center">
              <div className="text-6xl font-black mb-4"
                style={{ color: score >= 70 ? "#22c55e" : "#FFD700" }}>
                {score}/100
              </div>
              <p className="text-xl text-white mb-6 italic">"{comment}"</p>
              <button
                className="px-6 py-2 border border-[#FFD700] text-[#FFD700] uppercase hover:bg-[#FFD700] hover:text-black transition-colors"
                onClick={openCamera}>
                Try Another Emotion
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
