import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  Sparkles,
  Gamepad2,
  Film,
  Tv,
  BookOpen,
  FileText,
  ArrowRight,
  Calendar,
  Flame,
  Clock
} from 'lucide-react';
import { DROP_TITLES_12, DropTitle } from '../../data/dropRadarData';
import { useDropData } from '../../context/DropDataContext';
import { computeRemainingTime, parseReleaseTimestamp } from '../../utils/countdown';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface IntroSectionProps {
  onScrollNext: () => void;
  onOpenModal?: (drop: DropTitle) => void;
}

function renderCategoryIcon(category?: DropTitle['category']) {
  switch (category) {
    case 'Games':
      return <Gamepad2 className="w-3.5 h-3.5 text-[#ff3d71]" />;
    case 'Movies':
      return <Film className="w-3.5 h-3.5 text-[#ff3d71]" />;
    case 'Dramas':
      return <Tv className="w-3.5 h-3.5 text-[#ff3d71]" />;
    case 'Books':
      return <BookOpen className="w-3.5 h-3.5 text-[#ff3d71]" />;
    case 'Manga':
      return <FileText className="w-3.5 h-3.5 text-[#ff3d71]" />;
    case 'Anime':
      return <Sparkles className="w-3.5 h-3.5 text-[#ff3d71]" />;
    default:
      return <Flame className="w-3.5 h-3.5 text-[#ff3d71]" />;
  }
}

export const IntroSection: React.FC<IntroSectionProps> = ({ onScrollNext, onOpenModal }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const wordsRef = useRef<HTMLSpanElement[]>([]);
  const posterWallRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const clockRowRef = useRef<HTMLDivElement>(null);
  const clockDigitRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const prevSpotlightTimeRef = useRef<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const { drops, heroDrop, trendingDrops } = useDropData();

  const spotlightDrop = useMemo(() => {
    return heroDrop || trendingDrops[0] || drops[0] || null;
  }, [heroDrop, trendingDrops, drops]);

  const spotlightTargetMs = useMemo(
    () =>
      spotlightDrop
        ? parseReleaseTimestamp(spotlightDrop.date, spotlightDrop.daysRemaining)
        : Date.now(),
    [spotlightDrop?.id, spotlightDrop?.date, spotlightDrop?.daysRemaining]
  );

  const [spotlightRemaining, setSpotlightRemaining] = useState(() =>
    computeRemainingTime(spotlightTargetMs)
  );

  useEffect(() => {
    setSpotlightRemaining(computeRemainingTime(spotlightTargetMs));
    const timer = window.setInterval(() => {
      setSpotlightRemaining(computeRemainingTime(spotlightTargetMs));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [spotlightTargetMs]);

  const isImminentSpotlight =
    !spotlightRemaining.isReleased && spotlightRemaining.totalMs <= 24 * 60 * 60 * 1000;

  useEffect(() => {
    const current = {
      days: spotlightRemaining.days,
      hours: spotlightRemaining.hours,
      minutes: spotlightRemaining.minutes,
      seconds: spotlightRemaining.seconds
    };
    const prev = prevSpotlightTimeRef.current;
    if (prev) {
      (['days', 'hours', 'minutes', 'seconds'] as const).forEach((key, idx) => {
        if (prev[key] !== current[key]) {
          const el = clockDigitRefs.current[idx];
          if (el) {
            gsap.fromTo(
              el,
              { y: -5, opacity: 0.4, scale: 1.08 },
              { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out', overwrite: 'auto' }
            );
          }
        }
      });
    }
    prevSpotlightTimeRef.current = current;
  }, [
    spotlightRemaining.days,
    spotlightRemaining.hours,
    spotlightRemaining.minutes,
    spotlightRemaining.seconds
  ]);

  useEffect(() => {
    if (spotlightRemaining.isReleased || !clockRowRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(clockRowRef.current, {
        boxShadow: isImminentSpotlight
          ? '0 0 18px rgba(255, 61, 113, 0.35)'
          : '0 0 14px rgba(34, 211, 238, 0.22)',
        duration: isImminentSpotlight ? 0.9 : 1.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }, clockRowRef);
    return () => ctx.revert();
  }, [spotlightRemaining.isReleased, isImminentSpotlight]);

  const posterDrops = useMemo(() => {
    const source = drops && drops.length > 0 ? drops : DROP_TITLES_12;
    if (trendingDrops.length === 0) return source.slice(0, 12);
    const featuredIds = new Set(trendingDrops.map((d) => d.id));
    const ordered = [...trendingDrops, ...source.filter((d) => !featuredIds.has(d.id))];
    return ordered.slice(0, 12);
  }, [drops, trendingDrops]);

  const headlineWords = ['THE', 'NEXT', 'WAVE', 'OF', 'CULTURE', 'DROPS', 'HERE.'];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        wordsRef.current,
        { opacity: 0, y: 30, filter: 'blur(8px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          stagger: 0.12,
          duration: 0.9,
          ease: 'power3.out'
        }
      );

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=100%',
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1
        }
      });

      tl.to(
        headlineRef.current,
        {
          scale: 2.2,
          opacity: 0,
          filter: 'blur(12px)',
          ease: 'power2.inOut'
        },
        0
      )
        .to(
          posterWallRef.current,
          {
            opacity: 0.65,
            scale: 1.05,
            ease: 'power1.out'
          },
          0
        )
        .to(
          scrollIndicatorRef.current,
          {
            opacity: 0,
            y: 20,
            ease: 'power1.out'
          },
          0
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="intro"
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-[#0b0d1a] flex items-center justify-center select-none"
    >
      {/* Background Poster Wall (Prioritizes top trending drops across all categories) */}
      <div
        ref={posterWallRef}
        className="absolute inset-0 opacity-15 pointer-events-none transform scale-90 transition-all duration-300 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 p-4 overflow-hidden"
      >
        {posterDrops.map((drop) => (
          <div
            key={drop.id}
            className="aspect-[2/3] rounded-xl overflow-hidden relative border border-[#252846]/60 shadow-2xl bg-[#171a30]/80 group"
          >
            <img
              src={drop.image || '/src/assets/images/bank_heist_web_aftermath_1793361604681.jpg'}
              alt={drop.name}
              className="w-full h-full object-cover filter brightness-75 contrast-125 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d1a] via-transparent to-transparent" />
            <div className="absolute bottom-2 left-2 right-2">
              <span className="text-[9px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
                {drop.category}
              </span>
              <p className="font-bebas text-xs sm:text-sm text-white truncate">{drop.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Cybernetic Radial Glow Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.22),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(34,211,238,0.18),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,61,113,0.18),transparent_50%)] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #252846 1px, transparent 1px), linear-gradient(to bottom, #252846 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }}
      />

      {/* Center Headline */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#171a30]/90 border border-cyan-500/40 text-cyan-300 text-xs sm:text-sm font-inter font-semibold uppercase tracking-widest mb-5 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
          {spotlightDrop ? (
            <>
              {renderCategoryIcon(spotlightDrop.category)}
              <span>
                TRENDING #1 · {spotlightDrop.category.toUpperCase()} · T-{spotlightDrop.daysRemaining}D ·{' '}
                {spotlightDrop.name.toUpperCase()}
              </span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>AHEADOFYOU LIVE RELEASE RADAR</span>
            </>
          )}
        </div>

        <h1
          ref={headlineRef}
          className="font-bebas text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight leading-[0.92] text-white flex flex-wrap justify-center gap-x-3 sm:gap-x-5 gap-y-1 transform origin-center will-change-transform"
        >
          {headlineWords.map((word, i) => (
            <span
              key={i}
              ref={(el) => {
                if (el) wordsRef.current[i] = el;
              }}
              className={`inline-block ${
                word === 'CULTURE'
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#22d3ee] via-[#8b5cf6] to-[#ff3d71]'
                  : word === 'DROPS'
                  ? 'text-[#ff3d71]'
                  : 'text-white'
              }`}
            >
              {word}
            </span>
          ))}
        </h1>

        <p className="mt-5 text-sm sm:text-lg text-slate-300 max-w-2xl font-inter font-light tracking-wide leading-relaxed">
          {spotlightDrop
            ? `Trending #1 across the radar: ${spotlightDrop.name} (${spotlightDrop.category}) launches ${spotlightDrop.date} on ${spotlightDrop.platform}.`
            : 'Movies, Anime, Games, Dramas, Books and Manga. Real-time countdowns, audited drop calendars, and breaking scoops.'}
        </p>

        {/* Live #1 Trending Release Spotlight Bar with Remaining Time Clock */}
        {spotlightDrop && (
          <div className="mt-6 w-full max-w-3xl rounded-2xl bg-[#121528]/90 border border-[#2b3052] hover:border-cyan-400/60 backdrop-blur-md p-3.5 sm:p-4 flex flex-col gap-3 shadow-[0_0_30px_rgba(11,13,26,0.8)] transition-colors">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-left min-w-0">
                <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-[#2b3052] bg-[#171a30]">
                  <img
                    src={spotlightDrop.image || '/src/assets/images/bank_heist_web_aftermath_1793361604681.jpg'}
                    alt={spotlightDrop.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider">
                    <span className="text-[#ff3d71] font-bold">
                      TRENDING NOW · {spotlightDrop.category.toUpperCase()}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-cyan-300 font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {spotlightDrop.date}
                    </span>
                  </div>
                  <p className="font-bebas text-xl sm:text-2xl text-white tracking-wide truncate leading-tight">
                    {spotlightDrop.name}
                  </p>
                  <p className="text-[11px] font-inter text-slate-400 truncate">
                    {spotlightDrop.platform}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onScrollNext}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#ff3d71] to-[#8b5cf6] text-white text-xs font-inter font-bold flex items-center gap-1.5 hover:opacity-95 transition-opacity shadow-lg"
                >
                  <span>Full Clock</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                {onOpenModal && (
                  <button
                    type="button"
                    onClick={() => onOpenModal(spotlightDrop)}
                    className="px-3 py-2 rounded-xl bg-[#171a30] hover:bg-[#202444] border border-[#2b3052] text-xs font-inter font-semibold text-cyan-300 transition-colors"
                  >
                    Intel
                  </button>
                )}
              </div>
            </div>

            {/* Live Remaining Time to Release Readout */}
            <div
              ref={clockRowRef}
              className="pt-2.5 border-t border-[#252846] rounded-xl px-2 pb-1 flex flex-wrap items-center justify-between gap-2"
            >
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-300 flex items-center gap-1.5">
                <Clock
                  className={`w-3.5 h-3.5 animate-pulse ${
                    isImminentSpotlight ? 'text-[#ff3d71]' : 'text-cyan-400'
                  }`}
                />
                Remaining Time to Release
              </span>
              {spotlightRemaining.isReleased ? (
                <span className="text-xs font-mono font-bold text-emerald-300">
                  OUT NOW · Released {spotlightDrop.date}
                </span>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2 font-mono tabular-nums">
                  {[
                    { unit: 'D', val: spotlightRemaining.days },
                    { unit: 'H', val: spotlightRemaining.hours },
                    { unit: 'M', val: spotlightRemaining.minutes },
                    { unit: 'S', val: spotlightRemaining.seconds }
                  ].map((part, idx) => (
                    <span
                      key={part.unit}
                      className={`px-2 py-0.5 rounded-lg bg-[#0b0d1a] border text-xs sm:text-sm font-bold text-white inline-flex items-baseline ${
                        isImminentSpotlight ? 'border-[#ff3d71]/45' : 'border-[#2b3052]'
                      }`}
                    >
                      <span
                        ref={(el) => {
                          clockDigitRefs.current[idx] = el;
                        }}
                        className="inline-block will-change-transform"
                      >
                        {String(part.val).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] text-cyan-400 ml-0.5">{part.unit}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Scroll Down Indicator */}
      <div
        ref={scrollIndicatorRef}
        onClick={onScrollNext}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 cursor-pointer text-slate-400 hover:text-cyan-400 transition-colors group"
      >
        <span className="text-[11px] font-mono uppercase tracking-[0.25em] font-semibold">Scroll</span>
        <div className="w-6 h-10 rounded-full border-2 border-slate-500 group-hover:border-cyan-400 flex items-start justify-center p-1 transition-colors">
          <div className="w-1.5 h-2.5 rounded-full bg-cyan-400 animate-bounce" />
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 -mt-1" />
      </div>
    </section>
  );
};
