import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Coins,
  Film,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Clock,
  Flag,
  ExternalLink,
  Link2,
  ShieldAlert,
  Play,
  Wallet
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DropTitle, TrailerType, TrailerKind, DropTrailerItem } from '../../data/dropRadarData';
import { useDropData, AttachTrailerResult } from '../../context/DropDataContext';
import { useBugle } from '../../context/BugleContext';
import {
  buildYouTubeEmbedUrl,
  computePrimaryTrailer,
  getClaimedTrailerKinds,
  getTrailerSlotReward,
  parseYouTubeTrailerUrl,
  trailerKindShortLabel,
  trailerKindToLabel,
  trailerTypeToKind
} from '../../utils/youtube';

interface OfficialTrailerModalProps {
  drop: DropTitle | null;
  initialMode?: 'submit' | 'view_or_flag';
  onClose: () => void;
  onOpenWallet: () => void;
}

const TRAILER_SLOTS: Array<{
  kind: TrailerKind;
  label: TrailerType;
  shortLabel: string;
  rewardTokens: number;
  helperText: string;
}> = [
  {
    kind: 'official_trailer',
    label: 'Official Trailer',
    shortLabel: 'Official Trailer',
    rewardTokens: 25,
    helperText: 'Main full trailer for this release.'
  },
  {
    kind: 'teaser',
    label: 'Official Teaser',
    shortLabel: 'Teaser',
    rewardTokens: 15,
    helperText: 'Early teaser or first-look clip.'
  },
  {
    kind: 'gameplay',
    label: 'Gameplay / Overview',
    shortLabel: 'Gameplay',
    rewardTokens: 20,
    helperText: 'Gameplay walkthrough or overview.'
  },
  {
    kind: 'launch_trailer',
    label: 'Final Trailer',
    shortLabel: 'Launch / Final',
    rewardTokens: 25,
    helperText: 'Final release or launch trailer.'
  }
];

export const OfficialTrailerModal: React.FC<OfficialTrailerModalProps> = ({
  drop: propDrop,
  initialMode,
  onClose,
  onOpenWallet
}) => {
  const {
    drops,
    contributorName,
    attachOfficialTrailer,
    flagBrokenTrailer
  } = useDropData();
  const { showToast } = useBugle();

  const drop = propDrop ? drops.find((d) => d.id === propDrop.id) || propDrop : null;

  // Normalize trailers array with fallback for legacy single-trailer drops
  const allSlots = useMemo<DropTrailerItem[]>(() => {
    if (!drop) return [];
    if (drop.trailers && drop.trailers.length > 0) return drop.trailers;
    if (drop.trailerEmbedUrl || drop.trailerUrl) {
      const parsed = drop.trailerUrl ? parseYouTubeTrailerUrl(drop.trailerUrl) : null;
      const vid = drop.trailerVideoId || parsed?.videoId || '';
      if (vid) {
        return [
          {
            id: `legacy_${drop.id}_${vid}`,
            dropId: drop.id,
            kind: trailerTypeToKind(drop.trailerType || 'Official Trailer'),
            videoId: vid,
            url: drop.trailerUrl || parsed?.canonicalUrl || `https://www.youtube.com/watch?v=${vid}`,
            embedUrl: drop.trailerEmbedUrl || buildYouTubeEmbedUrl(vid),
            channelName: drop.trailerSource || 'Official Channel',
            addedByUserId: drop.trailerAddedBy,
            isPrimary: true,
            status: drop.trailerStatus === 'flagged_broken' ? 'flagged_broken' : 'verified',
            createdAt: drop.updatedAt || new Date().toISOString()
          }
        ];
      }
    }
    return [];
  }, [drop]);

  const activeTrailers = useMemo(
    () => allSlots.filter((t) => t.status !== 'flagged_broken'),
    [allSlots]
  );
  const brokenTrailers = useMemo(
    () => allSlots.filter((t) => t.status === 'flagged_broken'),
    [allSlots]
  );
  const primaryTrailer = useMemo(() => computePrimaryTrailer(allSlots), [allSlots]);

  const claimedKinds = useMemo(
    () =>
      getClaimedTrailerKinds(
        drop?.trailers,
        drop?.trailerUrl || drop?.trailerEmbedUrl,
        drop?.trailerType,
        drop?.trailerStatus
      ),
    [drop?.trailers, drop?.trailerUrl, drop?.trailerEmbedUrl, drop?.trailerType, drop?.trailerStatus]
  );

  const openOrBrokenSlots = useMemo(() => {
    return TRAILER_SLOTS.filter((slot) => !claimedKinds.has(slot.kind));
  }, [claimedKinds]);

  const isBroken = activeTrailers.length === 0 && (brokenTrailers.length > 0 || drop?.trailerStatus === 'flagged_broken');
  const hasActiveVerifiedTrailer = activeTrailers.length > 0 || Boolean(drop?.trailerEmbedUrl && drop?.trailerStatus !== 'flagged_broken');

  const [mode, setMode] = useState<'submit' | 'view_or_flag'>('submit');
  const [selectedViewKind, setSelectedViewKind] = useState<TrailerKind>('official_trailer');
  const [scoutHandle, setScoutHandle] = useState(contributorName);
  const [trailerUrl, setTrailerUrl] = useState('');
  const [trailerType, setTrailerType] = useState<TrailerType>('Official Trailer');
  const [confirmedOfficial, setConfirmedOfficial] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<AttachTrailerResult | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  // Flag broken state
  const [showFlagForm, setShowFlagForm] = useState(false);
  const [flagReason, setFlagReason] = useState('Video unavailable / private');
  const [isFlagging, setIsFlagging] = useState(false);

  useEffect(() => {
    if (!cooldownUntil) {
      setSecondsLeft(0);
      return;
    }

    const updateRemaining = () => {
      const diffSeconds = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
      setSecondsLeft(diffSeconds);
      if (diffSeconds <= 0) {
        setCooldownUntil(null);
      }
    };

    updateRemaining();
    const timer = window.setInterval(updateRemaining, 1000);
    return () => window.clearInterval(timer);
  }, [cooldownUntil]);

  useEffect(() => {
    if (!drop) return;
    setScoutHandle(contributorName);
    setTrailerUrl('');
    setResult(null);
    setConfirmedOfficial(false);
    setShowFlagForm(false);
    setFlagReason('Video unavailable / private');

    // Pick default submit slot: broken slot first, else preferred open slot
    const brokenFirst = TRAILER_SLOTS.find((s) =>
      allSlots.some((t) => t.kind === s.kind && t.status === 'flagged_broken')
    );
    const defaultOrder: TrailerKind[] =
      drop.category === 'Games'
        ? ['gameplay', 'official_trailer', 'teaser', 'launch_trailer']
        : ['official_trailer', 'teaser', 'launch_trailer', 'gameplay'];
    const openFirstKind = defaultOrder.find((k) => !claimedKinds.has(k));
    const chosenKind = brokenFirst?.kind || openFirstKind || 'official_trailer';
    setTrailerType(trailerKindToLabel(chosenKind));

    if (primaryTrailer) {
      setSelectedViewKind(primaryTrailer.kind);
    }

    if (initialMode) {
      setMode(initialMode);
    } else {
      setMode(hasActiveVerifiedTrailer ? 'view_or_flag' : 'submit');
    }
  }, [drop?.id, initialMode]);

  // Keep selected slot aligned with an open/broken slot when trailers update while in submit mode
  useEffect(() => {
    if (!drop || mode !== 'submit') return;
    const currentKind = trailerTypeToKind(trailerType);
    if (claimedKinds.has(currentKind) && openOrBrokenSlots.length > 0) {
      setTrailerType(openOrBrokenSlots[0].label);
    }
  }, [drop?.id, mode, claimedKinds, openOrBrokenSlots, trailerType]);

  const parsedPreview = useMemo(() => parseYouTubeTrailerUrl(trailerUrl), [trailerUrl]);
  const previewVideoId = parsedPreview?.videoId || null;

  if (!drop) return null;

  const selectedKind = trailerTypeToKind(trailerType);
  const selectedSlotExisting = allSlots.find((t) => t.kind === selectedKind);
  const isSelectedSlotBroken = selectedSlotExisting?.status === 'flagged_broken';
  const isSelectedSlotClaimed = claimedKinds.has(selectedKind);
  const bountyTokens = getTrailerSlotReward(selectedKind, isSelectedSlotBroken || isBroken);

  const viewedTrailer =
    activeTrailers.find((t) => t.kind === selectedViewKind) ||
    primaryTrailer ||
    activeTrailers[0];

  const currentStep = result
    ? result.outcome === 'verified' || result.outcome === 'pending_review'
      ? 5
      : 3
    : previewVideoId && confirmedOfficial
    ? 2
    : 1;

  const isCoolingDown = secondsLeft > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isCoolingDown || isSelectedSlotClaimed) return;
    if (!scoutHandle.trim() || scoutHandle.trim().length < 2) {
      showToast('Enter a Scout Handle (at least 2 characters) to earn tokens.');
      return;
    }
    if (!trailerUrl.trim()) {
      showToast('Paste an official YouTube trailer URL.');
      return;
    }
    if (!parsedPreview) {
      showToast('Paste a valid YouTube video URL (watch, youtu.be, /shorts/, /embed/, or /live/).');
      return;
    }
    if (!confirmedOfficial) {
      showToast('Please confirm that this link is an official studio/publisher upload.');
      return;
    }

    setIsSubmitting(true);
    setResult(null);
    const res = await attachOfficialTrailer(
      drop.id,
      parsedPreview.canonicalUrl,
      scoutHandle.trim(),
      trailerType,
      confirmedOfficial,
      selectedKind
    );
    setIsSubmitting(false);
    setResult(res);

    if (res.outcome === 'rate_limited') {
      const retrySeconds = res.retryAfterSeconds && res.retryAfterSeconds > 0 ? res.retryAfterSeconds : 60;
      setCooldownUntil(Date.now() + retrySeconds * 1000);
      setSecondsLeft(retrySeconds);
      showToast(res.error || `Submission limit reached. Wait ${retrySeconds}s.`);
      return;
    }

    if (res.outcome === 'verified') {
      showToast(
        res.tokensAwarded && res.tokensAwarded > 0
          ? `${trailerType} added! +${res.tokensAwarded} tokens credited`
          : `${trailerType} added!`
      );
      setSelectedViewKind(selectedKind);
      confetti({
        particleCount: 80,
        spread: 65,
        origin: { y: 0.55 },
        colors: ['#f59e0b', '#22d3ee', '#10b981', '#ff3d71']
      });
    } else if (res.outcome === 'pending_review') {
      showToast('Submitted for verification — tokens held until approved.');
    } else if (res.outcome === 'duplicate') {
      showToast(res.message || 'This trailer is already linked to this release.');
    } else {
      showToast(res.error || 'Trailer submission rejected.');
    }
  };

  const handleFlagBroken = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFlagging(true);
    const targetKind = viewedTrailer?.kind;
    const res = await flagBrokenTrailer(drop.id, flagReason, scoutHandle, {
      kind: targetKind,
      videoId: viewedTrailer?.videoId
    });
    setIsFlagging(false);
    if (res.success) {
      showToast(res.message || 'Trailer flagged as broken. Replacement earns +10 fix tokens.');
      setShowFlagForm(false);
      if (targetKind) {
        setTrailerType(trailerKindToLabel(targetKind));
      }
      setMode('submit');
    } else {
      showToast(res.error || 'Could not flag trailer.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-6 bg-[#0b0d1a]/88 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[92vh] rounded-3xl bg-[#121528] border-2 border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.2)] overflow-hidden flex flex-col text-slate-200 font-inter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#252846] bg-[#0b0d1a]/90">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-[#ff3d71] flex items-center justify-center shrink-0">
              <Film className="w-5 h-5 text-[#0b0d1a]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#171a30] border border-[#2b3052] text-cyan-300">
                  {drop.industry || drop.category}
                </span>
                {isBroken ? (
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold">
                    Broken Link Flagged · +10 Fix Tokens
                  </span>
                ) : hasActiveVerifiedTrailer ? (
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold">
                    {activeTrailers.length} {activeTrailers.length === 1 ? 'Clip' : 'Clips'} Verified
                    {openOrBrokenSlots.length > 0 ? ` · ${openOrBrokenSlots.length} Slots Open` : ''}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">
                    Bounty: +{bountyTokens} Tokens
                  </span>
                )}
              </div>
              <h3 className="font-bebas text-2xl sm:text-3xl text-white tracking-wide truncate mt-0.5">
                {drop.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#171a30] hover:bg-[#252846] text-slate-400 hover:text-white transition-colors shrink-0"
            aria-label="Close Official Trailer Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Mode Switcher when trailer already exists & is not broken */}
          {hasActiveVerifiedTrailer && (
            <div className="flex items-center gap-2 p-1 rounded-xl bg-[#0b0d1a] border border-[#252846]">
              <button
                type="button"
                onClick={() => setMode('view_or_flag')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  mode === 'view_or_flag'
                    ? 'bg-[#171a30] text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>Watch Clips ({activeTrailers.length || 1}) / Flag</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextOpen = openOrBrokenSlots[0];
                  if (nextOpen) setTrailerType(nextOpen.label);
                  setMode('submit');
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  mode === 'submit'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>
                  {brokenTrailers.length > 0
                    ? 'Fix Broken Slot (+10)'
                    : openOrBrokenSlots.length > 0
                    ? `Add Open Slot (+${openOrBrokenSlots[0].rewardTokens})`
                    : 'All Slots Claimed'}
                </span>
              </button>
            </div>
          )}

          {/* VIEW / FLAG MODE */}
          {mode === 'view_or_flag' && hasActiveVerifiedTrailer ? (
            <div className="space-y-4">
              {/* Multi-trailer switcher pills */}
              {activeTrailers.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {activeTrailers.map((item) => {
                    const isSelected = viewedTrailer?.id === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedViewKind(item.kind);
                          setShowFlagForm(false);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                            : 'bg-[#0b0d1a] border-[#252846] text-slate-400 hover:text-white hover:border-[#3b4275]'
                        }`}
                      >
                        <Play className="w-3 h-3" />
                        <span>{trailerKindShortLabel(item.kind)}</span>
                        {item.isPrimary && (
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                            Primary
                          </span>
                        )}
                      </button>
                    );
                  })}
                  {openOrBrokenSlots.map((slot) => {
                    const isSlotBroken = allSlots.some(
                      (t) => t.kind === slot.kind && t.status === 'flagged_broken'
                    );
                    const slotReward = getTrailerSlotReward(slot.kind, isSlotBroken);
                    return (
                      <button
                        key={slot.kind}
                        type="button"
                        onClick={() => {
                          setTrailerType(slot.label);
                          setMode('submit');
                        }}
                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-mono border border-dashed border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/15 text-amber-300 transition-colors"
                      >
                        + {slot.shortLabel} (+{slotReward})
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-[#252846]">
                <iframe
                  src={viewedTrailer?.embedUrl || drop.trailerEmbedUrl}
                  title={`${drop.name} ${viewedTrailer ? trailerKindToLabel(viewedTrailer.kind) : 'Official Trailer'}`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>

              <div className="p-4 rounded-2xl bg-[#0b0d1a] border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2 font-mono font-bold text-emerald-300">
                    <ShieldCheck className="w-4 h-4" />
                    <span>
                      {viewedTrailer ? trailerKindToLabel(viewedTrailer.kind) : (drop.trailerType || 'Official Trailer')} Verified
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Source: {viewedTrailer?.channelName || drop.trailerSource || 'Official Channel'}
                    {(viewedTrailer?.addedByUserId || drop.trailerAddedBy)
                      ? ` • Added by ${viewedTrailer?.addedByUserId || drop.trailerAddedBy}`
                      : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {(viewedTrailer?.url || drop.trailerUrl) && (
                    <a
                      href={viewedTrailer?.url || drop.trailerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-[#171a30] border border-[#2b3052] text-xs font-mono text-cyan-300 hover:text-white flex items-center gap-1"
                    >
                      <span>YouTube</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowFlagForm((prev) => !prev)}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-xs font-mono font-semibold flex items-center gap-1.5"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Flag Broken</span>
                  </button>
                </div>
              </div>

              {showFlagForm ? (
                <form
                  onSubmit={handleFlagBroken}
                  className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3"
                >
                  <p className="text-xs text-rose-200 font-semibold">
                    Report dead, private, or mismatched {viewedTrailer ? trailerKindToLabel(viewedTrailer.kind) : 'trailer'} so a scout can replace it (+10 Fix Tokens):
                  </p>
                  <select
                    value={flagReason}
                    onChange={(e) => setFlagReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0b0d1a] border border-[#2b3052] text-xs text-white focus:outline-none focus:border-rose-400"
                  >
                    <option value="Video unavailable / private">Video unavailable or set to private</option>
                    <option value="Wrong title or unofficial fan upload">Wrong movie / unofficial fan upload</option>
                    <option value="Embedding disabled or region blocked">Embedding disabled or region blocked</option>
                  </select>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowFlagForm(false)}
                      className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isFlagging}
                      className="px-4 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-mono font-bold"
                    >
                      {isFlagging ? 'Flagging...' : 'Confirm Broken Link'}
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-[11px] text-slate-400 font-mono">
                  Each release supports separate verified slots for Official Trailer, Teaser, Gameplay, and Final/Launch clips. Duplicate claims on the same slot or video ID are blocked.
                </p>
              )}
            </div>
          ) : (
            /* SUBMISSION MODE: 5-STEP FLOW */
            <div className="space-y-5">
              {/* 5-Step Progress Strip */}
              <div className="grid grid-cols-5 gap-1.5 text-[10px] font-mono">
                {[
                  { step: 1, label: '1. Launch' },
                  { step: 2, label: '2. URL & Slot' },
                  { step: 3, label: '3. Auto-Check' },
                  { step: 4, label: '4. Verify' },
                  { step: 5, label: '5. Wallet' }
                ].map((s) => {
                  const active = currentStep >= s.step;
                  return (
                    <div
                      key={s.step}
                      className={`px-2 py-1.5 rounded-lg border text-center truncate ${
                        active
                          ? 'bg-amber-500/20 border-amber-400/50 text-amber-200 font-bold'
                          : 'bg-[#0b0d1a] border-[#252846] text-slate-500'
                      }`}
                    >
                      {s.label}
                    </div>
                  );
                })}
              </div>

              {(isSelectedSlotBroken || (isBroken && drop.trailerBrokenFlag)) && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Broken Link Maintenance Fix (+10 Tokens):</span>{' '}
                    Flagged by {selectedSlotExisting?.flaggedBy || drop.trailerBrokenFlag?.flaggedBy || 'Community Scout'} ({selectedSlotExisting?.flagReason || drop.trailerBrokenFlag?.reason || 'Unavailable link'}). Submit a working official YouTube trailer to replace this slot.
                  </div>
                </div>
              )}

              {/* Token Bounty Slots Availability */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[11px] font-mono uppercase text-slate-300 font-semibold">
                    Token Bounty Slots
                  </span>
                  <span className="text-[10px] font-mono text-amber-300">
                    {openOrBrokenSlots.length > 0
                      ? `${openOrBrokenSlots.length} of ${TRAILER_SLOTS.length} slots open for rewards`
                      : 'All slots claimed'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TRAILER_SLOTS.map((slot) => {
                    const existing = allSlots.find((t) => t.kind === slot.kind);
                    const slotBroken = existing?.status === 'flagged_broken';
                    const isClaimed = claimedKinds.has(slot.kind);
                    const isSelected = !isClaimed && selectedKind === slot.kind;
                    const slotReward = getTrailerSlotReward(slot.kind, slotBroken);

                    return (
                      <button
                        key={slot.kind}
                        type="button"
                        disabled={isClaimed || isSubmitting}
                        onClick={() => {
                          setTrailerType(slot.label);
                        }}
                        className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                          isClaimed
                            ? 'cursor-not-allowed border-[#252846] bg-[#0b0d1a]/60 opacity-65'
                            : isSelected
                            ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                            : slotBroken
                            ? 'border-rose-500/40 bg-rose-500/10 hover:border-rose-400'
                            : 'border-[#252846] bg-[#0b0d1a] hover:border-cyan-400/50'
                        }`}
                      >
                        <div className="flex w-full items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-white">
                            {slot.shortLabel}
                          </span>
                          {isClaimed ? (
                            <span className="rounded-full bg-[#171a30] border border-[#2b3052] px-2 py-0.5 text-[10px] font-mono font-medium text-slate-400">
                              Added
                            </span>
                          ) : slotBroken ? (
                            <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-mono font-semibold text-rose-300">
                              Broken · +{slotReward} fix
                            </span>
                          ) : (
                            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-300">
                              +{slotReward} tokens
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400">
                          {isClaimed
                            ? 'Already attached for this release.'
                            : slotBroken
                            ? 'Flagged broken — submit a working replacement.'
                            : slot.helperText}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {openOrBrokenSlots.length === 0 || isSelectedSlotClaimed ? (
                <div className="rounded-2xl border border-[#252846] bg-[#0b0d1a]/80 p-4 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-3">
                  <span>
                    All trailer slots (including <strong>Official Trailer</strong> and{' '}
                    <strong>Teaser</strong>) are already claimed for this release.
                  </span>
                  {hasActiveVerifiedTrailer && (
                    <button
                      type="button"
                      onClick={() => setMode('view_or_flag')}
                      className="px-3 py-1.5 rounded-xl bg-[#171a30] border border-cyan-500/40 text-cyan-300 hover:text-white font-mono text-[11px] font-semibold"
                    >
                      Watch Clips / Flag Broken
                    </button>
                  )}
                </div>
              ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Scout Handle & Trailer Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                      Scout Handle *
                    </label>
                    <input
                      type="text"
                      value={scoutHandle}
                      onChange={(e) => setScoutHandle(e.target.value)}
                      maxLength={40}
                      required
                      placeholder="Your contributor handle"
                      className="w-full px-3 py-2 rounded-xl bg-[#0b0d1a] border border-[#2b3052] text-xs text-amber-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                      Selected Slot *
                    </label>
                    <select
                      value={trailerType}
                      onChange={(e) => setTrailerType(e.target.value as TrailerType)}
                      className="w-full px-3 py-2 rounded-xl bg-[#0b0d1a] border border-[#2b3052] text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      {TRAILER_SLOTS.map((slot) => {
                        const existing = allSlots.find((t) => t.kind === slot.kind);
                        const isClaimed = claimedKinds.has(slot.kind);
                        const isSlotBroken = existing?.status === 'flagged_broken';
                        const slotReward = getTrailerSlotReward(slot.kind, isSlotBroken);
                        const suffix = isClaimed
                          ? ' (Added)'
                          : isSlotBroken
                          ? ` (Broken · +${slotReward})`
                          : ` (Open · +${slotReward})`;
                        return (
                          <option key={slot.kind} value={slot.label} disabled={isClaimed}>
                            {slot.label}{suffix}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* YouTube URL Input */}
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                    Official YouTube URL *
                  </label>
                  <div className="relative">
                    <Link2 className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      inputMode="url"
                      value={trailerUrl}
                      onChange={(e) => setTrailerUrl(e.target.value)}
                      required
                      placeholder="https://www.youtube.com/watch?v=... or youtu.be/..."
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0b0d1a] border border-[#2b3052] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  {trailerUrl.trim() && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] font-mono">
                      {parsedPreview ? (
                        <span className="text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            Normalized ID: <strong className="text-white">{parsedPreview.videoId}</strong>
                            <span className="text-slate-400 ml-1.5">({parsedPreview.canonicalUrl})</span>
                          </span>
                        </span>
                      ) : (
                        <span className="text-rose-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          Enter a valid YouTube video URL (watch, youtu.be, /shorts/, /embed/, or /live/ — no playlists or channels)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Official Confirmation Checkbox & Microcopy */}
                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#0b0d1a] border border-[#252846] cursor-pointer hover:border-amber-400/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={confirmedOfficial}
                    onChange={(e) => setConfirmedOfficial(e.target.checked)}
                    className="mt-0.5 rounded border-[#2b3052] bg-[#121528] text-amber-500 focus:ring-0"
                  />
                  <div className="text-xs space-y-1">
                    <span className="font-semibold text-white block">
                      Confirm official studio / publisher source
                    </span>
                    <span className="text-[11px] text-slate-400 block leading-relaxed">
                      Tokens (+{bountyTokens} Tokens) are credited only once this link passes automated URL normalization, duplicate checks, public/embeddable YouTube verification, and official-channel checks. Ambiguous third-party uploads enter pending review with tokens held.
                    </span>
                  </div>
                </label>

                {isCoolingDown && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-200 flex items-center justify-between gap-2"
                  >
                    <span>{result?.error || 'Submission rate limit active.'}</span>
                    <span className="font-mono font-bold tabular-nums shrink-0 text-amber-300">
                      Try again in {secondsLeft}s
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || isCoolingDown}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-[#0b0d1a] text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_18px_rgba(245,158,11,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Coins className="w-4 h-4" />
                    <span>
                      {isSubmitting
                        ? 'Running Automated Checks...'
                        : isCoolingDown
                        ? `Wait ${secondsLeft}s`
                        : `Verify & Submit (+${bountyTokens} Tokens)`}
                    </span>
                  </button>
                </div>
              </form>
              )}

              {/* Step 3 & 4 Automated Check Result Card */}
              {result && (
                <div
                  className={`p-4 rounded-2xl border space-y-3 ${
                    result.outcome === 'verified'
                      ? 'bg-emerald-500/10 border-emerald-500/40'
                      : result.outcome === 'pending_review'
                      ? 'bg-amber-500/10 border-amber-500/40'
                      : result.outcome === 'duplicate'
                      ? 'bg-cyan-500/10 border-cyan-500/40'
                      : 'bg-rose-500/10 border-rose-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      {result.outcome === 'verified' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : result.outcome === 'pending_review' ? (
                        <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <h4 className="font-mono text-xs font-bold uppercase text-white">
                          {result.outcome === 'verified'
                            ? `Official trailer added! +${result.tokensAwarded || 0} tokens credited`
                            : result.outcome === 'pending_review'
                            ? `Submitted for verification (+${result.tokensHeld || 0} tokens held)`
                            : result.outcome === 'duplicate'
                            ? result.message || 'This trailer is already linked to this release'
                            : result.error || 'Submission rejected'}
                        </h4>
                        {result.verification?.videoTitle && (
                          <p className="text-[11px] text-slate-300 mt-1">
                            Detected: <strong>{result.verification.videoTitle}</strong>
                            {result.verification.channelName ? ` • Channel: ${result.verification.channelName}` : ''}
                          </p>
                        )}
                        {result.verification?.reason && (
                          <p className="text-[11px] text-slate-400 mt-0.5">{result.verification.reason}</p>
                        )}
                        {result.verification?.evaluation && (
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-mono">
                            <span className="px-2 py-0.5 rounded bg-[#0b0d1a] border border-[#2b3052] text-cyan-300 tabular-nums">
                              Title Match Score: {result.verification.evaluation.score}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-[#0b0d1a] border border-[#2b3052] text-slate-300 uppercase">
                              Verdict: {result.verification.evaluation.verdict.replace('_', ' ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {(result.outcome === 'verified' || result.outcome === 'pending_review') && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenWallet();
                        }}
                        className="shrink-0 px-3 py-1.5 rounded-xl bg-[#0b0d1a] border border-amber-400/50 text-amber-300 hover:text-white text-[11px] font-mono font-bold flex items-center gap-1"
                      >
                        <Wallet className="w-3.5 h-3.5" />
                        <span>Wallet</span>
                      </button>
                    )}
                  </div>

                  {result.verification?.checks && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-2 border-t border-white/10 text-[10px] font-mono">
                      {[
                        { label: 'ID Normalized', ok: result.verification.checks.urlNormalized },
                        { label: 'Public / Embeddable', ok: result.verification.checks.embeddablePublic },
                        { label: 'No Fan-Edit Signals', ok: result.verification.checks.noFanEditSignals },
                        { label: 'Title Match', ok: result.verification.checks.titleRelevant },
                        { label: 'Official Studio Cue', ok: result.verification.checks.officialChannelOrCue }
                      ].map((chk) => (
                        <div
                          key={chk.label}
                          className={`px-2 py-1 rounded flex items-center gap-1 ${
                            chk.ok ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'
                          }`}
                        >
                          <span>{chk.ok ? '✓' : '✕'}</span>
                          <span className="truncate">{chk.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
