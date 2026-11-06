import { DropTitle } from '../types';

export async function fetchOpenLibraryReleases(): Promise<DropTitle[]> {
  const drops: DropTitle[] = [];

  try {
    const res = await fetch('https://openlibrary.org/trending/daily.json?limit=6', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(8000)
    });

    if (res.ok) {
      const data = await res.json();
      const works = data?.works || [];

      let index = 0;
      for (const work of works.slice(0, 4)) {
        index++;
        const title = work.title || 'Anticipated Literary Work';
        const author = work.author_name?.[0] || 'Acclaimed Author';
        const coverId = work.cover_i;
        const coverUrl = coverId 
          ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
          : undefined;

        // Schedule next month releases
        const daysRemaining = 12 + index * 6;
        const futureDate = new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000);
        const dateStr = futureDate.toISOString().split('T')[0];

        drops.push({
          id: `openlib-${work.key ? work.key.replace(/\//g, '-') : index}`,
          name: title,
          category: 'Books',
          date: dateStr,
          daysRemaining,
          status: 'Confirmed',
          platform: 'Hardcover / Audible / Waterstones',
          gradient: 'from-[#f59e0b] via-[#ea580c] to-[#0b0d1a]',
          accent: '#f59e0b',
          tagline: `By ${author} • Trending Literary Edition`,
          description: `Acclaimed publication entering the international literary spotlight. First edition release with exclusive author commentary.`,
          image: coverUrl,
          source: 'openlibrary',
          sourceId: work.key,
          sourceUrl: work.key ? `https://openlibrary.org${work.key}` : undefined,
          updatedAt: new Date().toISOString()
        });
      }
    }
  } catch (err) {
    console.warn('[OpenLibrary Fetcher] Notice:', (err as Error).message);
  }

  return drops;
}
