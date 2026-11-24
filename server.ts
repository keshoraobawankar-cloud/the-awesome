import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { runFullSync, startScheduledSyncEngine, restartScheduledSyncEngine } from './server/syncEngine';
import { DropTitle } from './server/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseOfficialTrailerUrl(rawUrl?: string): {
  trailerUrl?: string;
  trailerEmbedUrl?: string;
  trailerSource?: string;
} {
  if (!rawUrl || typeof rawUrl !== 'string') return {};
  const trimmed = rawUrl.trim();
  if (!trimmed) return {};

  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  if (ytMatch?.[1]) {
    const id = ytMatch[1];
    return {
      trailerUrl: `https://www.youtube.com/watch?v=${id}`,
      trailerEmbedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`,
      trailerSource: 'Official YouTube Channel'
    };
  }

  const dmMatch = trimmed.match(/dailymotion\.com\/(?:video|embed\/video)\/([A-Za-z0-9]+)/);
  if (dmMatch?.[1]) {
    return {
      trailerUrl: `https://www.dailymotion.com/video/${dmMatch[1]}`,
      trailerEmbedUrl: `https://www.dailymotion.com/embed/video/${dmMatch[1]}?autoplay=1`,
      trailerSource: 'Official Dailymotion Channel'
    };
  }

  return {
    trailerUrl: trimmed,
    trailerSource: 'Official Source Link'
  };
}

function escapeXml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildSharePreviewSvg(drop: DropTitle): string {
  const isBollywood = drop.industry === 'Bollywood';
  const accent = isBollywood ? '#f59e0b' : '#22d3ee';
  const secondary = isBollywood ? '#ff3d71' : '#8b5cf6';
  const industryLabel = (drop.industry || drop.category || 'Cinema').toUpperCase();
  const titleLines = drop.name.length > 34
    ? [drop.name.slice(0, 34), drop.name.slice(34, 68)]
    : [drop.name];
  const tagline = (drop.tagline || '').slice(0, 88);
  const sourceLabel = (drop.trustedSourceLabel || 'AheadOfYou Verified Cinema').slice(0, 48);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b0d1a"/>
      <stop offset="55%" stop-color="#121528"/>
      <stop offset="100%" stop-color="#070812"/>
    </linearGradient>
    <linearGradient id="accentBar" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${accent}"/>
      <stop offset="100%" stop-color="${secondary}"/>
    </linearGradient>
    <radialGradient id="glow1" cx="20%" cy="20%" r="55%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.26"/>
      <stop offset="100%" stop-color="#0b0d1a" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="85%" cy="80%" r="55%">
      <stop offset="0%" stop-color="${secondary}" stop-opacity="0.24"/>
      <stop offset="100%" stop-color="#0b0d1a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow1)"/>
  <rect width="1200" height="630" fill="url(#glow2)"/>
  <rect x="36" y="36" width="1128" height="558" rx="28" fill="#121528" fill-opacity="0.88" stroke="#2b3052" stroke-width="2"/>
  <rect x="36" y="36" width="1128" height="8" rx="4" fill="url(#accentBar)"/>

  <!-- Brand -->
  <text x="80" y="106" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="900" letter-spacing="4" fill="#ffffff">AHEAD<tspan fill="#22d3ee">OFYOU</tspan></text>

  <!-- Industry Badge -->
  <rect x="80" y="136" width="180" height="38" rx="19" fill="${accent}" fill-opacity="0.18" stroke="${accent}" stroke-width="1.5"/>
  <text x="170" y="161" text-anchor="middle" font-family="monospace" font-size="16" font-weight="700" fill="${accent}">${escapeXml(industryLabel)}</text>

  <!-- Status Badge -->
  <rect x="276" y="136" width="160" height="38" rx="19" fill="#10b981" fill-opacity="0.16" stroke="#10b981" stroke-width="1.5"/>
  <text x="356" y="161" text-anchor="middle" font-family="monospace" font-size="16" font-weight="700" fill="#6ee7b7">${escapeXml(drop.status.toUpperCase())}</text>

  <!-- Countdown Pill -->
  <rect x="920" y="84" width="196" height="86" rx="20" fill="#ff3d71" fill-opacity="0.16" stroke="#ff3d71" stroke-width="2"/>
  <text x="1018" y="124" text-anchor="middle" font-family="monospace" font-size="14" font-weight="700" fill="#fda4af">COUNTDOWN</text>
  <text x="1018" y="156" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="900" fill="#ffffff">T-${drop.daysRemaining}D</text>

  <!-- Title -->
  <text x="80" y="256" font-family="Arial, Helvetica, sans-serif" font-size="56" font-weight="900" fill="#ffffff">${escapeXml(titleLines[0])}</text>
  ${titleLines[1] ? `<text x="80" y="322" font-family="Arial, Helvetica, sans-serif" font-size="56" font-weight="900" fill="#ffffff">${escapeXml(titleLines[1])}</text>` : ''}

  <!-- Tagline -->
  <text x="80" y="${titleLines[1] ? 380 : 326}" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="#cbd5e1">${escapeXml(tagline)}</text>

  <!-- Divider -->
  <line x1="80" y1="450" x2="1120" y2="450" stroke="#252846" stroke-width="2"/>

  <!-- Footer Metadata -->
  <text x="80" y="498" font-family="monospace" font-size="15" font-weight="700" fill="#94a3b8">RELEASE DATE</text>
  <text x="80" y="534" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="800" fill="${accent}">${escapeXml(drop.date)}</text>

  <text x="360" y="498" font-family="monospace" font-size="15" font-weight="700" fill="#94a3b8">PLATFORM / STUDIO</text>
  <text x="360" y="534" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700" fill="#ffffff">${escapeXml((drop.platform || '').slice(0, 30))}</text>

  <text x="820" y="498" font-family="monospace" font-size="15" font-weight="700" fill="#94a3b8">VERIFIED SOURCE</text>
  <text x="820" y="534" font-family="monospace" font-size="19" font-weight="700" fill="#34d399">${escapeXml(sourceLabel)}</text>
</svg>`;
}

const ALLOWED_IMAGE_PROXY_HOSTS = new Set([
  'upload.wikimedia.org',
  'image.tmdb.org',
  'images.unsplash.com',
  's4.anilist.co',
  'covers.openlibrary.org'
]);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '4mb' }));

  // -------------------------------------------------------------
  // API Endpoints
  // -------------------------------------------------------------

  // 1. Get all drops
  app.get('/api/drops', (req, res) => {
    const category = req.query.category as string | undefined;
    const industry = req.query.industry as string | undefined;
    let drops = db.getDrops();

    if (category && category !== 'All') {
      drops = drops.filter(d => d.category.toLowerCase() === category.toLowerCase());
    }
    if (industry && industry !== 'All') {
      drops = drops.filter(d => d.industry?.toLowerCase() === industry.toLowerCase());
    }

    res.json({
      drops,
      total: drops.length,
      hero: db.getHeroDrop()
    });
  });

  // 2. Get hero drop
  app.get('/api/hero', (_req, res) => {
    res.json(db.getHeroDrop());
  });

  // 3. Get news cards
  app.get('/api/news', (_req, res) => {
    res.json({
      news: db.getNews()
    });
  });

  // 4. Get sync telemetry & source status
  app.get('/api/sync/status', (_req, res) => {
    res.json(db.getSyncStatus());
  });

  // 4b. Real-time Server-Sent Events stream for instant auto-updates
  app.get('/api/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const initialPayload = JSON.stringify({
      type: 'connected',
      version: db.getDataVersion(),
      timestamp: new Date().toISOString()
    });
    res.write(`data: ${initialPayload}\n\n`);

    const unsubscribe = db.subscribe((event) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    });

    const keepAlive = setInterval(() => {
      res.write(': keepalive\n\n');
    }, 25000);

    req.on('close', () => {
      clearInterval(keepAlive);
      unsubscribe();
    });
  });

  // 4c. Update auto-sync scheduler configuration
  app.post('/api/sync/config', (req, res) => {
    const { autoSyncEnabled, syncIntervalMinutes } = req.body || {};
    db.setSyncConfig(autoSyncEnabled, syncIntervalMinutes);
    restartScheduledSyncEngine();
    res.json({
      success: true,
      status: db.getSyncStatus()
    });
  });

  // 5. Trigger manual sync
  app.post('/api/sync/trigger', async (_req, res) => {
    try {
      const result = await runFullSync(true);
      res.json({
        success: result.success,
        result,
        status: db.getSyncStatus()
      });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // 6. Manual drop entry (Indie / regional / editorial release)
  app.post('/api/drops', (req, res) => {
    const { name, category, date, platform, description, tagline, status, lockField, trailerUrl } = req.body;

    if (!name || !category || !date) {
      return res.status(400).json({ error: 'Name, category, and date are required.' });
    }

    const id = `manual-${Date.now()}`;
    const target = new Date(date).getTime();
    const daysRemaining = isNaN(target) ? 30 : Math.max(0, Math.ceil((target - Date.now()) / (1000 * 60 * 60 * 24)));

    const categoryGradients: Record<string, { gradient: string; accent: string }> = {
      Movies: { gradient: 'from-[#22d3ee] via-[#8b5cf6] to-[#0b0d1a]', accent: '#22d3ee' },
      Anime: { gradient: 'from-[#8b5cf6] via-[#22d3ee] to-[#0b0d1a]', accent: '#8b5cf6' },
      Games: { gradient: 'from-[#ff3d71] via-[#8b5cf6] to-[#0b0d1a]', accent: '#ff3d71' },
      Dramas: { gradient: 'from-[#ec4899] via-[#8b5cf6] to-[#0b0d1a]', accent: '#ec4899' },
      Books: { gradient: 'from-[#f59e0b] via-[#ea580c] to-[#0b0d1a]', accent: '#f59e0b' },
      Manga: { gradient: 'from-[#10b981] via-[#059669] to-[#0b0d1a]', accent: '#10b981' }
    };

    const styling = categoryGradients[category] || categoryGradients.Movies;
    const parsedTrailer = parseOfficialTrailerUrl(trailerUrl);

    const newDrop: DropTitle = {
      id,
      name,
      category,
      date,
      daysRemaining,
      status: status || 'Confirmed',
      platform: platform || 'Direct Digital / Physical',
      gradient: styling.gradient,
      accent: styling.accent,
      tagline: tagline || 'Indie / Editorial Verified Release',
      description: description || 'Manually cataloged release entry.',
      source: 'manual',
      trailerUrl: parsedTrailer.trailerUrl,
      trailerEmbedUrl: parsedTrailer.trailerEmbedUrl,
      trailerSource: parsedTrailer.trailerSource,
      locked: lockField !== false, // Locked by default so auto-fetchers won't clobber it
      updatedAt: new Date().toISOString()
    };

    db.upsertDrop(newDrop, false);
    db.addLog('info', `Added manual release: "${name}" (${category}) [Locked: ${newDrop.locked}]`);
    db.notifyChange('drop_added');

    res.status(201).json({
      success: true,
      drop: newDrop,
      allDrops: db.getDrops()
    });
  });

  // 7. Update status (Confirmed / Tentative / Delayed)
  app.patch('/api/drops/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Confirmed', 'Tentative', 'Delayed'].includes(status)) {
      return res.status(400).json({ error: 'Status must be Confirmed, Tentative, or Delayed.' });
    }

    const updated = db.setDropStatus(id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Drop not found.' });
    }

    db.notifyChange('drop_status_updated');
    res.json({ success: true, drop: db.getDropById(id) });
  });

  // 8. Toggle lock status
  app.post('/api/drops/:id/lock', (req, res) => {
    const { id } = req.params;
    const isLocked = db.toggleDropLock(id);
    db.notifyChange('drop_lock_toggled');
    res.json({ success: true, locked: isLocked, drop: db.getDropById(id) });
  });

  // 9. Update release date (triggers date change detection & delay dispatch draft)
  app.patch('/api/drops/:id/date', (req, res) => {
    const { id } = req.params;
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({ error: 'New date is required.' });
    }

    const drop = db.getDropById(id);
    if (!drop) {
      return res.status(404).json({ error: 'Drop not found.' });
    }

    const updated = db.upsertDrop({
      ...drop,
      date,
      locked: true // Manual date shift locks the title
    }, false);
    db.notifyChange('drop_date_updated');

    res.json({ success: true, updated, drop: db.getDropById(id) });
  });

  // 9b. Fetch or resolve official trailer from AniList / TMDB
  app.get('/api/drops/:id/trailer', async (req, res) => {
    const { id } = req.params;
    const drop = db.getDropById(id);
    if (!drop) {
      return res.status(404).json({ error: 'Drop not found.' });
    }

    if (drop.trailerEmbedUrl || drop.trailerUrl) {
      return res.json({
        success: true,
        trailerUrl: drop.trailerUrl,
        trailerEmbedUrl: drop.trailerEmbedUrl,
        trailerSource: drop.trailerSource || 'Official Channel'
      });
    }

    // Try live lookup from AniList GraphQL if Anime/Manga
    if (drop.category === 'Anime' || drop.category === 'Manga') {
      try {
        const aniRes = await fetch('https://graphql.anilist.co', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            query: `query ($search: String) { Media(search: $search, type: ANIME) { trailer { id site } siteUrl } }`,
            variables: { search: drop.name }
          }),
          signal: AbortSignal.timeout(6000)
        });
        if (aniRes.ok) {
          const json = await aniRes.json();
          const trailer = json?.data?.Media?.trailer;
          if (trailer?.id && trailer?.site === 'youtube') {
            const trailerUrl = `https://www.youtube.com/watch?v=${trailer.id}`;
            const trailerEmbedUrl = `https://www.youtube-nocookie.com/embed/${trailer.id}?autoplay=1&rel=0`;
            const trailerSource = 'AniList Official Trailer';
            db.upsertDrop({ ...drop, trailerUrl, trailerEmbedUrl, trailerSource }, false);
            db.notifyChange('drop_trailer_updated');
            return res.json({ success: true, trailerUrl, trailerEmbedUrl, trailerSource });
          }
        }
      } catch {
        // ignore lookup failure
      }
    }

    // Try live lookup from TMDB if API key is set and Movies/Dramas
    const tmdbKey = process.env.TMDB_API_KEY || process.env.TMDB_KEY;
    if (tmdbKey && (drop.category === 'Movies' || drop.category === 'Dramas')) {
      try {
        const searchRes = await fetch(
          `https://api.themoviedb.org/3/search/multi?api_key=${tmdbKey}&query=${encodeURIComponent(drop.name)}`,
          { signal: AbortSignal.timeout(6000) }
        );
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          const first = searchData?.results?.[0];
          if (first?.id) {
            const mediaType = first.media_type === 'tv' ? 'tv' : 'movie';
            const vidRes = await fetch(
              `https://api.themoviedb.org/3/${mediaType}/${first.id}/videos?api_key=${tmdbKey}&language=en-US`,
              { signal: AbortSignal.timeout(6000) }
            );
            if (vidRes.ok) {
              const vidData = await vidRes.json();
              const videos: Array<{ site?: string; type?: string; official?: boolean; key?: string }> =
                vidData?.results || [];
              const match =
                videos.find((v) => v.site === 'YouTube' && v.official && v.type === 'Trailer' && v.key) ||
                videos.find((v) => v.site === 'YouTube' && v.key);
              if (match?.key) {
                const trailerUrl = `https://www.youtube.com/watch?v=${match.key}`;
                const trailerEmbedUrl = `https://www.youtube-nocookie.com/embed/${match.key}?autoplay=1&rel=0`;
                const trailerSource = `TMDB Official ${match.type || 'Trailer'}`;
                db.upsertDrop({ ...drop, trailerUrl, trailerEmbedUrl, trailerSource }, false);
                db.notifyChange('drop_trailer_updated');
                return res.json({ success: true, trailerUrl, trailerEmbedUrl, trailerSource });
              }
            }
          }
        }
      } catch {
        // ignore lookup failure
      }
    }

    // Try live lookup from Wikidata P1651 (YouTube trailer ID) for Movies/Dramas
    if (drop.category === 'Movies' || drop.category === 'Dramas') {
      try {
        const escapedName = drop.name.replace(/"/g, '\\"');
        const sparql = `SELECT ?yt WHERE { ?film wdt:P31 wd:Q11424; rdfs:label "${escapedName}"@en; wdt:P1651 ?yt. } LIMIT 1`;
        const wdRes = await fetch(
          `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(sparql)}`,
          { headers: { 'User-Agent': 'AheadOfYouRadar/1.0', Accept: 'application/sparql-results+json' }, signal: AbortSignal.timeout(5000) }
        );
        if (wdRes.ok) {
          const wdData = await wdRes.json();
          const ytId = wdData?.results?.bindings?.[0]?.yt?.value?.trim();
          if (ytId && /^[A-Za-z0-9_-]{11}$/.test(ytId)) {
            const trailerUrl = `https://www.youtube.com/watch?v=${ytId}`;
            const trailerEmbedUrl = `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0`;
            const trailerSource = 'Wikidata Official Trailer';
            db.upsertDrop({ ...drop, trailerUrl, trailerEmbedUrl, trailerSource }, false);
            db.notifyChange('drop_trailer_updated');
            return res.json({ success: true, trailerUrl, trailerEmbedUrl, trailerSource });
          }
        }
      } catch {
        // ignore Wikidata lookup failure
      }
    }

    return res.json({
      success: false,
      trailerUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(drop.name + ' official trailer')}`,
      trailerSource: 'Official YouTube Search'
    });
  });

  // 9c. Attach/update official trailer URL manually
  app.patch('/api/drops/:id/trailer', (req, res) => {
    const { id } = req.params;
    const { trailerUrl, trailerSource } = req.body || {};
    const drop = db.getDropById(id);
    if (!drop) {
      return res.status(404).json({ error: 'Drop not found.' });
    }
    const parsed = parseOfficialTrailerUrl(trailerUrl);
    if (!parsed.trailerUrl) {
      return res.status(400).json({ error: 'Valid official trailer URL is required.' });
    }
    db.upsertDrop(
      {
        ...drop,
        trailerUrl: parsed.trailerUrl,
        trailerEmbedUrl: parsed.trailerEmbedUrl,
        trailerSource: trailerSource || parsed.trailerSource
      },
      false
    );
    db.notifyChange('drop_trailer_updated');
    res.json({ success: true, drop: db.getDropById(id) });
  });

  // 10. News Approval Queue (Drafts -> Editorial Review -> Published)
  app.get('/api/news/queue', (_req, res) => {
    res.json({
      queue: db.getNewsApprovalQueue()
    });
  });

  app.post('/api/news/:id/approve', (req, res) => {
    const { id } = req.params;
    const approved = db.approveNewsItem(id);
    if (!approved) {
      return res.status(404).json({ error: 'Queue item not found.' });
    }
    db.notifyChange('news_approved');
    res.json({ success: true, news: db.getNews() });
  });

  app.post('/api/news/:id/reject', (req, res) => {
    const { id } = req.params;
    const rejected = db.rejectNewsItem(id);
    if (!rejected) {
      return res.status(404).json({ error: 'Queue item not found.' });
    }
    db.notifyChange('news_rejected');
    res.json({ success: true });
  });

  // 11. Release Date Shift History
  app.get('/api/date-history', (_req, res) => {
    res.json({
      history: db.getDateHistory()
    });
  });

  // 12. Google Sheets / CSV Import
  app.post('/api/sheets/import', (req, res) => {
    const { csvText } = req.body;
    if (!csvText || typeof csvText !== 'string') {
      return res.status(400).json({ error: 'Valid CSV string is required.' });
    }

    const result = db.importFromSheetsCsv(csvText);
    db.notifyChange('sheets_imported');
    res.json({
      success: true,
      result,
      allDrops: db.getDrops(),
      status: db.getSyncStatus()
    });
  });

  // 13. Community User Updates & Tip Line ("user should give updates")
  app.get('/api/user-updates', (_req, res) => {
    res.json({
      success: true,
      updates: db.getUserUpdates()
    });
  });

  app.post('/api/user-updates', (req, res) => {
    const { 
      targetTitleId, targetTitleName, updateType, suggestedDate, 
      suggestedStatus, category, platform, details, sourceUrl, submittedBy 
    } = req.body;

    if (!targetTitleName || !details || !updateType || !category) {
      return res.status(400).json({ error: 'targetTitleName, category, updateType, and details are required.' });
    }

    const newUpdate = db.addUserUpdate({
      targetTitleId,
      targetTitleName,
      updateType,
      suggestedDate,
      suggestedStatus,
      category,
      platform,
      details,
      sourceUrl,
      submittedBy: submittedBy || 'Community Member'
    });
    db.notifyChange('user_update_added');

    res.status(201).json({
      success: true,
      update: newUpdate,
      allUpdates: db.getUserUpdates()
    });
  });

  app.post('/api/user-updates/:id/confirm', (req, res) => {
    const { id } = req.params;
    const result = db.confirmUserUpdate(id);
    if (!result.success) {
      return res.status(404).json({ error: 'Update not found.' });
    }
    db.notifyChange('user_update_confirmed');
    res.json({
      success: true,
      confirmationsCount: result.confirmationsCount,
      allUpdates: db.getUserUpdates()
    });
  });

  app.post('/api/user-updates/:id/apply', (req, res) => {
    const { id } = req.params;
    const result = db.applyUserUpdate(id);
    if (!result.success) {
      return res.status(404).json({ error: result.message });
    }
    db.notifyChange('user_update_applied');
    res.json({
      success: true,
      message: result.message,
      appliedTitle: result.appliedTitle,
      allDrops: db.getDrops(),
      allNews: db.getNews(),
      allUpdates: db.getUserUpdates()
    });
  });

  app.post('/api/user-updates/:id/reject', (req, res) => {
    const { id } = req.params;
    const ok = db.rejectUserUpdate(id);
    if (!ok) {
      return res.status(404).json({ error: 'Update not found.' });
    }
    db.notifyChange('user_update_rejected');
    res.json({
      success: true,
      allUpdates: db.getUserUpdates()
    });
  });

  // 14. Social Sharing, Image Proxy & Generated Preview Cards
  app.get('/api/image-proxy', async (req, res) => {
    const rawUrl = String(req.query.url || '');
    try {
      const parsed = new URL(rawUrl);
      if (parsed.protocol !== 'https:' || !ALLOWED_IMAGE_PROXY_HOSTS.has(parsed.hostname)) {
        return res.status(400).json({ error: 'Unsupported image host.' });
      }
      const imgRes = await fetch(parsed.toString(), {
        headers: { 'User-Agent': 'AheadOfYouRadar/1.0' },
        signal: AbortSignal.timeout(7000)
      });
      if (!imgRes.ok) {
        return res.status(502).json({ error: 'Upstream image unavailable.' });
      }
      const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
      if (!contentType.startsWith('image/')) {
        return res.status(400).json({ error: 'Invalid content type.' });
      }
      const buffer = Buffer.from(await imgRes.arrayBuffer());
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.send(buffer);
    } catch {
      res.status(400).json({ error: 'Failed to proxy image.' });
    }
  });

  app.post('/api/share/preview/:id', (req, res) => {
    const { id } = req.params;
    const { dataUrl } = req.body || {};
    if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/png;base64,')) {
      return res.status(400).json({ error: 'Valid PNG dataUrl is required.' });
    }
    const base64 = dataUrl.slice('data:image/png;base64,'.length);
    if (base64.length > 2_000_000) {
      return res.status(413).json({ error: 'Preview image too large.' });
    }
    db.saveSharePreviewPng(id, Buffer.from(base64, 'base64'));
    res.json({ success: true, pngUrl: `/api/share/preview/${encodeURIComponent(id)}.png` });
  });

  app.get('/api/share/preview/:id.png', (req, res) => {
    const { id } = req.params;
    const cached = db.getSharePreviewPng(id);
    if (cached) {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=1800');
      return res.send(cached);
    }
    const drop = db.getDrops().find((d) => d.id === id);
    if (!drop) {
      return res.status(404).send('Not found');
    }
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=600');
    return res.send(buildSharePreviewSvg(drop));
  });

  app.get('/api/share/preview/:id.svg', (req, res) => {
    const { id } = req.params;
    const drop = db.getDrops().find((d) => d.id === id);
    if (!drop) {
      return res.status(404).send('Not found');
    }
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=600');
    res.send(buildSharePreviewSvg(drop));
  });

  app.get('/share/movie/:id', (req, res) => {
    const { id } = req.params;
    const drop = db.getDrops().find((d) => d.id === id);
    const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
    const host = (req.headers['x-forwarded-host'] as string) || req.get('host') || 'localhost:3000';
    const origin = `${proto}://${host}`;
    const targetRedirect = `${origin}/?movie=${encodeURIComponent(id)}#cinema-hub`;

    if (!drop) {
      return res.redirect(302, `${origin}/#cinema-hub`);
    }

    const title = `${drop.name} (${drop.industry || drop.category}) — Releases ${drop.date} | AheadOfYou`;
    const description = `${drop.tagline || drop.description} Track live countdown (T-${drop.daysRemaining}D) and official trailers on AheadOfYou.`;
    const hasCachedPng = Boolean(db.getSharePreviewPng(id));
    const previewImageUrl = hasCachedPng
      ? `${origin}/api/share/preview/${encodeURIComponent(id)}.png`
      : `${origin}/api/share/preview/${encodeURIComponent(id)}.svg`;
    const shareUrl = `${origin}/share/movie/${encodeURIComponent(id)}`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeXml(title)}</title>
  <meta name="description" content="${escapeXml(description)}" />
  <meta property="og:type" content="video.movie" />
  <meta property="og:site_name" content="AheadOfYou" />
  <meta property="og:title" content="${escapeXml(title)}" />
  <meta property="og:description" content="${escapeXml(description)}" />
  <meta property="og:url" content="${escapeXml(shareUrl)}" />
  <meta property="og:image" content="${escapeXml(previewImageUrl)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeXml(title)}" />
  <meta name="twitter:description" content="${escapeXml(description)}" />
  <meta name="twitter:image" content="${escapeXml(previewImageUrl)}" />
  <meta http-equiv="refresh" content="0;url=${escapeXml(targetRedirect)}" />
</head>
<body style="background:#0b0d1a;color:#f8fafc;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
  <p>Opening <a href="${escapeXml(targetRedirect)}" style="color:#22d3ee">${escapeXml(drop.name)}</a> on AheadOfYou...</p>
</body>
</html>`);
  });

  // -------------------------------------------------------------
  // Frontend Serving (Dev vs Prod)
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  // Start Background Sync Schedule
  startScheduledSyncEngine();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 AheadOfYou Live Server active at http://0.0.0.0:${PORT}`);
    console.log(`📡 Auto-update scheduler: Active (AniList, OpenLibrary, TMDB, RSS)\n`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
