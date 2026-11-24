import React, { useState, useEffect } from 'react';
import {
  X,
  BellRing,
  Clock,
  Calendar,
  Volume2,
  Monitor,
  Sparkles,
  Check,
  Film,
  Newspaper,
  Layers,
  Tag
} from 'lucide-react';
import {
  useNotifications,
  NotificationTargetType,
  NotificationTiming,
  NotificationTrigger
} from '../../context/NotificationContext';
import { useDropData } from '../../context/DropDataContext';
import { DROP_TITLES_12, STACKING_NEWS } from '../../data/dropRadarData';
import confetti from 'canvas-confetti';

const CATEGORIES = ['Movies', 'Anime', 'Games', 'Dramas', 'Books', 'Manga'];

export const SetNotificationModal: React.FC = () => {
  const {
    isNotifyModalOpen,
    notifyPrefill,
    closeNotifyModal,
    addOrUpdateRule,
    browserPermission,
    requestBrowserPermission,
    getRuleForTarget
  } = useNotifications();
  const { drops, news } = useDropData();

  const allDrops = drops && drops.length > 0 ? drops : DROP_TITLES_12;
  const allNews = news && news.length > 0 ? news : STACKING_NEWS;

  const [targetType, setTargetType] = useState<NotificationTargetType>('drop');
  const [targetId, setTargetId] = useState('');
  const [targetName, setTargetName] = useState('');
  const [category, setCategory] = useState('Movies');
  const [targetDate, setTargetDate] = useState('');
  const [timing, setTiming] = useState<NotificationTiming>('24h_before');
  const [customDateTime, setCustomDateTime] = useState('');
  const [triggerOn, setTriggerOn] = useState<NotificationTrigger[]>(['launch', 'date_shift']);
  const [note, setNote] = useState('');
  const [playSound, setPlaySound] = useState(true);
  const [browserPush, setBrowserPush] = useState(true);

  useEffect(() => {
    if (!isNotifyModalOpen) return;

    // Default custom datetime to 1 hour from now (local)
    const soon = new Date(Date.now() + 60 * 60 * 1000);
    const localIso = new Date(soon.getTime() - soon.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

    if (notifyPrefill?.targetName) {
      const existing = notifyPrefill.targetId ? getRuleForTarget(notifyPrefill.targetId) : undefined;
      setTargetType(notifyPrefill.targetType || 'drop');
      setTargetId(notifyPrefill.targetId || `custom-${Date.now()}`);
      setTargetName(notifyPrefill.targetName);
      setCategory(notifyPrefill.category || existing?.category || 'Movies');
      setTargetDate(notifyPrefill.targetDate || existing?.targetDate || '');
      setTiming(existing?.timing || (notifyPrefill.targetDate ? '24h_before' : 'custom_time'));
      setCustomDateTime(existing?.customDateTime || localIso);
      setTriggerOn(existing?.triggerOn || ['launch', 'date_shift']);
      setNote(existing?.note || '');
      setPlaySound(existing?.playSound ?? true);
      setBrowserPush(existing?.browserPush ?? true);
    } else {
      const firstDrop = allDrops[0];
      setTargetType('drop');
      setTargetId(firstDrop?.id || '');
      setTargetName(firstDrop?.name || '');
      setCategory(firstDrop?.category || 'Games');
      setTargetDate(firstDrop?.date || '');
      setTiming('24h_before');
      setCustomDateTime(localIso);
      setTriggerOn(['launch', 'date_shift']);
      setNote('');
      setPlaySound(true);
      setBrowserPush(true);
    }
  }, [isNotifyModalOpen, notifyPrefill, allDrops, getRuleForTarget]);

  if (!isNotifyModalOpen) return null;

  const isLockedTarget = Boolean(notifyPrefill?.targetName);

  const handleSelectDrop = (id: string) => {
    const found = allDrops.find((d) => d.id === id);
    if (found) {
      setTargetId(found.id);
      setTargetName(found.name);
      setCategory(found.category);
      setTargetDate(found.date);
    }
  };

  const handleSelectNews = (id: string) => {
    const found = allNews.find((n) => n.id === id);
    if (found) {
      setTargetId(found.id);
      setTargetName(found.title);
      setCategory(found.tag);
      setTargetDate('');
      setTiming('custom_time');
      setTriggerOn(['news_update']);
    }
  };

  const handleSelectCategory = (cat: string) => {
    setTargetId(`cat-${cat.toLowerCase()}`);
    setTargetName(`${cat} Releases & Updates`);
    setCategory(cat);
    setTargetDate('');
    setTriggerOn(['date_shift', 'news_update']);
  };

  const toggleTrigger = (t: NotificationTrigger) => {
    setTriggerOn((prev) =>
      prev.includes(t) ? (prev.length > 1 ? prev.filter((item) => item !== t) : prev) : [...prev, t]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetName.trim()) return;

    if (browserPush && browserPermission === 'default') {
      await requestBrowserPermission();
    }

    addOrUpdateRule({
      targetId: targetId || `custom-${Date.now()}`,
      targetName: targetName.trim(),
      targetType,
      category,
      targetDate: targetDate || undefined,
      timing,
      customDateTime: timing === 'custom_time' ? customDateTime : undefined,
      triggerOn,
      note,
      playSound,
      browserPush,
      enabled: true
    });

    confetti({
      particleCount: 55,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#22d3ee', '#8b5cf6', '#ff3d71']
    });

    closeNotifyModal();
  };

  const timingOptions: Array<{ id: NotificationTiming; label: string; sub: string }> = [
    { id: 'at_launch', label: 'At Launch', sub: 'Exact T-0' },
    { id: '1h_before', label: '1 Hour Before', sub: 'Pre-drop ping' },
    { id: '24h_before', label: '24 Hours Before', sub: 'Day-before alert' },
    { id: '3d_before', label: '3 Days Before', sub: 'Weekend heads-up' },
    { id: '7d_before', label: '7 Days Before', sub: 'One week out' },
    { id: 'custom_time', label: 'Custom Date & Time', sub: 'Pick exact moment' }
  ];

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-6 bg-[#0b0d1a]/85 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={closeNotifyModal}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] rounded-3xl bg-[#0d1020] border-2 border-[#2b3052] shadow-2xl overflow-hidden flex flex-col text-slate-200 font-inter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#252846] bg-[#121528]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff3d71] via-[#8b5cf6] to-[#22d3ee] flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.4)]">
              <BellRing className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bebas text-2xl text-white tracking-wide">
                SET <span className="text-cyan-400">CUSTOM NOTIFICATION</span>
              </h3>
              <p className="text-xs text-slate-400 -mt-0.5">
                Get alerted for any release, news scoop, category, or custom reminder.
              </p>
            </div>
          </div>

          <button
            onClick={closeNotifyModal}
            className="p-2 rounded-xl bg-[#171a30] hover:bg-[#252846] text-slate-400 hover:text-white transition-colors"
            aria-label="Close notification modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Target Selector (if not prefilled, or allow switching) */}
          {!isLockedTarget ? (
            <div className="space-y-3">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">
                1. What do you want a notification for?
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'drop' as const, label: 'Release', icon: Film },
                  { id: 'category' as const, label: 'Category', icon: Layers },
                  { id: 'news' as const, label: 'News Scoop', icon: Newspaper },
                  { id: 'custom' as const, label: 'Custom Item', icon: Tag }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const active = targetType === tab.id;
                  return (
                    <button
                      type="button"
                      key={tab.id}
                      onClick={() => {
                        setTargetType(tab.id);
                        if (tab.id === 'drop' && allDrops[0]) handleSelectDrop(allDrops[0].id);
                        if (tab.id === 'category') handleSelectCategory(CATEGORIES[0]);
                        if (tab.id === 'news' && allNews[0]) handleSelectNews(allNews[0].id);
                        if (tab.id === 'custom') {
                          setTargetId(`custom-${Date.now()}`);
                          setTargetName('');
                          setTargetDate('');
                          setTiming('custom_time');
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                        active
                          ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-400 text-white'
                          : 'bg-[#121528] border-[#252846] text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {targetType === 'drop' && (
                <select
                  value={targetId}
                  onChange={(e) => handleSelectDrop(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121528] border border-[#2b3052] text-sm text-white focus:outline-none focus:border-cyan-400"
                >
                  {allDrops.map((d) => (
                    <option key={d.id} value={d.id}>
                      [{d.category}] {d.name} ({d.date})
                    </option>
                  ))}
                </select>
              )}

              {targetType === 'category' && (
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => handleSelectCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-mono border transition-all ${
                        category === cat
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-[#121528] border-[#252846] text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {targetType === 'news' && (
                <select
                  value={targetId}
                  onChange={(e) => handleSelectNews(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121528] border border-[#2b3052] text-sm text-white focus:outline-none focus:border-cyan-400"
                >
                  {allNews.map((n) => (
                    <option key={n.id} value={n.id}>
                      [{n.tag}] {n.title}
                    </option>
                  ))}
                </select>
              )}

              {targetType === 'custom' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      required
                      value={targetName}
                      onChange={(e) => setTargetName(e.target.value)}
                      placeholder="e.g., GTA VI Pre-order Window, Comic-Con Panel..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#121528] border border-[#2b3052] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#121528] border border-[#2b3052] text-sm text-white focus:outline-none focus:border-cyan-400"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          Sector: {c}
                        </option>
                      ))}
                      <option value="General">Sector: General</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#121528] border border-cyan-500/30 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {category || targetType}
                  </span>
                  {targetDate && (
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-cyan-400" />
                      {targetDate}
                    </span>
                  )}
                </div>
                <h4 className="font-bebas text-2xl text-white tracking-wide truncate">
                  {targetName}
                </h4>
              </div>
              <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0" />
            </div>
          )}

          {/* 2. Timing Selector */}
          <div className="space-y-2.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">
              2. When should AheadOfYou notify you?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {timingOptions.map((opt) => {
                const disabled = opt.id !== 'custom_time' && !targetDate;
                const active = timing === opt.id;
                return (
                  <button
                    type="button"
                    key={opt.id}
                    disabled={disabled}
                    onClick={() => setTiming(opt.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      disabled
                        ? 'opacity-40 cursor-not-allowed bg-[#0b0d1a] border-[#1f233f]'
                        : active
                        ? 'bg-gradient-to-r from-[#ff3d71]/20 to-[#8b5cf6]/20 border-[#ff3d71] text-white shadow-[0_0_12px_rgba(255,61,113,0.2)]'
                        : 'bg-[#121528] border-[#252846] text-slate-300 hover:border-cyan-400/50'
                    }`}
                  >
                    <div className="text-xs font-semibold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{opt.label}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">{opt.sub}</div>
                  </button>
                );
              })}
            </div>

            {timing === 'custom_time' && (
              <div className="p-3 rounded-xl bg-[#121528] border border-cyan-500/40">
                <label className="block text-[11px] font-mono uppercase text-cyan-300 mb-1.5">
                  Exact Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={customDateTime}
                  onChange={(e) => setCustomDateTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0b0d1a] border border-[#2b3052] text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            )}
          </div>

          {/* 3. Trigger Events */}
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">
              3. Trigger alerts on
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'launch' as const, label: 'Release / Countdown' },
                { id: 'date_shift' as const, label: 'Date Shift / Delay' },
                { id: 'news_update' as const, label: 'News & Scoops' }
              ].map((trig) => {
                const selected = triggerOn.includes(trig.id);
                return (
                  <button
                    type="button"
                    key={trig.id}
                    onClick={() => toggleTrigger(trig.id)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
                      selected
                        ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                        : 'bg-[#121528] border-[#252846] text-slate-400 hover:text-white'
                    }`}
                  >
                    {selected && <Check className="w-3.5 h-3.5" />}
                    <span>{trig.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Optional Note */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Personal Reminder Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Grab midnight IMAX tickets / Check pre-load size"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#121528] border border-[#2b3052] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* 5. Delivery Channels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => setPlaySound(!playSound)}
              className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                playSound
                  ? 'bg-[#171a30] border-cyan-400/50 text-white'
                  : 'bg-[#121528] border-[#252846] text-slate-400'
              }`}
            >
              <span className="flex items-center gap-2 font-medium">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                Play Bell Chime
              </span>
              <span className={`font-mono font-bold ${playSound ? 'text-emerald-400' : 'text-slate-500'}`}>
                {playSound ? 'ON' : 'OFF'}
              </span>
            </button>

            <button
              type="button"
              onClick={async () => {
                const next = !browserPush;
                setBrowserPush(next);
                if (next && browserPermission === 'default') {
                  await requestBrowserPermission();
                }
              }}
              className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                browserPush
                  ? 'bg-[#171a30] border-purple-400/50 text-white'
                  : 'bg-[#121528] border-[#252846] text-slate-400'
              }`}
            >
              <span className="flex items-center gap-2 font-medium">
                <Monitor className="w-4 h-4 text-purple-400" />
                Browser Push Alert
              </span>
              <span className={`font-mono font-bold ${browserPush ? 'text-emerald-400' : 'text-slate-500'}`}>
                {browserPush ? (browserPermission === 'denied' ? 'IN-APP' : 'ON') : 'OFF'}
              </span>
            </button>
          </div>

          {/* Submit Footer */}
          <div className="pt-3 border-t border-[#252846] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeNotifyModal}
              className="px-4 py-2.5 rounded-xl bg-[#171a30] hover:bg-[#252846] text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#ff3d71] via-[#8b5cf6] to-[#22d3ee] hover:opacity-95 text-white text-sm font-bold shadow-[0_0_20px_rgba(34,211,238,0.4)] flex items-center gap-2 transition-all"
            >
              <BellRing className="w-4 h-4" />
              <span>Activate Notification</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
