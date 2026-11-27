import React, { useState, useMemo } from 'react';
import {
  X,
  Coins,
  Trophy,
  Film,
  Sparkles,
  Check,
  Edit3,
  PlusCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Award
} from 'lucide-react';
import { useDropData } from '../../context/DropDataContext';
import { useBugle } from '../../context/BugleContext';
import { DropTitle } from '../../data/dropRadarData';
import { trailerTypeToKind } from '../../utils/youtube';

interface TokenWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDropForTrailer: (drop: DropTitle) => void;
}

export const TokenWalletModal: React.FC<TokenWalletModalProps> = ({
  isOpen,
  onClose,
  onSelectDropForTrailer
}) => {
  const {
    drops,
    myTokens,
    contributorName,
    setContributorName,
    tokenSummary,
    reviewTrailerSubmission
  } = useDropData();
  const { showToast } = useBugle();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(contributorName);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const missingOrBrokenTrailerDrops = useMemo(() => {
    return (drops || [])
      .filter((d) => !d.trailerEmbedUrl || d.trailerStatus === 'flagged_broken')
      .slice(0, 8);
  }, [drops]);

  if (!isOpen) return null;

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (trimmed.length < 2) {
      showToast('Scout Handle must be at least 2 characters.');
      return;
    }
    setContributorName(trimmed);
    setIsEditingName(false);
    showToast(`Contributor handle set to "${trimmed}"`);
  };

  const handleReviewPending = async (
    submissionId: string,
    action: 'approve' | 'reject',
    replaceExisting = false
  ) => {
    setReviewingId(submissionId);
    const res = await reviewTrailerSubmission(submissionId, action, undefined, replaceExisting);
    setReviewingId(null);
    if (res.success) {
      showToast(res.message || (action === 'approve' ? 'Trailer approved & tokens credited!' : 'Submission rejected.'));
    } else {
      showToast(res.error || 'Could not process review.');
    }
  };

  const trustTier = tokenSummary?.contributorTrustTier || 'Rookie Scout';
  const hourlyUsed = tokenSummary?.hourlySubmissionsUsed ?? 0;
  const hourlyLimit = tokenSummary?.hourlySubmissionsLimit ?? 5;
  const dailyUsed = tokenSummary?.dailySubmissionsUsed ?? 0;
  const dailyLimit = tokenSummary?.dailySubmissionsLimit ?? 15;
  const myTrailersCount = tokenSummary?.contributorTrailers ?? 0;
  const pendingList = tokenSummary?.pendingSubmissions || [];

  const earnedBadges = [
    { id: 'scout', label: 'Trailer Scout', unlocked: myTrailersCount >= 1 || myTokens >= 25 },
    { id: 'auditor', label: 'Radar Auditor', unlocked: myTrailersCount >= 3 || myTokens >= 75 },
    { id: 'trusted', label: 'Official Curator', unlocked: myTrailersCount >= 5 || myTokens >= 125 }
  ];

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-[#0b0d1a]/85 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] rounded-3xl bg-[#121528] border-2 border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.2)] overflow-hidden flex flex-col text-slate-200 font-inter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#252846] bg-[#0b0d1a]/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-[#ff3d71] flex items-center justify-center shadow-[0_0_18px_rgba(245,158,11,0.45)]">
              <Coins className="w-5 h-5 text-[#0b0d1a]" />
            </div>
            <div>
              <h3 className="font-bebas text-2xl sm:text-3xl text-white tracking-wide leading-none">
                TRAILER SCOUT <span className="text-amber-400">TOKENS</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Idempotent reward wallet backed by automated YouTube verification & anti-spam checks.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#171a30] hover:bg-[#252846] text-slate-400 hover:text-white transition-colors"
            aria-label="Close Token Wallet"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Balance, Handle, Trust Tier & Rate Limit Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-[#171a30] to-[#0b0d1a] border border-amber-500/40 flex flex-col justify-between gap-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-amber-300 font-bold">
                      Verified Token Balance
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 border border-cyan-400/40 text-cyan-200">
                      {trustTier}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-bebas text-5xl sm:text-6xl text-white leading-none tabular-nums">
                      {myTokens}
                    </span>
                    <span className="font-mono text-xs font-bold text-amber-400 uppercase">
                      TOKENS
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">
                    Scout Handle
                  </span>
                  {isEditingName ? (
                    <form onSubmit={handleSaveName} className="flex items-center gap-1.5 mt-1">
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        maxLength={40}
                        className="w-32 px-2 py-1 rounded-lg bg-[#0b0d1a] border border-amber-400/60 text-xs text-white focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="p-1 rounded-lg bg-amber-500 text-[#0b0d1a] font-bold"
                        title="Save handle"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setNameInput(contributorName);
                        setIsEditingName(true);
                      }}
                      className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0b0d1a]/80 border border-[#2b3052] hover:border-amber-400 text-xs font-mono text-white transition-colors"
                    >
                      <span>{contributorName}</span>
                      <Edit3 className="w-3 h-3 text-amber-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {earnedBadges.map((b) => (
                  <span
                    key={b.id}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold border flex items-center gap-1 ${
                      b.unlocked
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                        : 'bg-[#0b0d1a]/70 border-[#252846] text-slate-500'
                    }`}
                  >
                    <Award className="w-3 h-3" />
                    <span>{b.label}</span>
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-amber-500/20 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold">
                    +25
                  </span>
                  <span className="text-slate-300">Verified official trailer</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono font-bold">
                    +10
                  </span>
                  <span className="text-slate-300">Replace flagged broken link</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0b0d1a] border border-[#252846] flex flex-col justify-between gap-3">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Network Pool</span>
                </span>
                <div className="font-bebas text-4xl text-white mt-1 tabular-nums">
                  {tokenSummary?.totalTokensDistributed || 0}
                </div>
                <p className="text-xs text-slate-400">
                  Credited across {tokenSummary?.totalTrailersContributed || 0} verified trailers
                </p>
              </div>
              <div className="pt-3 border-t border-[#252846] space-y-1 text-[11px] font-mono">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Hourly Quota</span>
                  <span className={hourlyUsed >= hourlyLimit ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                    {hourlyUsed}/{hourlyLimit}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Daily Quota</span>
                  <span className={dailyUsed >= dailyLimit ? 'text-rose-400 font-bold' : 'text-cyan-300'}>
                    {dailyUsed}/{dailyLimit}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Verification Queue (if any ambiguous submissions await review) */}
          {pendingList.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/35 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bebas text-lg text-white tracking-wide flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>PENDING VERIFICATION QUEUE ({pendingList.length})</span>
                </h4>
                <span className="text-[11px] font-mono text-amber-200">
                  Tokens held until approved
                </span>
              </div>
              <div className="space-y-2">
                {pendingList.map((sub) => {
                  const targetDrop = drops.find((d) => d.id === sub.dropId);
                  const subKind = sub.kind || trailerTypeToKind(sub.trailerType);
                  const targetTrailers = targetDrop?.trailers || [];
                  const hasActiveHealthy =
                    targetTrailers.length > 0
                      ? targetTrailers.some((t) => t.kind === subKind && t.status !== 'flagged_broken')
                      : Boolean(
                          targetDrop?.trailerEmbedUrl &&
                            targetDrop?.trailerStatus !== 'flagged_broken' &&
                            trailerTypeToKind(targetDrop?.trailerType) === subKind
                        );
                  return (
                    <div
                      key={sub.id}
                      className="p-3 rounded-xl bg-[#0b0d1a] border border-[#252846] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white">{sub.dropName}</span>
                          <span className="px-2 py-0.5 rounded bg-[#171a30] text-cyan-300 font-mono text-[10px]">
                            {sub.trailerType}
                          </span>
                          <span className="text-amber-300 font-mono text-[10px]">
                            +{sub.tokensHeld} held · by {sub.submittedBy}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {sub.videoTitle ? `${sub.videoTitle} (${sub.channelName || 'Unknown channel'})` : sub.canonicalUrl}
                        </p>
                        {sub.rejectionReason && (
                          <p className="text-[10px] text-amber-200/80">{sub.rejectionReason}</p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          disabled={reviewingId === sub.id}
                          onClick={() => handleReviewPending(sub.id, 'reject')}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 font-mono text-[11px]"
                        >
                          Reject
                        </button>
                        {hasActiveHealthy ? (
                          <>
                            <button
                              type="button"
                              disabled={reviewingId === sub.id}
                              onClick={() => handleReviewPending(sub.id, 'approve', false)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#171a30] hover:bg-[#252846] border border-[#2b3052] text-slate-200 font-mono text-[11px]"
                              title="Keep existing active trailer on the release (0 tokens)"
                            >
                              Keep Current
                            </button>
                            <button
                              type="button"
                              disabled={reviewingId === sub.id}
                              onClick={() => handleReviewPending(sub.id, 'approve', true)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#0b0d1a] font-mono font-bold text-[11px] flex items-center gap-1"
                              title="Replace active trailer on the release (+10 tokens)"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Replace Active (+10)</span>
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            disabled={reviewingId === sub.id}
                            onClick={() => handleReviewPending(sub.id, 'approve', false)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#0b0d1a] font-mono font-bold text-[11px] flex items-center gap-1"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Approve +{sub.tokensHeld}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Titles Needing Official Trailers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bebas text-xl text-white tracking-wide flex items-center gap-2">
                <Film className="w-4 h-4 text-cyan-400" />
                <span>RELEASES NEEDING OFFICIAL TRAILERS</span>
              </h4>
              <span className="text-[11px] font-mono text-amber-300 font-semibold">
                +25 Tokens each (+10 Fix)
              </span>
            </div>

            {missingOrBrokenTrailerDrops.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#0b0d1a] border border-[#252846] text-xs text-slate-400">
                Every tracked title currently has an active verified trailer! You can still flag any broken/outdated link or add a missing secondary teaser/gameplay clip.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {missingOrBrokenTrailerDrops.map((drop) => {
                  const isBroken = drop.trailerStatus === 'flagged_broken';
                  return (
                    <button
                      key={drop.id}
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectDropForTrailer(drop);
                      }}
                      className="p-3 rounded-xl bg-[#0b0d1a] hover:bg-[#171a30] border border-[#252846] hover:border-amber-400/60 text-left flex items-center justify-between gap-3 transition-all group"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#171a30] text-cyan-300 border border-[#2b3052]">
                            {drop.category}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {drop.date}
                          </span>
                        </div>
                        <p className="font-inter font-semibold text-xs text-white truncate group-hover:text-amber-300 transition-colors">
                          {drop.name}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 px-2.5 py-1 rounded-lg border text-[11px] font-mono font-bold flex items-center gap-1 transition-colors ${
                          isBroken
                            ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 group-hover:bg-rose-500 group-hover:text-white'
                            : 'bg-amber-500/15 border-amber-500/40 text-amber-300 group-hover:bg-amber-500 group-hover:text-[#0b0d1a]'
                        }`}
                      >
                        <PlusCircle className="w-3 h-3" />
                        <span>{isBroken ? '+10 Fix' : '+25'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Leaderboard & Reward Transaction History */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Leaderboard */}
            <div className="p-4 rounded-2xl bg-[#0b0d1a] border border-[#252846] space-y-3">
              <h4 className="font-bebas text-lg text-white tracking-wide flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>TOP TRAILER SCOUTS</span>
              </h4>
              {!tokenSummary?.leaderboard?.length ? (
                <p className="text-xs text-slate-400">
                  No verified trailer rewards claimed yet. Be the first scout on the leaderboard!
                </p>
              ) : (
                <div className="space-y-2">
                  {tokenSummary.leaderboard.slice(0, 6).map((entry, idx) => (
                    <div
                      key={entry.contributorName}
                      className="flex items-center justify-between p-2 rounded-xl bg-[#121528] border border-[#252846]/80 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                            idx === 0
                              ? 'bg-amber-400 text-[#0b0d1a]'
                              : idx === 1
                              ? 'bg-slate-300 text-[#0b0d1a]'
                              : idx === 2
                              ? 'bg-orange-400 text-[#0b0d1a]'
                              : 'bg-[#171a30] text-slate-400'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <span className="font-semibold text-white truncate block">
                            {entry.contributorName}
                          </span>
                          {entry.trustTier && (
                            <span className="text-[10px] font-mono text-cyan-300">
                              {entry.trustTier}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 font-mono">
                        <span className="text-[10px] text-slate-400">
                          {entry.trailersAdded} {entry.trailersAdded === 1 ? 'trailer' : 'trailers'}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                          {entry.tokens}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reward Transaction History */}
            <div className="p-4 rounded-2xl bg-[#0b0d1a] border border-[#252846] space-y-3">
              <h4 className="font-bebas text-lg text-white tracking-wide flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>REWARD TRANSACTION HISTORY</span>
              </h4>
              {!tokenSummary?.recentRewards?.length ? (
                <p className="text-xs text-slate-400">
                  Verified token payouts, pending holds, and audit logs will appear here in real time.
                </p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {tokenSummary.recentRewards.slice(0, 12).map((ev) => {
                    const isHeld = ev.status === 'held';
                    const isRejected = ev.status === 'rejected';
                    return (
                      <div
                        key={ev.id}
                        className="p-2.5 rounded-xl bg-[#121528] border border-[#252846]/80 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-white truncate">
                            {ev.contributorName}
                          </span>
                          {isRejected ? (
                            <span className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono text-[10px] font-bold shrink-0 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              REJECTED (0)
                            </span>
                          ) : isHeld ? (
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold shrink-0">
                              PENDING HOLD
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold shrink-0 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              +{ev.tokensEarned} TOKENS
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2">{ev.reason}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
