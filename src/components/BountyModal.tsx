import React, { useState } from 'react';
import { Camera, X, Upload, CheckCircle2, DollarSign, Award, AlertTriangle, FileText, Image as ImageIcon } from 'lucide-react';
import { useBugle, BountySubmission } from '../context/BugleContext';
import { playDeskSlamSound, playTypewriterSound } from '../utils/audio';

// Pre-seeded high quality mock photos from the Bugle Darkroom archives
const MOCK_PHOTO_PRESETS = [
  {
    id: 'preset_vault',
    title: 'Midtown Vault Web Aftermath',
    description: 'Spider-Man pinning heavy vault door against masked robbers.',
    url: '/src/assets/images/bank_heist_web_aftermath_1793361604681.jpg',
    defaultPitch: 'Web-Slinger traps armed vault robbers with high-tensile netting!'
  },
  {
    id: 'preset_oscorp',
    title: 'Oscorp Tower Atmospheric Dogfight',
    description: 'Vigilante dodging emerald energy blasts above East 42nd St.',
    url: '/src/assets/images/oscorp_tower_investigation_1793361605278.jpg',
    defaultPitch: 'Shocking rooftop dogfight: Unmasked glider pilot attacks Midtown!'
  },
  {
    id: 'preset_jjj',
    title: 'Jameson Newsroom Live Rant',
    description: 'J. Jonah Jameson pounding his desk demanding Parker get photos.',
    url: '/src/assets/images/jj_jameson_editorial_1793361604257.jpg',
    defaultPitch: 'Exclusive behind-the-scenes shot inside the Bugle Editor-in-Chief suite!'
  }
];

export const BountyModal: React.FC = () => {
  const { isBountyModalOpen, setIsBountyModalOpen, addBountySubmission, showToast } = useBugle();

  const [photographerName, setPhotographerName] = useState('Peter Parker');
  const [location, setLocation] = useState('Queensboro Bridge Overpass');
  const [villainSubject, setVillainSubject] = useState('Spider-Man');
  const [headlinePitch, setHeadlinePitch] = useState('Masked Vigilante caught on rooftop girder saving runaway commuter van!');
  const [selectedPresetUrl, setSelectedPresetUrl] = useState<string>(MOCK_PHOTO_PRESETS[0].url);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [exclusiveRights, setExclusiveRights] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<BountySubmission | null>(null);

  if (!isBountyModalOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG/PNG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setCustomImage(event.target.result);
        setSelectedPresetUrl('');
        playTypewriterSound();
        showToast('Photo loaded into the Bugle Darkroom enlarger!');
      }
    };
    reader.readAsDataURL(file);
  };

  const activeImageUrl = customImage || selectedPresetUrl;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeImageUrl) {
      showToast('Please upload or select a photograph first!');
      return;
    }

    setIsSubmitting(true);
    playDeskSlamSound();

    setTimeout(() => {
      // Randomized J. Jonah Jameson review verdict
      const outcomes: Array<{
        verdict: 'approved' | 'lowballed' | 'rejected';
        payoutAmount: string;
        jjjRemark: string;
      }> = [
        {
          verdict: 'approved',
          payoutAmount: '$10,000.00',
          jjjRemark: 'CASH THE CHECK, MISS BRANT! IT’S FRONT PAGE MATERIAL! Print a million copies before the afternoon rush!'
        },
        {
          verdict: 'lowballed',
          payoutAmount: '$175.00',
          jjjRemark: 'The framing is crooked and the lighting is atrocious, Parker! I’ll give you a hundred and seventy-five bucks and not a nickel more! Take it or walk!'
        },
        {
          verdict: 'approved',
          payoutAmount: '$5,000.00',
          jjjRemark: 'Sensational composition! Still doesn’t prove he isn’t working with the Green Goblin, but it will sell broadsheets in all five boroughs!'
        },
        {
          verdict: 'lowballed',
          payoutAmount: '$350.00',
          jjjRemark: 'You call this 8K journalism? The mask is partially obscured by web-fluid! I’ll pay three-fifty, but you buy the next round of coffee!'
        }
      ];

      const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];

      const record = addBountySubmission({
        photographerName: photographerName || 'Peter Parker',
        location: location || 'Midtown Manhattan',
        villainSubject: villainSubject || 'Spider-Man',
        headlinePitch: headlinePitch || 'Exclusive Scoop',
        imageDataUrl: activeImageUrl,
        imageAlt: `${villainSubject} photographed at ${location}`,
        verdict: outcome.verdict,
        payoutAmount: outcome.payoutAmount,
        jjjRemark: outcome.jjjRemark
      });

      setSubmittedResult(record);
      setIsSubmitting(false);
      showToast(`Jameson verdict: ${outcome.payoutAmount} payout authorized!`);
    }, 600);
  };

  const handleResetForNew = () => {
    setSubmittedResult(null);
    setHeadlinePitch('New high-resolution rooftop action sequence!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={() => setIsBountyModalOpen(false)}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[#fcfaf7] dark:bg-[#141417] text-[#1c1917] dark:text-[#f3f4f6] rounded border border-[#e7e2d9] dark:border-[#262629] shadow-2xl z-10 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Masthead Header */}
        <div className="bg-red-700 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-headline tracking-widest text-red-200">
                DAILY BUGLE PHOTOJOURNALISM DESK
              </div>
              <h2 className="font-serif-display font-black text-xl sm:text-2xl text-white tracking-tight">
                $10,000 SPIDER-MAN PHOTO BOUNTY PORTAL
              </h2>
            </div>
          </div>
          <button
            onClick={() => setIsBountyModalOpen(false)}
            aria-label="Close photo bounty portal"
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {submittedResult ? (
            /* Result Review Verdict Presentation */
            <div className="text-center py-4 space-y-5 animate-in fade-in duration-200">
              <div className="inline-block p-2 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 mb-1">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="border-2 border-dashed border-red-700/60 p-6 bg-[#faf8f4] dark:bg-[#18181c] rounded relative overflow-hidden">
                <div className="absolute top-2 right-3 uppercase font-headline text-2xl font-black text-red-700/30 dark:text-red-500/20 rotate-[-12deg] pointer-events-none">
                  VERIFIED BY J.J.J.
                </div>

                <div className="text-xs font-sans font-bold uppercase tracking-widest text-red-700 dark:text-red-400 mb-1">
                  OFFICIAL CASH VOUCHER NO. #BG-{Math.floor(Math.random() * 89999 + 10000)}
                </div>
                <div className="font-serif-display font-black text-3xl sm:text-4xl text-[#1c1917] dark:text-white tabular-nums">
                  PAYOUT: {submittedResult.payoutAmount}
                </div>
                <div className="text-xs font-sans text-[#78716c] dark:text-[#a8a29e] mt-1">
                  Payable to: <strong>{submittedResult.photographerName}</strong> for exclusive rights
                </div>

                {/* Submitted Photo Preview */}
                <div className="mt-4 max-w-sm mx-auto rounded overflow-hidden border border-[#d6cfc2] dark:border-[#2d2d34]">
                  <img
                    src={submittedResult.imageDataUrl}
                    alt="Submitted Scoop"
                    className="w-full h-44 object-cover"
                  />
                </div>

                {/* Jameson Review Note */}
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded text-left">
                  <div className="text-[11px] font-headline uppercase font-bold text-red-700 dark:text-red-400 tracking-wider mb-1">
                    Publisher's Verdict & Newsroom Note:
                  </div>
                  <p className="font-editorial text-sm sm:text-base text-[#1c1917] dark:text-[#f3f4f6] italic leading-relaxed">
                    "{submittedResult.jjjRemark}"
                  </p>
                  <div className="mt-2 text-right text-[11px] font-sans font-bold text-red-700 dark:text-red-400">
                    — J. Jonah Jameson, Editor-in-Chief
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleResetForNew}
                  className="w-full sm:w-auto px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white font-sans text-xs font-bold uppercase tracking-wider rounded transition-colors"
                >
                  Submit Another Photograph
                </button>
                <button
                  onClick={() => setIsBountyModalOpen(false)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#ede8df] dark:bg-[#202025] hover:bg-[#e2dcce] text-[#1c1917] dark:text-white font-sans text-xs font-bold uppercase tracking-wider rounded transition-colors"
                >
                  Return to Newsstand
                </button>
              </div>
            </div>
          ) : (
            /* Submission Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded text-xs text-[#78350f] dark:text-amber-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <span>
                  <strong>NOTICE TO FREELANCERS:</strong> All submissions must be original, high-contrast, and depict unauthorized vigilante activities. Negatives become sole property of Daily Bugle News Corp.
                </span>
              </div>

              {/* Photo Upload or Preset Selection */}
              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#1c1917] dark:text-white mb-2">
                  1. Select or Upload Photograph Print:
                </label>

                {/* Option A: Upload Own File */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-[#d6cfc2] dark:border-[#2d2d34] hover:border-red-600 dark:hover:border-red-500 rounded cursor-pointer transition-colors bg-white dark:bg-[#18181c]">
                    <Upload className="w-6 h-6 text-red-700 dark:text-red-400 mb-1" />
                    <span className="text-xs font-sans font-bold text-[#1c1917] dark:text-white">
                      Upload from Device
                    </span>
                    <span className="text-[10px] text-[#78716c] dark:text-[#a8a29e] mt-0.5">
                      JPG, PNG, or WebP photo files
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Active Preview */}
                  <div className="p-2 border border-[#e5dfd5] dark:border-[#262629] rounded bg-[#faf8f4] dark:bg-[#18181c] flex items-center justify-center overflow-hidden">
                    {activeImageUrl ? (
                      <div className="relative w-full h-24 rounded overflow-hidden">
                        <img
                          src={activeImageUrl}
                          alt="Active Scoop Preview"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 text-[9px] font-bold bg-black/75 text-white px-1.5 py-0.5 rounded">
                          {customImage ? 'Custom Upload' : 'Darkroom Archive'}
                        </span>
                      </div>
                    ) : (
                      <div className="text-center text-xs text-[#a8a29e] py-6">
                        No photo loaded yet
                      </div>
                    )}
                  </div>
                </div>

                {/* Option B: Darkroom Presets */}
                <div className="mt-2">
                  <div className="text-[11px] font-sans text-[#78716c] dark:text-[#a8a29e] mb-1.5 flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    <span>Or choose an exclusive darkroom contact sheet print:</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {MOCK_PHOTO_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setSelectedPresetUrl(preset.url);
                          setCustomImage(null);
                          setHeadlinePitch(preset.defaultPitch);
                          playTypewriterSound();
                        }}
                        className={`p-1.5 rounded border text-left transition-all ${
                          selectedPresetUrl === preset.url
                            ? 'border-red-700 dark:border-red-500 ring-2 ring-red-600/30 bg-white dark:bg-[#1f1f25]'
                            : 'border-[#e5dfd5] dark:border-[#262629] hover:border-red-600/50 bg-[#faf8f4] dark:bg-[#18181c]'
                        }`}
                      >
                        <div className="w-full h-14 rounded overflow-hidden mb-1">
                          <img
                            src={preset.url}
                            alt={preset.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-[10px] font-sans font-bold text-[#1c1917] dark:text-white truncate">
                          {preset.title}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Metadata Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#78716c] dark:text-[#a8a29e] mb-1">
                    Photographer Name / Pen Name
                  </label>
                  <input
                    type="text"
                    value={photographerName}
                    onChange={(e) => setPhotographerName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-[#1e1e23] border border-[#d6cfc2] dark:border-[#2d2d34] rounded text-xs text-[#1c1917] dark:text-white focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#78716c] dark:text-[#a8a29e] mb-1">
                    Subject / Suspect Spotted
                  </label>
                  <select
                    value={villainSubject}
                    onChange={(e) => setVillainSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#1e1e23] border border-[#d6cfc2] dark:border-[#2d2d34] rounded text-xs text-[#1c1917] dark:text-white focus:outline-none focus:ring-1 focus:ring-red-600"
                  >
                    <option value="Spider-Man">Spider-Man (The Wall-Crawler)</option>
                    <option value="Green Goblin">Green Goblin (Oscorp Tech)</option>
                    <option value="Doctor Octopus">Doctor Octopus (Titanium Harness)</option>
                    <option value="The Kingpin">Wilson Fisk (Syndicate Leader)</option>
                    <option value="The Rhino">Rhino (Subway Excavator)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#78716c] dark:text-[#a8a29e] mb-1">
                    Manhattan / Queens Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Times Square, East River Pier"
                    className="w-full px-3 py-2 bg-white dark:bg-[#1e1e23] border border-[#d6cfc2] dark:border-[#2d2d34] rounded text-xs text-[#1c1917] dark:text-white focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#78716c] dark:text-[#a8a29e] mb-1">
                    Bounty Compensation Requested
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-red-700 dark:text-red-400" />
                    <input
                      type="text"
                      disabled
                      value="10,000.00 CASH BOUNTY"
                      className="w-full pl-8 pr-3 py-2 bg-[#ede8df] dark:bg-[#202025] border border-[#d6cfc2] dark:border-[#2d2d34] rounded text-xs font-bold text-red-700 dark:text-red-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#78716c] dark:text-[#a8a29e] mb-1">
                  Proposed Front-Page Headline Pitch
                </label>
                <input
                  type="text"
                  value={headlinePitch}
                  onChange={(e) => setHeadlinePitch(e.target.value)}
                  placeholder="e.g. Unmasked Vigilante Captured in Broad Daylight!"
                  required
                  className="w-full px-3 py-2 bg-white dark:bg-[#1e1e23] border border-[#d6cfc2] dark:border-[#2d2d34] rounded text-xs text-[#1c1917] dark:text-white focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="exclusive"
                  checked={exclusiveRights}
                  onChange={(e) => setExclusiveRights(e.target.checked)}
                  className="rounded text-red-700 focus:ring-red-600"
                />
                <label htmlFor="exclusive" className="text-xs font-sans text-[#57534e] dark:text-[#a8a29e]">
                  I certify this photo has NOT been provided to the Daily Globe or social media.
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2 border-t border-[#e7e2d9] dark:border-[#262629] flex items-center justify-between">
                <span className="text-[11px] font-sans text-[#78716c] dark:text-[#a8a29e]">
                  Instant review by J. Jonah Jameson upon submission.
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting || !exclusiveRights}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white font-sans text-xs font-bold uppercase tracking-wider rounded transition-colors shadow-xs"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting to Jameson...' : 'Claim $10,000 Bounty'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
