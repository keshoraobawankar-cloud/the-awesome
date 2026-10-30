import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { CATEGORIES } from '../data/stories';
import { useBugle } from '../context/BugleContext';

interface FilterBarProps {
  totalCount: number;
  filteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({ totalCount, filteredCount }) => {
  const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory } = useBugle();

  return (
    <div className="mb-8 space-y-4">
      {/* Search Input & Status Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Field */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#78716c] dark:text-[#a8a29e]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Spider-Man scoops, villains, headlines..."
            className="w-full pl-10 pr-10 py-2 bg-white dark:bg-[#18181c] border border-[#d6cfc2] dark:border-[#2d2d34] rounded text-sm text-[#1c1917] dark:text-white placeholder-[#a8a29e] focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Clear search query"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#78716c] dark:text-[#a8a29e] hover:text-[#1c1917] dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Counter Info */}
        <div className="text-xs font-sans text-[#78716c] dark:text-[#a8a29e] flex items-center gap-1.5 shrink-0 self-end sm:self-center">
          <span className="font-medium text-[#1c1917] dark:text-[#e7e5e4] tabular-nums">
            {filteredCount}
          </span>
          <span>of</span>
          <span className="font-medium text-[#1c1917] dark:text-[#e7e5e4] tabular-nums">
            {totalCount}
          </span>
          <span>articles on file</span>
        </div>
      </div>

      {/* Category Segmented Controls (Interactive Filter Buttons) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-[#e7e2d9] dark:border-[#262629]">
        <span className="text-xs font-bold uppercase tracking-wider text-[#78716c] dark:text-[#a8a29e] mr-2 shrink-0 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Category:</span>
        </span>
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-t transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-red-700 text-white font-bold shadow-xs'
                  : 'text-[#57534e] dark:text-[#a8a29e] hover:text-[#1c1917] dark:hover:text-white hover:bg-[#ede8df] dark:hover:bg-[#202025]'
              }`}
            >
              {cat === 'All' ? 'All Stories' : cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};
