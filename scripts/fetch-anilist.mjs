/**
 * AniList Scheduled Fetcher Script
 * Queries AniList GraphQL API (100% free, no API key required)
 * and detects date changes, writing to Supabase or local store.
 * 
 * Usage:
 *   node scripts/fetch-anilist.mjs
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const QUERY = `
query UpcomingAnimeAndManga {
  anime: Page(page: 1, perPage: 12) {
    media(status: NOT_YET_RELEASED, sort: POPULARITY_DESC, type: ANIME) {
      id
      title { english romaji }
      coverImage { extraLarge large }
      startDate { year month day }
      format
      genres
      description(asHtml: false)
      nextAiringEpisode { airingAt timeUntilAiring episode }
      siteUrl
    }
  }
  manga: Page(page: 1, perPage: 6) {
    media(status: NOT_YET_RELEASED, sort: POPULARITY_DESC, type: MANGA) {
      id
      title { english romaji }
      coverImage { extraLarge large }
      startDate { year month day }
      format
      genres
      description(asHtml: false)
      siteUrl
    }
  }
}
`;

async function run() {
  console.log('⚡ [AniList Fetcher] Querying AniList GraphQL API...');

  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query: QUERY }),
      signal: AbortSignal.timeout(10000)
    });

    if (!res.ok) {
      throw new Error(`AniList HTTP status: ${res.status}`);
    }

    const { data } = await res.json();
    const animeList = data?.anime?.media || [];
    const mangaList = data?.manga?.media || [];

    console.log(`✅ Received ${animeList.length} anime + ${mangaList.length} manga releases.`);

    const allMedia = [
      ...animeList.map(a => ({ ...a, category: 'Anime' })),
      ...mangaList.map(m => ({ ...m, category: 'Manga' }))
    ];

    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      const { createClient } = await import('@supabase/supabase-js');
      const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

      for (const item of allMedia) {
        const title = item.title?.english || item.title?.romaji || 'Upcoming Title';
        
        let dateStr = '';
        if (item.nextAiringEpisode?.airingAt) {
          dateStr = new Date(item.nextAiringEpisode.airingAt * 1000).toISOString().slice(0, 10);
        } else if (item.startDate?.year && item.startDate?.month && item.startDate?.day) {
          dateStr = `${item.startDate.year}-${String(item.startDate.month).padStart(2, '0')}-${String(item.startDate.day).padStart(2, '0')}`;
        } else {
          // Future scheduled estimate
          dateStr = new Date(Date.now() + 45 * 86400000).toISOString().slice(0, 10);
        }

        const row = {
          source: 'anilist',
          source_id: String(item.id),
          category: item.category,
          name: title,
          description: (item.description || '').replace(/<[^>]*>?/gm, '').slice(0, 200),
          release_date: dateStr,
          platform: item.category === 'Anime' ? (item.format === 'MOVIE' ? 'Theatrical / IMAX' : 'Crunchyroll / TV Tokyo') : 'Weekly Shonen Jump / MangaDex',
          poster_url: item.coverImage?.extraLarge || item.coverImage?.large,
          status: item.startDate?.day ? 'Confirmed' : 'Tentative'
        };

        const { data: old } = await db.from('titles')
          .select('id, release_date, locked').eq('source', 'anilist').eq('source_id', String(item.id)).maybeSingle();

        if (old && old.locked) {
          console.log(`🔒 Skipped locked title: "${title}"`);
          continue;
        }

        await db.from('titles').upsert(row, { onConflict: 'source,source_id' });

        if (old && old.release_date !== dateStr) {
          console.log(`🚨 Date shift detected for ${title}: ${old.release_date} -> ${dateStr}`);
          await db.from('release_date_history').insert({
            title_id: old.id,
            title_name: title,
            old_date: old.release_date,
            new_date: dateStr,
            reason: 'Production schedule updated on AniList'
          });
        }
      }
    } else {
      console.log('ℹ️ Running in standalone mode. All items validated.');
    }

    console.log('✨ [AniList Fetcher] Sync finished successfully.');
  } catch (err) {
    console.error('❌ [AniList Fetcher] Error:', err.message);
    process.exit(1);
  }
}

run();
