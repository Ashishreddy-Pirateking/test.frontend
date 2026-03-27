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

const AI_URL = import.meta.env.VITE_AI_API_URL || "https://navarasa-ai-api.onrender.com/predict";

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

export default function Challenge() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const deckRef = useRef([]);

  const [phase, setPhase] = useState("idle");
  const [targetEmotion, setTargetEmotion] = useState("...");
  const [judging, setJudging] = useState(false);
  const [judgingText, setJudgingText] = useState("Analyzing...");
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("...");

  useEffect(() => () => stopStream(), []);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const getNextEmotion = () => {
    if (!deckRef.current.length) deckRef.current = shuffled(EMOTIONS_LIST);
    return deckRef.current.pop() || EMOTIONS_LIST[0];
  };

  const openCamera = async () => {
    try {
      stopStream();
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setTargetEmotion(getNextEmotion());
      setJudging(false);
      setPhase("camera");
    } catch {
      alert("Camera access denied. Please allow camera permissions.");
    }
  };

  const stopChallenge = () => {
    stopStream();
    setPhase("idle");
    setJudging(false);
  };

  const judgeMe = async () => {
    if (judging) return;
    const v = videoRef.current;
    if (!v || v.readyState < 2) { alert("Camera not ready yet."); return; }

    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    canvas.getContext("2d").drawImage(v, 0, 0);
    const imageData = canvas.toDataURL("image/jpeg", 0.85);

    const required = toCode(targetEmotion);
    setJudging(true);
    setJudgingText("Analyzing your expression...");

    try {
      const resp = await fetch(AI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData, targetEmotion: required }),
      });

      if (!resp.ok) {
        throw new Error(`API error: ${resp.status}`);
      }

      const data = await resp.json();
      const emotion = String(data.emotion || "").toUpperCase();

      if (!emotion || emotion === "NO_FACE" || emotion === "ERROR") {
        stopStream();
        setScore(0);
        setComment("Face not detected. Better lighting + face centered.");
        setPhase("result");
        setJudging(false);
        return;
      }

      const targetConf = Number(data.target_confidence || 0);
      const dominantIsTarget = emotion === required;
      const matchBonus = dominantIsTarget ? 20 : 0;
      let finalScore = Math.round(
        Math.min(100, Math.max(0, targetConf * 100 * 0.8 + matchBonus))
      );

      stopStream();
      setScore(finalScore);
      setComment(getComment(required, finalScore));
      setPhase("result");
      setJudging(false);

    } catch (err) {
      setJudging(false);
      alert(`Could not reach AI server.\nError: ${err.message}\n\nThe AI server may be waking up (free tier). Try again in 30 seconds.`);
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
          <div className="relative bg-[#111] border-2 border-[#FFD700] rounded-lg p-2 max-w-lg mx-auto">
            <div className="absolute top-4 left-0 w-full text-center z-20 pointer-events-none">
              <span className="bg-black/70 px-4 py-1 rounded text-[#FFD700] font-bold text-sm animate-pulse">
                ACT NOW: {targetEmotion}
              </span>
            </div>

            <div className="relative overflow-hidden rounded-lg aspect-video bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
              {judging && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-[#FFD700] text-sm font-bold">{judgingText}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-4 justify-center pb-2">
              <button
                onClick={stopChallenge}
                disabled={judging}
                className="px-4 py-2 border border-red-500 text-red-500 text-xs uppercase hover:bg-red-900 transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={judgeMe}
                disabled={judging}
                className="px-6 py-2 bg-[#FFD700] text-black font-bold uppercase hover:bg-white transition-colors disabled:opacity-40"
              >
                {judging ? "Judging..." : "Judge Me"}
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center pb-2">
              Make your expression, then click Judge Me
            </p>
          </div>
        )}

        {phase === "result" && (
          <div className="relative bg-[#111] border-2 border-[#FFD700] rounded-lg p-8 max-w-lg mx-auto text-center">
            <div
              className="text-6xl font-black mb-4"
              style={{ color: score >= 70 ? "#22c55e" : "#FFD700" }}
            >
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
