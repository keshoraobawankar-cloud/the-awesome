import React, { createContext, useContext, useState, useEffect } from 'react';
import { STORIES, Story } from '../data/stories';

interface BugleContextType {
  savedStoryIds: string[];
  savedStories: Story[];
  toggleSave: (id: string) => void;
  isSaved: (id: string) => boolean;
  clearAllSaved: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  activePage: 'home' | 'saved' | 'article' | 'about';
  activeStoryId: string | null;
  navigateToStory: (id: string) => void;
  navigateTo: (page: 'home' | 'saved' | 'about') => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const BugleContext = createContext<BugleContextType | undefined>(undefined);

const STORAGE_SAVED_KEY = 'daily_bugle_saved_v1';
const STORAGE_THEME_KEY = 'daily_bugle_theme_v1';

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
    // Default seed with 1 item so users see what saved stories look like immediately
    return ['spiderman-threat-or-hero'];
  });

  // Dark mode
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const storedTheme = localStorage.getItem(STORAGE_THEME_KEY);
      if (storedTheme === 'dark' || storedTheme === 'light') {
        return storedTheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  // Navigation & Filtering
  const [activePage, setActivePage] = useState<'home' | 'saved' | 'article' | 'about'>('home');
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync theme to <html> tag
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
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

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
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

  const navigateToStory = (id: string) => {
    setActiveStoryId(id);
    setActivePage('article');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateTo = (page: 'home' | 'saved' | 'about') => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        toggleTheme,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        activePage,
        activeStoryId,
        navigateToStory,
        navigateTo,
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
