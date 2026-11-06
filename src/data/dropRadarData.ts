/**
 * DropRadar Data Source
 * 12 cinematic titles, category panels, weekly timeline drops, and news dispatches.
 * 
 * TO CONNECT A REAL API:
 * Replace this static dataset with a fetch call to your backend or CMS:
 * e.g., const res = await fetch('/api/releases'); const data = await res.json();
 */

export interface DropTitle {
  id: string;
  name: string;
  category: 'Movies' | 'Anime' | 'Games' | 'Dramas' | 'Books' | 'Manga';
  date: string;
  daysRemaining: number;
  status: 'Confirmed' | 'Tentative' | 'Delayed';
  platform: string;
  gradient: string;
  accent: string;
  tagline: string;
  description: string;
  image?: string;
  source?: 'curated' | 'anilist' | 'tmdb' | 'openlibrary' | 'manual' | 'sheets' | 'wikidata';
  sourceId?: string;
  sourceUrl?: string;
  locked?: boolean;
  updatedAt?: string;
  dateHistory?: Array<{
    id: string;
    titleId: string;
    titleName: string;
    oldDate: string;
    newDate: string;
    detectedAt: string;
    reason?: string;
  }>;
}

export interface UserUpdateSubmission {
  id: string;
  targetTitleId?: string;
  targetTitleName: string;
  updateType: 'date_change' | 'delay_alert' | 'platform_added' | 'new_release' | 'breaking_scoop';
  suggestedDate?: string;
  suggestedStatus?: 'Confirmed' | 'Tentative' | 'Delayed';
  category: 'Movies' | 'Anime' | 'Games' | 'Dramas' | 'Books' | 'Manga';
  platform?: string;
  details: string;
  sourceUrl?: string;
  submittedBy: string;
  status: 'pending' | 'verified' | 'applied' | 'rejected';
  confirmationsCount: number;
  submittedAt: string;
}

export interface CategoryPanel {
  id: string;
  title: string;
  subtitle: string;
  count: number;
  countLabel: string;
  accent: string;
  bgGradient: string;
  featuredTitle: string;
  iconName: string;
}

export interface TimelineDrop {
  id: string;
  day: string;
  dateStr: string;
  title: string;
  category: 'Movies' | 'Anime' | 'Games' | 'Dramas' | 'Books' | 'Manga';
  status: 'Confirmed' | 'Tentative' | 'Delayed';
  platform: string;
  timeSlot: string;
  highlight: string;
  side: 'left' | 'right';
}

export interface StackingNewsCard {
  id: string;
  kicker: string;
  title: string;
  deck: string;
  source: string;
  readTime: string;
  date: string;
  gradient: string;
  tag: string;
}

export const HERO_FEATURED_DROP: DropTitle = {
  id: 'drop-gta-6',
  name: 'Grand Theft Auto VI',
  category: 'Games',
  date: '2026-11-19',
  daysRemaining: 14,
  status: 'Confirmed',
  platform: 'PlayStation 5 / Xbox Series X|S',
  gradient: 'from-[#ff3d71] via-[#8b5cf6] to-[#0b0d1a]',
  accent: '#ff3d71',
  tagline: 'The next monumental evolution of open-world criminal sandbox gameplay.',
  description: 'Welcome back to the neon-soaked streets of Vice City and Leonida. Dual protagonists Lucia and Jason ignite a high-stakes criminal saga.',
  image: '/src/assets/images/bank_heist_web_aftermath_1793361604681.jpg'
};

export const DROP_TITLES_12: DropTitle[] = [
  HERO_FEATURED_DROP,
  {
    id: 'drop-spider-verse-3',
    name: 'Spider-Man: Beyond the Spider-Verse',
    category: 'Movies',
    date: '2026-12-18',
    daysRemaining: 42,
    status: 'Confirmed',
    platform: 'Theatrical (IMAX 70mm)',
    gradient: 'from-[#22d3ee] via-[#8b5cf6] to-[#0b0d1a]',
    accent: '#22d3ee',
    tagline: 'Miles Morales defies multiversal canon to save reality.',
    description: 'Trapped on Earth-42, Miles must escape his sinister counterpart while Gwen Stacy leads a rescue brigade across dimensions.',
    image: '/src/assets/images/oscorp_tower_investigation_1793361605278.jpg'
  },
  {
    id: 'drop-demon-slayer',
    name: 'Demon Slayer: Infinity Castle (Part 1)',
    category: 'Anime',
    date: '2026-12-05',
    daysRemaining: 29,
    status: 'Confirmed',
    platform: 'Theatrical (IMAX) / Crunchyroll',
    gradient: 'from-[#ff3d71] via-[#f59e0b] to-[#0b0d1a]',
    accent: '#ff3d71',
    tagline: 'The climactic final confrontation against Muzan Kibutsuji begins.',
    description: 'The shifting rooms of the Infinity Castle host the mortal duel between the Hashira and the Upper Rank demons.',
    image: '/src/assets/images/bank_heist_web_aftermath_1793361604681.jpg'
  },
  {
    id: 'drop-wolverine',
    name: "Marvel's Wolverine",
    category: 'Games',
    date: '2026-10-23',
    daysRemaining: 3,
    status: 'Confirmed',
    platform: 'PlayStation 5 Exclusive',
    gradient: 'from-[#f59e0b] via-[#ef4444] to-[#0b0d1a]',
    accent: '#f59e0b',
    tagline: 'Brutal adamantium claw combat and gritty underworld hunts.',
    description: 'Logan navigates the treacherous underworld of Madripoor in a standalone, mature-rated action epic.',
    image: '/src/assets/images/oscorp_tower_investigation_1793361605278.jpg'
  },
  {
    id: 'drop-stranger-things-5',
    name: 'Stranger Things 5: The Final Stand',
    category: 'Dramas',
    date: '2026-10-31',
    daysRemaining: 7,
    status: 'Confirmed',
    platform: 'Netflix Worldwide',
    gradient: 'from-[#ef4444] via-[#8b5cf6] to-[#0b0d1a]',
    accent: '#ef4444',
    tagline: 'The battle for Hawkins reaches its terrifying conclusion.',
    description: 'The Upside Down fissures tear through Indiana as Eleven and the party execute their final offensive against Vecna.',
    image: '/src/assets/images/bank_heist_web_aftermath_1793361604681.jpg'
  },
  {
    id: 'drop-chainsaw-man-reze',
    name: 'Chainsaw Man – Movie: Reze Arc',
    category: 'Anime',
    date: '2026-11-28',
    daysRemaining: 23,
    status: 'Confirmed',
    platform: 'Theatrical Worldwide / Crunchyroll',
    gradient: 'from-[#f97316] via-[#ec4899] to-[#0b0d1a]',
    accent: '#f97316',
    tagline: 'A bittersweet summer romance that detonates into war.',
    description: 'Denji falls for the enigmatic Reze, unaware that foreign assassins are converging on Tokyo to capture the Chainsaw Heart.',
    image: '/src/assets/images/oscorp_tower_investigation_1793361605278.jpg'
  },
  {
    id: 'drop-last-king-faerie',
    name: 'The Last King of Faerie',
    category: 'Books',
    date: '2026-11-03',
    daysRemaining: 1,
    status: 'Confirmed',
    platform: 'Hardcover & Digital Audio',
    gradient: 'from-[#10b981] via-[#22d3ee] to-[#0b0d1a]',
    accent: '#10b981',
    tagline: 'Cassandra Clare opens The Wicked Powers concluding trilogy.',
    description: 'Ty Blackthorn and Kit Rook investigate high-ranking runes as the gates of the Faerie realm threaten to lock permanently.',
    image: '/src/assets/images/jj_jameson_editorial_1793361604257.jpg'
  },
  {
    id: 'drop-silksong',
    name: 'Hollow Knight: Silksong',
    category: 'Games',
    date: '2026-12-15',
    daysRemaining: 39,
    status: 'Tentative',
    platform: 'Steam, Switch, PS5, Xbox Game Pass',
    gradient: 'from-[#ec4899] via-[#8b5cf6] to-[#0b0d1a]',
    accent: '#ec4899',
    tagline: 'Ascend to the peak of Pharloom with needle acrobatics.',
    description: 'Hornet explores a vast kingdom of silk and music, battling over 150 unique bug beasts across crystalline depths.',
    image: '/src/assets/images/bank_heist_web_aftermath_1793361604681.jpg'
  },
  {
    id: 'drop-midtown-nights',
    name: 'Midtown Nights',
    category: 'Movies',
    date: '2026-11-08',
    daysRemaining: 2,
    status: 'Confirmed',
    platform: 'Theaters Nationwide & IMAX',
    gradient: 'from-[#3b82f6] via-[#1d4ed8] to-[#0b0d1a]',
    accent: '#3b82f6',
    tagline: 'Hard-boiled crime under the rainy neon canyons of NYC.',
    description: 'A heist syndicate hits three vaults simultaneously, triggering a frantic citywide pursuit by the NYPD 14th Precinct.',
    image: '/src/assets/images/bank_heist_web_aftermath_1793361604681.jpg'
  },
  {
    id: 'drop-jujutsu-kaisen-manga',
    name: 'Jujutsu Kaisen: Cursed Sequel Epilogue',
    category: 'Manga',
    date: '2026-11-25',
    daysRemaining: 20,
    status: 'Confirmed',
    platform: 'Weekly Shonen Jump & Manga Plus',
    gradient: 'from-[#8b5cf6] via-[#ff3d71] to-[#0b0d1a]',
    accent: '#8b5cf6',
    tagline: 'Gege Akutami returns with an official 60-page special chapter.',
    description: 'Following the Shinjuku Showdown, lingering cursed energy anomalies emerge in Sendai, forcing senior sorcerers to regroup.',
    image: '/src/assets/images/oscorp_tower_investigation_1793361605278.jpg'
  },
  {
    id: 'drop-harbor-lights',
    name: 'Harbor Lights',
    category: 'Movies',
    date: '2026-11-29',
    daysRemaining: 24,
    status: 'Delayed',
    platform: 'Metro Pictures / Theaters',
    gradient: 'from-[#06b6d4] via-[#0284c7] to-[#0b0d1a]',
    accent: '#06b6d4',
    tagline: 'Delayed two weeks for North Atlantic VFX wave rendering.',
    description: 'An unbroken twenty-minute survival rescue during a Category 4 blizzard on the Grand Banks of Newfoundland.',
    image: '/src/assets/images/oscorp_tower_investigation_1793361605278.jpg'
  },
  {
    id: 'drop-wind-and-truth',
    name: 'Wind and Truth (Stormlight 5)',
    category: 'Books',
    date: '2026-12-06',
    daysRemaining: 30,
    status: 'Confirmed',
    platform: 'Tor Books / Audible Worldwide',
    gradient: 'from-[#38bdf8] via-[#6366f1] to-[#0b0d1a]',
    accent: '#38bdf8',
    tagline: 'The climactic tenth-day contest of champions on Roshar.',
    description: 'Brandon Sanderson concludes the first five-book cycle as Dalinar prepares to duel the divine champion of Odium.',
    image: '/src/assets/images/bank_heist_web_aftermath_1793361604681.jpg'
  }
];

export const CATEGORY_PANELS: CategoryPanel[] = [
  {
    id: 'cat-movies',
    title: 'Movies & IMAX',
    subtitle: 'Blockbuster Theatrical & Streaming Drops',
    count: 48,
    countLabel: 'Releases This Quarter',
    accent: '#ff3d71',
    bgGradient: 'from-[#ff3d71]/20 via-[#ff3d71]/5 to-transparent',
    featuredTitle: 'Spider-Man: Beyond the Spider-Verse',
    iconName: 'Film'
  },
  {
    id: 'cat-anime',
    title: 'Anime Premieres',
    subtitle: 'Simulcasts, Movies & OVA Specials',
    count: 36,
    countLabel: 'Premieres Confirmed',
    accent: '#8b5cf6',
    bgGradient: 'from-[#8b5cf6]/20 via-[#8b5cf6]/5 to-transparent',
    featuredTitle: 'Demon Slayer: Infinity Castle',
    iconName: 'Sparkles'
  },
  {
    id: 'cat-games',
    title: 'Gaming Launches',
    subtitle: 'PC, PlayStation, Xbox & Switch',
    count: 52,
    countLabel: 'Major Titles Scheduled',
    accent: '#22d3ee',
    bgGradient: 'from-[#22d3ee]/20 via-[#22d3ee]/5 to-transparent',
    featuredTitle: 'Grand Theft Auto VI',
    iconName: 'Gamepad2'
  },
  {
    id: 'cat-dramas',
    title: 'TV & Dramas',
    subtitle: 'Prestige Series & Weekly Cliffhangers',
    count: 28,
    countLabel: 'Seasons Debuting',
    accent: '#f59e0b',
    bgGradient: 'from-[#f59e0b]/20 via-[#f59e0b]/5 to-transparent',
    featuredTitle: 'Stranger Things 5 (Final Season)',
    iconName: 'Tv'
  },
  {
    id: 'cat-books',
    title: 'Books & Novels',
    subtitle: 'Bestseller Epics & Fantasy Sagas',
    count: 44,
    countLabel: 'Hardcover & Ebook Drops',
    accent: '#10b981',
    bgGradient: 'from-[#10b981]/20 via-[#10b981]/5 to-transparent',
    featuredTitle: 'The Last King of Faerie',
    iconName: 'BookOpen'
  },
  {
    id: 'cat-manga',
    title: 'Manga & Manhwa',
    subtitle: 'Simulpub Chapters & Tankōbon Volumes',
    count: 30,
    countLabel: 'Volumes Landing',
    accent: '#ec4899',
    bgGradient: 'from-[#ec4899]/20 via-[#ec4899]/5 to-transparent',
    featuredTitle: 'Jujutsu Kaisen Epilogue Chapter',
    iconName: 'FileText'
  }
];

export const THIS_WEEK_TIMELINE: TimelineDrop[] = [
  {
    id: 'time-1',
    day: 'Tuesday',
    dateStr: 'Nov 3, 2026',
    title: 'The Last King of Faerie',
    category: 'Books',
    status: 'Confirmed',
    platform: 'Hardcover / Audible',
    timeSlot: '00:01 EST',
    highlight: '688 Pages of Shadowhunters endgame.',
    side: 'left'
  },
  {
    id: 'time-2',
    day: 'Thursday',
    dateStr: 'Nov 5, 2026',
    title: 'Trailer Week Sequels Drop',
    category: 'Movies',
    status: 'Confirmed',
    platform: 'YouTube & IMAX Theaters',
    timeSlot: '09:00 PST',
    highlight: 'Three studio trailers reveal holiday windows.',
    side: 'right'
  },
  {
    id: 'time-3',
    day: 'Friday',
    dateStr: 'Nov 6, 2026',
    title: 'Midtown Nights (Early Access)',
    category: 'Movies',
    status: 'Confirmed',
    platform: '70mm Theaters NYC & LA',
    timeSlot: '19:00 EST',
    highlight: 'Neo-noir bank heist thriller premiere.',
    side: 'left'
  },
  {
    id: 'time-4',
    day: 'Sunday',
    dateStr: 'Nov 8, 2026',
    title: 'Skyline Runners 2 Pre-Load',
    category: 'Games',
    status: 'Confirmed',
    platform: 'Steam / PS5 Pre-Load',
    timeSlot: '12:00 UTC',
    highlight: '68 GB pre-load unlocked for pre-orders.',
    side: 'right'
  },
  {
    id: 'time-5',
    day: 'Next Tuesday',
    dateStr: 'Nov 10, 2026',
    title: 'Harbor Lights Rescheduled',
    category: 'Movies',
    status: 'Delayed',
    platform: 'Moved to Nov 29',
    timeSlot: 'Press Bulletin',
    highlight: 'VFX polish pushes maritime storm sequence.',
    side: 'left'
  }
];

export const STACKING_NEWS: StackingNewsCard[] = [
  {
    id: 'news-stack-1',
    kicker: 'INDUSTRY SHAKEUP',
    title: 'Studio Megadeal Guarantees 45-Day Exclusive Theatrical Window',
    deck: 'Top Hollywood distributors formally end the direct-to-streaming experiment, committing to 42 worldwide tentpoles in cinemas through 2028.',
    source: 'The Daily Bugle Wire',
    readTime: '3 min read',
    date: 'Today, 14:20 EST',
    gradient: 'from-[#ff3d71]/30 to-[#0b0d1a]',
    tag: 'Movies'
  },
  {
    id: 'news-stack-2',
    kicker: 'ANIME WIRE',
    title: 'Winter Season Lineup Locked: 42 Simulcasts Confirmed',
    deck: 'Japanese broadcasting syndicates finalize their broadcast slots, including day-and-date nine-language localizations within two hours.',
    source: 'Tokyo Anime Bureau',
    readTime: '4 min read',
    date: 'Yesterday, 19:45 JST',
    gradient: 'from-[#8b5cf6]/30 to-[#0b0d1a]',
    tag: 'Anime'
  },
  {
    id: 'news-stack-3',
    kicker: 'GAMING SCOOP',
    title: 'Cross-Play Progress Fully Unlocked Across All Consoles for GTA VI',
    deck: 'Rockstar Games confirms zero platform barriers for Crews, with continuous cloud progression between PC, PS5, and Xbox Series consoles.',
    source: 'Gaming Syndicate',
    readTime: '2 min read',
    date: '2 hours ago',
    gradient: 'from-[#22d3ee]/30 to-[#0b0d1a]',
    tag: 'Gaming'
  },
  {
    id: 'news-stack-4',
    kicker: 'LITERARY DESK',
    title: 'Record 1.2M Pre-Orders for Wind and Truth Hardcover Edition',
    deck: 'Tor Books reports unprecedented demand for Brandon Sanderson’s Stormlight Archive Book 5, prompting a second early printing.',
    source: 'Book News Desk',
    readTime: '3 min read',
    date: '4 hours ago',
    gradient: 'from-[#10b981]/30 to-[#0b0d1a]',
    tag: 'Books'
  }
];

export const STATS_METRICS = [
  { value: 500, suffix: '+', label: 'Titles Tracked', detail: 'Across all major media sectors' },
  { value: 12, suffix: '', label: 'Major Platforms', detail: 'Consoles, IMAX & Streaming networks' },
  { value: 24, suffix: '/7', label: 'Live Drop Audits', detail: 'Real-time calendar verification' },
  { value: 99.4, suffix: '%', label: 'Date Accuracy', detail: 'Vetted by our entertainment desk' }
];

export const TICKER_HEADLINES = [
  '⚡ GTA VI November 19 drop confirmed across PlayStation 5 and Xbox Series X|S',
  '🚨 Spider-Man: Beyond the Spider-Verse locks December 18 IMAX 70mm premiere',
  '🔥 Demon Slayer Infinity Castle Arc Part 1 tickets opening worldwide next Monday',
  '✨ The Last King of Faerie hits bookstores with record international pre-orders',
  '🌊 Harbor Lights maritime epic reschedules release to Nov 29 for VFX polish',
  '🎮 Skyline Runners 2 pre-load unlocks Sunday noon with exclusive Bugle skin'
];
