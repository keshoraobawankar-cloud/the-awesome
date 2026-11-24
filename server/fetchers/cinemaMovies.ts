import { DropTitle } from '../types';

interface ParsedWikiMovie {
  title: string;
  wikiSlug?: string;
  date: string;
  studio: string;
  castAndCrew: string;
  citationSource?: string;
  citationUrl?: string;
  industry: 'Hollywood' | 'Bollywood';
  year: number;
}

const MONTH_MAP: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12
};

const MAJOR_STUDIO_HINTS = [
  'warner', 'universal', 'sony', 'disney', 'pixar', 'marvel', 'paramount',
  'netflix', 'amazon', 'mgm', 'lionsgate', 'a24', '20th century', 'apple',
  'focus', 'columbia', 'dreamworks', 'illumination', 'united artists',
  'dharma', 'yash raj', 'yrf', 'bhansali', 'maddock', 'jio', 't-series',
  'red chillies', 'rohit shetty', 'zee', 'panorama', 'viacom', 'star studio',
  'excel', 'nadiadwala', 'mythri', 'hombale'
];

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function cleanWikiText(raw: string): string {
  if (!raw) return '';
  let s = raw
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, '')
    .replace(/<ref[^>]*\/>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<br\s*\/?>/gi, ', ');

  // Convert {{hlist|a|b|c}} and {{ubl|a|b|c}} and {{plainlist|...}}
  s = s.replace(/\{\{(?:hlist|ubl|unbulleted list|flatlist|plainlist)\|([^}]*)\}\}/gi, (_m, inner) => {
    return inner
      .split('|')
      .map((p: string) => p.trim())
      .filter((p: string) => p && !p.includes('='))
      .join(', ');
  });

  // Remove remaining simple templates
  s = s.replace(/\{\{[^}]+\}\}/g, '');

  // Convert [[Page|Display]] -> Display, [[Page]] -> Page
  s = s.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2');
  s = s.replace(/\[\[([^\]]+)\]\]/g, '$1');

  // Remove bold/italic wiki quotes and HTML tags
  s = s
    .replace(/'''?/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .replace(/,\s*,/g, ',')
    .replace(/^,\s*|,\s*$/g, '')
    .trim();

  return s;
}

function extractFirstWikiSlug(raw: string): string | undefined {
  const match = raw.match(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]+)?\]\]/);
  if (!match?.[1]) return undefined;
  return match[1].trim().replace(/\s+/g, '_');
}

function extractCitationInfo(row: string): { citationSource?: string; citationUrl?: string } {
  const refMatch = row.match(/<ref[^>]*>([\s\S]*?)<\/ref>/i);
  if (!refMatch?.[1]) return {};
  const refBody = refMatch[1]
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1');

  const urlMatch = refBody.match(/\|\s*url\s*=\s*([^\s|}]+)/i);
  const siteMatch = refBody.match(/\|\s*(?:website|work|publisher)\s*=\s*([^|}]+)/i);

  const citationUrl = urlMatch?.[1]?.trim();
  const citationSource = siteMatch?.[1] ? cleanWikiText(siteMatch[1]) : undefined;

  return { citationSource, citationUrl };
}

function detectMonthCell(cellText: string): number | null {
  const ariaMatch = cellText.match(/aria-label="([A-Za-z]+)"/i);
  if (ariaMatch?.[1]) {
    const m = MONTH_MAP[ariaMatch[1].toLowerCase()];
    if (m) return m;
  }
  const stripped = cellText
    .replace(/<[^>]+>/g, '')
    .replace(/'''?/g, '')
    .replace(/\s+/g, '')
    .toLowerCase();

  for (const [key, val] of Object.entries(MONTH_MAP)) {
    if (stripped === key || stripped.startsWith(key)) {
      return val;
    }
  }
  return null;
}

function detectDayCell(cellText: string): number | null {
  const stripped = cellText
    .replace(/<[^>]+>/g, '')
    .replace(/'''?/g, '')
    .trim();
  if (/^\d{1,2}$/.test(stripped)) {
    const d = parseInt(stripped, 10);
    if (d >= 1 && d <= 31) return d;
  }
  return null;
}

function stripCellAttributes(cell: string): string {
  // Split single leading style/rowspan/colspan attribute segment (`attr | value`)
  const trimmed = cell.trim();
  const pipeIdx = trimmed.indexOf('|');
  if (pipeIdx === -1) return trimmed;
  const before = trimmed.slice(0, pipeIdx);
  // Ensure we aren't splitting inside [[...]] or {{...}} or <ref>
  if (!before.includes('[[') && !before.includes('{{') && !before.includes('<ref') && /=/.test(before)) {
    return trimmed.slice(pipeIdx + 1).trim();
  }
  return trimmed;
}

function splitWikiCells(rowBlock: string): string[] {
  // Split on `||` or line-start `|` (preserving `!` cells that represent month/day headers)
  const normalized = rowBlock
    .replace(/\r/g, '')
    .replace(/\|\|/g, '\n|');
  const lines = normalized.split('\n');
  const cells: string[] = [];
  let current = '';

  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith('|-') || t.startsWith('|+') || t.startsWith('|}')) {
      continue;
    }
    if (t.startsWith('!')) {
      const cleanedHeader = stripCellAttributes(t.slice(1).trim());
      if (detectMonthCell(cleanedHeader) !== null || detectDayCell(cleanedHeader) !== null) {
        if (current) cells.push(current);
        current = t.slice(1).trim();
      }
      continue;
    }
    if (t.startsWith('|')) {
      if (current) cells.push(current);
      current = t.slice(1).trim();
    } else {
      current = current ? `${current} ${t}` : t;
    }
  }
  if (current) cells.push(current);
  return cells.map(stripCellAttributes);
}

function parseWikipediaFilmTable(
  wikitext: string,
  year: number,
  industry: 'Hollywood' | 'Bollywood'
): ParsedWikiMovie[] {
  const movies: ParsedWikiMovie[] = [];
  if (!wikitext) return movies;

  // Ignore "Box office collection" top ranking tables; split strictly on MediaWiki table row markers
  const rows = wikitext.split(/\n\|-[^\n]*\n/);
  let currentMonth: number | null = null;
  let currentDay: number | null = null;

  for (const row of rows) {
    // Skip box office collection rows
    if (row.includes('Worldwide gross') || row.includes('{{INR|') || row.includes('Highest-grossing')) {
      continue;
    }

    const cells = splitWikiCells(row);
    if (cells.length < 3) continue;

    let idx = 0;

    // Check if cell[0] is a month indicator
    const maybeMonth = detectMonthCell(cells[idx]);
    if (maybeMonth !== null) {
      currentMonth = maybeMonth;
      idx++;
    }

    // Check if next cell is a day indicator
    if (idx < cells.length) {
      const maybeDay = detectDayCell(cells[idx]);
      if (maybeDay !== null) {
        currentDay = maybeDay;
        idx++;
      }
    }

    if (!currentMonth || !currentDay) continue;
    if (idx >= cells.length) continue;

    const titleRaw = cells[idx] || '';
    const title = cleanWikiText(titleRaw);
    if (!title || title.length < 2 || /^(title|opening|rank)$/i.test(title)) continue;

    const wikiSlug = extractFirstWikiSlug(titleRaw);

    let studio = '';
    let castAndCrew = '';

    if (industry === 'Hollywood') {
      // American table: Title | Production company | Cast and crew | Ref
      studio = cleanWikiText(cells[idx + 1] || '');
      castAndCrew = cleanWikiText(cells[idx + 2] || '');
    } else {
      // Hindi table: Title | Director | Cast | Studio | Ref
      const director = cleanWikiText(cells[idx + 1] || '');
      const cast = cleanWikiText(cells[idx + 2] || '');
      studio = cleanWikiText(cells[idx + 3] || '');
      castAndCrew = [director ? `Dir: ${director}` : '', cast].filter(Boolean).join(' • ');
    }

    const { citationSource, citationUrl } = extractCitationInfo(row);
    const dateStr = `${year}-${String(currentMonth).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;

    movies.push({
      title,
      wikiSlug,
      date: dateStr,
      studio: studio || (industry === 'Bollywood' ? 'Indian Theatrical Cinema' : 'Major Studio Theatrical'),
      castAndCrew,
      citationSource,
      citationUrl,
      industry,
      year
    });
  }

  return movies;
}

async function fetchWikipediaPageWikitext(pageTitle: string): Promise<string> {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(pageTitle)}&prop=wikitext&format=json`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'AheadOfYouRadar/1.0 (https://aheadofyou.app)' },
      signal: AbortSignal.timeout(9000)
    });
    if (!res.ok) return '';
    const json = await res.json();
    return json?.parse?.wikitext?.['*'] || '';
  } catch {
    return '';
  }
}

async function fetchWikipediaSummary(slug: string): Promise<{ image?: string; description?: string; pageUrl?: string }> {
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(slug)}`, {
      headers: { 'User-Agent': 'AheadOfYouRadar/1.0' },
      signal: AbortSignal.timeout(4500)
    });
    if (!res.ok) return {};
    const data = await res.json();
    if (data?.type === 'disambiguation') return {};
    return {
      image: data?.thumbnail?.source || data?.originalimage?.source,
      description: data?.extract ? String(data.extract).slice(0, 220) : undefined,
      pageUrl: data?.content_urls?.desktop?.page
    };
  } catch {
    return {};
  }
}

async function fetchWikidataTrailers(fromDateIso: string): Promise<Map<string, { ytId: string; wikiTitle?: string }>> {
  const map = new Map<string, { ytId: string; wikiTitle?: string }>();
  try {
    const sparql = `
      SELECT DISTINCT ?filmLabel ?yt ?article WHERE {
        ?film wdt:P31 wd:Q11424; wdt:P577 ?date; wdt:P1651 ?yt.
        { ?film wdt:P495 wd:Q30. } UNION { ?film wdt:P495 wd:Q668. } UNION { ?film wdt:P364 wd:Q15643. }
        FILTER(?date >= "${fromDateIso}T00:00:00Z"^^xsd:dateTime && ?date <= "2028-06-01T00:00:00Z"^^xsd:dateTime)
        OPTIONAL { ?article schema:about ?film; schema:isPartOf <https://en.wikipedia.org/>. }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
      } LIMIT 40
    `;
    const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(sparql)}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'AheadOfYouRadar/1.0', Accept: 'application/sparql-results+json' },
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) return map;
    const data = await res.json();
    const bindings: Array<{
      filmLabel?: { value?: string };
      yt?: { value?: string };
      article?: { value?: string };
    }> = data?.results?.bindings || [];

    for (const row of bindings) {
      const label = row.filmLabel?.value?.trim();
      const ytId = row.yt?.value?.trim();
      const articleUrl = row.article?.value;
      if (label && ytId && /^[A-Za-z0-9_-]{11}$/.test(ytId)) {
        map.set(label.toLowerCase(), { ytId, wikiTitle: articleUrl });
      }
    }
  } catch {
    // Wikidata optional enrichment; silent fallback
  }
  return map;
}

function scoreMovieNotability(movie: ParsedWikiMovie): number {
  let score = 0;
  if (movie.wikiSlug) score += 4;
  const studioLower = movie.studio.toLowerCase();
  if (MAJOR_STUDIO_HINTS.some((h) => studioLower.includes(h))) score += 3;
  if (movie.citationSource) score += 2;
  if (movie.castAndCrew.length > 25) score += 1;
  return score;
}

function getTrustedFallbackCinemaDrops(): DropTitle[] {
  const now = Date.now();
  const makeDays = (d: string) => Math.max(0, Math.ceil((new Date(d).getTime() - now) / 86400000));

  return [
    {
      id: 'cinema-hollywood-man-with-the-bag',
      name: 'The Man with the Bag',
      category: 'Movies',
      industry: 'Hollywood',
      date: '2026-12-02',
      daysRemaining: makeDays('2026-12-02'),
      status: 'Confirmed',
      platform: 'Amazon MGM Studios / Prime Video',
      gradient: 'from-[#22d3ee] via-[#3b82f6] to-[#0b0d1a]',
      accent: '#22d3ee',
      tagline: 'Arnold Schwarzenegger & Alan Ritchson • Dir: Adam Shankman',
      description: 'When Santa’s magic bag is stolen, he turns to his naughty-list archive and recruits former thief Vance to recover it before Christmas.',
      image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&auto=format&fit=crop&q=80',
      source: 'wikipedia',
      trustedSourceLabel: 'Wikipedia · Deadline Hollywood',
      sourceUrl: 'https://en.wikipedia.org/wiki/The_Man_with_the_Bag_(film)',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'cinema-bollywood-eetha',
      name: 'Eetha',
      category: 'Movies',
      industry: 'Bollywood',
      date: '2026-12-04',
      daysRemaining: makeDays('2026-12-04'),
      status: 'Confirmed',
      platform: 'Maddock Films / Theatrical Worldwide',
      gradient: 'from-[#f59e0b] via-[#ff3d71] to-[#0b0d1a]',
      accent: '#f59e0b',
      tagline: 'Shraddha Kapoor & Randeep Hooda • Dir: Laxman Utekar',
      description: 'Laxman Utekar’s theatrical drama produced by Maddock Films starring Shraddha Kapoor, Randeep Hooda, and Mohammed Zeeshan Ayyub.',
      image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80',
      source: 'wikipedia',
      trustedSourceLabel: 'Wikipedia · Bollywood Hungama',
      sourceUrl: 'https://en.wikipedia.org/wiki/Eetha',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'cinema-bollywood-golmaal-5',
      name: 'Golmaal 5',
      category: 'Movies',
      industry: 'Bollywood',
      date: '2027-01-08',
      daysRemaining: makeDays('2027-01-08'),
      status: 'Confirmed',
      platform: 'Rohit Shetty Picturez / Theatrical',
      gradient: 'from-[#f59e0b] via-[#ec4899] to-[#0b0d1a]',
      accent: '#f59e0b',
      tagline: 'Ajay Devgn & Akshay Kumar • Dir: Rohit Shetty',
      description: 'Rohit Shetty expands the blockbuster comedy franchise bringing Ajay Devgn and Akshay Kumar together for the fifth installment.',
      image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&auto=format&fit=crop&q=80',
      source: 'wikipedia',
      trustedSourceLabel: 'Wikipedia · News18 Cinema',
      sourceUrl: 'https://en.wikipedia.org/wiki/List_of_Hindi_films_of_2027',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'cinema-bollywood-love-and-war',
      name: 'Love & War',
      category: 'Movies',
      industry: 'Bollywood',
      date: '2027-01-21',
      daysRemaining: makeDays('2027-01-21'),
      status: 'Confirmed',
      platform: 'Bhansali Productions / Theatrical',
      gradient: 'from-[#f59e0b] via-[#8b5cf6] to-[#0b0d1a]',
      accent: '#f59e0b',
      tagline: 'Ranbir Kapoor, Alia Bhatt & Vicky Kaushal • Dir: Sanjay Leela Bhansali',
      description: 'Sanjay Leela Bhansali’s grand romantic drama epic starring Ranbir Kapoor, Alia Bhatt, and Vicky Kaushal arrives worldwide in January 2027.',
      image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&auto=format&fit=crop&q=80',
      source: 'wikipedia',
      trustedSourceLabel: 'Wikipedia · Bollywood Hungama',
      sourceUrl: 'https://en.wikipedia.org/wiki/List_of_Hindi_films_of_2027',
      updatedAt: new Date().toISOString()
    }
  ];
}

export async function fetchCinemaMovies(): Promise<DropTitle[]> {
  const now = new Date();
  const currentYear = now.getFullYear();
  const minTime = now.getTime() - 24 * 60 * 60 * 1000; // allow today/yesterday
  const maxTime = now.getTime() + 550 * 24 * 60 * 60 * 1000;
  const fromDateIso = new Date(minTime).toISOString().split('T')[0];

  const [usCurr, usNext, hiCurr, hiNext, wikidataTrailers] = await Promise.all([
    fetchWikipediaPageWikitext(`List_of_American_films_of_${currentYear}`),
    fetchWikipediaPageWikitext(`List_of_American_films_of_${currentYear + 1}`),
    fetchWikipediaPageWikitext(`List_of_Hindi_films_of_${currentYear}`),
    fetchWikipediaPageWikitext(`List_of_Hindi_films_of_${currentYear + 1}`),
    fetchWikidataTrailers(fromDateIso)
  ]);

  const parsedHollywood = [
    ...parseWikipediaFilmTable(usCurr, currentYear, 'Hollywood'),
    ...parseWikipediaFilmTable(usNext, currentYear + 1, 'Hollywood')
  ];
  const parsedBollywood = [
    ...parseWikipediaFilmTable(hiCurr, currentYear, 'Bollywood'),
    ...parseWikipediaFilmTable(hiNext, currentYear + 1, 'Bollywood')
  ];

  const filterUpcoming = (list: ParsedWikiMovie[]) => {
    const seen = new Set<string>();
    return list
      .filter((m) => {
        const ts = new Date(m.date).getTime();
        if (isNaN(ts) || ts < minTime || ts > maxTime) return false;
        const key = `${m.industry}-${m.title.toLowerCase()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => {
        // Balance upcoming timeline order with notability
        const scoreDiff = scoreMovieNotability(b) - scoreMovieNotability(a);
        if (Math.abs(scoreDiff) >= 3) return scoreDiff;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      })
      .slice(0, 8);
  };

  const selectedHollywood = filterUpcoming(parsedHollywood);
  const selectedBollywood = filterUpcoming(parsedBollywood);
  const combined = [...selectedHollywood, ...selectedBollywood];

  if (combined.length === 0) {
    return getTrustedFallbackCinemaDrops();
  }

  // Enrich with Wikipedia REST summaries (posters + extracts) in parallel
  const summaries: Array<{ image?: string; description?: string; pageUrl?: string }> = await Promise.all(
    combined.map((m) =>
      m.wikiSlug
        ? fetchWikipediaSummary(m.wikiSlug)
        : Promise.resolve<{ image?: string; description?: string; pageUrl?: string }>({})
    )
  );

  const drops: DropTitle[] = combined.map((movie, idx) => {
    const summary = summaries[idx] || {};
    const targetMs = new Date(movie.date).getTime();
    const daysRemaining = Math.max(0, Math.ceil((targetMs - Date.now()) / (1000 * 60 * 60 * 24)));
    const wdTrailer = wikidataTrailers.get(movie.title.toLowerCase());

    const isBollywood = movie.industry === 'Bollywood';
    const defaultImg = isBollywood
      ? 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&auto=format&fit=crop&q=80';

    const trustedLabel = movie.citationSource
      ? `Wikipedia · ${movie.citationSource}`
      : 'Wikipedia Film Registry';

    const taglineParts = [
      movie.castAndCrew ? movie.castAndCrew.slice(0, 85) : '',
      movie.studio ? movie.studio.slice(0, 45) : ''
    ].filter(Boolean);

    return {
      id: `wiki-${movie.industry.toLowerCase()}-${slugify(movie.title)}-${movie.year}`,
      name: movie.title,
      category: 'Movies',
      industry: movie.industry,
      date: movie.date,
      daysRemaining,
      status: 'Confirmed',
      platform: `${movie.studio} · Theatrical`,
      gradient: isBollywood
        ? 'from-[#f59e0b] via-[#ff3d71] to-[#0b0d1a]'
        : 'from-[#22d3ee] via-[#8b5cf6] to-[#0b0d1a]',
      accent: isBollywood ? '#f59e0b' : '#22d3ee',
      tagline: taglineParts.join(' • ') || `${movie.industry} Theatrical Release`,
      description:
        summary.description ||
        `${movie.title} is an upcoming ${movie.industry} feature scheduled for ${movie.date} (${movie.studio}).${movie.castAndCrew ? ` Featuring ${movie.castAndCrew}.` : ''}`,
      image: summary.image || defaultImg,
      source: 'wikipedia',
      sourceId: movie.wikiSlug || slugify(movie.title),
      sourceUrl:
        summary.pageUrl ||
        movie.citationUrl ||
        (movie.wikiSlug
          ? `https://en.wikipedia.org/wiki/${encodeURIComponent(movie.wikiSlug)}`
          : `https://en.wikipedia.org/wiki/List_of_${isBollywood ? 'Hindi' : 'American'}_films_of_${movie.year}`),
      trustedSourceLabel: trustedLabel,
      trailerUrl: wdTrailer ? `https://www.youtube.com/watch?v=${wdTrailer.ytId}` : undefined,
      trailerEmbedUrl: wdTrailer
        ? `https://www.youtube-nocookie.com/embed/${wdTrailer.ytId}?autoplay=1&rel=0`
        : undefined,
      trailerSource: wdTrailer ? 'Wikidata Official Trailer' : undefined,
      updatedAt: new Date().toISOString()
    };
  });

  return drops;
}
