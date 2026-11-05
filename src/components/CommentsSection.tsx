import React, { useState } from 'react';
import { MessageSquare, ThumbsUp, Send, ShieldAlert, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useBugle } from '../context/BugleContext';
import { StoryComment } from '../data/comments';
import { playTypewriterSound } from '../utils/audio';

interface CommentsSectionProps {
  storyId: string;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ storyId }) => {
  const { comments, addComment, upvoteComment } = useBugle();

  const [author, setAuthor] = useState('');
  const [role, setRole] = useState('');
  const [content, setContent] = useState('');
  const [stance, setStance] = useState<'threat' | 'hero' | 'neutral'>('threat');
  const [filterStance, setFilterStance] = useState<'all' | 'threat' | 'hero' | 'staff'>('all');

  const storyComments = comments[storyId] || [];

  const filteredComments = storyComments.filter((c) => {
    if (filterStance === 'all') return true;
    if (filterStance === 'staff') return c.isStaff;
    return c.stance === filterStance;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    playTypewriterSound();

    const commenterName = author.trim() || 'Anonymous Midtown Citizen';
    const commenterRole = role.trim() || 'NYC Resident';
    const initials = commenterName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 3)
      .toUpperCase() || 'NYC';

    addComment(storyId, {
      storyId,
      author: commenterName,
      role: commenterRole,
      avatarInitials: initials,
      content: content.trim(),
      stance,
      isStaff: commenterName.toLowerCase().includes('jameson') || commenterName.toLowerCase().includes('bugle')
    });

    setContent('');
  };

  const getStanceBadge = (st: 'threat' | 'hero' | 'neutral') => {
    switch (st) {
      case 'threat':
        return (
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950/60 px-2 py-0.5 rounded">
            🗞️ Menace!
          </span>
        );
      case 'hero':
        return (
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
            🕸️ City Hero
          </span>
        );
      case 'neutral':
      default:
        return (
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded">
            ⚖️ Neutral Fact
          </span>
        );
    }
  };

  return (
    <section className="no-print mt-12 pt-8 border-t-2 border-[#1c1917] dark:border-[#262629]">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-2 border-b border-[#e7e2d9] dark:border-[#262629]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-red-700 text-white rounded">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-xl text-[#1c1917] dark:text-white uppercase tracking-tight">
              Reader Reactions & Letters to the Editor
            </h3>
            <p className="text-xs font-sans text-[#78716c] dark:text-[#a8a29e]">
              Unfiltered arguments, eyewitness accounts, and civic debate from across the five boroughs.
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-0.5 bg-[#ede8df] dark:bg-[#1a1a1e] rounded text-xs">
          <button
            type="button"
            onClick={() => setFilterStance('all')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              filterStance === 'all'
                ? 'bg-white dark:bg-[#2d2d34] text-[#1c1917] dark:text-white shadow-xs font-bold'
                : 'text-[#78716c] dark:text-[#a8a29e] hover:text-[#1c1917] dark:hover:text-white'
            }`}
          >
            All ({storyComments.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStance('threat')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              filterStance === 'threat'
                ? 'bg-white dark:bg-[#2d2d34] text-red-700 dark:text-red-400 shadow-xs font-bold'
                : 'text-[#78716c] dark:text-[#a8a29e] hover:text-[#1c1917] dark:hover:text-white'
            }`}
          >
            Menace
          </button>
          <button
            type="button"
            onClick={() => setFilterStance('hero')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              filterStance === 'hero'
                ? 'bg-white dark:bg-[#2d2d34] text-emerald-700 dark:text-emerald-400 shadow-xs font-bold'
                : 'text-[#78716c] dark:text-[#a8a29e] hover:text-[#1c1917] dark:hover:text-white'
            }`}
          >
            Hero
          </button>
          <button
            type="button"
            onClick={() => setFilterStance('staff')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              filterStance === 'staff'
                ? 'bg-white dark:bg-[#2d2d34] text-[#1c1917] dark:text-white shadow-xs font-bold'
                : 'text-[#78716c] dark:text-[#a8a29e] hover:text-[#1c1917] dark:hover:text-white'
            }`}
          >
            Bugle Staff
          </button>
        </div>
      </div>

      {/* Write a Reaction Box */}
      <form
        onSubmit={handleSubmit}
        className="mb-8 p-4 sm:p-5 bg-white dark:bg-[#18181c] border border-[#e5dfd5] dark:border-[#262629] rounded shadow-xs"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-sans font-bold uppercase tracking-wider text-red-700 dark:text-red-400">
            Submit a Public Reply to this Story
          </span>
          <span className="text-[11px] text-[#a8a29e]">· Letters subject to editorial review</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Your Name (e.g. Peter P., Midtown Commuter)"
            className="px-3 py-2 bg-[#fcfaf7] dark:bg-[#202025] border border-[#d6cfc2] dark:border-[#2d2d34] rounded text-xs text-[#1c1917] dark:text-white placeholder-[#a8a29e] focus:outline-none focus:ring-1 focus:ring-red-600"
          />
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Borough / Occupation (e.g. Queens Resident, Cab Driver)"
            className="px-3 py-2 bg-[#fcfaf7] dark:bg-[#202025] border border-[#d6cfc2] dark:border-[#2d2d34] rounded text-xs text-[#1c1917] dark:text-white placeholder-[#a8a29e] focus:outline-none focus:ring-1 focus:ring-red-600"
          />
        </div>

        {/* Stance Selector */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs font-sans text-[#78716c] dark:text-[#a8a29e] mr-1">Your Editorial Stance:</span>
          <button
            type="button"
            onClick={() => setStance('threat')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              stance === 'threat'
                ? 'bg-red-700 text-white font-bold'
                : 'bg-[#ede8df] dark:bg-[#202025] text-[#57534e] dark:text-[#a8a29e] hover:bg-[#e2dcce]'
            }`}
          >
            🗞️ Spidey is a Menace!
          </button>
          <button
            type="button"
            onClick={() => setStance('hero')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              stance === 'hero'
                ? 'bg-emerald-700 text-white font-bold'
                : 'bg-[#ede8df] dark:bg-[#202025] text-[#57534e] dark:text-[#a8a29e] hover:bg-[#e2dcce]'
            }`}
          >
            🕸️ Spider-Man is a Hero!
          </button>
          <button
            type="button"
            onClick={() => setStance('neutral')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              stance === 'neutral'
                ? 'bg-[#1c1917] dark:bg-white text-white dark:text-[#1c1917] font-bold'
                : 'bg-[#ede8df] dark:bg-[#202025] text-[#57534e] dark:text-[#a8a29e] hover:bg-[#e2dcce]'
            }`}
          >
            ⚖️ Objective Eyewitness
          </button>
        </div>

        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="State your argument, quote city ordinances, or back up Mr. Jameson..."
          className="w-full px-3 py-2 bg-[#fcfaf7] dark:bg-[#202025] border border-[#d6cfc2] dark:border-[#2d2d34] rounded text-xs sm:text-sm text-[#1c1917] dark:text-white placeholder-[#a8a29e] focus:outline-none focus:ring-1 focus:ring-red-600 mb-3"
          required
        />

        <div className="flex items-center justify-between">
          <span className="text-[11px] font-sans text-[#78716c] dark:text-[#a8a29e]">
            Pressing submit posts directly to the public broadsheet.
          </span>
          <button
            type="submit"
            disabled={!content.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white font-sans text-xs font-bold uppercase tracking-wider rounded transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish Reaction</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {filteredComments.length === 0 ? (
          <div className="text-center py-8 text-xs font-sans text-[#78716c] dark:text-[#a8a29e] bg-[#faf8f4] dark:bg-[#18181c] rounded p-6 border border-[#ece7de] dark:border-[#262629]">
            No reactions filed under this filter category yet. Be the first to share your testimony above!
          </div>
        ) : (
          filteredComments.map((comment) => (
            <div
              key={comment.id}
              className={`p-4 bg-white dark:bg-[#18181c] border rounded transition-colors ${
                comment.isStaff
                  ? 'border-red-600/50 dark:border-red-500/40 bg-red-50/20 dark:bg-red-950/20'
                  : 'border-[#e5dfd5] dark:border-[#262629]'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      comment.isStaff
                        ? 'bg-red-700 text-white'
                        : 'bg-[#ede8df] dark:bg-[#25252b] text-[#1c1917] dark:text-white'
                    }`}
                  >
                    {comment.avatarInitials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif-display font-bold text-sm text-[#1c1917] dark:text-white">
                        {comment.author}
                      </span>
                      {comment.isStaff && (
                        <span className="text-[10px] font-sans font-bold bg-red-700 text-white px-1.5 py-0.2 rounded-xs uppercase tracking-wider">
                          Bugle Staff
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-sans text-[#78716c] dark:text-[#a8a29e]">
                      <span>{comment.role}</span>
                      <span aria-hidden="true">·</span>
                      <span>{comment.timestamp}</span>
                    </div>
                  </div>
                </div>

                <div>{getStanceBadge(comment.stance)}</div>
              </div>

              {/* Comment Body */}
              <p className="font-editorial text-sm sm:text-base text-[#292524] dark:text-[#e7e5e4] leading-relaxed pl-10 mb-3">
                "{comment.content}"
              </p>

              {/* Reaction Action Bar */}
              <div className="pl-10 flex items-center gap-4 text-xs font-sans text-[#78716c] dark:text-[#a8a29e]">
                <button
                  onClick={() => upvoteComment(storyId, comment.id)}
                  className="inline-flex items-center gap-1.5 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                  title="Agree with this statement"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span className="font-bold tabular-nums">{comment.upvotes}</span>
                  <span className="hidden sm:inline">Agree</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};
