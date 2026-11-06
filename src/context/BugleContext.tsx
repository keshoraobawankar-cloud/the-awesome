import React, { createContext, useContext, useState, useEffect } from 'react';
import { STORIES, Story } from '../data/stories';
import { INITIAL_COMMENTS, StoryComment } from '../data/comments';
import {
  playWebShooterSound,
  playDeskSlamSound,
  playCashRegisterSound,
  playPrintingPressSound,
  speakJamesonQuote
} from '../utils/audio';
import { EDITORIAL_STORIES } from '../data/radarReferenceData';

export interface BountySubmission {
  id: string;
  photographerName: string;
  location: string;
  villainSubject: string;
  headlinePitch: string;
  imageDataUrl: string;
  imageAlt: string;
  submittedAt: string;
  verdict: 'approved' | 'lowballed' | 'rejected' | 'fake';
  stamp: 'APPROVED ($10,000)' | 'REJECTED (TOO BLURRY)' | 'FAKE (OSCORP PROPAGANDA)' | 'LOWBALLED ($175)';
  payoutAmount: string;
  jjjRemark: string;
  clarityScore?: number;
  menaceScore?: number;
  frontPageScore?: number;
}

export interface CMYKOffset {
  cyan: number;
  magenta: number;
  yellow: number;
  black: number;
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
  
  // Interactive "Bugle Lens" / CMYK Halftone Vision
  isHalftoneLensActive: boolean;
  toggleHalftoneLens: () => void;
  cmykOffset: CMYKOffset;
  setCMYKOffset: React.Dispatch<React.SetStateAction<CMYKOffset>>;
  
  // Vigilante Heatmap (Spider-Sight) & Web-Thread Connections
  isSpiderSightActive: boolean;
  toggleSpiderSight: () => void;
  hoveredEntity: string | null;
  setHoveredEntity: (entity: string | null) => void;
  
  // Comic Speech Bubble Reader Mode
  isSpeechBubbleMode: boolean;
  toggleSpeechBubbleMode: () => void;
  
  // Mechanical Newsroom Audio Desk
  isAudioDeskEnabled: boolean;
  toggleAudioDesk: () => void;
  
  // "Bribe the Editor" Release Date Shifter
  bribedReleaseOffsets: Record<string, number>;
  bribeEditorForEarlyDrop: (releaseId: string, title: string) => { quote: string; daysShifted: number };
  
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

  // Navigation & Filtering (defaults to Daily Bugle Front Page)
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

  // Initial Bounties Wall of Fame & Shame
  const INITIAL_BOUNTIES: BountySubmission[] = [
    {
      id: 'bounty_peter_frontpage',
      imageDataUrl: '/src/assets/images/bank_heist_web_aftermath_1793361604681.jpg',
      imageAlt: 'Spider-Man webbing the bank heist vault shut',
      photographerName: 'Peter Parker',
      location: 'Bank of Manhattan, 42nd St',
      villainSubject: 'Spider-Man (Menace at Large)',
      headlinePitch: 'WALL-CRAWLER CAUGHT LEAVING VAULT SHUT IN SHROUDS OF WEBBING!',
      submittedAt: 'Nov 5, 4:15 PM',
      verdict: 'approved',
      stamp: 'APPROVED ($10,000)',
      payoutAmount: '$10,000.00',
      jjjRemark: 'FINALLY! CRISP! DRAMATIC! FRONT PAGE MATERIAL! Give this kid $10,000 cash before he wises up!',
      clarityScore: 98,
      menaceScore: 95,
      frontPageScore: 99
    },
    {
      id: 'bounty_eddie_blurry',
      imageDataUrl: '/src/assets/images/oscorp_tower_investigation_1793361605278.jpg',
      imageAlt: 'Blurry figure atop Oscorp Spire',
      photographerName: 'Eddie Brock',
      location: 'Oscorp Spire Rooftop',
      villainSubject: 'Spider-Man (Unconfirmed Shadow)',
      headlinePitch: 'VIGILANTE SNEAKS ATOP OSCORP DRONE PATROL PERIMETER',
      submittedAt: 'Nov 4, 11:30 PM',
      verdict: 'rejected',
      stamp: 'REJECTED (TOO BLURRY)',
      payoutAmount: '$0.00',
      jjjRemark: 'TOO BLURRY! It looks like a smear of strawberry jam on a lens! Get out of my office before I dock your pay!',
      clarityScore: 24,
      menaceScore: 40,
      frontPageScore: 18
    },
    {
      id: 'bounty_norman_propaganda',
      imageDataUrl: '/src/assets/images/jj_jameson_editorial_1793361604257.jpg',
      imageAlt: 'Staged photo claiming glider schematics stolen',
      photographerName: 'Anonymous Corporate Tipster',
      location: 'Empire State Research Lab',
      villainSubject: 'Norman Osborn / Oscorp Board',
      headlinePitch: 'OSCORP GLIDER BLUEPRINTS ALLEGEDLY FOUND IN WEB-SLINGER HIDEOUT',
      submittedAt: 'Nov 3, 9:00 AM',
      verdict: 'fake',
      stamp: 'FAKE (OSCORP PROPAGANDA)',
      payoutAmount: '$0.00',
      jjjRemark: 'FAKE! DO I LOOK LIKE A SUCKER?! This is an Oscorp PR plant! Tell Norman Osborn I buy real scoops, not corporate propaganda!',
      clarityScore: 82,
      menaceScore: 12,
      frontPageScore: 15
    }
  ];

  // Bounty Submissions in LocalStorage
  const [submittedBounties, setSubmittedBounties] = useState<BountySubmission[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_BOUNTIES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_BOUNTIES;
  });

  // 1. CMYK Halftone Lens Filter State
  const [isHalftoneLensActive, setIsHalftoneLensActive] = useState(false);
  const [cmykOffset, setCMYKOffset] = useState<CMYKOffset>({
    cyan: 1.5,
    magenta: -1.2,
    yellow: 0.8,
    black: 0
  });

  // 2. Vigilante Heatmap (Spider-Sight) & Web Connections
  const [isSpiderSightActive, setIsSpiderSightActive] = useState(false);
  const [hoveredEntity, setHoveredEntity] = useState<string | null>(null);

  // 3. Comic Speech Bubble Reader Mode
  const [isSpeechBubbleMode, setIsSpeechBubbleMode] = useState(false);

  // 4. Mechanical Newsroom Audio Desk (default muted)
  const [isAudioDeskEnabled, setIsAudioDeskEnabled] = useState(false);

  // 5. "Bribe the Editor" Release Date Shifter offsets (releaseId -> days subtracted)
  const [bribedReleaseOffsets, setBribedReleaseOffsets] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem('daily_bugle_bribed_offsets_v1');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return {};
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

  // 1. Halftone Lens Toggle
  const toggleHalftoneLens = () => {
    setIsHalftoneLensActive((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('halftone-lens');
        showToast('Bugle Halftone Vision Enabled: 4-Color CMYK Print Mode');
      } else {
        document.documentElement.classList.remove('halftone-lens');
        showToast('Bugle Halftone Vision Disabled: Standard Offset');
      }
      return next;
    });
  };

  // 2. Spider-Sight (Vigilante Heatmap) Toggle
  const toggleSpiderSight = () => {
    setIsSpiderSightActive((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('spider-sight');
        showToast('Spider-Sight Vigilante Heatmap Active: High-Priority Releases Neon-Targeted');
      } else {
        document.documentElement.classList.remove('spider-sight');
        showToast('Vigilante Heatmap Disabled');
      }
      return next;
    });
  };

  // 3. Comic Speech Bubble Mode Toggle
  const toggleSpeechBubbleMode = () => {
    setIsSpeechBubbleMode((prev) => {
      const next = !prev;
      showToast(next ? 'Comic Speech Bubble Mode: ACTIVE' : 'Standard Editorial Paragraph View');
      return next;
    });
  };

  // 4. Mechanical Audio Desk Toggle
  const toggleAudioDesk = () => {
    setIsAudioDeskEnabled((prev) => {
      const next = !prev;
      if (next) {
        playPrintingPressSound();
        showToast('Mechanical Newsroom Audio Desk: UNMUTED');
      } else {
        showToast('Mechanical Newsroom Audio Desk: MUTED');
      }
      return next;
    });
  };

  // 5. JJJ "Bribe the Editor" Date Shifter
  const JJJ_BRIBE_QUOTES = [
    'I just screamed at the studio executive until his fax machine caught fire! Moved it forward by 7 days!',
    'I threatened to print their unrated test-screening disaster on tomorrow\'s front page! 7 days earlier! You owe me a cigar!',
    'One call to studio distribution! They bowed to the Bugle! Release advanced by a full week!',
    'I slammed my fist on the desk so hard their distributor servers shifted forward 7 days! Don\'t say Jameson never did anything for you!'
  ];

  const bribeEditorForEarlyDrop = (releaseId: string, title: string) => {
    playDeskSlamSound();
    playCashRegisterSound();
    const currentOffset = bribedReleaseOffsets[releaseId] || 0;
    const nextOffset = currentOffset + 7;
    const nextOffsets = {
      ...bribedReleaseOffsets,
      [releaseId]: nextOffset
    };
    setBribedReleaseOffsets(nextOffsets);
    try {
      localStorage.setItem('daily_bugle_bribed_offsets_v1', JSON.stringify(nextOffsets));
    } catch {
      // ignore
    }
    const quote = JJJ_BRIBE_QUOTES[Math.floor(Math.random() * JJJ_BRIBE_QUOTES.length)];
    speakJamesonQuote(quote);
    showToast(`JJJ ADVANCED RELEASE: "${title}" moved forward 7 days!`);
    return { quote, daysShifted: nextOffset };
  };

  const allStoriesPool: Story[] = [
    ...STORIES,
    {
      id: 'lead-drops-this-week',
      title: 'Five releases drop this week. One just slipped.',
      subtitle: 'Our desk tracked every confirmed date across movies, anime, games and books, so you don’t have to refresh ten sites to find out what’s out and what’s delayed.',
      category: 'Exclusives',
      author: 'The Release Desk',
      authorRole: 'Daily Bugle Pop Culture Wire',
      date: 'November 6, 2026',
      readTime: '5 min read',
      image: '/src/assets/images/bank_heist_web_aftermath_1793361604681.jpg',
      imageAlt: 'Release Radar headline cover',
      imageCaption: 'The Daily Bugle Pop Culture Release Radar desk in action.',
      tags: ['Releases', 'Movies', 'Anime', 'Games', 'Books'],
      paragraphs: [
        'Our entertainment bureau conducted a comprehensive calendar audit of every scheduled premiere across theatrical cinema, streaming, gaming digital storefronts, and major publishing imprints.',
        'While Midtown Nights and Skyline Runners 2 are locked in for their nationwide bows, award hopeful Harbor Lights has postponed its release by twenty-two days to polish its North Atlantic maritime visual effects.',
        'Subscribers can find live hourly countdowns and verified distribution channels in the sticky Release Radar sidebar.'
      ],
      featured: true
    },
    ...EDITORIAL_STORIES.map((s) => ({
      id: s.id,
      title: s.title,
      subtitle: s.deck,
      category: 'Exclusives' as const,
      author: s.author,
      authorRole: 'Daily Bugle Pop Culture Wire',
      date: s.publishedDate,
      readTime: `${s.readTimeMinutes} min read`,
      image: '/src/assets/images/jj_jameson_editorial_1793361604257.jpg',
      imageAlt: s.title,
      imageCaption: `Editorial coverage of ${s.title}`,
      tags: [s.category, 'Radar Scoop'],
      paragraphs: s.paragraphs,
      featured: false
    }))
  ];

  const savedStories = allStoriesPool.filter((s) => savedStoryIds.includes(s.id));

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
        isHalftoneLensActive,
        toggleHalftoneLens,
        cmykOffset,
        setCMYKOffset,
        isSpiderSightActive,
        toggleSpiderSight,
        hoveredEntity,
        setHoveredEntity,
        isSpeechBubbleMode,
        toggleSpeechBubbleMode,
        isAudioDeskEnabled,
        toggleAudioDesk,
        bribedReleaseOffsets,
        bribeEditorForEarlyDrop,
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
