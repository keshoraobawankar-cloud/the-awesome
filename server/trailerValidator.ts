import { TrailerType } from './types';
import {
  parseYouTubeTrailerUrl,
  buildYouTubeEmbedUrl,
  evaluateTrailerTitle,
  TrailerTitleEvaluation
} from '../src/utils/youtube';

export interface NormalizedTrailerUrl {
  valid: boolean;
  videoId?: string;
  provider?: 'youtube';
  canonicalUrl?: string;
  embedUrl?: string;
  error?: string;
}

export interface YouTubeOEmbedMetadata {
  title: string;
  authorName: string;
  authorUrl?: string;
}

export type OEmbedLookupStatus =
  | { kind: 'ok'; title: string; authorName: string; authorUrl?: string }
  | { kind: 'unavailable'; reason: string }
  | { kind: 'transient_error'; reason: string };

export interface TrailerVerificationResult {
  outcome: 'verified' | 'pending_review' | 'rejected';
  officialSignal: 'strong' | 'moderate' | 'ambiguous' | 'rejected';
  videoTitle?: string;
  channelName?: string;
  reason: string;
  transientError?: boolean;
  evaluation?: TrailerTitleEvaluation;
  checks: {
    urlNormalized: boolean;
    embeddablePublic: boolean;
    noFanEditSignals: boolean;
    titleRelevant: boolean;
    officialChannelOrCue: boolean;
  };
}

const OFFICIAL_CHANNEL_HINTS = [
  'rockstar',
  'marvel',
  'sony',
  'warner',
  'universal',
  'disney',
  'pixar',
  'paramount',
  'netflix',
  'prime video',
  'amazon',
  'mgm',
  'lionsgate',
  'a24',
  '20th century',
  'apple tv',
  'playstation',
  'xbox',
  'nintendo',
  'ign',
  'game awards',
  'crunchyroll',
  'toho',
  'aniplex',
  'mappa',
  'kadokawa',
  'yrf',
  'yash raj',
  'dharma',
  't-series',
  'red chillies',
  'zee',
  'maddock',
  'viacom',
  'capcom',
  'bandai',
  'square enix',
  'team cherry',
  'insomniac',
  'official',
  'pictures',
  'studios',
  'entertainment',
  'films'
];

export function normalizeYouTubeUrl(rawUrl?: string): NormalizedTrailerUrl {
  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return { valid: false, error: 'Please paste a YouTube trailer URL.' };
  }

  if (rawUrl.trim().length > 500) {
    return { valid: false, error: 'Trailer URL is too long.' };
  }

  const parsed = parseYouTubeTrailerUrl(rawUrl);
  if (!parsed) {
    return {
      valid: false,
      error:
        'Invalid YouTube video link. Paste a standard watch, youtu.be, /shorts/, /embed/, or /live/ URL (playlists and channels are not accepted).'
    };
  }

  return {
    valid: true,
    videoId: parsed.videoId,
    provider: 'youtube',
    canonicalUrl: parsed.canonicalUrl,
    embedUrl: buildYouTubeEmbedUrl(parsed.videoId)
  };
}

export async function lookupYouTubeOEmbedSafe(
  canonicalUrl: string,
  timeoutMs = 4000
): Promise<OEmbedLookupStatus> {
  const endpoint = new URL('https://www.youtube.com/oembed');
  endpoint.searchParams.set('url', canonicalUrl);
  endpoint.searchParams.set('format', 'json');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(endpoint.toString(), {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'AheadOfYouRadar/1.0'
      }
    });

    if (res.status === 400 || res.status === 401 || res.status === 403 || res.status === 404) {
      return {
        kind: 'unavailable',
        reason: 'Video is private, removed, or does not allow embedding.'
      };
    }

    if (!res.ok) {
      return {
        kind: 'transient_error',
        reason: `YouTube oEmbed returned HTTP ${res.status}.`
      };
    }

    const data = (await res.json()) as {
      title?: unknown;
      author_name?: unknown;
      author_url?: unknown;
    };
    if (typeof data.title !== 'string' || typeof data.author_name !== 'string') {
      return {
        kind: 'transient_error',
        reason: 'Incomplete metadata returned by YouTube oEmbed.'
      };
    }

    return {
      kind: 'ok',
      title: data.title.trim(),
      authorName: data.author_name.trim(),
      authorUrl: typeof data.author_url === 'string' ? data.author_url : undefined
    };
  } catch (err) {
    const isAbort = err instanceof Error && err.name === 'AbortError';
    return {
      kind: 'transient_error',
      reason: isAbort ? 'YouTube oEmbed request timed out.' : 'Network error contacting oEmbed.'
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchYouTubeOEmbedMetadata(
  canonicalUrl: string,
  timeoutMs = 5000
): Promise<YouTubeOEmbedMetadata | null> {
  const lookup = await lookupYouTubeOEmbedSafe(canonicalUrl, timeoutMs);
  if (lookup.kind !== 'ok') return null;
  return {
    title: lookup.title,
    authorName: lookup.authorName,
    authorUrl: lookup.authorUrl
  };
}

export async function verifyTrailerSubmission(rawUrl: string, releaseTitle: string) {
  const parsed = parseYouTubeTrailerUrl(rawUrl);
  if (!parsed) {
    return {
      ok: false as const,
      status: 400,
      error: 'Please enter a valid YouTube video URL.'
    };
  }

  const lookup = await lookupYouTubeOEmbedSafe(parsed.canonicalUrl);
  if (lookup.kind === 'unavailable') {
    return {
      ok: false as const,
      status: 422,
      error: lookup.reason
    };
  }
  if (lookup.kind === 'transient_error') {
    return {
      ok: true as const,
      status: 202,
      trailer: {
        videoId: parsed.videoId,
        canonicalUrl: parsed.canonicalUrl,
        videoTitle: '',
        channelName: ''
      },
      evaluation: {
        verdict: 'pending_review' as const,
        score: 0,
        matchedReleaseTokens: [],
        matchedOfficialKeywords: [],
        matchedRedFlags: [],
        reasons: [lookup.reason]
      }
    };
  }

  const evaluation = evaluateTrailerTitle(
    lookup.title,
    releaseTitle,
    lookup.authorName
  );

  return {
    ok: true as const,
    status: 200,
    trailer: {
      videoId: parsed.videoId,
      canonicalUrl: parsed.canonicalUrl,
      videoTitle: lookup.title,
      channelName: lookup.authorName
    },
    evaluation
  };
}

export async function verifyYouTubeTrailerMetadata(params: {
  videoId: string;
  dropName: string;
  trailerType: TrailerType;
  isTrustedContributor?: boolean;
}): Promise<TrailerVerificationResult> {
  const { videoId, dropName, isTrustedContributor = false } = params;
  const canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const lookup = await lookupYouTubeOEmbedSafe(canonicalUrl, 4000);

  if (lookup.kind === 'unavailable') {
    return {
      outcome: 'rejected',
      officialSignal: 'rejected',
      reason: "This video isn't publicly embeddable right now (private, removed, or embedding disabled).",
      checks: {
        urlNormalized: true,
        embeddablePublic: false,
        noFanEditSignals: false,
        titleRelevant: false,
        officialChannelOrCue: false
      }
    };
  }

  if (lookup.kind === 'transient_error') {
    return {
      outcome: 'pending_review',
      officialSignal: 'ambiguous',
      transientError: true,
      reason: `${lookup.reason} Queued for verification with tokens held until confirmed (or retry now).`,
      checks: {
        urlNormalized: true,
        embeddablePublic: true,
        noFanEditSignals: true,
        titleRelevant: true,
        officialChannelOrCue: false
      }
    };
  }

  const videoTitle = lookup.title;
  const channelName = lookup.authorName;

  if (!videoTitle) {
    return {
      outcome: 'pending_review',
      officialSignal: 'ambiguous',
      channelName,
      reason: 'Video metadata was incomplete; submitted for manual review before crediting tokens.',
      checks: {
        urlNormalized: true,
        embeddablePublic: true,
        noFanEditSignals: true,
        titleRelevant: false,
        officialChannelOrCue: false
      }
    };
  }

  const evaluation = evaluateTrailerTitle(videoTitle, dropName, channelName);
  const lowerChannel = channelName.toLowerCase();
  const hasOfficialChannel = OFFICIAL_CHANNEL_HINTS.some((hint) => lowerChannel.includes(hint));

  const noFanEditSignals = evaluation.matchedRedFlags.length === 0;
  const titleRelevant = evaluation.matchedReleaseTokens.length > 0;
  const officialChannelOrCue =
    hasOfficialChannel || evaluation.matchedOfficialKeywords.length > 0;

  if (evaluation.verdict === 'reject') {
    return {
      outcome: 'rejected',
      officialSignal: 'rejected',
      videoTitle,
      channelName,
      evaluation,
      reason:
        evaluation.reasons.join(' ') ||
        `Rejected: "${videoTitle}" did not pass official trailer relevance checks for "${dropName}".`,
      checks: {
        urlNormalized: true,
        embeddablePublic: true,
        noFanEditSignals,
        titleRelevant,
        officialChannelOrCue: false
      }
    };
  }

  const studioVerifiedPromotion =
    evaluation.verdict === 'pending_review' &&
    noFanEditSignals &&
    titleRelevant &&
    ((hasOfficialChannel && evaluation.score >= 30) ||
      (isTrustedContributor && officialChannelOrCue && evaluation.score >= 40));

  if (evaluation.verdict === 'auto_verify' || studioVerifiedPromotion) {
    return {
      outcome: 'verified',
      officialSignal:
        hasOfficialChannel && evaluation.matchedOfficialKeywords.length > 0 ? 'strong' : 'moderate',
      videoTitle,
      channelName,
      evaluation,
      reason: studioVerifiedPromotion
        ? `Verified official studio/contributor upload on "${channelName}" (score ${evaluation.score}).`
        : `Auto-verified trailer match (score ${evaluation.score}): ${evaluation.reasons.join(' ')}`,
      checks: {
        urlNormalized: true,
        embeddablePublic: true,
        noFanEditSignals,
        titleRelevant,
        officialChannelOrCue
      }
    };
  }

  return {
    outcome: 'pending_review',
    officialSignal: 'ambiguous',
    videoTitle,
    channelName,
    evaluation,
    reason: `Held for manual review (score ${evaluation.score}): ${evaluation.reasons.join(' ')}`,
    checks: {
      urlNormalized: true,
      embeddablePublic: true,
      noFanEditSignals,
      titleRelevant,
      officialChannelOrCue
    }
  };
}
