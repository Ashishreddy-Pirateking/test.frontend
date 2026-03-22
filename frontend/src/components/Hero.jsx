import { useEffect, useState } from "react";
import stageImg from "../Legacy/stage.jpg";

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
    <section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(5.5rem,calc(env(safe-area-inset-top)+4.25rem))] text-center">
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/70"
          aria-hidden
        />
        <img src={stageImg} className="h-full w-full object-cover hero-zoom" alt="Theatre stage in spotlight" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-2">
        <p className="mb-3 font-['Birthstone'] text-[clamp(1.05rem,3.8vw,1.55rem)] capitalize tracking-[0.2em] text-white/95 drop-shadow-md md:mb-2 md:-mb-6">
          Technology Dramatics Society
        </p>

        <div className="group relative mb-6 flex min-h-[7.5rem] flex-col items-center justify-center md:mb-8 md:h-[160px]">
          <h1 className="font-['Bangers'] leading-[0.95] tracking-wide text-[#FFD700] glow-text drop-shadow-[0_0_15px_rgba(255,215,0,0.4)] transition-opacity duration-300 text-[clamp(3.25rem,14vw,8.75rem)] md:group-hover:opacity-0">
            Prasthanam
          </h1>
          <h1 className="-mt-1 font-['Dhurjati'] leading-[0.9] tracking-wider text-[#FFD700] drop-shadow-[0_0_20px_rgba(255,215,0,0.7)] text-[clamp(2.6rem,12vw,9.375rem)] transition-opacity duration-300 md:absolute md:mt-0 md:opacity-0 md:group-hover:opacity-100">
            ప్రస్థానం
          </h1>
        </div>

        <div className="mb-8 flex min-h-[5.5rem] w-full max-w-xl items-center justify-center md:mb-10 md:min-h-[6.5rem]">
          <p
            className={`max-w-[min(100%,36rem)] px-1 font-['NTR'] text-[clamp(0.95rem,3.2vw,2.25rem)] leading-snug text-gray-200 transition-all duration-500 md:leading-relaxed ${
              isSliding ? "opacity-0 -translate-x-10" : "opacity-100 translate-x-0"
            }`}
          >
            “{dialogues[dialogueIndex]}”
            <span className="mt-2 block font-sans text-[0.7rem] font-normal not-italic text-gray-500 md:text-sm">
              (Drama is our Breath)
            </span>
          </p>
        </div>

        <a
          href="#about"
          className="inline-flex min-h-[3.25rem] w-full max-w-md items-center justify-center rounded-md bg-[#FFD700] px-8 py-3.5 font-['Asimovian'] text-sm font-bold uppercase tracking-[0.35em] text-black shadow-[0_12px_40px_rgba(255,215,0,0.25)] transition-all duration-300 hover:bg-[#ffe066] active:scale-[0.98] md:w-auto md:min-w-[280px]"
        >
          Enter The Stage
        </a>
      </div>
    </section>
  );
}
