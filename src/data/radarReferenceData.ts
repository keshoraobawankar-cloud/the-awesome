export interface RadarItem {
  id: string;
  name: string;
  category: 'Movies' | 'Anime' | 'Games' | 'Dramas' | 'Books';
  daysOffset: number; // in fractional days from current timestamp for live countdown
  status: 'confirmed' | 'tentative' | 'delayed';
  where: string;
  description: string;
  platformDetail?: string;
  themeColor?: string;
  excerptTitle?: string;
  excerptParagraphs?: string[];
}

export interface EditorialRadarStory {
  id: string;
  category: 'Movies' | 'Anime' | 'Games' | 'Dramas' | 'Books';
  title: string;
  deck: string;
  readTimeMinutes: number;
  author: string;
  publishedDate: string;
  paragraphs: string[];
}

export const RADAR_CATEGORIES = ['All', 'Movies', 'Anime', 'Games', 'Dramas', 'Books'] as const;
export type RadarCategory = (typeof RADAR_CATEGORIES)[number];

export const RADAR_ITEMS: RadarItem[] = [
  {
    id: 'radar-midtown-nights',
    name: 'Midtown Nights',
    category: 'Movies',
    daysOffset: 1.15,
    status: 'confirmed',
    where: 'In theaters',
    description: 'A neo-noir crime thriller chronicling three NYPD detectives pursuing a syndicate heist crew across Lower Manhattan.',
    platformDetail: 'Nationwide Theatrical & IMAX Release',
    themeColor: 'from-blue-900 to-stone-900',
    excerptTitle: 'Production Notes: Street Filming Under Rain Towers',
    excerptParagraphs: [
      'Principal photography took place almost entirely on location in Chinatown, the Financial District, and the waterfront piers of Brooklyn.',
      'Director Marcus Vance insisted on shooting with custom anamorphic lenses and genuine rain rigs rather than digital post-production weather effects.',
      'Early test screenings reported a visceral 1970s pacing reminiscent of The French Connection and Serpico.'
    ]
  },
  {
    id: 'radar-skyline-runners-2',
    name: 'Skyline Runners 2',
    category: 'Games',
    daysOffset: 3.2,
    status: 'confirmed',
    where: 'PC, PS5, Xbox',
    description: 'The anticipated parkour action sequel featuring seamless rooftop traversal, dynamic weather, and co-op underground district raids.',
    platformDetail: 'Steam, PlayStation 5, Xbox Series X|S',
    themeColor: 'from-amber-600 to-stone-900',
    excerptTitle: 'Lead Designer Dispatch: Rebuilding Traversal Physics',
    excerptParagraphs: [
      'In Skyline Runners 2, inertia and momentum are governed by authentic momentum mechanics. Every ledge grab, wall-run, and zip-line transfer feels responsive.',
      'The procedural rooftop generation engine renders over 14 square miles of dense vertical architecture without a single loading screen.',
      'Pre-orders grant access to the vintage Daily Bugle shutterbug courier skin.'
    ]
  },
  {
    id: 'radar-web-of-lanterns',
    name: 'Web of Lanterns, S2',
    category: 'Anime',
    daysOffset: 6.4,
    status: 'confirmed',
    where: 'Crunchyroll',
    description: 'Season 2 dives into the Spirit Guild Tournament as ancient seal spirits breach the capital city gates in a dazzling visual showcase.',
    platformDetail: 'Simulcast in Japanese with subtitles; English dub follows 2 weeks later',
    themeColor: 'from-red-600 to-indigo-950',
    excerptTitle: 'Director Studio Interview: The 6-Minute Uncut Climax',
    excerptParagraphs: [
      'Episode 1 opens with an ambitious six-minute continuous action sequence animated by over thirty key animators across Tokyo and Seoul.',
      'The musical score features traditional shamisen and koto orchestration interwoven with modern synthetic breakbeats.',
      'Fans can expect answers regarding the celestial guardian seal left behind in the season 1 cliffhanger.'
    ]
  },
  {
    id: 'radar-the-last-edition',
    name: 'The Last Edition',
    category: 'Dramas',
    daysOffset: 9.3,
    status: 'tentative',
    where: 'Netflix',
    description: 'A gripping newsroom period drama following an investigative broadsheet uncovering municipal corruption during the 1982 transit strike.',
    platformDetail: 'Weekly episodic rollout on Netflix Worldwide',
    themeColor: 'from-stone-700 to-zinc-950',
    excerptTitle: 'Series Overview: Ink Stains and Telephones',
    excerptParagraphs: [
      'Created by Emmy-winning showrunners, The Last Edition explores the relentless ethical compromises of investigative reporting in the pre-internet era.',
      'The series stars veteran character actors portraying rival desk editors fighting for front-page real estate before the midnight press run.',
      'Network reps noted the premiere date is subject to final ADR sound mixing approvals.'
    ]
  },
  {
    id: 'radar-rooftop-chronicles',
    name: 'Rooftop Chronicles, Vol. 7',
    category: 'Books',
    daysOffset: 14.1,
    status: 'confirmed',
    where: 'Paperback and ebook',
    description: 'The bestselling urban fantasy novel reaches its penultimate conflict as the Gargoyle Watcher guild breaks its three-century truce.',
    platformDetail: 'Available in Trade Paperback, Kindle Ebook & Audible Audio',
    themeColor: 'from-emerald-700 to-slate-950',
    excerptTitle: 'Chapter 1: Rain on Bronze Wings',
    excerptParagraphs: [
      'The bronze wings of the cathedral gargoyle were slick with November sleet when Aaron heard the distinct click of an antique crossbow bolt.',
      'For three hundred years, the rooftop guardians had sworn never to interfere with mortal affairs below 14th Street. But tonight, blood on the cobblestones changed everything.',
      'He reached for the talisman tucked inside his trench coat collar. The brass was burning hot against his skin.'
    ]
  },
  {
    id: 'radar-harbor-lights',
    name: 'Harbor Lights',
    category: 'Movies',
    daysOffset: 22.5,
    status: 'delayed',
    where: 'Moved from Nov 20',
    description: 'Post-production VFX polish moved this maritime survival drama into late December for optimal award-qualifying holiday screenings.',
    platformDetail: 'Theatrical distribution via Metro Pictures',
    themeColor: 'from-cyan-900 to-stone-900',
    excerptTitle: 'Studio Statement Regarding Release Shift',
    excerptParagraphs: [
      'Producers confirmed that the two-week delay was requested directly by the VFX supervisor to ensure historical fidelity in the North Atlantic storm sequence.',
      'The film features an unbroken twenty-minute scene depicting the distress rescue of a commercial fishing vessel during a Category 4 nor’easter.',
      'Advance press screenings will begin in New York and Los Angeles ahead of the revised premiere date.'
    ]
  },
  {
    id: 'radar-iron-alley',
    name: 'Iron Alley',
    category: 'Games',
    daysOffset: 31.0,
    status: 'tentative',
    where: 'PC',
    description: 'An isometric tactical cyberpunk shooter with destructible environments, modular cybernetic weaponry, and squad-based turn tactical gameplay.',
    platformDetail: 'Steam Early Access & GOG DRM-free launch',
    themeColor: 'from-orange-700 to-stone-950',
    excerptTitle: 'Developer Diary: Grid-Free Tactical Cover',
    excerptParagraphs: [
      'Iron Alley ditches conventional tile grids in favor of continuous geometric line-of-sight and true ballistic penetration.',
      'Concrete pillars crack and crumble under heavy machine-gun fire, forcing players to dynamically reposition their fireteams.',
      'Beta testing has expanded to 10,000 community participants this week.'
    ]
  },
  {
    id: 'radar-gta-6',
    name: 'Grand Theft Auto VI',
    category: 'Games',
    daysOffset: 13.8,
    status: 'confirmed',
    where: 'PS5, Xbox Series X|S',
    description: 'The definitive open-world criminal sandbox epic exploring the sun-drenched vice capital of Leonida.',
    platformDetail: 'Global console launch across PlayStation 5 and Xbox Series X|S',
    themeColor: 'from-pink-600 to-purple-900',
    excerptTitle: 'Rockstar Games Wire: Setting New Open-World Standards',
    excerptParagraphs: [
      'Leonida represents the most immersive and sprawling open-world environment ever created by Rockstar Games.',
      'Featuring dual protagonists Lucia and Jason, the story navigates modern viral social media culture, underground cartels, and high-stakes bank robberies.'
    ]
  },
  {
    id: 'radar-demon-slayer',
    name: 'Demon Slayer: Infinity Castle',
    category: 'Anime',
    daysOffset: 29.4,
    status: 'confirmed',
    where: 'Theatrical IMAX',
    description: 'The monumental theatrical event kicking off the three-part cinematic climax of the Infinity Castle Arc.',
    platformDetail: 'IMAX, 4DX & Standard Theaters Worldwide',
    themeColor: 'from-red-700 to-amber-950',
    excerptTitle: 'ufotable Press Conference: The Architecture of the Castle',
    excerptParagraphs: [
      'The shifting rooms and gravity-defying corridors of the Infinity Castle were rendered with proprietary 3D camera mapping to create disorientation and spectacle.',
      'Tanjiro and the Hashira launch their coordinated offensive against Muzan Kibutsuji.'
    ]
  },
  {
    id: 'radar-spider-verse-3',
    name: 'Beyond the Spider-Verse',
    category: 'Movies',
    daysOffset: 42.0,
    status: 'confirmed',
    where: 'IMAX 70mm / Theaters',
    description: 'Miles Morales must defy multiversal canon to save his father and return to Brooklyn before reality collapses.',
    platformDetail: 'Sony Pictures Animation / Worldwide Theatrical',
    themeColor: 'from-purple-800 to-stone-950',
    excerptTitle: 'Phil Lord & Chris Miller on the Trilogy Finale',
    excerptParagraphs: [
      'The animation team utilized five distinct art styles simultaneously in the multi-dimensional showdown on Earth-42.',
      'Gwen Stacy’s band of rogue Spider-People race against the clock to locate Miles.'
    ]
  }
];

export const EDITORIAL_STORIES: EditorialRadarStory[] = [
  {
    id: 'story-trailers-three-sequels',
    category: 'Movies',
    title: 'Trailer week: three sequels show their hand',
    deck: 'Release dates held steady, but one studio moved its premiere by a week to avoid a direct head-to-head opening weekend with IMAX tentpoles.',
    readTimeMinutes: 3,
    author: 'The Release Desk',
    publishedDate: 'Friday, November 6, 2026',
    paragraphs: [
      'It was a high-stakes Tuesday along Hollywood Boulevard as three major studios dropped official trailers within six hours of one another, triggering frantic calendar recalibrations among theater bookers.',
      'While the superhero sequels held firm on their November launch windows, indie distributor Metro Pictures opted to slide their festival award contender back by seven days to secure exclusive access to premium large-format screens in thirty domestic markets.',
      '“Exhibitors cannot split sixty-foot screens between two action tentpoles,” remarked box-office analyst Claire Dupont. “The tactical retreat was the smartest move on the board.”'
    ]
  },
  {
    id: 'story-winter-anime-lineup',
    category: 'Anime',
    title: 'Winter season lineup is locked',
    deck: 'Twelve new series confirmed, with simulcast platforms listed for each across Tokyo broadcast slots and global streaming networks.',
    readTimeMinutes: 4,
    author: 'Anime Wire Service',
    publishedDate: 'Friday, November 6, 2026',
    paragraphs: [
      'The Japanese broadcasting syndicates locked their final winter quarter schedule late Thursday night, confirming forty-two active productions across prime-time and midnight blocks.',
      'Among the most anticipated returns is the second season of Web of Lanterns, which secured an exclusive day-and-date simulcast arrangement with Crunchyroll in over two hundred territories.',
      'Subscribers can also anticipate subtitle localizations in nine languages within two hours of initial broadcast completion.'
    ]
  },
  {
    id: 'story-open-world-sequel',
    category: 'Games',
    title: 'Open-world sequel gets a firm launch date',
    deck: 'Pre-orders open today across consoles and PC, featuring complete cross-play progression and zero microtransaction restrictions.',
    readTimeMinutes: 2,
    author: 'Gaming Bureau',
    publishedDate: 'Friday, November 6, 2026',
    paragraphs: [
      'Developers put an end to months of fan speculation this morning with an unannounced five-minute gameplay deep dive that culminated in an unyielding worldwide release date.',
      'The game will feature an expansive 1:1 scale downtown metropolitan district with full interior access to subway tunnels, skyscrapers, and industrial docks.',
      'Early pre-order bonuses include exclusive physical map posters and art books printed on archival matte paper.'
    ]
  },
  {
    id: 'story-fan-favorite-drama',
    category: 'Dramas',
    title: 'Fan-favorite drama returns for a second season',
    deck: 'Episodes will air weekly instead of dropping all at once, restoring the classic cliffhanger watercooler conversation of prestige television.',
    readTimeMinutes: 3,
    author: 'Television Editor',
    publishedDate: 'Friday, November 6, 2026',
    paragraphs: [
      'Streaming platforms are continuing their decisive retreat from the binge-release model. In an official bulletin today, producers announced that Season 2 will debut with a two-episode premiere followed by eight weekly installments.',
      'Showrunners cited viewer retention and narrative tension as primary drivers: “A mystery cannot breathe when people skip to the final ten minutes on Friday morning.”',
      'The second season picks up three months after the dramatic courthouse standoff that concluded last autumn’s finale.'
    ]
  },
  {
    id: 'story-novel-behind-anime',
    category: 'Books',
    title: 'The novel behind the anime has a new volume',
    deck: 'English edition lands a month after the Japanese release, accompanied by an exclusive author commentary on character backstories.',
    readTimeMinutes: 2,
    author: 'Literary Desk',
    publishedDate: 'Friday, November 6, 2026',
    paragraphs: [
      'Publishing imprint Yen Press confirmed this afternoon that translation galleys for Volume 7 have cleared editorial review well ahead of the anticipated holiday deadline.',
      'The novel’s breakout success on international charts has spurred record pre-orders, with special hardcover editions including foil-stamped dust jackets and four full-color foldout illustrations.',
      'Author remarks indicate that the series is entering its final narrative arc, with two subsequent volumes planned to conclude the saga.'
    ]
  },
  {
    id: 'story-festival-darling-streaming',
    category: 'Movies',
    title: 'Festival darling heads to streaming',
    deck: 'Platform confirms an exclusive window and a subtitle schedule, bringing Cannes and Venice applause straight into living rooms.',
    readTimeMinutes: 3,
    author: 'Cinema Desk',
    publishedDate: 'Friday, November 6, 2026',
    paragraphs: [
      'After sweeping jury accolades across European autumn film festivals, director Elena Ruiz’s maritime drama has secured a worldwide distribution pact.',
      'Rather than languishing in an indeterminate limbo between theatrical run and digital purchase, the production will enjoy a concise three-week cinema showcase before arriving on home platforms.',
      'Subscribers will also gain access to a recorded Q&A featuring the lead ensemble and cinematographer.'
    ]
  }
];

export const FLASH_BULLETINS = [
  'Release Desk confirms five drops this week',
  'Harbor Lights slips by three weeks',
  'Winter anime lineup is now final',
  'Skyline Runners 2 pre-orders are open',
  'Spider-Man sighted near Queensboro Bridge overpass',
  'Oscorp Industries denies unauthorized bio-glider test flights',
  'Daily Bugle offers $10,000 for unmasked photographs'
];
