import React, { useState, useEffect } from 'react';
import { Bookmark, X, BookOpen, Trash2, ArrowRight, Newspaper, Search, Film, Calendar, Bell } from 'lucide-react';
import { useBugle } from '../context/BugleContext';
import { ENTERTAINMENT_RELEASES, ReleaseItem } from '../data/releases';
import { StoryImage } from './StoryImage';
import { CountdownClock } from './CountdownClock';
import { ExcerptReaderModal } from './ExcerptReaderModal';

export const SavedStoriesDrawer: React.FC = () => {
  const {
    isSavedDrawerOpen,
    setIsSavedDrawerOpen,
    savedStories,
    toggleSave,
    clearAllSaved,
    watchlistIds,
    toggleWatchlist,
    clearWatchlist,
    navigateToStory,
    navigateTo
  } = useBugle();

  const [activeDrawerTab, setActiveDrawerTab] = useState<'articles' | 'releases'>('articles');
  const [drawerSearch, setDrawerSearch] = useState('');
  const [activeReaderItem, setActiveReaderItem] = useState<ReleaseItem | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSavedDrawerOpen) {
        setIsSavedDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSavedDrawerOpen, setIsSavedDrawerOpen]);

  if (!isSavedDrawerOpen) return null;

  // Saved Articles filter
  const filteredSavedStories = savedStories.filter((story) => {
    if (!drawerSearch.trim()) return true;
    const q = drawerSearch.toLowerCase();
    return (
      story.title.toLowerCase().includes(q) ||
      story.category.toLowerCase().includes(q) ||
      story.author.toLowerCase().includes(q)
    );
  });

  // Saved Entertainment Releases & Books
  const savedReleases = ENTERTAINMENT_RELEASES.filter((r) => watchlistIds.includes(r.id));
  const filteredSavedReleases = savedReleases.filter((r) => {
    if (!drawerSearch.trim()) return true;
    const q = drawerSearch.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.platform.toLowerCase().includes(q) ||
      (r.creatorOrAuthor && r.creatorOrAuthor.toLowerCase().includes(q))
    );
  });

  const totalBookmarkCount = savedStories.length + watchlistIds.length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={() => setIsSavedDrawerOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-md bg-[#fcfaf7] dark:bg-[#141417] text-[#1c1917] dark:text-[#f3f4f6] h-full shadow-2xl flex flex-col z-10 border-l border-[#e7e2d9] dark:border-[#262629] animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#e7e2d9] dark:border-[#262629] bg-[#faf8f4] dark:bg-[#18181c] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-red-700 text-white rounded">
              <Bookmark className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-lg text-[#1c1917] dark:text-white uppercase tracking-tight">
                Saved Bugle Dossier
              </h2>
              <p className="text-[11px] font-sans text-[#78716c] dark:text-[#a8a29e]">
                {totalBookmarkCount} bookmarked item{totalBookmarkCount === 1 ? '' : 's'} stored in localStorage
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSavedDrawerOpen(false)}
            aria-label="Close saved stories drawer"
            className="p-1.5 text-[#78716c] dark:text-[#a8a29e] hover:text-[#1c1917] dark:hover:text-white hover:bg-[#ede8df] dark:hover:bg-[#202025] rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Tabs inside Drawer */}
        <div className="flex items-center border-b border-[#e7e2d9] dark:border-[#262629] bg-[#f5f1ea] dark:bg-[#161619] p-1 gap-1 text-xs font-sans">
          <button
            onClick={() => setActiveDrawerTab('articles')}
            className={`flex-1 py-1.5 rounded font-bold transition-colors text-center ${
              activeDrawerTab === 'articles'
                ? 'bg-white dark:bg-[#242429] text-red-700 dark:text-red-400 shadow-xs'
                : 'text-[#78716c] dark:text-[#a8a29e] hover:text-[#1c1917] dark:hover:text-white'
            }`}
          >
            News Articles ({savedStories.length})
          </button>
          <button
            onClick={() => setActiveDrawerTab('releases')}
            className={`flex-1 py-1.5 rounded font-bold transition-colors text-center ${
              activeDrawerTab === 'releases'
                ? 'bg-white dark:bg-[#242429] text-red-700 dark:text-red-400 shadow-xs'
                : 'text-[#78716c] dark:text-[#a8a29e] hover:text-[#1c1917] dark:hover:text-white'
            }`}
          >
            Drops & Books ({watchlistIds.length})
          </button>
        </div>

        {/* Search within saved items */}
        <div className="p-3 border-b border-[#e7e2d9] dark:border-[#262629] bg-[#f5f1ea] dark:bg-[#161619]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#78716c] dark:text-[#a8a29e]" />
            <input
              type="text"
              value={drawerSearch}
              onChange={(e) => setDrawerSearch(e.target.value)}
              placeholder={activeDrawerTab === 'articles' ? 'Search saved scoops...' : 'Search saved drops & books...'}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-[#1e1e23] border border-[#d6cfc2] dark:border-[#2d2d34] rounded text-[#1c1917] dark:text-white placeholder-[#a8a29e] focus:outline-none focus:ring-1 focus:ring-red-600"
            />
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {activeDrawerTab === 'articles' ? (
            /* Articles Tab */
            savedStories.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#ede8df] dark:bg-[#202025] flex items-center justify-center text-[#78716c] dark:text-[#a8a29e]">
                  <Bookmark className="w-6 h-6 text-red-700 dark:text-red-400" />
                </div>
                <h3 className="font-serif-display font-bold text-base text-[#1c1917] dark:text-white">
                  No Saved Articles Yet
                </h3>
                <p className="text-xs font-sans text-[#78716c] dark:text-[#a8a29e] mt-1.5 mb-5 max-w-xs mx-auto leading-relaxed">
                  Click the bookmark button on any front-page news dispatch to save it for offline reading.
                </p>
                <button
                  onClick={() => {
                    setIsSavedDrawerOpen(false);
                    navigateTo('home');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-sans font-bold uppercase tracking-wider rounded transition-colors shadow-xs"
                >
                  <Newspaper className="w-3.5 h-3.5" />
                  <span>Browse Front Page</span>
                </button>
              </div>
            ) : filteredSavedStories.length === 0 ? (
              <div className="text-center py-10 px-4 text-xs font-sans text-[#78716c] dark:text-[#a8a29e]">
                No saved stories matching "{drawerSearch}".
              </div>
            ) : (
              filteredSavedStories.map((story) => (
                <div
                  key={story.id}
                  className="p-3 bg-white dark:bg-[#1c1c21] border border-[#e7e2d9] dark:border-[#262629] rounded hover:border-red-600/40 transition-colors group flex gap-3"
                >
                  <div
                    onClick={() => navigateToStory(story.id)}
                    className="w-20 h-20 shrink-0 rounded overflow-hidden cursor-pointer border border-[#ece7de] dark:border-[#2b2b31]"
                  >
                    <StoryImage
                      src={story.image}
                      alt={story.imageAlt}
                      aspectRatio="square"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] font-sans font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-1">
                        <span>{story.category}</span>
                        <span aria-hidden="true" className="text-[#a8a29e]">·</span>
                        <span className="font-normal text-[#78716c] dark:text-[#a8a29e]">{story.readTime}</span>
                      </div>
                      <h4
                        onClick={() => navigateToStory(story.id)}
                        className="font-serif-display font-bold text-xs sm:text-sm text-[#1c1917] dark:text-white line-clamp-2 leading-snug cursor-pointer hover:text-red-700 dark:hover:text-red-400 transition-colors"
                      >
                        {story.title}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#f0ebe1] dark:border-[#262629] text-[11px] font-sans">
                      <button
                        onClick={() => navigateToStory(story.id)}
                        className="font-bold text-red-700 dark:text-red-400 hover:text-red-800 flex items-center gap-1"
                      >
                        <span>Read Scoop</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => toggleSave(story.id)}
                        className="text-[#78716c] dark:text-[#a8a29e] hover:text-red-700 dark:hover:text-red-400 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )
          ) : (
            /* Releases & Books Watchlist Tab */
            savedReleases.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#ede8df] dark:bg-[#202025] flex items-center justify-center text-[#78716c] dark:text-[#a8a29e]">
                  <Bell className="w-6 h-6 text-red-700 dark:text-red-400" />
                </div>
                <h3 className="font-serif-display font-bold text-base text-[#1c1917] dark:text-white">
                  Your Release Watchlist is Empty
                </h3>
                <p className="text-xs font-sans text-[#78716c] dark:text-[#a8a29e] mt-1.5 mb-5 max-w-xs mx-auto leading-relaxed">
                  Click the bookmark bell on any Movie, Anime, Game, TV Drama, or Book release to track upcoming drop countdowns.
                </p>
                <button
                  onClick={() => {
                    setIsSavedDrawerOpen(false);
                    navigateTo('radar');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-sans font-bold uppercase tracking-wider rounded transition-colors shadow-xs"
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Browse Release Radar</span>
                </button>
              </div>
            ) : filteredSavedReleases.length === 0 ? (
              <div className="text-center py-10 px-4 text-xs font-sans text-[#78716c] dark:text-[#a8a29e]">
                No bookmarked releases matching "{drawerSearch}".
              </div>
            ) : (
              filteredSavedReleases.map((rel) => (
                <div
                  key={rel.id}
                  className="p-3 bg-white dark:bg-[#1c1c21] border border-[#e7e2d9] dark:border-[#262629] rounded hover:border-red-600/40 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-sans font-bold uppercase tracking-wider text-red-700 dark:text-red-400 mb-1">
                      <span>{rel.category}</span>
                      <span className="font-mono text-[#78716c] dark:text-[#a8a29e]">{rel.status}</span>
                    </div>

                    <h4
                      onClick={() => setActiveReaderItem(rel)}
                      className="font-serif-display font-bold text-xs sm:text-sm text-[#1c1917] dark:text-white line-clamp-2 leading-snug cursor-pointer hover:text-red-700 dark:hover:text-red-400 transition-colors"
                    >
                      {rel.title}
                    </h4>

                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#78716c] dark:text-[#a8a29e] mt-1">
                      <Calendar className="w-3 h-3 text-red-700 dark:text-red-400" />
                      <span>{rel.releaseDate}</span>
                      <span className="truncate">· {rel.platform}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#f0ebe1] dark:border-[#262629]">
                    <CountdownClock targetDate={rel.releaseDate} compact />

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveReaderItem(rel)}
                        className="text-xs font-sans font-bold text-red-700 dark:text-red-400 hover:text-red-800"
                      >
                        {rel.category === 'Books & Novels' ? 'Read' : 'Intel'}
                      </button>
                      <button
                        onClick={() => toggleWatchlist(rel.id, rel.title)}
                        className="text-xs font-sans text-[#78716c] dark:text-[#a8a29e] hover:text-red-700 dark:hover:text-red-400"
                        title="Remove from saved watchlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-3.5 border-t border-[#e7e2d9] dark:border-[#262629] bg-[#faf8f4] dark:bg-[#18181c] flex items-center justify-between gap-2">
          {activeDrawerTab === 'articles' ? (
            savedStories.length > 0 && (
              <>
                <button
                  onClick={() => {
                    setIsSavedDrawerOpen(false);
                    navigateTo('saved');
                  }}
                  className="text-xs font-sans font-bold text-[#1c1917] dark:text-white hover:text-red-700 dark:hover:text-red-400 flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Full News Archive View</span>
                </button>
                <button
                  onClick={clearAllSaved}
                  className="text-xs font-sans text-[#78716c] dark:text-[#a8a29e] hover:text-red-700 dark:hover:text-red-400 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear Articles ({savedStories.length})</span>
                </button>
              </>
            )
          ) : (
            watchlistIds.length > 0 && (
              <>
                <button
                  onClick={() => {
                    setIsSavedDrawerOpen(false);
                    navigateTo('radar');
                  }}
                  className="text-xs font-sans font-bold text-[#1c1917] dark:text-white hover:text-red-700 dark:hover:text-red-400 flex items-center gap-1.5"
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Full Release Radar View</span>
                </button>
                <button
                  onClick={clearWatchlist}
                  className="text-xs font-sans text-[#78716c] dark:text-[#a8a29e] hover:text-red-700 dark:hover:text-red-400 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear Watchlist ({watchlistIds.length})</span>
                </button>
              </>
            )
          )}
        </div>
      </div>

      {/* Reader Modal for inspecting drops inside drawer */}
      <ExcerptReaderModal
        item={activeReaderItem}
        onClose={() => setActiveReaderItem(null)}
      />
    </div>
  );
};
