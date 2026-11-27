import React, { useEffect, useMemo, useState } from 'react';
import { buildYouTubeEmbedUrl, type DropTrailerItem, type TrailerKind } from '../../utils/youtube';

interface TrailerSwitcherProps {
  trailers?: DropTrailerItem[];
  fallbackTrailerUrl?: string;
  dropTitle: string;
  autoplay?: boolean;
  showSourceFooter?: boolean;
  className?: string;
  onActiveTrailerChange?: (item: DropTrailerItem) => void;
}

const KIND_LABELS: Record<TrailerKind, string> = {
  official_trailer: 'Official Trailer',
  teaser: 'Teaser',
  gameplay: 'Gameplay',
  launch_trailer: 'Launch Trailer'
};

function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.split('/').filter(Boolean)[0];
      return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
    }
    if (parsed.pathname === '/watch') {
      const id = parsed.searchParams.get('v');
      return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
    }
    const [prefix, id] = parsed.pathname.split('/').filter(Boolean);
    if ((prefix === 'shorts' || prefix === 'embed' || prefix === 'live') && id) {
      return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
    }
  } catch {
    return null;
  }
  return null;
}

export const TrailerSwitcher: React.FC<TrailerSwitcherProps> = ({
  trailers = [],
  fallbackTrailerUrl,
  dropTitle,
  autoplay = false,
  showSourceFooter = true,
  className = '',
  onActiveTrailerChange
}) => {
  const normalizedItems = useMemo<DropTrailerItem[]>(() => {
    const active = trailers.filter((t) => t.status !== 'flagged_broken');
    if (active.length > 0) {
      return active;
    }
    if (fallbackTrailerUrl) {
      const videoId = extractYouTubeId(fallbackTrailerUrl);
      if (videoId) {
        return [
          {
            id: `legacy_${videoId}`,
            dropId: '',
            kind: 'official_trailer',
            videoId,
            url: fallbackTrailerUrl,
            embedUrl: buildYouTubeEmbedUrl(videoId),
            title: `${dropTitle} - Trailer`,
            createdAt: ''
          }
        ];
      }
    }
    return [];
  }, [trailers, fallbackTrailerUrl, dropTitle]);

  const defaultSelectedId = useMemo(() => {
    const primary = normalizedItems.find((t) => t.isPrimary);
    if (primary) return primary.id;

    const official = normalizedItems.find((t) => t.kind === 'official_trailer');
    if (official) return official.id;

    return normalizedItems[0]?.id ?? '';
  }, [normalizedItems]);

  const [selectedId, setSelectedId] = useState<string>(defaultSelectedId);

  // Keep selection valid if trailers change on a drop
  useEffect(() => {
    if (!normalizedItems.some((item) => item.id === selectedId)) {
      setSelectedId(defaultSelectedId);
    }
  }, [normalizedItems, selectedId, defaultSelectedId]);

  const activeTrailer =
    normalizedItems.find((item) => item.id === selectedId) ?? normalizedItems[0];

  useEffect(() => {
    if (activeTrailer && onActiveTrailerChange) {
      onActiveTrailerChange(activeTrailer);
    }
  }, [activeTrailer?.id]);

  if (!activeTrailer) {
    return null;
  }

  const showSwitcher = normalizedItems.length > 1;
  const embedSrc =
    activeTrailer.embedUrl ||
    `https://www.youtube-nocookie.com/embed/${activeTrailer.videoId}?autoplay=${autoplay ? '1' : '0'}&rel=0`;

  return (
    <div className={`space-y-3 ${className}`}>
      {showSwitcher && (
        <div
          role="tablist"
          aria-label={`Trailers for ${dropTitle}`}
          className="flex flex-wrap items-center gap-2"
        >
          {normalizedItems.map((item) => {
            const isSelected = item.id === activeTrailer.id;
            const label = KIND_LABELS[item.kind] ?? 'Trailer';

            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedId(item.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  isSelected
                    ? 'bg-white text-black shadow-sm'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
        <iframe
          key={activeTrailer.videoId}
          src={embedSrc}
          title={activeTrailer.title || `${dropTitle} - ${KIND_LABELS[activeTrailer.kind]}`}
          className="h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>

      {showSourceFooter && activeTrailer.channelName && (
        <p className="text-xs text-zinc-400">
          Source: <span className="text-zinc-200">{activeTrailer.channelName}</span>
        </p>
      )}
    </div>
  );
};
