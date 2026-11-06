import { db } from './db';
import { fetchAniListReleases } from './fetchers/anilist';
import { fetchOpenLibraryReleases } from './fetchers/openLibrary';
import { fetchTMDBReleases } from './fetchers/tmdb';
import { fetchLiveNewsFeeds } from './fetchers/rssNews';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function runFullSync(isManual = false): Promise<{
  success: boolean;
  addedCount: number;
  updatedCount: number;
  skippedLockedCount: number;
  dateChangesCount: number;
  newsCount: number;
}> {
  const startTime = Date.now();
  db.setSyncState(true);
  db.addLog('info', `Starting ${isManual ? 'manual' : 'scheduled'} radar sync...`);

  let addedCount = 0;
  let updatedCount = 0;
  let skippedLockedCount = 0;
  let dateChangesCount = 0;

  try {
    // 1. Fetch AniList
    db.addLog('info', 'Querying AniList GraphQL API (Anime & Manga)...');
    const anilistDrops = await fetchAniListReleases();
    for (const drop of anilistDrops) {
      const res = db.upsertDrop(drop, true);
      if (res.status === 'added') addedCount++;
      if (res.status === 'updated') updatedCount++;
      if (res.status === 'skipped_locked') skippedLockedCount++;
      if (res.dateChanged) dateChangesCount++;
    }
    db.addLog('success', `AniList sync processed: ${anilistDrops.length} titles received.`);

    // 2. Fetch Open Library
    db.addLog('info', 'Querying Open Library API for literary releases...');
    const bookDrops = await fetchOpenLibraryReleases();
    for (const drop of bookDrops) {
      const res = db.upsertDrop(drop, true);
      if (res.status === 'added') addedCount++;
      if (res.status === 'updated') updatedCount++;
      if (res.status === 'skipped_locked') skippedLockedCount++;
      if (res.dateChanged) dateChangesCount++;
    }
    db.addLog('success', `Open Library sync processed: ${bookDrops.length} books received.`);

    // 3. Fetch TMDB
    db.addLog('info', 'Querying TMDB / Theatrical Cinema radar...');
    const tmdbDrops = await fetchTMDBReleases();
    for (const drop of tmdbDrops) {
      const res = db.upsertDrop(drop, true);
      if (res.status === 'added') addedCount++;
      if (res.status === 'updated') updatedCount++;
      if (res.status === 'skipped_locked') skippedLockedCount++;
      if (res.dateChanged) dateChangesCount++;
    }

    // 4. Fetch Live Entertainment News Wire
    db.addLog('info', 'Parsing live entertainment wire headlines...');
    const newsCards = await fetchLiveNewsFeeds();
    if (newsCards.length > 0) {
      db.setNews(newsCards);
    }
    db.addLog('success', `News wire refreshed: ${newsCards.length} dispatches available.`);

    const durationMs = Date.now() - startTime;
    db.addLog('success', `Radar sync completed in ${(durationMs / 1000).toFixed(2)}s: +${addedCount} added, ${updatedCount} refreshed, ${dateChangesCount} date shifts tracked.`);

    db.recordImportLog({
      id: `log-${Date.now()}`,
      runTime: new Date().toISOString(),
      durationMs,
      itemsAdded: addedCount,
      itemsUpdated: updatedCount,
      dateChangesDetected: dateChangesCount,
      errorsCount: 0,
      triggeredBy: isManual ? 'manual' : 'scheduler'
    });

    return {
      success: true,
      addedCount,
      updatedCount,
      skippedLockedCount,
      dateChangesCount,
      newsCount: newsCards.length
    };
  } catch (err) {
    const durationMs = Date.now() - startTime;
    db.addLog('error', `Sync failed: ${(err as Error).message}`);
    db.recordImportLog({
      id: `log-${Date.now()}`,
      runTime: new Date().toISOString(),
      durationMs,
      itemsAdded: addedCount,
      itemsUpdated: updatedCount,
      dateChangesDetected: dateChangesCount,
      errorsCount: 1,
      errorDetails: (err as Error).message,
      triggeredBy: isManual ? 'manual' : 'scheduler'
    });
    return {
      success: false,
      addedCount,
      updatedCount,
      skippedLockedCount,
      dateChangesCount,
      newsCount: 0
    };
  } finally {
    db.setSyncState(false);
  }
}

let syncInterval: NodeJS.Timeout | null = null;

export function startScheduledSyncEngine() {
  if (syncInterval) return;

  // Run initial sync after 2 seconds so server is fully booted
  setTimeout(() => {
    runFullSync(false).catch(err => {
      console.warn('[Sync Engine] Initial sync notice:', err.message);
    });
  }, 2000);

  // Set recurring interval: every 15 minutes
  syncInterval = setInterval(() => {
    runFullSync(false).catch(err => {
      console.warn('[Sync Engine] Scheduled sync notice:', err.message);
    });
  }, 15 * 60 * 1000);
}
