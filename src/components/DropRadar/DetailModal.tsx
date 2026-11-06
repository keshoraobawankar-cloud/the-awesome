import React, { useState, useEffect } from 'react';
import { X, Bell, Check, Play, Calendar, ExternalLink, Sparkles, Share2, ShieldCheck, Film } from 'lucide-react';
import { DropTitle } from '../../data/dropRadarData';
import { useBugle } from '../../context/BugleContext';
import confetti from 'canvas-confetti';

interface DetailModalProps {
  drop: DropTitle | null;
  onClose: () => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ drop, onClose }) => {
  const { isWatchlisted, toggleWatchlist, showToast } = useBugle();
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);

  // Live countdown calculation
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!drop) return;
    setIsPlayingTrailer(false);

    const target = new Date(drop.date).getTime() || Date.now() + drop.daysRemaining * 86400000;

    const calc = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown({ days, hours, minutes, seconds });
    };

    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [drop]);

  if (!drop) return null;

  const isSaved = isWatchlisted(drop.id);

  const handleToggleReminder = () => {
    toggleWatchlist(drop.id, drop.name);
    if (!isSaved) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#ff3d71', '#8b5cf6', '#22d3ee']
      });
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Drop link copied to clipboard!');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-[#0b0d1a]/85 backdrop-blur-2xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-3xl bg-[#121528] border-2 border-[#2b3052] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-[#0b0d1a]/80 text-slate-400 hover:text-white border border-[#252846] backdrop-blur-md transition-colors"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Video / Trailer Area (16:9 ratio) */}
        <div className="relative aspect-video w-full bg-[#0b0d1a] overflow-hidden flex-shrink-0">
          {isPlayingTrailer ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-black p-6 text-center">
              <Film className="w-12 h-12 text-cyan-400 animate-pulse mb-3" />
              <p className="font-bebas text-2xl text-white tracking-wide">
                STREAMING TEASER TRAILER
              </p>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Official {drop.category} Preview Feed · 4K HDR 60FPS
              </p>
              <button
                onClick={() => setIsPlayingTrailer(false)}
                className="mt-4 px-4 py-1.5 rounded-lg bg-[#252846] text-xs font-mono text-slate-300 hover:text-white"
              >
                Close Trailer Player
              </button>
            </div>
          ) : (
            <div className="relative w-full h-full group">
              <img
                src={drop.image || '/src/assets/images/bank_heist_web_aftermath_1793361604681.jpg'}
                alt={drop.name}
                className="w-full h-full object-cover filter brightness-75 contrast-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121528] via-transparent to-black/50" />

              {/* Play Trailer Button overlay */}
              <button
                onClick={() => setIsPlayingTrailer(true)}
                className="absolute inset-0 flex items-center justify-center group-hover:scale-105 transition-transform"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#ff3d71] via-[#8b5cf6] to-[#22d3ee] p-[2px] shadow-[0_0_30px_rgba(34,211,238,0.5)]">
                  <div className="w-full h-full rounded-full bg-[#0b0d1a]/85 backdrop-blur-md flex items-center justify-center pl-1 text-cyan-300 group-hover:text-white">
                    <Play className="w-8 h-8 fill-current" />
                  </div>
                </div>
              </button>

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-mono text-white pointer-events-none">
                <span className="bg-[#0b0d1a]/80 px-2.5 py-1 rounded-md border border-[#252846]">
                  Click to play trailer
                </span>
                <span className="bg-[#0b0d1a]/80 px-2.5 py-1 rounded-md border border-[#252846] text-cyan-400">
                  4K Official Teaser
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          {/* Top metadata tags */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-[#ff3d71] to-[#8b5cf6] text-white">
                {drop.category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#171a30] text-cyan-300 border border-[#2b3052]">
                {drop.platform}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono font-bold">
              <span
                className={`px-3 py-1 rounded-full border ${
                  drop.status === 'Confirmed'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : drop.status === 'Tentative'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                }`}
              >
                {drop.status}
              </span>
            </div>
          </div>

          {/* Title and Tagline */}
          <div>
            <h3 className="font-bebas text-3xl sm:text-5xl text-white tracking-wide mb-1">
              {drop.name}
            </h3>
            <p className="text-slate-400 text-sm sm:text-base font-inter">
              {drop.tagline}
            </p>
          </div>

          {/* Live Countdown Row */}
          <div className="p-4 rounded-2xl bg-[#0b0d1a] border border-[#252846]">
            <div className="flex items-center justify-between mb-3 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Calendar className="w-3.5 h-3.5" />
                Drop Target: {drop.date}
              </span>
              <span className="text-[#8b5cf6]">TICKING LIVE</span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { l: 'DAYS', v: countdown.days },
                { l: 'HOURS', v: countdown.hours },
                { l: 'MINS', v: countdown.minutes },
                { l: 'SECS', v: countdown.seconds }
              ].map((c, i) => (
                <div key={i} className="p-2 rounded-xl bg-[#171a30] border border-[#2b3052]">
                  <div className="font-bebas text-2xl sm:text-3xl text-white font-variant-numeric tabular-nums">
                    {String(c.v).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">{c.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Synopsis */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-2">
              Synopsis & Release Dossier
            </h4>
            <p className="text-sm sm:text-base text-slate-300 font-inter leading-relaxed">
              {drop.description}
            </p>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-[#252846] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleReminder}
                className={`px-6 py-3 rounded-xl font-inter font-bold text-sm flex items-center gap-2 shadow-lg transition-all ${
                  isSaved
                    ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : 'bg-gradient-to-r from-[#ff3d71] to-[#8b5cf6] text-white hover:scale-105 shadow-[0_0_20px_rgba(255,61,113,0.3)]'
                }`}
              >
                {isSaved ? <Check className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                <span>{isSaved ? 'In Your Watchlist' : 'Remind Me on Launch'}</span>
              </button>

              <button
                onClick={handleShare}
                className="p-3 rounded-xl bg-[#171a30] hover:bg-[#202444] border border-[#2b3052] text-slate-300 hover:text-white transition-colors"
                title="Share Drop Link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Audited by DropRadar Desk</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
