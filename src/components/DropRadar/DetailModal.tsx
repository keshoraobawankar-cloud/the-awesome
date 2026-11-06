import React, { useState, useEffect } from 'react';
import { X, Bell, Check, Play, Calendar, ExternalLink, Sparkles, Share2, ShieldCheck, Film, Lock, Unlock, Radio, PlusCircle } from 'lucide-react';
import { DropTitle } from '../../data/dropRadarData';
import { useBugle } from '../../context/BugleContext';
import { useDropData } from '../../context/DropDataContext';
import confetti from 'canvas-confetti';

interface DetailModalProps {
  drop: DropTitle | null;
  onClose: () => void;
  onOpenUserUpdate?: (titleId: string, titleName: string) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ drop, onClose, onOpenUserUpdate }) => {
  const { isWatchlisted, toggleWatchlist, showToast } = useBugle();
  const { updateDropStatus, toggleDropLock, updateDropDate, dateHistory } = useDropData();
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [newDateInput, setNewDateInput] = useState('');
  const [shiftReason, setShiftReason] = useState('');

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
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-[#ff3d71] to-[#8b5cf6] text-white">
                {drop.category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#171a30] text-cyan-300 border border-[#2b3052]">
                {drop.platform}
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-[#141830] text-slate-300 border border-[#2b3052] flex items-center gap-1">
                <Radio className="w-3 h-3 text-cyan-400" />
                {drop.source === 'anilist' ? 'AniList Live' : drop.source === 'openlibrary' ? 'Open Library' : drop.source === 'tmdb' ? 'TMDB Cinema' : drop.source === 'manual' ? 'Editorial Entry' : 'Verified Radar'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono font-bold">
              {/* Status Switcher */}
              <div className="flex items-center gap-1 bg-[#121528] p-1 rounded-xl border border-[#252846]">
                {(['Confirmed', 'Tentative', 'Delayed'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      updateDropStatus(drop.id, s);
                      showToast(`Status updated to ${s}`);
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[10px] uppercase font-mono transition-all ${
                      drop.status === s
                        ? s === 'Confirmed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                          : s === 'Tentative'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Lock Button */}
              <button
                onClick={() => {
                  toggleDropLock(drop.id);
                  showToast(drop.locked ? 'Field unlocked' : 'Field locked from auto-overwrite');
                }}
                className={`p-1.5 rounded-xl border transition-all ${
                  drop.locked
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                    : 'bg-[#171a30] border-[#2b3052] text-slate-400 hover:text-white'
                }`}
                title={drop.locked ? 'Locked: Scheduled sync will never overwrite manual edits' : 'Unlocked: May update during scheduled sync'}
              >
                {drop.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              </button>
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

          {/* Date Revision Tracker & Delay Tester */}
          <div className="p-4 rounded-xl bg-[#141830] border border-[#2b3055] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-[#22d3ee]" />
                <span>Date History & Schedule Shifts</span>
                {drop.dateHistory && drop.dateHistory.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                    {drop.dateHistory.length} Reschedules
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditingDate(!isEditingDate);
                  setNewDateInput(drop.date);
                }}
                className="text-xs font-inter text-cyan-400 hover:text-cyan-300 underline"
              >
                {isEditingDate ? 'Cancel' : 'Simulate Date Shift'}
              </button>
            </div>

            {/* Date shift input form */}
            {isEditingDate && (
              <div className="p-3 bg-[#0b0d1a] border border-[#272c4e] rounded-lg space-y-2 animate-fadeIn text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                      New Target Date
                    </label>
                    <input
                      type="date"
                      value={newDateInput}
                      onChange={(e) => setNewDateInput(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#171a30] border border-[#2b3052] rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                      Revision Reason
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Studio VFX polish or holiday slot"
                      value={shiftReason}
                      onChange={(e) => setShiftReason(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#171a30] border border-[#2b3052] rounded-lg text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!newDateInput || newDateInput === drop.date) return;
                      await updateDropDate(drop.id, newDateInput, shiftReason);
                      showToast(`Date updated to ${newDateInput} — Delay alert added to queue!`);
                      setIsEditingDate(false);
                    }}
                    className="px-3 py-1 bg-gradient-to-r from-[#ff3d71] to-[#8b5cf6] text-white rounded-lg font-semibold shadow"
                  >
                    Apply & Log Delay Alert
                  </button>
                </div>
              </div>
            )}

            {/* List past date revisions */}
            {drop.dateHistory && drop.dateHistory.length > 0 ? (
              <div className="space-y-1.5 pt-1">
                {drop.dateHistory.map((hist) => (
                  <div key={hist.id} className="text-[11px] font-mono flex items-start gap-2 text-slate-400 bg-[#0b0d1a]/60 p-2 rounded-lg border border-[#222642]">
                    <span className="text-amber-400 shrink-0">Moved:</span>
                    <span className="line-through text-slate-500">{hist.oldDate}</span>
                    <span>→</span>
                    <span className="text-emerald-400 font-bold">{hist.newDate}</span>
                    {hist.reason && <span className="text-slate-400 italic">({hist.reason})</span>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 font-inter">
                No delay alerts on record. Date currently verified by studio distribution lock.
              </p>
            )}
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

              {onOpenUserUpdate && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenUserUpdate(drop.id, drop.name);
                  }}
                  className="px-3.5 py-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:text-white font-inter text-xs flex items-center gap-1.5 transition-colors"
                  title="Submit a community date revision, delay scoop, or platform change for this title"
                >
                  <PlusCircle className="w-4 h-4 text-cyan-400" />
                  <span>Submit Date Update</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Audited by Tickora Desk</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
