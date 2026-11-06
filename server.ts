import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { runFullSync, startScheduledSyncEngine } from './server/syncEngine';
import { DropTitle } from './server/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // -------------------------------------------------------------
  // API Endpoints
  // -------------------------------------------------------------

  // 1. Get all drops
  app.get('/api/drops', (req, res) => {
    const category = req.query.category as string | undefined;
    let drops = db.getDrops();

    if (category && category !== 'All') {
      drops = drops.filter(d => d.category.toLowerCase() === category.toLowerCase());
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
    const { name, category, date, platform, description, tagline, status, lockField } = req.body;

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
      locked: lockField !== false, // Locked by default so auto-fetchers won't clobber it
      updatedAt: new Date().toISOString()
    };

    db.upsertDrop(newDrop, false);
    db.addLog('info', `Added manual release: "${name}" (${category}) [Locked: ${newDrop.locked}]`);

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

    res.json({ success: true, drop: db.getDropById(id) });
  });

  // 8. Toggle lock status
  app.post('/api/drops/:id/lock', (req, res) => {
    const { id } = req.params;
    const isLocked = db.toggleDropLock(id);
    res.json({ success: true, locked: isLocked, drop: db.getDropById(id) });
  });

  // 9. Update release date (triggers date change detection & delay dispatch draft)
  app.patch('/api/drops/:id/date', (req, res) => {
    const { id } = req.params;
    const { date, reason } = req.body;

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

    res.json({ success: true, updated, drop: db.getDropById(id) });
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
    res.json({ success: true, news: db.getNews() });
  });

  app.post('/api/news/:id/reject', (req, res) => {
    const { id } = req.params;
    const rejected = db.rejectNewsItem(id);
    if (!rejected) {
      return res.status(404).json({ error: 'Queue item not found.' });
    }
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
    res.json({
      success: true,
      allUpdates: db.getUserUpdates()
    });
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
    console.log(`\n🚀 DropRadar Live Server active at http://0.0.0.0:${PORT}`);
    console.log(`📡 Auto-update scheduler: Active (AniList, OpenLibrary, TMDB, RSS)\n`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
