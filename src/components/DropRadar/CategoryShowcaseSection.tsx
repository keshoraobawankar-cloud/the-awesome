import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Film,
  Sparkles,
  Gamepad2,
  Tv,
  BookOpen,
  Layers,
  ArrowRight,
  BellRing,
  ChevronLeft,
  ChevronRight,
  Play,
  Coins
} from 'lucide-react';
import { CATEGORY_PANELS, CategoryPanel, DROP_TITLES_12, DropTitle } from '../../data/dropRadarData';
import { useDropData } from '../../context/DropDataContext';
import { useNotifications } from '../../context/NotificationContext';
import { SectorCategory } from './CategorySlateModal';
import { FormatBadge, inferMovieFormats } from './FormatBadge';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface CategoryShowcaseSectionProps {
  onSelectCategory: (cat: string) => void;
  onScrollToTimeline: () => void;
  onOpenSectorSlate: (
    sector: SectorCategory,
    initialMoviesFilter?: 'all' | 'imax' | 'hollywood' | 'bollywood' | 'missing_trailer'
  ) => void;
  onOpenDropModal: (drop: DropTitle, autoPlayTrailer?: boolean) => void;
  onOpenTrailerModal: (drop: DropTitle, mode: 'submit' | 'view_or_flag') => void;
}

function isImaxDrop(drop: DropTitle): boolean {
  const text = `${drop.platform} ${drop.tagline} ${drop.description}`.toLowerCase();
  return text.includes('imax') || text.includes('70mm');
}

export const CategoryShowcaseSection: React.FC<CategoryShowcaseSectionProps> = ({
  onSelectCategory,
  onScrollToTimeline,
  onOpenSectorSlate,
  onOpenDropModal,
  onOpenTrailerModal
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { drops } = useDropData();
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const allDrops = drops && drops.length > 0 ? drops : DROP_TITLES_12;

  const livePanels = useMemo(() => {
    return CATEGORY_PANELS.map((panel) => {
      const catName = panel.title.split(' ')[0] as SectorCategory;
      const catDrops = allDrops.filter((d) => d.category.toLowerCase() === catName.toLowerCase());
      const imaxCount =
        catName === 'Movies'
          ? allDrops.filter((d) => isImaxDrop(d)).length
          : catDrops.filter((d) => isImaxDrop(d)).length;
      const verifiedTrailers = catDrops.filter(
        (d) => Boolean(d.trailerEmbedUrl && d.trailerStatus !== 'flagged_broken')
      ).length;

      return {
        ...panel,
        sector: catName,
        liveCount: catDrops.length > 0 ? catDrops.length : panel.count,
        imaxCount,
        verifiedTrailers,
        topDrops: catDrops.slice(0, 3),
        featuredTitle: catDrops[0]?.name || panel.featuredTitle
      };
    });
  }, [allDrops]);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: '(min-width: 1024px)',
        reduceMotion: '(prefers-reduced-motion: reduce)'
      },
      (context) => {
        const { isDesktop, reduceMotion } = context.conditions || {};
        const track = trackRef.current;
        const container = containerRef.current;
        if (!track || !container) return;

        // Only pin & run horizontal scroll on desktop viewports when motion is enabled
        if (isDesktop && !reduceMotion) {
          const getScrollWidth = () => Math.max(0, track.scrollWidth - window.innerWidth + 80);

          gsap.to(track, {
            x: () => -getScrollWidth(),
            ease: 'none',
            scrollTrigger: {
              trigger: container,
              start: 'top top',
              end: () => `+=${getScrollWidth()}`,
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true,
              anticipatePin: 1,
              onUpdate: (self) => {
                const idx = Math.min(
                  CATEGORY_PANELS.length - 1,
                  Math.max(0, Math.round(self.progress * (CATEGORY_PANELS.length - 1)))
                );
                setActiveSlideIndex(idx);
              }
            }
          });
        } else {
          gsap.set(track, { clearProps: 'transform' });
        }
      },
      containerRef
    );

    return () => mm.revert();
  }, []);

  const jumpToSlide = (idx: number) => {
    const clamped = Math.max(0, Math.min(livePanels.length - 1, idx));
    setActiveSlideIndex(clamped);
    const container = containerRef.current;
    if (!container) return;

    const st = ScrollTrigger.getAll().find((t) => t.trigger === container);
    if (st) {
      const progress = clamped / Math.max(1, livePanels.length - 1);
      const targetScroll = st.start + progress * (st.end - st.start);
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      return;
    }

    // Mobile/tablet fallback: smoothly scroll to the specific card in the grid
    const cardEl = document.getElementById(`sector-card-${livePanels[clamped]?.id}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  return (
    <section
      id="category-showcase"
      ref={containerRef}
      className="relative w-full py-16 sm:py-20 lg:py-0 lg:min-h-dvh lg:h-dvh overflow-x-clip lg:overflow-hidden bg-[#0b0d1a] flex flex-col justify-center"
    >
      {/* Header bar with interactive sector jump & slide controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full lg:pt-8 pb-6 lg:pb-4 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-cyan-400 text-xs font-mono uppercase tracking-widest font-semibold mb-1">
            Interactive Release Sectors
          </p>
          <h2 className="font-bebas text-[clamp(2.25rem,5.5vw,3.75rem)] text-white tracking-wide leading-none text-balance">
            CATEGORY <span className="text-[#8b5cf6]">SHOWCASE</span>
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap items-stretch sm:items-center gap-2.5 min-w-0">
          {/* Quick Sector Switcher (Horizontally scrollable on mobile/tablet) */}
          <div className="flex flex-nowrap items-center gap-1 p-1 rounded-xl bg-[#121528] border border-[#252846] overflow-x-auto no-scrollbar max-w-full">
            {livePanels.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                onClick={() => jumpToSlide(idx)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                  activeSlideIndex === idx
                    ? 'bg-[#8b5cf6] text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p.sector === 'Movies' ? 'Movies & IMAX' : p.sector}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-1.5 shrink-0">
            <div className="hidden lg:flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => jumpToSlide(activeSlideIndex - 1)}
                disabled={activeSlideIndex === 0}
                className="p-2 rounded-xl bg-[#121528] border border-[#252846] text-slate-300 hover:text-white hover:border-cyan-400 disabled:opacity-40 transition-colors"
                aria-label="Previous category slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => jumpToSlide(activeSlideIndex + 1)}
                disabled={activeSlideIndex === livePanels.length - 1}
                className="p-2 rounded-xl bg-[#121528] border border-[#252846] text-slate-300 hover:text-white hover:border-cyan-400 disabled:opacity-40 transition-colors"
                aria-label="Next category slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                const current = livePanels[activeSlideIndex];
                if (current) {
                  onSelectCategory(current.sector);
                  onOpenSectorSlate(current.sector);
                }
              }}
              className="w-full sm:w-auto justify-center px-3.5 py-2 rounded-xl bg-[#ff3d71] hover:bg-[#ff5685] text-white text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
            >
              <span>Open Active Slate</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Mobile/Tablet CSS Grid -> Desktop Horizontal Moving Track */}
      <div className="w-full lg:overflow-hidden lg:flex-1 lg:flex lg:items-center">
        <div
          ref={trackRef}
          className="max-w-7xl mx-auto lg:max-w-none lg:mx-0 px-4 sm:px-6 lg:px-12 grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-nowrap gap-5 sm:gap-6 lg:gap-8 w-full lg:w-max will-change-transform"
        >
          {livePanels.map((panel, idx) => (
            <CategoryCard
              key={panel.id}
              panel={panel}
              index={idx}
              onOpenSlate={(initialFilter) => {
                onSelectCategory(panel.sector);
                onOpenSectorSlate(panel.sector, initialFilter);
              }}
              onOpenDrop={(drop, autoPlay) => onOpenDropModal(drop, autoPlay)}
              onOpenTrailer={(drop) => onOpenTrailerModal(drop, 'submit')}
              onFilterTimeline={() => {
                onSelectCategory(panel.sector);
                onScrollToTimeline();
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

interface LiveCategoryPanel extends CategoryPanel {
  sector: SectorCategory;
  liveCount: number;
  imaxCount: number;
  verifiedTrailers: number;
  topDrops: DropTitle[];
}

const CategoryCard: React.FC<{
  panel: LiveCategoryPanel;
  index: number;
  onOpenSlate: (initialMoviesFilter?: 'all' | 'imax' | 'hollywood' | 'bollywood' | 'missing_trailer') => void;
  onOpenDrop: (drop: DropTitle, autoPlayTrailer?: boolean) => void;
  onOpenTrailer: (drop: DropTitle) => void;
  onFilterTimeline: () => void;
}> = ({ panel, index, onOpenSlate, onOpenDrop, onOpenTrailer, onFilterTimeline }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { hasActiveRuleFor, openNotifyModal } = useNotifications();
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const categoryName = panel.sector;
  const catTargetId = `cat-${categoryName.toLowerCase()}`;
  const hasAlert = hasActiveRuleFor(catTargetId);
  const isMovies = categoryName === 'Movies';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      !cardRef.current ||
      typeof window === 'undefined' ||
      !window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches
    ) {
      return;
    }
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    setTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  const getIcon = () => {
    switch (panel.iconName) {
      case 'Film':
        return <Film className="w-5 h-5" style={{ color: panel.accent }} />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5" style={{ color: panel.accent }} />;
      case 'Gamepad2':
        return <Gamepad2 className="w-5 h-5" style={{ color: panel.accent }} />;
      case 'Tv':
        return <Tv className="w-5 h-5" style={{ color: panel.accent }} />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5" style={{ color: panel.accent }} />;
      default:
        return <Layers className="w-5 h-5" style={{ color: panel.accent }} />;
    }
  };

  return (
    <div
      id={`sector-card-${panel.id}`}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onOpenSlate('all')}
      style={
        tilt.rotateX !== 0 || tilt.rotateY !== 0
          ? {
              transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
              transition: 'transform 0.15s ease-out'
            }
          : undefined
      }
      className="w-full lg:w-[430px] min-h-[390px] lg:h-[520px] rounded-3xl p-5 sm:p-6 relative flex flex-col justify-between overflow-hidden cursor-pointer group bg-[#121528] border border-[#252846] hover:border-slate-300/40 shadow-2xl transition-shadow select-none"
    >
      {/* Background Gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${panel.bgGradient} opacity-65 group-hover:opacity-90 transition-opacity`}
      />

      {/* Top Header Row */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-[#0b0d1a]/85 border border-[#2b3052] shrink-0">
            {getIcon()}
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-mono text-slate-400 tabular-nums block">
              0{index + 1} · {panel.liveCount} Tracked
              {isMovies && panel.imaxCount > 0 ? ` · ${panel.imaxCount} IMAX` : ''}
            </span>
            <h3 className="font-bebas text-2xl sm:text-3xl text-white tracking-wide leading-none truncate">
              {panel.title}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openNotifyModal({
              targetId: catTargetId,
              targetName: `${categoryName} Releases & Updates`,
              targetType: 'category',
              category: categoryName
            });
          }}
          className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-mono flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors ${
            hasAlert
              ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200'
              : 'bg-[#0b0d1a]/80 border-[#2b3052] text-slate-300 hover:border-cyan-400 hover:text-white'
          }`}
          title={`Set notifications for ${categoryName}`}
        >
          <BellRing className="w-3.5 h-3.5 text-cyan-400" />
          <span>{hasAlert ? 'Alert On' : 'Notify'}</span>
        </button>
      </div>

      {/* Live Interactive Release List on the Slide */}
      <div className="relative z-10 my-3 flex-1 flex flex-col justify-center space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-1">
          <span>Upcoming Slate Preview</span>
          <span className="tabular-nums">{panel.verifiedTrailers} Trailers Verified</span>
        </div>

        {panel.topDrops.length > 0 ? (
          <div className="space-y-2">
            {panel.topDrops.map((drop) => {
              const isBroken = drop.trailerStatus === 'flagged_broken';
              const hasTrailer = Boolean(drop.trailerEmbedUrl && !isBroken);
              const isImax = isImaxDrop(drop);

              return (
                <div
                  key={drop.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDrop(drop, false);
                  }}
                  className="p-2.5 rounded-xl bg-[#0b0d1a]/80 hover:bg-[#171a30] border border-[#252846] hover:border-cyan-400/50 flex items-center justify-between gap-2.5 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-inter text-xs font-semibold text-white truncate">
                      {drop.name}
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                      <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                        T-{drop.daysRemaining}D · {drop.date}
                      </span>
                      {(drop.category === 'Movies' || isImax) &&
                        inferMovieFormats(drop)
                          .slice(0, 2)
                          .map((fmt) => <FormatBadge key={fmt} format={fmt} size="xs" />)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (hasTrailer) {
                        onOpenDrop(drop, true);
                      } else {
                        onOpenTrailer(drop);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors ${
                      hasTrailer
                        ? 'bg-[#171a30] hover:bg-[#ff3d71] text-cyan-300 hover:text-white border border-[#2b3052]'
                        : 'bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-[#0b0d1a] border border-amber-400/40'
                    }`}
                    title={hasTrailer ? 'Watch Official Trailer' : 'Add Official Trailer (+25 Tokens)'}
                  >
                    {hasTrailer ? (
                      <>
                        <Play className="w-3 h-3 fill-current" />
                        <span>Play</span>
                      </>
                    ) : (
                      <>
                        <Coins className="w-3 h-3" />
                        <span>+25</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-300 font-inter">
            {panel.subtitle} — Leading Drop: {panel.featuredTitle}
          </p>
        )}
      </div>

      {/* Bottom Interactive Actions */}
      <div className="relative z-10 pt-3 border-t border-[#252846]/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {isMovies && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenSlate('imax');
              }}
              className="px-3 py-2 rounded-xl bg-[#0b0d1a]/85 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold whitespace-nowrap shrink-0 transition-colors"
            >
              IMAX & 70mm
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFilterTimeline();
            }}
            className="px-3 py-2 rounded-xl bg-[#0b0d1a]/85 hover:bg-[#171a30] border border-[#2b3052] text-slate-300 hover:text-white text-xs font-mono whitespace-nowrap shrink-0 transition-colors"
          >
            Week View
          </button>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenSlate('all');
          }}
          className="px-3.5 py-2 rounded-xl font-inter text-xs font-semibold text-white flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-transform group-hover:translate-x-0.5"
          style={{ backgroundColor: panel.accent }}
        >
          <span>Explore All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
