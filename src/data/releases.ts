export interface ReleaseItem {
  id: string;
  title: string;
  category: 'Movies' | 'Anime' | 'Gaming' | 'TV Dramas' | 'Books & Novels' | 'Entertainment News';
  platform: string;
  releaseDate: string; // YYYY-MM-DD
  image: string;
  status: 'Confirmed' | 'Coming Soon' | 'Out Now' | 'Breaking' | 'Delayed';
  description: string;
  creatorOrAuthor?: string;
  format?: string;
  readTime?: string;
  excerptTitle?: string;
  excerptParagraphs?: string[];
  themeColor?: string;
}

export const ENTERTAINMENT_RELEASES: ReleaseItem[] = [
  // ================= GAMING =================
  {
    id: 'rel-gta-6',
    title: 'Grand Theft Auto VI',
    category: 'Gaming',
    platform: 'PlayStation 5 / Xbox Series X|S',
    releaseDate: '2026-11-19',
    image: '/src/assets/images/bank_heist_web_aftermath_1793361604681.jpg',
    status: 'Confirmed',
    description: 'The next monumental evolution of open-world criminal sandbox gameplay set across the neon-soaked streets of Leonida and Vice City.',
    creatorOrAuthor: 'Rockstar Games / Sam Houser',
    format: 'Triple-A Open World Action',
    themeColor: 'from-pink-600 to-purple-800'
  },
  {
    id: 'rel-wolverine',
    title: "Marvel's Wolverine",
    category: 'Gaming',
    platform: 'PlayStation 5 Exclusive',
    releaseDate: '2026-10-23',
    image: '/src/assets/images/oscorp_tower_investigation_1793361605278.jpg',
    status: 'Confirmed',
    description: 'A visceral, standalone combat epic centered on Logan with razor-sharp adamantium claw combat, healing factor regeneration, and gritty underworld hunts across Madripoor.',
    creatorOrAuthor: 'Insomniac Games / Brian Horton',
    format: 'Mature 17+ Action Combat',
    themeColor: 'from-amber-600 to-red-800'
  },
  {
    id: 'rel-silksong',
    title: 'Hollow Knight: Silksong',
    category: 'Gaming',
    platform: 'Steam / PS5 / Switch / Xbox Game Pass',
    releaseDate: '2026-09-15',
    image: '/src/assets/images/bank_heist_web_aftermath_1793361604681.jpg',
    status: 'Coming Soon',
    description: 'Play as Hornet, princess-protector of Hallownest, as she ascends through the sprawling, haunted kingdom of Pharloom with needle acrobatics and silk crafting.',
    creatorOrAuthor: 'Team Cherry',
    format: 'Metroidvania Platformer',
    themeColor: 'from-rose-600 to-stone-900'
  },

  // ================= ANIME =================
  {
    id: 'rel-demon-slayer',
    title: 'Demon Slayer: Infinity Castle Arc (Part 1)',
    category: 'Anime',
    platform: 'Theatrical (IMAX) / Crunchyroll',
    releaseDate: '2026-12-05',
    image: '/src/assets/images/oscorp_tower_investigation_1793361605278.jpg',
    status: 'Coming Soon',
    description: 'The epic cinematic trilogy event adapting the final, breathtaking confrontation against Muzan Kibutsuji and the Upper Moon ranks inside the shifting Infinity Castle.',
    creatorOrAuthor: 'ufotable / Koyoharu Gotouge',
    format: 'Theatrical Movie Feature',
    themeColor: 'from-red-600 to-amber-900'
  },
  {
    id: 'rel-edgerunners-2',
    title: 'Cyberpunk: Edgerunners Season 2',
    category: 'Anime',
    platform: 'Netflix Exclusive Worldwide',
    releaseDate: '2026-10-20',
    image: '/src/assets/images/bank_heist_web_aftermath_1793361604681.jpg',
    status: 'Out Now',
    description: 'Return to the dangerous corporate sprawl of Night City with an all-new crew, high-octane cyberware action, and heartbreaking emotional twists.',
    creatorOrAuthor: 'Studio TRIGGER / CD PROJEKT RED',
    format: 'Anime Series (10 Episodes)',
    themeColor: 'from-yellow-500 to-cyan-900'
  },
  {
    id: 'rel-chainsaw-reze',
    title: 'Chainsaw Man – The Movie: Reze Arc',
    category: 'Anime',
    platform: 'Theatrical Worldwide / Crunchyroll',
    releaseDate: '2026-08-14',
    image: '/src/assets/images/oscorp_tower_investigation_1793361605278.jpg',
    status: 'Confirmed',
    description: 'Denji meets Reze at a late-night cafe, sparking a bittersweet summer romance that explodes into an all-out war with Soviet devil-hunter assassins across Tokyo.',
    creatorOrAuthor: 'MAPPA / Tatsuki Fujimoto',
    format: 'Anime Feature Film',
    themeColor: 'from-orange-600 to-zinc-900'
  },

  // ================= MOVIES =================
  {
    id: 'rel-spider-verse-3',
    title: 'Spider-Man: Beyond the Spider-Verse',
    category: 'Movies',
    platform: 'Theatrical Release (IMAX 70mm)',
    releaseDate: '2026-12-18',
    image: '/src/assets/images/bank_heist_web_aftermath_1793361604681.jpg',
    status: 'Confirmed',
    description: 'The breathtaking finale to the Oscar-winning animated trilogy. Miles Morales must escape his alternate Earth-42 self and break the canon before reality collapses.',
    creatorOrAuthor: 'Sony Pictures Animation / Phil Lord & Chris Miller',
    format: 'Theatrical Feature',
    themeColor: 'from-purple-700 to-indigo-950'
  },
  {
    id: 'rel-avengers-doomsday',
    title: 'Avengers: Doomsday / Secret Wars Prelude',
    category: 'Movies',
    platform: 'Theatrical (IMAX 3D) / Disney+',
    releaseDate: '2026-05-01',
    image: '/src/assets/images/oscorp_tower_investigation_1793361605278.jpg',
    status: 'Confirmed',
    description: 'Doctor Victor von Doom emerges from the collapsed multiverse to reshape reality on Battleworld. Earth’s mightiest heroes unite for the ultimate cosmic collision.',
    creatorOrAuthor: 'Marvel Studios / The Russo Brothers',
    format: 'Blockbuster Theatrical',
    themeColor: 'from-emerald-700 to-stone-950'
  },
  {
    id: 'rel-superman',
    title: 'Superman (DC Universe Chapter 1)',
    category: 'Movies',
    platform: 'Theatrical (IMAX) / Max',
    releaseDate: '2026-07-11',
    image: '/src/assets/images/bank_heist_web_aftermath_1793361604681.jpg',
    status: 'Confirmed',
    description: 'The dawn of James Gunn’s new DC Universe. Clark Kent reconciles his Kryptonian heritage with his Smallville upbringing as a champion of human kindness in a cynical world.',
    creatorOrAuthor: 'DC Studios / James Gunn',
    format: 'Theatrical Feature',
    themeColor: 'from-blue-600 to-red-700'
  },

  // ================= TV DRAMAS =================
  {
    id: 'rel-stranger-things-5',
    title: 'Stranger Things 5 (The Final Season)',
    category: 'TV Dramas',
    platform: 'Netflix Worldwide Streaming',
    releaseDate: '2026-10-31',
    image: '/src/assets/images/bank_heist_web_aftermath_1793361604681.jpg',
    status: 'Confirmed',
    description: 'The monumental final chapter. Hawkins is torn open by the Upside Down fissure. Eleven, Mike, Will, and the crew launch their last stand against Vecna to close the rift forever.',
    creatorOrAuthor: 'The Duffer Brothers / Netflix',
    format: 'Final Season (8 Episodes)',
    themeColor: 'from-red-700 to-neutral-950'
  },
  {
    id: 'rel-daredevil-born-again',
    title: 'Daredevil: Born Again',
    category: 'TV Dramas',
    platform: 'Disney+ / Hulu',
    releaseDate: '2026-03-04',
    image: '/src/assets/images/oscorp_tower_investigation_1793361605278.jpg',
    status: 'Confirmed',
    description: 'Matt Murdock attempts to hang up his horned cowl, but Wilson Fisk’s mayoral victory in New York City forces the Man Without Fear into a brutal street war in Hell’s Kitchen.',
    creatorOrAuthor: 'Marvel Television / Dario Scardapane',
    format: '9-Episode Drama Series',
    themeColor: 'from-red-800 to-zinc-950'
  },
  {
    id: 'rel-severance-2',
    title: 'Severance: Season 2',
    category: 'TV Dramas',
    platform: 'Apple TV+ Exclusive',
    releaseDate: '2026-01-17',
    image: '/src/assets/images/jj_jameson_editorial_1793361604257.jpg',
    status: 'Confirmed',
    description: 'Mark Scout and the Macrodata Refinement innies face severe corporate discipline after the Overtime Contingency breakout as Lumon deploys chilling new mind-control protocols.',
    creatorOrAuthor: 'Ben Stiller & Dan Erickson',
    format: '10-Episode Thriller Series',
    themeColor: 'from-sky-700 to-slate-900'
  },

  // ================= BOOKS & NOVELS =================
  {
    id: 'rel-last-king-faerie',
    title: 'The Last King of Faerie',
    category: 'Books & Novels',
    platform: 'Hardcover / Digital Audio / Kindle',
    releaseDate: '2026-11-03',
    image: '/src/assets/images/oscorp_tower_investigation_1793361605278.jpg',
    status: 'Out Now',
    description: 'The highly anticipated opening volume of The Wicked Powers, bringing Cassandra Clare’s sweeping Shadowhunters saga to a stunning, heart-stopping conclusion.',
    creatorOrAuthor: 'Cassandra Clare',
    format: '688 Pages · Fantasy Novel',
    excerptTitle: 'Chapter 1: The Ash Upon the Threshold',
    excerptParagraphs: [
      'The scent of cold iron always preceded them, sharp as winter pine needles crushed under heavy boot leather. Ty Blackthorn stood in the dim twilight of the London Institute attic, listening to the rain drumming against the Victorian slate tiles.',
      'Below in the courtyard, runes flared briefly—a gold shimmer of Voyance cutting through the London fog. The letter in his fingers was sealed not with wax, but with living ivy that withered and curled as his fingertips brushed the parchment.',
      '“You were warned not to open royal dispatches without the Consul present,” Kit said quietly from the archway. His hands were tucked deep inside the pockets of his dark leather jacket, his eyes catching the amber reflection of the streetlamps.',
      '“The Consul is asleep in Idris,” Ty replied without looking up. “And by sunrise, the borders of Faerie will be closed forever.”'
    ],
    themeColor: 'from-amber-700 to-rose-950'
  },
  {
    id: 'rel-wind-and-truth',
    title: 'Wind and Truth (Stormlight Archive Book 5)',
    category: 'Books & Novels',
    platform: 'Hardcover / Tor Books / Audible',
    releaseDate: '2026-12-06',
    image: '/src/assets/images/bank_heist_web_aftermath_1793361604681.jpg',
    status: 'Coming Soon',
    description: 'The climactic tenth-day duel for the fate of Roshar. Dalinar Kholin prepares to face Odium’s champion while Kaladin and Szeth embark on a perilous pilgrimage to Shinovar.',
    creatorOrAuthor: 'Brandon Sanderson',
    format: '1280 Pages · Epic Fantasy',
    excerptTitle: 'Prologue: Ten Days to the Shattering',
    excerptParagraphs: [
      'The stormwinds did not merely blow across Urithiru; they roared with the voices of dead spren, weeping across the tiered balconies of the tower. Highmarshal Kaladin Stormblessed stood upon the northern rim, Sylphrena hovering near his shoulder as a ribbon of luminous azure light.',
      '“Ten days,” Kaladin murmured, his hand resting on the hilt of his Shardblade. “Ten days before the fate of the entire Rosharan system is decided by two men with swords.”',
      '“Swords are simple, Kaladin,” Syl whispered, her voice like chimes in an eastern breeze. “It’s the oaths you swore that carry the weight of a thousand storms. Shinovar is waiting for you.”'
    ],
    themeColor: 'from-blue-700 to-slate-950'
  },
  {
    id: 'rel-ben-urich-book',
    title: 'The Men Behind the Masks: The Ben Urich Case Files',
    category: 'Books & Novels',
    platform: 'Daily Bugle Press / Hardcover & Trade Paperback',
    releaseDate: '2026-11-08',
    image: '/src/assets/images/jj_jameson_editorial_1793361604257.jpg',
    status: 'Out Now',
    description: 'Veteran Daily Bugle investigative reporter Ben Urich breaks twenty years of newsroom silence to document the shadow war between the Kingpin of Crime, City Hall, and vigilante protectors.',
    creatorOrAuthor: 'Ben Urich (Bugle Special Investigations)',
    format: '384 Pages · Investigative Non-Fiction',
    excerptTitle: 'Foreword: The Cost of the Front Page',
    excerptParagraphs: [
      'In New York City, truth isn’t printed on pulp broadsheets at four in the morning; it’s bled onto concrete alleyways behind municipal courtrooms. I spent thirty years chasing masked men with a notepad and an Olympus voice recorder.',
      'Jonah Jameson always wanted headlines that screamed. He wanted villains in caps lock. But when you look through a telephoto lens at two in the morning, you don’t see a comic book menace. You see an exhausted kid clinging to a brick chimney, bandaging a bullet graze before his aunt wakes up.',
      'This book is for the people who stayed in the dark so this city could wake up in the light.'
    ],
    themeColor: 'from-red-800 to-stone-950'
  },

  // ================= ENTERTAINMENT NEWS =================
  {
    id: 'rel-news-studio-shakeup',
    title: 'Hollywood Reporter Exclusive: Major Studio Merger Shakeup',
    category: 'Entertainment News',
    platform: 'Daily Bugle Pop Culture Wire',
    releaseDate: '2026-11-05',
    image: '/src/assets/images/jj_jameson_editorial_1793361604257.jpg',
    status: 'Breaking',
    description: 'Inside the massive multi-billion-dollar streaming merger shifting production timelines across Los Angeles, Tokyo, and Seoul studios.',
    creatorOrAuthor: 'Robbie Robertson',
    format: 'Industry Scoop · 4 Min Read',
    excerptTitle: 'Special Report: The New Streaming Cartel',
    excerptParagraphs: [
      'In what entertainment analysts are calling the most consequential media realignment since the Disney-Fox acquisition, top studio executives in Century City finalized terms on an historic theatrical and streaming joint distribution agreement late Wednesday evening.',
      'According to internal memos reviewed by The Daily Bugle’s entertainment desk, theatrical exclusivity windows will be formally codified at a strict 45-day guaranteed window before high-budget films make their streaming bow on combined domestic platforms.',
      '“The era of dumping $200 million tentpoles straight into home subscriptions has officially ended,” confirmed studio finance strategist Marcus Sterling. “Cinema exhibitors from AMC to Toho Cinemas across Japan are celebrating a guaranteed slate of 42 major worldwide releases through 2028.”'
    ],
    themeColor: 'from-red-700 to-stone-900'
  },
  {
    id: 'rel-news-marvel-battleworld',
    title: 'Inside the Secret Marvel Studios Writers’ Room: Battleworld Multiverse Leak',
    category: 'Entertainment News',
    platform: 'Daily Bugle Hollywood Bureau',
    releaseDate: '2026-11-04',
    image: '/src/assets/images/oscorp_tower_investigation_1793361605278.jpg',
    status: 'Breaking',
    description: 'Leaked production drafts confirm key multiversal clashes, practical costume fabrication in London, and an unexpected team-up between Tom Holland’s Spider-Man and Doctor Doom.',
    creatorOrAuthor: 'Betty Brant',
    format: 'Studio Leak · 5 Min Read',
    excerptTitle: 'Inside Pinewood Studios Security Protocols',
    excerptParagraphs: [
      'Production sources at Pinewood Studios in London have confirmed that filming for the landmark Marvel Cinematic Universe phase finale is operating under unprecedented security protocols codenamed “Project Latveria.”',
      'Robert Downey Jr., returning to the franchise as Victor von Doom, has reportedly spent over three months working directly with prosthetic sculptors to create a battle-damaged titanium mask that allows for intense emotive close-ups rather than full-CGI facsimiles.',
      '“The emotional weight between Doom and Tom Holland’s Peter Parker is the narrative spine of the entire second act,” shared a senior visual development artist. “Doom is not an evil variant of Tony Stark; he is an uncompromising sovereign from a dying universe where Stark never made it out of the cave.”'
    ],
    themeColor: 'from-purple-800 to-stone-950'
  },
  {
    id: 'rel-news-nicolas-cage-noir',
    title: 'Casting Wire: Nicolas Cage in Final Talks for Live-Action ‘Spider-Noir’ Series',
    category: 'Entertainment News',
    platform: 'Amazon Prime Video & Sony TV',
    releaseDate: '2026-10-30',
    image: '/src/assets/images/bank_heist_web_aftermath_1793361604681.jpg',
    status: 'Out Now',
    description: 'Set in 1930s New York during the Great Depression, the hard-boiled noir series will film on practical street sets in Brooklyn and Lower Manhattan.',
    creatorOrAuthor: 'Ben Urich',
    format: 'Casting Wire · 3 Min Read',
    excerptTitle: 'Exclusive Interview: 1930s Practical Street Sets',
    excerptParagraphs: [
      'Academy Award winner Nicolas Cage is finalizing contracts to don the fedora and trench coat in the flesh for the upcoming live-action series Spider-Noir, produced by Phil Lord and Christopher Miller for Prime Video.',
      'Unlike standard superhero productions filmed on LED volume stages, showrunners Oren Uziel and Steve Lightfoot have secured municipal shooting permits to shoot along the cobblestone corridors of DUMBO and the historic Cunard Building on Broadway.',
      '“This is a Raymond Chandler detective story that happens to have a spider bite,” remarked an executive producer. “Expect trench coats soaked in rain, Thompson submachine guns, and an older, world-weary private eye who hates Nazi sympathizers as much as he hates bad coffee.”'
    ],
    themeColor: 'from-stone-800 to-neutral-950'
  }
];

export const CATEGORIES_LIST = [
  'All',
  'Movies',
  'Anime',
  'Gaming',
  'TV Dramas',
  'Books & Novels',
  'Entertainment News'
] as const;
