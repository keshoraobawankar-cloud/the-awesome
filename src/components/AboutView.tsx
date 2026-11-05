import React from 'react';
import { Shield, Award, Users, Camera, Mail, ArrowLeft } from 'lucide-react';
import { useBugle } from '../context/BugleContext';

export const AboutView: React.FC = () => {
  const { navigateTo, setIsBountyModalOpen, setIsJJJRantOpen } = useBugle();

  const mastheadStaff = [
    {
      name: 'J. Jonah Jameson',
      title: 'Publisher & Editor-in-Chief',
      desc: 'Legendary voice of New York print journalism. Fierce advocate for public accountability, civic transparency, and unmasking costumed vigilantes.',
      badge: 'Executive Suite'
    },
    {
      name: 'Joseph "Robbie" Robertson',
      title: 'Senior Managing Editor',
      desc: 'Pulitzer-nominated veteran journalist guiding the Bugle newsroom with calm integrity, rigorous fact-checking, and balanced reporting.',
      badge: 'City Desk'
    },
    {
      name: 'Peter Parker',
      title: 'Staff Photojournalist',
      desc: 'Freelance shutterbug with an uncanny ability to capture exclusive, up-close rooftop action shots of Spider-Man across Manhattan.',
      badge: 'Darkroom'
    },
    {
      name: 'Betty Brant',
      title: 'Senior Metro Correspondent',
      desc: 'Former executive secretary turned hard-hitting investigative reporter covering Oscorp conglomerates and City Hall politics.',
      badge: 'Investigations'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <button
        onClick={() => navigateTo('home')}
        className="flex items-center gap-1.5 text-xs font-sans font-semibold text-[#78716c] dark:text-[#a8a29e] hover:text-red-700 dark:hover:text-red-400 mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Front Page</span>
      </button>

      {/* Hero Masthead Presentation */}
      <div className="border-b-2 border-[#1c1917] dark:border-[#262629] pb-8 mb-8 text-center sm:text-left">
        <div className="inline-block bg-red-700 text-white font-headline text-xs uppercase px-2.5 py-0.5 tracking-widest mb-3">
          ESTABLISHED 1898 · MIDTOWN MANHATTAN
        </div>
        <h1 className="font-serif-display font-black text-3xl sm:text-5xl text-[#1c1917] dark:text-white uppercase tracking-tight">
          The Daily Bugle News Corp.
        </h1>
        <p className="mt-3 text-base sm:text-lg font-editorial text-[#57534e] dark:text-[#d6d3d1] italic max-w-2xl">
          "New York's Hardest-Hitting Newspaper. We print the stories others are too afraid to touch."
        </p>
      </div>

      {/* Editorial Mission */}
      <div className="prose prose-stone dark:prose-invert max-w-none mb-12">
        <h2 className="font-headline font-bold text-2xl text-[#1c1917] dark:text-white uppercase tracking-tight">
          Our Editorial Creed
        </h2>
        <p className="font-editorial text-base sm:text-lg text-[#292524] dark:text-[#e7e5e4] leading-relaxed">
          From our landmark tower on East 39th Street, The Daily Bugle has chronicled the trials, triumphs, and tribulations of the world's greatest metropolis for over a century. While rival newsstands chase hollow clickbait, our reporters pound the pavement of every borough to bring you verifiable truth.
        </p>
        <p className="font-editorial text-base sm:text-lg text-[#292524] dark:text-[#e7e5e4] leading-relaxed">
          In an era where unauthorized individuals take the law into their own hands, our responsibility is clearer than ever: to shine a piercing spotlight onto the shadows and ensure that no one—regardless of superpowers, masks, or corporate fortunes—operates above the public interest.
        </p>
      </div>

      {/* Masthead Team Grid */}
      <div className="mb-12">
        <h2 className="font-headline font-bold text-xl sm:text-2xl text-[#1c1917] dark:text-white uppercase tracking-tight mb-6 flex items-center gap-2">
          <Users className="w-5 h-5 text-red-700 dark:text-red-500" />
          <span>The Newsroom Masthead</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {mastheadStaff.map((staff) => (
            <div
              key={staff.name}
              className="p-5 bg-white dark:bg-[#18181c] border border-[#e5dfd5] dark:border-[#262629] rounded-sm"
            >
              <div className="flex items-center justify-between text-xs font-sans text-red-700 dark:text-red-400 font-bold uppercase tracking-wider mb-1">
                <span>{staff.title}</span>
                <span className="text-[#a8a29e] font-normal">{staff.badge}</span>
              </div>
              <h3 className="font-serif-display font-bold text-lg text-[#1c1917] dark:text-white">
                {staff.name}
              </h3>
              <p className="mt-2 text-xs font-sans text-[#57534e] dark:text-[#a8a29e] leading-relaxed">
                {staff.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Spider-Man Photo Bounty Box */}
      <div className="p-6 sm:p-8 bg-red-700 text-white rounded-sm shadow-md">
        <div className="flex items-center gap-2 text-xs font-headline tracking-widest uppercase mb-2 text-red-200">
          <Camera className="w-4 h-4 text-white" />
          <span>OFFICIAL PRESS NOTICE · BUGLE PHOTO DESK</span>
        </div>
        <h3 className="font-serif-display font-black text-2xl sm:text-3xl text-white mb-2">
          $10,000 CASH FOR EXCLUSIVE PHOTOS OF SPIDER-MAN!
        </h3>
        <p className="font-editorial text-sm sm:text-base text-red-100 leading-relaxed mb-4">
          Are you a photographer, bystander, or freelancer with high-resolution photo or video evidence of Spider-Man in action? Deliver negatives or memory cards to the 4th Floor Darkroom. Top dollar paid on the spot for front-facing, unmasked shots!
        </p>
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex flex-wrap items-center gap-3 text-xs font-sans font-bold">
            <span className="bg-white/20 px-3 py-1.5 rounded">Deliver to: 39th St. & 2nd Ave</span>
            <span className="bg-white/20 px-3 py-1.5 rounded">Attn: J. Jonah Jameson</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsJJJRantOpen(true)}
              className="px-4 py-2 bg-black/40 hover:bg-black/60 text-white rounded text-xs font-sans font-bold uppercase tracking-wider transition-colors"
            >
              Hear Jameson's Demand
            </button>
            <button
              onClick={() => setIsBountyModalOpen(true)}
              className="px-5 py-2 bg-white text-red-700 hover:bg-red-50 rounded text-xs font-sans font-bold uppercase tracking-wider transition-colors shadow-md"
            >
              Claim $10,000 Bounty Now →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
