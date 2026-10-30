import React from 'react';
import { Bookmark, CheckCircle2 } from 'lucide-react';
import { useBugle } from '../context/BugleContext';

export const Toast: React.FC = () => {
  const { toastMessage } = useBugle();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#1c1917] dark:bg-[#262629] text-white px-4 py-3 rounded-md shadow-2xl border border-red-600/30 text-sm font-medium animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
      <Bookmark className="w-4 h-4 text-red-500 shrink-0" />
      <span>{toastMessage}</span>
    </div>
  );
};
