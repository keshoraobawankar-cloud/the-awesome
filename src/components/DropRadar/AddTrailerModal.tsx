import React, { useEffect, useMemo, useState } from 'react';
import { getClaimedTrailerKinds } from '../../utils/youtube';

export type TrailerSlotKind = 'teaser' | 'official_trailer';

export interface ExistingDropTrailer {
  id: string;
  kind: 'teaser' | 'official_trailer' | 'gameplay' | 'launch_trailer' | string;
  url?: string;
  videoId?: string;
  status?: 'verified' | 'flagged_broken' | string;
}

interface SlotConfig {
  kind: TrailerSlotKind;
  label: string;
  rewardTokens: number;
  helperText: string;
}

const TRAILER_SLOTS: SlotConfig[] = [
  {
    kind: 'official_trailer',
    label: 'Official Trailer',
    rewardTokens: 25,
    helperText: 'Main full trailer for this release.'
  },
  {
    kind: 'teaser',
    label: 'Teaser',
    rewardTokens: 15,
    helperText: 'Early teaser or first-look clip.'
  }
];

interface AddTrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  dropId: string;
  dropTitle: string;
  existingTrailers?: ExistingDropTrailer[];
  legacyTrailerUrl?: string;
  onSubmitTrailer: (payload: {
    dropId: string;
    kind: TrailerSlotKind;
    trailerUrl: string;
  }) => Promise<void>;
}

export const AddTrailerModal: React.FC<AddTrailerModalProps> = ({
  isOpen,
  onClose,
  dropId,
  dropTitle,
  existingTrailers = [],
  legacyTrailerUrl,
  onSubmitTrailer
}) => {
  // Derive claimed slots directly from existing trailers (ignoring flagged-broken) + legacyTrailerUrl fallback
  const claimedKinds = useMemo(
    () => getClaimedTrailerKinds(existingTrailers, legacyTrailerUrl),
    [existingTrailers, legacyTrailerUrl]
  );

  const firstOpenSlot = useMemo<TrailerSlotKind>(() => {
    const open = TRAILER_SLOTS.find((slot) => !claimedKinds.has(slot.kind));
    return open ? open.kind : 'official_trailer';
  }, [claimedKinds]);

  const [selectedKind, setSelectedKind] = useState<TrailerSlotKind>(firstOpenSlot);
  const [trailerUrl, setTrailerUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Keep selected slot aligned with an open slot when modal opens or trailers update
  useEffect(() => {
    if (isOpen && claimedKinds.has(selectedKind)) {
      setSelectedKind(firstOpenSlot);
    }
  }, [isOpen, claimedKinds, selectedKind, firstOpenSlot]);

  if (!isOpen) return null;

  const activeSlotConfig =
    TRAILER_SLOTS.find((s) => s.kind === selectedKind) ?? TRAILER_SLOTS[0];
  const isSelectedSlotOpen = !claimedKinds.has(selectedKind);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !isSelectedSlotOpen) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await onSubmitTrailer({
        dropId,
        kind: selectedKind,
        trailerUrl: trailerUrl.trim()
      });
      setTrailerUrl('');
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not attach trailer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Add trailer for ${dropTitle}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
    >
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-white shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Add Trailer & Earn Tokens</h2>
            <p className="text-xs text-zinc-400">{dropTitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            Close
          </button>
        </div>

        {/* Slot Bounty Status Cards */}
        <div className="mb-4 space-y-2">
          <span className="block text-xs font-medium text-zinc-300">
            Token Bounty Slots
          </span>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {TRAILER_SLOTS.map((slot) => {
              const isClaimed = claimedKinds.has(slot.kind);
              const isSelected = selectedKind === slot.kind;

              return (
                <button
                  key={slot.kind}
                  type="button"
                  disabled={isClaimed || isSubmitting}
                  onClick={() => {
                    setSelectedKind(slot.kind);
                    setErrorMsg(null);
                  }}
                  className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${
                    isClaimed
                      ? 'cursor-not-allowed border-zinc-800 bg-zinc-900/50 opacity-65'
                      : isSelected
                      ? 'border-emerald-400 bg-emerald-500/10'
                      : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-white">
                      {slot.label}
                    </span>

                    {isClaimed ? (
                      <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-400">
                        Added
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                        +{slot.rewardTokens} tokens
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-[11px] text-zinc-400">
                    {isClaimed
                      ? 'Already attached for this release.'
                      : slot.helperText}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Trailer URL Form */}
        {!isSelectedSlotOpen ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3 text-xs text-zinc-300">
            Both the <strong>Official Trailer</strong> and <strong>Teaser</strong>{' '}
            slots are already claimed for this release.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-zinc-300">
                YouTube URL for{' '}
                <span className="font-semibold text-white">
                  {activeSlotConfig.label}
                </span>{' '}
                <span className="text-emerald-300">
                  (+{activeSlotConfig.rewardTokens} tokens)
                </span>
              </label>
              <input
                type="url"
                required
                value={trailerUrl}
                onChange={(e) => setTrailerUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                disabled={isSubmitting}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500"
              />
            </div>

            {errorMsg && (
              <p role="alert" className="text-xs text-red-400">
                {errorMsg}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-emerald-400 px-4 py-2 text-xs font-semibold text-black transition hover:bg-emerald-300 disabled:opacity-50"
              >
                {isSubmitting
                  ? 'Verifying...'
                  : `Submit (+${activeSlotConfig.rewardTokens} Tokens)`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
