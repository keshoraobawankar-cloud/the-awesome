import type { TrailerKind, DropTrailerItem } from '../src/utils/youtube';

export type { TrailerKind, DropTrailerItem };

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
  updateType: 'date_change' | 'delay_alert' | 'platform_added' | 'new_release' | 'breaking_scoop' | 'official_trailer';
  suggestedDate?: string;
  suggestedStatus?: 'Confirmed' | 'Tentative' | 'Delayed';
  category: 'Movies' | 'Anime' | 'Games' | 'Dramas' | 'Books' | 'Manga';
  platform?: string;
  details: string;
  sourceUrl?: string;
  trailerUrl?: string;
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

export type TrailerType = 'Official Teaser' | 'Official Trailer' | 'Gameplay / Overview' | 'Final Trailer';

export type TrailerSubmissionStatus = 'verified' | 'pending_review' | 'rejected' | 'flagged_broken';

export type TrustTier = 'Rookie Scout' | 'Verified Scout' | 'Trusted Curator' | 'Master Auditor';

export interface TrailerSubmission {
  id: string;
  dropId: string;
  dropName: string;
  videoId: string;
  provider: 'youtube';
  canonicalUrl: string;
  embedUrl: string;
  kind?: TrailerKind;
  trailerType: TrailerType;
  submittedBy: string;
  userConfirmedOfficial: boolean;
  videoTitle?: string;
  channelName?: string;
  officialSignal: 'strong' | 'moderate' | 'ambiguous' | 'rejected';
  status: TrailerSubmissionStatus;
  isBrokenFix?: boolean;
  tokensAwarded: number;
  tokensHeld: number;
  rejectionReason?: string;
  flagReason?: string;
  flaggedBy?: string;
  rewardId?: string;
  createdAt: string;
  reviewedAt?: string;
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
  industry?: 'Hollywood' | 'Bollywood';
  trustedSourceLabel?: string;
  source?: 'curated' | 'anilist' | 'tmdb' | 'openlibrary' | 'manual' | 'sheets' | 'wikidata' | 'wikipedia' | 'steam';
  sourceId?: string;
  sourceUrl?: string;
  popularityScore?: number;
  isPopular?: boolean;
  trailerUrl?: string;
  trailerEmbedUrl?: string;
  trailerSource?: string;
  trailerAddedBy?: string;
  trailerType?: TrailerType;
  trailerVideoId?: string;
  trailerStatus?: 'verified' | 'pending_review' | 'flagged_broken';
  trailerBrokenFlag?: {
    flaggedBy: string;
    reason: string;
    flaggedAt: string;
  };
  trailers?: DropTrailerItem[];
  locked?: boolean; // locked from auto-overwrite
  updatedAt?: string;
  dateHistory?: ReleaseDateHistoryItem[];
}

export interface TokenRewardEvent {
  id: string;
  rewardId?: string;
  contributorName: string;
  tokensEarned: number;
  reason: string;
  rewardType?: 'new_trailer' | 'trailer_fix' | 'pending_hold' | 'rejected_attempt';
  status?: 'credited' | 'held' | 'rejected';
  dropId?: string;
  dropName?: string;
  videoId?: string;
  trailerType?: TrailerType;
  trailerUrl?: string;
  createdAt: string;
}

export interface ContributorLeaderboardEntry {
  contributorName: string;
  tokens: number;
  trailersAdded: number;
  trustTier?: TrustTier;
  rejectedAttempts?: number;
  lastActiveAt: string;
}

export interface TokenSummary {
  totalTokensDistributed: number;
  totalTrailersContributed: number;
  leaderboard: ContributorLeaderboardEntry[];
  recentRewards: TokenRewardEvent[];
  contributorBalance?: number;
  contributorTrailers?: number;
  contributorTrustTier?: TrustTier;
  hourlySubmissionsUsed?: number;
  hourlySubmissionsLimit?: number;
  dailySubmissionsUsed?: number;
  dailySubmissionsLimit?: number;
  pendingSubmissions?: TrailerSubmission[];
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
  id: 'anilist' | 'tmdb' | 'openlibrary' | 'rss' | 'manual' | 'sheets' | 'wikidata' | 'wikipedia' | 'games';
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
  syncIntervalMinutes: number;
  dataVersion: number;
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
