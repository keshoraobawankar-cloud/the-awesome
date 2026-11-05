import React, { useMemo, useState } from 'react';
import { Camera, Search, AlertCircle, RefreshCw, DollarSign, ArrowRight, Film, BookOpen, Bell, Sparkles } from 'lucide-react';
import { STORIES, Story } from '../data/stories';
import { ENTERTAINMENT_RELEASES, ReleaseItem } from '../data/releases';
import { useBugle } from '../context/BugleContext';
import { FeaturedStory } from './FeaturedStory';
import { StoryCard } from './StoryCard';
import { FilterBar } from './FilterBar';
import { ReleaseCard } from './ReleaseCard';
import { ExcerptReaderModal } from './ExcerptReaderModal';

export const HomeView: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    setIsBountyModalOpen,
    isWatchlisted,
    toggleWatchlist,
    watchlistIds,
    navigateTo
  } = useBugle();

  const [selectedReaderItem, setSelectedReaderItem] = useState<ReleaseItem | null>(null);

  // Check if active category is one of the new entertainment desks
  const isEntertainmentDesk = selectedCategory === 'Entertainment Desk';
  const isBooksAndNews = selectedCategory === 'Books & News';
  const isReleaseSection = isEntertainmentDesk || isBooksAndNews;

  // Filtered stories calculation (for traditional news categories)
  const filteredStories = useMemo(() => {
    if (isReleaseSection) return [];

    return STORIES.filter((story) => {
      const matchesCategory =
        selectedCategory === 'All' || story.category.toLowerCase() === selectedCategory.toLowerCase();

      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesCategory;

      const matchesSearch =
        story.title.toLowerCase().includes(query) ||
        story.subtitle.toLowerCase().includes(query) ||
        story.author.toLowerCase().includes(query) ||
        story.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        story.paragraphs.some((p) => p.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, isReleaseSection]);

  // Filtered entertainment releases (when Entertainment Desk or Books & News tab is clicked)
  const filteredEntertainmentReleases = useMemo(() => {
    if (!isReleaseSection) return [];

    return ENTERTAINMENT_RELEASES.filter((item) => {
      // Category segregation
      let matchesDesk = false;
      if (isEntertainmentDesk) {
        matchesDesk =
          item.category === 'Movies' ||
          item.category === 'Anime' ||
          item.category === 'Gaming' ||
          item.category === 'TV Dramas';
      } else if (isBooksAndNews) {
        matchesDesk =
          item.category === 'Books & Novels' ||
          item.category === 'Entertainment News';
      }

      if (!matchesDesk) return false;

      // Search Query filter
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
  }, [isReleaseSection, isEntertainmentDesk, isBooksAndNews, searchQuery]);

  // Count calculations for FilterBar
  const { totalCount, filteredCount } = useMemo(() => {
    if (isEntertainmentDesk) {
      const allEnt = ENTERTAINMENT_RELEASES.filter(
        (r) => r.category === 'Movies' || r.category === 'Anime' || r.category === 'Gaming' || r.category === 'TV Dramas'
      );
      return { totalCount: allEnt.length, filteredCount: filteredEntertainmentReleases.length };
    }
    if (isBooksAndNews) {
      const allBooks = ENTERTAINMENT_RELEASES.filter(
        (r) => r.category === 'Books & Novels' || r.category === 'Entertainment News'
      );
      return { totalCount: allBooks.length, filteredCount: filteredEntertainmentReleases.length };
    }
    return { totalCount: STORIES.length, filteredCount: filteredStories.length };
  }, [isEntertainmentDesk, isBooksAndNews, filteredEntertainmentReleases.length, filteredStories.length]);

  // Featured story for default Front Page view
  const isDefaultView = selectedCategory === 'All' && !searchQuery.trim();
  const featuredStory = isDefaultView
    ? STORIES.find((s) => s.featured) || STORIES[0]
    : null;

  const gridStories = isDefaultView
    ? filteredStories.filter((s) => s.id !== featuredStory?.id)
    : filteredStories;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
      {/* Front-Page Filter & Search Strip */}
      <FilterBar
        totalCount={totalCount}
        filteredCount={filteredCount}
      />

      {/* Render Entertainment Desk or Books & News Grid when selected */}
      {isReleaseSection ? (
        <div
          key={selectedCategory}
          className="transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-2"
        >
          {/* Section Masthead Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-3 border-b-2 border-[#1c1917] dark:border-[#262629]">
            <div>
              <div className="flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-widest text-red-700 dark:text-red-400 mb-1">
                {isEntertainmentDesk ? (
                  <>
                    <Film className="w-3.5 h-3.5" />
                    <span>DAILY BUGLE ENTERTAINMENT WIRE</span>
                    <span aria-hidden="true" className="text-[#a8a29e]">·</span>
                    <span className="font-normal text-[#78716c] dark:text-[#a8a29e]">MOVIES, ANIME, GAMING & TV</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>THE LITERARY & POP CULTURE DESK</span>
                    <span aria-hidden="true" className="text-[#a8a29e]">·</span>
                    <span className="font-normal text-[#78716c] dark:text-[#a8a29e]">BOOKS, NOVELS & WIRE SCOOPS</span>
                  </>
                )}
              </div>
              <h2 className="font-headline font-bold text-2xl sm:text-3xl text-[#1c1917] dark:text-white uppercase tracking-tight">
                {isEntertainmentDesk
                  ? 'Entertainment Desk: Blockbuster Releases & Drops'
                  : 'Books & Pop Culture News: Bestsellers & Wire Dispatches'}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateTo('radar')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-sans font-bold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950/60 rounded hover:bg-red-700 hover:text-white transition-colors"
              >
                <span>Full Release Radar View</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Grid of Release Cards */}
          {filteredEntertainmentReleases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredEntertainmentReleases.map((item) => (
                <ReleaseCard
                  key={item.id}
                  item={item}
                  onSelect={(selected) => setSelectedReaderItem(selected)}
                  isBookmarked={isWatchlisted(item.id)}
                  onToggleBookmark={(id, title) => toggleWatchlist(id, title)}
                />
              ))}
            </div>
          ) : (
            <div className="max-w-lg mx-auto my-12 text-center p-8 bg-white dark:bg-[#18181c] border border-[#e5dfd5] dark:border-[#262629] rounded">
              <Search className="w-8 h-8 mx-auto mb-3 text-red-700 dark:text-red-400" />
              <h3 className="font-serif-display font-bold text-lg text-[#1c1917] dark:text-white">
                No Releases Found Matching "{searchQuery}"
              </h3>
              <p className="text-xs text-[#78716c] dark:text-[#a8a29e] mt-1 mb-4">
                Try searching by title, platform, or franchise.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-bold uppercase tracking-wider rounded"
              >
                Clear Search Query
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Regular News Sections */
        filteredStories.length > 0 ? (
          <div
            key={`${selectedCategory}_${searchQuery}`}
            className="transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-2"
          >
            {/* Featured Lead Story (Only in default front page view) */}
            {featuredStory && (
              <FeaturedStory story={featuredStory} />
            )}

            {/* Section Heading for News Grid */}
            <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-[#1c1917] dark:border-[#262629]">
              <div className="flex items-center gap-3">
                <h2 className="font-headline font-bold text-xl sm:text-2xl text-[#1c1917] dark:text-white uppercase tracking-tight">
                  {selectedCategory === 'All' && !searchQuery
                    ? 'Today’s Headlines & Investigations'
                    : `Results for ${selectedCategory !== 'All' ? selectedCategory : 'All Sections'} ${
                        searchQuery ? `"${searchQuery}"` : ''
                      }`}
                </h2>
              </div>
              <span className="text-xs font-sans text-[#78716c] dark:text-[#a8a29e] hidden sm:inline">
                Daily Bugle Wire Service · {filteredStories.length} Dispatches
              </span>
            </div>

            {/* Grid of Story Cards with Staggered Entrance */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {gridStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>

            {/* Newspaper Editorial Banner: Peter Parker Photo Callout ($10,000 Bounty) */}
            <div className="mt-14 p-6 sm:p-7 bg-[#faf8f4] dark:bg-[#18181c] border-2 border-dashed border-red-700/50 dark:border-red-600/40 rounded flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 flex items-center justify-center shrink-0 mt-1">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-red-700 dark:text-red-400">
                      BUGLE PHOTO BOUNTY IN EFFECT
                    </span>
                    <span className="text-[10px] font-bold bg-red-700 text-white px-2 py-0.2 rounded-xs">
                      $10,000 CASH
                    </span>
                  </div>
                  <h4 className="font-serif-display font-bold text-lg text-[#1c1917] dark:text-white mt-0.5">
                    Got Unmasked Photographs of Spider-Man?
                  </h4>
                  <p className="text-xs sm:text-sm font-sans text-[#57534e] dark:text-[#a8a29e] mt-1 max-w-xl leading-relaxed">
                    The Daily Bugle pays immediate top dollar for crisp, unpublished prints and video footage. Upload your shutterbug scoop directly to J. Jonah Jameson’s photo desk!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBountyModalOpen(true)}
                className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white text-xs font-sans font-bold uppercase tracking-wider rounded transition-colors whitespace-nowrap shrink-0 shadow-sm flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                <span>Claim $10,000 Bounty</span>
              </button>
            </div>
          </div>
        ) : (
          /* Empty Search / Filter State */
          <div className="max-w-lg mx-auto my-16 text-center p-8 bg-white dark:bg-[#18181c] border border-[#e5dfd5] dark:border-[#262629] rounded-sm shadow-xs animate-in fade-in duration-200">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#f5f1ea] dark:bg-[#202025] flex items-center justify-center text-[#78716c] dark:text-[#a8a29e]">
              <Search className="w-6 h-6 text-red-700 dark:text-red-400" />
            </div>
            <h3 className="font-serif-display font-bold text-xl text-[#1c1917] dark:text-white">
              No Bugle Dispatches Found
            </h3>
            <p className="text-xs sm:text-sm font-sans text-[#78716c] dark:text-[#a8a29e] mt-2 mb-6 leading-relaxed">
              No stories match your search query {searchQuery && <strong>"{searchQuery}"</strong>} in the{' '}
              <strong>{selectedCategory}</strong> category. Try broadening your keywords or resetting filters.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-sans text-xs font-bold uppercase tracking-wider rounded transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          </div>
        )
      )}

      {/* Reader Modal for Book Excerpts & News Dispatches */}
      <ExcerptReaderModal
        item={selectedReaderItem}
        onClose={() => setSelectedReaderItem(null)}
      />
    </div>
  );
};
