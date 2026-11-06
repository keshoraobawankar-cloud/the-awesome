import React, { useState } from 'react';
import { 
  X, Send, Sparkles, CheckCircle2, Clock, 
  ExternalLink, ThumbsUp, AlertTriangle, 
  Film, Sparkles as AnimeIcon, Gamepad2, Tv, BookOpen, Layers,
  Check, ArrowRight, UserCheck
} from 'lucide-react';
import { useDropData } from '../../context/DropDataContext';
import { useBugle } from '../../context/BugleContext';
import confetti from 'canvas-confetti';

interface UserUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedTitleId?: string;
  preselectedTitleName?: string;
}

export const UserUpdateModal: React.FC<UserUpdateModalProps> = ({
  isOpen,
  onClose,
  preselectedTitleId,
  preselectedTitleName
}) => {
  const { drops, userUpdates, submitUserUpdate, confirmUserUpdate, applyUserUpdate } = useDropData();
  const { showToast } = useBugle();

  const [activeTab, setActiveTab] = useState<'submit' | 'feed'>('submit');

  // Form state
  const [selectedExistingId, setSelectedExistingId] = useState<string>(preselectedTitleId || '');
  const [customTitleName, setCustomTitleName] = useState<string>(preselectedTitleName || '');
  const [category, setCategory] = useState<'Movies' | 'Anime' | 'Games' | 'Dramas' | 'Books' | 'Manga'>('Movies');
  const [updateType, setUpdateType] = useState<'date_change' | 'delay_alert' | 'platform_added' | 'new_release' | 'breaking_scoop'>('date_change');
  const [suggestedDate, setSuggestedDate] = useState<string>('');
  const [suggestedStatus, setSuggestedStatus] = useState<'Confirmed' | 'Tentative' | 'Delayed'>('Confirmed');
  const [platform, setPlatform] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [sourceUrl, setSourceUrl] = useState<string>('');
  const [submittedBy, setSubmittedBy] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set());
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Sync preselected title if opened with one
  React.useEffect(() => {
    if (preselectedTitleId) {
      setSelectedExistingId(preselectedTitleId);
      const match = drops.find(d => d.id === preselectedTitleId);
      if (match) {
        setCustomTitleName(match.name);
        setCategory(match.category);
        setPlatform(match.platform);
      }
    } else if (preselectedTitleName) {
      setCustomTitleName(preselectedTitleName);
    }
  }, [preselectedTitleId, preselectedTitleName, drops]);

  if (!isOpen) return null;

  const handleSelectExisting = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedExistingId(val);
    if (val === '__custom__') {
      setCustomTitleName('');
    } else {
      const match = drops.find(d => d.id === val);
      if (match) {
        setCustomTitleName(match.name);
        setCategory(match.category);
        setPlatform(match.platform);
        setSuggestedDate(match.date);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitleName = selectedExistingId && selectedExistingId !== '__custom__'
      ? (drops.find(d => d.id === selectedExistingId)?.name || customTitleName)
      : customTitleName;

    if (!finalTitleName.trim()) {
      showToast('Please specify the title of the release.');
      return;
    }

    if (!details.trim()) {
      showToast('Please provide details or context for this update.');
      return;
    }

    setIsSubmitting(true);
    const res = await submitUserUpdate({
      targetTitleId: selectedExistingId && selectedExistingId !== '__custom__' ? selectedExistingId : undefined,
      targetTitleName: finalTitleName.trim(),
      updateType,
      suggestedDate: suggestedDate.trim() || undefined,
      suggestedStatus,
      category,
      platform: platform.trim() || undefined,
      details: details.trim(),
      sourceUrl: sourceUrl.trim() || undefined,
      submittedBy: submittedBy.trim() || 'Anonymous Scout'
    });

    setIsSubmitting(false);

    if (res.success) {
      setSubmitSuccess(true);
      showToast('Tip submitted to Tickora Community Feed! Thank you!');
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#22d3ee', '#8b5cf6', '#ff3d71']
      });

      // Reset form
      setTimeout(() => {
        setSubmitSuccess(false);
        setActiveTab('feed');
      }, 1500);
    } else {
      showToast(res.error || 'Failed to submit update. Please check fields.');
    }
  };

  const handleConfirmTip = async (id: string) => {
    if (confirmedIds.has(id)) return;
    const res = await confirmUserUpdate(id);
    if (res.success) {
      setConfirmedIds(prev => new Set(prev).add(id));
      showToast('Tip confirmed! Community verification count updated.');
    }
  };

  const handleApplyTip = async (id: string) => {
    setApplyingId(id);
    const res = await applyUserUpdate(id);
    setApplyingId(null);
    if (res.success) {
      showToast(res.message || 'Update merged into live Tickora release catalog!');
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.5 },
        colors: ['#10b981', '#22d3ee', '#ffffff']
      });
    } else {
      showToast(res.message || 'Could not apply update.');
    }
  };

  const categoryIcons = {
    Movies: Film,
    Anime: AnimeIcon,
    Games: Gamepad2,
    Dramas: Tv,
    Books: BookOpen,
    Manga: Layers
  };

  const typeLabels = {
    date_change: { label: 'Date Change', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
    delay_alert: { label: 'Delay Alert', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    platform_added: { label: 'Platform Added', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
    new_release: { label: 'New Announcement', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    breaking_scoop: { label: 'Breaking Scoop', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] bg-[#0d1020] border border-[#2b3052] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-200 font-inter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#252846] bg-[#0b0d1a]/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bebas text-xl sm:text-2xl text-white tracking-wide">
                  TICKORA COMMUNITY TIP LINE
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  LIVE USER UPDATES
                </span>
              </div>
              <p className="text-xs text-slate-400 -mt-0.5">
                Every reader can submit release schedule changes, delays, and newly announced titles.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#171a30] hover:bg-[#222744] text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-[#252846] bg-[#121528] px-6 gap-2">
          <button
            onClick={() => setActiveTab('submit')}
            className={`py-3 px-4 text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'submit'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Update</span>
          </button>

          <button
            onClick={() => setActiveTab('feed')}
            className={`py-3 px-4 text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'feed'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Community Tips Feed ({userUpdates.length})</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 max-h-[calc(90vh-140px)]">
          {/* TAB 1: Submit Form */}
          {activeTab === 'submit' && (
            <div>
              {submitSuccess ? (
                <div className="p-8 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-3 animate-fadeIn">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="font-bebas text-2xl text-white">Update Successfully Received!</h4>
                  <p className="text-sm text-slate-300 max-w-md mx-auto">
                    Your tip has been registered on the Tickora Community Wire and is now live for community confirmation and editorial merge.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Title Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                        Target Release *
                      </label>
                      <select
                        value={selectedExistingId}
                        onChange={handleSelectExisting}
                        className="w-full px-3 py-2 bg-[#0b0d1a] border border-[#2b3052] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                      >
                        <option value="">-- Choose Existing Title or Brand New --</option>
                        {drops.map(d => (
                          <option key={d.id} value={d.id}>
                            {d.name} ({d.category} • {d.date})
                          </option>
                        ))}
                        <option value="__custom__">+ Add Brand New Unlisted Release</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                        Title Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Beyond the Spider-Verse, Silksong..."
                        value={customTitleName}
                        onChange={(e) => setCustomTitleName(e.target.value)}
                        className="w-full px-3 py-2 bg-[#0b0d1a] border border-[#2b3052] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  {/* Category & Update Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
                        className="w-full px-3 py-2 bg-[#0b0d1a] border border-[#2b3052] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                      >
                        <option value="Movies">Movies & Theatrical</option>
                        <option value="Anime">Anime & Simulcasts</option>
                        <option value="Games">Games & Consoles</option>
                        <option value="Dramas">TV Dramas & Series</option>
                        <option value="Books">Books & Novels</option>
                        <option value="Manga">Manga & Tankōbon</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                        Update Type *
                      </label>
                      <select
                        value={updateType}
                        onChange={(e) => setUpdateType(e.target.value as any)}
                        className="w-full px-3 py-2 bg-[#0b0d1a] border border-[#2b3052] rounded-xl text-xs text-cyan-300 font-semibold focus:outline-none focus:border-cyan-400"
                      >
                        <option value="date_change">🕒 Date Change / Rescheduled</option>
                        <option value="delay_alert">⚠️ Delay Alert / Postponed</option>
                        <option value="platform_added">📺 Platform / Network Added</option>
                        <option value="new_release">🆕 New Release Announcement</option>
                        <option value="breaking_scoop">📰 Breaking Scoop / Leaked Schedule</option>
                      </select>
                    </div>
                  </div>

                  {/* Target Date, Status & Platform */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                        New Release Date (YYYY-MM-DD)
                      </label>
                      <input
                        type="date"
                        value={suggestedDate}
                        onChange={(e) => setSuggestedDate(e.target.value)}
                        className="w-full px-3 py-2 bg-[#0b0d1a] border border-[#2b3052] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                        Status Confirmation
                      </label>
                      <select
                        value={suggestedStatus}
                        onChange={(e) => setSuggestedStatus(e.target.value as any)}
                        className="w-full px-3 py-2 bg-[#0b0d1a] border border-[#2b3052] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                      >
                        <option value="Confirmed">Confirmed Date</option>
                        <option value="Tentative">Tentative / Window</option>
                        <option value="Delayed">Delayed / TBA</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                        Platform / Distributor
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. IMAX, Netflix, Steam, PS5"
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        className="w-full px-3 py-2 bg-[#0b0d1a] border border-[#2b3052] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  {/* Update Details */}
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Details / What Happened? *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="e.g. Studio announced in their earnings report that the premiere shifted to November 28 to avoid competition with IMAX releases."
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0b0d1a] border border-[#2b3052] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 leading-relaxed"
                    />
                  </div>

                  {/* Source Proof & Contributor Handle */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                        Proof URL / Source Link
                      </label>
                      <input
                        type="url"
                        placeholder="https://twitter.com/studio/status/..."
                        value={sourceUrl}
                        onChange={(e) => setSourceUrl(e.target.value)}
                        className="w-full px-3 py-2 bg-[#0b0d1a] border border-[#2b3052] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                        Your Submitter Handle / Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Miles_NY, AnimeRadar..."
                        value={submittedBy}
                        onChange={(e) => setSubmittedBy(e.target.value)}
                        className="w-full px-3 py-2 bg-[#0b0d1a] border border-[#2b3052] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      💡 Verified community tips are instantly published and update the live countdown network.
                    </span>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-inter font-semibold text-xs shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSubmitting ? 'Submitting Tip...' : 'Submit Update'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: Live Community Tip Feed */}
          {activeTab === 'feed' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#252846]/60">
                <div>
                  <h4 className="font-bebas text-lg text-white">Community Submitted Updates</h4>
                  <p className="text-xs text-slate-400">
                    Upvote valid updates to confirm them, or apply them directly to synchronize Tickora's live countdown clock.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('submit')}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-mono flex items-center gap-1.5"
                >
                  <span>+ Give New Update</span>
                </button>
              </div>

              {userUpdates.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No community updates submitted yet. Be the first to tip off a release!
                </div>
              ) : (
                <div className="space-y-3">
                  {userUpdates.map((item) => {
                    const typeInfo = typeLabels[item.updateType] || typeLabels.date_change;
                    const CategoryIcon = categoryIcons[item.category] || Film;
                    const isConfirmedByMe = confirmedIds.has(item.id);

                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl bg-[#121528] border border-[#252846] hover:border-[#383d69] transition-all space-y-3"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bebas text-lg text-white tracking-wide">
                                {item.targetTitleName}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${typeInfo.color}`}>
                                {typeInfo.label}
                              </span>
                              <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                                <CategoryIcon className="w-3 h-3 text-cyan-400" />
                                {item.category}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                              <span>By <strong className="text-slate-300">{item.submittedBy}</strong></span>
                              <span>•</span>
                              <span>{new Date(item.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              {item.suggestedDate && (
                                <>
                                  <span>•</span>
                                  <span className="text-cyan-400 font-bold flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    New Target: {item.suggestedDate}
                                  </span>
                                </>
                              )}
                              {item.platform && (
                                <>
                                  <span>•</span>
                                  <span className="text-slate-400">{item.platform}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div>
                            {item.status === 'applied' ? (
                              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" />
                                MERGED TO LIVE RADAR
                              </span>
                            ) : item.status === 'verified' ? (
                              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                COMMUNITY VERIFIED
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30">
                                Pending Community Verification
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Details Text */}
                        <p className="text-xs text-slate-300 leading-relaxed bg-[#0b0d1a] p-3 rounded-lg border border-[#252846]/80">
                          {item.details}
                        </p>

                        {/* Footer row: Proof link + Actions */}
                        <div className="flex items-center justify-between pt-1">
                          <div>
                            {item.sourceUrl ? (
                              <a
                                href={item.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 font-mono"
                              >
                                <span>Proof Link / Source</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-mono italic">
                                Direct community tip
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Upvote / Confirm Button */}
                            <button
                              onClick={() => handleConfirmTip(item.id)}
                              disabled={isConfirmedByMe}
                              className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
                                isConfirmedByMe
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 cursor-default'
                                  : 'bg-[#171a30] hover:bg-[#252846] text-slate-300 hover:text-white border border-[#2b3052]'
                              }`}
                              title="Confirm this update matches official announcements"
                            >
                              <ThumbsUp className={`w-3.5 h-3.5 ${isConfirmedByMe ? 'text-cyan-400' : 'text-slate-400'}`} />
                              <span>{item.confirmationsCount} Confirmations</span>
                            </button>

                            {/* Apply to Live Catalog Button */}
                            {item.status !== 'applied' && (
                              <button
                                onClick={() => handleApplyTip(item.id)}
                                disabled={applyingId === item.id}
                                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-inter font-semibold shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50"
                                title="Merge this update into Tickora's live release schedule and countdown clock"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>{applyingId === item.id ? 'Applying...' : 'Apply to Live Radar'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
