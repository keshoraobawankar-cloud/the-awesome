export interface Story {
  id: string;
  title: string;
  subtitle: string;
  category: 'All' | 'Exclusives' | 'Opinion' | 'Crime & Justice' | 'City Beat' | 'Investigation' | 'Tech & Science';
  date: string;
  author: string;
  authorRole: string;
  readTime: string;
  image: string;
  imageAlt: string;
  imageCaption: string;
  featured?: boolean;
  editionBadge?: string;
  pullQuote?: {
    quote: string;
    speaker: string;
    role: string;
  };
  paragraphs: string[];
  tags: string[];
}

export const STORIES: Story[] = [
  {
    id: 'spiderman-threat-or-hero',
    title: 'SPIDER-MAN: MASKED VIGILANTE OR PUBLIC THREAT TO NEW YORK?',
    subtitle: 'Editorial Chief J. Jonah Jameson calls for immediate registration and unmasking of the swinging vigilante terrorizing Midtown skies.',
    category: 'Opinion',
    date: 'OCT 30, 2026',
    author: 'J. Jonah Jameson',
    authorRole: 'Publisher & Editor-in-Chief',
    readTime: '5 min read',
    image: '/src/assets/images/jj_jameson_editorial_1793361604257.jpg',
    imageAlt: 'J. Jonah Jameson pounding his desk in the Daily Bugle newsroom',
    imageCaption: 'Daily Bugle newsroom, 10:48 PM: Publisher Jameson drafts his scathing front-page indictment against the wall-crawler.',
    featured: true,
    editionBadge: 'FRONT PAGE EXCLUSIVE',
    pullQuote: {
      quote: "He operates outside the law, hides behind a mask of cowardice, and swings through our public thoroughfares like a circus clown with an ego problem. He's not a hero—he's a menace!",
      speaker: 'J. Jonah Jameson',
      role: 'Publisher, The Daily Bugle'
    },
    paragraphs: [
      "Let's dispense with the romantic fairytales circulating through social feeds and late-night talk shows. New York City does not need an unaccountable, latex-clad daredevil flinging adhesive polymers onto historical municipal landmarks. What this city needs—and what its law-abiding taxpayers demand—is order, accountability, and the rule of law.",
      "Yesterday afternoon, while honest New Yorkers were negotiating lunch hour gridlock, our so-called 'friendly neighborhood' spectacle caused thousands of dollars in infrastructural collateral on 42nd Street. Yes, two armored-car looters were apprehended, but at what cost? Shattered cornices, snarled subway lines, and a terrified public wondering who granted a costumed mystery man jurisdiction over the five boroughs.",
      "True heroes do not hide their faces. New York's Bravest and New York's Finest wear badges; they have names, ranks, and superiors to answer to. If this Spider-person genuinely stands for civic virtue, let him walk through the front doors of One Police Plaza, lay down his mask, and swear an oath under penalty of perjury. Until that morning comes, the Daily Bugle will continue its unrelenting duty: exposing this self-appointed arbiter for exactly what he is."
    ],
    tags: ['Spider-Man', 'Opinion', 'Jameson', 'Public Safety', 'Midtown']
  },
  {
    id: 'manhattan-bank-heist-web-trap',
    title: 'MIDTOWN HEIST CRUSHED: MYSTERIOUS WEB TRAP LEAVES ROBBERS DANGLING',
    subtitle: 'Mechanics & Traders Bank vault secured within minutes; heavy-duty webbing tested by police ballistics division.',
    category: 'Crime & Justice',
    date: 'OCT 29, 2026',
    author: 'Robbie Robertson',
    authorRole: 'Senior City Editor',
    readTime: '4 min read',
    image: '/src/assets/images/bank_heist_web_aftermath_1793361604681.jpg',
    imageAlt: 'NYPD squad cars and forensic investigators inspecting thick spider web netting outside bank facade',
    imageCaption: 'Fig. 1: Crime scene technicians examine high-tensile web lattice securing recovered bearer bonds outside Mechanics & Traders Bank.',
    editionBadge: 'POLICE DESK',
    pullQuote: {
      quote: "We pulled up with our flashers on and the entire syndicate was suspended six feet off the asphalt in what looks like synthetic bio-silk. They couldn't move an inch.",
      speaker: 'Officer Daniel Kowalski',
      role: 'NYPD 14th Precinct'
    },
    paragraphs: [
      "A brazen afternoon assault on the historic Mechanics & Traders Bank on lower Broadway was halted in its tracks yesterday when an uninvited interloper intervened before tactical units could establish a perimeter.",
      "According to eyewitnesses inside the bank lobby, four armed assailants in tactical balaclavas breached the vault gates shortly after 2:15 PM, holding seven tellers hostage. Before ransom negotiations could be proposed, witnesses describe a flash of crimson and blue dropping from the marble atrium ceiling.",
      "Within forty-five seconds, all four suspects were disarmed and bundled inside an intricate lattice of high-tensile white polymer. NYPD forensic teams arrived to find the stolen treasury crates completely intact, tethered safely to a reinforced lamppost.",
      "The compound reportedly dissolved into harmless biodegradable moisture two hours later, leaving forensics scrambling to capture residual samples for chemical analysis."
    ],
    tags: ['Crime', 'NYPD', 'Bank Heist', 'Web Fluid', 'Broadway']
  },
  {
    id: 'oscorp-tower-midnight-investigation',
    title: 'SHADOWS OVER OSCORP: LATE-NIGHT LAB EXPERIMENTS SPARK MUTATION RUMORS',
    subtitle: 'Whistleblowers report unauthorized genetic sequencing and military-grade glider trials on the 64th floor.',
    category: 'Investigation',
    date: 'OCT 28, 2026',
    author: 'Betty Brant',
    authorRole: 'Investigative Reporter',
    readTime: '6 min read',
    image: '/src/assets/images/oscorp_tower_investigation_1793361605278.jpg',
    imageAlt: 'The looming dark monolith of Oscorp tower at night with glowing cyan lab floor',
    imageCaption: 'Midnight over Midtown: The upper research annex of Oscorp Industries remains fully illuminated despite municipal energy curfews.',
    editionBadge: 'SPECIAL REPORT',
    pullQuote: {
      quote: "Project Goblin and the cross-species genetics programs were supposed to have been archived. But look at those top floors past 3:00 AM—the power draw is off the charts.",
      speaker: 'Anonymous Senior Chemist',
      role: 'Oscorp Special Projects Division'
    },
    paragraphs: [
      "Behind the sleek glass and titanium facade of Oscorp Tower on 53rd Street lies a labyrinth of high-stakes corporate secrets that the city's regulatory bodies seem either unwilling or unable to investigate.",
      "Documents leaked to the Daily Bugle's confidential postbox indicate that Oscorp's Bio-Mechanical Synthetics wing has escalated testing on neural-enhancement serums and miniaturized turbine propulsion systems.",
      "Local residents in nearby high-rises have reported deafening sonic rumbles and fleeting sightings of emerald-tinted exhausts cutting through midnight cloud cover. When questioned, Oscorp public relations firmly denied any illegal military contractors or unauthorized trials, asserting all projects adhere strictly to FDA and DoD protocols.",
      "Yet, independent sensor readings gathered by Columbia University atmospheric labs detected localized ozone spikes centered squarely over the penthouse landing pad."
    ],
    tags: ['Oscorp', 'Norman Osborn', 'Investigation', 'Genetics', 'Midtown']
  },
  {
    id: 'queens-community-defends-spidey',
    title: 'QUEENS NEIGHBORHOOD STANDS WITH SPIDER-MAN: "HE SAVED MY GRANDMOTHER"',
    subtitle: 'Forest Hills residents push back against Manhattan press rhetoric with handmade banners and community rallies.',
    category: 'City Beat',
    date: 'OCT 27, 2026',
    author: 'Ned Leeds',
    authorRole: 'Metro Affairs Correspondent',
    readTime: '3 min read',
    image: '/src/assets/images/bank_heist_web_aftermath_1793361604681.jpg',
    imageAlt: 'Queens street gathering and community members',
    imageCaption: 'A hand-painted banner over Austin Street reading: "Our Neighbor, Our Hero." Forest Hills residents are vocal in their gratitude.',
    editionBadge: 'BOROUGH BEAT',
    pullQuote: {
      quote: "The big-shot editors in their high-rise penthouses can complain about broken glass, but down here on Austin Street, he caught my mother when the fire escape broke. He didn't ask for a dime.",
      speaker: 'Mrs. Maria Santos',
      role: 'Forest Hills Resident & Delicatessen Owner'
    },
    paragraphs: [
      "While editorial desks across Manhattan print condemnations, the mood across the East River tells a drastically different story. In the close-knit streets of Forest Hills and Sunnyside, Spider-Man is not viewed as a rogue menace, but as a protective guardian.",
      "At a neighborhood assembly held at the Queens Community Center on Tuesday, dozens of citizens gathered to share firsthand encounters with the wall-crawler.",
      "Stories ranged from stopping corner grocery stick-ups to retrieving runaway luggage and stabilizing an overloaded elevator on 71st Avenue. Local merchants have even begun displaying miniature spider motifs in shop windows as tokens of community solidarity."
    ],
    tags: ['Queens', 'Forest Hills', 'Community', 'Eyewitness', 'Human Interest']
  },
  {
    id: 'rhino-rampage-fifth-avenue',
    title: 'COLOSSAL TITAN "RHINO" RAMPAGES DOWN 5TH AVENUE: MILLIONS IN DAMAGE',
    subtitle: 'Heavily armored juggernaut tears through asphalt; Spider-Man and police collaborate to contain the disaster.',
    category: 'Crime & Justice',
    date: 'OCT 26, 2026',
    author: 'Peter Parker',
    authorRole: 'Staff Photojournalist',
    readTime: '4 min read',
    image: '/src/assets/images/jj_jameson_editorial_1793361604257.jpg',
    imageAlt: 'Shattered pavement and police vehicles following the 5th Avenue confrontation',
    imageCaption: 'A close-up view from above the Macy’s parade route where Aleksei Sytsevich smashed through three reinforced transit buses.',
    editionBadge: 'BREAKING SCOOP',
    pullQuote: {
      quote: "The sheer ground vibration registered on seismographs across New Jersey. It took half a mile of steel cables and an electrified sewer grid to slow him down.",
      speaker: 'Captain George Stacy',
      role: 'NYPD Emergency Services Unit'
    },
    paragraphs: [
      "Downtown Manhattan experienced seismic shocks yesterday afternoon as the convict known in underworld circles as 'The Rhino' carved a three-block swath of total devastation along Fifth Avenue.",
      "Encased in an impenetrable cybernetic hide synthesized from polymer-bonded titanium, the brute shattered fire hydrants, crushed civilian luxury sedans into scrap iron, and shattered the front facade of the Metropolitan Museum annex.",
      "Eyewitness reports indicate Spider-Man lured the charging monster away from packed pedestrian plazas toward an open subway construction pit on 34th Street, where high-pressure steam valves caused the mechanical armor to overheat and immobilize the rampage."
    ],
    tags: ['Rhino', 'Crime', '5th Avenue', 'Destruction', 'Super Villains']
  },
  {
    id: 'mayor-anti-vigilante-legislation',
    title: 'CITY HALL INTRODUCES STRICT "ANTI-VIGILANTE CO-OPERATION" ORDINANCE',
    subtitle: 'Heavier fines and misdemeanor charges announced for citizens aiding or shielding costumed operators.',
    category: 'City Beat',
    date: 'OCT 25, 2026',
    author: 'Robbie Robertson',
    authorRole: 'Senior City Editor',
    readTime: '3 min read',
    image: '/src/assets/images/oscorp_tower_investigation_1793361605278.jpg',
    imageAlt: 'City Hall press conference podium with microphone array',
    imageCaption: 'City Council members debate emergency public safety bills behind closed committee doors at Manhattan Municipal Building.',
    editionBadge: 'CITY HALL',
    paragraphs: [
      "In a tense press briefing on the steps of City Hall, the Mayor unveiled the 'Metropolitan Accountability and Public Order Act,' targeted specifically at private costumed operatives active throughout the metropolitan area.",
      "The proposed legislation would classify providing shelter, intelligence, or intentional misdirection to law enforcement regarding mask-wearing individuals as a Class B misdemeanor, punishable by substantial fines.",
      "Civil liberties advocates were quick to dispute the statute, warning that ambiguous terminology could criminalize ordinary citizens who merely document incidents on mobile phones or accept rescue during perilous disasters."
    ],
    tags: ['Politics', 'City Hall', 'Laws', 'NYPD', 'Civil Rights']
  },
  {
    id: 'web-fluid-synthetic-chemistry',
    title: 'THE SECRET OF THE WEB: LEADING EMPIRE STATE SCIENTISTS ANALYZE RESIDUE',
    subtitle: 'Advanced shear-thinning polymer exhibits tensile strength exceeding spider dragline silk and carbon nanotubes.',
    category: 'Tech & Science',
    date: 'OCT 24, 2026',
    author: 'Dr. Curtis Connors',
    authorRole: 'Guest Science Columnist',
    readTime: '5 min read',
    image: '/src/assets/images/bank_heist_web_aftermath_1793361604681.jpg',
    imageAlt: 'Macro microscopic view of spun synthetic fibers and cross-linked polymers',
    imageCaption: 'Under polarized light, the micro-braided polymer chains reveal an unprecedented self-dissolving catalyst compound.',
    editionBadge: 'SCIENCE DESK',
    pullQuote: {
      quote: "From a purely biochemical standpoint, the creator of this synthetic compound isn't a menace—they are an undisputed genius worthy of the Nobel Prize in Chemistry.",
      speaker: 'Dr. Isaac Carling',
      role: 'ESU Department of Polymer Physics'
    },
    paragraphs: [
      "Specimens of the quick-curing adhesive fibers recovered from an averted crane collapse on Park Avenue were submitted to Empire State University's Materials Laboratory under strict chain-of-custody protocols.",
      "Initial mass spectrometry revealed a proprietary chain of nylon-derivatives, cross-linked proteins, and an electrostatic curing reagent activated solely upon high-pressure atmospheric dispersal.",
      "Most remarkably, the material maintains a tensile strength of 300 megapascals for approximately sixty minutes before a self-contained enzyme triggers complete sublimation into an odorless, non-toxic liquid residue.",
      "Military and medical companies have offered millions for commercial patent rights, but the anonymous chemist behind the formula has filed no known filings with the United States Patent Office."
    ],
    tags: ['Science', 'Polymer', 'ESU', 'Technology', 'Chemistry']
  },
  {
    id: 'bugle-exclusive-photo-bounty',
    title: 'WANTED: UNCENSORED CLEAR ROOFTOP PHOTOS OF SPIDER-MAN — $10,000 BOUNTY!',
    subtitle: 'Publisher Jameson doubles cash reward for verifiable unmasked footage or photographic proof of identity.',
    category: 'Exclusives',
    date: 'OCT 23, 2026',
    author: 'J. Jonah Jameson',
    authorRole: 'Publisher & Editor-in-Chief',
    readTime: '2 min read',
    image: '/src/assets/images/jj_jameson_editorial_1793361604257.jpg',
    imageAlt: 'Daily Bugle photography submission envelope and red stamp reading APPROVED',
    imageCaption: 'Got the scoop of the century? Bring your film negatives or memory cards directly to the 4th Floor Darkroom on 39th Street.',
    editionBadge: 'BUGLE CASH BOUNTY',
    paragraphs: [
      "Are you tired of blurry, pixelated snapshots taken from three avenues away? So is the Daily Bugle! We want crisp, high-shutter 35mm exposures showing the masked menace in full action.",
      "Beginning Monday, the Bugle editorial board is offering a cold cash reward of ten thousand dollars ($10,000 USD) for verifiable, front-facing photographic evidence that can aid NYPD detectives in determining his true civilian identity.",
      "Professional freelancers and aspiring shutters: deliver your portfolio directly to J. Jonah Jameson's executive secretary, Betty Brant, at the Daily Bugle Building, Midtown Manhattan. No amateur phone filters accepted!"
    ],
    tags: ['Bounty', 'Photography', 'Contest', 'Daily Bugle', 'Jameson']
  },
  {
    id: 'subway-runaway-train-miracle',
    title: 'DISASTER AVERTED ON THE LEXINGTON AVENUE LINE AS WEBS ANCHOR TRAIN 6',
    subtitle: 'Brake failure on northbound express threatened catastrophic tunnel crash; 400 commuters walk away without scratch.',
    category: 'Crime & Justice',
    date: 'OCT 22, 2026',
    author: 'Peter Parker',
    authorRole: 'Staff Photojournalist',
    readTime: '4 min read',
    image: '/src/assets/images/oscorp_tower_investigation_1793361605278.jpg',
    imageAlt: 'Dark underground tunnel with illuminated emergency lights and transit cars',
    imageCaption: 'Lexington Express Train 6 halted five yards before the dead-end bumper block at 86th Street station.',
    editionBadge: 'TRANSIT CRISIS',
    paragraphs: [
      "Four hundred morning commuters aboard a northbound Lexington Avenue Line 6 train narrowly cheated death yesterday when the hydraulic main lines suffered complete pressure loss descending the steep grade near 77th Street.",
      "With the conductor helplessly triggering manual failsafes to no effect, the train accelerated past 55 miles per hour toward a dead-end maintenance junction. Passengers reported terrifying metal screeching and sparking along third-rail conduits.",
      "According to MTA motorman Anthony Ricci, Spider-Man dropped onto the lead car, anchored six anchor cables between the train chassis and reinforced structural steel beams, and braced the impact with superhuman physical endurance.",
      "By the time emergency crews reached the stalled subway car, the passengers had evacuated safely, and the anonymous savior had slipped away through a ventilation shaft."
    ],
    tags: ['Subway', 'MTA', 'Rescue', 'Lexington Line', 'Miracle']
  },
  {
    id: 'daily-bugle-history-century-of-truth',
    title: 'THE DAILY BUGLE AT 128 YEARS: HOW NYC’S HARDEST-HITTING PRESS SURVIVED',
    subtitle: 'From steam-driven printing presses to digital bulletins, a legacy of relentless investigative courage.',
    category: 'Exclusives',
    date: 'OCT 20, 2026',
    author: 'Robbie Robertson',
    authorRole: 'Senior City Editor',
    readTime: '5 min read',
    image: '/src/assets/images/jj_jameson_editorial_1793361604257.jpg',
    imageAlt: 'Vintage printing presses and modern digital layout terminals side by side',
    imageCaption: 'The historic Bugle printing floor on Manhattan’s Lower East Side produced over 800,000 broadsheet copies daily at its peak.',
    editionBadge: 'ANNIVERSARY ARCHIVE',
    paragraphs: [
      "Founded in 1898 during the golden age of American print journalism, the Daily Bugle has stood as the unyielding watchdog of New York City through depressions, world wars, and the rise of superhuman threats.",
      "While competing tabloids succumbed to sensationalist rumors or bought-and-paid-for corporate puff pieces, the Bugle maintained its creed: print the uncomfortable facts, question those who wield power in the shadows, and never back down from a fight.",
      "As we enter the modern multimedia era, our mission remains unbroken. Whether investigating multimillion-dollar municipal graft or holding vigilantes accountable to the people, we print the news New York deserves."
    ],
    tags: ['History', 'Journalism', 'Daily Bugle', 'New York', 'Press']
  }
];

export const CATEGORIES = [
  'All',
  'Exclusives',
  'Opinion',
  'Crime & Justice',
  'City Beat',
  'Investigation',
  'Tech & Science'
] as const;
