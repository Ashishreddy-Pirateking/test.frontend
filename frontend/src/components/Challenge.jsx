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

// Nudge ranges for MATCHED emotion, attempt 4+
// Varied — not always climbing, feels natural
const MATCHED_NUDGE_RANGES = [
  [60, 70],  // attempt 4
  [50, 62],  // attempt 5
  [70, 80],  // attempt 6
  [55, 67],  // attempt 7
  [73, 83],  // attempt 8
  [62, 72],  // attempt 9
  [78, 88],  // attempt 10
  [65, 75],  // attempt 11+ cycles
];

// Nudge ranges for MISMATCHED emotion — alternates low/high naturally
// Never feels stuck, never feels rewarded — just unpredictable enough
const MISMATCH_NUDGE_RANGES = [
  [28, 38],  // attempt 1 — low
  [42, 50],  // attempt 2 — medium
  [30, 40],  // attempt 3 — low
  [44, 52],  // attempt 4 — medium
  [25, 35],  // attempt 5 — low
  [40, 48],  // attempt 6 — medium
  [32, 42],  // attempt 7 — low-medium
  [44, 54],  // attempt 8 — medium
];

/**
 * Apply scoring nudge based on attempt number and whether emotion matched.
 *
 * MATCHED:
 *   - Attempts 1-3: real AI score
 *   - Attempt 4+: cycle through MATCHED_NUDGE_RANGES (encouraging, varied)
 *
 * MISMATCHED:
 *   - ALL attempts: cycle through MISMATCH_NUDGE_RANGES (low-high alternation)
 *   - Never above 54, never feels stuck at same number
 */
const applyAttemptNudge = (attemptNumber, rawScore, matched) => {
  if (!matched) {
    // Mismatch — always nudge into alternating low/high ranges
    const rangeIndex = (attemptNumber - 1) % MISMATCH_NUDGE_RANGES.length;
    const [min, max] = MISMATCH_NUDGE_RANGES[rangeIndex];
    // If real score already in range, use it (keeps it feeling genuine)
    if (rawScore >= min && rawScore <= max) return rawScore;
    return Math.round(min + Math.random() * (max - min));
  }

  // Matched — first 3 attempts use real AI score
  if (attemptNumber <= 3) return rawScore;

  // Matched — attempt 4+ use encouraging nudge ranges
  const rangeIndex = (attemptNumber - 4) % MATCHED_NUDGE_RANGES.length;
  const [min, max] = MATCHED_NUDGE_RANGES[rangeIndex];
  if (rawScore >= min && rawScore <= max) return rawScore;
  return Math.round(min + Math.random() * (max - min));
};

// Exact comments from spreadsheet — index 0=0-10, ..., index 9=91-100
const COMMENTS = {
  HASYA: [
    "Mokam endhuku ala pettav",
    "Muthi meedha mekulu kottara",
    "Endhuku pudutharo kuuda thelidhu",
    "Navvu bro koncham em kaadhu",
    "Parledhu serials lo act cheyochu",
    "Okay Movies lo side character cheyochu",
    "Noiceeee",
    "Heroooooooo",
    "Koncham lo national award miss ayyindhi bro",
    "Attttt Kamal Hassan",
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

const getComment = (code, score) => {
  const bank = COMMENTS[code] || COMMENTS.HASYA;
  const index = score >= 100 ? 9 : Math.floor(score / 10);
  return bank[Math.min(9, Math.max(0, index))];
};

const EMOTION_RUBRIC = {
  HASYA: {
    description: "Laughter / Joy — HASYA rasa",
    cues: [
      "Are the corners of the mouth pulled up and wide? (zygomatic major muscle)",
      "Are the cheeks raised and puffy?",
      "Are the eyes narrowed or squinting from the smile (Duchenne marker)?",
      "Are teeth visible?",
      "Is the overall face energetic and bright?",
    ],
    wrongSignals: "flat mouth, downturned lips, furrowed brows, blank stare",
  },
  KARUNA: {
    description: "Sorrow / Compassion — KARUNA rasa",
    cues: [
      "Are the inner corners of the eyebrows raised and drawn together (the grief brow)?",
      "Is the mouth corners turned downward?",
      "Are the eyelids heavy or drooping?",
      "Is there any trembling or tension around the lips?",
      "Does the overall face convey heaviness and sadness?",
    ],
    wrongSignals: "smiling, raised brows from surprise, wide eyes",
  },
  RAUDRA: {
    description: "Fury / Rage — RAUDRA rasa",
    cues: [
      "Are the brows deeply furrowed and pulled together (corrugator muscle)?",
      "Are the eyes glaring, intense, or wide with rage?",
      "Is the jaw clenched or teeth showing in anger?",
      "Are the nostrils flared?",
      "Is there visible tension in the face, neck, or forehead?",
    ],
    wrongSignals: "relaxed brows, smiling, fearful wide eyes",
  },
  VEERA: {
    description: "Heroism / Courage — VEERA rasa",
    cues: [
      "Is the chin slightly raised (pride and confidence)?",
      "Is the jaw set firmly and strong?",
      "Are the eyes determined and focused (not angry, not fearful)?",
      "Is the overall posture and face commanding and authoritative?",
      "Is there a sense of calm power — not aggression, but bold strength?",
    ],
    wrongSignals: "fear, anger, laughter, drooping posture",
  },
  BHAYANAKA: {
    description: "Terror / Fear — BHAYANAKA rasa",
    cues: [
      "Are the eyes wide open, showing whites above or below iris?",
      "Are the eyebrows raised high and drawn together?",
      "Is the mouth open or stretched in shock?",
      "Is there a frozen or paralysed quality to the face?",
      "Does the face look like someone just saw something terrifying?",
    ],
    wrongSignals: "smiling, angry brows, calm or neutral expression",
  },
  BIBHATSA: {
    description: "Disgust / Revulsion — BIBHATSA rasa",
    cues: [
      "Is the nose wrinkled (levator labii superioris alaeque nasi)?",
      "Is the upper lip curled or raised on one or both sides?",
      "Are the eyes narrowed or squinted with revulsion?",
      "Is the face pulled back or turned slightly away?",
      "Does the expression look like they smelled or saw something revolting?",
    ],
    wrongSignals: "open smile, wide eyes, neutral face",
  },
  SHANTA: {
    description: "Peace / Calm — SHANTA rasa",
    cues: [
      "Is the face completely relaxed with no muscle tension?",
      "Are the eyes soft, heavy-lidded, or gently closed?",
      "Is there a very slight or no smile — serene, not happy?",
      "Is the forehead smooth with no furrowing?",
      "Does the whole face radiate stillness and inner calm?",
    ],
    wrongSignals: "tense brows, wide eyes, big smile, anger",
  },
  ADBHUTA: {
    description: "Wonder / Amazement — ADBHUTA rasa",
    cues: [
      "Are the eyebrows raised high?",
      "Are the eyes wide open and bright?",
      "Is the mouth open in an O or dropped-jaw expression?",
      "Is there visible astonishment or being genuinely awestruck?",
      "Does the face look like they just witnessed something magical?",
    ],
    wrongSignals: "closed mouth, neutral brows, angry or disgusted look",
  },
  SHRINGARA: {
    description: "Love / Beauty / Romance — SHRINGARA rasa",
    cues: [
      "Are the eyes soft and warm, with a dreamy or admiring quality?",
      "Is there a gentle, subtle smile — not a big laugh, but warm?",
      "Is there a softness or glow to the whole face?",
      "Do the eyes look like they are gazing at someone they adore?",
      "Is there a romantic, tender, or seductive energy in the expression?",
    ],
    wrongSignals: "angry look, disgust, wide terror eyes, big open laughing mouth",
  },
};

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const captureFrame = (videoEl) => {
  const sw = videoEl.videoWidth;
  const sh = videoEl.videoHeight;
  const scale = Math.min(1, 512 / Math.max(sw, sh));
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
  ctx2.filter = "brightness(1.35) contrast(1.25) saturate(1.1)";
  ctx2.drawImage(c1, 0, 0);

  return c2.toDataURL("image/jpeg", 0.9);
};

const judgeExpressionWithGroq = async (imageDataUrl, targetEmotionCode) => {
  const rubric = EMOTION_RUBRIC[targetEmotionCode];
  const base64Image = imageDataUrl.split(",")[1];
  const cueList = rubric.cues.map((c, i) => `  Cue ${i + 1}: ${c}`).join("\n");

  const prompt = `You are an expert acting coach and facial expression analyst judging a Navarasa (Indian classical nine emotions) challenge.

TARGET EMOTION: ${targetEmotionCode} — ${rubric.description}

YOUR JOB:
Look at this person's face and evaluate how well they are performing ${targetEmotionCode}.

STEP 1 — Evaluate each facial cue independently (score 0-10 each):
${cueList}

STEP 2 — Detect what emotion you actually see, and decide if it matches ${targetEmotionCode}.
Wrong signals for ${targetEmotionCode}: ${rubric.wrongSignals}
Set "matched" to true ONLY if the detected emotion genuinely matches ${targetEmotionCode}.
Be strict — a neutral face or a different emotion must have matched: false.

STEP 3 — Compute final score:
- Average your cue scores → multiply by 10 → base score (0-100)
- If strong wrong signals are present, subtract 15-25 points
- If the expression is genuinely convincing and natural, add 5-10 bonus
- Minimum final score is 25

IMPORTANT — accuracy rules:
- If "matched" is false, your finalScore should reflect what you see — NOT the target emotion quality
- If "matched" is true and expression is clearly visible, score 60-80 confidently
- Reserve 25-40 ONLY for truly blank, wrong, or non-existent expressions
- A genuine attempt with visible movement deserves at least 45-55

Respond ONLY with this exact JSON (no markdown, no extra text):
{"cueScores":[7,8,6,7,5],"wrongSignals":false,"bonus":5,"finalScore":72,"detected":"HASYA","matched":true,"reason":"Wide genuine smile, raised cheeks, eyes squinting — convincing HASYA"}

Rules:
- "cueScores": array of ${rubric.cues.length} integers 0-10
- "wrongSignals": true if they are clearly doing a different emotion
- "bonus": 0-10
- "finalScore": 25-100
- "detected": SHRINGARA/RAUDRA/HASYA/KARUNA/BHAYANAKA/BIBHATSA/SHANTA/VEERA/ADBHUTA/NEUTRAL
- "matched": true ONLY if detected emotion genuinely matches ${targetEmotionCode}`;

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      max_tokens: 300,
      temperature: 0.2,
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

  let computedScore = parsed.finalScore;
  if (Array.isArray(parsed.cueScores) && parsed.cueScores.length > 0) {
    const avgCue = parsed.cueScores.reduce((a, b) => a + Number(b), 0) / parsed.cueScores.length;
    const fromCues = Math.round(avgCue * 10);
    const bonus = Math.min(10, Math.max(0, Number(parsed.bonus) || 0));
    const wrongPenalty = parsed.wrongSignals ? 20 : 0;
    const cueComputed = Math.round(fromCues + bonus - wrongPenalty);
    computedScore = Math.round(parsed.finalScore * 0.7 + cueComputed * 0.3);
  }

  const rawScore = Math.min(100, Math.max(25, computedScore));

  return {
    rawScore,
    matched: Boolean(parsed.matched),
  };
};

export default function Challenge() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const deckRef = useRef([]);
  const attemptCountRef = useRef(0);

  const [phase, setPhase] = useState("idle");
  const [targetEmotion, setTargetEmotion] = useState("...");
  const [cameraReady, setCameraReady] = useState(false);
  const [judging, setJudging] = useState(false);
  const [judgingMsg, setJudgingMsg] = useState("AI is judging...");
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("...");

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

    attemptCountRef.current += 1;
    const thisAttempt = attemptCountRef.current;

    setJudging(true);
    setJudgingMsg("Capturing your expression...");

    const t1 = setTimeout(() => setJudgingMsg("AI is reading your face..."), 1200);
    const t2 = setTimeout(() => setJudgingMsg("Analyzing each facial cue..."), 3500);
    const t3 = setTimeout(() => setJudgingMsg("Computing your score..."), 7000);

    try {
      const result = await judgeExpressionWithGroq(imageData, required);
      [t1, t2, t3].forEach(clearTimeout);

      const finalScore = applyAttemptNudge(thisAttempt, result.rawScore, result.matched);

      stopStream();
      setJudging(false);
      setScore(finalScore);
      setComment(getComment(required, finalScore));
      setPhase("result");
    } catch (err) {
      [t1, t2, t3].forEach(clearTimeout);
      setJudging(false);
      attemptCountRef.current -= 1;
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

  const scoreColor =
    score >= 70 ? "#22c55e" : score >= 45 ? "#FFD700" : "#ef4444";

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
                      className="rounded-full animate-spin mx-auto mb-2"
                      style={{
                        width: 32, height: 32,
                        border: "3px solid #FFD700",
                        borderTopColor: "transparent",
                      }}
                    />
                    <p className="text-[#FFD700] text-xs">Starting camera...</p>
                  </div>
                </div>
              )}

              {judging && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/75 z-20">
                  <div className="text-center px-4">
                    <div
                      className="rounded-full animate-spin mx-auto mb-3"
                      style={{
                        width: 48, height: 48,
                        border: "4px solid #FFD700",
                        borderTopColor: "transparent",
                      }}
                    />
                    <p className="text-[#FFD700] text-sm font-bold">{judgingMsg}</p>
                    <p className="text-gray-400 text-xs mt-1">Groq AI — analyzing facial cues</p>
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
                Center your face • Good lighting • Exaggerate the emotion • Then click Judge Me
              </p>
            )}
          </div>
        )}

        {phase === "result" && (
          <div className="relative bg-[#111] border-2 border-[#FFD700] rounded-lg p-8 max-w-lg mx-auto text-center">
            <div className="text-6xl font-black mb-4" style={{ color: scoreColor }}>
              {score}/100
            </div>

            <p className="text-xl text-white mb-6 italic">"{comment}"</p>

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
