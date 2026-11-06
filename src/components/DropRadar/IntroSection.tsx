import React, { useEffect, useRef } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { DROP_TITLES_12 } from '../../data/dropRadarData';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface IntroSectionProps {
  onScrollNext: () => void;
}

export const IntroSection: React.FC<IntroSectionProps> = ({ onScrollNext }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const wordsRef = useRef<HTMLSpanElement[]>([]);
  const posterWallRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  const headlineWords = ['THE', 'NEXT', 'WAVE', 'OF', 'CULTURE', 'DROPS', 'HERE.'];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Initial word-by-word fade in animation on load
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

      // 2. ScrollTrigger timeline pinned for 100vh of scrolling
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=100%',
          pin: true,
          scrub: 1,
          anticipatePin: 1
        }
      });

      // As user scrolls:
      // - Headline scales up dramatically (1 to 2.4) and fades out
      // - Poster wall fades in behind it and scales from 0.85 to 1.05
      // - Scroll indicator fades out immediately
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
      {/* Background Poster Wall (Fades in on scroll) */}
      <div
        ref={posterWallRef}
        className="absolute inset-0 opacity-15 pointer-events-none transform scale-90 transition-all duration-300 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 p-4 overflow-hidden"
      >
        {DROP_TITLES_12.map((drop, idx) => (
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171a30]/90 border border-cyan-500/40 text-cyan-300 text-xs sm:text-sm font-inter font-semibold uppercase tracking-widest mb-6 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          <span>Cinematic Release Tracker</span>
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

        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl font-inter font-light tracking-wide leading-relaxed">
          Movies, Anime, Games, Dramas, Books and Manga. Real-time countdowns, audited drop calendars, and breaking scoops.
        </p>
      </div>

      {/* Scroll Down Indicator */}
      <div
        ref={scrollIndicatorRef}
        onClick={onScrollNext}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 cursor-pointer text-slate-400 hover:text-cyan-400 transition-colors group"
      >
        <span className="text-[11px] font-mono uppercase tracking-[0.25em] font-semibold">Scroll</span>
        <div className="w-6 h-10 rounded-full border-2 border-slate-500 group-hover:border-cyan-400 flex items-start justify-center p-1 transition-colors">
          <div className="w-1.5 h-2.5 rounded-full bg-cyan-400 animate-bounce" />
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 animate-pulse -mt-1" />
      </div>
    </section>
  );
};
