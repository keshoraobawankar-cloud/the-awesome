export interface ReleaseDateHistoryItem {
  id: string;
  titleId: string;
  titleName: string;
  oldDate: string;
  newDate: string;
  detectedAt: string;
  reason?: string;
}

export interface UserUpdateSubmission {
  id: string;
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
  status: 'pending' | 'verified' | 'applied' | 'rejected';
  confirmationsCount: number;
  submittedAt: string;
}

export interface NewsApprovalItem {
  id: string;
  title: string;
  originalHeadline: string;
  summary: string;
  source: string;
  sourceUrl?: string;
  category: 'Movies' | 'Anime' | 'Games' | 'Dramas' | 'Books' | 'Manga' | 'General';
  status: 'pending_review' | 'approved' | 'rejected';
  isRumor: boolean;
  tags: string[];
  createdAt: string;
}

export interface DropTitle {
  id: string;
  name: string;
  category: 'Movies' | 'Anime' | 'Games' | 'Dramas' | 'Books' | 'Manga';
  date: string;
  daysRemaining: number;
  status: 'Confirmed' | 'Tentative' | 'Delayed';
  platform: string;
  gradient: string;
  accent: string;
  tagline: string;
  description: string;
  image?: string;
  source?: 'curated' | 'anilist' | 'tmdb' | 'openlibrary' | 'manual' | 'sheets' | 'wikidata';
  sourceId?: string;
  sourceUrl?: string;
  locked?: boolean; // locked from auto-overwrite
  updatedAt?: string;
  dateHistory?: ReleaseDateHistoryItem[];
}

export interface StackingNewsCard {
  id: string;
  kicker: string;
  title: string;
  deck: string;
  source: string;
  readTime: string;
  date: string;
  gradient: string;
  tag: string;
  link?: string;
  isRumor?: boolean;
  approvalId?: string;
}

export interface TimelineDrop {
  id: string;
  day: string;
  dateStr: string;
  title: string;
  category: 'Movies' | 'Anime' | 'Games' | 'Dramas' | 'Books' | 'Manga';
  status: 'Confirmed' | 'Tentative' | 'Delayed';
  platform: string;
  timeSlot: string;
  highlight: string;
  side: 'left' | 'right';
}

export interface SourceHealth {
  name: string;
  id: 'anilist' | 'tmdb' | 'openlibrary' | 'rss' | 'manual' | 'sheets' | 'wikidata';
  status: 'online' | 'ready' | 'idle' | 'key_missing' | 'error';
  lastSuccess?: string;
  itemCount: number;
  description: string;
  isKeyRequired: boolean;
  hasKey: boolean;
}

export interface ImportLogItem {
  id: string;
  runTime: string;
  durationMs: number;
  itemsAdded: number;
  itemsUpdated: number;
  dateChangesDetected: number;
  errorsCount: number;
  errorDetails?: string;
  triggeredBy: 'scheduler' | 'manual' | 'github_actions' | 'sheets_import';
}

export interface SyncStatus {
  lastSyncTime: string | null;
  nextScheduledSync: string;
  isSyncing: boolean;
  autoSyncEnabled: boolean;
  totalDrops: number;
  totalNews: number;
  lockedDropsCount: number;
  pendingApprovalsCount: number;
  dateChangesCount: number;
  sources: SourceHealth[];
  recentLogs: Array<{
    timestamp: string;
    level: 'info' | 'warn' | 'success' | 'error';
    message: string;
  }>;
  importHistory: ImportLogItem[];
}
