import React, { useEffect, useState } from 'react';

interface TrailerSubmitFormProps {
  dropId: string;
  dropTitle: string;
  submittedBy?: string;
  onSuccess?: (data: { tokensAwarded?: number; walletBalance?: number }) => void;
}

export const TrailerSubmitForm: React.FC<TrailerSubmitFormProps> = ({
  dropId,
  dropTitle,
  submittedBy = 'Trailer Scout',
  onSuccess
}) => {
  const [trailerUrl, setTrailerUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Epoch timestamp (ms) when rate limit expires; null when not rate-limited
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);

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
        setErrorMessage(null);
      }
    };

    updateRemaining();
    const timer = window.setInterval(updateRemaining, 1000);
    return () => window.clearInterval(timer);
  }, [cooldownUntil]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || secondsLeft > 0) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/drops/${encodeURIComponent(dropId)}/trailer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': submittedBy
        },
        body: JSON.stringify({
          trailerUrl: trailerUrl.trim(),
          submittedBy,
          userConfirmedOfficial: true
        })
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 429) {
        const headerRetry = Number(res.headers.get('Retry-After'));
        const bodyRetry = Number(data?.retryAfterSeconds);
        const retrySeconds =
          Number.isFinite(bodyRetry) && bodyRetry > 0
            ? bodyRetry
            : Number.isFinite(headerRetry) && headerRetry > 0
            ? headerRetry
            : 60;

        setCooldownUntil(Date.now() + retrySeconds * 1000);
        setSecondsLeft(retrySeconds);
        setErrorMessage(
          typeof data?.error === 'string'
            ? data.error
            : `Submission limit reached. Please wait ${retrySeconds}s before trying again.`
        );
        return;
      }

      if (!res.ok) {
        setErrorMessage(
          typeof data?.error === 'string' ? data.error : 'Could not submit trailer URL.'
        );
        return;
      }

      setTrailerUrl('');
      setStatusMessage(
        data?.tokensAwarded > 0
          ? `Official trailer added! +${data.tokensAwarded} tokens credited to your wallet.`
          : 'Trailer submitted successfully.'
      );
      onSuccess?.(data);
    } catch {
      setErrorMessage('Network error while submitting trailer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCoolingDown = secondsLeft > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block text-xs font-medium text-zinc-300">
        Official YouTube Trailer URL for {dropTitle}
      </label>

      <div className="flex gap-2">
        <input
          type="url"
          required
          value={trailerUrl}
          onChange={(e) => setTrailerUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          disabled={isSubmitting || isCoolingDown}
          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 disabled:opacity-60"
        />

        <button
          type="submit"
          disabled={isSubmitting || isCoolingDown}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Checking...' : isCoolingDown ? `Wait ${secondsLeft}s` : 'Submit'}
        </button>
      </div>

      {isCoolingDown && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200"
        >
          {errorMessage || 'Rate limit active.'}{' '}
          <span className="font-semibold tabular-nums">Try again in {secondsLeft}s.</span>
        </div>
      )}

      {!isCoolingDown && errorMessage && (
        <p role="alert" className="text-xs text-red-400">
          {errorMessage}
        </p>
      )}

      {statusMessage && (
        <p role="status" className="text-xs text-emerald-400">
          {statusMessage}
        </p>
      )}
    </form>
  );
};
