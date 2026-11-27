import React, { useState, useEffect, useMemo } from 'react';
import { X, Bell, BellRing, Check, Play, Calendar, ExternalLink, Share2, ShieldCheck, Film, Lock, Unlock, Radio, PlusCircle, Coins, Flag } from 'lucide-react';
import { DropTitle, DropTrailerItem, TrailerKind } from '../../data/dropRadarData';
import { useBugle } from '../../context/BugleContext';
import { useDropData } from '../../context/DropDataContext';
import { useNotifications } from '../../context/NotificationContext';
import { FormatBadge, inferMovieFormats } from './FormatBadge';
import { TrailerSwitcher } from './TrailerSwitcher';
import {
  buildYouTubeEmbedUrl,
  computePrimaryTrailer,
  getTrailerSlotReward,
  parseYouTubeTrailerUrl,
  trailerKindShortLabel,
  trailerTypeToKind
} from '../../utils/youtube';
import { computeRemainingTime, parseReleaseTimestamp } from '../../utils/countdown';
import confetti from 'canvas-confetti';

interface DetailModalProps {
  drop: DropTitle | null;
  initialPlayTrailer?: boolean;
  onClose: () => void;
  onOpenUserUpdate?: (titleId: string, titleName: string) => void;
  onShareDrop?: (drop: DropTitle) => void;
  onOpenTrailerModal?: (drop: DropTitle, mode: 'submit' | 'view_or_flag') => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  drop: propDrop,
  initialPlayTrailer = false,
  onClose,
  onOpenUserUpdate,
  onShareDrop,
  onOpenTrailerModal
}) => {
  const { isWatchlisted, toggleWatchlist, showToast } = useBugle();
  const { drops, updateDropStatus, toggleDropLock, updateDropDate, resolveOfficialTrailer } = useDropData();
  const { hasActiveRuleFor, openNotifyModal } = useNotifications();
  const drop = propDrop ? (drops.find((d) => d.id === propDrop.id) || propDrop) : null;
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
  const [isLoadingTrailer, setIsLoadingTrailer] = useState(false);
  const [resolvedTrailer, setResolvedTrailer] = useState<{
    trailerUrl?: string;
    trailerEmbedUrl?: string;
    trailerSource?: string;
    trailers?: DropTrailerItem[];
  } | null>(null);
  const [selectedTrailerKind, setSelectedTrailerKind] = useState<TrailerKind>('official_trailer');
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [newDateInput, setNewDateInput] = useState('');
  const [shiftReason, setShiftReason] = useState('');

  // Live countdown calculation
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!propDrop) return;
    let cancelled = false;
    setResolvedTrailer(null);

    if (initialPlayTrailer) {
      setIsPlayingTrailer(true);
      if (!propDrop.trailerEmbedUrl) {
        setIsLoadingTrailer(true);
        resolveOfficialTrailer(propDrop.id)
          .then((result) => {
            if (!cancelled) {
              setResolvedTrailer(result);
            }
          })
          .finally(() => {
            if (!cancelled) {
              setIsLoadingTrailer(false);
            }
          });
      } else {
        setIsLoadingTrailer(false);
      }
    } else {
      setIsPlayingTrailer(false);
      setIsLoadingTrailer(false);
    }

    const target = parseReleaseTimestamp(propDrop.date, propDrop.daysRemaining);

    const calc = () => {
      const rem = computeRemainingTime(target);
      setCountdown({
        days: rem.days,
        hours: rem.hours,
        minutes: rem.minutes,
        seconds: rem.seconds
      });
    };

    calc();
    const interval = setInterval(calc, 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [propDrop?.id, initialPlayTrailer]);

  const activeTrailers = useMemo<DropTrailerItem[]>(() => {
    if (!drop) return [];
    const sourceList =
      (drop.trailers && drop.trailers.length > 0 ? drop.trailers : resolvedTrailer?.trailers) || [];
    const active = sourceList.filter((t) => t.status !== 'flagged_broken');
    if (active.length > 0) return active;

    const fallbackEmbed = resolvedTrailer?.trailerEmbedUrl || drop.trailerEmbedUrl;
    const fallbackUrl = resolvedTrailer?.trailerUrl || drop.trailerUrl;
    if (fallbackEmbed && drop.trailerStatus !== 'flagged_broken') {
      const parsed = fallbackUrl ? parseYouTubeTrailerUrl(fallbackUrl) : null;
      const vid = drop.trailerVideoId || parsed?.videoId || 'primary';
      return [
        {
          id: `fallback_${drop.id}_${vid}`,
          dropId: drop.id,
          kind: trailerTypeToKind(drop.trailerType || 'Official Trailer'),
          videoId: vid,
          url: fallbackUrl || parsed?.canonicalUrl || '',
          embedUrl: fallbackEmbed,
          channelName: resolvedTrailer?.trailerSource || drop.trailerSource || 'Official Channel',
          addedByUserId: drop.trailerAddedBy,
          isPrimary: true,
          status: 'verified',
          createdAt: drop.updatedAt || ''
        }
      ];
    }
    return [];
  }, [drop, resolvedTrailer]);

  const primaryTrailer = useMemo(() => computePrimaryTrailer(activeTrailers), [activeTrailers]);

  useEffect(() => {
    if (primaryTrailer) {
      setSelectedTrailerKind(primaryTrailer.kind);
    }
  }, [drop?.id, primaryTrailer?.id]);

  if (!drop) return null;

  const isSaved = isWatchlisted(drop.id);
  const hasCustomAlert = hasActiveRuleFor(drop.id);

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
    if (onShareDrop) {
      onClose();
      onShareDrop(drop);
      return;
    }
    const directUrl = `${window.location.origin}/?movie=${encodeURIComponent(drop.id)}#cinema-hub`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(directUrl);
      showToast('Drop link copied to clipboard!');
    }
  };

  const isBrokenTrailer = drop.trailerStatus === 'flagged_broken';
  const hasVerifiedTrailer = Boolean((resolvedTrailer?.trailerEmbedUrl || drop.trailerEmbedUrl) && !isBrokenTrailer);
  const rewardAmount = isBrokenTrailer ? 10 : 25;

  const launchTrailerModal = (mode: 'submit' | 'view_or_flag') => {
    if (onOpenTrailerModal) {
      onClose();
      onOpenTrailerModal(drop, mode);
    }
  };

  const selectedTrailer =
    activeTrailers.find((t) => t.kind === selectedTrailerKind) ||
    primaryTrailer ||
    activeTrailers[0];
  const openSlotKinds = (['official_trailer', 'teaser', 'gameplay', 'launch_trailer'] as TrailerKind[]).filter(
    (k) => !activeTrailers.some((t) => t.kind === k)
  );
  const topOpenSlotReward = openSlotKinds.length > 0
    ? Math.max(...openSlotKinds.map((k) => getTrailerSlotReward(k, false)))
    : 25;

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
            (() => {
              const activeEmbed =
                selectedTrailer?.embedUrl ||
                (selectedTrailer?.videoId ? buildYouTubeEmbedUrl(selectedTrailer.videoId) : undefined) ||
                resolvedTrailer?.trailerEmbedUrl ||
                drop.trailerEmbedUrl;
              const activeWatchUrl =
                selectedTrailer?.url ||
                resolvedTrailer?.trailerUrl ||
                drop.trailerUrl ||
                `https://www.youtube.com/results?search_query=${encodeURIComponent(drop.name + ' official trailer')}`;
              const activeSource =
                selectedTrailer?.channelName ||
                resolvedTrailer?.trailerSource ||
                drop.trailerSource ||
                'Official Channel';

              if (isLoadingTrailer) {
                return (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-black p-6 text-center">
                    <Film className="w-12 h-12 text-cyan-400 animate-pulse mb-3" />
                    <p className="font-bebas text-2xl text-white tracking-wide">
                      LOCATING OFFICIAL TRAILER...
                    </p>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      Querying AniList / TMDB Official Video Feed
                    </p>
                  </div>
                );
              }

              if (activeEmbed) {
                return (
                  <div className="relative w-full h-full bg-black">
                    <TrailerSwitcher
                      dropTitle={drop.name}
                      trailers={activeTrailers}
                      fallbackTrailerUrl={activeWatchUrl}
                      autoplay
                      showSourceFooter={false}
                      className="h-full [&>div[role=tablist]]:absolute [&>div[role=tablist]]:top-3 [&>div[role=tablist]]:left-3 [&>div[role=tablist]]:z-20 [&>div[role=tablist]]:bg-[#0b0d1a]/80 [&>div[role=tablist]]:backdrop-blur-md [&>div[role=tablist]]:p-1 [&>div[role=tablist]]:rounded-full [&>div[role=tablist]]:border [&>div[role=tablist]]:border-[#2b3052] [&>div.aspect-video]:h-full [&>div.aspect-video]:rounded-none"
                      onActiveTrailerChange={(item) => setSelectedTrailerKind(item.kind)}
                    />
                    <div className="absolute bottom-3 left-3 right-14 flex items-center justify-between pointer-events-none">
                      <span className="px-2.5 py-1 rounded-md bg-[#0b0d1a]/85 border border-cyan-500/40 text-[11px] font-mono text-cyan-300 backdrop-blur-md">
                        {activeSource}
                      </span>
                      <div className="flex items-center gap-2 pointer-events-auto">
                        <a
                          href={activeWatchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-md bg-[#0b0d1a]/90 hover:bg-[#171a30] border border-[#2b3052] text-[11px] font-mono text-white flex items-center gap-1"
                        >
                          <span>Watch Official</span>
                          <ExternalLink className="w-3 h-3 text-cyan-400" />
                        </a>
                        <button
                          onClick={() => setIsPlayingTrailer(false)}
                          className="px-2.5 py-1 rounded-md bg-[#0b0d1a]/90 hover:bg-[#252846] border border-[#2b3052] text-[11px] font-mono text-slate-300 hover:text-white"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#080a16] p-5 sm:p-6 text-center space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/50 text-amber-300 text-[11px] font-mono font-bold">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      {isBrokenTrailer
                        ? `REPLACE BROKEN TRAILER · +${rewardAmount} TOKENS`
                        : `ADD OFFICIAL TRAILER · +${rewardAmount} TOKENS`}
                    </span>
                  </div>
                  <div>
                    <p className="font-bebas text-2xl text-white tracking-wide">
                      NO VERIFIED OFFICIAL TRAILER YET
                    </p>
                    <p className="text-xs text-slate-400 font-inter max-w-md mt-1">
                      Launch the Official Trailer verification flow to submit a YouTube studio link, run automated checks, and claim +{rewardAmount} tokens.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    {onOpenTrailerModal && (
                      <button
                        type="button"
                        onClick={() => launchTrailerModal('submit')}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-[#0b0d1a] text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_16px_rgba(245,158,11,0.35)]"
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>Add Official Trailer (+{rewardAmount} Tokens)</span>
                      </button>
                    )}
                    <a
                      href={activeWatchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-[#171a30] hover:bg-[#202444] border border-[#2b3052] text-cyan-300 text-xs font-mono flex items-center gap-1.5"
                    >
                      <span>Search on YouTube</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => setIsPlayingTrailer(false)}
                      className="px-3.5 py-2 rounded-xl bg-[#171a30] border border-[#2b3052] text-xs font-mono text-slate-300 hover:text-white"
                    >
                      Back
                    </button>
                  </div>
                </div>
              );
            })()
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
                onClick={async () => {
                  setIsPlayingTrailer(true);
                  if (!drop.trailerEmbedUrl) {
                    setIsLoadingTrailer(true);
                    const result = await resolveOfficialTrailer(drop.id);
                    setResolvedTrailer(result);
                    setIsLoadingTrailer(false);
                  }
                }}
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
                  Click to play official trailer
                </span>
                <span className="bg-[#0b0d1a]/80 px-2.5 py-1 rounded-md border border-[#252846] text-cyan-400">
                  {drop.trailerSource || 'Official Source Ready'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Multi-Trailer Switcher Strip (renders whenever >1 verified video is attached) */}
        {activeTrailers.length > 1 && (
          <div className="px-6 py-2.5 bg-[#0b0d1a] border-b border-[#252846] flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex flex-wrap items-center gap-1.5">
              {activeTrailers.map((item) => {
                const isSelected = selectedTrailer?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedTrailerKind(item.kind);
                      setIsPlayingTrailer(true);
                    }}
                    className={`px-3 py-1 rounded-lg text-[11px] font-mono font-semibold border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-200'
                        : 'bg-[#171a30] border-[#252846] text-slate-400 hover:text-white'
                    }`}
                  >
                    <Play className="w-3 h-3" />
                    <span>{trailerKindShortLabel(item.kind)}</span>
                  </button>
                );
              })}
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {activeTrailers.length} verified clips attached
            </span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          {/* Top metadata tags */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-[#ff3d71] to-[#8b5cf6] text-white">
                {drop.category}
              </span>
              {drop.industry && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${
                    drop.industry === 'Bollywood'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  }`}
                >
                  {drop.industry}
                </span>
              )}
              {drop.category === 'Movies' &&
                inferMovieFormats(drop).map((fmt) => (
                  <FormatBadge key={fmt} format={fmt} size="sm" />
                ))}
              <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#171a30] text-cyan-300 border border-[#2b3052]">
                {drop.platform}
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-[#141830] text-slate-300 border border-[#2b3052] flex items-center gap-1">
                <Radio className="w-3 h-3 text-cyan-400" />
                {drop.trustedSourceLabel
                  ? drop.trustedSourceLabel
                  : drop.source === 'anilist'
                  ? 'AniList Live'
                  : drop.source === 'openlibrary'
                  ? 'Open Library'
                  : drop.source === 'tmdb'
                  ? 'TMDB Cinema'
                  : drop.source === 'wikipedia'
                  ? 'Wikipedia Film Registry'
                  : drop.source === 'manual'
                  ? 'Editorial Entry'
                  : 'Verified Radar'}
              </span>
              {drop.sourceUrl && (
                <a
                  href={drop.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-[#141830] text-cyan-300 hover:text-white border border-[#2b3052] hover:border-cyan-400 flex items-center gap-1 transition-colors"
                >
                  <span>Registry Source</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
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

          {/* Official Trailer Bounty Card */}
          <div
            className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
              hasVerifiedTrailer
                ? 'bg-[#0b0d1a] border-[#252846]'
                : isBrokenTrailer
                ? 'bg-rose-500/10 border-rose-500/40'
                : 'bg-gradient-to-r from-amber-500/15 via-[#141830] to-[#0b0d1a] border-amber-500/40'
            }`}
          >
            <div className="space-y-1 text-xs font-mono">
              <div className="flex items-center gap-2 font-semibold flex-wrap">
                <Coins className="w-4 h-4 text-amber-400" />
                {hasVerifiedTrailer ? (
                  <span className="text-emerald-300">
                    {activeTrailers.length > 1
                      ? `${activeTrailers.length} Verified Clips (${activeTrailers.map((t) => trailerKindShortLabel(t.kind)).join(' · ')})`
                      : `${drop.trailerType || 'Official Trailer'} Verified`}
                    {drop.trailerAddedBy ? ` · Added by ${drop.trailerAddedBy}` : ''}
                  </span>
                ) : isBrokenTrailer ? (
                  <span className="text-rose-300">
                    Trailer Flagged Broken · Replace Link & Earn +{rewardAmount} Tokens
                  </span>
                ) : (
                  <span className="text-amber-300">
                    No Official Trailer Yet · Add Verified Link & Earn +{rewardAmount} Tokens
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-inter">
                {hasVerifiedTrailer
                  ? openSlotKinds.length > 0
                    ? `Open slots (${openSlotKinds.map((k) => `${trailerKindShortLabel(k)} +${getTrailerSlotReward(k)}`).join(', ')}) can still earn tokens. Flag outdated links if broken.`
                    : 'All trailer slots verified. Flag outdated/broken links if any clip no longer plays.'
                  : 'Tokens are credited after URL normalization, duplicate lock, and automated official verification.'}
              </p>
            </div>

            {onOpenTrailerModal && (
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {hasVerifiedTrailer && (
                  <button
                    type="button"
                    onClick={() => launchTrailerModal('view_or_flag')}
                    className="px-3.5 py-2 rounded-xl bg-[#171a30] hover:bg-[#202444] border border-rose-500/40 text-rose-300 hover:text-white text-xs font-mono font-semibold flex items-center gap-1.5"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>View / Flag</span>
                  </button>
                )}
                {(!hasVerifiedTrailer || openSlotKinds.length > 0 || isBrokenTrailer) && (
                  <button
                    type="button"
                    onClick={() => launchTrailerModal('submit')}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-[#0b0d1a] text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_16px_rgba(245,158,11,0.35)]"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>
                      {isBrokenTrailer
                        ? 'Replace Trailer (+10)'
                        : hasVerifiedTrailer
                        ? `Add Open Slot (+${topOpenSlotReward})`
                        : 'Add Official Trailer (+25 Tokens)'}
                    </span>
                  </button>
                )}
              </div>
            )}
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
                className={`px-5 py-3 rounded-xl font-inter font-bold text-sm flex items-center gap-2 shadow-lg transition-all ${
                  isSaved
                    ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : 'bg-gradient-to-r from-[#ff3d71] to-[#8b5cf6] text-white hover:scale-105 shadow-[0_0_20px_rgba(255,61,113,0.3)]'
                }`}
              >
                {isSaved ? <Check className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                <span>{isSaved ? 'In Your Watchlist' : 'Remind Me on Launch'}</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  openNotifyModal({
                    targetId: drop.id,
                    targetName: drop.name,
                    targetType: 'drop',
                    category: drop.category,
                    targetDate: drop.date
                  });
                }}
                className={`px-4 py-3 rounded-xl font-inter font-semibold text-xs sm:text-sm flex items-center gap-2 border transition-all ${
                  hasCustomAlert
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                    : 'bg-[#171a30] hover:bg-[#202444] border-[#2b3052] text-cyan-300 hover:text-white'
                }`}
                title="Configure custom notification timing, triggers, and browser push alert"
              >
                <BellRing className="w-4 h-4 text-cyan-400" />
                <span>{hasCustomAlert ? 'Edit Alert' : 'Set Notification'}</span>
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
              <span>Audited by AheadOfYou Desk</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
