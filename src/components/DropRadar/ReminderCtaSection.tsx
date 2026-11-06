import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Sparkles, Mail, Send, ArrowRight } from 'lucide-react';
import { playBellChimeSound } from '../../utils/audio';
import { useBugle } from '../../context/BugleContext';
import confetti from 'canvas-confetti';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const ReminderCtaSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { showToast, isAudioDeskEnabled } = useBugle();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Bell shake animation when section enters viewport
      gsap.to(bellRef.current, {
        rotation: 18,
        yoyo: true,
        repeat: 7,
        duration: 0.12,
        ease: 'power1.inOut',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 70%'
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid dispatch email address.');
      return;
    }

    setIsSubmitted(true);
    if (isAudioDeskEnabled) {
      playBellChimeSound();
    }
    showToast(`Tickora Alerts Activated for ${email}!`);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff3d71', '#8b5cf6', '#22d3ee', '#10b981']
    });
  };

  return (
    <section
      id="reminders"
      ref={containerRef}
      className="relative w-full py-28 sm:py-36 overflow-hidden bg-gradient-to-b from-[#0b0d1a] via-[#1a1333] to-[#0b0d1a]"
    >
      {/* Dynamic Animated Shifting Background Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.25)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-[radial-gradient(circle,rgba(34,211,238,0.2)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-80 bg-[radial-gradient(circle,rgba(255,61,113,0.2)_0%,transparent_60%)] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        {/* Shaking Bell Icon */}
        <div
          ref={bellRef}
          className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#ff3d71] via-[#8b5cf6] to-[#22d3ee] p-[2px] shadow-[0_0_40px_rgba(139,92,246,0.6)] mb-8 transform origin-top"
        >
          <div className="w-full h-full bg-[#0b0d1a] rounded-[22px] flex items-center justify-center">
            <Bell className="w-10 h-10 text-cyan-300" />
          </div>
        </div>

        {/* Heading */}
        <h2 className="font-bebas text-5xl sm:text-7xl md:text-8xl text-white tracking-tight leading-none mb-4">
          NEVER MISS A <span className="text-glow-cyan text-cyan-400">MIDNIGHT DROP</span>
        </h2>

        <p className="text-slate-300 text-base sm:text-xl font-inter max-w-2xl mx-auto mb-10 leading-relaxed">
          Lock in instant alerts 24 hours before tickets open, pre-loads unlock, or surprise dates slip. Zero noise, only verified drops.
        </p>

        {/* Signup Form */}
        {isSubmitted ? (
          <div className="p-6 rounded-2xl bg-[#121528] border border-emerald-500/50 max-w-md mx-auto flex items-center justify-center gap-3 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <Check className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            <div className="text-left font-inter">
              <p className="font-bold text-white text-sm">You are on the Priority Wire!</p>
              <p className="text-xs text-slate-300">Confirmation dispatched to {email}.</p>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto"
          >
            <div className="relative w-full">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email for drop alerts..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#121528]/90 border border-[#2b3052] focus:border-cyan-400 focus:outline-none text-white text-sm sm:text-base font-inter placeholder:text-slate-500 backdrop-blur-md shadow-inner transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto flex-shrink-0 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#ff3d71] via-[#8b5cf6] to-[#22d3ee] hover:opacity-95 text-white font-inter font-bold text-sm sm:text-base shadow-[0_0_25px_rgba(255,61,113,0.5)] hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <span>Activate Alerts</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Micro guarantees */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            One-Click Calendar Sync (.ics)
          </span>
          <span>•</span>
          <span>No Spam Guarantee</span>
          <span>•</span>
          <span>Free Forever</span>
        </div>
      </div>
    </section>
  );
};
