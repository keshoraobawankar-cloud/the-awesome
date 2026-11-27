import React, { useMemo, useState, useEffect } from 'react';
import {
  X,
  Film,
  Sparkles,
  Gamepad2,
  Tv,
  BookOpen,
  Layers,
  Play,
  Coins,
  Bell,
  BellRing,
  Check,
  Search,
  Share2,
  Calendar,
  ExternalLink,
  Clapperboard
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DROP_TITLES_12, DropTitle } from '../../data/dropRadarData';
import { useDropData } from '../../context/DropDataContext';
import { useBugle } from '../../context/BugleContext';
import { useNotifications } from '../../context/NotificationContext';
import { FormatBadge, inferMovieFormats } from './FormatBadge';

export type SectorCategory = 'Movies' | 'Anime' | 'Games' | 'Dramas' | 'Books' | 'Manga';

interface CategorySlateModalProps {
  sector: SectorCategory | null;
  initialMoviesFilter?: 'all' | 'imax' | 'hollywood' | 'bollywood' | 'missing_trailer';
  onClose: () => void;
  onOpenModal: (drop: DropTitle, autoPlayTrailer?: boolean) => void;
  onOpenTrailerModal: (drop: DropTitle, mode: 'submit' | 'view_or_flag') => void;
  onShareMovie: (drop: DropTitle) => void;
  onJumpToCinemaHub?: () => void;
}

const SECTOR_META: Record<
  SectorCategory,
  { title: string; subtitle: string; accent: string }
> = {
  Movies: {
    title: 'Movies & IMAX Slate',
    subtitle: '70mm IMAX tentpoles, theatrical premieres, Hollywood & Bollywood calendars, and streaming debuts.',
    accent: '#ff3d71'
  },
  Anime: {
    title: 'Anime Premieres Slate',
    subtitle: 'Theatrical IMAX arcs, seasonal simulcasts, and studio feature premieres.',
    accent: '#8b5cf6'
  },
  Games: {
    title: 'Gaming Launches Slate',
    subtitle: 'Console flagships, PC launches, pre-load schedules, and verified showcase trailers.',
    accent: '#22d3ee'
  },
  Dramas: {
    title: 'TV & Dramas Slate',
    subtitle: 'Final seasons, prestige limited series, and global streaming premiere dates.',
    accent: '#f59e0b'
  },
  Books: {
    title: 'Books & Novels Slate',
    subtitle: 'Hardcover debuts, fantasy conclusions, and day-one audiobook launches.',
    accent: '#10b981'
  },
  Manga: {
    title: 'Manga & Manhwa Slate',
    subtitle: 'Special epilogues, simulpub chapters, and collector volume releases.',
    accent: '#ec4899'
  }
};

function isImaxRelease(drop: DropTitle): boolean {
  const hay = `${drop.platform} ${drop.tagline} ${drop.description}`.toLowerCase();
  return hay.includes('imax') || hay.includes('70mm');
}

function getSectorIcon(sector: SectorCategory) {
  switch (sector) {
    case 'Movies':
      return <Film className="w-5 h-5 text-[#ff3d71]" />;
    case 'Anime':
      return <Sparkles className="w-5 h-5 text-[#8b5cf6]" />;
    case 'Games':
      return <Gamepad2 className="w-5 h-5 text-[#22d3ee]" />;
    case 'Dramas':
      return <Tv className="w-5 h-5 text-[#f59e0b]" />;
    case 'Books':
      return <BookOpen className="w-5 h-5 text-[#10b981]" />;
    default:
      return <Layers className="w-5 h-5 text-[#ec4899]" />;
  }
}

export const CategorySlateModal: React.FC<CategorySlateModalProps> = ({
  sector,
  initialMoviesFilter = 'all',
  onClose,
  onOpenModal,
  onOpenTrailerModal,
  onShareMovie,
  onJumpToCinemaHub
}) => {
  const { drops } = useDropData();
  const { isWatchlisted, toggleWatchlist } = useBugle();
  const { hasActiveRuleFor, openNotifyModal } = useNotifications();

  const [activeSector, setActiveSector] = useState<SectorCategory>('Movies');
  const [movieSubFilter, setMovieSubFilter] = useState<
    'all' | 'imax' | 'hollywood' | 'bollywood' | 'missing_trailer'
  >(initialMoviesFilter);
  const [statusFilter, setStatusFilter] = useState<'all' | 'Confirmed' | 'Tentative' | 'Delayed' | 'missing_trailer'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!sector) return;
    setActiveSector(sector);
    setMovieSubFilter(sector === 'Movies' ? initialMoviesFilter : 'all');
    setStatusFilter('all');
    setSearchQuery('');
  }, [sector, initialMoviesFilter]);

  useEffect(() => {
    if (!sector) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [sector, onClose]);

  const pool = drops && drops.length > 0 ? drops : DROP_TITLES_12;

  const sectorDrops = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    if (activeSector === 'Movies') {
      // Include all Movies, plus IMAX theatrical titles when IMAX filter is selected
      const baseMovies = pool.filter(
        (d) => d.category === 'Movies' || (movieSubFilter === 'imax' && isImaxRelease(d))
      );

      return baseMovies.filter((d) => {
        if (movieSubFilter === 'imax' && !isImaxRelease(d)) return false;
        if (movieSubFilter === 'hollywood' && d.industry !== 'Hollywood') return false;
        if (movieSubFilter === 'bollywood' && d.industry !== 'Bollywood') return false;
        if (movieSubFilter === 'missing_trailer' && d.trailerEmbedUrl && d.trailerStatus !== 'flagged_broken') {
          return false;
        }
        if (q) {
          const hay = `${d.name} ${d.platform} ${d.tagline} ${d.industry || ''} ${d.trustedSourceLabel || ''}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });
    }

    return pool
      .filter((d) => d.category === activeSector)
      .filter((d) => {
        if (statusFilter === 'missing_trailer') {
          if (d.trailerEmbedUrl && d.trailerStatus !== 'flagged_broken') return false;
        } else if (statusFilter !== 'all' && d.status !== statusFilter) {
          return false;
        }
        if (q) {
          const hay = `${d.name} ${d.platform} ${d.tagline} ${d.trustedSourceLabel || ''}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });
  }, [pool, activeSector, movieSubFilter, statusFilter, searchQuery]);

  const movieStats = useMemo(() => {
    const movies = pool.filter((d) => d.category === 'Movies');
    const imaxAll = pool.filter((d) => isImaxRelease(d));
    const missingTrailers = movies.filter((d) => !d.trailerEmbedUrl || d.trailerStatus === 'flagged_broken');
    return {
      totalMovies: movies.length,
      imaxCount: imaxAll.length,
      hollywoodCount: movies.filter((d) => d.industry === 'Hollywood').length,
      bollywoodCount: movies.filter((d) => d.industry === 'Bollywood').length,
      missingTrailerCount: missingTrailers.length
    };
  }, [pool]);

  if (!sector) return null;

  const meta = SECTOR_META[activeSector];
  const catTargetId = `cat-${activeSector.toLowerCase()}`;
  const hasSectorAlert = hasActiveRuleFor(catTargetId);

  const handleTrackToggle = (e: React.MouseEvent, drop: DropTitle) => {
    e.stopPropagation();
    const alreadySaved = isWatchlisted(drop.id);
    toggleWatchlist(drop.id, drop.name);
    if (!alreadySaved) {
      confetti({
        particleCount: 35,
        spread: 55,
        origin: { y: 0.65 },
        colors: ['#ff3d71', '#22d3ee', '#f59e0b']
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-[115] flex items-center justify-center p-3 sm:p-6 bg-[#0b0d1a]/88 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl max-h-[92vh] rounded-3xl bg-[#121528] border border-[#2b3052] shadow-2xl overflow-hidden flex flex-col text-slate-100 font-inter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-5 sm:px-7 py-4 sm:py-5 border-b border-[#252846] bg-[#0b0d1a]/95 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-[#171a30] border border-[#2b3052] flex items-center justify-center shrink-0">
                {getSectorIcon(activeSector)}
              </div>
              <div className="min-w-0">
                <h2 className="font-bebas text-3xl sm:text-4xl text-white tracking-wide leading-none text-balance">
                  {meta.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                  {meta.subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() =>
                  openNotifyModal({
                    targetId: catTargetId,
                    targetName: `${activeSector} Releases & Updates`,
                    targetType: 'category',
                    category: activeSector
                  })
                }
                className={`px-3 py-2 rounded-xl border text-xs font-mono font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
                  hasSectorAlert
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                    : 'bg-[#171a30] border-[#2b3052] text-cyan-300 hover:border-cyan-400 hover:text-white'
                }`}
              >
                <BellRing className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">{hasSectorAlert ? 'Sector Alert On' : `Notify ${activeSector}`}</span>
              </button>

              {activeSector === 'Movies' && onJumpToCinemaHub && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onJumpToCinemaHub();
                  }}
                  className="hidden md:flex px-3 py-2 rounded-xl bg-[#171a30] hover:bg-[#202444] border border-amber-500/40 text-amber-300 text-xs font-mono font-semibold items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
                >
                  <Clapperboard className="w-3.5 h-3.5 shrink-0" />
                  <span>Cinema Hub</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-[#171a30] hover:bg-[#252846] text-slate-400 hover:text-white transition-colors shrink-0"
                aria-label="Close sector explorer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Sector Switcher Strip */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
              {(['Movies', 'Anime', 'Games', 'Dramas', 'Books', 'Manga'] as SectorCategory[]).map((sec) => {
                const isActive = activeSector === sec;
                const count = pool.filter((d) => d.category === sec).length;
                return (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setActiveSector(sec)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
                      isActive
                        ? 'bg-[#ff3d71] text-white font-semibold'
                        : 'bg-[#171a30] text-slate-300 hover:text-white border border-[#252846]'
                    }`}
                  >
                    <span>{sec === 'Movies' ? 'Movies & IMAX' : sec}</span>
                    <span className="font-mono text-[11px] opacity-80 tabular-nums">{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-64 shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Filter ${activeSector === 'Movies' ? 'movies, IMAX, studios...' : `${activeSector.toLowerCase()}...`}`}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#171a30] border border-[#252846] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Sub-Filters (Movies & IMAX vs Other Sectors) */}
          {activeSector === 'Movies' ? (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {(
                [
                  { id: 'all', label: `All Movies (${movieStats.totalMovies})` },
                  { id: 'imax', label: `IMAX & 70mm (${movieStats.imaxCount})` },
                  { id: 'hollywood', label: `Hollywood (${movieStats.hollywoodCount})` },
                  { id: 'bollywood', label: `Bollywood (${movieStats.bollywoodCount})` },
                  { id: 'missing_trailer', label: `Needs Trailer · +25 (${movieStats.missingTrailerCount})` }
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMovieSubFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap shrink-0 ${
                    movieSubFilter === tab.id
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/60 font-semibold'
                      : 'bg-[#121528] text-slate-400 hover:text-white border border-[#252846]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {(
                [
                  { id: 'all', label: 'All Releases' },
                  { id: 'Confirmed', label: 'Confirmed' },
                  { id: 'Tentative', label: 'Tentative' },
                  { id: 'Delayed', label: 'Delayed' },
                  { id: 'missing_trailer', label: 'Needs Trailer (+25)' }
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap shrink-0 ${
                    statusFilter === tab.id
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/60 font-semibold'
                      : 'bg-[#121528] text-slate-400 hover:text-white border border-[#252846]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Body Grid */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1">
          {sectorDrops.length === 0 ? (
            <div className="p-10 rounded-2xl bg-[#0b0d1a] border border-[#252846] text-center space-y-3">
              <p className="text-sm text-slate-300">
                No {activeSector === 'Movies' ? 'Movies & IMAX' : activeSector} titles matched your current filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setMovieSubFilter('all');
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-[#171a30] border border-[#2b3052] text-xs font-mono text-cyan-300 hover:text-white"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sectorDrops.map((drop) => {
                const isImax = isImaxRelease(drop);
                const isBroken = drop.trailerStatus === 'flagged_broken';
                const hasActiveTrailer = Boolean(drop.trailerEmbedUrl && !isBroken);
                const isSaved = isWatchlisted(drop.id);
                const hasAlert = hasActiveRuleFor(drop.id);
                const imgFailed = failedImages.has(drop.id);

                return (
                  <article
                    key={drop.id}
                    onClick={() => onOpenModal(drop, false)}
                    className="group rounded-2xl bg-[#0b0d1a] border border-[#252846] hover:border-cyan-400/60 overflow-hidden flex flex-col justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      {/* Visual Thumbnail */}
                      <div className="relative aspect-[16/9] bg-[#171a30] overflow-hidden">
                        {drop.image && !imgFailed ? (
                          <img
                            src={drop.image}
                            alt={drop.name}
                            referrerPolicy="no-referrer"
                            onError={() =>
                              setFailedImages((prev) => new Set(prev).add(drop.id))
                            }
                            className="w-full h-full object-cover brightness-90 group-hover:scale-105 group-hover:brightness-100 transition-all duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#171a30] to-[#0b0d1a]">
                            <Film className="w-8 h-8 text-slate-600" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d1a] via-[#0b0d1a]/30 to-transparent" />

                        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-2 text-xs font-mono">
                          <span className="text-white font-bold tabular-nums bg-[#0b0d1a]/80 px-2 py-0.5 rounded">
                            T-{drop.daysRemaining}D
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (hasActiveTrailer) {
                                onOpenModal(drop, true);
                              } else {
                                onOpenTrailerModal(drop, 'submit');
                              }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
                              hasActiveTrailer
                                ? 'bg-[#171a30]/95 hover:bg-[#ff3d71] text-white border border-[#2b3052]'
                                : isBroken
                                ? 'bg-rose-500/90 hover:bg-rose-400 text-white'
                                : 'bg-amber-500 hover:bg-amber-400 text-[#0b0d1a] font-bold'
                            }`}
                          >
                            {hasActiveTrailer ? (
                              <>
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Watch Trailer</span>
                              </>
                            ) : isBroken ? (
                              <>
                                <Coins className="w-3.5 h-3.5" />
                                <span>Fix · +10</span>
                              </>
                            ) : (
                              <>
                                <Coins className="w-3.5 h-3.5" />
                                <span>Add Trailer · +25</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Card Copy */}
                      <div className="p-4 sm:p-5 space-y-2">
                        {/* Unboxed Metadata Row */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-slate-400">
                          <span className="text-cyan-300 font-semibold flex items-center gap-1 tabular-nums">
                            <Calendar className="w-3 h-3" />
                            {drop.date}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span
                            className={
                              drop.status === 'Confirmed'
                                ? 'text-emerald-400'
                                : drop.status === 'Delayed'
                                ? 'text-[#ff3d71]'
                                : 'text-amber-300'
                            }
                          >
                            {drop.status}
                          </span>
                          {isImax && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-amber-300 font-semibold">IMAX Format</span>
                            </>
                          )}
                          {drop.industry && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{drop.industry}</span>
                            </>
                          )}
                        </div>

                        <h3 className="font-bebas text-2xl text-white tracking-wide leading-tight group-hover:text-cyan-300 transition-colors">
                          {drop.name}
                        </h3>

                        {(drop.category === 'Movies' || isImax) && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {inferMovieFormats(drop).map((fmt) => (
                              <FormatBadge key={fmt} format={fmt} size="xs" />
                            ))}
                          </div>
                        )}

                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {drop.tagline}
                        </p>

                        <p className="text-[11px] font-mono text-slate-400 truncate">
                          {drop.platform}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="px-4 sm:px-5 pb-4 pt-3 border-t border-[#252846]/70 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => handleTrackToggle(e, drop)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors ${
                            isSaved
                              ? 'bg-emerald-600 text-white border-emerald-500'
                              : 'bg-[#171a30] text-slate-200 border-[#2b3052] hover:border-cyan-400'
                          }`}
                        >
                          {isSaved ? <Check className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                          <span>{isSaved ? 'Tracked' : 'Remind'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openNotifyModal({
                              targetId: drop.id,
                              targetName: drop.name,
                              targetType: 'drop',
                              category: drop.category,
                              targetDate: drop.date
                            });
                          }}
                          className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors ${
                            hasAlert
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                              : 'bg-[#171a30] border-[#2b3052] text-cyan-300 hover:border-cyan-400'
                          }`}
                        >
                          <BellRing className="w-3.5 h-3.5" />
                          <span>{hasAlert ? 'Alert On' : 'Notify'}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onShareMovie(drop);
                          }}
                          className="p-2 rounded-lg bg-[#171a30] border border-[#2b3052] text-slate-300 hover:text-white hover:border-cyan-400 transition-colors"
                          aria-label={`Share ${drop.name}`}
                          title="Share release"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        {drop.sourceUrl && (
                          <a
                            href={drop.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-lg bg-[#171a30] border border-[#2b3052] text-slate-300 hover:text-cyan-300 transition-colors"
                            aria-label={`Open source for ${drop.name}`}
                            title="View verified source"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
