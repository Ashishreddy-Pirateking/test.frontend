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

      <div className="z-10">
        <h2 className="text-[#FFD700] text-xl md:text-1xl tracking-[0.5em] mb-4 uppercase">
          Technology Dramatics Society
        </h2>
        <div className="group relative mb-5 h-[90px] md:h-[110px] flex items-center justify-center">
          <h1 className="text-7xl md:text-7xl font-cinzel font-black text-white glow-text transition-opacity duration-300 group-hover:opacity-0">
            PRASTHANAM
          </h1>
          <img
            src={logoImg}
            alt="ప్రస్థానం"
            className="pointer-events-none absolute w-[280px] md:w-[360px] h-auto opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        </div>
        <div className="mb-10 min-h-[96px] md:min-h-[110px] flex items-center justify-center">
          <p
            className={`text-xl md:text-3xl text-gray-300 font-playfair italic transition-all duration-500 ${
              isSliding ? "opacity-0 -translate-x-10" : "opacity-100 translate-x-0"
            }`}
          >
            "{dialogues[dialogueIndex]}" <br />
            <span className="text-sm not-italic font-sans text-gray-500 mt-2 block">(Drama is our Breath)</span>
          </p>
        </div>
        <a
          href="#about"
          className="inline-block px-8 py-4 border border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-black transition-all duration-300 font-bold tracking-widest uppercase"
        >
          Enter The Stage
        </a>
      </div>
    </section>
  );
}
