import React, { useRef } from 'react';
import { Newspaper, Bookmark, Check, ArrowUpRight, Flame, Clock, BellRing } from 'lucide-react';
import { STACKING_NEWS, StackingNewsCard, TICKER_HEADLINES } from '../../data/dropRadarData';
import { useBugle } from '../../context/BugleContext';
import { useDropData } from '../../context/DropDataContext';
import { useNotifications } from '../../context/NotificationContext';
import { playBundleThudSound } from '../../utils/audio';

export const NewsStackSection: React.FC = () => {
  const { savedStoryIds, toggleSave, isSaved, isAudioDeskEnabled } = useBugle();
  const { news } = useDropData();
  const { hasActiveRuleFor, openNotifyModal } = useNotifications();

  const currentNews = (news && news.length > 0) ? news : STACKING_NEWS;
  const activeHeadlines = [
    ...currentNews.map(n => n.title),
    ...TICKER_HEADLINES
  ];

  const handleCardEnter = () => {
    if (isAudioDeskEnabled) {
      playBundleThudSound();
    }
  };

  return (
    <section id="news-section" className="relative w-full py-16 sm:py-24 lg:py-28 bg-[#0b0d1a] overflow-x-clip">
      {/* 1. Scrolling Breaking-News Ticker */}
      <div className="w-full bg-[#121528] border-y border-[#252846] py-2.5 sm:py-3 overflow-hidden flex items-center mb-12 sm:mb-16 shadow-lg">
        <div className="shrink-0 bg-[#ff3d71] text-white px-2.5 sm:px-4 py-1 sm:py-1.5 font-bebas text-sm sm:text-lg tracking-wider flex items-center gap-1.5 sm:gap-2 z-10 shadow-md whitespace-nowrap">
          <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-bounce shrink-0" />
          <span>BREAKING WIRE</span>
        </div>
        <div className="overflow-hidden flex-1 min-w-0 relative">
          <div className="animate-marquee whitespace-nowrap flex gap-8 sm:gap-12 text-xs sm:text-sm font-inter text-slate-200">
            {[...activeHeadlines, ...activeHeadlines].map((headline, idx) => (
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
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171a30] border border-[#252846] text-[#ff3d71] text-xs font-mono font-semibold uppercase tracking-widest mb-3">
            <Newspaper className="w-3.5 h-3.5 shrink-0" />
            <span>Broadsheet Dispatch Desk</span>
          </div>
          <h2 className="font-bebas text-[clamp(2.25rem,6vw,4.5rem)] leading-none text-white tracking-wide text-balance">
            STICKY <span className="text-[#ff3d71]">STACKING SCOOPS</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto font-inter mt-3">
            Each breaking dispatch drops into the stack like a freshly inked morning broadsheet. As you scroll, earlier scoops compress into the archive stack.
          </p>
        </div>

        {/* Sticky Stacking Cards Container (no overflow: hidden so position: sticky works cleanly) */}
        <div className="relative pb-16 sm:pb-24 space-y-8 sm:space-y-12">
          {currentNews.map((card, idx) => {
            const isBookmarked = isSaved(card.id);
            const stackIdx = Math.min(idx, 5);

            return (
              <article
                key={card.id}
                onMouseEnter={handleCardEnter}
                style={
                  {
                    '--stack-idx': stackIdx,
                    zIndex: idx + 10
                  } as React.CSSProperties
                }
                className="sticky sticky-scoop-card min-h-[220px] sm:min-h-[260px] h-auto rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 bg-[#121528] border-2 border-[#2b3052] hover:border-cyan-400/60 shadow-[0_15px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-all duration-300 group flex flex-col justify-between"
              >
                {/* Background Gradient */}
                <div
                  className={`absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${card.gradient} opacity-20 pointer-events-none`}
                />

                <div className="relative z-10 flex flex-col flex-1 justify-between">
                  <div>
                    {/* Top Bar: Kicker + Tag + Save */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5 sm:mb-4">
                      <div className="flex flex-wrap items-center gap-2 min-w-0">
                        <span className="px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-mono font-bold tracking-wider uppercase bg-[#ff3d71]/20 text-[#ff3d71] border border-[#ff3d71]/40 whitespace-nowrap">
                          {card.kicker}
                        </span>
                        <span className="text-xs font-mono text-cyan-400 font-semibold hidden sm:inline">
                          [{card.tag}]
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        <button
                          onClick={() =>
                            openNotifyModal({
                              targetId: card.id,
                              targetName: card.title,
                              targetType: 'news',
                              category: card.tag
                            })
                          }
                          className={`p-2 rounded-xl border text-xs font-inter flex items-center gap-1.5 transition-all whitespace-nowrap ${
                            hasActiveRuleFor(card.id)
                              ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400'
                              : 'bg-[#171a30] text-cyan-300 border-[#2b3052] hover:text-white hover:border-cyan-400'
                          }`}
                          title="Set notification for updates on this story"
                          aria-label={`Notify updates for ${card.title}`}
                        >
                          <BellRing className="w-4 h-4 shrink-0" />
                          <span className="hidden sm:inline font-mono">
                            {hasActiveRuleFor(card.id) ? 'Alert On' : 'Notify'}
                          </span>
                        </button>

                        <button
                          onClick={() => toggleSave(card.id)}
                          className={`p-2 rounded-xl border text-xs font-inter flex items-center gap-1.5 transition-all whitespace-nowrap ${
                            isBookmarked
                              ? 'bg-emerald-600 text-white border-emerald-500'
                              : 'bg-[#171a30] text-slate-400 border-[#2b3052] hover:text-white hover:border-cyan-400'
                          }`}
                          title={isBookmarked ? 'Saved to Archive' : 'Save Story'}
                          aria-label={isBookmarked ? 'Saved to Archive' : 'Save Story'}
                        >
                          {isBookmarked ? (
                            <>
                              <Check className="w-4 h-4 text-white shrink-0" />
                              <span className="hidden sm:inline font-mono">Archived</span>
                            </>
                          ) : (
                            <>
                              <Bookmark className="w-4 h-4 shrink-0" />
                              <span className="hidden sm:inline font-mono">Save Scoop</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Headline */}
                    <h3 className="font-bebas text-[clamp(1.65rem,4.8vw,3rem)] text-white group-hover:text-cyan-300 transition-colors tracking-tight leading-[1.08] mb-3 sm:mb-4 break-words text-balance">
                      {card.title}
                    </h3>

                    {/* Deck (never clipped on narrow widths) */}
                    <p className="text-slate-300 text-sm sm:text-base font-inter leading-relaxed mb-5 sm:mb-6 break-words">
                      {card.deck}
                    </p>
                  </div>

                  {/* Footer metadata */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3.5 sm:pt-4 border-t border-[#252846]/80 text-xs font-mono text-slate-400">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 min-w-0">
                      <span className="text-white font-semibold truncate max-w-[180px] sm:max-w-none">
                        {card.source}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        {card.readTime}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:inline">{card.date}</span>
                    </div>

                    <span className="text-cyan-400 font-semibold group-hover:underline flex items-center gap-1 whitespace-nowrap shrink-0">
                      Dispatch #{idx + 1}
                      <ArrowUpRight className="w-4 h-4 shrink-0" />
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
