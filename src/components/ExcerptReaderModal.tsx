import React, { useState, useEffect } from 'react';
import { X, BookOpen, Bookmark, Type, Calendar, Share2, Check, User, Clock } from 'lucide-react';
import { ReleaseItem } from '../data/releases';
import { useBugle } from '../context/BugleContext';
import { CountdownClock } from './CountdownClock';

interface ExcerptReaderModalProps {
  item: ReleaseItem | null;
  onClose: () => void;
}

export const ExcerptReaderModal: React.FC<ExcerptReaderModalProps> = ({ item, onClose }) => {
  const { isWatchlisted, toggleWatchlist, showToast } = useBugle();
  const [fontSize, setFontSize] = useState<'base' | 'lg' | 'xl'>('lg');
  const [readingTheme, setReadingTheme] = useState<'paper' | 'sepia' | 'dark'>('paper');
  const [copied, setCopied] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const bookmarked = isWatchlisted(item.id);

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'base':
        return 'text-base leading-relaxed';
      case 'xl':
        return 'text-xl leading-loose';
      case 'lg':
      default:
        return 'text-lg leading-relaxed';
    }
  };

  const getThemeContainerClass = () => {
    switch (readingTheme) {
      case 'sepia':
        return 'bg-[#f4ecd8] text-[#2c2214] border-[#d8ceb6]';
      case 'dark':
        return 'bg-[#141417] text-[#f3f4f6] border-[#292930]';
      case 'paper':
      default:
        return 'bg-[#fcfaf7] dark:bg-[#151518] text-[#1c1917] dark:text-[#f3f4f6] border-[#e7e2d9] dark:border-[#262629]';
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `📖 Reading an excerpt of "${item.title}" by ${item.creatorOrAuthor || 'Daily Bugle Press'}: ${item.description}`
      );
      setCopied(true);
      showToast('Excerpt quote copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Reader Panel */}
      <div
        className={`relative w-full max-w-2xl rounded border shadow-2xl z-10 overflow-hidden my-auto max-h-[92vh] flex flex-col transition-colors duration-200 ${getThemeContainerClass()}`}
      >
        {/* Top Reading Navigation Bar */}
        <div className="p-3 sm:p-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between gap-3 shrink-0 bg-black/5 dark:bg-white/5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-700 text-white rounded">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-red-700 dark:text-red-400">
                {item.category === 'Books & Novels' ? 'LITERARY DESK CHAPTER READER' : 'POP CULTURE WIRE DISPATCH'}
              </div>
              <h2 className="font-serif-display font-bold text-sm sm:text-base truncate max-w-xs sm:max-w-md">
                {item.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Font Adjuster */}
            <div className="flex items-center gap-1 bg-black/10 dark:bg-white/10 p-1 rounded text-xs">
              <button
                onClick={() => setFontSize('base')}
                className={`px-1.5 py-0.5 rounded font-serif ${fontSize === 'base' ? 'bg-white dark:bg-stone-700 shadow-xs font-bold' : ''}`}
                title="Standard type size"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-1.5 py-0.5 rounded font-serif ${fontSize === 'lg' ? 'bg-white dark:bg-stone-700 shadow-xs font-bold' : ''}`}
                title="Large type size"
              >
                A+
              </button>
              <button
                onClick={() => setFontSize('xl')}
                className={`px-1.5 py-0.5 rounded font-serif ${fontSize === 'xl' ? 'bg-white dark:bg-stone-700 shadow-xs font-bold' : ''}`}
                title="Extra large type size"
              >
                A++
              </button>
            </div>

            {/* Reading Theme Switcher */}
            <div className="hidden sm:flex items-center gap-1 bg-black/10 dark:bg-white/10 p-1 rounded text-[11px] font-bold">
              <button
                onClick={() => setReadingTheme('paper')}
                className={`px-2 py-0.5 rounded ${readingTheme === 'paper' ? 'bg-white text-stone-900 shadow-xs' : ''}`}
              >
                Paper
              </button>
              <button
                onClick={() => setReadingTheme('sepia')}
                className={`px-2 py-0.5 rounded ${readingTheme === 'sepia' ? 'bg-[#dfd4be] text-stone-900 shadow-xs' : ''}`}
              >
                Sepia
              </button>
              <button
                onClick={() => setReadingTheme('dark')}
                className={`px-2 py-0.5 rounded ${readingTheme === 'dark' ? 'bg-stone-800 text-white shadow-xs' : ''}`}
              >
                Night
              </button>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              aria-label="Close reader"
              className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-white rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Reader Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 font-editorial">
          {/* Metadata Byline Strip */}
          <div className="border-b border-black/10 dark:border-white/10 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-sans">
              <div>
                <span className="text-[#78716c] dark:text-[#a8a29e]">Author / Byline: </span>
                <strong className="font-bold text-red-700 dark:text-red-400">
                  {item.creatorOrAuthor || 'Daily Bugle Correspondent'}
                </strong>
                {item.format && <span className="ml-2 text-[#78716c] dark:text-[#a8a29e]">({item.format})</span>}
              </div>

              <div className="flex items-center gap-1.5 text-[#78716c] dark:text-[#a8a29e]">
                <Calendar className="w-3.5 h-3.5" />
                <span>{item.releaseDate}</span>
                <span className="mx-1">·</span>
                <span className="font-bold uppercase text-red-700 dark:text-red-400">{item.status}</span>
              </div>
            </div>

            <h1 className="font-serif-display font-black text-2xl sm:text-3xl mt-3 leading-tight">
              {item.excerptTitle || item.title}
            </h1>
          </div>

          {/* Excerpt Paragraphs */}
          <div className="space-y-5">
            {item.excerptParagraphs && item.excerptParagraphs.length > 0 ? (
              item.excerptParagraphs.map((para, idx) => (
                <p
                  key={idx}
                  className={`${getFontSizeClass()} leading-relaxed ${
                    idx === 0
                      ? 'first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-red-700'
                      : ''
                  }`}
                >
                  {para}
                </p>
              ))
            ) : (
              <p className={`${getFontSizeClass()} leading-relaxed`}>
                {item.description}
              </p>
            )}
          </div>

          {/* Book / Scoop Synopsis Callout */}
          <div className="p-4 bg-black/5 dark:bg-white/5 rounded border border-black/10 dark:border-white/10 font-sans text-xs space-y-2 mt-8">
            <div className="font-bold uppercase tracking-wider text-red-700 dark:text-red-400 flex items-center gap-1.5">
              <span>Platform & Distribution Intel:</span>
            </div>
            <p className="leading-relaxed opacity-90">
              Published and distributed on: <strong>{item.platform}</strong>. Official publication date codified for {item.releaseDate}.
            </p>
          </div>
        </div>

        {/* Reader Action Footer */}
        <div className="p-4 border-t border-black/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 bg-black/5 dark:bg-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <CountdownClock targetDate={item.releaseDate} compact />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-medium rounded border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>

            <button
              onClick={() => toggleWatchlist(item.id, item.title)}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-sans font-bold rounded transition-colors ${
                bookmarked
                  ? 'bg-red-700 text-white'
                  : 'bg-black/80 dark:bg-white text-white dark:text-stone-900 hover:bg-red-700 hover:text-white'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
              <span>{bookmarked ? 'Saved to Reading List' : 'Save to Reading List'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
