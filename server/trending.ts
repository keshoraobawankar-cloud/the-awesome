import { DropTitle } from './types';

const TRENDING_FRANCHISE_KEYWORDS = [
  // Games
  'gta',
  'grand theft auto',
  'elden ring',
  'witcher',
  'silksong',
  'hollow knight',
  'monster hunter',
  'zelda',
  'mario',
  'metroid',
  'resident evil',
  'death stranding',
  'doom',
  'cyberpunk',
  'elder scrolls',
  'ghost of yotei',
  'ghost of yōtei',
  'wolverine',
  'crimson desert',
  // Movies & Cinema
  'avengers',
  'spider-man',
  'spider-verse',
  'batman',
  'superman',
  'dune',
  'avatar',
  'mission: impossible',
  'jurassic',
  'star wars',
  'shrek',
  'toy story',
  'odyssey',
  'ramayana',
  'war 2',
  'king',
  'dhoom',
  'pushpa',
  // Anime & Manga
  'demon slayer',
  'chainsaw man',
  'jujutsu kaisen',
  'one piece',
  'solo leveling',
  'bleach',
  'frieren',
  'dandadan',
  'my hero academia',
  'attack on titan',
  // Dramas & Books
  'squid game',
  'stranger things',
  'the last of us',
  'house of the dragon',
  'severance',
  'wednesday',
  'wind and truth',
  'stormlight',
  'hunger games'
];

export function parseReleaseTargetMs(dateStr: string): number {
  if (!dateStr) return NaN;
  const trimmed = dateStr.trim();
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(trimmed)
    ? `${trimmed}T23:59:59Z`
    : trimmed;
  return new Date(normalized).getTime();
}

export function isUpcomingDrop(drop: DropTitle, nowMs = Date.now()): boolean {
  const targetMs = parseReleaseTargetMs(drop.date);
  if (isNaN(targetMs)) return false;
  const todayStart = new Date(nowMs);
  todayStart.setUTCHours(0, 0, 0, 0);
  return targetMs >= todayStart.getTime();
}

export function computeBasePopularity(params: {
  name: string;
  category: DropTitle['category'];
  hasTrailer?: boolean;
  status?: DropTitle['status'];
  source?: DropTitle['source'];
  explicitScore?: number;
}): number {
  if (typeof params.explicitScore === 'number' && !isNaN(params.explicitScore)) {
    return Math.max(40, Math.min(100, params.explicitScore));
  }

  let score =
    params.source === 'manual'
      ? 80
      : params.source === 'tmdb' || params.source === 'anilist' || params.source === 'steam'
      ? 78
      : params.source === 'wikidata' || params.source === 'openlibrary'
      ? 74
      : 70;

  const lower = params.name.toLowerCase();
  if (TRENDING_FRANCHISE_KEYWORDS.some((kw) => lower.includes(kw))) {
    score += 18;
  }

  if (params.hasTrailer) {
    score += 4;
  }

  if (params.status === 'Confirmed') {
    score += 3;
  } else if (params.status === 'Delayed') {
    score -= 6;
  }

  return Math.max(40, Math.min(100, score));
}

export function scoreTrendingDrop(drop: DropTitle, nowMs = Date.now()): number {
  const hasTrailer = Boolean(
    drop.trailerEmbedUrl ||
      drop.trailerUrl ||
      (drop.trailers && drop.trailers.some((t) => t.status !== 'flagged_broken'))
  );

  const basePopularity = computeBasePopularity({
    name: drop.name,
    category: drop.category,
    hasTrailer,
    status: drop.status,
    source: drop.source,
    explicitScore: drop.popularityScore ?? (drop.isPopular ? 86 : undefined)
  });

  const targetMs = parseReleaseTargetMs(drop.date);
  const days = isNaN(targetMs)
    ? drop.daysRemaining
    : Math.max(0, Math.ceil((targetMs - nowMs) / (1000 * 60 * 60 * 24)));

  let proximityBoost = 0;
  if (days <= 3) proximityBoost = 36;
  else if (days <= 7) proximityBoost = 30;
  else if (days <= 14) proximityBoost = 22;
  else if (days <= 30) proximityBoost = 15;
  else if (days <= 60) proximityBoost = 8;
  else if (days <= 120) proximityBoost = 3;

  const statusBoost = drop.status === 'Confirmed' ? 10 : drop.status === 'Tentative' ? 2 : -12;
  const trailerBoost = hasTrailer ? 6 : 0;
  const artBoost = drop.image ? 3 : 0;

  return basePopularity + proximityBoost + statusBoost + trailerBoost + artBoost;
}
