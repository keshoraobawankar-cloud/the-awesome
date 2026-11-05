import React, { useEffect, useRef, useState } from 'react';
import { X, Sparkles, RefreshCcw } from 'lucide-react';
import { useBugle } from '../context/BugleContext';
import { playWebShooterSound } from '../utils/audio';

interface WebAnchor {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  progress: number;
}

export const VigilanteWebOverlay: React.FC = () => {
  const { isWebShooterActive, dismissWebShooter } = useBugle();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [webs, setWebs] = useState<Array<{ fromX: number; fromY: number; toX: number; toY: number }>>([]);
  const [showThwipBadge, setShowThwipBadge] = useState(true);

  // Auto-dismiss timer after 10s or user can dismiss manually
  useEffect(() => {
    if (!isWebShooterActive) {
      setWebs([]);
      return;
    }

    setShowThwipBadge(true);

    // Initial cluster of dramatic web lines across the viewport
    const width = window.innerWidth;
    const height = window.innerHeight;

    const initialWebs = [
      { fromX: 0, fromY: 0, toX: width * 0.45, toY: height * 0.35 },
      { fromX: width, fromY: 0, toX: width * 0.55, toY: height * 0.35 },
      { fromX: 0, fromY: height * 0.4, toX: width * 0.5, toY: height * 0.4 },
      { fromX: width, fromY: height * 0.45, toX: width * 0.52, toY: height * 0.38 },
      { fromX: width * 0.5, fromY: 0, toX: width * 0.5, toY: height * 0.35 },
      { fromX: 0, fromY: height, toX: width * 0.48, toY: height * 0.42 },
      { fromX: width, fromY: height, toX: width * 0.52, toY: height * 0.42 }
    ];

    setWebs(initialWebs);

    const timer = setTimeout(() => {
      setShowThwipBadge(false);
    }, 4500);

    return () => clearTimeout(timer);
  }, [isWebShooterActive]);

  // Canvas drawing of high-tensile spider webs
  useEffect(() => {
    if (!isWebShooterActive || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw main web lines
    webs.forEach((web) => {
      ctx.beginPath();
      ctx.moveTo(web.fromX, web.fromY);
      ctx.lineTo(web.toX, web.toY);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 4;
      ctx.stroke();

      // Intersecting subtle fibrous lines
      ctx.beginPath();
      ctx.moveTo(web.fromX, web.fromY);
      ctx.quadraticCurveTo(
        (web.fromX + web.toX) / 2 + 10,
        (web.fromY + web.toY) / 2 - 10,
        web.toX,
        web.toY
      );
      ctx.strokeStyle = 'rgba(235, 240, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw central spider-web spiral rosette at the focal point
    if (webs.length > 0) {
      const centerX = window.innerWidth * 0.5;
      const centerY = window.innerHeight * 0.38;

      for (let r = 20; r <= 160; r += 25) {
        ctx.beginPath();
        for (let angle = 0; angle <= Math.PI * 2; angle += Math.PI / 6) {
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * (r * 0.7);
          if (angle === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
  }, [isWebShooterActive, webs]);

  if (!isWebShooterActive) return null;

  // Clicking on screen shoots more webs!
  const handleScreenClick = (e: React.MouseEvent) => {
    playWebShooterSound();
    const cornerX = Math.random() > 0.5 ? 0 : window.innerWidth;
    const cornerY = Math.random() > 0.5 ? 0 : window.innerHeight;
    setWebs((prev) => [
      ...prev,
      { fromX: cornerX, fromY: cornerY, toX: e.clientX, toY: e.clientY }
    ]);
  };

  return (
    <div
      onClick={handleScreenClick}
      className="fixed inset-0 z-50 pointer-events-auto cursor-crosshair overflow-hidden"
    >
      {/* Web Rendering Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Comic Pop "THWIP!" Splash */}
      {showThwipBadge && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-in zoom-in-50 duration-200">
          <div className="bg-red-700 text-yellow-300 border-4 border-black px-6 py-3 font-headline font-black text-4xl sm:text-6xl tracking-widest uppercase rotate-[-8deg] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3">
            <span>THWIP!</span>
            <span className="text-2xl text-white">🕸️</span>
          </div>
          <div className="mt-2 text-center text-xs font-bold text-white bg-black/80 px-3 py-1 rounded-full uppercase tracking-wider">
            Click anywhere on screen to shoot more webs!
          </div>
        </div>
      )}

      {/* Spider-Man's Hand-Written Sticky Note stuck to the screen */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute top-6 right-6 max-w-xs bg-yellow-100 text-[#1c1917] p-4 rounded shadow-2xl border-2 border-yellow-300 rotate-[3deg] z-20 cursor-default animate-in slide-in-from-top-4 duration-300"
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="text-xs font-bold text-red-700 uppercase tracking-widest flex items-center gap-1">
            <span>🕷️ Friendly Neighborhood Note</span>
          </div>
          <button
            onClick={dismissWebShooter}
            className="p-1 hover:bg-yellow-200 rounded text-stone-700 transition-colors"
            title="Clean up webs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="font-editorial text-sm italic text-stone-800 leading-snug">
          "Hey Jonah! Borrowed your front page for target practice. Tell Robbie I said hi and don't forget to pay Parker his freelance check!"
        </p>

        <div className="mt-3 pt-2 border-t border-yellow-300/80 flex items-center justify-between">
          <span className="font-serif-display font-bold text-xs text-red-700">— Spidey 🕸️</span>
          <button
            onClick={dismissWebShooter}
            className="text-[11px] font-sans font-bold text-stone-900 bg-yellow-300 hover:bg-yellow-400 px-2 py-0.5 rounded transition-colors"
          >
            Sweep Webs Away
          </button>
        </div>
      </div>
    </div>
  );
};
