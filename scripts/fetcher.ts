/**
 * Standalone DropRadar Live Fetcher Script
 * 
 * Usage:
 *   npx tsx scripts/fetcher.ts
 * 
 * Can be run via GitHub Actions cron, Vercel cron, or locally.
 * Fetches data from AniList GraphQL (no key needed), Open Library,
 * TMDB (optional key), and entertainment RSS feeds.
 */

import { fetchAniListReleases } from '../server/fetchers/anilist';
import { fetchOpenLibraryReleases } from '../server/fetchers/openLibrary';
import { fetchTMDBReleases } from '../server/fetchers/tmdb';
import { fetchLiveNewsFeeds } from '../server/fetchers/rssNews';

async function main() {
  console.log('📡 [DropRadar Fetcher] Starting live sync run...');
  const startTime = Date.now();

  try {
    // 1. AniList (Anime & Manga)
    console.log('⚡ Querying AniList GraphQL API...');
    const animeAndManga = await fetchAniListReleases();
    console.log(`✅ AniList: Fetched ${animeAndManga.length} upcoming releases.`);

    // 2. Open Library (Books)
    console.log('⚡ Querying Open Library API...');
    const books = await fetchOpenLibraryReleases();
    console.log(`✅ Open Library: Fetched ${books.length} upcoming/trending books.`);

    // 3. TMDB (Movies & Dramas)
    console.log('⚡ Querying TMDB API...');
    const cinema = await fetchTMDBReleases();
    console.log(`✅ TMDB / Cinema: Loaded ${cinema.length} upcoming titles.`);

    // 4. Live News Feeds
    console.log('⚡ Fetching Entertainment News Wire...');
    const news = await fetchLiveNewsFeeds();
    console.log(`✅ News Wire: Retrieved ${news.length} articles.`);

    const totalTitles = animeAndManga.length + books.length + cinema.length;
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n=============================================');
    console.log(`✨ [DropRadar Fetcher] Sync Run Successful (${duration}s)`);
    console.log(`📦 Total Releases Tracked: ${totalTitles}`);
    console.log(`📰 Total News Dispatches: ${news.length}`);
    console.log('=============================================\n');

    // If writing to Supabase or Firebase, credentials would be called here:
    // e.g. await supabase.from('drops').upsert([...]);
  } catch (err) {
    console.error('❌ [DropRadar Fetcher] Failed with error:', err);
    process.exit(1);
  }
}

main();
