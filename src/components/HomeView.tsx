import React, { useMemo } from 'react';
import { Camera, Search, AlertCircle, RefreshCw } from 'lucide-react';
import { STORIES, Story } from '../data/stories';
import { useBugle } from '../context/BugleContext';
import { FeaturedStory } from './FeaturedStory';
import { StoryCard } from './StoryCard';
import { FilterBar } from './FilterBar';

export const HomeView: React.FC = () => {
  const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, navigateTo } = useBugle();

  // Filtered stories calculation
  const filteredStories = useMemo(() => {
    return STORIES.filter((story) => {
      // Category filter
      const matchesCategory =
        selectedCategory === 'All' || story.category.toLowerCase() === selectedCategory.toLowerCase();

      // Search query filter (searches title, subtitle, paragraphs, author, tags)
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
  }, [selectedCategory, searchQuery]);

  // Featured story: if no search or specific filter is active, highlight the marked featured story
  const isDefaultView = selectedCategory === 'All' && !searchQuery.trim();
  const featuredStory = isDefaultView
    ? STORIES.find((s) => s.featured) || STORIES[0]
    : null;

  // Grid stories: in default view, exclude the featured story so it's not duplicated
  const gridStories = isDefaultView
    ? filteredStories.filter((s) => s.id !== featuredStory?.id)
    : filteredStories;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
      {/* Front-Page Filter & Search Strip */}
      <FilterBar
        totalCount={STORIES.length}
        filteredCount={filteredStories.length}
      />

      {/* When matches exist */}
      {filteredStories.length > 0 ? (
        <>
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
                  : `Results for ${selectedCategory !== 'All' ? selectedCategory : ''} ${
                      searchQuery ? `"${searchQuery}"` : ''
                    }`}
              </h2>
            </div>
            <span className="text-xs font-sans text-[#78716c] dark:text-[#a8a29e] hidden sm:inline">
              Daily Bugle Wire Service
            </span>
          </div>

          {/* Grid of Story Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {gridStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>

          {/* Newspaper Editorial Banner: Peter Parker Photo Callout */}
          <div className="mt-14 p-6 bg-[#faf8f4] dark:bg-[#18181c] border-2 border-dashed border-[#d6cfc2] dark:border-[#2f2f35] rounded-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 flex items-center justify-center shrink-0 mt-1">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif-display font-bold text-lg text-[#1c1917] dark:text-white">
                  Got Photographs of the Web-Slinger?
                </h4>
                <p className="text-xs sm:text-sm font-sans text-[#57534e] dark:text-[#a8a29e] mt-1 max-w-xl leading-relaxed">
                  The Daily Bugle pays immediate top dollar for crisp, unpublished prints and video footage. Bring your memory cards directly to our Midtown newsroom on East 39th Street.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigateTo('about')}
              className="px-4 py-2 bg-[#1c1917] dark:bg-white text-white dark:text-[#1c1917] hover:bg-red-700 dark:hover:bg-red-600 dark:hover:text-white text-xs font-sans font-bold uppercase tracking-wider rounded transition-colors whitespace-nowrap shrink-0 shadow-xs"
            >
              Learn More
            </button>
          </div>
        </>
      ) : (
        /* Empty Search / Filter State */
        <div className="max-w-lg mx-auto my-16 text-center p-8 bg-white dark:bg-[#18181c] border border-[#e5dfd5] dark:border-[#262629] rounded-sm shadow-xs">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#f5f1ea] dark:bg-[#202025] flex items-center justify-center text-[#78716c] dark:text-[#a8a29e]">
            <Search className="w-6 h-6 text-red-700 dark:text-red-400" />
          </div>
          <h3 className="font-serif-display font-bold text-xl text-[#1c1917] dark:text-white">
            No Bugle Dispatches Found
          </h3>
          <p className="text-xs sm:text-sm font-sans text-[#78716c] dark:text-[#a8a29e] mt-2 mb-6 leading-relaxed">
            No stories match your search query {searchQuery && <strong>"{searchQuery}"</strong>} in the{' '}
            <strong>{selectedCategory}</strong> category. Try broadening your keywords.
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
      )}
    </div>
  );
};
