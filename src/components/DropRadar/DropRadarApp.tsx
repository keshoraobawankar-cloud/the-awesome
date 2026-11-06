import React, { useEffect, useState, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { CustomCursor } from './CustomCursor';
import { DropNavbar } from './DropNavbar';
import { IntroSection } from './IntroSection';
import { HeroCountdownSection } from './HeroCountdownSection';
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
import { Toast } from '../Toast';
import { DropTitle } from '../../data/dropRadarData';
import { playWhooshSound } from '../../utils/audio';
import { useBugle } from '../../context/BugleContext';

gsap.registerPlugin(ScrollTrigger);

export const DropRadarApp: React.FC = () => {
  const lenisRef = useRef<Lenis | null>(null);
  const { isAudioDeskEnabled } = useBugle();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [isLiveSyncOpen, setIsLiveSyncOpen] = useState(false);
  const [isUserUpdateModalOpen, setIsUserUpdateModalOpen] = useState(false);
  const [updateTarget, setUpdateTarget] = useState<{ id?: string; name?: string }>({});
  const [activeModalDrop, setActiveModalDrop] = useState<DropTitle | null>(null);

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
        onOpenLiveSync={() => setIsLiveSyncOpen(true)}
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
        <HeroCountdownSection onOpenModal={(drop) => setActiveModalDrop(drop)} />

        {/* 3. Category Showcase Section (Horizontal Scroll Pin) */}
        <CategoryShowcaseSection
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          onScrollToTimeline={() => handleScrollToSection('timeline')}
        />

        {/* 4. This Week Timeline (Scroll-Linked) */}
        <TimelineSection onOpenModal={(drop) => setActiveModalDrop(drop)} />

        {/* 5. Poster Parallax Gallery (3 Columns Asynchronous) */}
        <PosterGallerySection onOpenModal={(drop) => setActiveModalDrop(drop)} />

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
        onSelectDrop={(drop) => setActiveModalDrop(drop)}
      />

      <DetailModal
        drop={activeModalDrop}
        onClose={() => setActiveModalDrop(null)}
        onOpenUserUpdate={(id, name) => {
          setUpdateTarget({ id, name });
          setIsUserUpdateModalOpen(true);
        }}
      />

      <WatchlistDrawer
        isOpen={isWatchlistOpen}
        onClose={() => setIsWatchlistOpen(false)}
        onSelectDrop={(drop) => setActiveModalDrop(drop)}
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

      {/* Toast Notification Container */}
      <Toast />
    </div>
  );
};
