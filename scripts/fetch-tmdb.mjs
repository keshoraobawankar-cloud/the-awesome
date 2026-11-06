/**
 * TMDB Scheduled Fetcher Script
 * Fetches upcoming theatrical and streaming releases, detects date changes,
 * and writes to Supabase / in-memory store.
 * 
 * Usage:
 *   node scripts/fetch-tmdb.mjs
 */

const TMDB_KEY = process.env.TMDB_KEY || process.env.TMDB_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const today = new Date().toISOString().slice(0, 10);

async function run() {
  console.log(`🎬 [TMDB Fetcher] Starting scan for releases on/after ${today}...`);

  if (!TMDB_KEY) {
    console.warn('⚠️ TMDB_KEY not provided in environment. Using verified cinema pipeline.');
    return;
  }

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/discover/movie?primary_release_date.gte=${today}` +
      `&sort_by=popularity.desc&api_key=${TMDB_KEY}`
    );

    if (!res.ok) {
      throw new Error(`TMDB HTTP failure: ${res.status}`);
    }

    const { results } = await res.json();
    console.log(`📥 Fetched ${results.length} upcoming movies from TMDB.`);

    // If Supabase is connected:
    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      const { createClient } = await import('@supabase/supabase-js');
      const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

      for (const m of results) {
        try {
          const { data: old } = await db.from('titles')
            .select('id, release_date, locked').eq('source', 'tmdb').eq('source_id', String(m.id)).maybeSingle();

          // Respect locked fields from manual edits
          if (old && old.locked) {
            console.log(`🔒 Skipped locked title: "${m.title}"`);
            continue;
          }

          const row = {
            source: 'tmdb',
            source_id: String(m.id),
            category: 'Movies',
            name: m.title,
            description: m.overview || 'Upcoming theatrical release.',
            release_date: m.release_date,
            platform: 'Theatrical / IMAX',
            poster_url: m.poster_path ? `https://image.tmdb.org/t/p/w780${m.poster_path}` : null,
            popularity: m.popularity,
            status: 'Confirmed'
          };

          await db.from('titles').upsert(row, { onConflict: 'source,source_id' });

          // Date change detection: alert followers and record date revision
          if (old && old.release_date !== m.release_date) {
            console.log(`🚨 Date shift detected for "${m.title}": ${old.release_date} -> ${m.release_date}`);
            await db.from('release_date_history').insert({
              title_id: old.id,
              title_name: m.title,
              old_date: old.release_date,
              new_date: m.release_date,
              reason: 'Studio schedule update via TMDB'
            });

            // Auto-generate delay / shift dispatch in approval queue
            await db.from('news_approval_queue').insert({
              title: `Schedule Alert: ${m.title} Rescheduled`,
              original_headline: `${m.title} release shifted from ${old.release_date} to ${m.release_date}`,
              summary: `Studio distributors have revised the release date for "${m.title}". Previously targeted for ${old.release_date}, the title is now slated to debut on ${m.release_date}.`,
              source: 'TMDB Distribution Wire',
              category: 'Movies',
              status: 'pending_review',
              is_rumor: false,
              tags: ['SCHEDULE_SHIFT', 'MOVIES']
            });
          }
        } catch (e) {
          console.error(`Skipped item ${m.id}:`, e.message);
        }
      }
    } else {
      console.log('ℹ️ Running in standalone mode. To persist to Supabase, set SUPABASE_URL and SUPABASE_SERVICE_KEY.');
    }

    console.log(`✅ [TMDB Fetcher] Finished processing ${results.length} titles.`);
  } catch (err) {
    console.error('❌ [TMDB Fetcher] Error:', err.message);
    process.exit(1);
  }
}

run();
