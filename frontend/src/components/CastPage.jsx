import { useEffect, useMemo, useState } from "react";
import logo from "../Legacy/logo.png";
import stageImg from "../Legacy/stage.jpg";
import { CAST_BATCHES } from "../data/legacyData";
import { useSiteContent } from "../context/SiteContentContext";
import { resolveMediaUrl } from "../utils/media";

export default function CastPage() {
  const { siteContent } = useSiteContent();
  const castBatches = siteContent?.castBatches?.length ? siteContent.castBatches : CAST_BATCHES;
  const [activeBatchId, setActiveBatchId] = useState(castBatches[0].id);
  const [slideIndex, setSlideIndex] = useState(0);
  const [showBatchGallery, setShowBatchGallery] = useState(false);

  const activeBatch = useMemo(
    () => castBatches.find((batch) => batch.id === activeBatchId) || castBatches[0],
    [activeBatchId, castBatches]
  );

  const activePhotos = useMemo(
    () => (activeBatch.photos || []).map((key) => resolveMediaUrl(key)).filter(Boolean),
    [activeBatch]
  );

  useEffect(() => {
    if (!castBatches.some((batch) => batch.id === activeBatchId)) {
      setActiveBatchId(castBatches[0].id);
    }
  }, [castBatches, activeBatchId]);

  useEffect(() => {
    setSlideIndex(0);
  }, [activeBatchId]);

  useEffect(() => {
    if (activePhotos.length <= 1) return;
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % activePhotos.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activePhotos]);

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <img src={stageImg} alt="Stage Backdrop" className="w-full h-full object-cover hero-zoom" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,215,0,0.16),transparent_60%)]" />

      <nav className="relative z-20 bg-black/80 backdrop-blur-md border-b border-[#333] py-4 px-6 flex justify-between items-center">
        <a href="/">
          <img className="logo" src={logo} alt="Prasthanam logo" />
        </a>
        <a
          href="/?skipCurtain=1&fromCast=1#team"
          className="px-4 py-2 border border-[#FFD700]/40 rounded-md text-[#FFD700] font-cinzel tracking-[0.18em] text-xs uppercase hover:bg-[#FFD700] hover:text-black transition-all duration-300"
        >
          Back to Stage
        </a>
      </nav>

      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="text-center mb-10">
          <p className="text-xs md:text-sm text-[#e2c4a4] font-cinzel tracking-[0.3em] uppercase mb-3">Prasthanam Ensemble</p>
          <h1 className="text-4xl md:text-6xl font-cinzel text-[#FFD700] tracking-[0.2em] uppercase mb-4">The Cast</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Batch-wise and year-wise member foundation. We can keep expanding this archive with full records in the next update.
          </p>
        </div>

        <div className="bg-black/45 border border-[#FFD700]/20 rounded-2xl p-4 md:p-6 shadow-[0_0_40px_rgba(255,215,0,0.12)] mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {castBatches.map((batch) => {
              const isActive = batch.id === activeBatch.id;
              return (
                <button
                  key={batch.id}
                  onClick={() => setActiveBatchId(batch.id)}
                  className={`px-5 py-2 rounded-full border text-sm md:text-base tracking-wider transition-all duration-300 ${
                    isActive
                      ? "bg-[#FFD700] text-black border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.4)]"
                      : "bg-white/5 text-gray-300 border-white/15 hover:text-white hover:border-[#FFD700]/40"
                  }`}
                >
                  {batch.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid md:grid-cols-[1fr,2fr] gap-6">
          <div className="bg-black/50 border border-white/10 rounded-2xl p-6">
            <p className="text-[#FFD700] font-cinzel tracking-[0.2em] uppercase text-xs mb-2">Active Batch</p>
            <h2 className="text-2xl md:text-3xl font-cinzel mb-2">{activeBatch.label}</h2>
            <p className="text-sm text-gray-400 mb-5">{activeBatch.yearRange}</p>
            <div className="border-t border-white/10 pt-4">
              <p className="text-[#FFD700] text-xs uppercase tracking-[0.2em] mb-3">Batch Photos</p>
              <button
                onClick={() => setShowBatchGallery(true)}
                className="group w-full rounded-xl border border-[#FFD700]/30 bg-black/40 overflow-hidden hover:border-[#FFD700]/70 transition-all duration-300"
              >
                <div className="relative h-[240px]">
                  {activePhotos.length > 0 ? (
                    <img
                      key={`${activeBatch.id}-${slideIndex}`}
                      src={activePhotos[slideIndex]}
                      alt={`${activeBatch.label} slideshow`}
                      className="w-full h-full object-cover animate-[fadein_500ms_ease]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      No batch photos yet
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <p className="absolute bottom-3 left-3 text-[11px] uppercase tracking-[0.2em] text-[#FFD700]">
                    Click to view all
                  </p>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-black/55 border border-white/10 rounded-2xl p-6">
            <p className="text-[#FFD700] text-xs uppercase tracking-[0.24em] mb-4">Group Members</p>
            <div className="rounded-2xl border border-[#FFD700]/20 bg-black/35 min-h-[320px] md:min-h-[360px] p-5">
              <div className="grid sm:grid-cols-2 gap-3">
                {(activeBatch.members || [])
                  .map((member) => String(member || "").trim())
                  .filter(Boolean)
                  .map((member, memberIndex) => (
                    <div
                      key={`${member}-${memberIndex}`}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-gray-200 hover:border-[#FFD700]/50 hover:bg-[#FFD700]/10 transition-all duration-300"
                    >
                      {member}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {showBatchGallery && (
        <div
          className="fixed inset-0 z-[9999999] bg-black/85 backdrop-blur-sm p-4 md:p-8"
          onClick={(event) => {
            if (event.target === event.currentTarget) setShowBatchGallery(false);
          }}
        >
          <div className="max-w-6xl mx-auto h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#FFD700] text-lg md:text-2xl font-cinzel tracking-[0.14em] uppercase">
                {activeBatch.label} - Photos
              </h3>
              <button
                onClick={() => setShowBatchGallery(false)}
                className="px-4 py-2 border border-[#FFD700]/40 rounded-md text-[#FFD700] text-xs uppercase tracking-[0.18em] hover:bg-[#FFD700] hover:text-black transition-all duration-300"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto pr-1">
              {activePhotos.map((src, idx) => (
                <div key={`${activeBatch.id}-photo-${idx}`} className="rounded-xl overflow-hidden border border-white/10 bg-black/40">
                  <img src={src} alt={`${activeBatch.label} ${idx + 1}`} className="w-full h-[220px] object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes fadein{from{opacity:.45;transform:scale(1.02)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}
