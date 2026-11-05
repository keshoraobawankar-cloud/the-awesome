import React, { useState } from 'react';
import { ReleaseItem } from '../data/releases';
import { CountdownClock } from './CountdownClock';
import { Calendar, Bookmark, BookOpen, ExternalLink, Sparkles, Film, Gamepad2, Tv, FileText } from 'lucide-react';

interface ReleaseCardProps {
  item: ReleaseItem;
  onSelect: (item: ReleaseItem) => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string, title?: string) => void;
}

export const ReleaseCard: React.FC<ReleaseCardProps> = ({
  item,
  onSelect,
  isBookmarked,
  onToggleBookmark,
}) => {
  const [imgError, setImgError] = useState(false);

  // Category Icon helper
  const getCategoryIcon = () => {
    switch (item.category) {
      case 'Gaming':
        return <Gamepad2 className="w-3 h-3" />;
      case 'Anime':
        return <Sparkles className="w-3 h-3" />;
      case 'TV Dramas':
        return <Tv className="w-3 h-3" />;
      case 'Books & Novels':
        return <BookOpen className="w-3 h-3" />;
      case 'Entertainment News':
        return <FileText className="w-3 h-3" />;
      case 'Movies':
      default:
        return <Film className="w-3 h-3" />;
    }
  };

  const getStatusColor = () => {
    switch (item.status) {
      case 'Breaking':
        return 'bg-red-700 text-white animate-pulse';
      case 'Out Now':
        return 'bg-emerald-600 text-white';
      case 'Confirmed':
        return 'bg-blue-600 text-white';
      case 'Delayed':
        return 'bg-amber-600 text-white';
      case 'Coming Soon':
      default:
        return 'bg-black/75 text-white';
    }
  };

  return (
    <div className="bg-white dark:bg-[#18181c] border border-[#d6cfc2] dark:border-[#262629] rounded overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group hover:border-red-600/50">
      <div>
        {/* Card Poster Image / Backdrop */}
        <div
          onClick={() => onSelect(item)}
          className="relative h-48 overflow-hidden bg-stone-200 dark:bg-stone-800 cursor-pointer"
        >
          {!imgError ? (
            <img
              src={item.image}
              alt={item.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${item.themeColor || 'from-stone-700 to-stone-900'} flex items-center justify-center p-4 text-center text-white`}>
              <div className="font-serif-display font-bold text-lg leading-snug">
                {item.title}
              </div>
            </div>
          )}

          {/* Category Tag */}
          <div className="absolute top-2 left-2 bg-red-700 text-white text-[10px] font-headline font-bold uppercase px-2.5 py-1 rounded shadow-xs flex items-center gap-1.5">
            {getCategoryIcon()}
            <span>{item.category}</span>
          </div>

          {/* Status Badge */}
          <div className={`absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider backdrop-blur-xs ${getStatusColor()}`}>
            {item.status}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5">
          {/* Release Date & Platform Meta */}
          <div className="flex items-center gap-1.5 text-xs text-[#78716c] dark:text-[#a8a29e] mb-1.5 font-mono">
            <Calendar className="w-3.5 h-3.5 text-red-700 dark:text-red-400 shrink-0" />
            <span className="font-bold text-[#1c1917] dark:text-[#f3f4f6]">{item.releaseDate}</span>
            <span className="text-[#a8a29e]" aria-hidden="true">•</span>
            <span className="truncate">{item.platform}</span>
          </div>

          {/* Headline Title */}
          <h3
            onClick={() => onSelect(item)}
            className="font-serif-display font-bold text-lg text-[#1c1917] dark:text-white hover:text-red-700 dark:hover:text-red-400 cursor-pointer line-clamp-1 mb-1.5 transition-colors leading-tight"
          >
            {item.title}
          </h3>

          {/* Creator / Author / Director */}
          {item.creatorOrAuthor && (
            <p className="text-xs font-sans text-[#78716c] dark:text-[#a8a29e] mb-2 italic">
              By <strong className="text-[#1c1917] dark:text-[#d6d3d1] font-semibold">{item.creatorOrAuthor}</strong>
            </p>
          )}

          {/* Synopsis Deck */}
          <p className="text-xs font-sans text-[#57534e] dark:text-[#a8a29e] line-clamp-2 leading-relaxed mb-4">
            {item.description}
          </p>
        </div>
      </div>

      {/* Action Footer: Live Countdown & Watchlist Toggle */}
      <div className="px-4 pb-4 pt-0 flex items-center justify-between border-t border-[#f0ebe1] dark:border-[#242429] pt-3 bg-[#faf8f4] dark:bg-[#151518]">
        <CountdownClock targetDate={item.releaseDate} />

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelect(item)}
            className="text-xs font-sans font-bold text-red-700 dark:text-red-400 hover:text-red-800 transition-colors"
          >
            {item.category === 'Books & Novels' ? 'Read Excerpt' : item.category === 'Entertainment News' ? 'Read Scoop' : 'Intel'}
          </button>

          <button
            onClick={() => onToggleBookmark(item.id, item.title)}
            className={`p-2 rounded transition-colors ${
              isBookmarked
                ? 'bg-red-700 text-white'
                : 'bg-[#ede8df] dark:bg-[#202025] text-[#57534e] dark:text-[#d6d3d1] hover:bg-red-700 hover:text-white'
            }`}
            title={isBookmarked ? 'Remove from Watchlist' : 'Add reminder to Watchlist'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
