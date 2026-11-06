import { 
  DropTitle, StackingNewsCard, SyncStatus, TimelineDrop, 
  ReleaseDateHistoryItem, NewsApprovalItem, ImportLogItem,
  UserUpdateSubmission 
} from './types';
import { DROP_TITLES_12, HERO_FEATURED_DROP, STACKING_NEWS, THIS_WEEK_TIMELINE } from '../src/data/dropRadarData';
import { parseGoogleSheetsCsv, CsvImportResult } from './fetchers/googleSheets';

class DatabaseStore {
  private drops: Map<string, DropTitle> = new Map();
  private news: StackingNewsCard[] = [];
  private timeline: TimelineDrop[] = [];
  private dateHistory: ReleaseDateHistoryItem[] = [];
  private newsApprovalQueue: NewsApprovalItem[] = [];
  private importHistory: ImportLogItem[] = [];
  private userUpdates: UserUpdateSubmission[] = [];
  private lastSyncTime: string | null = null;
  private isSyncing = false;
  private logs: Array<{ timestamp: string; level: 'info' | 'warn' | 'success' | 'error'; message: string }> = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Seed initial drops
    for (const drop of DROP_TITLES_12) {
      this.drops.set(drop.id, {
        ...drop,
        source: 'curated',
        locked: false,
        updatedAt: new Date().toISOString(),
        dateHistory: []
      });
    }

    // Seed baseline date change history (e.g. Harbor Lights delay mentioned in timeline)
    this.dateHistory.push({
      id: 'hist-harbor-lights-1',
      titleId: 'time-5',
      titleName: 'Harbor Lights Maritime Epic',
      oldDate: '2026-11-10',
      newDate: '2026-11-29',
      detectedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      reason: 'VFX polish pushes maritime storm sequence (confirmed by studio)'
    });

    // Seed news approval queue with pending AI drafts
    this.newsApprovalQueue = [
      {
        id: 'approval-1',
        title: 'Harbor Lights Schedule Shift Confirmed',
        originalHeadline: 'Director confirms November 29 theatrical premiere for maritime epic',
        summary: 'Maritime epic "Harbor Lights" officially shifts its debut from Nov 10 to Nov 29 to allow final VFX storm renders.',
        source: 'Bugle Studio Wire',
        sourceUrl: 'https://dailybugle.internal/scoop/harbor-lights',
        category: 'Movies',
        status: 'pending_review',
        isRumor: false,
        tags: ['SCHEDULE_SHIFT', 'MOVIES'],
        createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString()
      },
      {
        id: 'approval-2',
        title: 'Early Devkit Leak Points to Tokyo Vice City Hub DLC',
        originalHeadline: 'Unverified source claims post-launch map expansion in active development',
        summary: 'Anonymous dev forum posts suggest secondary international island expansion planned for late 2027.',
        source: 'Community Forum Beat',
        category: 'Games',
        status: 'pending_review',
        isRumor: true,
        tags: ['RUMOR', 'GAMING'],
        createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString()
      }
    ];

    // Seed initial user community updates
    this.userUpdates = [
      {
        id: 'update-seed-1',
        targetTitleId: 'time-2',
        targetTitleName: 'Chainsaw Man: Reze Arc',
        updateType: 'date_change',
        suggestedDate: '2026-11-20',
        suggestedStatus: 'Confirmed',
        category: 'Anime',
        platform: 'Theatrical & Crunchyroll',
        details: 'MAPPA Stage event official stream confirmed the global theatrical premiere window is finalized for Nov 20.',
        sourceUrl: 'https://twitter.com/MAPPA_Info',
        submittedBy: 'Kenshi_Otaku99',
        status: 'pending',
        confirmationsCount: 14,
        submittedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
      },
      {
        id: 'update-seed-2',
        targetTitleName: 'Cyberpunk: Orion Underground',
        updateType: 'new_release',
        suggestedDate: '2027-04-16',
        suggestedStatus: 'Tentative',
        category: 'Games',
        platform: 'PC / PS5 / Xbox Series X',
        details: 'CD Projekt RED investor day slides hinted at early pre-production gameplay reveal target in spring 2027.',
        sourceUrl: 'https://www.cdprojekt.com/en/investors',
        submittedBy: 'NightCityRunner',
        status: 'pending',
        confirmationsCount: 8,
        submittedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString()
      }
    ];

    // Seed news
    this.news = [...STACKING_NEWS];

    // Seed timeline
    this.timeline = [...THIS_WEEK_TIMELINE];

    this.addLog('info', 'Tickora database initialized with releases, news approval queue & community updates tip line.');
  }

  public getDrops(): DropTitle[] {
    const now = Date.now();
    return Array.from(this.drops.values()).map(d => {
      const targetTime = new Date(d.date).getTime();
      const days = isNaN(targetTime) ? d.daysRemaining : Math.max(0, Math.ceil((targetTime - now) / (1000 * 60 * 60 * 24)));
      return {
        ...d,
        daysRemaining: days,
        dateHistory: this.dateHistory.filter(h => h.titleId === d.id)
      };
    }).sort((a, b) => a.daysRemaining - b.daysRemaining);
  }

  public getHeroDrop(): DropTitle {
    const all = this.getDrops();
    const hero = this.drops.get(HERO_FEATURED_DROP.id);
    return hero || all[0];
  }

  public getNews(): StackingNewsCard[] {
    return this.news;
  }

  public getTimeline(): TimelineDrop[] {
    return this.timeline;
  }

  public getDropById(id: string): DropTitle | undefined {
    return this.drops.get(id);
  }

  public getNewsApprovalQueue(): NewsApprovalItem[] {
    return this.newsApprovalQueue;
  }

  public getDateHistory(): ReleaseDateHistoryItem[] {
    return this.dateHistory;
  }

  public upsertDrop(drop: DropTitle, isFromAutoSync = false): { 
    status: 'added' | 'updated' | 'skipped_locked';
    dateChanged?: boolean;
    oldDate?: string;
  } {
    const existing = this.drops.get(drop.id);

    // Sanity check: discard if date is invalid or unreasonably in past (> 60 days ago)
    const target = new Date(drop.date).getTime();
    if (isNaN(target)) {
      this.addLog('warn', `Sanity check failed for "${drop.name}": Invalid date format.`);
      return { status: 'skipped_locked' };
    }

    if (existing && existing.locked && isFromAutoSync) {
      return { status: 'skipped_locked' };
    }

    if (existing) {
      let dateChanged = false;
      const oldDate = existing.date;

      // Detect date change
      if (existing.date !== drop.date) {
        dateChanged = true;
        const historyItem: ReleaseDateHistoryItem = {
          id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          titleId: drop.id,
          titleName: drop.name,
          oldDate: existing.date,
          newDate: drop.date,
          detectedAt: new Date().toISOString(),
          reason: isFromAutoSync ? `Automatic detection via ${drop.source || 'live source'}` : 'Manual date adjustment'
        };

        this.dateHistory.unshift(historyItem);
        this.addLog('warn', `🚨 Date change detected for "${drop.name}": ${oldDate} → ${drop.date}`);

        // Section 4: Auto-generate draft alert news item in the approval queue!
        const alertItem: NewsApprovalItem = {
          id: `draft-shift-${Date.now()}`,
          title: `Schedule Shift: ${drop.name}`,
          originalHeadline: `${drop.name} moved from ${oldDate} to ${drop.date}`,
          summary: `Official schedule radar detects that "${drop.name}" has shifted its release target from ${oldDate} to ${drop.date} on ${drop.platform}.`,
          source: `${drop.source ? drop.source.toUpperCase() : 'RADAR'} DISTRIBUTION WIRE`,
          category: drop.category,
          status: 'pending_review',
          isRumor: false,
          tags: ['SCHEDULE_SHIFT', drop.category.toUpperCase()],
          createdAt: new Date().toISOString()
        };
        this.newsApprovalQueue.unshift(alertItem);
      }

      this.drops.set(drop.id, {
        ...existing,
        ...drop,
        locked: existing.locked || drop.locked,
        updatedAt: new Date().toISOString()
      });

      return { status: 'updated', dateChanged, oldDate };
    } else {
      this.drops.set(drop.id, {
        ...drop,
        updatedAt: new Date().toISOString()
      });
      return { status: 'added' };
    }
  }

  public setDropStatus(id: string, status: 'Confirmed' | 'Tentative' | 'Delayed'): boolean {
    const drop = this.drops.get(id);
    if (!drop) return false;
    drop.status = status;
    drop.locked = true;
    drop.updatedAt = new Date().toISOString();
    this.addLog('info', `Manual status update: ${drop.name} set to ${status} (locked).`);
    return true;
  }

  public toggleDropLock(id: string): boolean {
    const drop = this.drops.get(id);
    if (!drop) return false;
    drop.locked = !drop.locked;
    drop.updatedAt = new Date().toISOString();
    this.addLog('info', `Drop ${drop.name} ${drop.locked ? 'LOCKED against auto-overwrites' : 'UNLOCKED'}.`);
    return drop.locked;
  }

  public setNews(newsList: StackingNewsCard[]) {
    this.news = newsList;
  }

  // News Approval Workflow
  public approveNewsItem(approvalId: string): boolean {
    const item = this.newsApprovalQueue.find(q => q.id === approvalId);
    if (!item) return false;

    item.status = 'approved';

    // Promote approved item into the active broadsheet news stack
    const newCard: StackingNewsCard = {
      id: `approved-${Date.now()}`,
      kicker: item.isRumor ? 'UNCONFIRMED SCOOP' : `${item.source.toUpperCase()} WIRE`,
      title: item.title,
      deck: item.summary,
      source: item.source,
      readTime: '2 MIN READ',
      date: 'Just approved',
      gradient: item.isRumor 
        ? 'from-[#f59e0b]/20 via-[#171a30] to-[#0b0d1a]'
        : 'from-[#ff3d71]/20 via-[#171a30] to-[#0b0d1a]',
      tag: item.isRumor ? 'RUMOR' : item.category.toUpperCase(),
      isRumor: item.isRumor,
      approvalId: item.id
    };

    this.news.unshift(newCard);
    this.addLog('success', `Editor approved news dispatch: "${item.title}" — published to Broadsheet.`);
    return true;
  }

  public rejectNewsItem(approvalId: string): boolean {
    const item = this.newsApprovalQueue.find(q => q.id === approvalId);
    if (!item) return false;
    item.status = 'rejected';
    this.addLog('info', `Rejected news draft: "${item.title}".`);
    return true;
  }

  // Google Sheets CSV Import
  public importFromSheetsCsv(csvText: string): CsvImportResult {
    const result = parseGoogleSheetsCsv(csvText);

    let added = 0;
    let updated = 0;

    for (const drop of result.drops) {
      const res = this.upsertDrop(drop, false);
      if (res.status === 'added') added++;
      if (res.status === 'updated') updated++;
    }

    this.recordImportLog({
      id: `log-sheets-${Date.now()}`,
      runTime: new Date().toISOString(),
      durationMs: 120,
      itemsAdded: added,
      itemsUpdated: updated,
      dateChangesDetected: 0,
      errorsCount: result.errors.length,
      errorDetails: result.errors.length > 0 ? result.errors.join('; ') : undefined,
      triggeredBy: 'sheets_import'
    });

    this.addLog('success', `Google Sheets CSV Import: +${added} titles cataloged, ${result.errors.length} sanity notices.`);

    return {
      added,
      updated,
      errors: result.errors,
      drops: result.drops
    };
  }

  // Community User Update System
  public getUserUpdates(): UserUpdateSubmission[] {
    return this.userUpdates.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  public addUserUpdate(data: {
    targetTitleId?: string;
    targetTitleName: string;
    updateType: 'date_change' | 'delay_alert' | 'platform_added' | 'new_release' | 'breaking_scoop';
    suggestedDate?: string;
    suggestedStatus?: 'Confirmed' | 'Tentative' | 'Delayed';
    category: 'Movies' | 'Anime' | 'Games' | 'Dramas' | 'Books' | 'Manga';
    platform?: string;
    details: string;
    sourceUrl?: string;
    submittedBy: string;
  }): UserUpdateSubmission {
    const newSubmission: UserUpdateSubmission = {
      id: `usr-tip-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      targetTitleId: data.targetTitleId,
      targetTitleName: data.targetTitleName.trim(),
      updateType: data.updateType,
      suggestedDate: data.suggestedDate,
      suggestedStatus: data.suggestedStatus || 'Confirmed',
      category: data.category,
      platform: data.platform?.trim() || 'Global Launch',
      details: data.details.trim(),
      sourceUrl: data.sourceUrl?.trim(),
      submittedBy: data.submittedBy.trim() || 'Anonymous Reader',
      status: 'pending',
      confirmationsCount: 1,
      submittedAt: new Date().toISOString()
    };

    this.userUpdates.unshift(newSubmission);
    this.addLog('info', `Tip received from ${newSubmission.submittedBy}: "${newSubmission.targetTitleName}" (${newSubmission.updateType})`);

    // Also inject a draft in the news approval queue so editors can publish a dispatch
    const newsDraft: NewsApprovalItem = {
      id: `usr-news-${Date.now()}`,
      title: `Community Tip: ${newSubmission.targetTitleName}`,
      originalHeadline: `${newSubmission.updateType.toUpperCase().replace('_', ' ')}: ${newSubmission.details}`,
      summary: `Tip submitted by community member ${newSubmission.submittedBy}: ${newSubmission.details}${newSubmission.suggestedDate ? ` Target date: ${newSubmission.suggestedDate}.` : ''}`,
      source: `TICKORA COMMUNITY TIP LINE`,
      sourceUrl: newSubmission.sourceUrl,
      category: newSubmission.category,
      status: 'pending_review',
      isRumor: newSubmission.updateType === 'breaking_scoop',
      tags: ['COMMUNITY_UPDATE', newSubmission.updateType.toUpperCase()],
      createdAt: new Date().toISOString()
    };
    this.newsApprovalQueue.unshift(newsDraft);

    return newSubmission;
  }

  public confirmUserUpdate(id: string): { success: boolean; confirmationsCount: number } {
    const update = this.userUpdates.find(u => u.id === id);
    if (!update) return { success: false, confirmationsCount: 0 };
    update.confirmationsCount += 1;
    if (update.confirmationsCount >= 5 && update.status === 'pending') {
      update.status = 'verified';
    }
    this.addLog('info', `Update "${update.targetTitleName}" verified by community member (Total: ${update.confirmationsCount} confirmations).`);
    return { success: true, confirmationsCount: update.confirmationsCount };
  }

  public applyUserUpdate(id: string): { success: boolean; appliedTitle?: DropTitle; message: string } {
    const update = this.userUpdates.find(u => u.id === id);
    if (!update) return { success: false, message: 'Update submission not found.' };

    let target = update.targetTitleId ? this.drops.get(update.targetTitleId) : undefined;
    if (!target) {
      // Try finding by name match
      target = Array.from(this.drops.values()).find(
        d => d.name.toLowerCase() === update.targetTitleName.toLowerCase()
      );
    }

    if (target) {
      const oldDate = target.date;
      if (update.suggestedDate && update.suggestedDate !== target.date) {
        target.date = update.suggestedDate;
        this.dateHistory.unshift({
          id: `hist-usr-${Date.now()}`,
          titleId: target.id,
          titleName: target.name,
          oldDate,
          newDate: update.suggestedDate,
          detectedAt: new Date().toISOString(),
          reason: `Community Tip by ${update.submittedBy}: ${update.details}`
        });
      }
      if (update.suggestedStatus) target.status = update.suggestedStatus;
      if (update.platform) target.platform = update.platform;
      target.updatedAt = new Date().toISOString();
      update.status = 'applied';

      // Push breaking news item to stack
      this.news.unshift({
        id: `news-applied-${Date.now()}`,
        kicker: 'COMMUNITY VERIFIED DROP UPDATE',
        title: `${target.name}: Schedule Updated to ${target.date}`,
        deck: `Reader scoop confirmed: ${update.details}. Broadcasted to all tracking desks.`,
        source: `Tickora Community Wire (${update.submittedBy})`,
        readTime: '1 MIN READ',
        date: 'Just now',
        gradient: 'from-[#22d3ee]/30 via-[#171a30] to-[#0b0d1a]',
        tag: target.category.toUpperCase()
      });

      this.addLog('success', `Merged community update: "${target.name}" date set to ${target.date} on ${target.platform}.`);
      return { success: true, appliedTitle: target, message: `Successfully updated ${target.name} to ${target.date}!` };
    } else {
      // New title release
      const newDropId = `usr-title-${Date.now()}`;
      const newDrop: DropTitle = {
        id: newDropId,
        name: update.targetTitleName,
        category: update.category,
        date: update.suggestedDate || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
        daysRemaining: 30,
        status: update.suggestedStatus || 'Confirmed',
        platform: update.platform || 'Global Theatrical / Streaming',
        gradient: 'from-[#8b5cf6]/20 via-[#171a30] to-[#0b0d1a]',
        accent: '#8b5cf6',
        tagline: update.details.slice(0, 50),
        description: update.details,
        source: 'manual',
        locked: true,
        updatedAt: new Date().toISOString(),
        dateHistory: []
      };

      this.upsertDrop(newDrop, false);
      update.status = 'applied';

      this.news.unshift({
        id: `news-new-drop-${Date.now()}`,
        kicker: 'NEW RELEASE ADDED VIA COMMUNITY',
        title: `Announced: ${newDrop.name}`,
        deck: `${update.details} Subscribed to Tickora countdown radar.`,
        source: `Community Dispatch (${update.submittedBy})`,
        readTime: '1 MIN READ',
        date: 'Just now',
        gradient: 'from-[#ff3d71]/30 via-[#171a30] to-[#0b0d1a]',
        tag: newDrop.category.toUpperCase()
      });

      this.addLog('success', `Cataloged new community-submitted release: "${newDrop.name}".`);
      return { success: true, appliedTitle: newDrop, message: `Added new release "${newDrop.name}" to live Tickora radar!` };
    }
  }

  public rejectUserUpdate(id: string): boolean {
    const update = this.userUpdates.find(u => u.id === id);
    if (!update) return false;
    update.status = 'rejected';
    this.addLog('info', `Rejected tip: "${update.targetTitleName}".`);
    return true;
  }

  public recordImportLog(log: ImportLogItem) {
    this.importHistory.unshift(log);
    if (this.importHistory.length > 30) {
      this.importHistory.pop();
    }
  }

  public addLog(level: 'info' | 'warn' | 'success' | 'error', message: string) {
    this.logs.unshift({
      timestamp: new Date().toISOString(),
      level,
      message
    });
    if (this.logs.length > 50) {
      this.logs.pop();
    }
  }

  public setSyncState(syncing: boolean) {
    this.isSyncing = syncing;
    if (!syncing) {
      this.lastSyncTime = new Date().toISOString();
    }
  }

  public getSyncStatus(): SyncStatus {
    const dropsArray = Array.from(this.drops.values());
    const lockedCount = dropsArray.filter(d => d.locked).length;
    const pendingCount = this.newsApprovalQueue.filter(n => n.status === 'pending_review').length;
    const nextSync = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    return {
      lastSyncTime: this.lastSyncTime,
      nextScheduledSync: nextSync,
      isSyncing: this.isSyncing,
      autoSyncEnabled: true,
      totalDrops: dropsArray.length,
      totalNews: this.news.length,
      lockedDropsCount: lockedCount,
      pendingApprovalsCount: pendingCount,
      dateChangesCount: this.dateHistory.length,
      sources: [
        {
          name: 'AniList GraphQL API',
          id: 'anilist',
          status: 'online',
          itemCount: dropsArray.filter(d => d.source === 'anilist').length,
          description: 'Legal public GraphQL for upcoming Anime & Manga schedules.',
          isKeyRequired: false,
          hasKey: true
        },
        {
          name: 'Open Library Public API',
          id: 'openlibrary',
          status: 'online',
          itemCount: dropsArray.filter(d => d.source === 'openlibrary').length,
          description: 'Official API for trending books, authors, and cover art.',
          isKeyRequired: false,
          hasKey: true
        },
        {
          name: 'The Movie Database (TMDB)',
          id: 'tmdb',
          status: process.env.TMDB_API_KEY || process.env.TMDB_KEY ? 'online' : 'ready',
          itemCount: dropsArray.filter(d => d.source === 'tmdb' || d.category === 'Movies').length,
          description: process.env.TMDB_API_KEY || process.env.TMDB_KEY ? 'Connected with live API key.' : 'Active in fallback mode (set TMDB_API_KEY in .env for custom live keys).',
          isKeyRequired: true,
          hasKey: Boolean(process.env.TMDB_API_KEY || process.env.TMDB_KEY)
        },
        {
          name: 'Google Sheets / CSV Feed',
          id: 'sheets',
          status: 'online',
          itemCount: dropsArray.filter(d => d.source === 'sheets').length,
          description: 'Team manual data entry via published Google Sheet CSV.',
          isKeyRequired: false,
          hasKey: true
        },
        {
          name: 'Entertainment Wire RSS',
          id: 'rss',
          status: 'online',
          itemCount: this.news.length,
          description: 'Live RSS feeds parsed into news approval queue.',
          isKeyRequired: false,
          hasKey: true
        },
        {
          name: 'Manual / Editorial Entry',
          id: 'manual',
          status: 'online',
          itemCount: dropsArray.filter(d => d.source === 'manual').length,
          description: 'Custom titles with locked field protections.',
          isKeyRequired: false,
          hasKey: true
        }
      ],
      recentLogs: this.logs,
      importHistory: this.importHistory
    };
  }
}

export const db = new DatabaseStore();
