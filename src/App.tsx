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
import { Toast } from './components/Toast';

const AppContent: React.FC = () => {
  const { activePage, activeStoryId } = useBugle();

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfaf7] dark:bg-[#111113] text-[#1c1917] dark:text-[#f3f4f6] font-body transition-colors duration-200">
      {/* Header with Top Bar, Masthead & Breaking News */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1">
        {activePage === 'home' && <HomeView />}
        {activePage === 'article' && <ArticleView storyId={activeStoryId || ''} />}
        {activePage === 'saved' && <SavedStoriesView />}
        {activePage === 'about' && <AboutView />}
      </main>

      {/* Daily Bugle Footer */}
      <Footer />

      {/* Action Notification Toast */}
      <Toast />
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
