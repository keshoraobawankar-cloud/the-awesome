import React, { useState, useEffect, useMemo } from 'react';
import {
  Film,
  Sparkles,
  Gamepad2,
  Tv,
  BookOpen,
  FileText,
  Calendar,
  Search,
  Bell,
  Check,
  Flame,
  LayoutGrid,
  Columns,
  X,
  Play,
  ArrowRight,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { ENTERTAINMENT_RELEASES, ReleaseItem, CATEGORIES_LIST } from '../data/releases';
import {
  RADAR_ITEMS,
  EDITORIAL_STORIES,
  RadarCategory,
  RadarItem,
  EditorialRadarStory
} from '../data/radarReferenceData';
import { useBugle } from '../context/BugleContext';
import { ReleaseCard } from './ReleaseCard';
import { CountdownClock } from './CountdownClock';
import { ExcerptReaderModal } from './ExcerptReaderModal';
import { playDeskSlamSound, playPaperRustleSound } from '../utils/audio';

type ActiveCategory = 'All' | 'Movies' | 'Anime' | 'Gaming' | 'TV Dramas' | 'Books & Novels' | 'Watchlist';
type ViewMode = 'broadsheet' | 'gallery';

export const ReleaseRadarView: React.FC = () => {
  const {
    watchlistIds,
    toggleWatchlist,
    isWatchlisted,
    savedStoryIds,
    toggleSave,
    isSaved,
    showToast,
    setIsSavedDrawerOpen
  } = useBugle();

  const [activeCategory, setActiveCategory] = useState<ActiveCategory>('All');
  const [viewMode, setViewMode] = useState<ViewMode>('broadsheet');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReaderItem, setSelectedReaderItem] = useState<ReleaseItem | null>(null);
  const [isLeadSaved, setIsLeadSaved] = useState(() => isSaved('lead-drops-this-week'));

  // Live ticking timestamp for real-time countdown calculations
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute fixed target drop timestamps based on session anchor
  const targetTimestamps = useMemo(() => {
    const sessionStart = Date.now();
    const map: Record<string, number> = {};
    RADAR_ITEMS.forEach((item) => {
      map[item.id] = sessionStart + item.daysOffset * 86400000;
    });
    return map;
  }, []);

  // Filtered releases for the full catalog / gallery
  const filteredReleases = useMemo(() => {
    return ENTERTAINMENT_RELEASES.filter((item) => {
      if (activeCategory === 'Watchlist') {
        if (!watchlistIds.includes(item.id)) return false;
      } else if (activeCategory !== 'All') {
        if (activeCategory === 'Movies' && item.category !== 'Movies') return false;
        if (activeCategory === 'Anime' && item.category !== 'Anime') return false;
        if (activeCategory === 'Gaming' && item.category !== 'Gaming') return false;
        if (activeCategory === 'TV Dramas' && item.category !== 'TV Dramas') return false;
        if (activeCategory === 'Books & Novels' && item.category !== 'Books & Novels' && item.category !== 'Entertainment News') return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.platform.toLowerCase().includes(q) ||
          (item.creatorOrAuthor && item.creatorOrAuthor.toLowerCase().includes(q)) ||
          item.description.toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
  }, [activeCategory, searchQuery, watchlistIds]);

  // Filtered stories for broadsheet mode
  const filteredStories = useMemo(() => {
    return EDITORIAL_STORIES.filter((story) => {
      if (activeCategory === 'Watchlist') return isSaved(story.id);
      if (activeCategory !== 'All') {
        if (activeCategory === 'Movies' && story.category !== 'Movies') return false;
        if (activeCategory === 'Anime' && story.category !== 'Anime') return false;
        if (activeCategory === 'Gaming' && story.category !== 'Games') return false;
        if (activeCategory === 'TV Dramas' && story.category !== 'Dramas') return false;
        if (activeCategory === 'Books & Novels' && story.category !== 'Books') return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          story.title.toLowerCase().includes(q) ||
          story.deck.toLowerCase().includes(q) ||
          story.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeCategory, searchQuery, isSaved]);

  // Filtered radar drop items for the broadsheet sidebar
  const filteredRadarDrops = useMemo(() => {
    return RADAR_ITEMS.filter((item) => {
      if (activeCategory === 'Watchlist') return isWatchlisted(item.id);
      if (activeCategory !== 'All') {
        if (activeCategory === 'Movies' && item.category !== 'Movies') return false;
        if (activeCategory === 'Anime' && item.category !== 'Anime') return false;
        if (activeCategory === 'Gaming' && item.category !== 'Games') return false;
        if (activeCategory === 'TV Dramas' && item.category !== 'Dramas') return false;
        if (activeCategory === 'Books & Novels' && item.category !== 'Books') return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.where.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => {
      const timeA = targetTimestamps[a.id] || 0;
      const timeB = targetTimestamps[b.id] || 0;
      return timeA - timeB;
    });
  }, [activeCategory, searchQuery, isWatchlisted, targetTimestamps]);

  // Spotlight drop for hero banner
  const spotlightItem = useMemo(() => {
    if (activeCategory === 'Watchlist') {
      const saved = ENTERTAINMENT_RELEASES.filter((r) => watchlistIds.includes(r.id));
      return saved[0] || ENTERTAINMENT_RELEASES[0];
    }
    if (activeCategory === 'All') {
      return ENTERTAINMENT_RELEASES.find((r) => r.id === 'rel-gta-6') || ENTERTAINMENT_RELEASES[0];
    }
    const catItems = ENTERTAINMENT_RELEASES.filter((r) => {
      if (activeCategory === 'Gaming') return r.category === 'Gaming';
      if (activeCategory === 'TV Dramas') return r.category === 'TV Dramas';
      if (activeCategory === 'Books & Novels') return r.category === 'Books & Novels';
      return r.category === activeCategory;
    });
    return catItems[0] || ENTERTAINMENT_RELEASES[0];
  }, [activeCategory, watchlistIds]);

  // Live countdown calculator for radar sidebar items
  const getCountdownData = (itemId: string) => {
    const target = targetTimestamps[itemId] || Date.now();
    const msRemaining = Math.max(0, target - currentTime);
    const days = Math.floor(msRemaining / 86400000);
    const hours = Math.floor((msRemaining % 86400000) / 3600000);
    const minutes = Math.floor((msRemaining % 3600000) / 60000);
    const isSoon = days < 2;

    return {
      days,
      hours,
      minutes,
      isSoon,
      displayMain: days > 0 ? `${days}d ${hours}h` : `${hours}h ${minutes}m`,
      displaySub: days > 0 ? `${minutes} min` : 'Today'
    };
  };

  const handleLeadSave = () => {
    toggleSave('lead-drops-this-week');
    setIsLeadSaved((prev) => !prev);
    playPaperRustleSound();
  };

  const handleStoryToModal = (s: EditorialRadarStory) => {
    setSelectedReaderItem({
      id: s.id,
      title: s.title,
      category: 'Entertainment News',
      platform: s.author,
      releaseDate: s.publishedDate,
      image: '/src/assets/images/jj_jameson_editorial_1793361604257.jpg',
      status: 'Confirmed',
      description: s.deck,
      creatorOrAuthor: s.author,
      format: `${s.readTimeMinutes} min read`,
      excerptTitle: s.title,
      excerptParagraphs: s.paragraphs
    });
  };

  const handleRadarToModal = (r: RadarItem) => {
    setSelectedReaderItem({
      id: r.id,
      title: r.name,
      category: (r.category === 'Games'
        ? 'Gaming'
        : r.category === 'Dramas'
        ? 'TV Dramas'
        : r.category === 'Books'
        ? 'Books & Novels'
        : r.category) as any,
      platform: r.where,
      releaseDate: new Date(targetTimestamps[r.id] || Date.now()).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      image: '/src/assets/images/bank_heist_web_aftermath_1793361604681.jpg',
      status: (r.status === 'confirmed'
        ? 'Confirmed'
        : r.status === 'delayed'
        ? 'Delayed'
        : 'Coming Soon') as any,
      description: r.description,
      format: r.platformDetail || r.where,
      excerptTitle: r.excerptTitle,
      excerptParagraphs: r.excerptParagraphs,
      themeColor: r.themeColor
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8 font-ui text-[#12142a] dark:text-[#f4f2ea] transition-colors duration-200">
      {/* Top Header: Desk Banner & View Mode Switcher */}
      <div className="mb-6 pb-4 border-b border-[#e5dfd5] dark:border-[#262629] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-ui font-bold uppercase tracking-widest text-[#c8102e] dark:text-[#ff3b52] mb-1">
            <span>THE DAILY BUGLE POP CULTURE DESK</span>
            <span aria-hidden="true" className="text-[#a8a29e]">·</span>
            <span className="font-medium text-[#555a75] dark:text-[#a3a8c4]">ENTERTAINMENT & LITERARY WIRE</span>
          </div>
          <h1 className="font-anton text-3xl sm:text-4xl text-[#12142a] dark:text-[#f4f2ea] uppercase tracking-tight">
            Release Radar: Movies, Anime, Gaming, TV & Books
          </h1>
          <p className="text-xs sm:text-sm font-ui text-[#555a75] dark:text-[#a3a8c4] mt-1">
            Live ticking countdowns, confirmed drop windows, chapter excerpts, and breaking entertainment wire reports.
          </p>
        </div>

        {/* View Mode & Watchlist Quick Launcher */}
        <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
          {/* View Mode Toggle: Broadsheet (Reference Inspired) vs. Poster Gallery */}
          <div className="flex items-center gap-1 bg-[#ede8df] dark:bg-[#1f1f23] p-1 rounded-lg text-xs font-bold font-ui">
            <button
              onClick={() => {
                setViewMode('broadsheet');
                playPaperRustleSound();
              }}
              title="Broadsheet Radar layout (with sticky countdown sidebar)"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors cursor-pointer ${
                viewMode === 'broadsheet'
                  ? 'bg-white dark:bg-[#2c2c33] text-[#12142a] dark:text-white shadow-xs'
                  : 'text-[#555a75] dark:text-[#a3a8c4] hover:text-[#12142a]'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Broadsheet Radar</span>
            </button>
            <button
              onClick={() => {
                setViewMode('gallery');
                playPaperRustleSound();
              }}
              title="Visual Card Gallery layout"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors cursor-pointer ${
                viewMode === 'gallery'
                  ? 'bg-white dark:bg-[#2c2c33] text-[#12142a] dark:text-white shadow-xs'
                  : 'text-[#555a75] dark:text-[#a3a8c4] hover:text-[#12142a]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Poster Gallery</span>
            </button>
          </div>

          {/* Watchlist Counter Button */}
          <button
            onClick={() => setActiveCategory('Watchlist')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-ui font-bold rounded transition-colors shadow-xs cursor-pointer ${
              activeCategory === 'Watchlist'
                ? 'bg-[#c8102e] text-white'
                : 'bg-[#ede8df] dark:bg-[#1f1f23] text-[#12142a] dark:text-[#f4f2ea] hover:bg-[#c8102e] hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Watchlist</span>
            <span className="px-1.5 py-0.2 bg-black/20 text-white rounded text-[11px] tabular-nums font-bold">
              {watchlistIds.length}
            </span>
          </button>
        </div>
      </div>

      {/* Featured Spotlight Banner (Thematic Hero Drop) */}
      {spotlightItem && (
        <div
          className={`mb-8 rounded-xl overflow-hidden bg-gradient-to-r ${
            spotlightItem.themeColor || 'from-red-900 to-stone-900'
          } text-white shadow-lg border border-black/20 relative`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />

          <div className="relative z-10 p-6 sm:p-8 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
            {/* Left: Spotlight Info */}
            <div className="max-w-xl">
              <div className="flex items-center gap-2 text-xs font-anton uppercase tracking-widest text-white/90 mb-2">
                <span className="bg-black/50 backdrop-blur-xs px-2.5 py-0.5 rounded font-bold">
                  🔥 SPOTLIGHT {activeCategory === 'All' ? 'RELEASE' : activeCategory.toUpperCase()}
                </span>
                <span className="bg-white/20 px-2 py-0.5 rounded font-bold">
                  {spotlightItem.status}
                </span>
              </div>

              <h2 className="font-anton text-3xl sm:text-5xl text-white leading-tight mb-2 uppercase tracking-wide">
                {spotlightItem.title}
              </h2>

              {spotlightItem.creatorOrAuthor && (
                <div className="text-xs font-ui text-amber-200 mb-2 font-semibold">
                  By {spotlightItem.creatorOrAuthor} · {spotlightItem.platform}
                </div>
              )}

              <p className="font-tx text-sm sm:text-base text-white/90 leading-relaxed mb-5 line-clamp-2">
                {spotlightItem.description}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setSelectedReaderItem(spotlightItem)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-stone-900 hover:bg-amber-100 rounded text-xs font-ui font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>
                    {spotlightItem.category === 'Books & Novels' ? 'Read Chapter Excerpt' : 'Full Intel & Coverage'}
                  </span>
                </button>

                <button
                  onClick={() => toggleWatchlist(spotlightItem.id, spotlightItem.title)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-ui font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    isWatchlisted(spotlightItem.id)
                      ? 'bg-[#c8102e] text-white'
                      : 'bg-black/40 hover:bg-black/60 text-white border border-white/20'
                  }`}
                >
                  {isWatchlisted(spotlightItem.id) ? <Check className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                  <span>{isWatchlisted(spotlightItem.id) ? 'Saved in Watchlist' : 'Set Drop Reminder'}</span>
                </button>
              </div>
            </div>

            {/* Right: Live Ticking Countdown Box */}
            <div className="bg-black/60 backdrop-blur-md p-5 rounded-lg border border-white/20 lg:w-80 text-center shrink-0">
              <div className="text-[11px] font-ui font-bold uppercase tracking-widest text-[#ffcf2e] mb-1">
                COUNTDOWN TO DROP DATE
              </div>
              <div className="font-anton text-2xl text-white mb-3">
                {spotlightItem.releaseDate}
              </div>

              {/* Live Clock Component */}
              <CountdownClock targetDate={spotlightItem.releaseDate} />

              <div className="mt-3 pt-2.5 border-t border-white/10 text-xs font-ui text-white/80">
                Verified on: {spotlightItem.platform}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter Chips & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-7">
        {/* Category Chips (Inspired by reference, styled cleanly) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {(['All', 'Movies', 'Anime', 'Gaming', 'TV Dramas', 'Books & Novels'] as const).map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  playPaperRustleSound();
                }}
                className={`px-3.5 py-1.5 rounded-full font-ui font-bold text-xs whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#c8102e] text-white shadow-xs'
                    : 'bg-[#ede8df] dark:bg-[#1a1c2e] text-[#12142a] dark:text-[#f4f2ea] hover:bg-[#c8102e] hover:text-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#555a75] dark:text-[#a3a8c4]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search drops, studios, titles..."
            className="w-full pl-8 pr-7 py-1.5 text-xs font-ui bg-white dark:bg-[#171a30] border border-[#cfd3e0] dark:border-[#2b3052] rounded-full focus:outline-none focus:border-[#c8102e] text-[#12142a] dark:text-[#f4f2ea]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#555a75] hover:text-[#12142a]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Conditional Rendering: Broadsheet Mode vs Gallery Mode */}
      {viewMode === 'broadsheet' ? (
        /* ================= BROADSHEET RADAR MODE (2-COLUMN REFERENCE INSPIRED) ================= */
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-8 items-start">
          {/* Left Column: News Stories & Lead */}
          <section id="news" aria-label="News" className="min-w-0">
            {/* Lead Exclusive Article */}
            <article className="border-b border-[#cfd3e0] dark:border-[#2b3052] pb-6">
              <div className="font-ui font-bold text-xs uppercase tracking-wider text-[#c8102e] dark:text-[#ff3b52]">
                Front page · Exclusive
              </div>

              <h2 className="font-anton text-3xl sm:text-5xl text-[#12142a] dark:text-[#f4f2ea] uppercase leading-[1.05] my-2 max-w-[18ch] tracking-wide">
                Five releases drop this week. One just slipped.
              </h2>

              <p className="font-tx text-base sm:text-lg leading-[1.5] text-[#12142a] dark:text-[#f4f2ea] max-w-[60ch] mb-4">
                Our desk tracked every confirmed date across movies, anime, games and books, so you don’t have to refresh ten sites to find out what’s out and what’s delayed.
              </p>

              {/* Halftone / Comic Newsprint Cover Graphic */}
              <div
                onClick={() => {
                  setSelectedReaderItem({
                    id: 'lead-drops-this-week',
                    title: 'Five releases drop this week. One just slipped.',
                    category: 'Entertainment News',
                    platform: 'The Release Desk',
                    releaseDate: 'November 6, 2026',
                    image: '/src/assets/images/bank_heist_web_aftermath_1793361604681.jpg',
                    status: 'Confirmed',
                    description: 'Our entertainment bureau conducted a comprehensive calendar audit of every scheduled premiere across theatrical cinema, streaming, gaming digital storefronts, and major publishing imprints.',
                    format: 'Special Bureau Investigation',
                    excerptTitle: 'Special Report: The Autumn Drop Calendar',
                    excerptParagraphs: [
                      'Our entertainment bureau conducted a comprehensive calendar audit of every scheduled premiere across theatrical cinema, streaming, gaming digital storefronts, and major publishing imprints.',
                      'While Midtown Nights and Skyline Runners 2 are locked in for their nationwide bows, award hopeful Harbor Lights has postponed its release by twenty-two days to polish its North Atlantic maritime visual effects.',
                      'Subscribers can find live hourly countdowns and verified distribution channels in the sticky Release Radar sidebar.'
                    ]
                  });
                }}
                role="img"
                aria-label="Illustration of a flash of yellow light over red halftone"
                className="aspect-[16/7] rounded-lg my-4 relative overflow-hidden bg-bugle-halftone shadow-md cursor-pointer group transition-transform hover:scale-[1.008]"
              >
                <b className="absolute left-5 bottom-4 font-anton text-2xl sm:text-4xl text-white uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  This week’s big drops
                </b>
                <div className="absolute top-3.5 right-4 bg-black/50 backdrop-blur-xs text-white text-[11px] font-ui font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                  Read Full Intel Dossier
                </div>
              </div>

              <div className="font-ui font-medium text-xs sm:text-sm text-[#555a75] dark:text-[#a3a8c4] flex items-center gap-3.5 flex-wrap">
                <span>By the Release Desk</span>
                <span aria-hidden="true">·</span>
                <span>5 min read</span>
                <span aria-hidden="true">·</span>
                <button
                  onClick={handleLeadSave}
                  aria-pressed={isLeadSaved}
                  className={`border border-[#12142a] dark:border-[#f4f2ea] rounded px-3 py-1 font-ui font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                    isLeadSaved
                      ? 'bg-[#12142a] dark:bg-[#f4f2ea] text-white dark:text-[#12142a]'
                      : 'bg-transparent text-[#12142a] dark:text-[#f4f2ea] hover:bg-[#12142a] hover:text-white dark:hover:bg-[#f4f2ea] dark:hover:text-[#12142a]'
                  }`}
                >
                  {isLeadSaved ? 'Saved' : 'Save story'}
                </button>
              </div>
            </article>

            {/* Stories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {filteredStories.length > 0 ? (
                filteredStories.map((s) => {
                  const storySaved = isSaved(s.id);
                  return (
                    <article
                      key={s.id}
                      className="border-t-2 border-[#12142a] dark:border-[#2b3052] pt-3 flex flex-col gap-1.5 group"
                    >
                      <div className="font-ui font-bold text-xs uppercase tracking-wider text-[#c8102e] dark:text-[#ff3b52]">
                        {s.category}
                      </div>

                      <h3
                        onClick={() => handleStoryToModal(s)}
                        className="font-anton text-xl sm:text-2xl leading-[1.1] text-[#12142a] dark:text-[#f4f2ea] uppercase group-hover:text-[#c8102e] dark:group-hover:text-[#ff3b52] transition-colors cursor-pointer"
                      >
                        {s.title}
                      </h3>

                      <p className="font-tx text-sm text-[#555a75] dark:text-[#a3a8c4] leading-normal line-clamp-3">
                        {s.deck}
                      </p>

                      <div className="flex justify-between items-center mt-auto pt-2 font-ui font-medium text-xs text-[#555a75] dark:text-[#a3a8c4]">
                        <span>{s.readTimeMinutes} min read</span>
                        <button
                          onClick={() => {
                            toggleSave(s.id);
                            playPaperRustleSound();
                          }}
                          aria-pressed={storySaved}
                          className={`font-ui font-bold text-xs px-2 py-1 transition-colors cursor-pointer ${
                            storySaved
                              ? 'text-[#c8102e] dark:text-[#ff3b52]'
                              : 'text-[#12142a] dark:text-[#f4f2ea] hover:text-[#c8102e]'
                          }`}
                        >
                          {storySaved ? 'Saved' : 'Save'}
                        </button>
                      </div>
                    </article>
                  );
                })
              ) : (
                <p className="col-span-full font-ui font-medium text-sm text-[#555a75] dark:text-[#a3a8c4] py-8 text-center bg-black/5 dark:bg-white/5 rounded-lg">
                  No stories found for "{activeCategory}".
                </p>
              )}
            </div>
          </section>

          {/* Right Column: Sticky Release Radar */}
          <aside
            id="radar"
            aria-label="Release Radar"
            className="bg-white dark:bg-[#171a30] border-2 border-[#12142a] dark:border-[#2b3052] rounded-xl p-5 sticky top-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-anton text-3xl font-normal text-[#12142a] dark:text-[#f4f2ea] uppercase leading-none">
                Release Radar
              </h2>
              <span className="text-[10px] font-ui font-bold uppercase tracking-wider bg-[#c8102e] text-white px-2 py-0.5 rounded-full">
                LIVE RADAR
              </span>
            </div>

            <p className="font-ui font-medium text-xs sm:text-sm text-[#555a75] dark:text-[#a3a8c4] mt-1 mb-3">
              Next drops, soonest first. Live ticking countdowns.
            </p>

            {/* Radar Drop Items List */}
            <div className="divide-y divide-[#cfd3e0] dark:divide-[#2b3052] max-h-[620px] overflow-y-auto pr-1">
              {filteredRadarDrops.length > 0 ? (
                filteredRadarDrops.map((r) => {
                  const cd = getCountdownData(r.id);
                  const itemSaved = isWatchlisted(r.id);

                  return (
                    <div
                      key={r.id}
                      className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 py-3 group"
                    >
                      {/* Item Title & Click to Inspect */}
                      <h4
                        onClick={() => handleRadarToModal(r)}
                        className="font-ui font-bold text-sm sm:text-base leading-[1.25] text-[#12142a] dark:text-[#f4f2ea] group-hover:text-[#c8102e] dark:group-hover:text-[#ff3b52] transition-colors cursor-pointer"
                      >
                        {r.name}
                      </h4>

                      {/* Live Tabular Countdown */}
                      <div
                        className={`row-span-2 col-start-2 text-right font-anton text-2xl sm:text-3xl tabular-nums leading-none tracking-tight ${
                          cd.isSoon
                            ? 'text-[#c8102e] dark:text-[#ff3b52]'
                            : 'text-[#12142a] dark:text-[#f4f2ea]'
                        }`}
                      >
                        {cd.displayMain}
                        <small className="block font-ui font-medium text-[11px] text-[#555a75] dark:text-[#a3a8c4]">
                          {cd.displaySub}
                        </small>
                      </div>

                      {/* Metadata Row: Category · Status · Where */}
                      <div className="font-ui font-medium text-xs text-[#555a75] dark:text-[#a3a8c4] flex items-center gap-1.5 flex-wrap">
                        <span>{r.category}</span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={`font-bold capitalize ${
                            r.status === 'confirmed'
                              ? 'text-[#16794a] dark:text-[#4ade98]'
                              : r.status === 'tentative'
                              ? 'text-[#a85a00] dark:text-[#ffb347]'
                              : 'text-[#c8102e] dark:text-[#ff6b7d]'
                          }`}
                        >
                          {r.status}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate max-w-[120px]">{r.where}</span>
                      </div>

                      {/* Working Save Button */}
                      <div className="col-span-1 pt-1">
                        <button
                          onClick={() => {
                            toggleWatchlist(r.id, r.name);
                            playPaperRustleSound();
                          }}
                          aria-pressed={itemSaved}
                          className={`font-ui font-bold text-xs p-0 transition-colors cursor-pointer ${
                            itemSaved
                              ? 'text-[#c8102e] dark:text-[#ff3b52]'
                              : 'text-[#12142a] dark:text-[#f4f2ea] hover:text-[#c8102e]'
                          }`}
                        >
                          {itemSaved ? 'Saved' : 'Save'}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="font-ui font-medium text-sm text-[#555a75] dark:text-[#a3a8c4] py-6 text-center">
                  Nothing on the radar for {activeCategory} right now.
                </p>
              )}
            </div>

            {/* Quick Watchlist Drawer Trigger */}
            <div className="mt-4 pt-3 border-t border-[#cfd3e0] dark:border-[#2b3052] flex items-center justify-between text-xs font-ui">
              <span className="text-[#555a75] dark:text-[#a3a8c4]">
                Tracking <strong>{watchlistIds.length}</strong> drop reminders
              </span>
              <button
                onClick={() => setIsSavedDrawerOpen(true)}
                className="font-bold text-[#c8102e] dark:text-[#ff3b52] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Dossier</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </aside>
        </div>
      ) : (
        /* ================= FULL VISUAL POSTER GALLERY MODE ================= */
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-[#cfd3e0] dark:border-[#2b3052]">
            <h3 className="font-anton text-2xl uppercase tracking-wide text-[#12142a] dark:text-[#f4f2ea]">
              {activeCategory === 'All' ? 'All Confirmed Releases' : `${activeCategory} Drop Catalog`}
            </h3>
            <span className="text-xs font-ui text-[#555a75] dark:text-[#a3a8c4]">
              {filteredReleases.length} releases tracked
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReleases.map((item) => (
              <ReleaseCard
                key={item.id}
                item={item}
                onSelect={(selected) => setSelectedReaderItem(selected)}
                isBookmarked={isWatchlisted(item.id)}
                onToggleBookmark={(id, title) => toggleWatchlist(id, title)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Reader Modal for Chapter Excerpts and Wire Scoops */}
      <ExcerptReaderModal
        item={selectedReaderItem}
        onClose={() => setSelectedReaderItem(null)}
      />
    </div>
  );
};
