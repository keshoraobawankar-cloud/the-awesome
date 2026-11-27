const YOUTUBE_VIDEO_ID_REGEX = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtu.be',
  'www.youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com'
]);

export interface ParsedYouTubeTrailer {
  videoId: string;
  canonicalUrl: string;
}

export function parseYouTubeTrailerUrl(rawUrl: string): ParsedYouTubeTrailer | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed.length > 500) return null;

  // Reject explicit non-http(s) schemes (e.g. javascript:, data:, file:, ftp:)
  const schemeMatch = trimmed.match(/^([a-zA-Z][a-zA-Z\d+\-.]*):/);
  if (schemeMatch && !/^https?$/i.test(schemeMatch[1])) {
    return null;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(withProtocol);
  } catch {
    return null;
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return null;
  }

  const host = parsed.hostname.toLowerCase();
  if (!YOUTUBE_HOSTS.has(host)) return null;

  let candidateId = '';

  if (host === 'youtu.be' || host === 'www.youtu.be') {
    const [firstSegment] = parsed.pathname.split('/').filter(Boolean);
    candidateId = firstSegment ?? '';
  } else if (parsed.pathname === '/watch' || parsed.pathname === '/watch/') {
    candidateId = parsed.searchParams.get('v') ?? '';
  } else {
    const [prefix, idSegment] = parsed.pathname.split('/').filter(Boolean);
    if (prefix === 'shorts' || prefix === 'embed' || prefix === 'live' || prefix === 'v') {
      candidateId = idSegment ?? '';
    }
  }

  if (!YOUTUBE_VIDEO_ID_REGEX.test(candidateId)) {
    return null;
  }

  return {
    videoId: candidateId,
    canonicalUrl: `https://www.youtube.com/watch?v=${candidateId}`
  };
}

export function buildYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
}

export type TrailerKind =
  | 'teaser'
  | 'official_trailer'
  | 'gameplay'
  | 'launch_trailer';

export type TrailerDisplayType =
  | 'Official Teaser'
  | 'Official Trailer'
  | 'Gameplay / Overview'
  | 'Final Trailer';

export interface DropTrailerItem {
  id: string;
  dropId: string;
  kind: TrailerKind;
  videoId: string;
  url: string;
  embedUrl?: string;
  title?: string;
  channelName?: string;
  isPrimary?: boolean;
  addedByUserId?: string;
  status?: 'verified' | 'flagged_broken';
  flagReason?: string;
  flaggedBy?: string;
  createdAt: string;
}

export const TRAILER_KIND_PRIORITY: TrailerKind[] = [
  'official_trailer',
  'launch_trailer',
  'teaser',
  'gameplay'
];

export function trailerTypeToKind(input?: string): TrailerKind {
  const normalized = (input || '').trim().toLowerCase();
  if (normalized === 'teaser' || normalized.includes('teaser')) return 'teaser';
  if (normalized === 'gameplay' || normalized.includes('gameplay') || normalized.includes('overview')) {
    return 'gameplay';
  }
  if (
    normalized === 'launch_trailer' ||
    normalized.includes('launch') ||
    normalized.includes('final')
  ) {
    return 'launch_trailer';
  }
  return 'official_trailer';
}

export function trailerKindToLabel(kind: TrailerKind): TrailerDisplayType {
  switch (kind) {
    case 'teaser':
      return 'Official Teaser';
    case 'gameplay':
      return 'Gameplay / Overview';
    case 'launch_trailer':
      return 'Final Trailer';
    case 'official_trailer':
    default:
      return 'Official Trailer';
  }
}

export function trailerKindShortLabel(kind: TrailerKind): string {
  switch (kind) {
    case 'official_trailer':
      return 'Official Trailer';
    case 'teaser':
      return 'Teaser';
    case 'gameplay':
      return 'Gameplay';
    case 'launch_trailer':
      return 'Launch / Final';
  }
}

export const TRAILER_SLOT_REWARDS: Record<TrailerKind, number> = {
  official_trailer: 25,
  teaser: 15,
  gameplay: 20,
  launch_trailer: 25
};

export function getTrailerSlotReward(
  kind: TrailerKind,
  isBrokenFix = false
): number {
  if (isBrokenFix) return 10;
  return TRAILER_SLOT_REWARDS[kind] ?? 25;
}

export function getClaimedTrailerKinds(
  existingTrailers?: Array<{ kind?: string; status?: string }>,
  legacyTrailerUrl?: string,
  legacyTrailerType?: string,
  legacyStatus?: string
): Set<TrailerKind> {
  const claimed = new Set<TrailerKind>();
  if (existingTrailers && existingTrailers.length > 0) {
    for (const item of existingTrailers) {
      if (item.kind && item.status !== 'flagged_broken') {
        claimed.add(trailerTypeToKind(item.kind));
      }
    }
  }
  if (claimed.size === 0 && legacyTrailerUrl && legacyStatus !== 'flagged_broken') {
    claimed.add(trailerTypeToKind(legacyTrailerType || 'Official Trailer'));
  }
  return claimed;
}

export function computePrimaryTrailer(
  trailers: DropTrailerItem[]
): DropTrailerItem | undefined {
  const active = trailers.filter((t) => t.status !== 'flagged_broken');
  if (active.length === 0) return undefined;

  const explicitPrimary = active.find((t) => t.isPrimary);
  if (explicitPrimary) return explicitPrimary;

  for (const kind of TRAILER_KIND_PRIORITY) {
    const match = active.find((t) => t.kind === kind);
    if (match) return match;
  }

  return active[0];
}

export function computePrimaryTrailerUrl(
  trailers: DropTrailerItem[]
): string | undefined {
  return computePrimaryTrailer(trailers)?.url;
}

export function upsertDropTrailer<
  T extends { id: string; trailers?: DropTrailerItem[]; trailerUrl?: string }
>(
  drop: T,
  incoming: Omit<DropTrailerItem, 'id' | 'dropId' | 'createdAt'>
): { drop: T; replacedExistingKind: boolean; item: DropTrailerItem } {
  const existingTrailers = drop.trailers || [];
  const existingSameKindIndex = existingTrailers.findIndex(
    (t) => t.kind === incoming.kind
  );
  const replacedExistingKind = existingSameKindIndex !== -1;

  const nextItem: DropTrailerItem = {
    ...incoming,
    embedUrl: incoming.embedUrl || buildYouTubeEmbedUrl(incoming.videoId),
    status: incoming.status || 'verified',
    id:
      existingSameKindIndex !== -1
        ? existingTrailers[existingSameKindIndex].id
        : `trl_${Date.now()}_${incoming.videoId}`,
    dropId: drop.id,
    createdAt:
      existingSameKindIndex !== -1
        ? existingTrailers[existingSameKindIndex].createdAt
        : new Date().toISOString()
  };

  let nextTrailers =
    existingSameKindIndex !== -1
      ? existingTrailers.map((item, idx) =>
          idx === existingSameKindIndex ? nextItem : item
        )
      : [...existingTrailers, nextItem];

  // Unless caller explicitly pins an item as primary, re-evaluate priority so
  // official_trailer automatically promotes over teaser when added later.
  if (incoming.isPrimary === true) {
    nextTrailers = nextTrailers.map((item) => ({
      ...item,
      isPrimary: item.id === nextItem.id
    }));
  } else {
    const cleared = nextTrailers.map((item) => ({ ...item, isPrimary: false }));
    const winner = computePrimaryTrailer(cleared);
    nextTrailers = cleared.map((item) => ({
      ...item,
      isPrimary: winner ? item.id === winner.id : false
    }));
  }

  return {
    replacedExistingKind,
    item: nextTrailers.find((t) => t.id === nextItem.id) || nextItem,
    drop: {
      ...drop,
      trailers: nextTrailers,
      trailerUrl: computePrimaryTrailerUrl(nextTrailers)
    }
  };
}


export type TrailerMatchVerdict = 'auto_verify' | 'pending_review' | 'reject';

export interface TrailerTitleEvaluation {
  verdict: TrailerMatchVerdict;
  score: number;
  matchedReleaseTokens: string[];
  matchedOfficialKeywords: string[];
  matchedRedFlags: string[];
  reasons: string[];
}

const OFFICIAL_KEYWORDS = [
  'official trailer',
  'official teaser',
  'teaser trailer',
  'final trailer',
  'launch trailer',
  'gameplay trailer',
  'overview trailer',
  'announcement trailer',
  'reveal trailer',
  'first look',
  'official',
  'trailer',
  'teaser'
];

const RED_FLAG_KEYWORDS = [
  'fan made',
  'fan-made',
  'fan trailer',
  'concept trailer',
  'ai trailer',
  'ai concept',
  'unreal engine',
  'reaction',
  'breakdown',
  'explained',
  'review',
  'leaked',
  'fake',
  'parody',
  'recap',
  'ending'
];

const STOP_WORDS = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'of',
  'in',
  'on',
  'to',
  'for',
  'with'
]);

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function tokenizeReleaseTitle(releaseTitle: string): string[] {
  return normalizeText(releaseTitle)
    .split(/\s+/)
    .filter((token) => token.length > 0 && !STOP_WORDS.has(token));
}

export function evaluateTrailerTitle(
  videoTitle: string,
  releaseTitle: string,
  channelName?: string
): TrailerTitleEvaluation {
  const normalizedVideo = normalizeText(videoTitle);
  const normalizedRelease = normalizeText(releaseTitle);
  const normalizedChannel = channelName ? normalizeText(channelName) : '';

  const releaseTokens = tokenizeReleaseTitle(releaseTitle);
  const matchedReleaseTokens = releaseTokens.filter((token) =>
    new RegExp(`\\b${token}\\b`).test(normalizedVideo)
  );

  const matchedOfficialKeywords = OFFICIAL_KEYWORDS.filter((phrase) =>
    normalizedVideo.includes(normalizeText(phrase))
  );

  const matchedRedFlags = RED_FLAG_KEYWORDS.filter((phrase) =>
    normalizedVideo.includes(normalizeText(phrase))
  );

  const reasons: string[] = [];
  let score = 0;

  // 1. Release title match check
  const tokenCoverage =
    releaseTokens.length > 0
      ? matchedReleaseTokens.length / releaseTokens.length
      : 0;

  if (normalizedRelease && normalizedVideo.includes(normalizedRelease)) {
    score += 40;
    reasons.push('Exact release title phrase found in video title.');
  } else if (releaseTokens.length > 0 && tokenCoverage >= 0.75) {
    score += 30;
    reasons.push(
      `Matched ${matchedReleaseTokens.length}/${releaseTokens.length} key words from release title.`
    );
  } else if (matchedReleaseTokens.length > 0) {
    score += 12;
    reasons.push(
      `Partial match on release title (${matchedReleaseTokens.join(', ')}).`
    );
  } else {
    score -= 35;
    reasons.push('Release title words not found in video title.');
  }

  // 2. Official trailer signals
  if (matchedOfficialKeywords.length > 0) {
    const hasStrongOfficial = matchedOfficialKeywords.some(
      (k) => k.includes('official') || k.includes('trailer') || k.includes('teaser')
    );
    score += hasStrongOfficial ? 30 : 15;
    reasons.push(
      `Detected trailer/official terms: ${matchedOfficialKeywords.slice(0, 3).join(', ')}.`
    );
  } else {
    score -= 10;
    reasons.push('No trailer or teaser keywords found in title.');
  }

  // 3. Optional channel hint
  if (normalizedChannel && releaseTokens.some((t) => normalizedChannel.includes(t))) {
    score += 15;
    reasons.push('Channel name aligns with release title.');
  }

  // 4. Fan-made / AI / commentary penalties
  if (matchedRedFlags.length > 0) {
    score -= 50 * matchedRedFlags.length;
    reasons.push(
      `Found unofficial/non-trailer indicators: ${matchedRedFlags.join(', ')}.`
    );
  }

  // 5. Verdict mapping
  let verdict: TrailerMatchVerdict;
  if (matchedRedFlags.length > 0 && score < 10) {
    verdict = 'reject';
  } else if (score >= 55 && matchedReleaseTokens.length > 0) {
    verdict = 'auto_verify';
  } else if (score >= 15) {
    verdict = 'pending_review';
  } else {
    verdict = 'reject';
  }

  return {
    verdict,
    score,
    matchedReleaseTokens,
    matchedOfficialKeywords,
    matchedRedFlags,
    reasons
  };
}
