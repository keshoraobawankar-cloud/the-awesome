import { 
  DropTitle, StackingNewsCard, SyncStatus, TimelineDrop, 
  ReleaseDateHistoryItem, NewsApprovalItem, ImportLogItem,
  UserUpdateSubmission, TokenRewardEvent, ContributorLeaderboardEntry, TokenSummary,
  TrailerSubmission, TrailerType, TrustTier, TrailerKind, DropTrailerItem
} from './types';
import { DROP_TITLES_12, HERO_FEATURED_DROP, STACKING_NEWS, THIS_WEEK_TIMELINE } from '../src/data/dropRadarData';
import { parseGoogleSheetsCsv, CsvImportResult } from './fetchers/googleSheets';
import { normalizeYouTubeUrl, verifyYouTubeTrailerMetadata, TrailerVerificationResult } from './trailerValidator';
import {
  computeBasePopularity,
  isUpcomingDrop,
  parseReleaseTargetMs,
  scoreTrendingDrop
} from './trending';
import {
  buildYouTubeEmbedUrl,
  computePrimaryTrailer,
  getTrailerSlotReward,
  trailerKindToLabel,
  trailerTypeToKind,
  upsertDropTrailer
} from '../src/utils/youtube';

const HOURLY_SUBMISSION_LIMIT = 5;
const DAILY_SUBMISSION_LIMIT = 15;
const REJECTION_THROTTLE_LIMIT = 3;
const MAX_PENDING_PER_USER = 3;
const MAX_PENDING_PER_DROP = 2;

function computeTrustTier(tokens: number, trailersAdded: number): TrustTier {
  if (tokens >= 250 || trailersAdded >= 10) return 'Master Auditor';
  if (tokens >= 125 || trailersAdded >= 5) return 'Trusted Curator';
  if (tokens >= 50 || trailersAdded >= 2) return 'Verified Scout';
  return 'Rookie Scout';
}

class DatabaseStore {
  private drops: Map<string, DropTitle> = new Map();
  private news: StackingNewsCard[] = [];
  private timeline: TimelineDrop[] = [];
  private dateHistory: ReleaseDateHistoryItem[] = [];
  private newsApprovalQueue: NewsApprovalItem[] = [];
  private importHistory: ImportLogItem[] = [];
  private userUpdates: UserUpdateSubmission[] = [];
  private tokenEvents: TokenRewardEvent[] = [];
  private contributorBalances: Map<string, ContributorLeaderboardEntry> = new Map();
  private trailerSubmissions: TrailerSubmission[] = [];
  private claimedRewardKeys: Set<string> = new Set();
  private rateLimitTimestamps: Map<string, number[]> = new Map();
  private rejectionTimestamps: Map<string, number[]> = new Map();
  private lastSyncTime: string | null = null;
  private isSyncing = false;
  private autoSyncEnabled = true;
  private syncIntervalMinutes = 5;
  private nextScheduledSync: string = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  private dataVersion = 1;
  private listeners: Set<(event: { type: string; version: number; timestamp: string }) => void> = new Set();
  private logs: Array<{ timestamp: string; level: 'info' | 'warn' | 'success' | 'error'; message: string }> = [];
  private sharePreviewPngs: Map<string, Buffer> = new Map();
  private lastHeroDropId: string | null = null;

  constructor() {
    this.seedInitialData();
    this.lastHeroDropId = this.getHeroDrop()?.id || null;
  }

  public saveSharePreviewPng(id: string, buf: Buffer) {
    if (this.sharePreviewPngs.size >= 50) {
      const oldestKey = this.sharePreviewPngs.keys().next().value;
      if (oldestKey) this.sharePreviewPngs.delete(oldestKey);
    }
    this.sharePreviewPngs.set(id, buf);
  }

  public getSharePreviewPng(id: string): Buffer | undefined {
    return this.sharePreviewPngs.get(id);
  }

  private seedInitialData() {
    // Seed initial drops
    const nowIso = new Date().toISOString();
    for (const drop of DROP_TITLES_12) {
      const normalized = drop.trailerUrl ? normalizeYouTubeUrl(drop.trailerUrl) : undefined;
      const seedVideoId = normalized?.valid ? normalized.videoId : drop.trailerVideoId;
      const seedKind: TrailerKind = trailerTypeToKind(drop.trailerType || 'Official Trailer');
      const initialTrailers: DropTrailerItem[] =
        (drop.trailers && drop.trailers.length > 0)
          ? drop.trailers
          : seedVideoId
          ? [
              {
                id: `trl_seed_${drop.id}_${seedVideoId}`,
                dropId: drop.id,
                kind: seedKind,
                videoId: seedVideoId,
                url: normalized?.canonicalUrl || drop.trailerUrl || `https://www.youtube.com/watch?v=${seedVideoId}`,
                embedUrl: drop.trailerEmbedUrl || buildYouTubeEmbedUrl(seedVideoId),
                title: `${drop.name} — ${trailerKindToLabel(seedKind)}`,
                channelName: drop.trailerSource || 'Official Channel',
                isPrimary: true,
                status: 'verified',
                createdAt: nowIso
              }
            ]
          : [];

      const seededDrop: DropTitle = {
        ...drop,
        trailerVideoId: seedVideoId,
        trailerType: initialTrailers.length > 0 ? trailerKindToLabel(seedKind) : undefined,
        trailerStatus: initialTrailers.length > 0 ? 'verified' : undefined,
        trailers: initialTrailers,
        source: 'curated',
        locked: false,
        updatedAt: nowIso,
        dateHistory: []
      };
      this.syncDropPrimaryFields(seededDrop);
      this.drops.set(drop.id, seededDrop);
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

    this.addLog('info', 'AheadOfYou database initialized with releases, news approval queue & community updates tip line.');
  }

  private syncDropPrimaryFields(drop: DropTitle): DropTitle {
    const trailers = drop.trailers || [];
    const primary = computePrimaryTrailer(trailers);

    if (primary) {
      const label = trailerKindToLabel(primary.kind);
      drop.trailerUrl = primary.url;
      drop.trailerEmbedUrl = primary.embedUrl || buildYouTubeEmbedUrl(primary.videoId);
      drop.trailerVideoId = primary.videoId;
      drop.trailerType = label;
      drop.trailerSource = primary.channelName
        ? primary.channelName.includes('(')
          ? primary.channelName
          : `${primary.channelName} (${label})`
        : `YouTube (${label})`;
      drop.trailerAddedBy = primary.addedByUserId;
      drop.trailerStatus = 'verified';
      drop.trailerBrokenFlag = undefined;
      drop.trailers = trailers.map((t) => ({ ...t, isPrimary: t.id === primary.id }));
      return drop;
    }

    const brokenItem = trailers.find((t) => t.status === 'flagged_broken');
    if (brokenItem) {
      drop.trailerStatus = 'flagged_broken';
      drop.trailerBrokenFlag = drop.trailerBrokenFlag || {
        flaggedBy: brokenItem.flaggedBy || 'Community Scout',
        reason: brokenItem.flagReason || 'Broken or unavailable video link',
        flaggedAt: drop.updatedAt || new Date().toISOString()
      };
      return drop;
    }

    // Fallback for legacy/non-YouTube trailers without DropTrailerItem records
    if (!drop.trailerUrl && !drop.trailerEmbedUrl) {
      drop.trailerVideoId = undefined;
      drop.trailerType = undefined;
      drop.trailerSource = undefined;
      drop.trailerAddedBy = undefined;
      drop.trailerStatus = undefined;
      drop.trailerBrokenFlag = undefined;
    }
    return drop;
  }

  public getDrops(): DropTitle[] {
    const now = Date.now();
    const todayStart = new Date(now);
    todayStart.setUTCHours(0, 0, 0, 0);
    return Array.from(this.drops.values()).map(d => {
      const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec((d.date || '').trim());
      let days = d.daysRemaining;
      if (dateMatch) {
        const releaseDayUtc = Date.UTC(Number(dateMatch[1]), Number(dateMatch[2]) - 1, Number(dateMatch[3]));
        days = Math.max(0, Math.round((releaseDayUtc - todayStart.getTime()) / (1000 * 60 * 60 * 24)));
      } else {
        const targetTime = parseReleaseTargetMs(d.date);
        if (!isNaN(targetTime)) {
          days = Math.max(0, Math.ceil((targetTime - now) / (1000 * 60 * 60 * 24)));
        }
      }
      return {
        ...d,
        daysRemaining: days,
        trailers: d.trailers || [],
        dateHistory: this.dateHistory.filter(h => h.titleId === d.id)
      };
    }).sort((a, b) => a.daysRemaining - b.daysRemaining);
  }

  public getFeaturedTrendingDrops(limit = 5): DropTitle[] {
    const now = Date.now();
    const upcoming = this.getDrops().filter((d) => isUpcomingDrop(d, now));
    return upcoming
      .sort(
        (a, b) =>
          scoreTrendingDrop(b, now) - scoreTrendingDrop(a, now) ||
          a.daysRemaining - b.daysRemaining
      )
      .slice(0, limit);
  }

  public getFeaturedUpcomingGames(limit = 4): DropTitle[] {
    const now = Date.now();
    return this.getDrops()
      .filter((d) => d.category === 'Games' && isUpcomingDrop(d, now))
      .sort(
        (a, b) =>
          scoreTrendingDrop(b, now) - scoreTrendingDrop(a, now) ||
          a.daysRemaining - b.daysRemaining
      )
      .slice(0, limit);
  }

  public getHeroDrop(): DropTitle {
    const trending = this.getFeaturedTrendingDrops(1);
    if (trending.length > 0) {
      return trending[0];
    }

    const all = this.getDrops();
    const fallback = all.find((d) => d.id === HERO_FEATURED_DROP.id);
    return fallback || all[0] || HERO_FEATURED_DROP;
  }

  public syncHeroSpotlight(logIfChanged = true): DropTitle {
    const currentHero = this.getHeroDrop();
    if (currentHero && currentHero.id !== this.lastHeroDropId) {
      this.lastHeroDropId = currentHero.id;
      if (logIfChanged) {
        this.addLog(
          'success',
          `Top trending spotlight updated: "${currentHero.name}" [${currentHero.category}] (${currentHero.date})`
        );
      }
      this.notifyChange('hero_updated');
    }
    return currentHero;
  }

  public getNews(): StackingNewsCard[] {
    return this.news;
  }

  public getTimeline(): TimelineDrop[] {
    return this.timeline;
  }

  public getDropById(id: string): DropTitle | undefined {
    const drop = this.drops.get(id);
    if (!drop) return undefined;
    return {
      ...drop,
      trailers: drop.trailers || [],
      dateHistory: this.dateHistory.filter(h => h.titleId === drop.id)
    };
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

      const computedPopularity =
        drop.popularityScore ??
        existing.popularityScore ??
        computeBasePopularity({
          name: drop.name,
          category: drop.category,
          hasTrailer: Boolean(drop.trailerUrl || existing.trailerUrl),
          status: drop.status,
          source: drop.source || existing.source
        });

      const incomingNormalized = drop.trailerUrl ? normalizeYouTubeUrl(drop.trailerUrl) : undefined;
      let nextDrop: DropTitle = {
        ...existing,
        ...drop,
        image: drop.image || existing.image,
        popularityScore: computedPopularity,
        isPopular:
          drop.isPopular ??
          existing.isPopular ??
          (typeof computedPopularity === 'number' ? computedPopularity >= 78 : undefined),
        trailers: drop.trailers || existing.trailers || [],
        trailerUrl: drop.trailerUrl || existing.trailerUrl,
        trailerEmbedUrl: drop.trailerEmbedUrl || existing.trailerEmbedUrl,
        trailerSource: drop.trailerSource || existing.trailerSource,
        trailerAddedBy: drop.trailerAddedBy || existing.trailerAddedBy,
        trailerType: drop.trailerType || existing.trailerType,
        trailerVideoId: drop.trailerVideoId || existing.trailerVideoId || (incomingNormalized?.valid ? incomingNormalized.videoId : undefined),
        trailerStatus: drop.trailerStatus || existing.trailerStatus || (drop.trailerEmbedUrl || existing.trailerEmbedUrl ? 'verified' : undefined),
        trailerBrokenFlag: drop.trailerBrokenFlag !== undefined ? drop.trailerBrokenFlag : existing.trailerBrokenFlag,
        industry: drop.industry || existing.industry,
        trustedSourceLabel: drop.trustedSourceLabel || existing.trustedSourceLabel,
        locked: existing.locked || drop.locked,
        updatedAt: new Date().toISOString()
      };

      if (incomingNormalized?.valid && incomingNormalized.videoId) {
        const incomingKind = trailerTypeToKind(drop.trailerType || 'Official Trailer');
        const alreadyInSlots = (nextDrop.trailers || []).some(
          (t) => t.videoId === incomingNormalized.videoId || (t.kind === incomingKind && t.status !== 'flagged_broken')
        );
        if (!alreadyInSlots) {
          const upserted = upsertDropTrailer(nextDrop, {
            kind: incomingKind,
            videoId: incomingNormalized.videoId,
            url: incomingNormalized.canonicalUrl!,
            embedUrl: drop.trailerEmbedUrl || incomingNormalized.embedUrl,
            channelName: drop.trailerSource || 'Official Channel',
            addedByUserId: drop.trailerAddedBy,
            status: 'verified'
          });
          nextDrop = upserted.drop;
        }
      }
      this.syncDropPrimaryFields(nextDrop);
      this.drops.set(drop.id, nextDrop);
      this.syncHeroSpotlight(!isFromAutoSync);

      return { status: 'updated', dateChanged, oldDate };
    } else {
      const normalized = drop.trailerUrl ? normalizeYouTubeUrl(drop.trailerUrl) : undefined;
      const initialKind = trailerTypeToKind(drop.trailerType || 'Official Trailer');
      const initialTrailers: DropTrailerItem[] =
        drop.trailers && drop.trailers.length > 0
          ? drop.trailers
          : normalized?.valid && normalized.videoId
          ? [
              {
                id: `trl_${Date.now()}_${normalized.videoId}`,
                dropId: drop.id,
                kind: initialKind,
                videoId: normalized.videoId,
                url: normalized.canonicalUrl!,
                embedUrl: drop.trailerEmbedUrl || normalized.embedUrl,
                channelName: drop.trailerSource || 'Official Channel',
                addedByUserId: drop.trailerAddedBy,
                isPrimary: true,
                status: 'verified',
                createdAt: new Date().toISOString()
              }
            ]
          : [];
      const computedPopularity =
        drop.popularityScore ??
        computeBasePopularity({
          name: drop.name,
          category: drop.category,
          hasTrailer: Boolean(normalized?.valid || initialTrailers.length > 0),
          status: drop.status,
          source: drop.source
        });
      const createdDrop: DropTitle = {
        ...drop,
        popularityScore: computedPopularity,
        isPopular:
          drop.isPopular ??
          (typeof computedPopularity === 'number' ? computedPopularity >= 78 : undefined),
        trailers: initialTrailers,
        trailerVideoId: drop.trailerVideoId || (normalized?.valid ? normalized.videoId : undefined),
        trailerStatus: drop.trailerStatus || (drop.trailerEmbedUrl ? 'verified' : undefined),
        updatedAt: new Date().toISOString()
      };
      this.syncDropPrimaryFields(createdDrop);
      this.drops.set(drop.id, createdDrop);
      this.syncHeroSpotlight(!isFromAutoSync);
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
    this.notifyChange('news_updated');
  }

  public mergeLiveNews(newsList: StackingNewsCard[]) {
    const preserved = this.news.filter(
      (n) => n.id.startsWith('approved-') || n.id.startsWith('news-applied-') || n.id.startsWith('news-new-drop-')
    );
    const seenTitles = new Set(preserved.map((n) => n.title.toLowerCase()));
    const fresh = newsList.filter((n) => !seenTitles.has(n.title.toLowerCase()));
    this.news = [...preserved, ...fresh].slice(0, 12);
    this.notifyChange('news_updated');
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
    updateType: 'date_change' | 'delay_alert' | 'platform_added' | 'new_release' | 'breaking_scoop' | 'official_trailer';
    suggestedDate?: string;
    suggestedStatus?: 'Confirmed' | 'Tentative' | 'Delayed';
    category: 'Movies' | 'Anime' | 'Games' | 'Dramas' | 'Books' | 'Manga';
    platform?: string;
    details: string;
    sourceUrl?: string;
    trailerUrl?: string;
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
      trailerUrl: data.trailerUrl?.trim(),
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
      source: `AHEADOFYOU COMMUNITY TIP LINE`,
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
      const boosted = computeBasePopularity({
        name: target.name,
        category: target.category,
        hasTrailer: Boolean(target.trailerUrl || target.trailerEmbedUrl),
        status: target.status,
        source: target.source,
        explicitScore: Math.max(target.popularityScore || 78, update.confirmationsCount >= 5 ? 90 : 82)
      });
      target.popularityScore = boosted;
      target.isPopular = boosted >= 78;
      target.updatedAt = new Date().toISOString();
      update.status = 'applied';
      this.syncHeroSpotlight(true);

      // Push breaking news item to stack
      this.news.unshift({
        id: `news-applied-${Date.now()}`,
        kicker: 'COMMUNITY VERIFIED DROP UPDATE',
        title: `${target.name}: Schedule Updated to ${target.date}`,
        deck: `Reader scoop confirmed: ${update.details}. Broadcasted to all tracking desks.`,
        source: `AheadOfYou Community Wire (${update.submittedBy})`,
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
      const newStatus = update.suggestedStatus || 'Confirmed';
      const newPopularity = computeBasePopularity({
        name: update.targetTitleName,
        category: update.category,
        hasTrailer: Boolean(update.trailerUrl),
        status: newStatus,
        source: 'manual',
        explicitScore: update.confirmationsCount >= 5 ? 90 : 82
      });
      const newDrop: DropTitle = {
        id: newDropId,
        name: update.targetTitleName,
        category: update.category,
        date: update.suggestedDate || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
        daysRemaining: 30,
        status: newStatus,
        platform: update.platform || 'Global Theatrical / Streaming',
        gradient: 'from-[#8b5cf6]/20 via-[#171a30] to-[#0b0d1a]',
        accent: '#8b5cf6',
        tagline: update.details.slice(0, 50),
        description: update.details,
        popularityScore: newPopularity,
        isPopular: newPopularity >= 78,
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
        deck: `${update.details} Subscribed to AheadOfYou countdown radar.`,
        source: `Community Dispatch (${update.submittedBy})`,
        readTime: '1 MIN READ',
        date: 'Just now',
        gradient: 'from-[#ff3d71]/30 via-[#171a30] to-[#0b0d1a]',
        tag: newDrop.category.toUpperCase()
      });

      this.addLog('success', `Cataloged new community-submitted release: "${newDrop.name}".`);
      return { success: true, appliedTitle: newDrop, message: `Added new release "${newDrop.name}" to live AheadOfYou radar!` };
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

  private pruneTimestamps(list: number[], windowMs: number, now: number): number[] {
    return list.filter((ts) => now - ts < windowMs);
  }

  public getRateLimitUsage(actorKeys: string[]): {
    hourlyUsed: number;
    hourlyLimit: number;
    dailyUsed: number;
    dailyLimit: number;
    recentRejections: number;
  } {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * 60 * 60 * 1000;

    let hourlyUsed = 0;
    let dailyUsed = 0;
    let recentRejections = 0;

    for (const rawKey of actorKeys) {
      const k = rawKey.trim().toLowerCase();
      if (!k) continue;
      const validSubTimestamps = this.pruneTimestamps(this.rateLimitTimestamps.get(k) || [], oneDay, now);
      this.rateLimitTimestamps.set(k, validSubTimestamps);
      dailyUsed = Math.max(dailyUsed, validSubTimestamps.length);
      hourlyUsed = Math.max(hourlyUsed, validSubTimestamps.filter((ts) => now - ts < oneHour).length);

      const validRejTimestamps = this.pruneTimestamps(this.rejectionTimestamps.get(k) || [], oneHour, now);
      this.rejectionTimestamps.set(k, validRejTimestamps);
      recentRejections = Math.max(recentRejections, validRejTimestamps.length);
    }

    return {
      hourlyUsed,
      hourlyLimit: HOURLY_SUBMISSION_LIMIT,
      dailyUsed,
      dailyLimit: DAILY_SUBMISSION_LIMIT,
      recentRejections
    };
  }

  private recordSubmissionAttempt(actorKeys: string[]) {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    for (const rawKey of actorKeys) {
      const k = rawKey.trim().toLowerCase();
      if (!k) continue;
      const existing = this.pruneTimestamps(this.rateLimitTimestamps.get(k) || [], oneDay, now);
      existing.push(now);
      this.rateLimitTimestamps.set(k, existing);
    }
  }

  private recordRejectionAttempt(actorKeys: string[], contributorName: string) {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    for (const rawKey of actorKeys) {
      const k = rawKey.trim().toLowerCase();
      if (!k) continue;
      const existing = this.pruneTimestamps(this.rejectionTimestamps.get(k) || [], oneHour, now);
      existing.push(now);
      this.rejectionTimestamps.set(k, existing);
    }

    const userKey = contributorName.trim().toLowerCase();
    const existing = this.contributorBalances.get(userKey);
    if (existing) {
      existing.rejectedAttempts = (existing.rejectedAttempts || 0) + 1;
      existing.lastActiveAt = new Date(now).toISOString();
    } else {
      this.contributorBalances.set(userKey, {
        contributorName,
        tokens: 0,
        trailersAdded: 0,
        trustTier: 'Rookie Scout',
        rejectedAttempts: 1,
        lastActiveAt: new Date(now).toISOString()
      });
    }
  }

  public awardTokens(params: {
    contributorName: string;
    tokensEarned: number;
    reason: string;
    rewardId?: string;
    rewardType?: 'new_trailer' | 'trailer_fix' | 'pending_hold' | 'rejected_attempt';
    status?: 'credited' | 'held' | 'rejected';
    dropId?: string;
    dropName?: string;
    videoId?: string;
    trailerType?: TrailerType;
    trailerUrl?: string;
  }): { event: TokenRewardEvent; idempotentDuplicate: boolean } {
    const name = (params.contributorName || 'Trailer Scout').trim().slice(0, 40) || 'Trailer Scout';
    const key = name.toLowerCase();
    const now = new Date().toISOString();
    const status = params.status || 'credited';

    // Idempotent ledger check for credited token awards
    if (status === 'credited' && params.rewardId) {
      if (this.claimedRewardKeys.has(params.rewardId)) {
        const existingEvent = this.tokenEvents.find((e) => e.rewardId === params.rewardId && e.status === 'credited');
        if (existingEvent) {
          return { event: existingEvent, idempotentDuplicate: true };
        }
      }
      this.claimedRewardKeys.add(params.rewardId);
    }

    const event: TokenRewardEvent = {
      id: `tok-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      rewardId: params.rewardId,
      contributorName: name,
      tokensEarned: status === 'credited' ? params.tokensEarned : 0,
      reason: params.reason,
      rewardType: params.rewardType || 'new_trailer',
      status,
      dropId: params.dropId,
      dropName: params.dropName,
      videoId: params.videoId,
      trailerType: params.trailerType,
      trailerUrl: params.trailerUrl,
      createdAt: now
    };

    this.tokenEvents.unshift(event);
    if (this.tokenEvents.length > 150) {
      this.tokenEvents.pop();
    }

    if (status === 'credited' && params.tokensEarned > 0) {
      const existing = this.contributorBalances.get(key);
      const nextTokens = (existing?.tokens || 0) + params.tokensEarned;
      const nextTrailers = (existing?.trailersAdded || 0) + 1;
      this.contributorBalances.set(key, {
        contributorName: existing?.contributorName || name,
        tokens: nextTokens,
        trailersAdded: nextTrailers,
        trustTier: computeTrustTier(nextTokens, nextTrailers),
        rejectedAttempts: existing?.rejectedAttempts || 0,
        lastActiveAt: now
      });
      this.addLog('success', `Awarded +${params.tokensEarned} Tokens to "${name}" — ${params.reason}`);
    } else {
      this.addLog('info', `Ledger recorded (${status}) for "${name}" — ${params.reason}`);
    }

    return { event, idempotentDuplicate: false };
  }

  public async submitOfficialTrailer(params: {
    dropId: string;
    trailerUrl: string;
    kind?: TrailerKind;
    trailerType?: TrailerType;
    submittedBy?: string;
    userConfirmedOfficial?: boolean;
    sessionKey?: string;
  }): Promise<{
    httpStatus: number;
    success: boolean;
    outcome: 'verified' | 'pending_review' | 'duplicate' | 'rejected' | 'rate_limited';
    tokensAwarded: number;
    tokensHeld: number;
    alreadyAttached?: boolean;
    message?: string;
    error?: string;
    submission?: TrailerSubmission;
    verification?: TrailerVerificationResult;
    drop?: DropTitle;
    tokenSummary?: ReturnType<DatabaseStore['getTokenSummary']>;
  }> {
    const drop = this.drops.get(params.dropId);
    if (!drop) {
      return {
        httpStatus: 404,
        success: false,
        outcome: 'rejected',
        tokensAwarded: 0,
        tokensHeld: 0,
        error: 'Release title not found.'
      };
    }

    const contributor = typeof params.submittedBy === 'string' ? params.submittedBy.trim().slice(0, 40) : '';
    if (contributor.length < 2) {
      return {
        httpStatus: 400,
        success: false,
        outcome: 'rejected',
        tokensAwarded: 0,
        tokensHeld: 0,
        error: 'Please enter a valid Scout Handle (at least 2 characters) before submitting.'
      };
    }

    if (params.userConfirmedOfficial === false) {
      return {
        httpStatus: 400,
        success: false,
        outcome: 'rejected',
        tokensAwarded: 0,
        tokensHeld: 0,
        error: 'Please confirm that this link comes from an official studio or publisher channel.'
      };
    }

    const kind: TrailerKind = params.kind || trailerTypeToKind(params.trailerType || 'Official Trailer');
    const trailerType: TrailerType = params.trailerType || trailerKindToLabel(kind);
    const userKey = contributor.toLowerCase();
    const actorKeys = [`user:${userKey}`, params.sessionKey ? `session:${params.sessionKey}` : ''].filter(Boolean);

    // 1. Rate-limit & spammer rejection throttle check
    const usage = this.getRateLimitUsage(actorKeys);
    if (usage.recentRejections >= REJECTION_THROTTLE_LIMIT) {
      return {
        httpStatus: 429,
        success: false,
        outcome: 'rate_limited',
        tokensAwarded: 0,
        tokensHeld: 0,
        error: 'Submission temporarily throttled after multiple rejected links. Please verify official YouTube sources before retrying.'
      };
    }
    if (usage.hourlyUsed >= usage.hourlyLimit || usage.dailyUsed >= usage.dailyLimit) {
      return {
        httpStatus: 429,
        success: false,
        outcome: 'rate_limited',
        tokensAwarded: 0,
        tokensHeld: 0,
        error: `Rate limit reached (${usage.hourlyUsed}/${usage.hourlyLimit} per hour, ${usage.dailyUsed}/${usage.dailyLimit} per day).`
      };
    }

    // Cap open pending_review items per user & per release to prevent queue flooding
    const openUserPendingCount = this.trailerSubmissions.filter(
      (s) => s.status === 'pending_review' && s.submittedBy.toLowerCase() === userKey
    ).length;
    if (openUserPendingCount >= MAX_PENDING_PER_USER) {
      return {
        httpStatus: 429,
        success: false,
        outcome: 'rate_limited',
        tokensAwarded: 0,
        tokensHeld: 0,
        error: `You already have ${openUserPendingCount} trailers awaiting verification. Wait for review before queueing more.`
      };
    }

    const openDropPendingCount = this.trailerSubmissions.filter(
      (s) => s.status === 'pending_review' && s.dropId === drop.id
    ).length;
    if (openDropPendingCount >= MAX_PENDING_PER_DROP) {
      return {
        httpStatus: 429,
        success: false,
        outcome: 'rate_limited',
        tokensAwarded: 0,
        tokensHeld: 0,
        error: `"${drop.name}" already has ${openDropPendingCount} trailers pending verification.`
      };
    }

    // 2. URL & 11-char videoId normalization
    const normalized = normalizeYouTubeUrl(params.trailerUrl);
    if (!normalized.valid || !normalized.videoId || !normalized.canonicalUrl || !normalized.embedUrl) {
      this.recordSubmissionAttempt(actorKeys);
      this.recordRejectionAttempt(actorKeys, contributor);
      return {
        httpStatus: 400,
        success: false,
        outcome: 'rejected',
        tokensAwarded: 0,
        tokensHeld: 0,
        error: normalized.error || 'Invalid YouTube trailer URL.'
      };
    }

    const { videoId, canonicalUrl, embedUrl } = normalized;
    const dropTrailers = drop.trailers || [];

    // 3. Uniqueness & Duplicate Lock on (dropId, videoId)
    const activeMatchingVideoSlot = dropTrailers.find(
      (t) => t.videoId === videoId && t.status !== 'flagged_broken'
    );
    const isLegacyBroken = drop.trailerStatus === 'flagged_broken';
    const duplicateOnSameDrop =
      Boolean(activeMatchingVideoSlot) ||
      (!isLegacyBroken && drop.trailerVideoId === videoId) ||
      this.trailerSubmissions.some(
        (s) => s.dropId === drop.id && s.videoId === videoId && s.status !== 'rejected' && s.status !== 'flagged_broken'
      );

    if (duplicateOnSameDrop) {
      return {
        httpStatus: 200,
        success: true,
        outcome: 'duplicate',
        alreadyAttached: true,
        tokensAwarded: 0,
        tokensHeld: 0,
        message: 'This trailer is already linked to this release.',
        drop: this.getDrops().find((d) => d.id === drop.id),
        tokenSummary: this.getTokenSummary(contributor, params.sessionKey)
      };
    }

    // Prevent using the exact same videoId across multiple different releases
    const usedOnAnotherDrop = Array.from(this.drops.values()).find(
      (d) =>
        d.id !== drop.id &&
        ((d.trailers || []).some((t) => t.videoId === videoId && t.status !== 'flagged_broken') ||
          (d.trailerStatus !== 'flagged_broken' &&
            (d.trailerVideoId === videoId || (d.trailerUrl && normalizeYouTubeUrl(d.trailerUrl).videoId === videoId))))
    ) || this.trailerSubmissions.find(
      (s) => s.dropId !== drop.id && s.videoId === videoId && s.status !== 'rejected' && s.status !== 'flagged_broken'
    );

    if (usedOnAnotherDrop) {
      this.recordSubmissionAttempt(actorKeys);
      this.recordRejectionAttempt(actorKeys, contributor);
      this.awardTokens({
        contributorName: contributor,
        tokensEarned: 0,
        status: 'rejected',
        rewardType: 'rejected_attempt',
        reason: `Rejected duplicate video across releases for "${drop.name}"`,
        dropId: drop.id,
        dropName: drop.name,
        videoId,
        trailerType,
        trailerUrl: canonicalUrl
      });
      return {
        httpStatus: 409,
        success: false,
        outcome: 'rejected',
        tokensAwarded: 0,
        tokensHeld: 0,
        error: 'This YouTube video is already linked to another release on AheadOfYou.',
        tokenSummary: this.getTokenSummary(contributor, params.sessionKey)
      };
    }

    // One active slot per TrailerKind (teaser, official_trailer, gameplay, launch_trailer)
    const activeSlot = dropTrailers.find(
      (t) => t.kind === kind && t.status !== 'flagged_broken'
    );
    const pendingSameKind = this.trailerSubmissions.find(
      (s) =>
        s.dropId === drop.id &&
        (s.kind || trailerTypeToKind(s.trailerType)) === kind &&
        (s.status === 'verified' || s.status === 'pending_review')
    );

    if (activeSlot || pendingSameKind) {
      return {
        httpStatus: 409,
        success: false,
        outcome: 'duplicate',
        alreadyAttached: true,
        tokensAwarded: 0,
        tokensHeld: 0,
        message: `An active ${trailerType} is already attached to "${drop.name}". Pick another open slot or flag a broken link instead.`,
        error: `An active ${trailerType} is already attached to "${drop.name}". Pick another open slot or flag a broken link instead.`,
        drop: this.getDrops().find((d) => d.id === drop.id),
        tokenSummary: this.getTokenSummary(contributor, params.sessionKey)
      };
    }

    // Record submission attempt against hourly/daily limit
    this.recordSubmissionAttempt(actorKeys);

    // 4. Automated metadata & official channel/relevance checks
    const existingContributor = this.contributorBalances.get(userKey);
    const trustTier = computeTrustTier(existingContributor?.tokens || 0, existingContributor?.trailersAdded || 0);
    const isTrustedContributor = trustTier === 'Trusted Curator' || trustTier === 'Master Auditor';

    const verification = await verifyYouTubeTrailerMetadata({
      videoId,
      dropName: drop.name,
      trailerType,
      isTrustedContributor
    });

    const brokenSlotForKind = dropTrailers.find(
      (t) => t.kind === kind && t.status === 'flagged_broken'
    );
    const isBrokenFix = Boolean(brokenSlotForKind) || (
      isLegacyBroken && (!drop.trailerType || trailerTypeToKind(drop.trailerType) === kind)
    );
    const rewardType: 'new_trailer' | 'trailer_fix' = isBrokenFix ? 'trailer_fix' : 'new_trailer';
    const bountyAmount = getTrailerSlotReward(kind, isBrokenFix);
    // Separate reward keys per (userId, dropId, kind)
    const rewardId = `trailer:${userKey}:${drop.id}:${kind}`;
    const videoRewardLock = `${userKey}::${drop.id}::${videoId}`;
    const now = new Date().toISOString();

    if (verification.outcome === 'rejected') {
      this.recordRejectionAttempt(actorKeys, contributor);
      const rejectedSub: TrailerSubmission = {
        id: `trl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        dropId: drop.id,
        dropName: drop.name,
        videoId,
        provider: 'youtube',
        canonicalUrl,
        embedUrl,
        kind,
        trailerType,
        submittedBy: contributor,
        userConfirmedOfficial: true,
        videoTitle: verification.videoTitle,
        channelName: verification.channelName,
        officialSignal: 'rejected',
        status: 'rejected',
        isBrokenFix,
        tokensAwarded: 0,
        tokensHeld: 0,
        rejectionReason: verification.reason,
        createdAt: now
      };
      this.trailerSubmissions.unshift(rejectedSub);
      this.awardTokens({
        contributorName: contributor,
        tokensEarned: 0,
        status: 'rejected',
        rewardType: 'rejected_attempt',
        reason: verification.reason,
        dropId: drop.id,
        dropName: drop.name,
        videoId,
        trailerType,
        trailerUrl: canonicalUrl
      });
      this.notifyChange('trailer_rejected');
      return {
        httpStatus: 422,
        success: false,
        outcome: 'rejected',
        tokensAwarded: 0,
        tokensHeld: 0,
        error: verification.reason,
        submission: rejectedSub,
        verification,
        tokenSummary: this.getTokenSummary(contributor, params.sessionKey)
      };
    }

    // Check idempotency per (userId, dropId, kind) or (userId, dropId, videoId)
    const alreadyClaimedByUser =
      this.claimedRewardKeys.has(rewardId) || this.claimedRewardKeys.has(videoRewardLock);

    if (verification.outcome === 'verified') {
      const creditsToGrant = alreadyClaimedByUser ? 0 : bountyAmount;
      const sub: TrailerSubmission = {
        id: `trl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        dropId: drop.id,
        dropName: drop.name,
        videoId,
        provider: 'youtube',
        canonicalUrl,
        embedUrl,
        kind,
        trailerType,
        submittedBy: contributor,
        userConfirmedOfficial: true,
        videoTitle: verification.videoTitle,
        channelName: verification.channelName,
        officialSignal: verification.officialSignal,
        status: 'verified',
        isBrokenFix,
        tokensAwarded: creditsToGrant,
        tokensHeld: 0,
        rewardId,
        createdAt: now,
        reviewedAt: now
      };
      this.trailerSubmissions.unshift(sub);

      // Upsert into drop.trailers (keeps teaser + official_trailer side by side & promotes official_trailer as primary)
      const { drop: updatedDrop } = upsertDropTrailer(drop, {
        kind,
        videoId,
        url: canonicalUrl,
        embedUrl,
        title: verification.videoTitle,
        channelName: verification.channelName || `YouTube (${trailerType})`,
        addedByUserId: contributor,
        status: 'verified'
      });
      updatedDrop.updatedAt = now;
      this.syncDropPrimaryFields(updatedDrop);
      this.drops.set(drop.id, updatedDrop);

      if (creditsToGrant > 0) {
        this.claimedRewardKeys.add(videoRewardLock);
        this.awardTokens({
          contributorName: contributor,
          tokensEarned: creditsToGrant,
          rewardId,
          rewardType,
          status: 'credited',
          reason: isBrokenFix
            ? `Replaced broken trailer (${trailerType}) for "${drop.name}"`
            : `Verified ${trailerType} for "${drop.name}"`,
          dropId: drop.id,
          dropName: drop.name,
          videoId,
          trailerType,
          trailerUrl: canonicalUrl
        });
      }

      this.notifyChange('drop_trailer_updated');
      return {
        httpStatus: 200,
        success: true,
        outcome: 'verified',
        tokensAwarded: creditsToGrant,
        tokensHeld: 0,
        message:
          creditsToGrant > 0
            ? `${trailerType} added! +${creditsToGrant} tokens credited`
            : `${trailerType} added!`,
        submission: sub,
        verification,
        drop: this.getDrops().find((d) => d.id === drop.id),
        tokenSummary: this.getTokenSummary(contributor, params.sessionKey)
      };
    }

    // Pending review path (metadata ambiguous — hold tokens until approved!)
    const heldAmount = alreadyClaimedByUser ? 0 : bountyAmount;
    const pendingSub: TrailerSubmission = {
      id: `trl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      dropId: drop.id,
      dropName: drop.name,
      videoId,
      provider: 'youtube',
      canonicalUrl,
      embedUrl,
      kind,
      trailerType,
      submittedBy: contributor,
      userConfirmedOfficial: true,
      videoTitle: verification.videoTitle,
      channelName: verification.channelName,
      officialSignal: 'ambiguous',
      status: 'pending_review',
      isBrokenFix,
      tokensAwarded: 0,
      tokensHeld: heldAmount,
      rejectionReason: verification.reason,
      rewardId,
      createdAt: now
    };
    this.trailerSubmissions.unshift(pendingSub);

    this.awardTokens({
      contributorName: contributor,
      tokensEarned: 0,
      rewardId,
      rewardType: 'pending_hold',
      status: 'held',
      reason: `Submitted ${trailerType} for "${drop.name}" (+${heldAmount} tokens held pending verification)`,
      dropId: drop.id,
      dropName: drop.name,
      videoId,
      trailerType,
      trailerUrl: canonicalUrl
    });

    this.notifyChange('trailer_pending_review');
    return {
      httpStatus: 202,
      success: true,
      outcome: 'pending_review',
      tokensAwarded: 0,
      tokensHeld: heldAmount,
      message: 'Submitted for verification — tokens are held until the link passes review.',
      submission: pendingSub,
      verification,
      drop: this.getDrops().find((d) => d.id === drop.id),
      tokenSummary: this.getTokenSummary(contributor, params.sessionKey)
    };
  }

  public flagBrokenTrailer(params: {
    dropId: string;
    flaggedBy: string;
    reason: string;
    kind?: TrailerKind;
    videoId?: string;
  }): { success: boolean; message: string; drop?: DropTitle } {
    const drop = this.drops.get(params.dropId);
    if (!drop) {
      return { success: false, message: 'Release title not found.' };
    }
    const trailers = drop.trailers || [];
    if (trailers.length === 0 && !drop.trailerEmbedUrl && !drop.trailerUrl) {
      return { success: false, message: 'No trailer is currently attached to flag.' };
    }

    const who = (params.flaggedBy || 'Community Scout').trim().slice(0, 40) || 'Community Scout';
    const why = (params.reason || 'Broken or unavailable video link').trim().slice(0, 140);
    const now = new Date().toISOString();

    const targetItem =
      (params.videoId && trailers.find((t) => t.videoId === params.videoId)) ||
      (params.kind && trailers.find((t) => t.kind === params.kind)) ||
      computePrimaryTrailer(trailers);

    if (targetItem) {
      if (targetItem.status === 'flagged_broken') {
        return {
          success: false,
          message: `The ${trailerKindToLabel(targetItem.kind)} slot is already flagged as broken (+10 fix tokens).`
        };
      }
      targetItem.status = 'flagged_broken';
      targetItem.isPrimary = false;
      targetItem.flagReason = why;
      targetItem.flaggedBy = who;
    } else if (drop.trailerStatus === 'flagged_broken') {
      return { success: false, message: 'This trailer is already flagged as broken and open for a +10 Token replacement.' };
    }

    const targetVideoId =
      targetItem?.videoId ||
      params.videoId ||
      drop.trailerVideoId ||
      (drop.trailerUrl ? normalizeYouTubeUrl(drop.trailerUrl).videoId : undefined);

    for (const sub of this.trailerSubmissions) {
      if (sub.dropId === drop.id && (!targetVideoId || sub.videoId === targetVideoId) && sub.status === 'verified') {
        sub.status = 'flagged_broken';
        sub.flagReason = why;
        sub.flaggedBy = who;
      }
    }

    drop.updatedAt = now;
    this.syncDropPrimaryFields(drop);
    if (!computePrimaryTrailer(drop.trailers || [])) {
      drop.trailerStatus = 'flagged_broken';
      drop.trailerBrokenFlag = {
        flaggedBy: who,
        reason: why,
        flaggedAt: now
      };
    }

    this.addLog('warn', `Trailer flagged as broken/outdated for "${drop.name}" by ${who}: ${why}`);
    this.notifyChange('drop_trailer_flagged');
    return {
      success: true,
      message: targetItem
        ? `${trailerKindToLabel(targetItem.kind)} flagged as broken. A replacement link can now earn +10 fix tokens.`
        : `Trailer flagged as broken. A replacement link can now earn +10 fix tokens.`,
      drop: this.getDrops().find((d) => d.id === drop.id)
    };
  }

  public reviewTrailerSubmission(
    submissionId: string,
    action: 'approve' | 'reject',
    reviewerReason?: string,
    options?: { replaceExisting?: boolean }
  ): {
    success: boolean;
    alreadyProcessed?: boolean;
    keptExisting?: boolean;
    conflict?: boolean;
    message: string;
    tokensAwarded: number;
    walletBalance?: number;
    submission?: TrailerSubmission;
    drop?: DropTitle;
  } {
    const sub = this.trailerSubmissions.find((s) => s.id === submissionId);
    if (!sub) {
      return { success: false, message: 'Trailer submission not found.', tokensAwarded: 0 };
    }

    const userKey = sub.submittedBy.toLowerCase();
    const currentBalance = this.contributorBalances.get(userKey)?.tokens || 0;

    // Conditional transition: ONLY pending_review can transition to verified/rejected
    if (sub.status !== 'pending_review') {
      return {
        success: action === 'approve' && sub.status === 'verified',
        alreadyProcessed: true,
        message: `Submission was already ${sub.status}; no duplicate payout issued.`,
        tokensAwarded: 0,
        walletBalance: currentBalance,
        submission: sub,
        drop: this.getDrops().find((d) => d.id === sub.dropId)
      };
    }

    const now = new Date().toISOString();
    const drop = this.drops.get(sub.dropId);
    const subKind: TrailerKind = sub.kind || trailerTypeToKind(sub.trailerType);

    if (action === 'reject') {
      const reason =
        (reviewerReason && reviewerReason.trim()) ||
        'Not verified as an official trailer for this release.';
      sub.status = 'rejected';
      sub.tokensHeld = 0;
      sub.rejectionReason = reason;
      sub.reviewedAt = now;
      this.recordRejectionAttempt([`user:${userKey}`], sub.submittedBy);

      // Safety cleanup: if the drop somehow held this exact rejected videoId as unverified/pending, clear it
      if (drop) {
        if (drop.trailers) {
          drop.trailers = drop.trailers.filter(
            (t) => !(t.videoId === sub.videoId && t.status !== 'verified')
          );
        }
        if (drop.trailerVideoId === sub.videoId && drop.trailerStatus !== 'verified') {
          drop.trailerUrl = undefined;
          drop.trailerEmbedUrl = undefined;
          drop.trailerSource = undefined;
          drop.trailerAddedBy = undefined;
          drop.trailerType = undefined;
          drop.trailerVideoId = undefined;
          drop.trailerStatus = undefined;
        }
        drop.updatedAt = now;
        this.syncDropPrimaryFields(drop);
      }

      // Update any existing held ledger entry in-place without inserting a new wallet payout row
      const heldEntry = this.tokenEvents.find(
        (ev) => ev.status === 'held' && ev.dropId === sub.dropId && ev.videoId === sub.videoId && ev.contributorName.toLowerCase() === userKey
      );
      if (heldEntry) {
        heldEntry.status = 'rejected';
        heldEntry.tokensEarned = 0;
        heldEntry.reason = `Rejected ${sub.trailerType} for "${sub.dropName}": ${reason}`;
      }

      this.addLog('info', `Rejected pending trailer for "${sub.dropName}" by ${sub.submittedBy}: ${reason}`);
      this.notifyChange('trailer_rejected');
      return {
        success: true,
        alreadyProcessed: false,
        message: `Rejected: ${reason}`,
        tokensAwarded: 0,
        walletBalance: currentBalance,
        submission: sub
      };
    }

    const dropTrailers = drop?.trailers || [];
    const activeSameVideo = dropTrailers.find(
      (t) => t.videoId === sub.videoId && t.status !== 'flagged_broken'
    );
    const activeSameKind =
      dropTrailers.find((t) => t.kind === subKind && t.status !== 'flagged_broken') ||
      (drop &&
      dropTrailers.length === 0 &&
      (drop.trailerVideoId || drop.trailerEmbedUrl) &&
      drop.trailerStatus !== 'flagged_broken' &&
      trailerTypeToKind(drop.trailerType) === subKind
        ? { videoId: drop.trailerVideoId }
        : undefined);
    const replaceExisting = Boolean(options?.replaceExisting);

    // 1. Same videoId already active -> mark verified without touching drop, 0 tokens
    if (activeSameVideo || (drop && drop.trailerStatus !== 'flagged_broken' && drop.trailerVideoId === sub.videoId)) {
      sub.status = 'verified';
      sub.officialSignal = 'moderate';
      sub.tokensAwarded = 0;
      sub.tokensHeld = 0;
      sub.reviewedAt = now;
      this.notifyChange('drop_trailer_updated');
      return {
        success: true,
        alreadyProcessed: false,
        message: 'This trailer is already active on the release (0 tokens).',
        tokensAwarded: 0,
        walletBalance: currentBalance,
        submission: sub,
        drop: this.getDrops().find((d) => d.id === sub.dropId)
      };
    }

    // 2. Same kind slot already has a healthy trailer and replaceExisting is false -> keep existing active trailer, 0 tokens
    if (activeSameKind && !replaceExisting && !sub.isBrokenFix) {
      sub.status = 'verified';
      sub.officialSignal = 'moderate';
      sub.tokensAwarded = 0;
      sub.tokensHeld = 0;
      sub.reviewedAt = now;
      this.notifyChange('drop_trailer_updated');
      return {
        success: true,
        alreadyProcessed: false,
        keptExisting: true,
        message: `Approved in queue, but kept the existing active ${sub.trailerType} on "${drop?.name}" (0 tokens).`,
        tokensAwarded: 0,
        walletBalance: currentBalance,
        submission: sub,
        drop: this.getDrops().find((d) => d.id === sub.dropId)
      };
    }

    // 3. Safe to attach into this kind slot (open slot, broken slot fix, or explicit replaceExisting: true)
    const isReplacement = Boolean(activeSameKind && replaceExisting);
    const rewardCategory = sub.isBrokenFix || isReplacement ? 'trailer_fix' : 'new_trailer';
    const baseReward = sub.isBrokenFix || isReplacement ? 10 : (sub.tokensHeld || getTrailerSlotReward(subKind));
    const rewardId = `trailer:${userKey}:${sub.dropId}:${subKind}`;
    const videoRewardLock = `${userKey}::${sub.dropId}::${sub.videoId}`;
    const alreadyClaimed =
      this.claimedRewardKeys.has(rewardId) ||
      this.claimedRewardKeys.has(videoRewardLock);
    const creditAmount = alreadyClaimed ? 0 : baseReward;

    sub.status = 'verified';
    sub.officialSignal = 'moderate';
    sub.tokensAwarded = creditAmount;
    sub.tokensHeld = 0;
    sub.rewardId = rewardId;
    sub.reviewedAt = now;

    if (drop) {
      const { drop: updatedDrop } = upsertDropTrailer(drop, {
        kind: subKind,
        videoId: sub.videoId,
        url: sub.canonicalUrl,
        embedUrl: sub.embedUrl,
        title: sub.videoTitle,
        channelName: sub.channelName || `YouTube (${sub.trailerType})`,
        addedByUserId: sub.submittedBy,
        status: 'verified'
      });
      updatedDrop.updatedAt = now;
      this.syncDropPrimaryFields(updatedDrop);
      this.drops.set(drop.id, updatedDrop);
    }

    if (creditAmount > 0) {
      this.claimedRewardKeys.add(videoRewardLock);
      this.awardTokens({
        contributorName: sub.submittedBy,
        tokensEarned: creditAmount,
        rewardId,
        rewardType: rewardCategory,
        status: 'credited',
        reason: isReplacement
          ? `Replaced active ${sub.trailerType} for "${sub.dropName}"`
          : `Approved ${sub.trailerType} for "${sub.dropName}"`,
        dropId: sub.dropId,
        dropName: sub.dropName,
        videoId: sub.videoId,
        trailerType: sub.trailerType,
        trailerUrl: sub.canonicalUrl
      });
    }

    const updatedBalance = this.contributorBalances.get(userKey)?.tokens || 0;
    this.notifyChange('drop_trailer_updated');
    return {
      success: true,
      alreadyProcessed: false,
      message: isReplacement
        ? `Replaced ${sub.trailerType} and credited +${creditAmount} tokens to ${sub.submittedBy}.`
        : creditAmount > 0
        ? `Approved ${sub.trailerType}! +${creditAmount} tokens credited to ${sub.submittedBy}.`
        : `Approved! ${sub.trailerType} attached (reward already claimed for this slot).`,
      tokensAwarded: creditAmount,
      walletBalance: updatedBalance,
      submission: sub,
      drop: this.getDrops().find((d) => d.id === sub.dropId)
    };
  }

  public getTokenSummary(contributorName?: string, sessionKey?: string): TokenSummary & {
    contributorBalance: number;
    contributorTrailers: number;
    contributorTrustTier: TrustTier;
  } {
    const leaderboard = Array.from(this.contributorBalances.values())
      .filter((entry) => entry.tokens > 0 || entry.trailersAdded > 0)
      .sort((a, b) => b.tokens - a.tokens || b.trailersAdded - a.trailersAdded);
    const totalTokensDistributed = leaderboard.reduce((acc, item) => acc + item.tokens, 0);
    const totalTrailersContributed = leaderboard.reduce((acc, item) => acc + item.trailersAdded, 0);

    const lookupKey = contributorName ? contributorName.trim().toLowerCase() : '';
    const me = lookupKey ? this.contributorBalances.get(lookupKey) : undefined;
    const actorKeys = [
      lookupKey ? `user:${lookupKey}` : '',
      sessionKey ? `session:${sessionKey}` : ''
    ].filter(Boolean);
    const rateUsage = this.getRateLimitUsage(actorKeys);

    return {
      totalTokensDistributed,
      totalTrailersContributed,
      leaderboard: leaderboard.slice(0, 20),
      recentRewards: this.tokenEvents.slice(0, 30),
      contributorBalance: me?.tokens || 0,
      contributorTrailers: me?.trailersAdded || 0,
      contributorTrustTier: computeTrustTier(me?.tokens || 0, me?.trailersAdded || 0),
      hourlySubmissionsUsed: rateUsage.hourlyUsed,
      hourlySubmissionsLimit: rateUsage.hourlyLimit,
      dailySubmissionsUsed: rateUsage.dailyUsed,
      dailySubmissionsLimit: rateUsage.dailyLimit,
      pendingSubmissions: this.trailerSubmissions.filter((s) => s.status === 'pending_review').slice(0, 20)
    };
  }

  public subscribe(listener: (event: { type: string; version: number; timestamp: string }) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public notifyChange(type: string) {
    this.dataVersion += 1;
    const payload = {
      type,
      version: this.dataVersion,
      timestamp: new Date().toISOString()
    };
    this.listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch {
        // ignore closed stream listeners
      }
    });
  }

  public getDataVersion(): number {
    return this.dataVersion;
  }

  public getSyncConfig(): { autoSyncEnabled: boolean; syncIntervalMinutes: number } {
    return {
      autoSyncEnabled: this.autoSyncEnabled,
      syncIntervalMinutes: this.syncIntervalMinutes
    };
  }

  public setSyncConfig(enabled?: boolean, intervalMinutes?: number) {
    if (typeof enabled === 'boolean') {
      this.autoSyncEnabled = enabled;
    }
    if (typeof intervalMinutes === 'number' && !isNaN(intervalMinutes)) {
      this.syncIntervalMinutes = Math.min(60, Math.max(1, Math.round(intervalMinutes)));
    }
    this.nextScheduledSync = new Date(Date.now() + this.syncIntervalMinutes * 60 * 1000).toISOString();
    this.addLog(
      'info',
      `Auto-update ${this.autoSyncEnabled ? `ENABLED (every ${this.syncIntervalMinutes}m)` : 'PAUSED'}.`
    );
    this.notifyChange('sync_config');
  }

  public setNextScheduledSync(isoDate: string) {
    this.nextScheduledSync = isoDate;
  }

  public setSyncState(syncing: boolean) {
    this.isSyncing = syncing;
    if (!syncing) {
      this.lastSyncTime = new Date().toISOString();
      this.nextScheduledSync = new Date(Date.now() + this.syncIntervalMinutes * 60 * 1000).toISOString();
      this.notifyChange('sync_completed');
    }
  }

  public getSyncStatus(): SyncStatus {
    const dropsArray = Array.from(this.drops.values());
    const lockedCount = dropsArray.filter(d => d.locked).length;
    const pendingCount = this.newsApprovalQueue.filter(n => n.status === 'pending_review').length;

    return {
      lastSyncTime: this.lastSyncTime,
      nextScheduledSync: this.nextScheduledSync,
      isSyncing: this.isSyncing,
      autoSyncEnabled: this.autoSyncEnabled,
      syncIntervalMinutes: this.syncIntervalMinutes,
      dataVersion: this.dataVersion,
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
          name: 'Wikipedia & Wikidata Cinema',
          id: 'wikipedia',
          status: 'online',
          itemCount: dropsArray.filter(d => d.source === 'wikipedia' || d.industry).length,
          description: 'Trusted public release registries for Hollywood & Bollywood upcoming cinema.',
          isKeyRequired: false,
          hasKey: true
        },
        {
          name: 'Upcoming Popular Games Radar',
          id: 'games',
          status: 'online',
          itemCount: dropsArray.filter(d => d.category === 'Games').length,
          description: 'Steam Coming Soon & Wikidata upcoming games scored alongside Movies, Anime, Dramas, and Books on the live trending spotlight.',
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
