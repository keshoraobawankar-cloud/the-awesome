import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  DropTitle, StackingNewsCard, SyncStatus, 
  NewsApprovalItem, ReleaseDateHistoryItem, UserUpdateSubmission,
  TokenSummary, TrailerType, TrailerSubmission, TrailerKind, DropTrailerItem
} from '../../server/types';
import { DROP_TITLES_12, HERO_FEATURED_DROP, STACKING_NEWS } from '../data/dropRadarData';
import { trailerTypeToKind, type TrailerTitleEvaluation } from '../utils/youtube';

const STORAGE_CONTRIBUTOR_KEY = 'aheadofyou_contributor_name_v1';
const STORAGE_TOKENS_KEY = 'aheadofyou_tokens_balance_v1';
const STORAGE_SESSION_KEY = 'aheadofyou_session_id_v1';

function getClientSessionId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_SESSION_KEY);
    if (existing) return existing;
    const created = `sess-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(STORAGE_SESSION_KEY, created);
    return created;
  } catch {
    return 'browser-session';
  }
}

export interface AttachTrailerResult {
  success: boolean;
  outcome?: 'verified' | 'pending_review' | 'duplicate' | 'rejected' | 'rate_limited';
  tokensAwarded?: number;
  tokensHeld?: number;
  alreadyAttached?: boolean;
  message?: string;
  error?: string;
  retryAfterSeconds?: number;
  submission?: TrailerSubmission;
  verification?: {
    outcome: 'verified' | 'pending_review' | 'rejected';
    officialSignal: 'strong' | 'moderate' | 'ambiguous' | 'rejected';
    videoTitle?: string;
    channelName?: string;
    reason: string;
    evaluation?: TrailerTitleEvaluation;
    checks: {
      urlNormalized: boolean;
      embeddablePublic: boolean;
      noFanEditSignals: boolean;
      titleRelevant: boolean;
      officialChannelOrCue: boolean;
    };
  };
  drop?: DropTitle;
}

interface DropDataContextType {
  drops: DropTitle[];
  heroDrop: DropTitle;
  trendingDrops: DropTitle[];
  upcomingPopularGames: DropTitle[];
  news: StackingNewsCard[];
  newsQueue: NewsApprovalItem[];
  dateHistory: ReleaseDateHistoryItem[];
  userUpdates: UserUpdateSubmission[];
  syncStatus: SyncStatus | null;
  tokenSummary: TokenSummary | null;
  contributorName: string;
  setContributorName: (name: string) => void;
  myTokens: number;
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  triggerSync: () => Promise<void>;
  updateSyncConfig: (autoSyncEnabled: boolean, syncIntervalMinutes?: number) => Promise<void>;
  resolveOfficialTrailer: (id: string) => Promise<{
    success: boolean;
    trailerUrl?: string;
    trailerEmbedUrl?: string;
    trailerSource?: string;
    trailers?: DropTrailerItem[];
  }>;
  attachOfficialTrailer: (
    id: string,
    trailerUrl: string,
    submittedBy?: string,
    trailerType?: TrailerType,
    userConfirmedOfficial?: boolean,
    kind?: TrailerKind
  ) => Promise<AttachTrailerResult>;
  flagBrokenTrailer: (
    id: string,
    reason: string,
    flaggedBy?: string,
    options?: { kind?: TrailerKind; videoId?: string }
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  reviewTrailerSubmission: (
    submissionId: string,
    action: 'approve' | 'reject',
    reason?: string,
    replaceExisting?: boolean
  ) => Promise<{
    success: boolean;
    alreadyProcessed?: boolean;
    message?: string;
    tokensAwarded?: number;
    error?: string;
    retryAfterSeconds?: number;
  }>;
  addManualDrop: (dropData: {
    name: string;
    category: 'Movies' | 'Anime' | 'Games' | 'Dramas' | 'Books' | 'Manga';
    date: string;
    platform: string;
    description: string;
    tagline?: string;
    trailerUrl?: string;
    status: 'Confirmed' | 'Tentative' | 'Delayed';
    lockField: boolean;
  }) => Promise<boolean>;
  updateDropStatus: (id: string, status: 'Confirmed' | 'Tentative' | 'Delayed') => Promise<void>;
  updateDropDate: (id: string, newDate: string, reason?: string) => Promise<boolean>;
  toggleDropLock: (id: string) => Promise<void>;
  approveNewsItem: (id: string) => Promise<boolean>;
  rejectNewsItem: (id: string) => Promise<boolean>;
  importSheetsCsv: (csvText: string) => Promise<{ added: number; errors: string[] }>;
  submitUserUpdate: (data: {
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
  }) => Promise<{
    success: boolean;
    update?: UserUpdateSubmission;
    tokensAwarded?: number;
    tokensHeld?: number;
    trailerOutcome?: string;
    error?: string;
  }>;
  confirmUserUpdate: (id: string) => Promise<{ success: boolean; confirmationsCount?: number }>;
  applyUserUpdate: (id: string) => Promise<{ success: boolean; message?: string }>;
  rejectUserUpdate: (id: string) => Promise<boolean>;
  fetchUserUpdates: () => Promise<void>;
  fetchTokens: () => Promise<void>;
}

const DropDataContext = createContext<DropDataContextType | undefined>(undefined);

export const DropDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [drops, setDrops] = useState<DropTitle[]>(DROP_TITLES_12);
  const [heroDrop, setHeroDrop] = useState<DropTitle>(HERO_FEATURED_DROP);
  const [serverTrendingDrops, setServerTrendingDrops] = useState<DropTitle[]>([]);
  const [serverFeaturedGames, setServerFeaturedGames] = useState<DropTitle[]>([]);
  const [news, setNews] = useState<StackingNewsCard[]>(STACKING_NEWS);
  const [newsQueue, setNewsQueue] = useState<NewsApprovalItem[]>([]);
  const [dateHistory, setDateHistory] = useState<ReleaseDateHistoryItem[]>([]);
  const [userUpdates, setUserUpdates] = useState<UserUpdateSubmission[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [tokenSummary, setTokenSummary] = useState<TokenSummary | null>(null);
  const [contributorName, setContributorNameState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_CONTRIBUTOR_KEY) || 'Trailer Scout';
    } catch {
      return 'Trailer Scout';
    }
  });
  const [myTokens, setMyTokens] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TOKENS_KEY);
      return saved ? Math.max(0, parseInt(saved, 10) || 0) : 0;
    } catch {
      return 0;
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const setContributorName = useCallback((name: string) => {
    const clean = name.trim().slice(0, 40) || 'Trailer Scout';
    setContributorNameState(clean);
    try {
      localStorage.setItem(STORAGE_CONTRIBUTOR_KEY, clean);
    } catch {
      // ignore
    }
  }, []);

  const syncBalanceFromSummary = useCallback((summary?: TokenSummary & { contributorBalance?: number }) => {
    if (!summary) return;
    setTokenSummary(summary);
    if (typeof summary.contributorBalance === 'number') {
      const serverBalance = Math.max(0, summary.contributorBalance);
      setMyTokens(serverBalance);
      try {
        localStorage.setItem(STORAGE_TOKENS_KEY, String(serverBalance));
      } catch {
        // ignore
      }
    }
  }, []);

  // Load drops from backend API
  const fetchDrops = useCallback(async () => {
    try {
      const res = await fetch('/api/drops');
      if (res.ok) {
        const data = await res.json();
        if (data.drops && data.drops.length > 0) {
          setDrops(data.drops);
          if (data.hero) {
            setHeroDrop(data.hero);
          }
          if (Array.isArray(data.trendingDrops)) {
            setServerTrendingDrops(data.trendingDrops);
          }
          if (Array.isArray(data.featuredGames)) {
            setServerFeaturedGames(data.featuredGames);
          }
        }
      }
    } catch {
      // Fallback
    }
  }, []);

  // Load news from backend API
  const fetchNews = useCallback(async () => {
    try {
      const res = await fetch('/api/news');
      if (res.ok) {
        const data = await res.json();
        if (data.news && data.news.length > 0) {
          setNews(data.news);
        }
      }
    } catch {
      // Fallback
    }
  }, []);

  // Load news approval queue
  const fetchNewsQueue = useCallback(async () => {
    try {
      const res = await fetch('/api/news/queue');
      if (res.ok) {
        const data = await res.json();
        if (data.queue) {
          setNewsQueue(data.queue);
        }
      }
    } catch {
      // Fallback
    }
  }, []);

  // Load date history
  const fetchDateHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/date-history');
      if (res.ok) {
        const data = await res.json();
        if (data.history) {
          setDateHistory(data.history);
        }
      }
    } catch {
      // Fallback
    }
  }, []);

  // Load sync telemetry status
  const fetchSyncStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/sync/status');
      if (res.ok) {
        const data: SyncStatus = await res.json();
        setSyncStatus(data);
        setIsSyncing(data.isSyncing);
        if (data.lastSyncTime) {
          setLastSyncedAt(data.lastSyncTime);
        }
      }
    } catch {
      // Offline fallback
    }
  }, []);

  // Load community user updates
  const fetchUserUpdates = useCallback(async () => {
    try {
      const res = await fetch('/api/user-updates');
      if (res.ok) {
        const data = await res.json();
        if (data.updates) {
          setUserUpdates(data.updates);
        }
      }
    } catch {
      // Fallback
    }
  }, []);

  // Load token summary & leaderboard (authoritative from backend ledger)
  const fetchTokens = useCallback(async () => {
    try {
      const res = await fetch(`/api/tokens?contributor=${encodeURIComponent(contributorName)}`, {
        headers: { 'x-session-id': getClientSessionId() }
      });
      if (res.ok) {
        const data = await res.json();
        syncBalanceFromSummary({
          totalTokensDistributed: data.totalTokensDistributed || 0,
          totalTrailersContributed: data.totalTrailersContributed || 0,
          leaderboard: data.leaderboard || [],
          recentRewards: data.recentRewards || [],
          contributorBalance: data.contributorBalance ?? 0,
          contributorTrailers: data.contributorTrailers ?? 0,
          contributorTrustTier: data.contributorTrustTier || 'Rookie Scout',
          hourlySubmissionsUsed: data.hourlySubmissionsUsed ?? 0,
          hourlySubmissionsLimit: data.hourlySubmissionsLimit ?? 5,
          dailySubmissionsUsed: data.dailySubmissionsUsed ?? 0,
          dailySubmissionsLimit: data.dailySubmissionsLimit ?? 15,
          pendingSubmissions: data.pendingSubmissions || []
        });
      }
    } catch {
      // Fallback
    }
  }, [contributorName, syncBalanceFromSummary]);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchDrops(),
      fetchNews(),
      fetchNewsQueue(),
      fetchDateHistory(),
      fetchUserUpdates(),
      fetchSyncStatus(),
      fetchTokens()
    ]);
    setIsLoading(false);
  }, [fetchDrops, fetchNews, fetchNewsQueue, fetchDateHistory, fetchUserUpdates, fetchSyncStatus, fetchTokens]);

  useEffect(() => {
    refreshAll();

    // Real-time Server-Sent Events stream for instant auto-updates when backend syncs or updates
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/stream');
      eventSource.onmessage = (evt) => {
        try {
          const parsed = JSON.parse(evt.data);
          if (parsed?.type && parsed.type !== 'connected') {
            refreshAll();
          }
        } catch {
          // ignore malformed SSE chunk
        }
      };
    } catch {
      // Fallback to polling if EventSource is unavailable
    }

    // Periodic full auto-refresh fallback every 30s (drops, news, queue, history, updates, status)
    const interval = setInterval(() => {
      refreshAll();
    }, 30000);

    // Refresh immediately when user returns to tab
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshAll();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refreshAll]);

  // Trigger immediate live sync
  const triggerSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync/trigger', { method: 'POST' });
      if (res.ok) {
        await refreshAll();
      }
    } catch (err) {
      console.warn('Sync trigger failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Update backend auto-sync toggle & interval
  const updateSyncConfig = async (autoSyncEnabled: boolean, syncIntervalMinutes?: number) => {
    try {
      const res = await fetch('/api/sync/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoSyncEnabled, syncIntervalMinutes })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status) setSyncStatus(data.status);
      }
    } catch (err) {
      console.warn('Failed to update sync config:', err);
    }
  };

  // Resolve official trailer from AniList / TMDB
  const resolveOfficialTrailer = async (id: string) => {
    try {
      const res = await fetch(`/api/drops/${encodeURIComponent(id)}/trailer`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          await fetchDrops();
        }
        return data;
      }
    } catch {
      // ignore
    }
    return { success: false };
  };

  // Attach official trailer URL via 5-step verification & idempotent ledger
  const attachOfficialTrailer = async (
    id: string,
    trailerUrl: string,
    submittedBy?: string,
    trailerType: TrailerType = 'Official Trailer',
    userConfirmedOfficial = true,
    kind?: TrailerKind
  ): Promise<AttachTrailerResult> => {
    const activeHandle = (submittedBy || contributorName || 'Trailer Scout').trim() || 'Trailer Scout';
    const resolvedKind = kind || trailerTypeToKind(trailerType);
    if (submittedBy && submittedBy.trim()) {
      setContributorName(submittedBy.trim());
    }
    try {
      const res = await fetch(`/api/drops/${encodeURIComponent(id)}/trailer`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': getClientSessionId(),
          'x-user-id': activeHandle
        },
        body: JSON.stringify({
          trailerUrl,
          trailerType,
          kind: resolvedKind,
          submittedBy: activeHandle,
          userConfirmedOfficial
        })
      });
      const data = await res.json().catch(() => ({}));
      const headerRetry = Number(res.headers.get('Retry-After'));
      const bodyRetry = Number(data?.retryAfterSeconds);
      const retryAfterSeconds =
        res.status === 429
          ? Number.isFinite(bodyRetry) && bodyRetry > 0
            ? bodyRetry
            : Number.isFinite(headerRetry) && headerRetry > 0
            ? headerRetry
            : 60
          : undefined;

      if (data.drop) {
        setDrops((prev) => prev.map((d) => (d.id === data.drop.id ? data.drop : d)));
      }
      if (data.tokenSummary) {
        syncBalanceFromSummary(data.tokenSummary);
      } else {
        await fetchTokens();
      }
      await fetchDrops();

      if (res.ok && data.success) {
        return {
          success: true,
          outcome: data.outcome,
          tokensAwarded: data.tokensAwarded || 0,
          tokensHeld: data.tokensHeld || 0,
          alreadyAttached: Boolean(data.alreadyAttached),
          message: data.message,
          submission: data.submission,
          verification: data.verification,
          drop: data.drop
        };
      }
      return {
        success: false,
        outcome: res.status === 429 ? 'rate_limited' : (data.outcome || 'rejected'),
        tokensAwarded: 0,
        tokensHeld: 0,
        alreadyAttached: Boolean(data.alreadyAttached),
        message: data.message,
        error: data.error || data.message || 'Trailer submission could not be verified.',
        retryAfterSeconds,
        submission: data.submission,
        verification: data.verification,
        drop: data.drop
      };
    } catch {
      return { success: false, outcome: 'rejected', error: 'Network error while verifying trailer.' };
    }
  };

  // Flag an existing trailer as broken / outdated instead of farming duplicates
  const flagBrokenTrailer = async (
    id: string,
    reason: string,
    flaggedBy?: string,
    options?: { kind?: TrailerKind; videoId?: string }
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      const res = await fetch(`/api/drops/${encodeURIComponent(id)}/trailer/flag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': getClientSessionId()
        },
        body: JSON.stringify({
          reason,
          flaggedBy: (flaggedBy || contributorName || 'Community Scout').trim(),
          kind: options?.kind,
          videoId: options?.videoId
        })
      });
      const data = await res.json().catch(() => ({}));
      if (data.drop) {
        setDrops((prev) => prev.map((d) => (d.id === data.drop.id ? data.drop : d)));
      }
      await fetchDrops();
      if (res.ok && data.success) {
        return { success: true, message: data.message };
      }
      return { success: false, error: data.error || 'Could not flag trailer.' };
    } catch {
      return { success: false, error: 'Network error while flagging trailer.' };
    }
  };

  // Approve or reject a pending_review trailer submission
  const reviewTrailerSubmission = async (
    submissionId: string,
    action: 'approve' | 'reject',
    reason?: string,
    replaceExisting?: boolean
  ): Promise<{ success: boolean; alreadyProcessed?: boolean; message?: string; tokensAwarded?: number; error?: string; retryAfterSeconds?: number }> => {
    try {
      const res = await fetch(
        `/api/trailers/${encodeURIComponent(submissionId)}/${action}?contributor=${encodeURIComponent(contributorName)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-session-id': getClientSessionId(),
            'x-user-id': contributorName
          },
          body: JSON.stringify({ reason, replaceExisting })
        }
      );
      const data = await res.json().catch(() => ({}));
      const headerRetry = Number(res.headers.get('Retry-After'));
      const bodyRetry = Number(data?.retryAfterSeconds);
      const retryAfterSeconds =
        res.status === 429
          ? Number.isFinite(bodyRetry) && bodyRetry > 0
            ? bodyRetry
            : Number.isFinite(headerRetry) && headerRetry > 0
            ? headerRetry
            : 60
          : undefined;
      if (data.drop) {
        setDrops((prev) => prev.map((d) => (d.id === data.drop.id ? data.drop : d)));
      }
      if (data.tokenSummary) {
        syncBalanceFromSummary(data.tokenSummary);
      } else {
        await fetchTokens();
      }
      await fetchDrops();
      if (res.ok && data.success) {
        return {
          success: true,
          alreadyProcessed: Boolean(data.alreadyProcessed),
          message: data.message,
          tokensAwarded: data.tokensAwarded || 0
        };
      }
      return {
        success: false,
        error: data.error || 'Could not review submission.',
        retryAfterSeconds
      };
    } catch {
      return { success: false, error: 'Network error while reviewing trailer.' };
    }
  };

  // Add manual drop entry
  const addManualDrop = async (dropData: {
    name: string;
    category: 'Movies' | 'Anime' | 'Games' | 'Dramas' | 'Books' | 'Manga';
    date: string;
    platform: string;
    description: string;
    tagline?: string;
    trailerUrl?: string;
    status: 'Confirmed' | 'Tentative' | 'Delayed';
    lockField: boolean;
  }): Promise<boolean> => {
    try {
      const res = await fetch('/api/drops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dropData)
      });
      if (res.ok) {
        await fetchDrops();
        await fetchSyncStatus();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Update status (Confirmed / Tentative / Delayed)
  const updateDropStatus = async (id: string, status: 'Confirmed' | 'Tentative' | 'Delayed') => {
    try {
      const res = await fetch(`/api/drops/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        await fetchDrops();
      }
    } catch (err) {
      console.warn('Failed to update drop status:', err);
    }
  };

  // Update date with date-shift history and delay alert draft
  const updateDropDate = async (id: string, newDate: string, reason?: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/drops/${id}/date`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: newDate, reason })
      });
      if (res.ok) {
        await fetchDrops();
        await fetchDateHistory();
        await fetchNewsQueue();
        await fetchSyncStatus();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Toggle lock
  const toggleDropLock = async (id: string) => {
    try {
      const res = await fetch(`/api/drops/${id}/lock`, { method: 'POST' });
      if (res.ok) {
        await fetchDrops();
        await fetchSyncStatus();
      }
    } catch (err) {
      console.warn('Failed to toggle lock:', err);
    }
  };

  // Approve news draft -> publishes to live broadsheet
  const approveNewsItem = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/news/${id}/approve`, { method: 'POST' });
      if (res.ok) {
        await fetchNews();
        await fetchNewsQueue();
        await fetchSyncStatus();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Reject news draft
  const rejectNewsItem = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/news/${id}/reject`, { method: 'POST' });
      if (res.ok) {
        await fetchNewsQueue();
        await fetchSyncStatus();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Import Google Sheets CSV
  const importSheetsCsv = async (csvText: string): Promise<{ added: number; errors: string[] }> => {
    try {
      const res = await fetch('/api/sheets/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvText })
      });
      if (res.ok) {
        const data = await res.json();
        await fetchDrops();
        await fetchSyncStatus();
        return {
          added: data.result?.added || 0,
          errors: data.result?.errors || []
        };
      }
      return { added: 0, errors: ['Failed to process CSV request on server.'] };
    } catch (err) {
      return { added: 0, errors: [(err as Error).message] };
    }
  };

  // Submit community user update
  const submitUserUpdate = async (data: {
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
  }): Promise<{
    success: boolean;
    update?: UserUpdateSubmission;
    tokensAwarded?: number;
    tokensHeld?: number;
    trailerOutcome?: string;
    error?: string;
  }> => {
    try {
      const res = await fetch('/api/user-updates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': getClientSessionId()
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.allUpdates) setUserUpdates(json.allUpdates);
        if (json.tokenSummary) {
          syncBalanceFromSummary(json.tokenSummary);
        } else {
          await fetchTokens();
        }
        await fetchDrops();
        await fetchNewsQueue();
        await fetchSyncStatus();
        return {
          success: true,
          update: json.update,
          tokensAwarded: json.tokensAwarded || 0,
          tokensHeld: json.tokensHeld || 0,
          trailerOutcome: json.trailerOutcome
        };
      }
      const err = await res.json();
      return { success: false, error: err.error || 'Failed to submit update.' };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  };

  // Confirm / Upvote community user update
  const confirmUserUpdate = async (id: string): Promise<{ success: boolean; confirmationsCount?: number }> => {
    try {
      const res = await fetch(`/api/user-updates/${id}/confirm`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.allUpdates) setUserUpdates(data.allUpdates);
        return { success: true, confirmationsCount: data.confirmationsCount };
      }
      return { success: false };
    } catch {
      return { success: false };
    }
  };

  // Apply community user update directly to live catalog & countdowns
  const applyUserUpdate = async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch(`/api/user-updates/${id}/apply`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.allDrops) setDrops(data.allDrops);
        if (data.allNews) setNews(data.allNews);
        if (data.allUpdates) setUserUpdates(data.allUpdates);
        await fetchDrops();
        await fetchDateHistory();
        await fetchSyncStatus();
        return { success: true, message: data.message };
      }
      const err = await res.json();
      return { success: false, message: err.error };
    } catch (e) {
      return { success: false, message: (e as Error).message };
    }
  };

  // Reject community user update
  const rejectUserUpdate = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/user-updates/${id}/reject`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.allUpdates) setUserUpdates(data.allUpdates);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const trendingDrops = useMemo(() => {
    if (serverTrendingDrops.length > 0) {
      return serverTrendingDrops;
    }
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    return drops
      .filter((d) => {
        const normalized = /^\d{4}-\d{2}-\d{2}$/.test(d.date) ? `${d.date}T23:59:59Z` : d.date;
        const ts = new Date(normalized).getTime();
        return !isNaN(ts) && ts >= todayStart.getTime();
      })
      .sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0) || a.daysRemaining - b.daysRemaining)
      .slice(0, 5);
  }, [serverTrendingDrops, drops]);

  const upcomingPopularGames = useMemo(() => {
    if (serverFeaturedGames.length > 0) {
      return serverFeaturedGames;
    }
    return trendingDrops.filter((d) => d.category === 'Games').slice(0, 4);
  }, [serverFeaturedGames, trendingDrops]);

  return (
    <DropDataContext.Provider
      value={{
        drops,
        heroDrop,
        trendingDrops,
        upcomingPopularGames,
        news,
        newsQueue,
        dateHistory,
        userUpdates,
        syncStatus,
        tokenSummary,
        contributorName,
        setContributorName,
        myTokens,
        isLoading,
        isSyncing,
        lastSyncedAt,
        triggerSync,
        updateSyncConfig,
        resolveOfficialTrailer,
        attachOfficialTrailer,
        flagBrokenTrailer,
        reviewTrailerSubmission,
        addManualDrop,
        updateDropStatus,
        updateDropDate,
        toggleDropLock,
        approveNewsItem,
        rejectNewsItem,
        importSheetsCsv,
        submitUserUpdate,
        confirmUserUpdate,
        applyUserUpdate,
        rejectUserUpdate,
        fetchUserUpdates,
        fetchTokens
      }}
    >
      {children}
    </DropDataContext.Provider>
  );
};

export const useDropData = () => {
  const context = useContext(DropDataContext);
  if (!context) {
    throw new Error('useDropData must be used within a DropDataProvider');
  }
  return context;
};
