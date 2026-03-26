import { useEffect, useState } from "react";
import stageImg from "../Legacy/stage.jpg";
import logoImg from "../Legacy/logo.png";

export default function Hero() {
  const dialogues = [
    "ఒక్కసారి కమిట్ అయితే నా మాట నేనే వినను",
    "ఎవడు కొడితే దిమ్మ దిరిగి మైండ్ బ్లాక్ అవుద్దో ఆడే పండుగాడు",
    "నాకు కొంచెం తిక్కుంది...దానికి ఓ లెక్కుంది",
    "చూడు...ఒక వైపే చూడూ...రెండో వైపు చూడాలనుకోకు...తట్టుకోలేవ్...మాడిపోతావ్",
    "అరిస్తే తరుస్తా...తరిస్తే కరుస్తా...కరిస్తే నిన్ను కూడా బొక్కలో ఏస్తా కబడ్దార్",
    "కత్తి వాడటం మొదలు పెడితే నాకన్నా బాగా ఎవరూ వాడలేరు",
    "ఒక్కొక్కన్ని కాదు షేర్ ఖాన్...ఒకేసారి వంద మందిని పంపు. లెక్క ఎక్కువైనా ఫర్వాలేదు, తక్కువ కాకుండా చూసుకో",
    "వీర శంకర్ రెడ్డి....మొక్కే కదా అని పీకేస్తే పీక కోస్తా",
  ];

  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsSliding(true);
      setTimeout(() => {
        setDialogueIndex((prev) => (prev + 1) % dialogues.length);
        setIsSliding(false);
      }, 420);
    }, 4000);

    return () => clearInterval(intervalId);
  }, [dialogues.length]);

  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-4 overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-100">
        <img src={stageImg} className="w-full h-full object-cover hero-zoom" alt="Stage" />
      </div>

      <div className="z-10 w-full max-w-5xl mx-auto px-2">
        <h2 className="text-white text-[20px] md:text-[24px] font-['Birthstone'] -mb-2 md:-mb-4 leading-none relative z-20 capitalize tracking-wider drop-shadow-md">
          Technology Dramatics Society
        </h2>
        <div className="group relative mb-4 md:mb-6 flex flex-col items-center justify-start min-h-[200px] md:min-h-[220px]">
          <h1 className="text-[64px] md:text-[140px] leading-none font-['Bangers'] text-[#FFD700] glow-text transition-opacity duration-300 md:group-hover:opacity-0 drop-shadow-[0_0_15px_rgba(255,215,0,0.4)] tracking-wide">
            Prasthanam
          </h1>
          <h1
            className="mt-2 text-[56px] leading-[0.88] text-[#FFD700] opacity-100 transition-opacity duration-300 drop-shadow-[0_0_20px_rgba(255,215,0,0.7)] whitespace-nowrap md:absolute md:top-3 md:mt-0 md:text-[116px] md:leading-[0.9] md:opacity-0 md:group-hover:opacity-100"
            style={{ fontFamily: "'Gurajada', serif" }}
          >
            ప్రస్థానం
          </h1>
        </div>
        <div className="mb-10 min-h-[100px] md:min-h-[110px] flex items-center justify-center">
          <p
            className={`text-xl md:text-4xl text-gray-200 font-['NTR'] leading-relaxed transition-all duration-500 ${
              isSliding ? "opacity-0 -translate-x-10" : "opacity-100 translate-x-0"
            }`}
          >
            "{dialogues[dialogueIndex]}" <br />
            <span className="text-xs md:text-sm not-italic font-sans text-gray-500 mt-2 block">(Drama is our Breath)</span>
          </p>
        </div>
        <a
          href="#about"
          className="inline-block w-full md:w-auto px-8 py-4 border border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-black transition-all duration-300 font-bold font-['Asimovian'] tracking-widest uppercase"
        >
          Enter The Stage
        </a>
      </div>
    </section>
  );
}
