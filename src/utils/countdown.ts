export interface RemainingTimeParts {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isReleased: boolean;
}

/**
 * Parses a release date string into a target epoch timestamp in the viewer's local time.
 * - Date-only strings (`YYYY-MM-DD`) target local release midnight (`00:00:00` local).
 * - If unparseable (e.g. "TBA" / "Q4 2026") and `fallbackDaysRemaining > 0`, synthesizes
 *   a future target anchored to `anchorNowMs + fallbackDaysRemaining * 86_400_000`.
 */
export function parseReleaseTimestamp(
  dateStr?: string,
  fallbackDaysRemaining?: number,
  anchorNowMs = Date.now()
): number {
  const trimmed = (dateStr || '').trim();
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    const localMidnight = new Date(year, month - 1, day, 0, 0, 0, 0).getTime();
    if (!Number.isNaN(localMidnight)) {
      return localMidnight;
    }
  }

  if (trimmed) {
    const parsed = new Date(trimmed).getTime();
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  if (typeof fallbackDaysRemaining === 'number' && fallbackDaysRemaining > 0) {
    return anchorNowMs + fallbackDaysRemaining * 86_400_000;
  }

  return anchorNowMs;
}

export function computeRemainingTime(
  targetTimestamp: number,
  nowMs = Date.now()
): RemainingTimeParts {
  const totalMs = Math.max(0, targetTimestamp - nowMs);
  return {
    totalMs,
    days: Math.floor(totalMs / (1000 * 60 * 60 * 24)),
    hours: Math.floor((totalMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((totalMs % (1000 * 60)) / 1000),
    isReleased: totalMs <= 0
  };
}

export function formatRemainingLabel(parts: RemainingTimeParts): string {
  if (parts.isReleased) return 'Released / Dropping Now';
  const segments: string[] = [];
  if (parts.days > 0) segments.push(`${parts.days}d`);
  segments.push(`${String(parts.hours).padStart(2, '0')}h`);
  segments.push(`${String(parts.minutes).padStart(2, '0')}m`);
  segments.push(`${String(parts.seconds).padStart(2, '0')}s`);
  return `${segments.join(' : ')} remaining`;
}
