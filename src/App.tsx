/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BugleProvider, useBugle } from './context/BugleContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { ArticleView } from './components/ArticleView';
import { SavedStoriesView } from './components/SavedStoriesView';
import { AboutView } from './components/AboutView';
import { ReleaseRadarView } from './components/ReleaseRadarView';
import { Toast } from './components/Toast';
import { SavedStoriesDrawer } from './components/SavedStoriesDrawer';
import { BountyModal } from './components/BountyModal';
import { JJJRantModal } from './components/JJJRantModal';
import { VigilanteWebOverlay } from './components/VigilanteWebOverlay';

const AppContent: React.FC = () => {
  const { activePage, activeStoryId } = useBugle();

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfaf7] dark:bg-[#111113] text-[#1c1917] dark:text-[#f3f4f6] font-body transition-colors duration-200 relative selection:bg-red-700 selection:text-white">
      {/* Header with Top Bar, Masthead & Breaking News */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1">
        {activePage === 'home' && <HomeView />}
        {activePage === 'radar' && <ReleaseRadarView />}
        {activePage === 'article' && <ArticleView storyId={activeStoryId || ''} />}
        {activePage === 'saved' && <SavedStoriesView />}
        {activePage === 'about' && <AboutView />}
      </main>

      {/* Daily Bugle Footer */}
      <Footer />

      {/* Action Notification Toast */}
      <Toast />

      {/* Slide-over Saved Stories Manager Drawer */}
      <SavedStoriesDrawer />

      {/* Spider-Man $10,000 Bounty Photo Upload Modal */}
      <BountyModal />

      {/* J. Jonah Jameson Angry Rant Generator Modal */}
      <JJJRantModal />

      {/* Easter Egg Vigilante Web-Shooter Overlay */}
      <VigilanteWebOverlay />
    </div>
  );
};

export default function App() {
  return (
    <BugleProvider>
      <AppContent />
    </BugleProvider>
  );
}
