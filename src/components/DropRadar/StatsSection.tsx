import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, ShieldCheck, Radio, Database } from 'lucide-react';
import { STATS_METRICS } from '../../data/dropRadarData';
import { useDropData } from '../../context/DropDataContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const StatsSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { drops, syncStatus } = useDropData();
  const [counts, setCounts] = useState<number[]>([0, 0, 0, 0]);
  const hasAnimated = useRef(false);

  const metrics = useMemo(() => {
    return STATS_METRICS.map((m, idx) => {
      if (idx === 0 && drops.length > 0) {
        return { ...m, value: Math.max(m.value, drops.length) };
      }
      if (idx === 1 && syncStatus?.sources?.length) {
        return { ...m, value: Math.max(m.value, syncStatus.sources.length) };
      }
      return m;
    });
  }, [drops.length, syncStatus?.sources?.length]);

  const icons = [Database, Radio, Activity, ShieldCheck];
  const accents = ['#ff3d71', '#8b5cf6', '#22d3ee', '#10b981'];

  useEffect(() => {
    if (hasAnimated.current) {
      setCounts(metrics.map((m) => m.value));
    }
  }, [metrics]);

  useEffect(() => {
    const timers: number[] = [];
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 82%',
        onEnter: () => {
          if (hasAnimated.current) return;
          hasAnimated.current = true;

          // Animate count values
          metrics.forEach((metric, idx) => {
            const target = metric.value;
            const duration = 1600;
            const steps = 50;
            const stepTime = duration / steps;
            let current = 0;
            const increment = target / steps;

            const timer = window.setInterval(() => {
              current += increment;
              if (current >= target) {
                setCounts((prev) => {
                  const updated = [...prev];
                  updated[idx] = target;
                  return updated;
                });
                window.clearInterval(timer);
              } else {
                setCounts((prev) => {
                  const updated = [...prev];
                  updated[idx] = idx === 3 ? parseFloat(current.toFixed(1)) : Math.floor(current);
                  return updated;
                });
              }
            }, stepTime);
            timers.push(timer);
          });
        }
      });
    }, sectionRef);

    return () => {
      timers.forEach((t) => window.clearInterval(t));
      ctx.revert();
    };
  }, [metrics]);

  return (
    <section
      id="stats"
      ref={sectionRef}
      className="relative w-full py-16 sm:py-24 lg:py-32 bg-[#0b0d1a] border-y border-[#252846]/60 overflow-x-clip"
    >
      {/* Center Radar Sweep Line Animation */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.1),transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171a30] border border-[#252846] text-[#22d3ee] text-xs font-mono font-semibold uppercase tracking-widest mb-3">
            <Radio className="w-3.5 h-3.5 animate-pulse shrink-0" />
            <span>Telemetry & Platform Integrity</span>
          </div>
          <h2 className="font-bebas text-[clamp(2.25rem,5.5vw,3.75rem)] leading-none text-white tracking-wide text-balance">
            AUDITED BY THE <span className="text-[#8b5cf6]">RADAR ENGINE</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto font-inter mt-3">
            Real-time synchronization across theatrical distributors, digital stores, and international streaming syndicates.
          </p>
        </div>

        {/* 4 Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {metrics.map((metric, idx) => {
            const Icon = icons[idx];
            const accent = accents[idx];
            const displayVal = counts[idx] || 0;

            return (
              <div
                key={idx}
                className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#121528]/90 border border-[#252846] backdrop-blur-md relative overflow-hidden group hover:border-[#8b5cf6]/50 transition-all hover:scale-[1.02] shadow-xl"
              >
                {/* Glow Backdrop */}
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 group-hover:opacity-20 transition-opacity blur-2xl pointer-events-none"
                  style={{ backgroundColor: accent }}
                />

                <div className="flex items-center justify-between mb-5 sm:mb-6">
                  <div
                    className="p-3 rounded-2xl bg-[#171a30] border border-[#2b3052]"
                    style={{ color: accent }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">LIVE</span>
                </div>

                <div
                  className="font-bebas text-[clamp(2.75rem,5vw,3.75rem)] leading-none text-white tabular-nums tracking-tight mb-2 flex items-baseline"
                  style={{ textShadow: `0 0 20px ${accent}44` }}
                >
                  <span>{displayVal}</span>
                  <span className="text-2xl sm:text-4xl ml-0.5" style={{ color: accent }}>
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
