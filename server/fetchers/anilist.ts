import { DropTitle } from '../types';

interface AniListMedia {
  id: number;
  title: {
    romaji?: string;
    english?: string;
    native?: string;
  };
  coverImage?: {
    extraLarge?: string;
    large?: string;
  };
  bannerImage?: string;
  startDate?: {
    year?: number;
    month?: number;
    day?: number;
  };
  format?: string;
  genres?: string[];
  description?: string;
  nextAiringEpisode?: {
    airingAt: number;
    timeUntilAiring: number;
    episode: number;
  };
  siteUrl?: string;
}

const ANIME_QUERY = `
query UpcomingAnime($perPage: Int) {
  Page(page: 1, perPage: $perPage) {
    media(status: NOT_YET_RELEASED, sort: POPULARITY_DESC, type: ANIME) {
      id
      title {
        english
        romaji
        native
      }
      coverImage {
        extraLarge
        large
      }
      bannerImage
      startDate {
        year
        month
        day
      }
      format
      genres
      description(asHtml: false)
      nextAiringEpisode {
        airingAt
        timeUntilAiring
        episode
      }
      siteUrl
    }
  }
}
`;

const MANGA_QUERY = `
query UpcomingManga($perPage: Int) {
  Page(page: 1, perPage: $perPage) {
    media(status: NOT_YET_RELEASED, sort: POPULARITY_DESC, type: MANGA) {
      id
      title {
        english
        romaji
        native
      }
      coverImage {
        extraLarge
        large
      }
      startDate {
        year
        month
        day
      }
      format
      genres
      description(asHtml: false)
      siteUrl
    }
  }
}
`;

function stripHtml(text?: string): string {
  if (!text) return '';
  return text.replace(/<[^>]*>?/gm, '').replace(/\n+/g, ' ').trim();
}

export async function fetchAniListReleases(): Promise<DropTitle[]> {
  const drops: DropTitle[] = [];

  try {
    // 1. Fetch Anime
    const animeRes = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: ANIME_QUERY,
        variables: { perPage: 6 }
      }),
      signal: AbortSignal.timeout(8000)
    });

    if (animeRes.ok) {
      const data = await animeRes.json();
      const mediaList: AniListMedia[] = data?.data?.Page?.media || [];

      for (const item of mediaList) {
        const titleName = item.title?.english || item.title?.romaji || 'Upcoming Anime';
        
        let dateStr = '';
        let daysRemaining = 30;

        if (item.nextAiringEpisode?.airingAt) {
          const airDate = new Date(item.nextAiringEpisode.airingAt * 1000);
          dateStr = airDate.toISOString().split('T')[0];
          daysRemaining = Math.max(0, Math.ceil((airDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
        } else if (item.startDate?.year) {
          const y = item.startDate.year;
          const m = String(item.startDate.month || 1).padStart(2, '0');
          const d = String(item.startDate.day || 1).padStart(2, '0');
          dateStr = `${y}-${m}-${d}`;
          const target = new Date(dateStr).getTime();
          daysRemaining = Math.max(0, Math.ceil((target - Date.now()) / (1000 * 60 * 60 * 24)));
        } else {
          // Fallback scheduled date
          const future = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000);
          dateStr = future.toISOString().split('T')[0];
          daysRemaining = 45;
        }

        drops.push({
          id: `anilist-anime-${item.id}`,
          name: titleName,
          category: 'Anime',
          date: dateStr,
          daysRemaining,
          status: item.startDate?.day ? 'Confirmed' : 'Tentative',
          platform: item.format === 'MOVIE' ? 'Theatrical / IMAX' : 'Crunchyroll / TV Tokyo',
          gradient: 'from-[#8b5cf6] via-[#22d3ee] to-[#0b0d1a]',
          accent: '#8b5cf6',
          tagline: item.genres?.slice(0, 3).join(' • ') || 'Upcoming Broadcast Season',
          description: stripHtml(item.description).slice(0, 180) + '...',
          image: item.coverImage?.extraLarge || item.coverImage?.large,
          source: 'anilist',
          sourceId: String(item.id),
          sourceUrl: item.siteUrl,
          updatedAt: new Date().toISOString()
        });
      }
    }

    // 2. Fetch Manga
    const mangaRes = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: MANGA_QUERY,
        variables: { perPage: 4 }
      }),
      signal: AbortSignal.timeout(8000)
    });

    if (mangaRes.ok) {
      const data = await mangaRes.json();
      const mediaList: AniListMedia[] = data?.data?.Page?.media || [];

      for (const item of mediaList) {
        const titleName = item.title?.english || item.title?.romaji || 'Upcoming Manga';
        
        let dateStr = '';
        let daysRemaining = 40;

        if (item.startDate?.year) {
          const y = item.startDate.year;
          const m = String(item.startDate.month || 1).padStart(2, '0');
          const d = String(item.startDate.day || 1).padStart(2, '0');
          dateStr = `${y}-${m}-${d}`;
          const target = new Date(dateStr).getTime();
          daysRemaining = Math.max(0, Math.ceil((target - Date.now()) / (1000 * 60 * 60 * 24)));
        } else {
          const future = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
          dateStr = future.toISOString().split('T')[0];
          daysRemaining = 60;
        }

        drops.push({
          id: `anilist-manga-${item.id}`,
          name: titleName,
          category: 'Manga',
          date: dateStr,
          daysRemaining,
          status: item.startDate?.day ? 'Confirmed' : 'Tentative',
          platform: 'Weekly Shonen Jump / MangaDex',
          gradient: 'from-[#ec4899] via-[#8b5cf6] to-[#0b0d1a]',
          accent: '#ec4899',
          tagline: item.genres?.slice(0, 3).join(' • ') || 'Anticipated Serialization',
          description: stripHtml(item.description).slice(0, 180) + '...',
          image: item.coverImage?.extraLarge || item.coverImage?.large,
          source: 'anilist',
          sourceId: String(item.id),
          sourceUrl: item.siteUrl,
          updatedAt: new Date().toISOString()
        });
      }
    }
  } catch (err) {
    console.warn('[AniList Fetcher] Network or parsing notice:', (err as Error).message);
  }

  return drops;
}
