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
import { Toast } from '../Toast';
import { DropTitle } from '../../data/dropRadarData';
import { playWhooshSound } from '../../utils/audio';
import { useBugle } from '../../context/BugleContext';
import { useDropData } from '../../context/DropDataContext';

gsap.registerPlugin(ScrollTrigger);

export const DropRadarApp: React.FC = () => {
  const lenisRef = useRef<Lenis | null>(null);
  const deepLinkHandledRef = useRef(false);
  const { isAudioDeskEnabled } = useBugle();
  const { drops } = useDropData();

  const [selectedCategory, setSelectedCategory] = useState('All');
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

  const openDropModal = (drop: DropTitle, playTrailer = false) => {
    setAutoPlayTrailer(playTrailer);
    setActiveModalDrop(drop);
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
    if (el && lenisRef.current) {
      lenisRef.current.scrollTo(el, { offset: -60, duration: 1.4 });
    }
  };

  const handleScrollToTop = () => {
    if (isAudioDeskEnabled) {
      playWhooshSound();
    }
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { duration: 1.6 });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0b0d1a] text-slate-100 font-inter selection:bg-[#ff3d71] selection:text-white overflow-x-hidden">
      {/* Custom Glowing Cursor */}
      <CustomCursor />

      {/* Sticky DropNavbar */}
      <DropNavbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenWatchlist={() => setIsWatchlistOpen(true)}
        onOpenUserUpdates={() => {
          setUpdateTarget({});
          setIsUserUpdateModalOpen(true);
        }}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        onScrollToSection={handleScrollToSection}
      />

      {/* Main Cinematic Scroll Story */}
      <main className="relative">
        {/* 1. Intro Section (Pinned, 100vh) */}
        <IntroSection onScrollNext={() => handleScrollToSection('hero-countdown')} />

        {/* 2. Hero Countdown Section (Pinned) */}
        <HeroCountdownSection onOpenModal={(drop) => openDropModal(drop, false)} />

        {/* 3. Hollywood & Bollywood Cinema Hub */}
        <HollywoodBollywoodSection
          onOpenModal={openDropModal}
          onShareMovie={(drop) => setShareMovieDrop(drop)}
        />

        {/* 4. Category Showcase Section (Horizontal Scroll Pin) */}
        <CategoryShowcaseSection
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          onScrollToTimeline={() => handleScrollToSection('timeline')}
        />

        {/* 5. This Week Timeline (Scroll-Linked) */}
        <TimelineSection onOpenModal={(drop) => openDropModal(drop, false)} />

        {/* 6. Poster Parallax Gallery (3 Columns Asynchronous) */}
        <PosterGallerySection onOpenModal={(drop) => openDropModal(drop, false)} />

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

      <SetNotificationModal />
      <NotificationsDrawer />

      {/* Toast Notification Container */}
      <Toast />
    </div>
  );
};
