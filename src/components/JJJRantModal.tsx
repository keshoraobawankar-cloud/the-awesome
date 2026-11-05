import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, X, RefreshCw, Copy, Check, Quote, Flame, Newspaper } from 'lucide-react';
import { useBugle } from '../context/BugleContext';
import { playDeskSlamSound, playTypewriterSound, speakJamesonQuote, stopSpeech } from '../utils/audio';

const JJJ_RANTS = [
  {
    quote: "PARKER! Where are my pictures of Spider-Man?! I don't pay you to be a sensitive artist, I pay you because that web-slinging psycho keeps making my front page!",
    context: "Shouted while slamming a half-smoked cigar into an overflowing glass ashtray."
  },
  {
    quote: "He's a menace! A costumed delinquent running around my city in red and blue spandex! No decent, law-abiding citizen wears a mask unless they're planning a felony!",
    context: "Dictated to Betty Brant at 85 words per minute while pacing the executive floor."
  },
  {
    quote: "He saved forty commuters from a falling crane?! That crane wouldn't have collapsed if he hadn't tethered his high-tensile illegal webbing to the hydraulic counterweight!",
    context: "Response to Robbie Robertson pointing out the Department of Transportation incident report."
  },
  {
    quote: "Miss Brant! Cancel my eleven o'clock! Call the mayor! Tell him if he doesn't order the NYPD to shoot down that unauthorized web-glider, the Bugle will endorse his opponent tomorrow morning!",
    context: "Shouted into three separate telephone receivers simultaneously."
  },
  {
    quote: "You call this photography, Parker?! It’s blurry, the framing is crooked, and I can't even see the menace's mask! I'll give you fifty bucks for the negative, and consider yourself lucky!",
    context: "Tossing an 8x10 glossy print across a mahogany desk covered in newsprint galleys."
  },
  {
    quote: "Truth? Civic duty? I'll tell you what civic duty is! It's selling 800,000 copies before noon and holding masked vigilantes accountable to the public interest! Now get out of my office!",
    context: "Concluding his daily editorial board meeting with a decisive fist slam."
  },
  {
    quote: "Look at this headline: 'Spider-Man Foils Bank Robbery'. BORING! Rewrite it: 'SPIDER-MAN: ACCOMPLICE IN MIDTOWN HEIST?' Put it in 72-point condensed bold!",
    context: "Red-lining the front page broadsheet layout with a scarlet grease pencil."
  },
  {
    quote: "A spider has eight legs. Spider-Man has two legs and two arms. That’s four limbs! He’s not even an accurate arachnid! He’s an impostor and a fraud!",
    context: "Late-night radio guest appearance on WNYX Talk Radio."
  }
];

export const JJJRantModal: React.FC = () => {
  const { isJJJRantOpen, setIsJJJRantOpen, showToast } = useBugle();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentRant = JJJ_RANTS[currentIndex];

  useEffect(() => {
    // When modal opens, pick a random rant
    if (isJJJRantOpen) {
      const randIdx = Math.floor(Math.random() * JJJ_RANTS.length);
      setCurrentIndex(randIdx);
      setIsPlayingAudio(false);
    } else {
      stopSpeech();
    }
  }, [isJJJRantOpen]);

  // Clean up speech synthesis when unmounting
  useEffect(() => {
    return () => stopSpeech();
  }, []);

  if (!isJJJRantOpen) return null;

  const handleNextRant = () => {
    stopSpeech();
    setIsPlayingAudio(false);
    playDeskSlamSound();
    let nextIdx = Math.floor(Math.random() * JJJ_RANTS.length);
    if (nextIdx === currentIndex) {
      nextIdx = (currentIndex + 1) % JJJ_RANTS.length;
    }
    setCurrentIndex(nextIdx);
  };

  const handleToggleVoice = () => {
    if (isPlayingAudio) {
      stopSpeech();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      playTypewriterSound();
      const spoke = speakJamesonQuote(currentRant.quote, () => {
        setIsPlayingAudio(false);
      });
      if (!spoke) {
        showToast('Speech synthesis not available in this browser window.');
        setIsPlayingAudio(false);
      }
    }
  };

  const handleCopyQuote = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`"${currentRant.quote}" — J. Jonah Jameson, The Daily Bugle`);
      setCopied(true);
      showToast('Jameson rant copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        onClick={() => {
          stopSpeech();
          setIsJJJRantOpen(false);
        }}
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl bg-[#fcfaf7] dark:bg-[#151518] text-[#1c1917] dark:text-[#f3f4f6] rounded border-2 border-red-700 shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Masthead Header */}
        <div className="bg-red-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-300 animate-pulse" />
            <div>
              <div className="text-[10px] font-headline tracking-widest uppercase text-red-200">
                OFFICIAL EDITORIAL HOTLINE
              </div>
              <h2 className="font-serif-display font-black text-xl text-white">
                J. JONAH JAMESON'S ANGRY RANT GENERATOR
              </h2>
            </div>
          </div>
          <button
            onClick={() => {
              stopSpeech();
              setIsJJJRantOpen(false);
            }}
            aria-label="Close rant generator"
            className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6">
          {/* Jameson Portrait & Quote Banner */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
            <div className="w-20 h-20 rounded-full border-2 border-red-700 overflow-hidden shrink-0 shadow-md">
              <img
                src="/src/assets/images/jj_jameson_editorial_1793361604257.jpg"
                alt="J. Jonah Jameson shouting"
                className="w-full h-full object-cover scale-110"
              />
            </div>
            <div className="text-center sm:text-left flex-1">
              <div className="text-xs font-sans font-bold uppercase tracking-wider text-red-700 dark:text-red-400">
                J. Jonah Jameson · Publisher & Editor-in-Chief
              </div>
              <div className="text-[11px] font-sans text-[#78716c] dark:text-[#a8a29e] mt-0.5">
                The Daily Bugle News Building, 39th St. Manhattan
              </div>
            </div>
          </div>

          {/* Quote Speech Bubble */}
          <div className="relative p-5 sm:p-6 bg-white dark:bg-[#1d1d22] border-2 border-[#1c1917] dark:border-[#2f2f36] rounded shadow-xs mb-4">
            <Quote className="w-8 h-8 text-red-700/40 dark:text-red-500/30 absolute top-3 left-3" />
            <p className="relative font-serif-display font-black text-lg sm:text-xl text-[#1c1917] dark:text-white leading-snug pl-4 italic">
              "{currentRant.quote}"
            </p>
            <div className="mt-4 pt-3 border-t border-[#ece7de] dark:border-[#2b2b31] text-xs font-sans text-[#57534e] dark:text-[#a8a29e] italic">
              📍 {currentRant.context}
            </div>
          </div>

          {/* Interactive Utility Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleVoice}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-sans font-bold rounded transition-colors ${
                  isPlayingAudio
                    ? 'bg-red-700 text-white animate-pulse'
                    : 'bg-[#ede8df] dark:bg-[#232328] text-[#1c1917] dark:text-[#f3f4f6] hover:bg-[#e2dcce]'
                }`}
                title="Hear Jameson's quote spoken aloud"
              >
                {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isPlayingAudio ? 'Stop Speech' : 'Play JJJ Voice'}</span>
              </button>

              <button
                onClick={handleCopyQuote}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-medium bg-[#ede8df] dark:bg-[#232328] hover:bg-[#e2dcce] text-[#57534e] dark:text-[#d6d3d1] rounded transition-colors"
                title="Copy editorial rant"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <button
              onClick={handleNextRant}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-sans font-bold uppercase tracking-wider rounded transition-colors shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Slam Desk / New Rant!</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
