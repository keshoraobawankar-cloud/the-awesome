import React from 'react';
import { Clapperboard, Film, Sparkles, Zap } from 'lucide-react';

export type MovieFormat = 'IMAX' | 'Standard' | '4DX' | 'Dolby Cinema';

interface FormatConfig {
  label: MovieFormat;
  badgeClass: string;
  indicatorClass: string;
  icon: React.ComponentType<{ className?: string }>;
}

const FORMAT_STYLES: Record<MovieFormat, FormatConfig> = {
  IMAX: {
    label: 'IMAX',
    badgeClass: 'bg-cyan-500/15 text-cyan-200 border-cyan-400/50',
    indicatorClass: 'bg-cyan-400',
    icon: Clapperboard
  },
  'Dolby Cinema': {
    label: 'Dolby Cinema',
    badgeClass: 'bg-violet-500/15 text-violet-200 border-violet-400/50',
    indicatorClass: 'bg-violet-400',
    icon: Sparkles
  },
  '4DX': {
    label: '4DX',
    badgeClass: 'bg-[#ff3d71]/15 text-rose-200 border-[#ff3d71]/50',
    indicatorClass: 'bg-[#ff3d71]',
    icon: Zap
  },
  Standard: {
    label: 'Standard',
    badgeClass: 'bg-slate-500/15 text-slate-300 border-slate-500/40',
    indicatorClass: 'bg-slate-400',
    icon: Film
  }
};

export function inferMovieFormats(source: {
  format?: MovieFormat;
  formats?: MovieFormat[];
  platform?: string;
  tagline?: string;
  description?: string;
}): MovieFormat[] {
  if (source.formats && source.formats.length > 0) {
    return source.formats;
  }
  if (source.format) {
    return [source.format];
  }

  const text = `${source.platform || ''} ${source.tagline || ''} ${source.description || ''}`.toLowerCase();
  const detected: MovieFormat[] = [];

  if (text.includes('imax') || text.includes('70mm')) {
    detected.push('IMAX');
  }
  if (text.includes('dolby')) {
    detected.push('Dolby Cinema');
  }
  if (text.includes('4dx')) {
    detected.push('4DX');
  }

  if (detected.length === 0) {
    detected.push('Standard');
  }

  return detected;
}

interface FormatBadgeProps {
  format: MovieFormat;
  size?: 'xs' | 'sm';
  className?: string;
}

export const FormatBadge: React.FC<FormatBadgeProps> = ({
  format,
  size = 'sm',
  className = ''
}) => {
  const config = FORMAT_STYLES[format] || FORMAT_STYLES.Standard;
  const Icon = config.icon;
  const padding = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-[11px]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-mono font-semibold tracking-wide whitespace-nowrap shrink-0 ${padding} ${config.badgeClass} ${className}`}
      title={`${config.label} theatrical format`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.indicatorClass}`} aria-hidden="true" />
      <Icon className="w-3 h-3 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
};
