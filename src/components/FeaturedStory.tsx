import React from 'react';
import { Bookmark, ArrowRight, Quote } from 'lucide-react';
import { Story } from '../data/stories';
import { useBugle } from '../context/BugleContext';
import { StoryImage } from './StoryImage';

interface FeaturedStoryProps {
  story: Story;
}

export const FeaturedStory: React.FC<FeaturedStoryProps> = ({ story }) => {
  const { navigateToStory, toggleSave, isSaved } = useBugle();
  const saved = isSaved(story.id);

  return (
    <section className="mb-10 bg-white dark:bg-[#18181c] border-2 border-[#1c1917] dark:border-[#2f2f35] rounded-sm overflow-hidden shadow-sm">
      {/* Front-Page Ribbon */}
      <div className="bg-[#1c1917] dark:bg-black text-white px-4 py-1.5 flex items-center justify-between text-xs font-headline tracking-widest uppercase">
        <span className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-red-600 rounded-full" />
          FRONT PAGE LEAD STORY
        </span>
        <span className="text-stone-400 hidden sm:inline">EXCLUSIVE INVESTIGATION</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left / Top Column: Story Image & Caption */}
        <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[#e5dfd5] dark:border-[#262629] flex flex-col justify-between">
          <div
            className="cursor-pointer overflow-hidden group"
            onClick={() => navigateToStory(story.id)}
          >
            <StoryImage
              src={story.image}
              alt={story.imageAlt}
              aspectRatio="16:9"
              className="w-full group-hover:scale-[1.01] transition-transform duration-300"
            />
          </div>
          <div className="p-3 bg-[#faf8f4] dark:bg-[#141417] text-[11px] font-editorial italic text-[#57534e] dark:text-[#a8a29e] border-t border-[#ece7de] dark:border-[#262629]">
            {story.imageCaption}
          </div>
        </div>

        {/* Right Column: Lead Editorial Content */}
        <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-white dark:bg-[#18181c]">
          <div>
            {/* Clean Unboxed Metadata */}
            <div className="flex items-center gap-2 text-xs font-sans text-red-700 dark:text-red-400 font-bold uppercase tracking-wider mb-2">
              <span>{story.category}</span>
              <span aria-hidden="true" className="text-[#a8a29e]">·</span>
              <span className="text-[#78716c] dark:text-[#a8a29e] font-normal">{story.date}</span>
              <span aria-hidden="true" className="text-[#a8a29e]">·</span>
              <span className="text-[#78716c] dark:text-[#a8a29e] font-normal">{story.readTime}</span>
            </div>

            {/* Main Headline */}
            <h2
              onClick={() => navigateToStory(story.id)}
              className="cursor-pointer font-serif-display font-black text-2xl sm:text-3xl lg:text-4xl text-[#1c1917] dark:text-white leading-[1.15] hover:text-red-700 dark:hover:text-red-400 transition-colors"
              style={{ textWrap: 'balance' }}
            >
              {story.title}
            </h2>

            {/* Subtitle / Deck */}
            <p className="mt-4 text-sm sm:text-base font-editorial text-[#44403c] dark:text-[#d6d3d1] leading-relaxed">
              {story.subtitle}
            </p>

            {/* Pull Quote Box */}
            {story.pullQuote && (
              <div className="mt-5 p-4 bg-[#f8f5ee] dark:bg-[#1e1e23] border border-[#e2dcce] dark:border-[#2c2c33] rounded-xs text-xs font-serif italic text-[#292524] dark:text-[#e7e5e4] leading-relaxed relative">
                <Quote className="w-4 h-4 text-red-700 dark:text-red-400 mb-1 inline mr-1" />
                "{story.pullQuote.quote}"
                <div className="mt-2 not-italic font-sans text-[11px] font-semibold text-[#78716c] dark:text-[#a8a29e]">
                  — {story.pullQuote.speaker}, {story.pullQuote.role}
                </div>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="mt-6 pt-5 border-t border-[#f0ebe1] dark:border-[#222226] flex items-center justify-between gap-4">
            <button
              onClick={() => navigateToStory(story.id)}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white font-sans text-xs sm:text-sm font-bold tracking-wide uppercase rounded transition-colors whitespace-nowrap shadow-xs"
            >
              <span>Read Full Scoop</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => toggleSave(story.id)}
              aria-label={saved ? 'Remove from saved stories' : 'Save for later'}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded border transition-colors whitespace-nowrap ${
                saved
                  ? 'border-red-700 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400'
                  : 'border-[#d6cfc2] dark:border-[#38383f] text-[#44403c] dark:text-[#d6d3d1] hover:bg-[#ede8df] dark:hover:bg-[#232328]'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-current text-red-700 dark:text-red-400' : ''}`} />
              <span>{saved ? 'Saved in Archive' : 'Save for later'}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
