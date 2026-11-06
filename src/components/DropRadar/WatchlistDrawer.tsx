import React from 'react';
import { X, Trash2, Calendar, Bell, ArrowRight, ExternalLink } from 'lucide-react';
import { useBugle } from '../../context/BugleContext';
import { DROP_TITLES_12, DropTitle } from '../../data/dropRadarData';

interface WatchlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDrop: (drop: DropTitle) => void;
}

export const WatchlistDrawer: React.FC<WatchlistDrawerProps> = ({
  isOpen,
  onClose,
  onSelectDrop
}) => {
  const { watchlistIds, toggleWatchlist, clearWatchlist } = useBugle();

  if (!isOpen) return null;

  const trackedDrops = DROP_TITLES_12.filter((d) => watchlistIds.includes(d.id));

  return (
    <div className="fixed inset-0 z-[120] overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0b0d1a]/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#121528] border-l border-[#252846] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-6 border-b border-[#252846] flex items-center justify-between bg-[#171a30]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#ff3d71]/20 text-[#ff3d71] border border-[#ff3d71]/40">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bebas text-2xl text-white tracking-wide">
                  TRACKED <span className="text-cyan-400">DROPS</span>
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  {trackedDrops.length} drops in priority queue
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#252846] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List of tracked drops */}
          <div className="p-4 overflow-y-auto flex-1 space-y-3">
            {trackedDrops.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-inter">
                <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-base font-semibold text-white mb-1">Queue is empty</p>
                <p className="text-xs">
                  Click the "Remind Me" button on any release to track live launch countdowns.
                </p>
              </div>
            ) : (
              trackedDrops.map((drop) => (
                <div
                  key={drop.id}
                  onClick={() => {
                    onSelectDrop(drop);
                    onClose();
                  }}
                  className="p-4 rounded-2xl bg-[#171a30] border border-[#2b3052] hover:border-cyan-400/50 transition-all cursor-pointer group flex items-center justify-between"
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
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                        {drop.category}
                      </span>
                      <h4 className="font-bebas text-lg text-white group-hover:text-cyan-300 transition-colors truncate">
                        {drop.name}
                      </h4>
                      <p className="text-xs font-mono text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-cyan-400" />
                        {drop.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-2">
                    <span className="text-xs font-mono font-bold text-[#ff3d71]">
                      T-{drop.daysRemaining}D
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWatchlist(drop.id, drop.name);
                      }}
                      className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-[#252846] transition-colors"
                      title="Remove from watchlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Controls */}
          {trackedDrops.length > 0 && (
            <div className="p-4 border-t border-[#252846] bg-[#171a30] flex items-center justify-between">
              <button
                onClick={clearWatchlist}
                className="text-xs font-mono text-slate-400 hover:text-rose-400 transition-colors"
              >
                Clear Queue
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold hover:bg-cyan-500/30 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
