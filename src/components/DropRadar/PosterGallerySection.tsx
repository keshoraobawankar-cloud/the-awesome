import React, { useEffect, useRef } from 'react';
import { Eye, Bell, BellRing, Check, Sparkles } from 'lucide-react';
import { DROP_TITLES_12, DropTitle } from '../../data/dropRadarData';
import { useBugle } from '../../context/BugleContext';
import { useDropData } from '../../context/DropDataContext';
import { useNotifications } from '../../context/NotificationContext';
import { FormatBadge, inferMovieFormats } from './FormatBadge';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface PosterGallerySectionProps {
  onOpenModal: (drop: DropTitle) => void;
}

export const PosterGallerySection: React.FC<PosterGallerySectionProps> = ({ onOpenModal }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const col1Ref = useRef<HTMLDivElement>(null);
  const col2Ref = useRef<HTMLDivElement>(null);
  const col3Ref = useRef<HTMLDivElement>(null);

  const { drops } = useDropData();
  const displayDrops = (drops && drops.length >= 6) ? drops : DROP_TITLES_12;

  // Divide the titles into 3 columns
  const perCol = Math.ceil(displayDrops.length / 3);
  const col1 = displayDrops.slice(0, perCol);
  const col2 = displayDrops.slice(perCol, perCol * 2);
  const col3 = displayDrops.slice(perCol * 2);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Column 1: Slow speed
      gsap.fromTo(
        col1Ref.current,
        { y: 20, rotation: 0 },
        {
          y: -40,
          rotation: -1.0,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
            invalidateOnRefresh: true
          }
        }
      );

      // Column 2: Fast speed with slight reverse rotation
      gsap.fromTo(
        col2Ref.current,
        { y: 60, rotation: 0 },
        {
          y: -110,
          rotation: 1.0,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.8,
            invalidateOnRefresh: true
          }
        }
      );

      // Column 3: Medium speed
      gsap.fromTo(
        col3Ref.current,
        { y: 35, rotation: 0 },
        {
          y: -70,
          rotation: -0.75,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
            invalidateOnRefresh: true
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="poster-gallery"
      ref={sectionRef}
      className="relative w-full py-28 sm:py-36 bg-[#0b0d1a] overflow-hidden"
    >
      {/* Background Accent Gradient Lights */}
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-[radial-gradient(circle,rgba(255,61,113,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-1/3 right-10 w-96 h-96 bg-[radial-gradient(circle,rgba(139,92,246,0.15)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171a30] border border-[#252846] text-[#ff3d71] text-xs font-mono font-semibold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Velocity Parallax</span>
          </div>
          <h2 className="font-bebas text-4xl sm:text-6xl md:text-7xl text-white tracking-wide">
            POSTER <span className="text-[#ff3d71]">PARALLAX GALLERY</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto font-inter mt-3">
            Three columns moving at asynchronous velocities. Posters brighten, tilt, and enlarge as you scroll through the focal core.
          </p>
        </div>

        {/* 3-Column Parallax Grid */}
        <div className="overflow-hidden pt-12 pb-8 -mx-2 px-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Column 1 (Slow) */}
            <div ref={col1Ref} className="space-y-8 will-change-transform">
              {col1.map((drop) => (
                <PosterCard key={drop.id} drop={drop} onOpen={() => onOpenModal(drop)} />
              ))}
            </div>

            {/* Column 2 (Fast) */}
            <div ref={col2Ref} className="space-y-8 will-change-transform md:pt-12">
              {col2.map((drop) => (
                <PosterCard key={drop.id} drop={drop} onOpen={() => onOpenModal(drop)} />
              ))}
            </div>

            {/* Column 3 (Medium) */}
            <div ref={col3Ref} className="space-y-8 will-change-transform md:pt-6">
              {col3.map((drop) => (
                <PosterCard key={drop.id} drop={drop} onOpen={() => onOpenModal(drop)} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Poster Card with Proximity Brightness and Quick Actions
const PosterCard: React.FC<{ drop: DropTitle; onOpen: () => void }> = ({ drop, onOpen }) => {
  const { isWatchlisted, toggleWatchlist } = useBugle();
  const { hasActiveRuleFor, openNotifyModal } = useNotifications();
  const isSaved = isWatchlisted(drop.id);
  const hasAlert = hasActiveRuleFor(drop.id);

  return (
    <div
      onClick={onOpen}
      className="group relative rounded-2xl overflow-hidden bg-[#121528] border border-[#252846] hover:border-[#22d3ee]/60 transition-all duration-500 hover:scale-[1.03] shadow-xl hover:shadow-[0_0_30px_rgba(34,211,238,0.25)] cursor-pointer select-none"
    >
      {/* Poster Image */}
      <div className="aspect-[3/4] relative overflow-hidden bg-[#171a30]">
        <img
          src={drop.image || '/src/assets/images/bank_heist_web_aftermath_1793361604681.jpg'}
          alt={drop.name}
          className="w-full h-full object-cover filter brightness-90 contrast-110 group-hover:brightness-110 group-hover:scale-105 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d1a] via-[#0b0d1a]/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Category Pill Tag */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#0b0d1a]/80 backdrop-blur-md text-cyan-300 border border-cyan-500/30">
            {drop.category}
          </span>
        </div>

        {/* Days Badge */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-[#ff3d71] text-white shadow-[0_0_12px_rgba(255,61,113,0.6)]">
            T-{drop.daysRemaining}D
          </span>
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-[#0b0d1a]/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            className="p-3 rounded-full bg-cyan-400 text-[#0b0d1a] hover:scale-110 transition-transform font-bold"
            title="Inspect Trailer & Details"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWatchlist(drop.id, drop.name);
            }}
            className={`p-3 rounded-full transition-transform hover:scale-110 ${
              isSaved ? 'bg-emerald-500 text-white' : 'bg-[#171a30] text-white border border-[#2b3052]'
            }`}
            title="Remind me on drop"
          >
            {isSaved ? <Check className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openNotifyModal({
                targetId: drop.id,
                targetName: drop.name,
                targetType: 'drop',
                category: drop.category,
                targetDate: drop.date
              });
            }}
            className={`p-3 rounded-full transition-transform hover:scale-110 ${
              hasAlert
                ? 'bg-cyan-400 text-[#0b0d1a]'
                : 'bg-[#171a30] text-cyan-300 border border-cyan-500/40'
            }`}
            title="Set custom notification"
          >
            <BellRing className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Card Info Footer */}
      <div className="p-5">
        <h3 className="font-bebas text-2xl text-white group-hover:text-cyan-300 transition-colors tracking-wide truncate mb-1">
          {drop.name}
        </h3>
        {drop.category === 'Movies' && (
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            {inferMovieFormats(drop).map((fmt) => (
              <FormatBadge key={fmt} format={fmt} size="xs" />
            ))}
          </div>
        )}
        <p className="text-xs text-slate-400 font-inter line-clamp-1 mb-3">
          {drop.tagline}
        </p>

        <div className="flex items-center justify-between text-[11px] font-mono pt-3 border-t border-[#252846]/60">
          <span className="text-slate-400 truncate max-w-[150px]">{drop.platform}</span>
          <span
            className={`font-semibold ${
              drop.status === 'Confirmed'
                ? 'text-emerald-400'
                : drop.status === 'Tentative'
                ? 'text-amber-400'
                : 'text-[#ff3d71]'
            }`}
          >
            {drop.status}
          </span>
        </div>
      </div>
    </div>
  );
};
