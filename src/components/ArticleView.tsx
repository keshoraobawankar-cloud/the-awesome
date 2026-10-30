import React, { useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  Share2,
  Printer,
  Clock,
  User,
  Quote,
  Check,
  Type
} from 'lucide-react';
import { Story, STORIES } from '../data/stories';
import { useBugle } from '../context/BugleContext';
import { StoryImage } from './StoryImage';
import { StoryCard } from './StoryCard';

interface ArticleViewProps {
  storyId: string;
}

export const ArticleView: React.FC<ArticleViewProps> = ({ storyId }) => {
  const { navigateTo, toggleSave, isSaved, showToast } = useBugle();
  const [fontSize, setFontSize] = useState<'base' | 'lg' | 'xl'>('lg');
  const [copied, setCopied] = useState(false);

  const story = STORIES.find((s) => s.id === storyId) || STORIES[0];
  const saved = isSaved(story.id);

  const relatedStories = STORIES.filter((s) => s.id !== story.id).slice(0, 3);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      showToast('Article link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } else {
      showToast('Link ready to share!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'base':
        return 'text-base sm:text-lg leading-relaxed';
      case 'xl':
        return 'text-xl sm:text-2xl leading-loose';
      case 'lg':
      default:
        return 'text-lg sm:text-xl leading-relaxed';
    }
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Top Utility Bar: Back to Front Page & Article Controls */}
      <div className="no-print mb-8 pb-4 border-b border-[#e5dfd5] dark:border-[#262629] flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => navigateTo('home')}
          className="flex items-center gap-2 text-sm font-sans font-semibold text-[#57534e] dark:text-[#d6d3d1] hover:text-red-700 dark:hover:text-red-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Front Page</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Font Size Adjuster */}
          <div className="flex items-center gap-1 bg-[#ede8df] dark:bg-[#1f1f23] rounded p-1 text-xs">
            <Type className="w-3.5 h-3.5 text-[#78716c] dark:text-[#a8a29e] ml-1 mr-0.5" />
            <button
              onClick={() => setFontSize('base')}
              className={`px-2 py-0.5 rounded font-serif ${
                fontSize === 'base'
                  ? 'bg-white dark:bg-[#2d2d34] text-[#1c1917] dark:text-white shadow-xs'
                  : 'text-[#78716c] dark:text-[#a8a29e]'
              }`}
              title="Standard font size"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('lg')}
              className={`px-2 py-0.5 rounded font-serif font-bold text-sm ${
                fontSize === 'lg'
                  ? 'bg-white dark:bg-[#2d2d34] text-[#1c1917] dark:text-white shadow-xs'
                  : 'text-[#78716c] dark:text-[#a8a29e]'
              }`}
              title="Large font size"
            >
              A+
            </button>
            <button
              onClick={() => setFontSize('xl')}
              className={`px-2 py-0.5 rounded font-serif font-black text-base ${
                fontSize === 'xl'
                  ? 'bg-white dark:bg-[#2d2d34] text-[#1c1917] dark:text-white shadow-xs'
                  : 'text-[#78716c] dark:text-[#a8a29e]'
              }`}
              title="Extra large font size"
            >
              A++
            </button>
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-medium text-[#44403c] dark:text-[#d6d3d1] bg-[#ede8df] dark:bg-[#1f1f23] hover:bg-[#e2dcce] dark:hover:bg-[#2c2c33] rounded transition-colors"
            title="Share Article Link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-medium text-[#44403c] dark:text-[#d6d3d1] bg-[#ede8df] dark:bg-[#1f1f23] hover:bg-[#e2dcce] dark:hover:bg-[#2c2c33] rounded transition-colors"
            title="Print Story"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          {/* Save For Later Primary Button */}
          <button
            onClick={() => toggleSave(story.id)}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-sans font-bold rounded transition-colors ${
              saved
                ? 'bg-red-700 text-white hover:bg-red-800'
                : 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 hover:bg-red-700 hover:text-white'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
            <span>{saved ? 'Saved in Archive' : 'Save for later'}</span>
          </button>
        </div>
      </div>

      {/* Article Header Section */}
      <header className="mb-8">
        {/* Unboxed Department & Date Metadata */}
        <div className="flex items-center gap-2 text-xs font-sans font-bold text-red-700 dark:text-red-400 uppercase tracking-widest mb-3">
          <span>{story.category}</span>
          <span aria-hidden="true" className="text-[#a8a29e]">·</span>
          <span className="text-[#78716c] dark:text-[#a8a29e] font-normal">{story.date}</span>
          <span aria-hidden="true" className="text-[#a8a29e]">·</span>
          <span className="text-[#78716c] dark:text-[#a8a29e] font-normal">{story.readTime}</span>
        </div>

        {/* Main Broadsheet Headline */}
        <h1
          className="font-serif-display font-black text-3xl sm:text-4xl lg:text-5xl text-[#1c1917] dark:text-white leading-[1.12] mb-4"
          style={{ textWrap: 'balance' }}
        >
          {story.title}
        </h1>

        {/* Subhead Deck */}
        <p className="font-editorial text-lg sm:text-xl text-[#57534e] dark:text-[#d6d3d1] leading-relaxed mb-6 italic">
          {story.subtitle}
        </p>

        {/* Byline Strip */}
        <div className="py-3 px-4 bg-[#faf8f4] dark:bg-[#18181c] border-y border-[#ece7de] dark:border-[#262629] flex items-center justify-between text-xs font-sans">
          <div className="flex items-center gap-2">
            <span className="text-[#78716c] dark:text-[#a8a29e]">Reported by</span>
            <span className="font-bold text-[#1c1917] dark:text-white">{story.author}</span>
            <span className="hidden sm:inline text-[#a8a29e]">({story.authorRole})</span>
          </div>
          <div className="text-[#78716c] dark:text-[#a8a29e] hidden sm:block">
            New York Press Association Verified
          </div>
        </div>
      </header>

      {/* Main Story Image & Caption */}
      <div className="mb-10">
        <div className="border border-[#e2dcce] dark:border-[#262629] overflow-hidden rounded-xs">
          <StoryImage
            src={story.image}
            alt={story.imageAlt}
            aspectRatio="16:9"
            className="w-full"
          />
        </div>
        <p className="mt-2 text-xs font-editorial italic text-[#57534e] dark:text-[#a8a29e] px-1">
          {story.imageCaption}
        </p>
      </div>

      {/* Article Body Text */}
      <div className="prose prose-stone dark:prose-invert max-w-none">
        {story.paragraphs.map((para, idx) => (
          <p
            key={idx}
            className={`font-editorial text-[#292524] dark:text-[#e7e5e4] mb-6 ${getFontSizeClass()} ${
              idx === 0
                ? 'first-letter:text-5xl sm:first-letter:text-6xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-red-700 dark:first-letter:text-red-500'
                : ''
            }`}
          >
            {para}
          </p>
        ))}

        {/* Pull Quote Callout Box */}
        {story.pullQuote && (
          <div className="my-10 p-6 sm:p-8 bg-[#f5f1ea] dark:bg-[#1a1a1e] border-y-2 border-red-700 dark:border-red-600">
            <Quote className="w-8 h-8 text-red-700 dark:text-red-500 mb-3" />
            <blockquote className="font-serif italic text-xl sm:text-2xl text-[#1c1917] dark:text-white leading-relaxed">
              "{story.pullQuote.quote}"
            </blockquote>
            <div className="mt-4 font-sans text-xs font-bold text-[#57534e] dark:text-[#a8a29e] uppercase tracking-wider">
              — {story.pullQuote.speaker} · <span className="font-normal">{story.pullQuote.role}</span>
            </div>
          </div>
        )}
      </div>

      {/* Tags Section */}
      <div className="mt-8 pt-6 border-t border-[#e5dfd5] dark:border-[#262629] flex flex-wrap items-center gap-2">
        <span className="text-xs font-sans font-bold text-[#78716c] dark:text-[#a8a29e] uppercase tracking-wider mr-2">
          Filed Under:
        </span>
        {story.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs font-sans text-[#44403c] dark:text-[#d6d3d1] hover:text-red-700 dark:hover:text-red-400 transition-colors"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Reader Save Notice & Bottom Action */}
      <div className="no-print mt-10 p-6 bg-[#faf8f4] dark:bg-[#18181c] border border-[#e5dfd5] dark:border-[#262629] rounded flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-serif-display font-bold text-base text-[#1c1917] dark:text-white">
            Enjoyed this Daily Bugle investigation?
          </h4>
          <p className="text-xs font-sans text-[#57534e] dark:text-[#a8a29e] mt-1">
            Save this piece to your personal reading archive for quick offline access.
          </p>
        </div>
        <button
          onClick={() => toggleSave(story.id)}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-sans font-bold rounded transition-colors whitespace-nowrap ${
            saved
              ? 'bg-red-700 text-white hover:bg-red-800'
              : 'bg-[#1c1917] dark:bg-white text-white dark:text-[#1c1917] hover:bg-red-700 dark:hover:bg-red-600 dark:hover:text-white'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
          <span>{saved ? 'Saved in Archive' : 'Save for Later'}</span>
        </button>
      </div>

      {/* More Stories From The Daily Bugle */}
      <div className="no-print mt-16 pt-10 border-t-2 border-[#1c1917] dark:border-[#262629]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-headline font-bold text-xl sm:text-2xl text-[#1c1917] dark:text-white uppercase tracking-tight">
            More From The Daily Bugle
          </h3>
          <button
            onClick={() => navigateTo('home')}
            className="text-xs font-sans font-bold text-red-700 dark:text-red-400 hover:underline uppercase tracking-wider"
          >
            View All Stories →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedStories.map((relStory) => (
            <StoryCard key={relStory.id} story={relStory} />
          ))}
        </div>
      </div>
    </article>
  );
};
