import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  DropTitle, StackingNewsCard, SyncStatus, 
  NewsApprovalItem, ReleaseDateHistoryItem, UserUpdateSubmission 
} from '../../server/types';
import { DROP_TITLES_12, HERO_FEATURED_DROP, STACKING_NEWS } from '../data/dropRadarData';

interface DropDataContextType {
  drops: DropTitle[];
  heroDrop: DropTitle;
  news: StackingNewsCard[];
  newsQueue: NewsApprovalItem[];
  dateHistory: ReleaseDateHistoryItem[];
  userUpdates: UserUpdateSubmission[];
  syncStatus: SyncStatus | null;
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  triggerSync: () => Promise<void>;
  addManualDrop: (dropData: {
    name: string;
    category: 'Movies' | 'Anime' | 'Games' | 'Dramas' | 'Books' | 'Manga';
    date: string;
    platform: string;
    description: string;
    tagline?: string;
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
    updateType: 'date_change' | 'delay_alert' | 'platform_added' | 'new_release' | 'breaking_scoop';
    suggestedDate?: string;
    suggestedStatus?: 'Confirmed' | 'Tentative' | 'Delayed';
    category: 'Movies' | 'Anime' | 'Games' | 'Dramas' | 'Books' | 'Manga';
    platform?: string;
    details: string;
    sourceUrl?: string;
    submittedBy: string;
  }) => Promise<{ success: boolean; update?: UserUpdateSubmission; error?: string }>;
  confirmUserUpdate: (id: string) => Promise<{ success: boolean; confirmationsCount?: number }>;
  applyUserUpdate: (id: string) => Promise<{ success: boolean; message?: string }>;
  rejectUserUpdate: (id: string) => Promise<boolean>;
  fetchUserUpdates: () => Promise<void>;
}

const DropDataContext = createContext<DropDataContextType | undefined>(undefined);

export const DropDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [drops, setDrops] = useState<DropTitle[]>(DROP_TITLES_12);
  const [heroDrop, setHeroDrop] = useState<DropTitle>(HERO_FEATURED_DROP);
  const [news, setNews] = useState<StackingNewsCard[]>(STACKING_NEWS);
  const [newsQueue, setNewsQueue] = useState<NewsApprovalItem[]>([]);
  const [dateHistory, setDateHistory] = useState<ReleaseDateHistoryItem[]>([]);
  const [userUpdates, setUserUpdates] = useState<UserUpdateSubmission[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

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

  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchDrops(),
      fetchNews(),
      fetchNewsQueue(),
      fetchDateHistory(),
      fetchUserUpdates(),
      fetchSyncStatus()
    ]);
    setIsLoading(false);
  }, [fetchDrops, fetchNews, fetchNewsQueue, fetchDateHistory, fetchUserUpdates, fetchSyncStatus]);

  useEffect(() => {
    refreshAll();
    const interval = setInterval(() => {
      fetchSyncStatus();
      fetchNewsQueue();
      fetchUserUpdates();
    }, 30000);
    return () => clearInterval(interval);
  }, [refreshAll, fetchSyncStatus, fetchNewsQueue, fetchUserUpdates]);

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

  // Add manual drop entry
  const addManualDrop = async (dropData: {
    name: string;
    category: 'Movies' | 'Anime' | 'Games' | 'Dramas' | 'Books' | 'Manga';
    date: string;
    platform: string;
    description: string;
    tagline?: string;
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
    updateType: 'date_change' | 'delay_alert' | 'platform_added' | 'new_release' | 'breaking_scoop';
    suggestedDate?: string;
    suggestedStatus?: 'Confirmed' | 'Tentative' | 'Delayed';
    category: 'Movies' | 'Anime' | 'Games' | 'Dramas' | 'Books' | 'Manga';
    platform?: string;
    details: string;
    sourceUrl?: string;
    submittedBy: string;
  }): Promise<{ success: boolean; update?: UserUpdateSubmission; error?: string }> => {
    try {
      const res = await fetch('/api/user-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.allUpdates) setUserUpdates(json.allUpdates);
        await fetchNewsQueue();
        await fetchSyncStatus();
        return { success: true, update: json.update };
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

  return (
    <DropDataContext.Provider
      value={{
        drops,
        heroDrop,
        news,
        newsQueue,
        dateHistory,
        userUpdates,
        syncStatus,
        isLoading,
        isSyncing,
        lastSyncedAt,
        triggerSync,
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
        fetchUserUpdates
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
