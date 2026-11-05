export interface BookItem {
  id: string;
  title: string;
  author: string;
  category: 'Books & Novels';
  format: 'Hardcover' | 'Paperback' | 'Serialized Web Fiction' | 'Graphic Novel / Manga' | 'Audiobook';
  genre: string;
  releaseDate: string; // YYYY-MM-DD
  status: 'Out Now' | 'Coming Soon' | 'Pre-Order' | 'Bestseller';
  publisher: string;
  pageCount: number;
  rating: number; // e.g. 4.9
  description: string;
  excerptTitle: string;
  excerptChapters: string[];
  themeColor: string;
  bestsellerRank?: number;
  awards?: string[];
}

export interface EntertainmentNewsItem {
  id: string;
  title: string;
  author: string;
  authorRole: string;
  category: 'Entertainment News';
  format: 'Industry Scoop' | 'Box Office Report' | 'Casting Wire' | 'Studio Leak' | 'Director Q&A';
  releaseDate: string; // YYYY-MM-DD
  status: 'Breaking' | 'Exclusive' | 'Investigative' | 'Trending';
  readTime: string;
  description: string;
  paragraphs: string[];
  tags: string[];
  sourceOutlet: string;
  relatedEntity: string;
}

export const BOOKS_DATA: BookItem[] = [
  {
    id: 'book-last-king-faerie',
    title: 'The Last King of Faerie',
    author: 'Cassandra Clare',
    category: 'Books & Novels',
    format: 'Hardcover',
    genre: 'Urban Fantasy / Romance',
    releaseDate: '2026-11-03',
    status: 'Bestseller',
    publisher: 'Margaret K. McElderry Books',
    pageCount: 688,
    rating: 4.9,
    bestsellerRank: 1,
    awards: ['New York Times #1 Bestseller', 'Goodreads Choice Nominee'],
    themeColor: 'from-amber-700 to-rose-950',
    description: 'The highly anticipated first book of The Wicked Powers, bringing the beloved Shadowhunters saga to a stunning conclusion. As old alliances fracture and faerie courts prepare for open war against the Clave, three young warriors must choose between honor and forbidden love.',
    excerptTitle: 'Chapter 1: The Ash Upon the Threshold',
    excerptChapters: [
      'The scent of cold iron always preceded them, sharp as winter pine needles crushed under heavy boot leather. Ty Blackthorn stood in the dim twilight of the London Institute attic, listening to the rain drumming against the Victorian slate tiles.',
      'Below in the courtyard, runes flared briefly—a gold shimmer of Voyance cutting through the London fog. The letter in his fingers was sealed not with wax, but with living ivy that withered and curled as his fingertips brushed the parchment.',
      '“You were warned not to open royal dispatches without the Consul present,” Kit said quietly from the archway. His hands were tucked deep inside the pockets of his dark leather jacket, his eyes catching the amber reflection of the streetlamps.',
      '“The Consul is asleep in Idris,” Ty replied without looking up. “And by sunrise, the borders of Faerie will be closed forever.”'
    ]
  },
  {
    id: 'book-wind-and-truth',
    title: 'Wind and Truth (Stormlight Archive Book 5)',
    author: 'Brandon Sanderson',
    category: 'Books & Novels',
    format: 'Hardcover',
    genre: 'Epic High Fantasy',
    releaseDate: '2026-12-06',
    status: 'Coming Soon',
    publisher: 'Tor Books',
    pageCount: 1280,
    rating: 5.0,
    bestsellerRank: 2,
    awards: ['Hugo Award Finalist', 'Dragon Con Best Fantasy'],
    themeColor: 'from-blue-700 to-slate-950',
    description: 'The monumental climax to the first five-book arc of The Stormlight Archive. Dalinar Kholin has ten days to contest the Champion of Odium atop Urithiru. Shallan ventures deep into Shadesmar while Kaladin embarks on an embassy to Shinovar with Szeth-son-son-Vallano.',
    excerptTitle: 'Prologue: Ten Days to the Shattering',
    excerptChapters: [
      'The stormwinds did not merely blow across Urithiru; they roared with the voices of dead spren, weeping across the tiered balconies of the tower. Highmarshal Kaladin Stormblessed stood upon the northern rim, Sylphrena hovering near his shoulder as a ribbon of luminous azure light.',
      '“Ten days,” Kaladin murmured, his hand resting on the hilt of his Shardblade. “Ten days before the fate of the entire Rosharan system is decided by two men with swords.”',
      '“Swords are simple, Kaladin,” Syl whispered, her voice like chimes in an eastern breeze. “It’s the oaths you swore that carry the weight of a thousand storms. Shinovar is waiting for you.”'
    ]
  },
  {
    id: 'book-neuromancer-protocol',
    title: 'Neuromancer: The Straylight Protocol',
    author: 'William Gibson & Alastair Reynolds',
    category: 'Books & Novels',
    format: 'Hardcover',
    genre: 'Cyberpunk Sci-Fi',
    releaseDate: '2026-10-14',
    status: 'Out Now',
    publisher: 'Orbit Books / Ace',
    pageCount: 464,
    rating: 4.8,
    bestsellerRank: 4,
    awards: ['Philip K. Dick Memorial Award Finalist'],
    themeColor: 'from-cyan-600 to-indigo-950',
    description: 'A direct companion novel returning to the neon sprawl of Chiba City and the orbital geodesic hives of the Tessier-Ashpool clan. When an orphaned rogue AI reconstructs the lost matrix icebreakers of Case and Molly Millions, corporate black-ops assassins converge on Night City.',
    excerptTitle: 'Chapter 3: Decking Into the Black Ice',
    excerptChapters: [
      'The sky above the Shinjuku arcology was the color of a television tuned to a dead channel, but the neon underbelly was blinding cyan and chromium. Ren plugged the neural trodes behind her ear, the familiar cold copper shock traveling down her spine into the deck.',
      'Cyberspace unfolded around her in infinite mathematical lattices: the glittering red monolith of Ono-Sendai security ice, and behind it, a shadow pulse that moved with biological heartbeat rhythms.',
      '“Don’t touch that node,” the voice sounded in her optical feed. “That isn’t an encrypted bank vault. That’s a living neural ghost.”'
    ]
  },
  {
    id: 'book-ben-urich-casefiles',
    title: 'The Men Behind the Masks: The Ben Urich Case Files',
    author: 'Ben Urich',
    category: 'Books & Novels',
    format: 'Paperback',
    genre: 'Investigative Journalism / True Crime',
    releaseDate: '2026-11-08',
    status: 'Out Now',
    publisher: 'Daily Bugle Press & Anchor Books',
    pageCount: 384,
    rating: 4.9,
    bestsellerRank: 3,
    awards: ['Pulitzer Prize for Investigative Reporting Nominee'],
    themeColor: 'from-red-800 to-stone-950',
    description: 'Veteran Daily Bugle investigative reporter Ben Urich breaks twenty years of silence to document the shadow war between the Kingpin of Crime, City Hall corruption, and vigilante protectors like Daredevil and Spider-Man. Includes leaked court depositions and police wiretaps.',
    excerptTitle: 'Excerpt: Midnight in Hell’s Kitchen',
    excerptChapters: [
      'In New York City, truth isn’t printed on pulp broadsheets at four in the morning; it’s bled onto concrete alleyways behind municipal courtrooms. I spent thirty years chasing masked men with a notepad and an Olympus voice recorder.',
      'Jonah Jameson always wanted headlines that screamed. He wanted villains in caps lock. But when you look through a telephoto lens at two in the morning, you don’t see a comic book menace. You see an exhausted kid clinging to a brick chimney, bandaging a bullet graze before his aunt wakes up.',
      'This book is for the people who stayed in the dark so this city could wake up in the light.'
    ]
  },
  {
    id: 'book-chainsaw-buddy-2',
    title: 'Chainsaw Man: Buddy Stories Vol. 2',
    author: 'Tatsuki Fujimoto & Sakaku Hishikawa',
    category: 'Books & Novels',
    format: 'Graphic Novel / Manga',
    genre: 'Dark Supernatural Comedy',
    releaseDate: '2026-11-20',
    status: 'Pre-Order',
    publisher: 'VIZ Media / Jump J-Books',
    pageCount: 220,
    rating: 4.9,
    themeColor: 'from-orange-600 to-stone-900',
    description: 'Four all-new canon short stories expanding on the chaotic domestic lives of Public Safety Devil Hunters. Featuring an exclusive detective case with Denji and Power hunting a soup-eating devil in Yokohama.',
    excerptTitle: 'Chapter 2: The Great Yokohama Noodle Heist',
    excerptChapters: [
      '“Listen closely, human!” Power announced, kicking open the sliding screen door of the ramen shop with both feet. Her cat Nyako sat perched imperiously on her shoulders. “The Great Power has deduced that the Phantom Ramen Devil resides inside the master’s five-alarm chili broth!”',
      'Denji slurped his noodles noisily without looking up. “Power, you just wanted extra pork belly without paying thirty yen.”',
      '“Lies of a decadent mortal!” she shrieked, brandishing a blood spear fashioned from a toothpick.'
    ]
  }
];

export const ENTERTAINMENT_NEWS_DATA: EntertainmentNewsItem[] = [
  {
    id: 'news-studio-shakeup',
    title: 'Hollywood Reporter Exclusive: Historic Mega-Streaming Merger Reshapes 2027 Production Schedules',
    author: 'Joseph "Robbie" Robertson',
    authorRole: 'Senior Managing Editor',
    category: 'Entertainment News',
    format: 'Industry Scoop',
    releaseDate: '2026-11-05',
    status: 'Breaking',
    readTime: '4 min read',
    sourceOutlet: 'Daily Bugle Entertainment Wire / Variety Partner',
    relatedEntity: 'Warner Bros. Discovery & Paramount Global',
    description: 'Inside the historic multi-billion dollar studio consolidation shifting theatrical windows, anime co-productions in Tokyo, and greenlighting two blockbuster Marvel sequels.',
    paragraphs: [
      'In what entertainment analysts are calling the most consequential media realignment since the Disney-Fox acquisition, top studio executives in Century City finalized terms on an historic theatrical and streaming joint distribution agreement late Wednesday evening.',
      'According to internal memos reviewed by The Daily Bugle’s entertainment desk, theatrical exclusivity windows will be formally codified at a strict 45-day guaranteed window before high-budget films make their streaming bow on combined domestic platforms.',
      '“The era of dumping $200 million tentpoles straight into home subscriptions has officially ended,” confirmed studio finance strategist Marcus Sterling. “Cinema exhibitors from AMC to Toho Cinemas across Japan are celebrating a guaranteed slate of 42 major worldwide releases through 2028.”'
    ],
    tags: ['Hollywood', 'Streaming Wars', 'Box Office', 'Cinema']
  },
  {
    id: 'news-mcu-battleworld-leak',
    title: 'Inside the Secret Marvel Studios Writers’ Room: Robert Downey Jr. and the Russo Brothers Outline Battleworld',
    author: 'Betty Brant',
    authorRole: 'Senior Metro & Culture Correspondent',
    category: 'Entertainment News',
    format: 'Studio Leak',
    releaseDate: '2026-11-04',
    status: 'Exclusive',
    readTime: '5 min read',
    sourceOutlet: 'Bugle Darkroom Hollywood Bureau',
    relatedEntity: 'Marvel Studios / Avengers: Doomsday',
    description: 'Leaked production drafts confirm key multiversal clashes, practical costume fabrication in London, and an unexpected team-up between Tom Holland’s Spider-Man and Doctor Doom.',
    paragraphs: [
      'Production sources at Pinewood Studios in London have confirmed that filming for the landmark Marvel Cinematic Universe phase finale is operating under unprecedented security protocols codenamed “Project Latveria.”',
      'Robert Downey Jr., returning to the franchise as Victor von Doom, has reportedly spent over three months working directly with prosthetic sculptors to create a battle-damaged titanium mask that allows for intense emotive close-ups rather than full-CGI facsimiles.',
      '“The emotional weight between Doom and Tom Holland’s Peter Parker is the narrative spine of the entire second act,” shared a senior visual development artist. “Doom is not an evil variant of Tony Stark; he is an uncompromising sovereign from a dying universe where Stark never made it out of the cave.”'
    ],
    tags: ['Marvel', 'Spider-Man', 'Avengers', 'Robert Downey Jr']
  },
  {
    id: 'news-anime-hdr-pipeline',
    title: 'Tokyo Animation Report: ufotable and MAPPA Adopt 4K HDR Digital Inking for 2026–2027 Lineups',
    author: 'Ned Leeds',
    authorRole: 'Tech & Digital Media Reporter',
    category: 'Entertainment News',
    format: 'Director Q&A',
    releaseDate: '2026-11-02',
    status: 'Trending',
    readTime: '3 min read',
    sourceOutlet: 'Tokyo Bureau / Anime News Network',
    relatedEntity: 'ufotable & MAPPA Studios',
    description: 'How groundbreaking 12-bit digital drawing tablets and custom compositing shaders are transforming action cinematography in the Demon Slayer and Chainsaw Man movies.',
    paragraphs: [
      'Speaking from the Suginami Animation Fair in western Tokyo, technical directors from both ufotable and studio MAPPA showcased side-by-side production benchmarks demonstrating real-time raytraced lighting calculations applied directly to hand-drawn keyframes.',
      'For the upcoming Demon Slayer: Infinity Castle trilogy, the optical team developed custom lens diffraction algorithms that simulate vintage 70mm anamorphic glass, giving Tanjiro’s Sun Breathing fire slashes genuine chromatic aberration.',
      '“The objective is to eliminate the jarring contrast between 3D background geometry and 2D character lines,” explained compositing lead Kenji Sato. “When you sit in an IMAX auditorium, the drawn line and the architectural void should feel like one unified painting.”'
    ],
    tags: ['Anime', 'ufotable', 'Demon Slayer', 'Animation Tech']
  },
  {
    id: 'news-nicolas-cage-noir',
    title: 'Casting Wire: Nicolas Cage in Final Talks for Live-Action ‘Spider-Noir’ Prime Video Series',
    author: 'Ben Urich',
    authorRole: 'Chief Investigative Correspondent',
    category: 'Entertainment News',
    format: 'Casting Wire',
    releaseDate: '2026-10-30',
    status: 'Exclusive',
    readTime: '3 min read',
    sourceOutlet: 'Daily Bugle Exclusive Dispatch',
    relatedEntity: 'Sony Pictures TV & Amazon MGM Studios',
    description: 'Set in 1930s New York during the Great Depression, the hard-boiled noir series will film on practical street sets in Brooklyn and Lower Manhattan.',
    paragraphs: [
      'Academy Award winner Nicolas Cage is finalizing contracts to don the fedora and trench coat in the flesh for the upcoming live-action series Spider-Noir, produced by Phil Lord and Christopher Miller for Prime Video.',
      'Unlike standard superhero productions filmed on LED volume stages, showrunners Oren Uziel and Steve Lightfoot have secured municipal shooting permits to shoot along the cobblestone corridors of DUMBO and the historic Cunard Building on Broadway.',
      '“This is a Raymond Chandler detective story that happens to have a spider bite,” remarked an executive producer. “Expect trench coats soaked in rain, Thompson submachine guns, and an older, world-weary private eye who hates Nazi sympathizers as much as he hates bad coffee.”'
    ],
    tags: ['Spider-Noir', 'Nicolas Cage', 'Casting', 'Prime Video']
  }
];
