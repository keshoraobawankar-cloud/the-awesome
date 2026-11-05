import React from 'react';
import { Newspaper, Heart } from 'lucide-react';
import { useBugle } from '../context/BugleContext';

export const Footer: React.FC = () => {
  const { navigateTo, setSelectedCategory, setIsBountyModalOpen, setIsJJJRantOpen, triggerWebShooter } = useBugle();

  return (
    <footer className="no-print mt-20 border-t-2 border-[#1c1917] dark:border-[#262629] bg-[#f5f1ea] dark:bg-[#141417] text-[#57534e] dark:text-[#a8a29e] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-red-700 text-white font-headline text-lg font-bold px-2 py-0.5 tracking-tighter uppercase rounded-sm">
                THE
              </span>
              <span className="font-headline font-bold text-xl text-[#1c1917] dark:text-white uppercase tracking-tight">
                DAILY BUGLE
              </span>
            </div>
            <p className="font-editorial text-sm text-[#44403c] dark:text-[#d6d3d1] max-w-md leading-relaxed">
              New York's Hardest-Hitting Daily Broadsheet since 1898. Published continuously from the Daily Bugle Building on East 39th Street, Manhattan.
            </p>
            <div className="mt-4 text-xs font-sans text-[#78716c] dark:text-[#a8a29e]">
              Publisher & Editor-in-Chief: <span className="font-semibold text-[#1c1917] dark:text-white">J. Jonah Jameson</span>
            </div>
          </div>

          {/* Quick Departments */}
          <div>
            <h4 className="font-headline font-bold text-xs uppercase tracking-widest text-[#1c1917] dark:text-white mb-3">
              Editorial Desks
            </h4>
            <ul className="space-y-2 text-xs font-sans">
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('Exclusives');
                    navigateTo('home');
                  }}
                  className="hover:text-red-700 dark:hover:text-red-400 transition-colors"
                >
                  Exclusives & Scoops
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('Opinion');
                    navigateTo('home');
                  }}
                  className="hover:text-red-700 dark:hover:text-red-400 transition-colors"
                >
                  Jameson's Opinion
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('Crime & Justice');
                    navigateTo('home');
                  }}
                  className="hover:text-red-700 dark:hover:text-red-400 transition-colors"
                >
                  Crime & Justice
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('City Beat');
                    navigateTo('home');
                  }}
                  className="hover:text-red-700 dark:hover:text-red-400 transition-colors"
                >
                  Five Boroughs City Beat
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('Tech & Science');
                    navigateTo('home');
                  }}
                  className="hover:text-red-700 dark:hover:text-red-400 transition-colors"
                >
                  Tech & Science
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('radar')}
                  className="hover:text-red-700 dark:hover:text-red-400 font-bold transition-colors text-red-700 dark:text-red-400"
                >
                  Pop Culture & Book Radar
                </button>
              </li>
            </ul>
          </div>

          {/* Reader Tools */}
          <div>
            <h4 className="font-headline font-bold text-xs uppercase tracking-widest text-[#1c1917] dark:text-white mb-3">
              Reader Services
            </h4>
            <ul className="space-y-2 text-xs font-sans">
              <li>
                <button
                  onClick={() => navigateTo('saved')}
                  className="hover:text-red-700 dark:hover:text-red-400 transition-colors"
                >
                  Saved Stories Archive
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('about')}
                  className="hover:text-red-700 dark:hover:text-red-400 transition-colors"
                >
                  Masthead & History
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    navigateTo('home');
                  }}
                  className="hover:text-red-700 dark:hover:text-red-400 transition-colors"
                >
                  Front Page Edition
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsBountyModalOpen(true)}
                  className="text-red-700 dark:text-red-400 font-bold hover:underline transition-colors"
                >
                  Bugle Photo Bounty ($10,000)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsJJJRantOpen(true)}
                  className="hover:text-red-700 dark:hover:text-red-400 transition-colors"
                >
                  JJJ Angry Rant Hotline
                </button>
              </li>
              <li>
                <button
                  onClick={triggerWebShooter}
                  className="hover:text-red-700 dark:hover:text-red-400 transition-colors inline-flex items-center gap-1"
                  title="Easter Egg: Press 'W' anytime or click here"
                >
                  <span>🕷️ Vigilante Web Mode</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal / Project Disclaimer */}
        <div className="pt-6 border-t border-[#e5dfd5] dark:border-[#262629] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-[#78716c] dark:text-[#a8a29e]">
          <div>
            © 2026 The Daily Bugle Publishing Corp. All rights reserved.
          </div>
          <div className="text-center sm:text-right">
            <span>Built for Web Development Task · React & Tailwind CSS</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
