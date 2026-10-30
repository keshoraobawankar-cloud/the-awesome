import React from 'react';
import { Bookmark, Clock, ArrowRight } from 'lucide-react';
import { Story } from '../data/stories';
import { useBugle } from '../context/BugleContext';
import { StoryImage } from './StoryImage';

interface StoryCardProps {
  story: Story;
}

export const StoryCard: React.FC<StoryCardProps> = ({ story }) => {
  const { navigateToStory, toggleSave, isSaved } = useBugle();
  const saved = isSaved(story.id);

  return (
    <article
      onClick={() => navigateToStory(story.id)}
      className="group cursor-pointer flex flex-col justify-between bg-white dark:bg-[#18181c] border border-[#e5dfd5] dark:border-[#262629] hover:border-red-600/50 dark:hover:border-red-500/50 transition-all duration-200 overflow-hidden rounded-sm"
    >
      <div>
        {/* Story Image */}
        <div className="relative overflow-hidden border-b border-[#ece7de] dark:border-[#262629]">
          <StoryImage
            src={story.image}
            alt={story.imageAlt}
            aspectRatio="4:3"
            category={story.category}
            className="group-hover:scale-[1.02] transition-transform duration-300"
          />
          {story.editionBadge && (
            <span className="absolute top-2 left-2 bg-[#1c1917]/90 dark:bg-black/90 text-white text-[10px] font-headline tracking-widest uppercase px-2 py-0.5 rounded-sm backdrop-blur-xs">
              {story.editionBadge}
            </span>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5">
          {/* Unboxed Metadata with Typographic Separator (§1.A) */}
          <div className="flex items-center gap-2 text-xs font-sans text-red-700 dark:text-red-400 font-semibold mb-2 uppercase tracking-wider">
            <span>{story.category}</span>
            <span aria-hidden="true" className="text-[#a8a29e]">·</span>
            <span className="text-[#78716c] dark:text-[#a8a29e] font-normal">{story.date}</span>
            <span aria-hidden="true" className="text-[#a8a29e]">·</span>
            <span className="text-[#78716c] dark:text-[#a8a29e] font-normal">{story.readTime}</span>
          </div>

          {/* Headline */}
          <h3 className="font-serif-display font-bold text-lg sm:text-xl text-[#1c1917] dark:text-white leading-snug group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors">
            {story.title}
          </h3>

          {/* Subtitle / Excerpt */}
          <p className="mt-2 text-xs sm:text-sm font-sans text-[#57534e] dark:text-[#a8a29e] line-clamp-3 leading-relaxed">
            {story.subtitle}
          </p>
        </div>
      </div>

      {/* Card Footer: Byline & Save For Later Button */}
      <div className="px-5 py-3.5 border-t border-[#f0ebe1] dark:border-[#222226] bg-[#faf8f4] dark:bg-[#141417] flex items-center justify-between gap-3">
        <span className="text-xs font-sans text-[#78716c] dark:text-[#a8a29e] truncate">
          By <strong className="text-[#292524] dark:text-[#e7e5e4] font-medium">{story.author}</strong>
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleSave(story.id);
          }}
          aria-label={saved ? 'Remove from saved stories' : 'Save story for later'}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
            saved
              ? 'bg-red-700 text-white hover:bg-red-800'
              : 'text-[#44403c] dark:text-[#d6d3d1] hover:text-red-700 dark:hover:text-white hover:bg-[#ede8df] dark:hover:bg-[#202025]'
          }`}
          title={saved ? 'Story saved' : 'Save for later'}
        >
          <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-current text-white' : ''}`} />
          <span>{saved ? 'Saved' : 'Save for later'}</span>
        </button>
      </div>
    </article>
  );
};
