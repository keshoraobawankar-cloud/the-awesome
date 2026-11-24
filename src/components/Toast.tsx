import React from 'react';
import { Bookmark, CheckCircle2 } from 'lucide-react';
import { useBugle } from '../context/BugleContext';

export const Toast: React.FC = () => {
  const { toastMessage } = useBugle();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[150] flex items-center gap-3 bg-[#121528] text-white px-4 py-3 rounded-xl shadow-2xl border border-cyan-500/40 text-sm font-medium animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 animate-pulse" />
      <Bookmark className="w-4 h-4 text-[#ff3d71] shrink-0" />
      <span>{toastMessage}</span>
    </div>
  );
};
