import React from 'react';
import { Bookmark, ArrowRight, Trash2, ArrowLeft, Newspaper, BookOpen } from 'lucide-react';
import { useBugle } from '../context/BugleContext';
import { StoryImage } from './StoryImage';

export const SavedStoriesView: React.FC = () => {
  const { savedStories, toggleSave, clearAllSaved, navigateToStory, navigateTo } = useBugle();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="border-b border-[#e5dfd5] dark:border-[#262629] pb-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigateTo('home')}
            className="flex items-center gap-1.5 text-xs font-sans font-semibold text-[#78716c] dark:text-[#a8a29e] hover:text-red-700 dark:hover:text-red-400 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Front Page</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="font-headline font-bold text-2xl sm:text-3xl text-[#1c1917] dark:text-white uppercase tracking-tight">
              Personal Scoop Archive
            </h1>
            <span className="px-2.5 py-0.5 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 text-xs font-bold rounded-sm tabular-nums">
              {savedStories.length} {savedStories.length === 1 ? 'Story' : 'Stories'} Saved
            </span>
          </div>
          <p className="text-xs sm:text-sm font-sans text-[#57534e] dark:text-[#a8a29e] mt-1">
            Articles saved to your browser's local storage. Kept offline and persisted across browser sessions.
          </p>
        </div>

        {savedStories.length > 0 && (
          <button
            onClick={clearAllSaved}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-medium text-stone-600 dark:text-stone-300 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded border border-[#e5dfd5] dark:border-[#262629] transition-colors"
            title="Clear all saved articles"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Archive</span>
          </button>
        )}
      </div>

      {/* Empty State */}
      {savedStories.length === 0 ? (
        <div className="max-w-md mx-auto my-16 text-center p-8 bg-white dark:bg-[#18181c] border border-[#e5dfd5] dark:border-[#262629] rounded-sm shadow-xs">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f5f1ea] dark:bg-[#202025] flex items-center justify-center text-[#78716c] dark:text-[#a8a29e]">
            <Bookmark className="w-8 h-8 text-red-700 dark:text-red-400" />
          </div>
          <h2 className="font-serif-display font-bold text-xl text-[#1c1917] dark:text-white">
            Your Newsreel is Empty
          </h2>
          <p className="text-xs sm:text-sm font-sans text-[#78716c] dark:text-[#a8a29e] mt-2 mb-6 leading-relaxed">
            You haven't bookmarked any Daily Bugle investigations yet. Look for the "Save for later" button on any story card or article page.
          </p>
          <button
            onClick={() => navigateTo('home')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white font-sans text-xs font-bold uppercase tracking-wider rounded transition-colors shadow-xs"
          >
            <Newspaper className="w-4 h-4" />
            <span>Browse Front Page Scoops</span>
          </button>
        </div>
      ) : (
        /* Saved Stories Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedStories.map((story) => (
            <div
              key={story.id}
              className="bg-white dark:bg-[#18181c] border border-[#e5dfd5] dark:border-[#262629] rounded-sm overflow-hidden flex flex-col justify-between hover:border-red-600/40 transition-colors shadow-xs"
            >
              <div>
                <div
                  className="cursor-pointer overflow-hidden border-b border-[#ece7de] dark:border-[#262629]"
                  onClick={() => navigateToStory(story.id)}
                >
                  <StoryImage
                    src={story.image}
                    alt={story.imageAlt}
                    aspectRatio="16:9"
                    className="hover:scale-[1.02] transition-transform duration-300"
                  />
                </div>

                <div className="p-5">
                  {/* Metadata */}
                  <div className="flex items-center gap-2 text-xs font-sans text-red-700 dark:text-red-400 font-semibold mb-2 uppercase tracking-wider">
                    <span>{story.category}</span>
                    <span aria-hidden="true" className="text-[#a8a29e]">·</span>
                    <span className="text-[#78716c] dark:text-[#a8a29e] font-normal">{story.date}</span>
                  </div>

                  {/* Headline */}
                  <h3
                    onClick={() => navigateToStory(story.id)}
                    className="cursor-pointer font-serif-display font-bold text-lg text-[#1c1917] dark:text-white leading-snug hover:text-red-700 dark:hover:text-red-400 transition-colors"
                  >
                    {story.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="mt-2 text-xs font-sans text-[#57534e] dark:text-[#a8a29e] line-clamp-2 leading-relaxed">
                    {story.subtitle}
                  </p>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="px-5 py-3 border-t border-[#f0ebe1] dark:border-[#222226] bg-[#faf8f4] dark:bg-[#141417] flex items-center justify-between gap-3">
                <button
                  onClick={() => navigateToStory(story.id)}
                  className="flex items-center gap-1.5 text-xs font-sans font-bold text-red-700 dark:text-red-400 hover:text-red-800 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Read Story</span>
                </button>

                <button
                  onClick={() => toggleSave(story.id)}
                  className="flex items-center gap-1 text-xs font-sans text-[#78716c] dark:text-[#a8a29e] hover:text-red-700 dark:hover:text-red-400 transition-colors"
                  title="Remove from saved reading list"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
