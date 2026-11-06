import React, { useEffect, useRef, useState } from 'react';
import { Activity, ShieldCheck, Radio, Database } from 'lucide-react';
import { STATS_METRICS } from '../../data/dropRadarData';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const StatsSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [counts, setCounts] = useState<number[]>([0, 0, 0, 0]);
  const hasAnimated = useRef(false);

  const icons = [Database, Radio, Activity, ShieldCheck];
  const accents = ['#ff3d71', '#8b5cf6', '#22d3ee', '#10b981'];

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          if (hasAnimated.current) return;
          hasAnimated.current = true;

          // Animate count values
          STATS_METRICS.forEach((metric, idx) => {
            const target = metric.value;
            const duration = 1800;
            const steps = 60;
            const stepTime = duration / steps;
            let current = 0;
            const increment = target / steps;

            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                setCounts((prev) => {
                  const updated = [...prev];
                  updated[idx] = target;
                  return updated;
                });
                clearInterval(timer);
              } else {
                setCounts((prev) => {
                  const updated = [...prev];
                  updated[idx] = idx === 3 ? parseFloat(current.toFixed(1)) : Math.floor(current);
                  return updated;
                });
              }
            }, stepTime);
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="stats"
      ref={sectionRef}
      className="relative w-full py-24 sm:py-32 bg-[#0b0d1a] border-y border-[#252846]/60 overflow-hidden"
    >
      {/* Center Radar Sweep Line Animation */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.1),transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171a30] border border-[#252846] text-[#22d3ee] text-xs font-mono font-semibold uppercase tracking-widest mb-3">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Telemetry & Platform Integrity</span>
          </div>
          <h2 className="font-bebas text-4xl sm:text-6xl text-white tracking-wide">
            AUDITED BY THE <span className="text-[#8b5cf6]">RADAR ENGINE</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto font-inter mt-3">
            Real-time synchronization across theatrical distributors, digital stores, and international streaming syndicates.
          </p>
        </div>

        {/* 4 Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS_METRICS.map((metric, idx) => {
            const Icon = icons[idx];
            const accent = accents[idx];
            const displayVal = counts[idx] || 0;

            return (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-[#121528]/90 border border-[#252846] backdrop-blur-md relative overflow-hidden group hover:border-[#8b5cf6]/50 transition-all hover:scale-[1.02] shadow-xl"
              >
                {/* Glow Backdrop */}
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 group-hover:opacity-20 transition-opacity blur-2xl pointer-events-none"
                  style={{ backgroundColor: accent }}
                />

                <div className="flex items-center justify-between mb-6">
                  <div
                    className="p-3 rounded-2xl bg-[#171a30] border border-[#2b3052]"
                    style={{ color: accent }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">LIVE</span>
                </div>

                <div
                  className="font-bebas text-5xl sm:text-6xl text-white font-variant-numeric tabular-nums tracking-tight mb-2 flex items-baseline"
                  style={{ textShadow: `0 0 20px ${accent}44` }}
                >
                  <span>{displayVal}</span>
                  <span className="text-3xl sm:text-4xl ml-0.5" style={{ color: accent }}>
                    {metric.suffix}
                  </span>
                </div>

                <h3 className="font-inter font-bold text-base text-white mb-1">
                  {metric.label}
                </h3>
                <p className="font-inter text-xs text-slate-400 leading-relaxed">
                  {metric.detail}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
