import React, { useEffect, useRef, useState } from 'react';
import { Film, Sparkles, Gamepad2, Tv, BookOpen, Layers, ArrowRight } from 'lucide-react';
import { CATEGORY_PANELS, CategoryPanel } from '../../data/dropRadarData';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface CategoryShowcaseSectionProps {
  onSelectCategory: (cat: string) => void;
  onScrollToTimeline: () => void;
}

export const CategoryShowcaseSection: React.FC<CategoryShowcaseSectionProps> = ({
  onSelectCategory,
  onScrollToTimeline
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const track = trackRef.current;
      const container = containerRef.current;
      if (!track || !container) return;

      const totalScrollWidth = track.scrollWidth - window.innerWidth + 80;

      // Pin the section while translating track horizontally
      gsap.to(track, {
        x: () => -totalScrollWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: () => `+=${totalScrollWidth}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="category-showcase"
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-[#0b0d1a] flex flex-col justify-center"
    >
      {/* Header bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full pt-8 pb-4 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-widest font-semibold mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Horizontal Spectrum Audit</span>
          </div>
          <h2 className="font-bebas text-4xl sm:text-6xl text-white tracking-wide">
            CATEGORY <span className="text-[#8b5cf6]">SHOWCASE</span>
          </h2>
        </div>
        <p className="hidden md:block text-xs font-mono text-slate-400 uppercase tracking-widest">
          Scroll vertically to glide across release sectors →
        </p>
      </div>

      {/* Horizontal Moving Track */}
      <div className="w-full overflow-hidden flex-1 flex items-center">
        <div
          ref={trackRef}
          className="flex gap-6 sm:gap-8 px-6 sm:px-12 w-max will-change-transform"
        >
          {CATEGORY_PANELS.map((panel, idx) => (
            <CategoryCard
              key={panel.id}
              panel={panel}
              index={idx}
              onSelect={() => {
                onSelectCategory(panel.title.split(' ')[0]);
                onScrollToTimeline();
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// 3D Tilt Card with Parallax Background & Animated Count
const CategoryCard: React.FC<{
  panel: CategoryPanel;
  index: number;
  onSelect: () => void;
}> = ({ panel, index, onSelect }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [displayCount, setDisplayCount] = useState(0);

  // Animate count-up number
  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const stepTime = 30;
    const steps = duration / stepTime;
    const increment = panel.count / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= panel.count) {
        setDisplayCount(panel.count);
        clearInterval(timer);
      } else {
        setDisplayCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [panel.count]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    setTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  const getIcon = () => {
    switch (panel.iconName) {
      case 'Film':
        return <Film className="w-6 h-6" style={{ color: panel.accent }} />;
      case 'Sparkles':
        return <Sparkles className="w-6 h-6" style={{ color: panel.accent }} />;
      case 'Gamepad2':
        return <Gamepad2 className="w-6 h-6" style={{ color: panel.accent }} />;
      case 'Tv':
        return <Tv className="w-6 h-6" style={{ color: panel.accent }} />;
      case 'BookOpen':
        return <BookOpen className="w-6 h-6" style={{ color: panel.accent }} />;
      default:
        return <Layers className="w-6 h-6" style={{ color: panel.accent }} />;
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onSelect}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
        transition: 'transform 0.15s ease-out'
      }}
      className="w-[300px] sm:w-[380px] h-[460px] sm:h-[500px] rounded-3xl p-6 sm:p-8 relative flex flex-col justify-between overflow-hidden cursor-pointer group bg-[#121528] border border-[#252846] hover:border-slate-300/40 shadow-2xl transition-shadow select-none"
    >
      {/* Background Gradient & Pattern */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${panel.bgGradient} opacity-60 group-hover:opacity-90 transition-opacity`}
      />
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(${panel.accent} 1.5px, transparent 1.5px)`,
          backgroundSize: '16px 16px'
        }}
      />

      {/* Top Header info */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="p-3 rounded-2xl bg-[#0b0d1a]/80 border border-[#2b3052] backdrop-blur-md">
          {getIcon()}
        </div>
        <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold">
          0{index + 1}
        </span>
      </div>

      {/* Center Big Number Count */}
      <div className="relative z-10 my-auto">
        <div
          className="font-bebas text-7xl sm:text-8xl leading-none font-bold tracking-tight text-white mb-2"
          style={{ textShadow: `0 0 30px ${panel.accent}55` }}
        >
          {displayCount}+
        </div>
        <p className="font-mono text-xs text-slate-300 uppercase tracking-widest font-semibold">
          {panel.countLabel}
        </p>
      </div>

      {/* Bottom Category Info & Action */}
      <div className="relative z-10">
        <h3 className="font-bebas text-3xl sm:text-4xl text-white tracking-wide mb-1">
          {panel.title}
        </h3>
        <p className="text-xs text-slate-300 font-inter mb-4 line-clamp-1">
          {panel.subtitle}
        </p>

        <div className="pt-4 border-t border-[#252846]/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Leading Drop
            </span>
            <p className="font-inter text-xs text-white font-semibold truncate max-w-[190px]">
              {panel.featuredTitle}
            </p>
          </div>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1"
            style={{ backgroundColor: `${panel.accent}22`, color: panel.accent }}
          >
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
