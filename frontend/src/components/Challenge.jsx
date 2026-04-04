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

const shuffled = (arr) => {
  const c = [...arr];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
};

const toCode = (label) => String(label || "").split(" ")[0].trim().toUpperCase();

// Exact comments from the spreadsheet — 10 bands per emotion
// Index 0 = 0-10, Index 1 = 11-20, ..., Index 9 = 91-100
const COMMENTS = {
  HASYA: [
    "Mokam endhuku ala pettav",                      // 0-10
    "Muthi meedha mekulu kottara",                   // 11-20
    "Endhuku pudutharo kuuda thelidhu",              // 21-30
    "Navvu bro koncham em kaadhu",                   // 31-40
    "Parledhu serials lo act cheyochu",              // 41-50
    "Okay Movies lo side character cheyochu",        // 51-60
    "Noiceeee",                                      // 61-70
    "Heroooooooo",                                   // 71-80
    "Koncham lo national award miss ayyindhi bro",   // 81-90
    "Attttt Kamal Hassan",                           // 91-100
  ],
  KARUNA: [
    "karuna chupinchali, kaamam kaadhu",
    "Nidra po analedhu, karuna chupinchamanam",
    "Kothi la pettav enti bro mokam",
    "Ni meedha evaraina karunisthe baagundu",
    "Parledhu, okay",
    "Noiceee, keep it up",
    "Acting ochu ayithe baane",
    "Mercy mercy mercy, ankara Mercy",
    "Anthe anthe ochesindhi, inkoncham",
    "Attttt Sai Baba",
  ],
  RAUDRA: [
    "Edsinatte undhi",
    "mokam sarey, kopam ekkada undhi",
    "Pilla bacha kopam idhi",
    "Pandu kothi la bale unnav bhaii",
    "kallu pedhaga chesthe kopam avvadhu nana",
    "Oopiri pilchuko lekapothe poye la unnav",
    "Eyyuuu anna",
    "Ammo bayam vesthundhi baboi",
    "Pedha actor eh",
    "Hey Arjun Reddy lo hero nuvve ga?",
  ],
  VEERA: [
    "Comedian la unnav",
    "Mokam enti ila undhi",
    "Enti ala chusthunav, ee score eh ekkuva peh",
    "Raju kaadhu kani, mantri ayithe okay",
    "Close, inkocham try cheyi",
    "Parledhu, okka chinna rajyam ivvochu",
    "Antha okay kaani edho missing king gaaru",
    "Abba abba em tejasuu bidda",
    "Meeru KGP Rajyam Prince ah?",
    "Raju Ekkada unna Raju eh",
  ],
  BHAYANAKA: [
    "Enthasepu inka act cheyadaniki",
    "Asalu baale",
    "abacha enti idhi bayame?",
    "Bayapettu analedhu, bayapadu annam",
    "Not bad, kaani inka bayam la ledhu",
    "Eyuuuu",
    "Baane bayapaduthunav",
    "Crush ni make-up lekunda chusava?",
    "Results annouce ayinattu unnayi, chaala bayapaduthunadu paapam",
    "Mana Main character Dhorikesar ayya",
  ],
  BIBHATSA: [
    "Nuvve disgusting ga unnav",
    "inkoncham pettochu ga expression",
    "inkoncham pettochu ga expression",
    "inkoncham pettochu ga expression",
    "Parledhu, okay",
    "Antha dharidranga undha?",
    "Em act chesthunav bro. Wah",
    "Yes idhi actor ki undalsina skill level",
    "Em chusav Mowa antha dhaarunanga",
    "Eyuuu actor",
  ],
  ADBHUTA: [
    "Chi",
    "Adbhutanga cheyi annam, asahyanga kaadhu",
    "idhi acting ah?",
    "Endhuku intha lazy ga unnav",
    "Koncham expression kuuda pettalsindhi",
    "Parledhu, okay",
    "Anni subjects pass ayipoyava",
    "Crush ni saree lo chusina moment",
    "Chaala Adbhutanga undhi Chowdharaa",
    "WOWwww Noiceee",
  ],
  SHANTA: [
    "Yukkkkk",
    "Shantanga ekkada unnav?",
    "Enti idhi peaceful ah?",
    "Asale baaledhu",
    "Idhi eh ekkuva peh",
    "Peace",
    "Wars ni aapesela unnav ga",
    "Ah chiru navvu chudu eyuuu",
    "Gandhi jayanti ni birthday roju eh na?",
    "Bhudhudi la bale shantanga unnav ayya",
  ],
  SHRINGARA: [
    "blehhh ewww",
    "Enti idhi, ah maaku enti idhi antunna",
    "Chi",
    "kastame bro ila ayithe partner raavadam",
    "Ela padutharu anukuntunav ila evarraina",
    "Ayya baboiiii siguuuu ehhhhh",
    "ey ey eyyyyyyy",
    "Edho anukunamu kaani andi, maamulu vaaru kaadhandi",
    "Ahaaaannnn",
    "Rasikudive",
  ],
};

// Get comment by score band: 0-10 → index 0, 11-20 → index 1, ..., 91-100 → index 9
const getComment = (code, score) => {
  const bank = COMMENTS[code] || COMMENTS.HASYA;
  const index = score >= 91 ? 9 : Math.floor(score / 10);
  return bank[Math.min(9, Math.max(0, index))];
};

// Detailed emotion descriptions so Groq knows exactly what to look for
const EMOTION_DESCRIPTIONS = {
  SHRINGARA: "love, beauty, romance — soft dreamy eyes, gentle smile, warm admiring or seductive look",
  RAUDRA: "fury, rage, intense anger — deeply furrowed brows, clenched jaw, flared nostrils, fierce blazing eyes",
  HASYA: "laughter, joy, amusement — wide open smile, teeth showing, squinting happy eyes, cheeks raised",
  KARUNA: "sorrow, compassion, deep sadness — drooping eyelids, downturned mouth, quivering lips, grief-stricken look",
  BHAYANAKA: "terror, extreme fear — very wide eyes, raised brows, open mouth, frozen or shocked expression",
  BIBHATSA: "disgust, revulsion — strongly wrinkled nose, curled upper lip, squinted eyes, repulsed face pulled back",
  SHANTA: "peace, calm, serenity — completely relaxed face, soft gentle eyes, no tension, neutral or very slight smile",
  VEERA: "heroism, courage, bold confidence — strong set jaw, determined eyes, chin raised, proud commanding expression",
  ADBHUTA: "wonder, astonishment, awe — raised brows, very wide eyes, open mouth in O-shape, visibly amazed",
};

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Capture frame — un-mirror for AI, brighten for low-light rooms
const captureFrame = (videoEl) => {
  const sw = videoEl.videoWidth;
  const sh = videoEl.videoHeight;
  const scale = Math.min(1, 480 / Math.max(sw, sh));
  const w = Math.max(1, Math.round(sw * scale));
  const h = Math.max(1, Math.round(sh * scale));

  const c1 = document.createElement("canvas");
  c1.width = w; c1.height = h;
  const ctx1 = c1.getContext("2d");
  ctx1.translate(w, 0);
  ctx1.scale(-1, 1);
  ctx1.drawImage(videoEl, 0, 0, w, h);

  const c2 = document.createElement("canvas");
  c2.width = w; c2.height = h;
  const ctx2 = c2.getContext("2d");
  ctx2.filter = "brightness(1.4) contrast(1.2)";
  ctx2.drawImage(c1, 0, 0);

  return c2.toDataURL("image/jpeg", 0.85);
};

const judgeExpressionWithGroq = async (imageDataUrl, targetEmotionCode) => {
  const description = EMOTION_DESCRIPTIONS[targetEmotionCode] || targetEmotionCode;
  const base64Image = imageDataUrl.split(",")[1];

  const prompt = `You are a precise acting judge for the Indian classical Navarasa (nine emotions) challenge.

The person was asked to perform: ${targetEmotionCode}
What ${targetEmotionCode} looks like: ${description}

TASK: Examine their facial expression and score how well they performed ${targetEmotionCode}.

SCORING GUIDE (be accurate — not too harsh, not too generous):
- 25-35: They tried but barely any expression visible, or completely wrong emotion
- 36-50: Recognizable attempt but weak and unconvincing
- 51-65: Decent — clearly trying the right emotion, somewhat convincing
- 66-80: Good performance — emotion is clearly visible and convincing
- 81-90: Very strong — impressive expressive performance
- 91-100: Exceptional — could fool a casting director

KEY RULES:
- Minimum score is 25. Everyone gets credit for showing up.
- If they're doing a clearly DIFFERENT emotion (e.g. smiling when asked for anger), give 25-35.
- A plain neutral face with no expression for any emotion = 25-30.
- A genuinely strong matching expression = 70+. Don't lowball good performances.
- Be honest and calibrated. Think like a film director, not a cheerleader.

Respond ONLY with valid JSON (no markdown, no explanation outside the JSON):
{"score": 72, "detected": "HASYA", "matched": true, "reason": "Clear wide smile with raised cheeks, very convincing laughter"}

"detected": what emotion you actually see — one of: SHRINGARA, RAUDRA, HASYA, KARUNA, BHAYANAKA, BIBHATSA, SHANTA, VEERA, ADBHUTA, or NEUTRAL
"matched": true only if detected reasonably matches ${targetEmotionCode}`;

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      max_tokens: 200,
      temperature: 0.3,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` },
            },
            { type: "text", text: prompt },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content?.trim() || "";
  const cleaned = rawText.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);

  // Hard enforce minimum of 25
  const finalScore = Math.min(100, Math.max(25, Math.round(Number(parsed.score) || 25)));

  return {
    score: finalScore,
    detected: String(parsed.detected || "NEUTRAL").toUpperCase(),
    matched: Boolean(parsed.matched),
    reason: String(parsed.reason || ""),
  };
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
  const [resultData, setResultData] = useState(null);

  useEffect(() => {
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
    setResultData(null);
    setPhase("camera");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current
            .play()
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
      alert("Camera not ready yet. Wait a moment and try again.");
      return;
    }

    if (!GROQ_API_KEY) {
      alert("Groq API key not set. Add VITE_GROQ_API_KEY to your Vercel environment variables.");
      return;
    }

    const imageData = captureFrame(v);
    const required = toCode(targetEmotion);

    setJudging(true);
    setJudgingMsg("Capturing your expression...");

    const t1 = setTimeout(() => setJudgingMsg("Sending to AI judge..."), 1000);
    const t2 = setTimeout(() => setJudgingMsg("AI is analyzing your face..."), 3000);
    const t3 = setTimeout(() => setJudgingMsg("Almost done..."), 7000);

    try {
      const result = await judgeExpressionWithGroq(imageData, required);
      [t1, t2, t3].forEach(clearTimeout);

      stopStream();
      setJudging(false);
      setScore(result.score);
      setComment(getComment(required, result.score));
      setResultData(result);
      setPhase("result");
    } catch (err) {
      [t1, t2, t3].forEach(clearTimeout);
      setJudging(false);
      console.error("Groq error:", err);

      if (err.message?.includes("401")) {
        alert("Invalid Groq API key. Check your VITE_GROQ_API_KEY in Vercel.");
      } else if (err.message?.includes("429")) {
        alert("Rate limit hit. Wait a few seconds and try again.");
      } else {
        alert(`Judgment failed: ${err.message}`);
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
                    <div
                      className="rounded-full animate-spin mx-auto mb-2 border-[#FFD700]"
                      style={{ width: 32, height: 32, borderWidth: 3, borderStyle: "solid", borderTopColor: "transparent" }}
                    />
                    <p className="text-[#FFD700] text-xs">Starting camera...</p>
                  </div>
                </div>
              )}

              {judging && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-[#FFD700] text-sm font-bold">{judgingMsg}</p>
                    <p className="text-gray-400 text-xs mt-1">Powered by Groq AI — results in seconds</p>
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
            <div
              className="text-6xl font-black mb-4"
              style={{ color: score >= 70 ? "#22c55e" : score >= 45 ? "#FFD700" : "#ef4444" }}
            >
              {score}/100
            </div>

            <p className="text-xl text-white mb-4 italic">"{comment}"</p>

            {resultData && (
              <div className="mb-6 text-xs text-gray-500 space-y-1">
                <p>
                  Asked:{" "}
                  <span className="text-[#FFD700]">{toCode(targetEmotion)}</span>
                  {" · "}
                  Detected:{" "}
                  <span className={resultData.matched ? "text-green-400" : "text-red-400"}>
                    {resultData.detected}
                  </span>
                  {" · "}
                  {resultData.matched ? "✓ Matched" : "✗ No match"}
                </p>
                {resultData.reason && (
                  <p className="text-gray-600 italic">"{resultData.reason}"</p>
                )}
              </div>
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
