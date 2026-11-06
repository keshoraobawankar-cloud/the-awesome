import React, { useRef } from 'react';
import { Newspaper, Bookmark, Check, ArrowUpRight, Flame, Clock } from 'lucide-react';
import { STACKING_NEWS, StackingNewsCard, TICKER_HEADLINES } from '../../data/dropRadarData';
import { useBugle } from '../../context/BugleContext';
import { playBundleThudSound } from '../../utils/audio';

export const NewsStackSection: React.FC = () => {
  const { savedStoryIds, toggleSave, isSaved, isAudioDeskEnabled } = useBugle();

  const handleCardEnter = () => {
    if (isAudioDeskEnabled) {
      playBundleThudSound();
    }
  };

  return (
    <section id="news-section" className="relative w-full py-20 sm:py-28 bg-[#0b0d1a] overflow-hidden">
      {/* 1. Scrolling Breaking-News Ticker */}
      <div className="w-full bg-[#121528] border-y border-[#252846] py-3 overflow-hidden flex items-center mb-16 shadow-lg">
        <div className="flex-none bg-[#ff3d71] text-white px-4 py-1.5 font-bebas text-lg tracking-wider flex items-center gap-2 z-10 shadow-md">
          <Flame className="w-4 h-4 animate-bounce" />
          <span>BREAKING WIRE</span>
        </div>
        <div className="overflow-hidden flex-1 relative">
          <div className="animate-marquee whitespace-nowrap flex gap-12 text-sm font-inter text-slate-200">
            {[...TICKER_HEADLINES, ...TICKER_HEADLINES].map((headline, idx) => (
              <span key={idx} className="inline-flex items-center gap-2 text-slate-200 font-medium">
                <span>{headline}</span>
                <span className="text-[#8b5cf6] font-bold">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171a30] border border-[#252846] text-[#ff3d71] text-xs font-mono font-semibold uppercase tracking-widest mb-3">
            <Newspaper className="w-3.5 h-3.5" />
            <span>Broadsheet Dispatch Desk</span>
          </div>
          <h2 className="font-bebas text-4xl sm:text-6xl md:text-7xl text-white tracking-wide">
            STICKY <span className="text-[#ff3d71]">STACKING SCOOPS</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto font-inter mt-3">
            Each breaking dispatch drops into the stack like a freshly inked morning broadsheet. As you scroll, earlier scoops compress into the archive stack.
          </p>
        </div>

        {/* Sticky Stacking Cards Container */}
        <div className="relative pb-24 space-y-12">
          {STACKING_NEWS.map((card, idx) => {
            const isBookmarked = isSaved(card.id);
            // Sticky top offset increases slightly per card
            const topOffset = 100 + idx * 24;

            return (
              <div
                key={card.id}
                onMouseEnter={handleCardEnter}
                style={{
                  top: `${topOffset}px`,
                  zIndex: idx + 10
                }}
                className="sticky rounded-3xl p-6 sm:p-10 bg-[#121528] border-2 border-[#2b3052] hover:border-cyan-400/60 shadow-[0_15px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-all duration-300 group"
              >
                {/* Background Gradient */}
                <div
                  className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${card.gradient} opacity-20 pointer-events-none`}
                />

                <div className="relative z-10">
                  {/* Top Bar: Kicker + Tag + Save */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-[#ff3d71]/20 text-[#ff3d71] border border-[#ff3d71]/40">
                        {card.kicker}
                      </span>
                      <span className="text-xs font-mono text-cyan-400 font-semibold hidden sm:inline">
                        [{card.tag}]
                      </span>
                    </div>

                    <button
                      onClick={() => toggleSave(card.id)}
                      className={`p-2 rounded-xl border text-xs font-inter flex items-center gap-1.5 transition-all ${
                        isBookmarked
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-[#171a30] text-slate-400 border-[#2b3052] hover:text-white hover:border-cyan-400'
                      }`}
                      title={isBookmarked ? 'Saved to Archive' : 'Save Story'}
                    >
                      {isBookmarked ? (
                        <>
                          <Check className="w-4 h-4 text-white" />
                          <span className="hidden sm:inline font-mono">Archived</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-4 h-4" />
                          <span className="hidden sm:inline font-mono">Save Scoop</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Headline */}
                  <h3 className="font-bebas text-3xl sm:text-4xl md:text-5xl text-white group-hover:text-cyan-300 transition-colors tracking-tight leading-tight mb-4">
                    {card.title}
                  </h3>

                  {/* Deck */}
                  <p className="text-slate-300 text-sm sm:text-base font-inter leading-relaxed mb-6">
                    {card.deck}
                  </p>

                  {/* Footer metadata */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#252846]/80 text-xs font-mono text-slate-400">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-semibold">{card.source}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        {card.readTime}
                      </span>
                      <span>•</span>
                      <span className="hidden sm:inline">{card.date}</span>
                    </div>

                    <span className="text-cyan-400 font-semibold group-hover:underline flex items-center gap-1">
                      Dispatch #{idx + 1}
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
