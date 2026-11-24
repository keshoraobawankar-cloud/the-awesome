import React, { useEffect, useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  Share2,
  Image as ImageIcon,
  ExternalLink,
  Sparkles,
  Link2
} from 'lucide-react';
import { DropTitle } from '../../data/dropRadarData';
import { useBugle } from '../../context/BugleContext';

interface ShareMovieModalProps {
  drop: DropTitle | null;
  onClose: () => void;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = (text || '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      if (current) {
        lines.push(current);
        current = word;
      } else {
        lines.push(word);
        current = '';
      }
      if (lines.length === maxLines) break;
    }
  }

  if (current && lines.length < maxLines) {
    lines.push(current);
  }

  if (lines.length === maxLines && words.join(' ').length > lines.join(' ').length) {
    let last = lines[maxLines - 1];
    while (last.length > 3 && ctx.measureText(`${last}...`).width > maxWidth) {
      last = last.slice(0, -1);
    }
    lines[maxLines - 1] = `${last}...`;
  }

  return lines;
}

function loadPosterImage(rawUrl?: string): Promise<HTMLImageElement | null> {
  if (!rawUrl) return Promise.resolve(null);
  const src = rawUrl.startsWith('https://')
    ? `/api/image-proxy?url=${encodeURIComponent(rawUrl)}`
    : rawUrl.startsWith('/')
      ? rawUrl
      : '';

  if (!src) return Promise.resolve(null);

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const timeout = window.setTimeout(() => resolve(null), 4500);
    img.onload = () => {
      window.clearTimeout(timeout);
      resolve(img);
    };
    img.onerror = () => {
      window.clearTimeout(timeout);
      resolve(null);
    };
    img.src = src;
  });
}

export const ShareMovieModal: React.FC<ShareMovieModalProps> = ({ drop, onClose }) => {
  const { showToast } = useBugle();
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);

  useEffect(() => {
    if (!drop) {
      setPreviewDataUrl(null);
      setPreviewBlob(null);
      setCopiedLink(false);
      setCopiedImage(false);
      return;
    }

    let cancelled = false;
    setIsGenerating(true);
    setPreviewDataUrl(null);
    setPreviewBlob(null);

    const generatePreviewCard = async () => {
      const poster = await loadPosterImage(drop.image);
      if (cancelled) return;

      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsGenerating(false);
        return;
      }

      const isBollywood = drop.industry === 'Bollywood';
      const primary = isBollywood ? '#f59e0b' : '#22d3ee';
      const secondary = isBollywood ? '#ff3d71' : '#8b5cf6';

      // Base dark gradient
      const bg = ctx.createLinearGradient(0, 0, 1200, 630);
      bg.addColorStop(0, '#0b0d1a');
      bg.addColorStop(0.55, '#121528');
      bg.addColorStop(1, '#070812');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 1200, 630);

      // Ambient radial glows
      const glow1 = ctx.createRadialGradient(220, 130, 20, 220, 130, 520);
      glow1.addColorStop(0, isBollywood ? 'rgba(245, 158, 11, 0.25)' : 'rgba(34, 211, 238, 0.25)');
      glow1.addColorStop(1, 'rgba(11, 13, 26, 0)');
      ctx.fillStyle = glow1;
      ctx.fillRect(0, 0, 1200, 630);

      const glow2 = ctx.createRadialGradient(1020, 520, 20, 1020, 520, 460);
      glow2.addColorStop(0, isBollywood ? 'rgba(255, 61, 113, 0.24)' : 'rgba(139, 92, 246, 0.24)');
      glow2.addColorStop(1, 'rgba(11, 13, 26, 0)');
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, 1200, 630);

      // Card container
      drawRoundedRect(ctx, 32, 32, 1136, 566, 28);
      ctx.fillStyle = 'rgba(18, 21, 40, 0.88)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#2b3052';
      ctx.stroke();

      // Top accent strip clipped inside card
      ctx.save();
      drawRoundedRect(ctx, 32, 32, 1136, 566, 28);
      ctx.clip();
      const bar = ctx.createLinearGradient(32, 0, 1168, 0);
      bar.addColorStop(0, primary);
      bar.addColorStop(1, secondary);
      ctx.fillStyle = bar;
      ctx.fillRect(32, 32, 1136, 8);
      ctx.restore();

      // Right Poster Panel
      const posterX = 824;
      const posterY = 72;
      const posterW = 304;
      const posterH = 486;

      ctx.save();
      drawRoundedRect(ctx, posterX, posterY, posterW, posterH, 20);
      ctx.clip();

      if (poster && poster.width > 0 && poster.height > 0) {
        const scale = Math.max(posterW / poster.width, posterH / poster.height);
        const drawW = poster.width * scale;
        const drawH = poster.height * scale;
        const dx = posterX + (posterW - drawW) / 2;
        const dy = posterY + (posterH - drawH) / 2;
        ctx.drawImage(poster, dx, dy, drawW, drawH);

        const posterOverlay = ctx.createLinearGradient(0, posterY, 0, posterY + posterH);
        posterOverlay.addColorStop(0, 'rgba(11, 13, 26, 0.15)');
        posterOverlay.addColorStop(0.7, 'rgba(11, 13, 26, 0.25)');
        posterOverlay.addColorStop(1, 'rgba(11, 13, 26, 0.88)');
        ctx.fillStyle = posterOverlay;
        ctx.fillRect(posterX, posterY, posterW, posterH);
      } else {
        const fallbackGrad = ctx.createLinearGradient(posterX, posterY, posterX + posterW, posterY + posterH);
        fallbackGrad.addColorStop(0, '#171a30');
        fallbackGrad.addColorStop(1, '#0b0d1a');
        ctx.fillStyle = fallbackGrad;
        ctx.fillRect(posterX, posterY, posterW, posterH);

        ctx.fillStyle = primary;
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('AHEADOFYOU', posterX + posterW / 2, posterY + posterH / 2 - 14);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 15px sans-serif';
        ctx.fillText('CINEMA RADAR CARD', posterX + posterW / 2, posterY + posterH / 2 + 18);
        ctx.textAlign = 'left';
      }

      // Countdown badge inside poster bottom
      drawRoundedRect(ctx, posterX + 20, posterY + posterH - 76, posterW - 40, 56, 14);
      ctx.fillStyle = 'rgba(11, 13, 26, 0.9)';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#ff3d71';
      ctx.stroke();

      ctx.fillStyle = '#fda4af';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('COUNTDOWN TO DROP', posterX + 36, posterY + posterH - 52);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 24px sans-serif';
      ctx.fillText(`T-${drop.daysRemaining} DAYS`, posterX + 36, posterY + posterH - 27);
      ctx.restore();

      // Poster border
      drawRoundedRect(ctx, posterX, posterY, posterW, posterH, 20);
      ctx.lineWidth = 2;
      ctx.strokeStyle = isBollywood ? 'rgba(245, 158, 11, 0.5)' : 'rgba(34, 211, 238, 0.5)';
      ctx.stroke();

      // Left Content Area
      const leftX = 76;
      const contentMaxWidth = 706;

      // Brand header
      ctx.font = '900 26px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('AHEAD', leftX, 102);
      const aheadWidth = ctx.measureText('AHEAD').width;
      ctx.fillStyle = '#22d3ee';
      ctx.fillText('OFYOU', leftX + aheadWidth, 102);

      ctx.font = 'bold 13px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('LIVE CINEMA RELEASE RADAR', leftX + aheadWidth + ctx.measureText('OFYOU').width + 18, 100);

      // Badges row
      const industryLabel = (drop.industry || drop.category || 'Cinema').toUpperCase();
      ctx.font = 'bold 14px monospace';
      const indPadWidth = Math.max(128, ctx.measureText(industryLabel).width + 36);
      drawRoundedRect(ctx, leftX, 128, indPadWidth, 34, 17);
      ctx.fillStyle = isBollywood ? 'rgba(245, 158, 11, 0.18)' : 'rgba(34, 211, 238, 0.18)';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = primary;
      ctx.stroke();
      ctx.fillStyle = primary;
      ctx.fillText(industryLabel, leftX + 18, 150);

      const statusLabel = drop.status.toUpperCase();
      const statusX = leftX + indPadWidth + 14;
      const statusPadWidth = Math.max(118, ctx.measureText(statusLabel).width + 34);
      drawRoundedRect(ctx, statusX, 128, statusPadWidth, 34, 17);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.16)';
      ctx.fill();
      ctx.strokeStyle = '#10b981';
      ctx.stroke();
      ctx.fillStyle = '#6ee7b7';
      ctx.fillText(statusLabel, statusX + 17, 150);

      // Movie Title
      ctx.font = '900 54px sans-serif';
      ctx.fillStyle = '#ffffff';
      const titleLines = wrapTextLines(ctx, drop.name, contentMaxWidth, 2);
      let cursorY = 236;
      for (const line of titleLines) {
        ctx.fillText(line, leftX, cursorY);
        cursorY += 64;
      }

      // Tagline
      ctx.font = '500 22px sans-serif';
      ctx.fillStyle = '#cbd5e1';
      const taglineLines = wrapTextLines(
        ctx,
        drop.tagline || drop.description || 'Verified upcoming release countdown on AheadOfYou.',
        contentMaxWidth,
        2
      );
      let tagY = titleLines.length > 1 ? 356 : 306;
      for (const line of taglineLines) {
        ctx.fillText(line, leftX, tagY);
        tagY += 32;
      }

      // Divider
      ctx.beginPath();
      ctx.moveTo(leftX, 446);
      ctx.lineTo(leftX + contentMaxWidth, 446);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#252846';
      ctx.stroke();

      // Metadata grid
      ctx.font = 'bold 13px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('RELEASE DATE', leftX, 488);
      ctx.fillText('PLATFORM / STUDIO', leftX + 235, 488);
      ctx.fillText('TRUSTED SOURCE', leftX + 495, 488);

      ctx.font = '800 24px sans-serif';
      ctx.fillStyle = primary;
      ctx.fillText(drop.date, leftX, 524);

      ctx.font = '700 21px sans-serif';
      ctx.fillStyle = '#ffffff';
      const platformLine = wrapTextLines(ctx, drop.platform || 'Theatrical', 235, 1)[0] || 'Theatrical';
      ctx.fillText(platformLine, leftX + 235, 524);

      ctx.font = '700 17px monospace';
      ctx.fillStyle = '#34d399';
      const sourceLine =
        wrapTextLines(ctx, drop.trustedSourceLabel || 'AheadOfYou Verified', 210, 1)[0] ||
        'AheadOfYou Verified';
      ctx.fillText(sourceLine, leftX + 495, 524);

      const dataUrl = canvas.toDataURL('image/png');
      if (cancelled) return;

      setPreviewDataUrl(dataUrl);
      canvas.toBlob((blob) => {
        if (!cancelled && blob) {
          setPreviewBlob(blob);
        }
      }, 'image/png');

      setIsGenerating(false);

      // Cache PNG on backend so /share/movie/:id OG image tags serve this rendered card
      fetch(`/api/share/preview/${encodeURIComponent(drop.id)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl })
      }).catch(() => {
        // Non-blocking background upload; SVG fallback remains available
      });
    };

    generatePreviewCard().catch(() => {
      if (!cancelled) setIsGenerating(false);
    });

    return () => {
      cancelled = true;
    };
  }, [drop]);

  if (!drop) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const directLink = `${origin}/?movie=${encodeURIComponent(drop.id)}#cinema-hub`;
  const socialShareUrl = `${origin}/share/movie/${encodeURIComponent(drop.id)}`;
  const svgFallbackUrl = `/api/share/preview/${encodeURIComponent(drop.id)}.svg`;
  const industryTag = drop.industry ? `#${drop.industry}` : '#Movies';
  const shareText = `${drop.name} drops on ${drop.date} (T-${drop.daysRemaining}D)! Track the live countdown & official trailer on AheadOfYou. #AheadOfYou ${industryTag}`;

  const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(socialShareUrl)}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(socialShareUrl)}&quote=${encodeURIComponent(shareText)}`;

  const safeFileSlug = drop.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const handleCopyDirectLink = async () => {
    try {
      await navigator.clipboard.writeText(directLink);
      setCopiedLink(true);
      showToast('Direct movie link copied to clipboard!');
      window.setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      showToast('Copy failed — please select and copy the link manually.');
    }
  };

  const handleCopyPreviewImage = async () => {
    if (!previewBlob || typeof ClipboardItem === 'undefined' || !navigator.clipboard?.write) {
      showToast('Direct image copy is not supported in this browser — use Download PNG.');
      return;
    }
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': previewBlob })]);
      setCopiedImage(true);
      showToast('Preview card image copied to clipboard!');
      window.setTimeout(() => setCopiedImage(false), 2500);
    } catch {
      showToast('Clipboard image permission blocked — click Download Card instead.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-[#0b0d1a]/85 backdrop-blur-2xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-[#121528] border-2 border-[#2b3052] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#252846] bg-[#0f1223]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bebas text-2xl text-white tracking-wide leading-none">
                SHARE MOVIE DROP
              </h3>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                {drop.name} · Generated 1200×630 Social Preview Card
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-[#171a30] text-slate-400 hover:text-white border border-[#2b3052] transition-colors"
            aria-label="Close share dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Generated Preview Image */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#ff3d71]" />
                <span>Social Preview Card</span>
              </span>
              <span className="text-slate-400">
                {isGenerating ? 'Rendering PNG preview...' : '1200 × 630 Ready'}
              </span>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-[#2b3052] bg-[#0b0d1a] aspect-[1200/630] shadow-xl">
              <img
                src={previewDataUrl || svgFallbackUrl}
                alt={`${drop.name} social share preview`}
                className="w-full h-full object-cover"
              />
              {isGenerating && (
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#0b0d1a]/85 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 backdrop-blur-md">
                  Building HD Card...
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href={previewDataUrl || svgFallbackUrl}
                download={`${safeFileSlug || 'movie'}-aheadofyou-preview.${previewDataUrl ? 'png' : 'svg'}`}
                className="px-3.5 py-2 rounded-xl bg-[#171a30] hover:bg-[#202444] border border-[#2b3052] hover:border-cyan-400 text-xs font-mono font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-cyan-300" />
                <span>Download Preview Image</span>
              </a>

              <button
                type="button"
                onClick={handleCopyPreviewImage}
                disabled={!previewBlob}
                className="px-3.5 py-2 rounded-xl bg-[#171a30] hover:bg-[#202444] disabled:opacity-50 border border-[#2b3052] hover:border-cyan-400 text-xs font-mono font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 transition-all"
              >
                {copiedImage ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <ImageIcon className="w-3.5 h-3.5 text-amber-300" />
                )}
                <span>{copiedImage ? 'Image Copied' : 'Copy Preview Image'}</span>
              </button>
            </div>
          </div>

          {/* Direct Movie Link Copy */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-300">
              <Link2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Direct Movie Link</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={directLink}
                onFocus={(e) => e.target.select()}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#0b0d1a] border border-[#2b3052] text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={handleCopyDirectLink}
                className={`px-4 py-2.5 rounded-xl text-xs font-inter font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                  copiedLink
                    ? 'bg-emerald-600 text-white border border-emerald-500'
                    : 'bg-gradient-to-r from-[#22d3ee] to-[#8b5cf6] text-[#0b0d1a] hover:brightness-110'
                }`}
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Social Platform Links (no window.open for iframe compliance) */}
          <div className="space-y-2 pt-1 border-t border-[#252846]">
            <p className="text-xs font-mono text-slate-400">
              Share directly with rich OpenGraph preview card:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={twitterIntentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-xl bg-[#0b0d1a] hover:bg-[#171a30] border border-[#2b3052] hover:border-cyan-400 text-white text-xs sm:text-sm font-inter font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <span className="font-mono font-black text-cyan-300 text-sm">𝕏</span>
                <span>Share on Twitter / X</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>

              <a
                href={facebookShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-xl bg-[#1877F2]/15 hover:bg-[#1877F2]/25 border border-[#1877F2]/50 hover:border-[#1877F2] text-white text-xs sm:text-sm font-inter font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <span className="font-sans font-black text-[#60a5fa] text-sm">f</span>
                <span>Share on Facebook</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#93c5fd]" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
