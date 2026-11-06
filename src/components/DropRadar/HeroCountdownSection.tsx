import React, { useEffect, useRef, useState } from 'react';
import { Bell, Check, Play, Calendar, ExternalLink, Sparkles, Flame } from 'lucide-react';
import { HERO_FEATURED_DROP, DropTitle } from '../../data/dropRadarData';
import { useBugle } from '../../context/BugleContext';
import { useDropData } from '../../context/DropDataContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import confetti from 'canvas-confetti';

gsap.registerPlugin(ScrollTrigger);

interface HeroCountdownSectionProps {
  onOpenModal: (drop: DropTitle) => void;
}

export const HeroCountdownSection: React.FC<HeroCountdownSectionProps> = ({ onOpenModal }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgImageRef = useRef<HTMLImageElement>(null);
  const contentCardRef = useRef<HTMLDivElement>(null);
  const digitsRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  const { heroDrop } = useDropData();
  const currentDrop = heroDrop || HERO_FEATURED_DROP;

  const { isWatchlisted, toggleWatchlist } = useBugle();
  const isSaved = isWatchlisted(currentDrop.id);

  // Live countdown state
  const targetDate = new Date(currentDrop.date).getTime() || new Date('2026-11-19T00:00:00Z').getTime();
  const [timeLeft, setTimeLeft] = useState({
    days: currentDrop.daysRemaining || 13,
    hours: 8,
    minutes: 42,
    seconds: 19
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const diff = Math.max(0, targetDate - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Pinned ScrollTrigger for the Hero Countdown Section
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=110%',
          pin: true,
          scrub: 1.2,
          anticipatePin: 1
        }
      });

      // 1. Backdrop slowly zooms (1 to 1.18) as user scrolls
      tl.to(
        bgImageRef.current,
        {
          scale: 1.18,
          ease: 'none'
        },
        0
      );

      // 2. Countdown digits roll in and scale slightly
      tl.fromTo(
        digitsRef.current,
        { y: 60, opacity: 0.6, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, ease: 'power2.out' },
        0.1
      );

      // 3. Title, info, and buttons slide up in sequence
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
          src={currentDrop.image || "/src/assets/images/bank_heist_web_aftermath_1793361604681.jpg"}
          alt="Hero Featured Drop Backdrop"
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
            <Flame className="w-3.5 h-3.5 animate-bounce" />
            #1 Most Anticipated Drop
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
          <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto font-inter font-light mb-8">
            {currentDrop.tagline}
          </p>
        </div>

        {/* Digital Roll-In Countdown Digits */}
        <div
          ref={digitsRef}
          className="grid grid-cols-4 gap-2 sm:gap-4 md:gap-6 max-w-3xl w-full mb-8 will-change-transform"
        >
          {[
            { label: 'DAYS', value: timeLeft.days },
            { label: 'HOURS', value: timeLeft.hours },
            { label: 'MINUTES', value: timeLeft.minutes },
            { label: 'SECONDS', value: timeLeft.seconds }
          ].map((item, idx) => (
            <div
              key={idx}
              className="relative p-3 sm:p-5 rounded-2xl bg-[#121528]/85 border border-[#2b3052] backdrop-blur-md shadow-[0_0_25px_rgba(11,13,26,0.8)] flex flex-col items-center group hover:border-[#8b5cf6] transition-colors"
            >
              <div className="font-bebas text-4xl sm:text-6xl md:text-7xl text-white font-variant-numeric tabular-nums tracking-wider text-glow-cyan">
                {String(item.value).padStart(2, '0')}
              </div>
              <span className="text-[10px] sm:text-xs font-mono font-semibold tracking-widest text-[#8b5cf6] uppercase mt-1">
                {item.label}
              </span>
              <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            </div>
          ))}
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
            onClick={() => onOpenModal(currentDrop)}
            className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-[#171a30] hover:bg-[#202444] border border-[#2b3052] text-white font-inter font-semibold text-sm sm:text-base flex items-center gap-2 transition-all hover:border-cyan-400 group"
          >
            <Play className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform fill-cyan-400" />
            <span>Trailer & Intel</span>
          </button>
        </div>

        {/* Date and Platform footer notes */}
        <div className="mt-8 flex items-center gap-4 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            Launch Date: {currentDrop.date}
          </span>
          <span>•</span>
          <span>Verified by Tickora Desk</span>
        </div>
      </div>
    </section>
  );
};
