import React, { useEffect, useRef } from 'react';
import { Calendar, Clock, Bell, Check, Film, Sparkles, Gamepad2, Tv, BookOpen, Layers } from 'lucide-react';
import { THIS_WEEK_TIMELINE, TimelineDrop, DROP_TITLES_12, DropTitle } from '../../data/dropRadarData';
import { useBugle } from '../../context/BugleContext';
import { useDropData } from '../../context/DropDataContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import confetti from 'canvas-confetti';

gsap.registerPlugin(ScrollTrigger);

interface TimelineSectionProps {
  onOpenModal: (drop: DropTitle) => void;
}

export const TimelineSection: React.FC<TimelineSectionProps> = ({ onOpenModal }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);

  const { isWatchlisted, toggleWatchlist } = useBugle();
  const { drops } = useDropData();
  const allDrops = (drops && drops.length > 0) ? drops : DROP_TITLES_12;

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Scroll-linked vertical drawing line
      gsap.fromTo(
        lineRef.current,
        { height: '0%' },
        {
          height: '100%',
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            end: 'bottom 85%',
            scrub: true
          }
        }
      );

      // 2. Pop-in alternating cards
      cardRefs.current.forEach((card, idx) => {
        if (!card) return;
        const isLeft = idx % 2 === 0;
        gsap.fromTo(
          card,
          {
            opacity: 0,
            x: isLeft ? -50 : 50,
            scale: 0.92
          },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.8,
            ease: 'back.out(1.4)',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const getStatusBadge = (status: TimelineDrop['status']) => {
    switch (status) {
      case 'Confirmed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            Confirmed
          </span>
        );
      case 'Tentative':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            Tentative
          </span>
        );
      case 'Delayed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#ff3d71]/20 text-[#ff3d71] border border-[#ff3d71]/40">
            Delayed
          </span>
        );
    }
  };

  const findMatchingDrop = (timelineItem: TimelineDrop): DropTitle => {
    const found = allDrops.find(
      (d) => d.name.toLowerCase().includes(timelineItem.title.toLowerCase().slice(0, 10))
    );
    return (
      found || {
        id: timelineItem.id,
        name: timelineItem.title,
        category: timelineItem.category,
        date: timelineItem.dateStr,
        daysRemaining: 4,
        status: timelineItem.status,
        platform: timelineItem.platform,
        gradient: 'from-[#8b5cf6] via-[#22d3ee] to-[#0b0d1a]',
        accent: '#8b5cf6',
        tagline: timelineItem.highlight,
        description: `${timelineItem.title} drops on ${timelineItem.dateStr} via ${timelineItem.platform}.`
      }
    );
  };

  return (
    <section
      id="timeline"
      ref={sectionRef}
      className="relative w-full py-24 sm:py-32 bg-[#0b0d1a] overflow-hidden"
    >
      {/* Background Neon Web Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(34,211,238,0.08)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 sm:mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171a30] border border-[#252846] text-cyan-400 text-xs font-mono font-semibold uppercase tracking-widest mb-3">
            <Clock className="w-3.5 h-3.5" />
            <span>Scroll-Linked Radar Line</span>
          </div>
          <h2 className="font-bebas text-4xl sm:text-6xl md:text-7xl text-white tracking-wide">
            THIS WEEK <span className="text-[#22d3ee]">TIMELINE</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto font-inter mt-3">
            Watch the central trajectory line calibrate as you scroll down. Alternating daily drops, confirmed platforms, and early pre-loads.
          </p>
        </div>

        {/* Timeline Container with Center Glowing Line */}
        <div className="relative">
          {/* Static Track Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[3px] -translate-x-1/2 bg-[#1f233f]" />

          {/* Dynamic Scroll-Drawn Glowing Line */}
          <div
            ref={lineRef}
            className="absolute left-4 md:left-1/2 top-0 w-[3px] -translate-x-1/2 bg-gradient-to-b from-[#ff3d71] via-[#8b5cf6] to-[#22d3ee] shadow-[0_0_15px_#22d3ee] will-change-transform"
          />

          {/* Timeline Cards */}
          <div className="space-y-12 sm:space-y-16">
            {THIS_WEEK_TIMELINE.map((drop, idx) => {
              const isLeft = idx % 2 === 0;
              const isReminded = isWatchlisted(drop.id);
              const matchingDrop = findMatchingDrop(drop);

              return (
                <div
                  key={drop.id}
                  ref={(el) => {
                    if (el) cardRefs.current[idx] = el;
                  }}
                  className={`relative flex flex-col md:flex-row items-start ${
                    isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                  } gap-6 md:gap-12 pl-10 md:pl-0`}
                >
                  {/* Central Timeline Beacon Node */}
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 top-6 w-5 h-5 rounded-full bg-[#0b0d1a] border-2 border-cyan-400 shadow-[0_0_10px_#22d3ee] z-20 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  </div>

                  {/* Card Content Block */}
                  <div className={`w-full md:w-1/2 ${isLeft ? 'md:text-right' : 'md:text-left'}`}>
                    <div
                      onClick={() => onOpenModal(matchingDrop)}
                      className="p-6 rounded-2xl bg-[#121528] border border-[#252846] hover:border-cyan-400/50 backdrop-blur-md transition-all duration-300 hover:shadow-[0_0_25px_rgba(34,211,238,0.15)] group cursor-pointer"
                    >
                      {/* Top Badges */}
                      <div
                        className={`flex items-center gap-2 mb-3 ${
                          isLeft ? 'md:justify-end' : 'md:justify-start'
                        }`}
                      >
                        <span className="text-xs font-mono font-semibold text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                          {drop.day} · {drop.dateStr}
                        </span>
                        {getStatusBadge(drop.status)}
                      </div>

                      {/* Drop Title */}
                      <h3 className="font-bebas text-2xl sm:text-3xl text-white group-hover:text-cyan-300 transition-colors tracking-wide mb-2">
                        {drop.title}
                      </h3>

                      {/* Highlight Deck */}
                      <p className="text-sm text-slate-300 font-inter mb-4 line-clamp-2">
                        {drop.highlight}
                      </p>

                      {/* Footer & Actions */}
                      <div
                        className={`flex items-center gap-3 pt-3 border-t border-[#252846]/60 ${
                          isLeft ? 'md:justify-end' : 'md:justify-start'
                        }`}
                      >
                        <span className="text-xs font-mono text-cyan-400/90 font-medium bg-[#171a30] px-2.5 py-1 rounded-md border border-[#2b3052]">
                          {drop.platform}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWatchlist(drop.id, drop.title);
                            if (!isReminded) {
                              confetti({
                                particleCount: 40,
                                spread: 50,
                                origin: { y: 0.6 }
                              });
                            }
                          }}
                          className={`p-1.5 rounded-lg border text-xs font-inter flex items-center gap-1 transition-all ${
                            isReminded
                              ? 'bg-emerald-600 text-white border-emerald-500'
                              : 'bg-[#171a30] text-slate-400 border-[#2b3052] hover:text-white hover:border-[#8b5cf6]'
                          }`}
                          title="Remind me for this drop"
                        >
                          {isReminded ? (
                            <Check className="w-4 h-4 text-white" />
                          ) : (
                            <Bell className="w-4 h-4" />
                          )}
                          <span className="text-[11px] font-mono">
                            {isReminded ? 'Saved' : 'Remind'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Empty Spacer Column on Desktop */}
                  <div className="hidden md:block w-1/2" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
