import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Calendar, ArrowRight, Film, Sparkles, Gamepad2, Tv, BookOpen, Layers } from 'lucide-react';
import { DROP_TITLES_12, DropTitle } from '../../data/dropRadarData';
import { useDropData } from '../../context/DropDataContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDrop: (drop: DropTitle) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectDrop }) => {
  const { drops } = useDropData();
  const allDrops = (drops && drops.length > 0) ? drops : DROP_TITLES_12;
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard shortcut (Escape to close, Arrow keys, Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredDrops.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter' && filteredDrops[selectedIndex]) {
        e.preventDefault();
        onSelectDrop(filteredDrops[selectedIndex]);
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const filteredDrops = allDrops.filter((drop) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      drop.name.toLowerCase().includes(q) ||
      drop.category.toLowerCase().includes(q) ||
      drop.platform.toLowerCase().includes(q) ||
      drop.tagline.toLowerCase().includes(q)
    );
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-[#0b0d1a]/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl rounded-3xl bg-[#121528] border-2 border-[#2b3052] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-[#252846] flex items-center gap-3 bg-[#171a30]">
          <Search className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search upcoming movies, anime, games, dramas, books..."
            className="w-full bg-transparent text-white font-inter text-base placeholder:text-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#252846] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-3 space-y-1.5 flex-1">
          {filteredDrops.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-inter">
              <p className="text-base font-semibold text-white mb-1">No upcoming drops matched</p>
              <p className="text-xs">Try searching for GTA VI, Spider-Man, Demon Slayer, or Faerie.</p>
            </div>
          ) : (
            filteredDrops.map((drop, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={drop.id}
                  onClick={() => {
                    onSelectDrop(drop);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#22d3ee]/20 to-[#8b5cf6]/20 border border-[#22d3ee]/50 text-white'
                      : 'hover:bg-[#171a30] text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-[#0b0d1a] border border-[#252846]">
                      <img
                        src={drop.image || '/src/assets/images/bank_heist_web_aftermath_1793361604681.jpg'}
                        alt={drop.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#0b0d1a] text-cyan-400 border border-[#252846]">
                          {drop.category}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {drop.date}
                        </span>
                      </div>
                      <h4 className="font-bebas text-xl text-white tracking-wide truncate">
                        {drop.name}
                      </h4>
                      <p className="text-xs text-slate-400 truncate max-w-md font-inter">
                        {drop.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pl-3 flex-shrink-0">
                    <span className="text-xs font-mono font-bold text-[#ff3d71] hidden sm:inline">
                      T-{drop.daysRemaining}D
                    </span>
                    <ArrowRight className="w-4 h-4 text-cyan-400" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Keyboard Footer */}
        <div className="p-3 border-t border-[#252846] bg-[#0b0d1a] flex items-center justify-between text-xs font-mono text-slate-400 px-5">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span>{filteredDrops.length} Drops Located</span>
        </div>
      </div>
    </div>
  );
};
