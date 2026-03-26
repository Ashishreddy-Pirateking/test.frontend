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

const AI_PREDICT_URLS = [
  import.meta.env.VITE_AI_API_URL,
  "http://127.0.0.1:5001/predict",
  "http://localhost:5001/predict",
].filter(Boolean);
const SCAN_DURATION_MS = 2200;
const FRAME_INTERVAL_MS = 260;
const EARLY_STOP_AFTER_MS = 1200;
const EARLY_STOP_MIN_SAMPLES = 4;
const EARLY_STOP_TARGET_CONFIDENCE = 0.58;
const MIN_SCORE = 0;
const MIN_UP_DOWN_RATIO = 0.18;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const toEmotionCode = (label) => String(label || "").split(" ")[0].trim().toUpperCase();
const mean = (values) =>
  values.length ? values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length : 0;
const shuffled = (values) => {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const getScoreBandIndex = (score) => {
  const safeScore = clamp(Math.round(Number(score) || 0), 0, 100);
  if (safeScore <= 10) return 0;
  return clamp(Math.ceil((safeScore - 10) / 10), 1, 9);
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

const getFeedbackComment = (emotionCode, score) => {
  const bank = NAVARASA_COMMENTS[emotionCode] || NAVARASA_COMMENTS['HASYA'];
  const thresholds = [91,81,71,61,51,41,31,21,11,0];
  for (const t of thresholds) {
    if (score >= t) return bank[t];
  }
  return bank[0];
};

const postPredict = async (payload) => {
  let lastError = null;
  for (const url of AI_PREDICT_URLS) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = await response.text();
        throw new Error(`HTTP ${response.status} at ${url}${body ? `: ${body.slice(0, 120)}` : ""}`);
      }
      const data = await response.json();
      return { data, url };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("All AI endpoints failed.");
};

const EMOTION_CALIBRATION = {
  HASYA: { low: 0.20, high: 0.64 },
  KARUNA: { low: 0.21, high: 0.65 },
  RAUDRA: { low: 0.24, high: 0.70 },
  VEERA: { low: 0.22, high: 0.67 },
  BHAYANAKA: { low: 0.24, high: 0.69 },
  BIBHATSA: { low: 0.26, high: 0.72 },
  ADBHUTA: { low: 0.22, high: 0.66 },
  SHANTA: { low: 0.19, high: 0.61 },
  SHRINGARA: { low: 0.25, high: 0.71 },
  DEFAULT: { low: 0.22, high: 0.67 },
};

const normalizeByCalibration = (value, code) => {
  const cfg = EMOTION_CALIBRATION[code] || EMOTION_CALIBRATION.DEFAULT;
  const span = Math.max(0.01, cfg.high - cfg.low);
  return clamp((Number(value) - cfg.low) / span, 0, 1);
};

export default function Challenge() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const emotionDeckRef = useRef([]);
  const lastEmotionRef = useRef("");

  const [phase, setPhase] = useState("idle");
  const [targetEmotion, setTargetEmotion] = useState("...");
  const [scanActive, setScanActive] = useState(false);
  const [scanText, setScanText] = useState("Hold still, scan in progress...");
  const [scanProgress, setScanProgress] = useState(0);
  const [scanBoxes, setScanBoxes] = useState({ eyeL: false, eyeR: false, mouth: false });
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("...");
  const [faceBox, setFaceBox] = useState(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const getNextEmotion = () => {
    if (!emotionDeckRef.current.length) {
      emotionDeckRef.current = shuffled(EMOTIONS_LIST);
      if (
        emotionDeckRef.current.length > 1 &&
        emotionDeckRef.current[emotionDeckRef.current.length - 1] === lastEmotionRef.current
      ) {
        const swapIndex = Math.floor(Math.random() * (emotionDeckRef.current.length - 1));
        const lastIdx = emotionDeckRef.current.length - 1;
        [emotionDeckRef.current[lastIdx], emotionDeckRef.current[swapIndex]] = [
          emotionDeckRef.current[swapIndex],
          emotionDeckRef.current[lastIdx],
        ];
      }
    }
    const next = emotionDeckRef.current.pop() || EMOTIONS_LIST[0];
    lastEmotionRef.current = next;
    return next;
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      streamRef.current = stream;

      const emotion = getNextEmotion();

      setTargetEmotion(emotion);
      setPhase("camera");
      setScanActive(false);
      setScanProgress(0);
      setFaceBox(null);
      setScanText("Hold still, scan in progress...");
      setScanBoxes({ eyeL: false, eyeR: false, mouth: false });

    } catch (err) {
      alert("Camera access denied. Please allow permissions.");
    }
  };

  const releaseCamera = () => {
    if (!streamRef.current) return;
    streamRef.current.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const stopChallenge = () => {
    releaseCamera();
    setPhase("idle");
    setScanActive(false);
    setScanProgress(0);
    setScanBoxes({ eyeL: false, eyeR: false, mouth: false });
    setFaceBox(null);
  };

  const captureFrame = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return "";
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.92);
  };

  const summarizeScan = (samples, requiredEmotion, faceYValues, faceHeights, frameCount) => {
    const votes = {};
    let hitCount = 0;

    samples.forEach((sample) => {
      const emotion = String(sample.emotion || "").toUpperCase();
      votes[emotion] = (votes[emotion] || 0) + 1;
      if (emotion === requiredEmotion) hitCount += 1;
    });

    const voteEntries = Object.entries(votes).sort((a, b) => b[1] - a[1]);
    const dominantEmotion =
      voteEntries[0]?.[0] ||
      String(samples[0]?.emotion || "").toUpperCase();
    const dominantVoteCount = voteEntries[0]?.[1] || 0;
    const stability = samples.length ? dominantVoteCount / samples.length : 0;
    const matchRatio = samples.length ? hitCount / samples.length : 0;

    const avgCalibrated = mean(samples.map((sample) => sample.confidence));
    const avgRaw = mean(samples.map((sample) => sample.raw_confidence));
    const avgTarget = mean(samples.map((sample) => sample.target_confidence));
    const avgTargetRaw = mean(samples.map((sample) => sample.target_raw_confidence));
    const avgMargin = mean(samples.map((sample) => sample.margin));
    const avgFaceQuality = mean(samples.map((sample) => sample.face_quality));
    const avgTargetGap = mean(samples.map((sample) => sample.target_gap));
    const avgTargetRank = mean(samples.map((sample) => sample.target_rank));
    const detectionCoverage = clamp(samples.length / Math.max(1, frameCount), 0, 1);
    const avgFaceHeight = faceHeights.length
      ? faceHeights.reduce((sum, value) => sum + value, 0) / faceHeights.length
      : 1;
    const yRange = faceYValues.length > 1 ? Math.max(...faceYValues) - Math.min(...faceYValues) : 0;
    const motionRatio = avgFaceHeight > 0 ? yRange / avgFaceHeight : 0;
    const motionScore = clamp(motionRatio / MIN_UP_DOWN_RATIO, 0, 1);

    const dominantIsTarget = dominantEmotion === requiredEmotion;
    const targetSignal = clamp(0.58 * avgTarget + 0.42 * avgTargetRaw, 0, 1);
    const consistencySignal = clamp(0.65 * matchRatio + 0.35 * stability, 0, 1);
    const qualitySignal = clamp(0.55 * avgFaceQuality + 0.45 * motionScore, 0, 1);
    const certaintySignal = clamp(0.70 * avgCalibrated + 0.30 * avgMargin, 0, 1);
    const normalizedTarget = normalizeByCalibration(targetSignal, requiredEmotion);
    const rankSignal = clamp((10 - avgTargetRank) / 9, 0, 1);
    const gapSignal = 1 - clamp(avgTargetGap, 0, 1);
    const nearHitSignal = clamp(0.55 * rankSignal + 0.45 * gapSignal, 0, 1);
    const targetStrength = clamp(
      0.62 * normalizedTarget + 0.23 * gapSignal + 0.15 * rankSignal,
      0,
      1
    );

    let baseSignal = clamp(
      0.38 * targetStrength +
        0.22 * consistencySignal +
        0.12 * certaintySignal +
        0.12 * qualitySignal +
        0.08 * detectionCoverage +
        0.08 * nearHitSignal,
      0,
      1
    );

    if (!dominantIsTarget) {
      baseSignal = clamp(baseSignal - (1 - matchRatio) * 0.08, 0, 1);
    }

    let score01 = dominantIsTarget
      ? clamp(0.28 + 0.72 * Math.pow(baseSignal, 0.56), 0, 1)
      : clamp(0.12 + 0.62 * Math.pow(baseSignal, 0.90) + 0.12 * nearHitSignal, 0, 1);

    if (detectionCoverage < 0.20) {
      score01 = Math.min(score01, 0.35);
    }
    if (dominantIsTarget && consistencySignal >= 0.75 && targetStrength >= 0.72) {
      score01 = Math.max(score01, 0.88);
    }

    let finalScore = Math.round(clamp(score01, 0, 1) * 100);
    if (dominantIsTarget && detectionCoverage >= 0.50) {
      finalScore = Math.max(finalScore, 52);
    }
    if (!dominantIsTarget && avgTargetRank <= 3 && detectionCoverage >= 0.55) {
      finalScore = Math.max(finalScore, 35);
    }
    if (targetStrength <= 0.08 && avgTargetRank > 6) {
      finalScore = Math.min(finalScore, 26);
    }
    finalScore = clamp(finalScore, MIN_SCORE, 100);

    return {
      dominantEmotion,
      matchRatio,
      stability,
      avgCalibrated,
      avgRaw,
      avgTarget,
      avgFaceQuality,
      consistencySignal,
      targetSignal,
      nearHitSignal,
      targetStrength,
      detectionCoverage,
      motionRatio,
      finalScore,
    };
  };

  const analyzePhoto = async () => {
    if (!videoRef.current || scanActive) return;
    if (videoRef.current.readyState < 2) {
      alert("Camera is not ready yet. Please wait a second and try again.");
      return;
    }

    setScanActive(true);
    setScanProgress(0);
    setScanBoxes({ eyeL: false, eyeR: false, mouth: false });
    setScanText("Scanning... hold expression steady.");

    try {
      const required = toEmotionCode(targetEmotion);
      const frameCount = Math.max(1, Math.ceil(SCAN_DURATION_MS / FRAME_INTERVAL_MS));
      const samples = [];
      const faceYValues = [];
      const faceHeights = [];
      const scanStart = Date.now();
      let consecutiveStrongTargetFrames = 0;

      for (let i = 0; i < frameCount; i += 1) {
        const imageData = captureFrame();
        if (!imageData) {
          if (i < frameCount - 1) await sleep(FRAME_INTERVAL_MS);
          continue;
        }

        const { data } = await postPredict({
          image: imageData,
          targetEmotion: required,
          fast: true,
        });

        if (data.face_box) {
          setFaceBox(data.face_box);
          faceYValues.push(Number(data.face_box.y || 0));
          faceHeights.push(Number(data.face_box.h || 1));
        }
        if (data.emotion && data.emotion !== "NO_FACE" && data.emotion !== "ERROR") {
          samples.push(data);
        }
        if (
          String(data.emotion || "").toUpperCase() === required &&
          Number(data.target_confidence || 0) >= EARLY_STOP_TARGET_CONFIDENCE
        ) {
          consecutiveStrongTargetFrames += 1;
        } else {
          consecutiveStrongTargetFrames = 0;
        }

        const elapsed = Date.now() - scanStart;
        const progress = clamp(elapsed / SCAN_DURATION_MS, 0, 1);
        const secondsLeft = Math.max(0, Math.ceil((SCAN_DURATION_MS - elapsed) / 1000));
        setScanProgress(progress);
        setScanText(
          secondsLeft > 0
            ? `Scanning... ${secondsLeft}s left.`
            : "Finalizing result..."
        );
        setScanBoxes({
          eyeL: progress >= 0.25,
          eyeR: progress >= 0.55,
          mouth: progress >= 0.85,
        });

        if (
          elapsed >= EARLY_STOP_AFTER_MS &&
          samples.length >= EARLY_STOP_MIN_SAMPLES &&
          consecutiveStrongTargetFrames >= 2
        ) {
          break;
        }

        if (i < frameCount - 1) await sleep(FRAME_INTERVAL_MS);
      }

      const elapsed = Date.now() - scanStart;
      if (elapsed < SCAN_DURATION_MS) {
        await sleep(SCAN_DURATION_MS - elapsed);
      }

      if (!samples.length) {
        setScore(0);
        setComment("Face not detected clearly. Use brighter light and keep face centered for full scan.");
        setPhase("result");
        setScanActive(false);
        releaseCamera();
        return;
      }

      const summary = summarizeScan(samples, required, faceYValues, faceHeights, frameCount);
      const finalScore = summary.finalScore;
      const feedback = getFeedbackComment(required, finalScore);
      const qualityLine =
        summary.detectionCoverage >= 0.55
          ? "Tracking quality strong."
          : "Hold steady in frame for better tracking.";
      const finalComment =
        `${feedback} ` +
        `(Target match ${Math.round(summary.matchRatio * 100)}%, ` +
        `target strength ${Math.round(summary.targetStrength * 100)}%, ` +
        `consistency ${Math.round(summary.consistencySignal * 100)}%). ` +
        `${qualityLine}`;

      setScore(finalScore);
      setComment(finalComment);

      setPhase("result");
      setScanActive(false);
      releaseCamera();

    } catch (error) {
      const detail = String(error?.message || "").slice(0, 160);
      alert(
        `AI server not running or unreachable.\n` +
          `Tried: ${AI_PREDICT_URLS.join(" , ")}\n` +
          `${detail ? `Error: ${detail}` : ""}`
      );
      setScanActive(false);
      setScanProgress(0);
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
          <div id="challengeStart">
            <button
              className="px-8 py-4 bg-[#FFD700] text-black hover:scale-105 transition-transform rounded shadow-[0_0_20px_rgba(255,215,0,0.3)]"
              style={{ fontFamily: "'Eagle Lake', cursive" }}
              onClick={openCamera}
            >
              Test your talent
            </button>
          </div>
        )}

        <div
          className={`${phase === "idle" ? "hidden" : ""} relative bg-[#111] border-2 border-[#FFD700] rounded-lg p-2 max-w-lg mx-auto`}
        >
          <div className={`${phase === "camera" ? "" : "hidden"} relative`}>
            <div className="absolute top-4 left-0 w-full text-center z-20">
              <span className="bg-black/70 px-4 py-1 rounded text-[#FFD700] font-bold animate-pulse">
                ACT NOW: {targetEmotion}
              </span>
            </div>

            <div className="relative overflow-hidden rounded-lg aspect-video bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />

              {faceBox && videoRef.current && (() => {
                const video = videoRef.current;
                const scaleX = video.clientWidth / video.videoWidth;
                const scaleY = video.clientHeight / video.videoHeight;

                return (
                  <div
                    style={{
                      position: "absolute",
                      border: "3px solid #22c55e",
                      left: `${faceBox.x * scaleX}px`,
                      top: `${faceBox.y * scaleY}px`,
                      width: `${faceBox.w * scaleX}px`,
                      height: `${faceBox.h * scaleY}px`,
                      pointerEvents: "none"
                    }}
                  />
                );
              })()}

              <div className={`${scanActive ? "" : "hidden"} absolute inset-0 z-10`}>
                <div className="scanner-line" style={{ animationDuration: "3s" }}></div>
              </div>
            </div>

            <div className={`${scanActive ? "" : "hidden"} mt-3 text-xs text-[#a4f4c5] uppercase tracking-[0.09em]`}>
              {scanText}
            </div>
            <div className={`${scanActive ? "mt-2 h-1.5 w-full bg-white/10 rounded-full overflow-hidden" : "hidden"}`}>
              <div
                className="h-full bg-gradient-to-r from-[#22c55e] to-[#FFD700] transition-all duration-300"
                style={{ width: `${Math.round(scanProgress * 100)}%` }}
              />
            </div>
            <div className={`${scanActive ? "mt-2 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em]" : "hidden"}`}>
              <span className={`px-2 py-1 rounded border ${scanBoxes.eyeL ? "border-[#22c55e] text-[#9cf7bb]" : "border-white/15 text-gray-500"}`}>Eye L</span>
              <span className={`px-2 py-1 rounded border ${scanBoxes.eyeR ? "border-[#22c55e] text-[#9cf7bb]" : "border-white/15 text-gray-500"}`}>Eye R</span>
              <span className={`px-2 py-1 rounded border ${scanBoxes.mouth ? "border-[#22c55e] text-[#9cf7bb]" : "border-white/15 text-gray-500"}`}>Mouth</span>
            </div>

            <div className="mt-4 flex gap-4 justify-center pb-2">
              <button
                className="px-4 py-2 border border-red-500 text-red-500 text-xs uppercase hover:bg-red-900 transition-colors"
                onClick={stopChallenge}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 bg-[#FFD700] text-black font-bold uppercase hover:bg-white transition-colors"
                onClick={analyzePhoto}
                disabled={scanActive}
              >
                {scanActive ? "Scanning..." : "Judge Me"}
              </button>
            </div>
          </div>

          <div className={`${phase === "result" ? "" : "hidden"} p-8 text-center`}>
            <div
              className="text-6xl font-black mb-4"
              style={{ color: score > 80 ? "#22c55e" : "#FFD700" }}
            >
              {score}/100
            </div>
            <p className="text-xl text-white font-playfair mb-6 italic">
              "{comment}"
            </p>
            <button
              className="px-6 py-2 border border-[#FFD700] text-[#FFD700] uppercase hover:bg-[#FFD700] hover:text-black transition-colors"
              onClick={openCamera}
            >
              Try Another Emotion
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
