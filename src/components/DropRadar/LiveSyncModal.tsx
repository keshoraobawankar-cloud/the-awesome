import React, { useState } from 'react';
import { 
  X, RefreshCw, Radio, CheckCircle2, ShieldCheck, Database, 
  ExternalLink, Plus, Lock, Unlock, Clock, AlertTriangle, Layers,
  Terminal, Sparkles, Check, FileSpreadsheet, Newspaper, AlertCircle,
  FileCode, Send
} from 'lucide-react';
import { useDropData } from '../../context/DropDataContext';

interface LiveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveSyncModal: React.FC<LiveSyncModalProps> = ({ isOpen, onClose }) => {
  const { 
    syncStatus, 
    isSyncing, 
    triggerSync, 
    addManualDrop, 
    lastSyncedAt,
    drops,
    newsQueue,
    approveNewsItem,
    rejectNewsItem,
    importSheetsCsv,
    dateHistory
  } = useDropData();

  const [activeTab, setActiveTab] = useState<'sources' | 'approval' | 'sheets' | 'add' | 'workflow'>('sources');

  // Manual entry form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'Movies' as 'Movies' | 'Anime' | 'Games' | 'Dramas' | 'Books' | 'Manga',
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    platform: '',
    tagline: '',
    description: '',
    status: 'Confirmed' as 'Confirmed' | 'Tentative' | 'Delayed',
    lockField: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Sheets CSV state
  const sampleCsv = `Title,Category,Release Date,Platform,Status,Description
Hollow Knight: Silksong,Games,2026-11-24,PC / Switch / Game Pass,Confirmed,Explore the haunted kingdom of Pharloom as Hornet.
Death Stranding 2: On The Beach,Games,2026-12-08,PlayStation 5,Confirmed,Hideo Kojima cinematic action sequel starring Norman Reedus.
Jujutsu Kaisen: Culling Game Special,Anime,2026-12-14,Crunchyroll / Theatrical,Confirmed,Special two-hour theatrical bridge presentation.
Wind and Truth (Hardcover),Books,2026-12-06,Hardcover / Tor Books,Confirmed,Brandon Sanderson's massive Stormlight Archive Book 5 epic finale.
Wolverine (PS5),Games,2027-04-16,PlayStation 5,Tentative,Insomniac Games standalone mature mutant action title.`;

  const [csvInput, setCsvInput] = useState(sampleCsv);
  const [sheetsFeedback, setSheetsFeedback] = useState<{ added: number; errors: string[] } | null>(null);
  const [isImportingCsv, setIsImportingCsv] = useState(false);

  if (!isOpen) return null;

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    const ok = await addManualDrop(formData);
    setIsSubmitting(false);

    if (ok) {
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setFormData({
          name: '',
          category: 'Movies',
          date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          platform: '',
          tagline: '',
          description: '',
          status: 'Confirmed',
          lockField: true
        });
        setActiveTab('sources');
      }, 1200);
    }
  };

  const handleCsvImport = async () => {
    if (!csvInput.trim()) return;
    setIsImportingCsv(true);
    setSheetsFeedback(null);
    const result = await importSheetsCsv(csvInput);
    setIsImportingCsv(false);
    setSheetsFeedback(result);
  };

  const timeAgo = (dateStr?: string | null) => {
    if (!dateStr) return 'Just now';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins === 1) return '1 minute ago';
    if (mins < 60) return `${mins} minutes ago`;
    return `${Math.floor(mins / 60)} hours ago`;
  };

  const pendingApprovals = (newsQueue || []).filter(q => q.status === 'pending_review');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-5xl max-h-[92vh] bg-[#0f1225] border border-[#2b3055] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#252846] bg-[#141830]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#ff3d71] to-[#8b5cf6] text-white shadow-[0_0_15px_rgba(255,61,113,0.4)]">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bebas text-2xl text-white tracking-wider">
                  LIVE RADAR DATA PIPELINE & SCHEDULER
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Active Backend
                </span>
              </div>
              <p className="text-xs text-slate-400 font-inter">
                Multi-source scheduler (TMDB, AniList, OpenLibrary, RSS, Google Sheets) with date revision tracking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerSync()}
              disabled={isSyncing}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#22d3ee]/10 hover:bg-[#22d3ee]/20 border border-[#22d3ee]/40 text-[#22d3ee] text-xs font-inter font-medium transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#252846] transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#252846] px-6 bg-[#111428] overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('sources')}
            className={`py-3 px-4 text-xs font-inter font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'sources'
                ? 'border-[#ff3d71] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4 text-[#ff3d71]" />
            <span>Live Sources & Telemetry</span>
          </button>
          <button
            onClick={() => setActiveTab('approval')}
            className={`py-3 px-4 text-xs font-inter font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'approval'
                ? 'border-[#ff3d71] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Newspaper className="w-4 h-4 text-[#f59e0b]" />
            <span>AI News & Delay Queue</span>
            {pendingApprovals.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#ff3d71] text-white">
                {pendingApprovals.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('sheets')}
            className={`py-3 px-4 text-xs font-inter font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'sheets'
                ? 'border-[#ff3d71] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-[#10b981]" />
            <span>Google Sheets CSV Import</span>
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`py-3 px-4 text-xs font-inter font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'add'
                ? 'border-[#ff3d71] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-4 h-4 text-[#22d3ee]" />
            <span>Manual Admin Entry</span>
          </button>
          <button
            onClick={() => setActiveTab('workflow')}
            className={`py-3 px-4 text-xs font-inter font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'workflow'
                ? 'border-[#ff3d71] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4 text-[#8b5cf6]" />
            <span>GitHub Actions & SQL Schema</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: Sources & Telemetry */}
          {activeTab === 'sources' && (
            <div className="space-y-6">
              {/* Telemetry Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#171a30] border border-[#2b3052] rounded-xl p-3">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Total Tracked Drops
                  </span>
                  <div className="font-bebas text-3xl text-white mt-1">
                    {syncStatus?.totalDrops ?? drops.length}
                  </div>
                  <span className="text-[11px] text-[#22d3ee] flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Live Merged
                  </span>
                </div>

                <div className="bg-[#171a30] border border-[#2b3052] rounded-xl p-3">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Last Synced
                  </span>
                  <div className="font-bebas text-2xl text-slate-200 mt-1">
                    {timeAgo(lastSyncedAt)}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Auto-runs every 15m
                  </span>
                </div>

                <div className="bg-[#171a30] border border-[#2b3052] rounded-xl p-3">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Date Changes Tracked
                  </span>
                  <div className="font-bebas text-3xl text-amber-400 mt-1">
                    {syncStatus?.dateChangesCount ?? dateHistory.length}
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" /> Delay History Active
                  </span>
                </div>

                <div className="bg-[#171a30] border border-[#2b3052] rounded-xl p-3">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Locked Fields
                  </span>
                  <div className="font-bebas text-3xl text-[#ff3d71] mt-1">
                    {syncStatus?.lockedDropsCount ?? 0}
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#ff3d71]" /> Overwrite Protected
                  </span>
                </div>
              </div>

              {/* Source Connectors */}
              <div>
                <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-3">
                  Connected Data Pipelines
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(syncStatus?.sources || []).map((src) => (
                    <div 
                      key={src.id}
                      className="bg-[#151930] border border-[#272c4e] rounded-xl p-3.5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-white font-inter">
                            {src.name}
                          </span>
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        </div>
                        <p className="text-xs text-slate-400 font-inter">
                          {src.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400 pt-2 border-t border-[#232744]">
                        <span>Items: <strong className="text-slate-200">{src.itemCount}</strong></span>
                        <span className="text-cyan-400 font-mono text-[10px] uppercase">
                          {src.isKeyRequired ? (src.hasKey ? 'Key Connected' : 'Fallback Mode') : 'Public API'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legal & TMDB Attribution Notice */}
              <div className="p-3 bg-[#111429] border border-[#24294b] rounded-xl flex items-center gap-3 text-xs text-slate-400">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0 font-bebas text-lg">
                  TMDB
                </div>
                <div>
                  <span className="text-slate-200 font-semibold">Attribution Notice: </span>
                  This product uses the TMDB API but is not endorsed or certified by TMDB. Anime & Manga metadata powered by AniList GraphQL API. Literary data via Open Library.
                </div>
              </div>

              {/* Live Activity Log */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                    Recent Sync Telemetry Stream
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">Automated Scheduler</span>
                </div>
                <div className="bg-[#0b0d1a] border border-[#222642] rounded-xl p-3 font-mono text-xs max-h-44 overflow-y-auto space-y-1.5">
                  {(syncStatus?.recentLogs || []).length > 0 ? (
                    syncStatus?.recentLogs.map((log, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-slate-600 select-none">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span className={
                          log.level === 'success' ? 'text-emerald-400' :
                          log.level === 'error' ? 'text-rose-400' :
                          log.level === 'warn' ? 'text-amber-400' : 'text-slate-300'
                        }>
                          {log.message}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500">Scheduler ready. Click "Sync Now" to trigger live fetch.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI News & Delay Approval Queue */}
          {activeTab === 'approval' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bebas text-2xl text-white tracking-wide">
                  AI NEWS DRAFTS & DELAY APPROVAL QUEUE
                </h4>
                <p className="text-xs text-slate-400 font-inter">
                  Per Section 5 of your guide: AI generates 2-sentence summaries and delay alerts with rumor detection. A human editor reviews and clicks "Approve" before stories appear on the live Broadsheet.
                </p>
              </div>

              {pendingApprovals.length === 0 ? (
                <div className="p-8 bg-[#151930] border border-[#272c4e] rounded-xl text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                  <h5 className="font-bebas text-xl text-white">All Dispatches Reviewed!</h5>
                  <p className="text-xs text-slate-400">
                    No pending news items waiting for approval. New drafts appear here automatically when RSS feeds or date shifts are detected.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingApprovals.map((item) => (
                    <div 
                      key={item.id}
                      className="p-4 bg-[#141830] border border-[#2b3055] rounded-xl space-y-3 hover:border-slate-500 transition-colors"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#ff3d71]/20 text-[#ff3d71] uppercase">
                            {item.category}
                          </span>
                          {item.isRumor && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 uppercase flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Rumor
                            </span>
                          )}
                          <span className="text-xs text-slate-400 font-inter">
                            Source: <strong className="text-slate-300">{item.source}</strong>
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">
                          {new Date(item.createdAt).toLocaleTimeString()}
                        </span>
                      </div>

                      <div>
                        <h5 className="text-sm font-bold text-white font-inter">
                          {item.title}
                        </h5>
                        <p className="text-xs text-slate-300 font-inter mt-1 leading-relaxed bg-[#0b0d1a]/50 p-2.5 rounded-lg border border-[#222642]">
                          {item.summary}
                        </p>
                        <div className="text-[11px] text-slate-500 mt-1 italic font-inter">
                          Original headline: "{item.originalHeadline}"
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#232744]">
                        <button
                          onClick={() => rejectNewsItem(item.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-inter text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          Reject Draft
                        </button>
                        <button
                          onClick={() => approveNewsItem(item.id)}
                          className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-inter font-semibold shadow-md flex items-center gap-1.5 transition-all"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Approve & Publish to Broadsheet</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Google Sheets CSV Sync */}
          {activeTab === 'sheets' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bebas text-2xl text-white tracking-wide">
                  GOOGLE SHEETS / CSV TEAM IMPORT
                </h4>
                <p className="text-xs text-slate-400 font-inter">
                  Per Section 1 of your guide: A shared Google Sheet is the easiest way for your editorial team to add releases.
                  Paste your sheet's published CSV below or edit the sample.
                </p>
              </div>

              {sheetsFeedback && (
                <div className={`p-4 rounded-xl border text-xs space-y-1 ${
                  sheetsFeedback.errors.length > 0 
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                    : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                }`}>
                  <div className="font-bold font-inter flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Successfully imported {sheetsFeedback.added} titles into Tickora!</span>
                  </div>
                  {sheetsFeedback.errors.length > 0 && (
                    <div className="mt-2 text-slate-300 space-y-0.5">
                      <span className="font-semibold text-amber-400">Sanity Check Notices:</span>
                      {sheetsFeedback.errors.map((err, i) => (
                        <div key={i}>• {err}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                  Spreadsheet CSV Data (Headers: Title, Category, Release Date, Platform, Status, Description)
                </label>
                <textarea
                  rows={8}
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0b0d1a] border border-[#2b3052] rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-[#10b981] leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-inter">
                  🛡️ Sanity checks enforce valid YYYY-MM-DD, reject past dates, and reject dates &gt; 5 years out.
                </span>
                <button
                  onClick={handleCsvImport}
                  disabled={isImportingCsv}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-inter font-semibold shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>{isImportingCsv ? 'Validating & Importing...' : 'Import Spreadsheet CSV'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Manual Admin Entry */}
          {activeTab === 'add' && (
            <div>
              <div className="mb-4">
                <h4 className="font-bebas text-2xl text-white tracking-wide">
                  CATALOG INDIE / REGIONAL RELEASE
                </h4>
                <p className="text-xs text-slate-400 font-inter">
                  Direct entry for independent games, local theater premieres, or corrections. Marked with field locks so automated syncs never overwrite them.
                </p>
              </div>

              {submitSuccess ? (
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/40 rounded-xl text-center space-y-2 animate-fadeIn">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h5 className="font-bebas text-xl text-white">Release Successfully Cataloged!</h5>
                  <p className="text-xs text-slate-300">Added to Tickora with field-lock protection active.</p>
                </div>
              ) : (
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                        Title Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Silksong: Deep Hall"
                        className="w-full px-3 py-2 bg-[#171a30] border border-[#2b3052] rounded-xl text-sm text-white focus:outline-none focus:border-[#ff3d71]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                        className="w-full px-3 py-2 bg-[#171a30] border border-[#2b3052] rounded-xl text-sm text-white focus:outline-none focus:border-[#ff3d71]"
                      >
                        <option value="Movies">Movies</option>
                        <option value="Anime">Anime</option>
                        <option value="Games">Games</option>
                        <option value="Dramas">Dramas</option>
                        <option value="Books">Books</option>
                        <option value="Manga">Manga</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                        Release Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-3 py-2 bg-[#171a30] border border-[#2b3052] rounded-xl text-sm text-white focus:outline-none focus:border-[#ff3d71]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                        Platform / Venue
                      </label>
                      <input
                        type="text"
                        value={formData.platform}
                        onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                        placeholder="e.g. Steam / Switch / Theatrical"
                        className="w-full px-3 py-2 bg-[#171a30] border border-[#2b3052] rounded-xl text-sm text-white focus:outline-none focus:border-[#ff3d71]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                        Status Label
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full px-3 py-2 bg-[#171a30] border border-[#2b3052] rounded-xl text-sm text-white focus:outline-none focus:border-[#ff3d71]"
                      >
                        <option value="Confirmed">Confirmed (Exact Date)</option>
                        <option value="Tentative">Tentative (Target Window)</option>
                        <option value="Delayed">Delayed (Rescheduled)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                        Tagline / Highlight
                      </label>
                      <input
                        type="text"
                        value={formData.tagline}
                        onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                        placeholder="e.g. Worldwide simultaneous digital premiere"
                        className="w-full px-3 py-2 bg-[#171a30] border border-[#2b3052] rounded-xl text-sm text-white focus:outline-none focus:border-[#ff3d71]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Description / Overview
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief synopsis or release details..."
                      className="w-full px-3 py-2 bg-[#171a30] border border-[#2b3052] rounded-xl text-sm text-white focus:outline-none focus:border-[#ff3d71]"
                    />
                  </div>

                  {/* Field-Lock protection toggle */}
                  <div className="p-3 bg-[#171a30] border border-[#2b3052] rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-white font-inter">
                          Lock fields from automated overwriting
                        </span>
                        <p className="text-[11px] text-slate-400">
                          Recommended. Scheduled fetchers (AniList/TMDB) will never overwrite this entry.
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.lockField}
                      onChange={(e) => setFormData({ ...formData, lockField: e.target.checked })}
                      className="w-4 h-4 rounded text-[#ff3d71] focus:ring-0"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('sources')}
                      className="px-4 py-2 rounded-xl text-xs font-inter text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#ff3d71] to-[#8b5cf6] text-white text-xs font-inter font-semibold shadow-[0_0_15px_rgba(255,61,113,0.4)] hover:shadow-[0_0_20px_rgba(255,61,113,0.6)] transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? 'Saving to Database...' : 'Save & Publish Drop'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 5: GitHub Actions & SQL Schema */}
          {activeTab === 'workflow' && (
            <div className="space-y-5">
              <div>
                <h4 className="font-bebas text-2xl text-white tracking-wide">
                  PRODUCTION CODE & GITHUB ACTIONS AUTOMATION
                </h4>
                <p className="text-xs text-slate-400 font-inter">
                  Full production files created in your repo ready to run or copy to GitHub / Supabase.
                </p>
              </div>

              {/* Secrets & Environment Configuration Guide */}
              <div className="p-4 bg-[#141830] border border-[#2b3055] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#22d3ee] uppercase tracking-wider font-semibold flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Environment Variables & Secrets Reference
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Settings → Secrets → Actions</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-inter border-collapse">
                    <thead>
                      <tr className="border-b border-[#252846] text-slate-400 font-mono text-[11px]">
                        <th className="py-2 pr-3">Name</th>
                        <th className="py-2 pr-3">What to Enter</th>
                        <th className="py-2">Where to Get It</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#212644] text-slate-300">
                      <tr>
                        <td className="py-2 pr-3 font-mono text-cyan-300 font-semibold">DISABLE_HMR</td>
                        <td className="py-2 pr-3 text-slate-400">true</td>
                        <td className="py-2 text-slate-400">Turns off live-reload while editing in AI Studio (not a secret).</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-3 font-mono text-cyan-300 font-semibold">TMDB_API_KEY</td>
                        <td className="py-2 pr-3 text-slate-400">Your TMDB v3 API key</td>
                        <td className="py-2 text-slate-400">themoviedb.org → Settings → API (free).</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-3 font-mono text-cyan-300 font-semibold">SUPABASE_URL</td>
                        <td className="py-2 pr-3 text-slate-400">https://xxxx.supabase.co</td>
                        <td className="py-2 text-slate-400">Supabase dashboard → Project Settings → API.</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-3 font-mono text-amber-300 font-semibold">SUPABASE_SERVICE_KEY</td>
                        <td className="py-2 pr-3 text-slate-400">service_role secret key</td>
                        <td className="py-2 text-slate-400">Supabase dashboard → Project Settings → API (server/CI only).</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-3 font-mono text-emerald-300 font-semibold">SUPABASE_ANON_KEY</td>
                        <td className="py-2 pr-3 text-slate-400">anon public key</td>
                        <td className="py-2 text-slate-400">Safe for client read queries with Row Level Security turned on.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-[11px] text-amber-300 leading-relaxed">
                  <strong>⚠️ Service Key Security Warning:</strong> The <code>SUPABASE_SERVICE_KEY</code> bypasses all Row Level Security. Use it only in server-side scripts (such as the GitHub Actions importer). For client reads, use <code>SUPABASE_ANON_KEY</code> with RLS enabled. If a secret is ever exposed publicly, rotate it immediately in the dashboard.
                </div>
              </div>

              {/* GitHub Actions Snippet */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono text-[#22d3ee] uppercase tracking-wider font-semibold">
                    1. Scheduled GitHub Actions Workflow (.github/workflows/update.yml)
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Every 6 Hours (UTC)</span>
                </div>
                <pre className="p-3 bg-[#0b0d1a] border border-[#222642] rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`name: Update releases
on:
  schedule:
    - cron: "0 */6 * * *"     # every 6 hours (UTC)
  workflow_dispatch:           # manual "Run" button in GitHub Actions UI
jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: node scripts/fetch-tmdb.mjs
        env:
          TMDB_KEY: \${{ secrets.TMDB_KEY }}
          SUPABASE_URL: \${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: \${{ secrets.SUPABASE_SERVICE_KEY }}
      - run: node scripts/fetch-anilist.mjs
        env:
          SUPABASE_URL: \${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: \${{ secrets.SUPABASE_SERVICE_KEY }}`}
                </pre>
              </div>

              {/* Supabase SQL Schema */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                    2. Production Supabase SQL Tables with RLS (server/schema.sql)
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">PostgreSQL Schema</span>
                </div>
                <pre className="p-3 bg-[#0b0d1a] border border-[#222642] rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48 leading-relaxed">
{`-- Titles table with source deduplication and lock support
CREATE TABLE titles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source VARCHAR(50) NOT NULL DEFAULT 'tmdb',
  source_id VARCHAR(100),
  name TEXT NOT NULL,
  category VARCHAR(30) NOT NULL,
  release_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Confirmed',
  platform TEXT NOT NULL,
  locked BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT uq_titles_source_source_id UNIQUE (source, source_id)
);

-- Date history for delay alerts
CREATE TABLE release_date_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_id UUID NOT NULL REFERENCES titles(id),
  title_name TEXT NOT NULL,
  old_date DATE NOT NULL,
  new_date DATE NOT NULL,
  reason TEXT,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE release_date_history ENABLE ROW LEVEL SECURITY;

-- Allow public read access (SUPABASE_ANON_KEY)
CREATE POLICY "Public read titles" ON titles FOR SELECT USING (true);
CREATE POLICY "Public read date history" ON release_date_history FOR SELECT USING (true);

-- Allow service_role key full access (GitHub Actions)
CREATE POLICY "Service role full access" ON titles FOR ALL USING (auth.role() = 'service_role');`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
