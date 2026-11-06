import { DropTitle } from '../types';

export interface CsvImportResult {
  added: number;
  updated: number;
  errors: string[];
  drops: DropTitle[];
}

export function parseGoogleSheetsCsv(csvText: string): CsvImportResult {
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) {
    return { added: 0, updated: 0, errors: ['CSV file is empty or missing headers.'], drops: [] };
  }

  const header = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const titleIdx = header.findIndex(h => h.includes('title') || h.includes('name'));
  const categoryIdx = header.findIndex(h => h.includes('category') || h.includes('type'));
  const dateIdx = header.findIndex(h => h.includes('date') || h.includes('release'));
  const platformIdx = header.findIndex(h => h.includes('platform') || h.includes('network') || h.includes('console'));
  const statusIdx = header.findIndex(h => h.includes('status'));
  const descIdx = header.findIndex(h => h.includes('desc') || h.includes('synopsis'));

  if (titleIdx === -1 || dateIdx === -1) {
    return {
      added: 0,
      updated: 0,
      errors: ['Required columns "Title" and "Release Date" could not be detected in CSV headers.'],
      drops: []
    };
  }

  const drops: DropTitle[] = [];
  const errors: string[] = [];
  const now = Date.now();
  const maxFuture = now + 5 * 365 * 24 * 60 * 60 * 1000; // 5 years

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    // Simple CSV row parser handling quotes
    const values = rawLine.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || rawLine.split(',');
    const cleanValues = values.map(v => v.trim().replace(/^"|"$/g, ''));

    const name = cleanValues[titleIdx];
    const rawDate = cleanValues[dateIdx];
    if (!name || !rawDate) continue;

    // Sanity Check 1: Valid date format
    const targetTime = new Date(rawDate).getTime();
    if (isNaN(targetTime)) {
      errors.push(`Row ${i + 1} (${name}): Invalid date format "${rawDate}". Use YYYY-MM-DD.`);
      continue;
    }

    // Sanity Check 2: Date not in the distant past (> 30 days ago for upcoming tracker)
    if (targetTime < now - 30 * 86400000) {
      errors.push(`Row ${i + 1} (${name}): Date ${rawDate} is already in the past.`);
      continue;
    }

    // Sanity Check 3: Date not more than 5 years away
    if (targetTime > maxFuture) {
      errors.push(`Row ${i + 1} (${name}): Date ${rawDate} exceeds 5-year sanity threshold.`);
      continue;
    }

    const categoryVal = (categoryIdx !== -1 ? cleanValues[categoryIdx] : 'Movies') as any;
    const validCategory = ['Movies', 'Anime', 'Games', 'Dramas', 'Books', 'Manga'].includes(categoryVal)
      ? categoryVal
      : 'Movies';

    const statusVal = (statusIdx !== -1 ? cleanValues[statusIdx] : 'Confirmed') as any;
    const validStatus = ['Confirmed', 'Tentative', 'Delayed'].includes(statusVal) ? statusVal : 'Confirmed';

    const platform = platformIdx !== -1 && cleanValues[platformIdx] ? cleanValues[platformIdx] : 'Theatrical / Digital';
    const description = descIdx !== -1 && cleanValues[descIdx] ? cleanValues[descIdx] : 'Imported via team Google Sheet catalog.';

    const daysRemaining = Math.max(0, Math.ceil((targetTime - now) / 86400000));

    drops.push({
      id: `sheets-${Date.now()}-${i}`,
      name,
      category: validCategory,
      date: rawDate,
      daysRemaining,
      status: validStatus,
      platform,
      gradient: 'from-[#10b981] via-[#059669] to-[#0b0d1a]',
      accent: '#10b981',
      tagline: 'Team Google Sheet Entry',
      description,
      source: 'sheets',
      locked: true, // Auto-locked because entered by team
      updatedAt: new Date().toISOString()
    });
  }

  return {
    added: drops.length,
    updated: 0,
    errors,
    drops
  };
}
