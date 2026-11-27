import React, { useEffect, useState, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { CustomCursor } from './CustomCursor';
import { DropNavbar } from './DropNavbar';
import { IntroSection } from './IntroSection';
import { HeroCountdownSection } from './HeroCountdownSection';
import { HollywoodBollywoodSection } from './HollywoodBollywoodSection';
import { CategoryShowcaseSection } from './CategoryShowcaseSection';
import { TimelineSection } from './TimelineSection';
import { PosterGallerySection } from './PosterGallerySection';
import { StatsSection } from './StatsSection';
import { NewsStackSection } from './NewsStackSection';
import { ReminderCtaSection } from './ReminderCtaSection';
import { DropFooter } from './DropFooter';
import { SearchModal } from './SearchModal';
import { DetailModal } from './DetailModal';
import { WatchlistDrawer } from './WatchlistDrawer';
import { LiveSyncModal } from './LiveSyncModal';
import { UserUpdateModal } from './UserUpdateModal';
import { SetNotificationModal } from './SetNotificationModal';
import { NotificationsDrawer } from './NotificationsDrawer';
import { ShareMovieModal } from './ShareMovieModal';
import { TokenWalletModal } from './TokenWalletModal';
import { OfficialTrailerModal } from './OfficialTrailerModal';
import { CategorySlateModal, SectorCategory } from './CategorySlateModal';
import { Toast } from '../Toast';
import { DropTitle } from '../../data/dropRadarData';
import { playWhooshSound } from '../../utils/audio';
import { useBugle } from '../../context/BugleContext';
import { useDropData } from '../../context/DropDataContext';

gsap.registerPlugin(ScrollTrigger);

export type CategoryFilter =
  | 'All'
  | 'Movies'
  | 'Anime'
  | 'Games'
  | 'Dramas'
  | 'Books'
  | 'Manga'
  | 'Coming Soon';

export const DropRadarApp: React.FC = () => {
  const lenisRef = useRef<Lenis | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);
  const deepLinkHandledRef = useRef(false);
  const { isAudioDeskEnabled } = useBugle();
  const { drops, news } = useDropData();

  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory((prev) => {
      if (cat === 'Coming Soon') {
        return prev === 'Coming Soon' ? 'All' : 'Coming Soon';
      }
      return cat as CategoryFilter;
    });
  };
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [isLiveSyncOpen, setIsLiveSyncOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('admin') === 'true';
    }
    return false;
  });
  const [isUserUpdateModalOpen, setIsUserUpdateModalOpen] = useState(false);
  const [updateTarget, setUpdateTarget] = useState<{ id?: string; name?: string }>({});
  const [activeModalDrop, setActiveModalDrop] = useState<DropTitle | null>(null);
  const [autoPlayTrailer, setAutoPlayTrailer] = useState(false);
  const [shareMovieDrop, setShareMovieDrop] = useState<DropTitle | null>(null);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [trailerModalState, setTrailerModalState] = useState<{
    drop: DropTitle | null;
    mode?: 'submit' | 'view_or_flag';
  }>({ drop: null });
  const [sectorModalState, setSectorModalState] = useState<{
    sector: SectorCategory | null;
    initialMoviesFilter?: 'all' | 'imax' | 'hollywood' | 'bollywood' | 'missing_trailer';
  }>({ sector: null });

  const openDropModal = (drop: DropTitle, playTrailer = false) => {
    setAutoPlayTrailer(playTrailer);
    setActiveModalDrop(drop);
  };

  const openTrailerModal = (drop: DropTitle, mode: 'submit' | 'view_or_flag' = 'submit') => {
    setTrailerModalState({ drop, mode });
  };

  // Support direct ?movie=<id> deep links from social sharing
  useEffect(() => {
    if (deepLinkHandledRef.current || typeof window === 'undefined' || !drops.length) return;
    const movieId = new URLSearchParams(window.location.search).get('movie');
    if (!movieId) return;

    const matched = drops.find((d) => d.id === movieId);
    if (matched) {
      deepLinkHandledRef.current = true;
      setAutoPlayTrailer(false);
      setActiveModalDrop(matched);
      window.setTimeout(() => {
        const cinemaSection = document.getElementById('cinema-hub');
        if (cinemaSection) {
          if (lenisRef.current) {
            lenisRef.current.scrollTo(cinemaSection, { offset: -60, duration: 1.0 });
          } else {
            cinemaSection.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }, 150);
    }
  }, [drops]);

  // Initialize Lenis Smooth Scroll and connect to GSAP ScrollTrigger
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 2.0
    });

    lenisRef.current = lenis;

    // Connect Lenis to ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    const updateLenis = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(updateLenis);
    };
  }, []);

  // Refresh GSAP ScrollTrigger whenever dynamic content (drops/news) or section heights change
  useEffect(() => {
    let rafId: number | null = null;
    let timerId: number | null = null;

    const scheduleRefresh = () => {
      if (timerId !== null) window.clearTimeout(timerId);
      timerId = window.setTimeout(() => {
        if (rafId !== null) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          ScrollTrigger.sort();
          ScrollTrigger.refresh();
        });
      }, 120);
    };

    scheduleRefresh();

    const mainEl = mainRef.current;
    let observer: ResizeObserver | null = null;
    if (mainEl && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        scheduleRefresh();
      });
      observer.observe(mainEl);
    }

    const handleLoad = () => scheduleRefresh();
    window.addEventListener('load', handleLoad);
    window.addEventListener('resize', scheduleRefresh);
    document.fonts?.ready?.then(scheduleRefresh);

    return () => {
      if (timerId !== null) window.clearTimeout(timerId);
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (observer) observer.disconnect();
      window.removeEventListener('load', handleLoad);
      window.removeEventListener('resize', scheduleRefresh);
    };
  }, [drops.length, news.length]);

  // Keyboard shortcut listener for Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Smooth scroll to sections with Lenis
  const handleScrollToSection = (sectionId: string) => {
    if (isAudioDeskEnabled) {
      playWhooshSound();
    }
    const el = document.getElementById(sectionId);
    const headerOffset = typeof window !== 'undefined' && window.innerWidth < 1280 ? -104 : -72;
    if (el && lenisRef.current) {
      lenisRef.current.scrollTo(el, { offset: headerOffset, duration: 1.2 });
    } else if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToTop = () => {
    if (isAudioDeskEnabled) {
      playWhooshSound();
    }
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { duration: 1.4 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-dvh bg-[#0b0d1a] text-slate-100 font-inter selection:bg-[#ff3d71] selection:text-white overflow-x-clip">
      {/* Custom Glowing Cursor */}
      <CustomCursor />

      {/* Sticky DropNavbar */}
      <DropNavbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenWatchlist={() => setIsWatchlistOpen(true)}
        onOpenTokens={() => setIsTokenModalOpen(true)}
        onOpenUserUpdates={() => {
          setUpdateTarget({});
          setIsUserUpdateModalOpen(true);
        }}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        onScrollToSection={handleScrollToSection}
      />

      {/* Main Cinematic Scroll Story */}
      <main ref={mainRef} className="relative">
        {/* 1. Intro Section (Pinned, 100vh) */}
        <IntroSection
          onScrollNext={() => handleScrollToSection('hero-countdown')}
          onOpenModal={(drop) => openDropModal(drop, false)}
        />

        {/* 2. Hero Countdown Section (Pinned) */}
        <HeroCountdownSection onOpenModal={(drop) => openDropModal(drop, false)} />

        {/* 3. Hollywood & Bollywood Cinema Hub */}
        <HollywoodBollywoodSection
          onOpenModal={openDropModal}
          onShareMovie={(drop) => setShareMovieDrop(drop)}
          onOpenTrailerModal={openTrailerModal}
        />

        {/* 4. Category Showcase Section (Horizontal Scroll Pin) */}
        <CategoryShowcaseSection
          onSelectCategory={handleSelectCategory}
          onScrollToTimeline={() => handleScrollToSection('timeline')}
          onOpenSectorSlate={(sector, initialMoviesFilter) =>
            setSectorModalState({ sector, initialMoviesFilter })
          }
          onOpenDropModal={openDropModal}
          onOpenTrailerModal={openTrailerModal}
        />

        {/* 5. This Week Timeline (Scroll-Linked) */}
        <TimelineSection
          onOpenModal={(drop) => openDropModal(drop, false)}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />

        {/* 6. Poster Parallax Gallery (3 Columns Asynchronous) */}
        <PosterGallerySection
          onOpenModal={(drop) => openDropModal(drop, false)}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />

        {/* 6. Stats Section (Telemetry Count-Up) */}
        <StatsSection />

        {/* 7. News Section (Ticker + Sticky Stacking Cards) */}
        <NewsStackSection />

        {/* 8. Reminder CTA (Shifting Gradient + Bell + Form) */}
        <ReminderCtaSection />
      </main>

      {/* 9. Footer */}
      <DropFooter
        onScrollToTop={handleScrollToTop}
        onScrollToSection={handleScrollToSection}
      />

      {/* Interactive Overlays & Modals */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectDrop={(drop) => openDropModal(drop, false)}
      />

      <DetailModal
        drop={activeModalDrop}
        initialPlayTrailer={autoPlayTrailer}
        onClose={() => {
          setActiveModalDrop(null);
          setAutoPlayTrailer(false);
        }}
        onOpenUserUpdate={(id, name) => {
          setUpdateTarget({ id, name });
          setIsUserUpdateModalOpen(true);
        }}
        onShareDrop={(drop) => setShareMovieDrop(drop)}
        onOpenTrailerModal={openTrailerModal}
      />

      <ShareMovieModal
        drop={shareMovieDrop}
        onClose={() => setShareMovieDrop(null)}
      />

      <WatchlistDrawer
        isOpen={isWatchlistOpen}
        onClose={() => setIsWatchlistOpen(false)}
        onSelectDrop={(drop) => openDropModal(drop, false)}
      />

      <LiveSyncModal
        isOpen={isLiveSyncOpen}
        onClose={() => setIsLiveSyncOpen(false)}
      />

      <UserUpdateModal
        isOpen={isUserUpdateModalOpen}
        onClose={() => setIsUserUpdateModalOpen(false)}
        preselectedTitleId={updateTarget.id}
        preselectedTitleName={updateTarget.name}
      />

      <TokenWalletModal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        onSelectDropForTrailer={(drop) => openTrailerModal(drop, 'submit')}
      />

      <OfficialTrailerModal
        drop={trailerModalState.drop}
        initialMode={trailerModalState.mode}
        onClose={() => setTrailerModalState({ drop: null })}
        onOpenWallet={() => setIsTokenModalOpen(true)}
      />

      <CategorySlateModal
        sector={sectorModalState.sector}
        initialMoviesFilter={sectorModalState.initialMoviesFilter}
        onClose={() => setSectorModalState({ sector: null })}
        onOpenModal={openDropModal}
        onOpenTrailerModal={openTrailerModal}
        onShareMovie={(drop) => setShareMovieDrop(drop)}
        onJumpToCinemaHub={() => handleScrollToSection('cinema-hub')}
      />

      <SetNotificationModal />
      <NotificationsDrawer />

      {/* Toast Notification Container */}
      <Toast />
    </div>
  );
};
