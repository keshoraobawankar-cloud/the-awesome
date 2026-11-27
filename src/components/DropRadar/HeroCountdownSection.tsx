import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  BellRing,
  Check,
  Play,
  Calendar,
  Flame,
  Gamepad2,
  Film,
  Sparkles,
  Tv,
  BookOpen,
  FileText,
  Clock
} from 'lucide-react';
import {
  computeRemainingTime,
  formatRemainingLabel,
  parseReleaseTimestamp
} from '../../utils/countdown';
import { HERO_FEATURED_DROP, DropTitle } from '../../data/dropRadarData';
import { useBugle } from '../../context/BugleContext';
import { useDropData } from '../../context/DropDataContext';
import { useNotifications } from '../../context/NotificationContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import confetti from 'canvas-confetti';

gsap.registerPlugin(ScrollTrigger);

interface HeroCountdownSectionProps {
  onOpenModal: (drop: DropTitle) => void;
}

function renderHeroCategoryIcon(category?: DropTitle['category']) {
  switch (category) {
    case 'Games':
      return <Gamepad2 className="w-3.5 h-3.5" />;
    case 'Movies':
      return <Film className="w-3.5 h-3.5" />;
    case 'Anime':
      return <Sparkles className="w-3.5 h-3.5" />;
    case 'Dramas':
      return <Tv className="w-3.5 h-3.5" />;
    case 'Books':
      return <BookOpen className="w-3.5 h-3.5" />;
    case 'Manga':
      return <FileText className="w-3.5 h-3.5" />;
    default:
      return <Flame className="w-3.5 h-3.5" />;
  }
}

export const HeroCountdownSection: React.FC<HeroCountdownSectionProps> = ({ onOpenModal }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgImageRef = useRef<HTMLImageElement>(null);
  const contentCardRef = useRef<HTMLDivElement>(null);
  const digitsRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const radarBeaconRef = useRef<HTMLDivElement>(null);
  const digitCardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const digitValueRefs = useRef<Array<HTMLDivElement | null>>([]);
  const scanLineRefs = useRef<Array<HTMLDivElement | null>>([]);
  const prevTimeRef = useRef<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  const { heroDrop, trendingDrops } = useDropData();
  const [selectedDropId, setSelectedDropId] = useState<string | null>(null);

  // Automatically promote the newest #1 trending release whenever backend heroDrop changes
  useEffect(() => {
    setSelectedDropId(null);
  }, [heroDrop?.id]);

  const currentDrop = useMemo(() => {
    if (selectedDropId) {
      const selected = trendingDrops.find((d) => d.id === selectedDropId);
      if (selected) return selected;
    }
    return heroDrop || trendingDrops[0] || HERO_FEATURED_DROP;
  }, [selectedDropId, trendingDrops, heroDrop]);

  const { isWatchlisted, toggleWatchlist } = useBugle();
  const { hasActiveRuleFor, openNotifyModal } = useNotifications();
  const isSaved = isWatchlisted(currentDrop.id);
  const hasAlert = hasActiveRuleFor(currentDrop.id);

  const targetDate = useMemo(
    () => parseReleaseTimestamp(currentDrop.date, currentDrop.daysRemaining),
    [currentDrop.id, currentDrop.date, currentDrop.daysRemaining]
  );
  const [timeLeft, setTimeLeft] = useState(() => computeRemainingTime(targetDate));

  useEffect(() => {
    setTimeLeft(computeRemainingTime(targetDate));
    const interval = setInterval(() => {
      setTimeLeft(computeRemainingTime(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const urgencyTier: 'released' | 'imminent' | 'approaching' | 'tracking' = timeLeft.isReleased
    ? 'released'
    : timeLeft.totalMs <= 24 * 60 * 60 * 1000
    ? 'imminent'
    : timeLeft.totalMs <= 7 * 24 * 60 * 60 * 1000
    ? 'approaching'
    : 'tracking';

  // Smooth GSAP digit transition when any unit ticks
  useEffect(() => {
    const current = {
      days: timeLeft.days,
      hours: timeLeft.hours,
      minutes: timeLeft.minutes,
      seconds: timeLeft.seconds
    };
    const prev = prevTimeRef.current;
    if (prev) {
      const units: Array<keyof typeof current> = ['days', 'hours', 'minutes', 'seconds'];
      units.forEach((unit, idx) => {
        if (prev[unit] !== current[unit]) {
          const valEl = digitValueRefs.current[idx];
          const cardEl = digitCardRefs.current[idx];
          if (valEl) {
            gsap.fromTo(
              valEl,
              { y: -12, opacity: 0.35, scale: 1.08 },
              { y: 0, opacity: 1, scale: 1, duration: 0.36, ease: 'power3.out', overwrite: 'auto' }
            );
          }
          if (cardEl) {
            const flashColor =
              urgencyTier === 'imminent'
                ? 'rgba(255, 61, 113, 0.9)'
                : 'rgba(34, 211, 238, 0.85)';
            gsap.fromTo(
              cardEl,
              { borderColor: flashColor },
              {
                borderColor: urgencyTier === 'imminent' ? 'rgba(255, 61, 113, 0.4)' : 'rgba(43, 48, 82, 1)',
                duration: 0.7,
                ease: 'power2.out',
                overwrite: 'auto'
              }
            );
          }
        }
      });
    }
    prevTimeRef.current = current;
  }, [timeLeft.days, timeLeft.hours, timeLeft.minutes, timeLeft.seconds, urgencyTier]);

  // Subtle high-stakes radar pulse & scan sweep scaled to release proximity
  useEffect(() => {
    if (urgencyTier === 'released') return;
    const ctx = gsap.context(() => {
      const pulseDuration = urgencyTier === 'imminent' ? 0.85 : urgencyTier === 'approaching' ? 1.35 : 2.1;
      const glowColor =
        urgencyTier === 'imminent'
          ? '0 0 28px rgba(255, 61, 113, 0.45)'
          : urgencyTier === 'approaching'
          ? '0 0 24px rgba(34, 211, 238, 0.32)'
          : '0 0 18px rgba(139, 92, 246, 0.25)';

      if (radarBeaconRef.current) {
        gsap.to(radarBeaconRef.current, {
          scale: urgencyTier === 'imminent' ? 1.03 : 1.015,
          boxShadow: glowColor,
          duration: pulseDuration,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }

      const validCards = digitCardRefs.current.filter(Boolean);
      if (validCards.length > 0) {
        gsap.to(validCards, {
          boxShadow: glowColor,
          duration: pulseDuration,
          stagger: { each: 0.08, from: 'start' },
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }

      const validScans = scanLineRefs.current.filter(Boolean);
      if (validScans.length > 0) {
        gsap.fromTo(
          validScans,
          { xPercent: -130, opacity: 0 },
          {
            xPercent: 240,
            opacity: urgencyTier === 'imminent' ? 0.55 : 0.35,
            duration: urgencyTier === 'imminent' ? 1.4 : 2.1,
            stagger: 0.12,
            repeat: -1,
            repeatDelay: urgencyTier === 'imminent' ? 0.5 : 1.6,
            ease: 'power1.inOut'
          }
        );
      }
    }, digitsRef);

    return () => ctx.revert();
  }, [urgencyTier]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=110%',
          pin: true,
          scrub: 1.2,
          invalidateOnRefresh: true,
          anticipatePin: 1
        }
      });

      tl.to(
        bgImageRef.current,
        {
          scale: 1.18,
          ease: 'none'
        },
        0
      );

      tl.fromTo(
        digitsRef.current,
        { y: 60, opacity: 0.6, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, ease: 'power2.out' },
        0.1
      );

      tl.fromTo(
        contentCardRef.current,
        { y: 80, opacity: 0.7 },
        { y: 0, opacity: 1, ease: 'power2.out' },
        0.2
      );

      tl.fromTo(
        actionsRef.current,
        { y: 40, opacity: 0.8 },
        { y: 0, opacity: 1, ease: 'power2.out' },
        0.3
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleRemindMe = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWatchlist(currentDrop.id, currentDrop.name);
    if (!isSaved) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#ff3d71', '#8b5cf6', '#22d3ee']
      });
    }
  };

  return (
    <section
      id="hero-countdown"
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-[#0b0d1a] flex items-center justify-center"
    >
      {/* Zooming Backdrop Image */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          ref={bgImageRef}
          src={currentDrop.image || '/src/assets/images/bank_heist_web_aftermath_1793361604681.jpg'}
          alt={`${currentDrop.name} Backdrop`}
          className="w-full h-full object-cover filter brightness-[0.38] contrast-125 will-change-transform transform scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d1a] via-[#0b0d1a]/60 to-[#0b0d1a]/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_20%,#0b0d1a_90%)]" />
      </div>

      {/* Main Glassmorphic Countdown Stage */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 w-full text-center flex flex-col items-center">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff3d71]/20 border border-[#ff3d71]/50 text-[#ff3d71] text-xs font-inter font-bold tracking-wider uppercase">
            {renderHeroCategoryIcon(currentDrop.category)}
            #1 Trending · {currentDrop.category}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-medium">
            {currentDrop.platform}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
            {currentDrop.status.toUpperCase()} WORLDWIDE
          </span>
        </div>

        {/* Big Release Title */}
        <div ref={contentCardRef} className="will-change-transform">
          <h2 className="font-bebas text-5xl sm:text-7xl md:text-8xl tracking-tight text-white mb-2 text-glow-red">
            {currentDrop.name}
          </h2>
          <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto font-inter font-light mb-7">
            {currentDrop.tagline}
          </p>
        </div>

        {/* Remaining Time to Release Big Clock */}
        <div ref={digitsRef} className="w-full max-w-3xl mb-7 will-change-transform">
          <div
            ref={radarBeaconRef}
            className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#121528]/90 border text-[11px] font-mono uppercase tracking-widest mb-3 ${
              urgencyTier === 'imminent'
                ? 'border-[#ff3d71]/60 text-rose-200'
                : 'border-cyan-500/35 text-cyan-300'
            }`}
          >
            <Clock
              className={`w-3.5 h-3.5 animate-pulse ${
                urgencyTier === 'imminent' ? 'text-[#ff3d71]' : 'text-cyan-400'
              }`}
            />
            <span>
              {timeLeft.isReleased
                ? `Released · ${currentDrop.date}`
                : urgencyTier === 'imminent'
                ? `Imminent Release Lock · ${formatRemainingLabel(timeLeft)}`
                : `Time Remaining to Release · ${formatRemainingLabel(timeLeft)}`}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-4 md:gap-6 w-full">
            {[
              { label: 'DAYS', value: timeLeft.days },
              { label: 'HOURS', value: timeLeft.hours },
              { label: 'MINUTES', value: timeLeft.minutes },
              { label: 'SECONDS', value: timeLeft.seconds }
            ].map((item, idx) => (
              <div
                key={idx}
                ref={(el) => {
                  digitCardRefs.current[idx] = el;
                }}
                className={`relative overflow-hidden p-3 sm:p-5 rounded-2xl bg-[#121528]/85 border backdrop-blur-md shadow-[0_0_25px_rgba(11,13,26,0.8)] flex flex-col items-center group hover:border-[#8b5cf6] transition-colors ${
                  urgencyTier === 'imminent' ? 'border-[#ff3d71]/40' : 'border-[#2b3052]'
                }`}
              >
                {/* Live Radar Scan Sweep */}
                <div
                  ref={(el) => {
                    scanLineRefs.current[idx] = el;
                  }}
                  className="pointer-events-none absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent skew-x-[-20deg]"
                />
                <div
                  ref={(el) => {
                    digitValueRefs.current[idx] = el;
                  }}
                  className="relative font-bebas text-4xl sm:text-6xl md:text-7xl text-white font-variant-numeric tabular-nums tracking-wider text-glow-cyan will-change-transform"
                >
                  {String(item.value).padStart(2, '0')}
                </div>
                <span className="relative text-[10px] sm:text-xs font-mono font-semibold tracking-widest text-[#8b5cf6] uppercase mt-1">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Slide-Up Action Row */}
        <div
          ref={actionsRef}
          className="flex flex-wrap items-center justify-center gap-4 will-change-transform"
        >
          <button
            onClick={handleRemindMe}
            className={`px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-inter font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-2xl transition-all ${
              isSaved
                ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                : 'bg-gradient-to-r from-[#ff3d71] via-[#8b5cf6] to-[#22d3ee] text-white hover:scale-105 shadow-[0_0_25px_rgba(255,61,113,0.4)]'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-5 h-5 text-white" />
                <span>Drop Reminder Set</span>
              </>
            ) : (
              <>
                <Bell className="w-5 h-5" />
                <span>Remind Me on Launch</span>
              </>
            )}
          </button>

          <button
            onClick={() =>
              openNotifyModal({
                targetId: currentDrop.id,
                targetName: currentDrop.name,
                targetType: 'drop',
                category: currentDrop.category,
                targetDate: currentDrop.date
              })
            }
            className={`px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl border font-inter font-semibold text-sm sm:text-base flex items-center gap-2 transition-all ${
              hasAlert
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.25)]'
                : 'bg-[#171a30] hover:bg-[#202444] border-[#2b3052] text-white hover:border-cyan-400'
            }`}
          >
            <BellRing className="w-4 h-4 text-cyan-400" />
            <span>{hasAlert ? 'Alert Configured' : 'Set Notification'}</span>
          </button>

          <button
            onClick={() => onOpenModal(currentDrop)}
            className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-[#171a30] hover:bg-[#202444] border border-[#2b3052] text-white font-inter font-semibold text-sm sm:text-base flex items-center gap-2 transition-all hover:border-cyan-400 group"
          >
            <Play className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform fill-cyan-400" />
            <span>Trailer & Intel</span>
          </button>
        </div>

        {/* Date and Platform footer notes */}
        <div className="mt-6 flex items-center gap-4 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            Launch Date: {currentDrop.date}
          </span>
          <span>•</span>
          <span>{currentDrop.trustedSourceLabel || 'Verified by AheadOfYou Desk'}</span>
        </div>

        {/* Trending Releases Quick-Switch Bar (All Categories) */}
        {trendingDrops.length > 1 && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mr-1">
              Trending Now:
            </span>
            {trendingDrops.map((item) => {
              const isActive = item.id === currentDrop.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedDropId(item.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-inter font-medium flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-[#ff3d71]/20 border-[#ff3d71] text-white shadow-[0_0_15px_rgba(255,61,113,0.3)]'
                      : 'bg-[#121528]/80 border-[#2b3052] text-slate-300 hover:border-cyan-400/60 hover:text-white'
                  }`}
                >
                  <span className="text-[10px] font-mono uppercase text-slate-400">
                    {item.category}
                  </span>
                  <span className="truncate max-w-[150px]">{item.name}</span>
                  <span className="font-mono text-[10px] text-cyan-300">T-{item.daysRemaining}D</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
