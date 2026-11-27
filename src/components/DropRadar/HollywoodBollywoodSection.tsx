import React, { useMemo, useState } from 'react';
import {
  Film,
  Calendar,
  Play,
  Bell,
  BellRing,
  Check,
  ExternalLink,
  ShieldCheck,
  Search,
  Sparkles,
  Clapperboard,
  Share2,
  Coins
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DROP_TITLES_12, DropTitle } from '../../data/dropRadarData';
import { useDropData } from '../../context/DropDataContext';
import { useBugle } from '../../context/BugleContext';
import { useNotifications } from '../../context/NotificationContext';
import { FormatBadge, inferMovieFormats } from './FormatBadge';

interface HollywoodBollywoodSectionProps {
  onOpenModal: (drop: DropTitle, autoPlayTrailer?: boolean) => void;
  onShareMovie: (drop: DropTitle) => void;
  onOpenTrailerModal?: (drop: DropTitle, mode: 'submit' | 'view_or_flag') => void;
}

type CinemaTab = 'All' | 'IMAX' | 'Hollywood' | 'Bollywood';

function isImaxTitle(drop: DropTitle): boolean {
  const hay = `${drop.platform} ${drop.tagline} ${drop.description}`.toLowerCase();
  return hay.includes('imax') || hay.includes('70mm');
}

export const HollywoodBollywoodSection: React.FC<HollywoodBollywoodSectionProps> = ({
  onOpenModal,
  onShareMovie,
  onOpenTrailerModal
}) => {
  const { drops } = useDropData();
  const { isWatchlisted, toggleWatchlist } = useBugle();
  const { hasActiveRuleFor, openNotifyModal } = useNotifications();

  const [activeTab, setActiveTab] = useState<CinemaTab>('All');
  const [filterText, setFilterText] = useState('');

  const allDrops = drops && drops.length > 0 ? drops : DROP_TITLES_12;

  const { hollywoodMovies, bollywoodMovies, imaxTitles } = useMemo(() => {
    const cinemaPool = allDrops.filter(
      (d) =>
        d.category === 'Movies' &&
        (d.industry === 'Hollywood' || d.industry === 'Bollywood')
    );

    const q = filterText.trim().toLowerCase();
    const matchesQuery = (d: DropTitle) => {
      if (!q) return true;
      return (
        d.name.toLowerCase().includes(q) ||
        d.tagline.toLowerCase().includes(q) ||
        d.platform.toLowerCase().includes(q) ||
        (d.trustedSourceLabel || '').toLowerCase().includes(q)
      );
    };

    return {
      hollywoodMovies: cinemaPool
        .filter((d) => d.industry === 'Hollywood' && matchesQuery(d))
        .slice(0, 8),
      bollywoodMovies: cinemaPool
        .filter((d) => d.industry === 'Bollywood' && matchesQuery(d))
        .slice(0, 8),
      imaxTitles: allDrops
        .filter((d) => isImaxTitle(d) && matchesQuery(d))
        .slice(0, 8)
    };
  }, [allDrops, filterText]);

  const visibleImax = activeTab === 'IMAX';
  const visibleHollywood = activeTab === 'All' || activeTab === 'Hollywood';
  const visibleBollywood = activeTab === 'All' || activeTab === 'Bollywood';

  const handleWatchlistToggle = (e: React.MouseEvent, drop: DropTitle) => {
    e.stopPropagation();
    const alreadySaved = isWatchlisted(drop.id);
    toggleWatchlist(drop.id, drop.name);
    if (!alreadySaved) {
      confetti({
        particleCount: 40,
        spread: 55,
        origin: { y: 0.65 },
        colors:
          drop.industry === 'Bollywood'
            ? ['#f59e0b', '#ff3d71', '#ffffff']
            : ['#22d3ee', '#8b5cf6', '#ffffff']
      });
    }
  };

  const renderMovieCard = (movie: DropTitle) => {
    const isBollywood = movie.industry === 'Bollywood';
    const isSaved = isWatchlisted(movie.id);
    const hasAlert = hasActiveRuleFor(movie.id);
    const badgeClasses = isBollywood
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    const hoverBorder = isBollywood
      ? 'hover:border-amber-400/60 hover:shadow-[0_0_28px_rgba(245,158,11,0.16)]'
      : 'hover:border-cyan-400/60 hover:shadow-[0_0_28px_rgba(34,211,238,0.16)]';

    return (
      <div
        key={movie.id}
        onClick={() => onOpenModal(movie, false)}
        className={`group rounded-2xl bg-[#121528] border border-[#252846] ${hoverBorder} overflow-hidden transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-xl`}
      >
        {/* Top Poster / Media */}
        <div>
          <div className="relative h-48 sm:h-52 w-full bg-[#171a30] overflow-hidden">
            <img
              src={
                movie.image ||
                '/src/assets/images/bank_heist_web_aftermath_1793361604681.jpg'
              }
              alt={movie.name}
              loading="lazy"
              className="w-full h-full object-cover filter brightness-90 contrast-110 group-hover:scale-105 group-hover:brightness-105 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#121528] via-[#121528]/35 to-black/30" />

            {/* Top Left Industry + Status */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border backdrop-blur-md ${badgeClasses}`}
              >
                {movie.industry || 'Movies'}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border backdrop-blur-md ${
                  movie.status === 'Confirmed'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : movie.status === 'Delayed'
                    ? 'bg-[#ff3d71]/20 text-[#ff3d71] border-[#ff3d71]/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}
              >
                {movie.status}
              </span>
            </div>

            {/* Top Right T-Minus Pill */}
            <div className="absolute top-3 right-3">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-[#ff3d71] text-white shadow-[0_0_12px_rgba(255,61,113,0.5)]">
                T-{movie.daysRemaining}D
              </span>
            </div>

            {/* Bottom Play / Add Official Trailer Trigger */}
            {(() => {
              const isBroken = movie.trailerStatus === 'flagged_broken';
              const hasActiveTrailer = Boolean(movie.trailerEmbedUrl && !isBroken);
              return (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (hasActiveTrailer) {
                      onOpenModal(movie, true);
                    } else if (onOpenTrailerModal) {
                      onOpenTrailerModal(movie, 'submit');
                    } else {
                      onOpenModal(movie, true);
                    }
                  }}
                  className={`absolute bottom-3 right-3 px-3 py-1.5 rounded-xl border text-white text-xs font-mono font-semibold flex items-center gap-1.5 backdrop-blur-md transition-all ${
                    hasActiveTrailer
                      ? 'bg-[#0b0d1a]/85 hover:bg-[#ff3d71] border-[#2b3052] hover:border-[#ff3d71]'
                      : isBroken
                      ? 'bg-[#0b0d1a]/90 hover:bg-rose-500 hover:text-white border-rose-400/60 shadow-[0_0_14px_rgba(244,63,94,0.3)]'
                      : 'bg-[#0b0d1a]/90 hover:bg-amber-500 hover:text-[#0b0d1a] border-amber-400/60 shadow-[0_0_14px_rgba(245,158,11,0.3)]'
                  }`}
                  title={
                    hasActiveTrailer
                      ? 'Play Official Trailer'
                      : isBroken
                      ? 'Replace Broken Trailer & Earn +10 Tokens'
                      : 'Add Official Trailer & Earn +25 Tokens'
                  }
                >
                  {hasActiveTrailer ? (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current text-cyan-300 group-hover:text-white" />
                      <span>Trailer</span>
                    </>
                  ) : isBroken ? (
                    <>
                      <Coins className="w-3.5 h-3.5 text-rose-400 group-hover:text-current" />
                      <span>Fix Trailer · +10</span>
                    </>
                  ) : (
                    <>
                      <Coins className="w-3.5 h-3.5 text-amber-400 group-hover:text-current" />
                      <span>Add Trailer · +25</span>
                    </>
                  )}
                </button>
              );
            })()}
          </div>

          {/* Card Content */}
          <div className="p-5 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                <Calendar className="w-3.5 h-3.5" />
                {movie.date}
              </span>
              <span className="truncate max-w-[160px] text-slate-400">
                {movie.platform}
              </span>
            </div>

            <h3
              className={`font-bebas text-2xl sm:text-3xl text-white tracking-wide leading-tight transition-colors ${
                isBollywood ? 'group-hover:text-amber-300' : 'group-hover:text-cyan-300'
              }`}
            >
              {movie.name}
            </h3>

            <div className="flex flex-wrap items-center gap-1.5">
              {inferMovieFormats(movie).map((fmt) => (
                <FormatBadge key={fmt} format={fmt} size="xs" />
              ))}
            </div>

            <p className="text-xs text-slate-300 font-inter line-clamp-2 leading-relaxed">
              {movie.tagline}
            </p>
          </div>
        </div>

        {/* Footer: Trusted Source & Actions */}
        <div className="px-5 pb-5 pt-3 border-t border-[#252846]/70 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="flex items-center gap-1 text-emerald-400 truncate max-w-[200px]">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {movie.trustedSourceLabel || 'Verified Cinema Registry'}
              </span>
            </span>
            {movie.sourceUrl && (
              <a
                href={movie.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-slate-400 hover:text-cyan-300 flex items-center gap-1 shrink-0 transition-colors"
                title="Open trusted film registry source"
              >
                <span>Source</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => handleWatchlistToggle(e, movie)}
              className={`flex-1 min-w-[105px] py-2 px-2.5 rounded-xl border text-xs font-inter font-semibold flex items-center justify-center gap-1 transition-all whitespace-nowrap ${
                isSaved
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-[#171a30] text-slate-200 border-[#2b3052] hover:border-cyan-400 hover:text-white'
              }`}
            >
              {isSaved ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Bell className="w-3.5 h-3.5 shrink-0" />}
              <span>{isSaved ? 'Tracked' : 'Remind Me'}</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openNotifyModal({
                  targetId: movie.id,
                  targetName: movie.name,
                  targetType: 'drop',
                  category: 'Movies',
                  targetDate: movie.date
                });
              }}
              className={`py-2 px-2.5 rounded-xl border text-xs font-mono font-semibold flex items-center gap-1 transition-all whitespace-nowrap ${
                hasAlert
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                  : 'bg-[#171a30] border-[#2b3052] text-cyan-300 hover:border-cyan-400 hover:text-white'
              }`}
              title="Set custom alert for this film"
            >
              <BellRing className="w-3.5 h-3.5 shrink-0" />
              <span>{hasAlert ? 'Alert On' : 'Notify'}</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShareMovie(movie);
              }}
              className="py-2 px-2.5 rounded-xl border bg-[#171a30] border-[#2b3052] text-slate-300 hover:border-cyan-400 hover:text-white text-xs font-mono font-semibold flex items-center gap-1 transition-all whitespace-nowrap"
              title="Share movie link & social preview card"
              aria-label={`Share ${movie.name}`}
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      id="cinema-hub"
      className="relative w-full py-16 sm:py-24 lg:py-32 bg-[#0b0d1a] border-y border-[#252846]/60 overflow-x-clip"
    >
      {/* Subtle Dual-Tone Cinema Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[radial-gradient(circle,rgba(34,211,238,0.1)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[radial-gradient(circle,rgba(245,158,11,0.1)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-12">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171a30] border border-[#252846] text-cyan-300 text-xs font-mono font-semibold uppercase tracking-widest mb-3">
              <Clapperboard className="w-3.5 h-3.5 text-[#ff3d71] shrink-0" />
              <span>Verified Theatrical & OTT Slate</span>
            </div>
            <h2 className="font-bebas text-[clamp(2.25rem,6vw,4.5rem)] text-white tracking-wide leading-none text-balance">
              <span className="text-[#22d3ee]">HOLLYWOOD</span> &{' '}
              <span className="text-[#f59e0b]">BOLLYWOOD</span> MOVIES
            </h2>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl font-inter mt-3">
              Upcoming theatrical and streaming premieres auto-updated from trusted film registries (Wikipedia Cinema Lists, Wikidata, TMDB, Deadline Hollywood & Bollywood Hungama).
            </p>
          </div>

          {/* Interactive Controls: Industry Tabs & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 min-w-0">
            <div className="flex flex-nowrap items-center gap-1 p-1 rounded-xl bg-[#121528] border border-[#252846] overflow-x-auto no-scrollbar max-w-full">
              {(
                [
                  { id: 'All', label: 'All Cinema', count: hollywoodMovies.length + bollywoodMovies.length },
                  { id: 'IMAX', label: 'IMAX & 70mm', count: imaxTitles.length },
                  { id: 'Hollywood', label: 'Hollywood', count: hollywoodMovies.length },
                  { id: 'Bollywood', label: 'Bollywood', count: bollywoodMovies.length }
                ] as const
              ).map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-inter font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all ${
                      active
                        ? tab.id === 'Bollywood'
                          ? 'bg-gradient-to-r from-[#f59e0b] to-[#ff3d71] text-white shadow'
                          : tab.id === 'IMAX'
                          ? 'bg-[#ff3d71] text-white font-bold shadow'
                          : 'bg-gradient-to-r from-[#22d3ee] to-[#8b5cf6] text-[#0b0d1a] font-bold shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono tabular-nums ${
                        active ? 'bg-black/20 text-current' : 'bg-[#171a30] text-slate-400'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Filter title, cast, studio..."
                className="w-full sm:w-56 pl-9 pr-3 py-2.5 rounded-xl bg-[#121528] border border-[#252846] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* IMAX & 70mm Showcase Block */}
        {visibleImax && (
          <div className="mb-14">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b border-[#252846]/70">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#ff3d71]/15 border border-[#ff3d71]/40 text-[#ff3d71]">
                  <Clapperboard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bebas text-3xl text-white tracking-wide">
                    IMAX &amp; <span className="text-[#ff3d71]">70MM LARGE FORMAT</span>
                  </h3>
                  <p className="text-xs font-mono text-slate-400">
                    Theatrical IMAX 70mm, IMAX Laser &amp; Global Large-Format Screenings
                  </p>
                </div>
              </div>
            </div>

            {imaxTitles.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#121528] border border-[#252846] text-center text-sm text-slate-400">
                No upcoming IMAX or 70mm releases matched &ldquo;{filterText}&rdquo;.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {imaxTitles.map(renderMovieCard)}
              </div>
            )}
          </div>
        )}

        {/* Hollywood Showcase Block */}
        {visibleHollywood && (
          <div className="mb-14">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b border-[#252846]/70">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bebas text-3xl text-white tracking-wide">
                    HOLLYWOOD <span className="text-[#22d3ee]">UPCOMING</span>
                  </h3>
                  <p className="text-xs font-mono text-slate-400">
                    US Studio Tentpoles, IMAX Premieres & Global Streaming Releases
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  openNotifyModal({
                    targetId: 'cat-hollywood-movies',
                    targetName: 'Hollywood Movies & Trailers',
                    targetType: 'category',
                    category: 'Movies'
                  })
                }
                className="px-3 py-1.5 rounded-xl bg-[#171a30] hover:bg-[#202444] border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Notify All Hollywood</span>
              </button>
            </div>

            {hollywoodMovies.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#121528] border border-[#252846] text-center text-sm text-slate-400">
                No upcoming Hollywood films matched "{filterText}".
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {hollywoodMovies.map(renderMovieCard)}
              </div>
            )}
          </div>
        )}

        {/* Bollywood Showcase Block */}
        {visibleBollywood && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b border-[#252846]/70">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bebas text-3xl text-white tracking-wide">
                    BOLLYWOOD <span className="text-[#f59e0b]">UPCOMING</span>
                  </h3>
                  <p className="text-xs font-mono text-slate-400">
                    Hindi Cinema Theatrical Releases, Festival Tentpoles & OTT Debuts
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  openNotifyModal({
                    targetId: 'cat-bollywood-movies',
                    targetName: 'Bollywood Movies & Trailers',
                    targetType: 'category',
                    category: 'Movies'
                  })
                }
                className="px-3 py-1.5 rounded-xl bg-[#171a30] hover:bg-[#202444] border border-amber-500/40 text-amber-300 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Notify All Bollywood</span>
              </button>
            </div>

            {bollywoodMovies.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#121528] border border-[#252846] text-center text-sm text-slate-400">
                No upcoming Bollywood films matched "{filterText}".
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {bollywoodMovies.map(renderMovieCard)}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
