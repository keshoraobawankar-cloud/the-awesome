import React, { createContext, useContext, useState, useEffect } from 'react';
import { STORIES, Story } from '../data/stories';
import { INITIAL_COMMENTS, StoryComment } from '../data/comments';
import { playWebShooterSound } from '../utils/audio';

export interface BountySubmission {
  id: string;
  photographerName: string;
  location: string;
  villainSubject: string;
  headlinePitch: string;
  imageDataUrl: string;
  imageAlt: string;
  submittedAt: string;
  verdict: 'approved' | 'lowballed' | 'rejected';
  payoutAmount: string;
  jjjRemark: string;
}

export type BugleTheme = 'light' | 'sepia' | 'dark';
export type BuglePage = 'home' | 'saved' | 'article' | 'about' | 'radar';

interface BugleContextType {
  savedStoryIds: string[];
  savedStories: Story[];
  toggleSave: (id: string) => void;
  isSaved: (id: string) => boolean;
  clearAllSaved: () => void;
  
  // Theme management (Light, Vintage Sepia, Dark)
  theme: BugleTheme;
  setTheme: (t: BugleTheme) => void;
  cycleTheme: () => void;
  
  // Navigation & Filtering
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  activePage: BuglePage;
  activeStoryId: string | null;
  navigateToStory: (id: string) => void;
  navigateTo: (page: BuglePage) => void;
  
  // Entertainment Release Radar & Watchlist
  watchlistIds: string[];
  toggleWatchlist: (id: string, title?: string) => void;
  isWatchlisted: (id: string) => boolean;
  clearWatchlist: () => void;
  selectedReleaseModalId: string | null;
  setSelectedReleaseModalId: (id: string | null) => void;
  
  // Modals and Drawers
  isSavedDrawerOpen: boolean;
  setIsSavedDrawerOpen: (open: boolean) => void;
  isBountyModalOpen: boolean;
  setIsBountyModalOpen: (open: boolean) => void;
  isJJJRantOpen: boolean;
  setIsJJJRantOpen: (open: boolean) => void;
  
  // Easter Egg Vigilante Mode
  isWebShooterActive: boolean;
  triggerWebShooter: () => void;
  dismissWebShooter: () => void;
  
  // Comments Management
  comments: Record<string, StoryComment[]>;
  addComment: (storyId: string, comment: Omit<StoryComment, 'id' | 'timestamp' | 'upvotes'>) => void;
  upvoteComment: (storyId: string, commentId: string) => void;
  
  // Bounty Submissions
  submittedBounties: BountySubmission[];
  addBountySubmission: (bounty: Omit<BountySubmission, 'id' | 'submittedAt'>) => BountySubmission;
  
  // Toast notifications
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const BugleContext = createContext<BugleContextType | undefined>(undefined);

const STORAGE_SAVED_KEY = 'daily_bugle_saved_v1';
const STORAGE_THEME_KEY = 'daily_bugle_theme_v2';
const STORAGE_COMMENTS_KEY = 'daily_bugle_comments_v1';
const STORAGE_BOUNTIES_KEY = 'daily_bugle_bounties_v1';
const STORAGE_WATCHLIST_KEY = 'daily_bugle_watchlist_v1';

export const BugleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Saved Stories in LocalStorage
  const [savedStoryIds, setSavedStoryIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SAVED_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return ['spiderman-threat-or-hero'];
  });

  // Watchlist & Reminders in LocalStorage (Pre-seeded with high anticipated releases)
  const [watchlistIds, setWatchlistIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_WATCHLIST_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return ['rel-gta-6', 'rel-demon-slayer', 'rel-last-king-faerie'];
  });

  const [selectedReleaseModalId, setSelectedReleaseModalId] = useState<string | null>(null);

  // 3-way Theme: light | sepia | dark
  const [theme, setThemeState] = useState<BugleTheme>(() => {
    try {
      const storedTheme = localStorage.getItem(STORAGE_THEME_KEY) as BugleTheme | null;
      if (storedTheme === 'dark' || storedTheme === 'light' || storedTheme === 'sepia') {
        return storedTheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  // Navigation & Filtering
  const [activePage, setActivePage] = useState<BuglePage>('home');
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals & Drawers state
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [isBountyModalOpen, setIsBountyModalOpen] = useState(false);
  const [isJJJRantOpen, setIsJJJRantOpen] = useState(false);
  const [isWebShooterActive, setIsWebShooterActive] = useState(false);

  // Comments in LocalStorage
  const [comments, setComments] = useState<Record<string, StoryComment[]>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_COMMENTS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return INITIAL_COMMENTS;
  });

  // Bounty Submissions in LocalStorage
  const [submittedBounties, setSubmittedBounties] = useState<BountySubmission[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_BOUNTIES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Sync theme to <html> tag
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'sepia');

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'sepia') {
      root.classList.add('sepia');
    }

    try {
      localStorage.setItem(STORAGE_THEME_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // Sync saved stories to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(savedStoryIds));
    } catch {
      // ignore
    }
  }, [savedStoryIds]);

  // Sync watchlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_WATCHLIST_KEY, JSON.stringify(watchlistIds));
    } catch {
      // ignore
    }
  }, [watchlistIds]);

  // Sync comments to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_COMMENTS_KEY, JSON.stringify(comments));
    } catch {
      // ignore
    }
  }, [comments]);

  // Sync bounties to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_BOUNTIES_KEY, JSON.stringify(submittedBounties));
    } catch {
      // ignore
    }
  }, [submittedBounties]);

  const setTheme = (t: BugleTheme) => {
    setThemeState(t);
  };

  const cycleTheme = () => {
    setThemeState((prev) => {
      if (prev === 'light') return 'sepia';
      if (prev === 'sepia') return 'dark';
      return 'light';
    });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  const toggleSave = (id: string) => {
    const story = STORIES.find((s) => s.id === id);
    const storyTitle = story ? `"${story.title.slice(0, 32)}..."` : 'Story';
    setSavedStoryIds((prev) => {
      if (prev.includes(id)) {
        showToast(`Removed from Saved Stories: ${storyTitle}`);
        return prev.filter((item) => item !== id);
      } else {
        showToast(`Saved to Bugle Archive: ${storyTitle}`);
        return [...prev, id];
      }
    });
  };

  const isSaved = (id: string) => savedStoryIds.includes(id);

  const clearAllSaved = () => {
    setSavedStoryIds([]);
    showToast('All saved stories cleared.');
  };

  // Watchlist operations
  const toggleWatchlist = (id: string, title?: string) => {
    const itemTitle = title ? `"${title.slice(0, 30)}..."` : 'Release';
    setWatchlistIds((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem(STORAGE_WATCHLIST_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      if (exists) {
        showToast(`Removed from Release Watchlist: ${itemTitle}`);
      } else {
        showToast(`Added to Release Watchlist & Reminders: ${itemTitle}`);
      }
      return next;
    });
  };

  const isWatchlisted = (id: string) => watchlistIds.includes(id);

  const clearWatchlist = () => {
    setWatchlistIds([]);
    try {
      localStorage.setItem(STORAGE_WATCHLIST_KEY, JSON.stringify([]));
    } catch {
      // ignore
    }
    showToast('Release Watchlist cleared.');
  };

  const navigateToStory = (id: string) => {
    setActiveStoryId(id);
    setActivePage('article');
    setIsSavedDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateTo = (page: BuglePage) => {
    setActivePage(page);
    setIsSavedDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Easter Egg Vigilante Web Shooter Trigger
  const triggerWebShooter = () => {
    setIsWebShooterActive(true);
    playWebShooterSound();
    showToast('THWIP! Spider-Man web-shooter activated!');
  };

  const dismissWebShooter = () => {
    setIsWebShooterActive(false);
  };

  // Add Reader Comment
  const addComment = (
    storyId: string,
    commentData: Omit<StoryComment, 'id' | 'timestamp' | 'upvotes'>
  ) => {
    const newComment: StoryComment = {
      ...commentData,
      id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: 'Just now',
      upvotes: 1
    };

    setComments((prev) => {
      const existing = prev[storyId] || [];
      return {
        ...prev,
        [storyId]: [newComment, ...existing]
      };
    });
    showToast('Comment published to Reader Reactions!');
  };

  const upvoteComment = (storyId: string, commentId: string) => {
    setComments((prev) => {
      const storyComments = prev[storyId] || [];
      return {
        ...prev,
        [storyId]: storyComments.map((c) =>
          c.id === commentId ? { ...c, upvotes: c.upvotes + 1 } : c
        )
      };
    });
  };

  // Add Bounty Submission
  const addBountySubmission = (
    bountyData: Omit<BountySubmission, 'id' | 'submittedAt'>
  ): BountySubmission => {
    const newBounty: BountySubmission = {
      ...bountyData,
      id: `bounty_${Date.now()}`,
      submittedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setSubmittedBounties((prev) => [newBounty, ...prev]);
    return newBounty;
  };

  const savedStories = STORIES.filter((s) => savedStoryIds.includes(s.id));

  return (
    <BugleContext.Provider
      value={{
        savedStoryIds,
        savedStories,
        toggleSave,
        isSaved,
        clearAllSaved,
        theme,
        setTheme,
        cycleTheme,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        activePage,
        activeStoryId,
        navigateToStory,
        navigateTo,
        watchlistIds,
        toggleWatchlist,
        isWatchlisted,
        clearWatchlist,
        selectedReleaseModalId,
        setSelectedReleaseModalId,
        isSavedDrawerOpen,
        setIsSavedDrawerOpen,
        isBountyModalOpen,
        setIsBountyModalOpen,
        isJJJRantOpen,
        setIsJJJRantOpen,
        isWebShooterActive,
        triggerWebShooter,
        dismissWebShooter,
        comments,
        addComment,
        upvoteComment,
        submittedBounties,
        addBountySubmission,
        toastMessage,
        showToast
      }}
    >
      {children}
    </BugleContext.Provider>
  );
};

export const useBugle = () => {
  const context = useContext(BugleContext);
  if (!context) {
    throw new Error('useBugle must be used within a BugleProvider');
  }
  return context;
};
