import { useEffect, useMemo, useState } from "react";
import { NAVARASAS } from "../data/legacyData";
import { useSiteContent } from "../context/SiteContentContext";

const TELUGU_RASA_NAMES = {
  shringara: "శృంగారం",
  hasya: "హాస్యం",
  karuna: "కరుణ",
  raudra: "రౌద్రం",
  veera: "వీరం",
  bhayanaka: "భయానకం",
  bibhatsa: "బీభత్సం",
  adbhuta: "ఆద్భుతం",
  shanta: "శాంతం",
};

const TELUGU_RASA_FONTS = {
  shringara: "'Sirivennela', cursive",
  hasya: "'Timmana', sans-serif",
  karuna: "'Mandali', sans-serif",
  raudra: "'Suranna', serif",
  veera: "'Sree Krushnadevaraya', serif",
  bhayanaka: "'Dhurjati', sans-serif",
  bibhatsa: "'Gurajada', serif",
  adbhuta: "'Tenali Ramakrishna', sans-serif",
  shanta: "'NTR', sans-serif",
};

export default function Navarasas() {
  const { siteContent } = useSiteContent();

  const rasaList = useMemo(() => {
    const live =
      Array.isArray(siteContent?.navarasas) && siteContent.navarasas.length
        ? siteContent.navarasas
        : NAVARASAS;
    const fallbackById = Object.fromEntries(NAVARASAS.map((rasa) => [rasa.id, rasa]));

    return live.map((item) => ({
      ...(fallbackById[item.id] || {}),
      ...item,
      plays: Array.isArray(item.plays) ? item.plays : [],
    }));
  }, [siteContent]);

  const [activeRasaId, setActiveRasaId] = useState(() => String(rasaList[0]?.id || NAVARASAS[0]?.id || ""));

  useEffect(() => {
    if (!rasaList.some((rasa) => String(rasa.id) === String(activeRasaId))) {
      setActiveRasaId(String(rasaList[0]?.id || NAVARASAS[0]?.id || ""));
    }
  }, [rasaList, activeRasaId]);

  const currentRasa = useMemo(
    () =>
      rasaList.find((rasa) => String(rasa.id) === String(activeRasaId)) ||
      rasaList[0] ||
      NAVARASAS[0],
    [rasaList, activeRasaId]
  );

  const glowStyle = useMemo(
    () => ({
      background: `radial-gradient(circle at center, ${(currentRasa?.glowColor || "#FFD700")}50 0%, #000000 80%)`,
    }),
    [currentRasa]
  );

  return (
    <section
      id="navarasas"
      className="navarasas-fit pt-10 pb-20 border-t border-b border-[#222] transition-[background] duration-700 ease-in-out"
      style={glowStyle}
    >
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12 flex flex-col items-center">
          <div className="group relative min-h-[60px] md:h-[80px] flex flex-col items-center justify-center cursor-none">
            <h2 className="text-[32px] md:text-5xl font-['DynaPuff'] font-normal text-[#FFD700] tracking-[0.25em] md:tracking-[0.35em] uppercase drop-shadow-[0_0_18px_rgba(255,215,0,0.65)] transition-opacity duration-300 md:group-hover:opacity-0">
              Navarasa
            </h2>
            <h2 className="text-[40px] md:text-7xl font-['Dhurjati'] font-normal text-[#FFD700] md:absolute md:tracking-widest opacity-100 md:opacity-0 transition-opacity duration-300 md:group-hover:opacity-100 drop-shadow-[0_0_18px_rgba(255,215,0,0.65)] whitespace-nowrap -mt-2 md:mt-0">
              నవరసాలు
            </h2>
          </div>
          <div className="mt-3 flex items-center justify-center gap-4">
            <span className="h-px w-12 md:w-16 bg-gray-400/60"></span>
            <p className="text-sm md:text-base font-playfair text-gray-300 tracking-[0.28em] uppercase opacity-80">
              The Nine Emotions
            </p>
            <span className="h-px w-12 md:w-16 bg-gray-400/60"></span>
          </div>
        </div>
        <div
          id="filterButtons"
          className="mb-10 flex flex-nowrap flex-row items-center gap-3 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:mb-16 md:flex-wrap md:justify-center md:overflow-x-visible md:pb-0"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {rasaList.map((rasa) => {
            const isActive = rasa.id === currentRasa.id;
            const className = [
              "shrink-0 snap-center px-6 py-2.5 rounded-full text-sm font-['Cinzel'] tracking-[0.15em] border transition-all duration-300 border backdrop-blur-sm min-h-[44px]",
              isActive
                ? "text-white border-transparent scale-105 font-bold"
                : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/30",
            ].join(" ");

            return (
              <button
                key={rasa.id}
                className={className}
                style={
                  isActive
                    ? { backgroundColor: rasa.glowColor, boxShadow: `0 0 20px ${rasa.glowColor}` }
                    : undefined
                }
                onClick={() => setActiveRasaId(String(rasa.id))}
              >
                {String(rasa.name || "").toUpperCase()}
              </button>
            );
          })}
        </div>
        <div className="grid md:grid-cols-2 gap-2 items-center min-h-[100px]">
          <div id="rasaDisplay" className="flex flex-col justify-center items-center text-center md:text-left md:items-start space-y-6">
            <div className="transform transition-all duration-700 hover:scale-110">
              <div
                className={`text-9xl ${currentRasa.textColor} opacity-100 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]`}
                dangerouslySetInnerHTML={{ __html: currentRasa.icon }}
              />
            </div>
            <div className={`border-t-2 border-${currentRasa.textColor.split("-")[1]}-500 w-24 my-6 opacity-50`} />
            <h3 
              className="text-5xl md:text-7xl text-white drop-shadow-lg tracking-wide transition-all duration-500"
              style={{ fontFamily: TELUGU_RASA_FONTS[currentRasa.id] || "'Sirivennela', sans-serif" }}
            >
              {TELUGU_RASA_NAMES[currentRasa.id] || currentRasa.name}
            </h3>
            <p className="text-xl font-sans italic text-gray-300 tracking-widest uppercase opacity-80">
              {currentRasa.subtitle}
            </p>
          </div>
          <div className="bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10 relative overflow-hidden group shadow-2xl max-h-[320px] overflow-y-auto">
            <h4 className="text-2xl font-cinzel text-white mb-6 border-b border-white/10 pb-4">
              Signature Plays
            </h4>
            <ul id="playsList" className="space-y-2 text-base text-gray-300">
              {currentRasa.plays.map((play) => (
                <li
                  key={play}
                  className="flex items-center text-lg text-gray-200 border-b border-white/5 pb-2 last:border-0"
                >
                  <span className={`${currentRasa.textColor} mr-3 text-sm`}>●</span> {play}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
