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

const resolveAiBase = (value) =>
  String(value || "https://navarasa-ai-api.onrender.com")
    .trim()
    .replace(/\/predict\/?$/, "")
    .replace(/\/+$/, "");

const configuredAiBase = resolveAiBase(import.meta.env.VITE_AI_API_URL);
const AI_BASE = configuredAiBase || "https://navarasa-ai-api.onrender.com";
const AI_URL = `${AI_BASE}/predict`;
const AI_WAKE_URL = `${AI_BASE}/warmup`;

const shuffled = (arr) => {
  const c = [...arr];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
};

const toCode = (label) => String(label || "").split(" ")[0].trim().toUpperCase();

const COMMENTS = {
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

const getComment = (code, score) => {
  const bank = COMMENTS[code] || COMMENTS.HASYA;
  for (const t of [91,81,71,61,51,41,31,21,11,0]) {
    if (score >= t) return bank[t];
  }
  return bank[0];
};

const wakeServer = () => {
  fetch(AI_WAKE_URL, { method: "GET", cache: "no-store" }).catch(() => {});
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Capture frame with brightness/contrast boost for dark environments
const captureFrame = (videoEl) => {
  const sourceWidth = videoEl.videoWidth;
  const sourceHeight = videoEl.videoHeight;
  const scale = Math.min(1, 480 / Math.max(sourceWidth, sourceHeight));
  const w = Math.max(1, Math.round(sourceWidth * scale));
  const h = Math.max(1, Math.round(sourceHeight * scale));

  // First canvas: draw the video (un-mirrored — DeepFace doesn't need mirroring)
  const c1 = document.createElement("canvas");
  c1.width = w;
  c1.height = h;
  const ctx1 = c1.getContext("2d");
  ctx1.drawImage(videoEl, 0, 0, w, h);

  // Second canvas: apply brightness + contrast boost
  const c2 = document.createElement("canvas");
  c2.width = w;
  c2.height = h;
  const ctx2 = c2.getContext("2d");
  ctx2.filter = "brightness(1.5) contrast(1.3)";
  ctx2.drawImage(c1, 0, 0);

  return c2.toDataURL("image/jpeg", 0.92);
};

const waitForAiReady = async (timeoutMs = 90000) => {
  const startTime = Date.now();
  let lastError = null;

  while (Date.now() - startTime < timeoutMs) {
    try {
      const response = await fetch(AI_WAKE_URL, {
        method: "GET",
        cache: "no-store",
      });
      if (response.ok) return;
      lastError = new Error(`AI wake check returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await sleep(3000);
  }

  throw lastError || new Error("AI server did not wake up in time.");
};

const fetchWithRetry = async (url, options, timeoutMs = 150000, retries = 2) => {
  const attempt = async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const resp = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      return resp;
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  };

  for (let index = 0; index <= retries; index += 1) {
    try {
      const response = await attempt();
      if ([502, 503, 504].includes(response.status) && index < retries) {
        await sleep(4000 * (index + 1));
        continue;
      }
      return response;
    } catch (err) {
      const retryableNetworkError =
        err?.name === "AbortError" || err instanceof TypeError || /Failed to fetch/i.test(String(err?.message || ""));
      if (retryableNetworkError && index < retries) {
        await sleep(4000 * (index + 1));
        continue;
      }
      throw err;
    }
  }

  throw new Error("AI request failed after multiple attempts.");
};

export default function Challenge() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const deckRef = useRef([]);

  const [phase, setPhase] = useState("idle");
  const [targetEmotion, setTargetEmotion] = useState("...");
  const [cameraReady, setCameraReady] = useState(false);
  const [judging, setJudging] = useState(false);
  const [judgingMsg, setJudgingMsg] = useState("AI is judging...");
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("...");
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    wakeServer();
    return () => stopStream();
  }, []);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraReady(false);
  };

  const getNextEmotion = () => {
    if (!deckRef.current.length) deckRef.current = shuffled(EMOTIONS_LIST);
    return deckRef.current.pop() || EMOTIONS_LIST[0];
  };

  const openCamera = async () => {
    stopStream();
    setCameraReady(false);
    setJudging(false);
    setDebugInfo(null);
    setPhase("camera");
    wakeServer();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
            .then(() => setTimeout(() => setCameraReady(true), 800))
            .catch(() => setCameraReady(true));
        };
      }

      setTargetEmotion(getNextEmotion());
    } catch {
      setPhase("idle");
      alert("Camera access denied. Please allow camera permissions and try again.");
    }
  };

  const stopChallenge = () => {
    stopStream();
    setPhase("idle");
    setJudging(false);
  };

  const judgeMe = async () => {
    if (judging || !cameraReady) return;

    const v = videoRef.current;
    if (!v || !v.videoWidth || !v.videoHeight) {
      alert("Camera not showing video yet. Wait a moment and try again.");
      return;
    }

    const imageData = captureFrame(v);
    const required = toCode(targetEmotion);
    setJudging(true);
    setDebugInfo(null);
    setJudgingMsg("Waking up AI server...");

    try {
      await waitForAiReady(90000);
    } catch (error) {
      setJudging(false);
      alert(
        error?.name === "AbortError"
          ? "AI server is still waking up. Please wait a little longer and try again."
          : "Could not reach the AI service on Render. Check that the ML service is deployed and awake."
      );
      return;
    }

    setJudgingMsg("Sending to AI...");

    const t1 = setTimeout(() => setJudgingMsg("AI is analyzing your expression..."), 4000);
    const t2 = setTimeout(() => setJudgingMsg("Processing on CPU, this takes ~30s..."), 15000);
    const t3 = setTimeout(() => setJudgingMsg("Still working, almost done..."), 45000);

    try {
      const resp = await fetchWithRetry(AI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData, targetEmotion: required, fast: true }),
      }, 150000);

      [t1, t2, t3].forEach(clearTimeout);

      if (!resp.ok) throw new Error(`Server error: ${resp.status}`);

      const contentType = resp.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("AI service returned a non-JSON response.");
      }

      const data = await resp.json();
      const emotion = String(data.emotion || "").toUpperCase();

      setDebugInfo(data);
      stopStream();
      setJudging(false);

      if (!emotion || emotion === "NO_FACE" || emotion === "ERROR") {
        setScore(0);
        setComment("__NOFACE__");
        setPhase("result");
        return;
      }

      const targetConf = Number(data.target_confidence || 0);
      const dominantIsTarget = emotion === required;
      let finalScore = Math.round(targetConf * 100 * 0.75 + (dominantIsTarget ? 25 : 0));
      finalScore = Math.min(100, Math.max(0, finalScore));

      setScore(finalScore);
      setComment(getComment(required, finalScore));
      setPhase("result");

    } catch (err) {
      [t1, t2, t3].forEach(clearTimeout);
      setJudging(false);

      if (err.name === "AbortError") {
        alert("Server took too long even after retry. Wait 60 seconds and try again.");
      } else if (err instanceof TypeError || /Failed to fetch/i.test(String(err.message || ""))) {
        alert("Could not reach the AI service on Render. Make sure the service is awake and accessible.");
      } else {
        alert(`Error: ${err.message}`);
      }
    }
  };

  return (
    <section id="challenge" className="py-16 bg-black border-b border-[#222] relative overflow-hidden">
      <div className="max-w-4xl mx-auto text-center px-6">

        <div className="flex items-center justify-center gap-4 mb-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2" className="animate-pulse">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <h2 className="text-3xl font-cinzel text-white">The Navarasa Challenge</h2>
        </div>

        <p className="text-gray-400 mb-8">
          Think you can express? Test your acting skills with our AI Director.
        </p>

        {phase === "idle" && (
          <button
            onClick={openCamera}
            className="px-8 py-4 bg-[#FFD700] text-black font-bold uppercase tracking-widest hover:scale-105 transition-transform rounded shadow-[0_0_20px_rgba(255,215,0,0.3)]"
          >
            Check your Navarasa talent
          </button>
        )}

        {phase === "camera" && (
          <div className="relative bg-[#111] border-2 border-[#FFD700] rounded-lg p-3 max-w-lg mx-auto">
            <div className="text-center mb-2">
              <span className="text-[#FFD700] font-bold text-sm animate-pulse">
                ACT NOW: {targetEmotion}
              </span>
            </div>

            <div className="relative overflow-hidden rounded-lg bg-black" style={{ aspectRatio: "4/3" }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
                style={{ filter: "brightness(1.4) contrast(1.1)" }}
              />

              {!cameraReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <div className="text-center">
                    <div className="w-8 h-8 border-3 border-[#FFD700] border-t-transparent rounded-full animate-spin mx-auto mb-2" style={{ borderWidth: 3 }} />
                    <p className="text-[#FFD700] text-xs">Starting camera...</p>
                  </div>
                </div>
              )}

              {judging && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-[#FFD700] text-sm font-bold">{judgingMsg}</p>
                    <p className="text-gray-400 text-xs mt-1">First analysis takes ~30-60s on free server</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-4 justify-center pb-1">
              <button
                onClick={stopChallenge}
                disabled={judging}
                className="px-4 py-2 border border-red-500 text-red-500 text-xs uppercase hover:bg-red-900 transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={judgeMe}
                disabled={judging || !cameraReady}
                className="px-6 py-2 bg-[#FFD700] text-black font-bold uppercase hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {judging ? "Judging..." : !cameraReady ? "Starting..." : "Judge Me"}
              </button>
            </div>

            {cameraReady && !judging && (
              <p className="text-xs text-gray-500 text-center pb-1">
                Center your face • Ensure good lighting • Then click Judge Me
              </p>
            )}
          </div>
        )}

        {phase === "result" && (
          <div className="relative bg-[#111] border-2 border-[#FFD700] rounded-lg p-8 max-w-lg mx-auto text-center">
            {comment === "__NOFACE__" ? (
              <>
                <div className="text-5xl mb-4">😶</div>
                <p className="text-white text-lg mb-2 font-bold">Face not detected</p>
                <p className="text-gray-400 text-sm mb-3">
                  Make sure your face is well-lit and centered. Move closer to the camera.
                </p>
                {debugInfo && (
                  <p className="text-xs text-gray-600 mb-4 break-all font-mono text-left bg-black/40 p-2 rounded">
                    Debug: {JSON.stringify(debugInfo)}
                  </p>
                )}
              </>
            ) : (
              <>
                <div
                  className="text-6xl font-black mb-4"
                  style={{ color: score >= 70 ? "#22c55e" : "#FFD700" }}
                >
                  {score}/100
                </div>
                <p className="text-xl text-white mb-6 italic">"{comment}"</p>
              </>
            )}
            <button
              onClick={openCamera}
              className="px-6 py-2 border border-[#FFD700] text-[#FFD700] uppercase hover:bg-[#FFD700] hover:text-black transition-colors"
            >
              Try Another Emotion
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
