export interface StoryComment {
  id: string;
  storyId: string;
  author: string;
  role: string;
  avatarInitials: string;
  timestamp: string;
  content: string;
  stance: 'threat' | 'hero' | 'neutral';
  upvotes: number;
  isStaff?: boolean;
}

export const INITIAL_COMMENTS: Record<string, StoryComment[]> = {
  'spiderman-threat-or-hero': [
    {
      id: 'c1',
      storyId: 'spiderman-threat-or-hero',
      author: 'J. Jonah Jameson',
      role: 'Publisher, The Daily Bugle',
      avatarInitials: 'JJJ',
      timestamp: '15 mins ago',
      content: 'I have said it once and I will say it until the ink runs dry: NO ONE wears a mask unless they have something criminal to hide! If he were a hero, he would step forward, show his face to the police commissioner, and pay for the broken lampposts!',
      stance: 'threat',
      upvotes: 48,
      isStaff: true
    },
    {
      id: 'c2',
      storyId: 'spiderman-threat-or-hero',
      author: 'May Parker',
      role: 'Forest Hills Resident',
      avatarInitials: 'MP',
      timestamp: '1 hour ago',
      content: 'I don’t know what Mr. Jameson is so angry about. Just last week, that kind young man in the mask helped an elderly woman retrieve her groceries from a runaway cab on Queens Boulevard. He has a good heart and New York should be grateful.',
      stance: 'hero',
      upvotes: 112
    },
    {
      id: 'c3',
      storyId: 'spiderman-threat-or-hero',
      author: 'Peter Parker',
      role: 'Staff Freelancer',
      avatarInitials: 'PP',
      timestamp: '2 hours ago',
      content: 'From the vantage point on the rooftops, it looked like he was only trying to stabilize the girder before the whole overpass collapsed. It’s hard to assess structural loads in the middle of a battle.',
      stance: 'neutral',
      upvotes: 35,
      isStaff: true
    },
    {
      id: 'c4',
      storyId: 'spiderman-threat-or-hero',
      author: 'Capt. George Stacy',
      role: 'NYPD 14th Precinct',
      avatarInitials: 'GS',
      timestamp: '3 hours ago',
      content: 'Official police protocol requires apprehension of all unauthorized combatants. However, forensic analysis confirms the webbing dissolved without chemical residue and prevented civilian injuries. We continue to urge the subject to come in for questioning.',
      stance: 'neutral',
      upvotes: 64
    }
  ],
  'oscorp-tower-investigation': [
    {
      id: 'c5',
      storyId: 'oscorp-tower-investigation',
      author: 'Harry Osborn',
      role: 'Oscorp Shareholder Liaison',
      avatarInitials: 'HO',
      timestamp: '45 mins ago',
      content: 'These Bugle claims are completely baseless and defamatory. Oscorp Industries adheres to the highest FAA and municipal testing standards. Any acoustic anomalies reported over the East River were licensed atmospheric weather drone tests.',
      stance: 'neutral',
      upvotes: 19
    },
    {
      id: 'c6',
      storyId: 'oscorp-tower-investigation',
      author: 'Betty Brant',
      role: 'Senior Metro Correspondent',
      avatarInitials: 'BB',
      timestamp: '2 hours ago',
      content: 'Atmospheric weather drones don’t leave military-grade titanium shrapnel embedded in penthouse water towers, Mr. Osborn. Our records request with the Port Authority is pending.',
      stance: 'threat',
      upvotes: 87,
      isStaff: true
    }
  ],
  'bank-heist-web-aftermath': [
    {
      id: 'c7',
      storyId: 'bank-heist-web-aftermath',
      author: 'Sal Mancini',
      role: 'Midtown Courier',
      avatarInitials: 'SM',
      timestamp: '30 mins ago',
      content: 'I was inside the ATM lobby when the wall blew open. Those thugs had military rifles. If that guy hadn’t swung through the skylight and webbed their weapons to the ceiling, three tellers wouldn’t have gone home today. Threat? Give me a break!',
      stance: 'hero',
      upvotes: 142
    },
    {
      id: 'c8',
      storyId: 'bank-heist-web-aftermath',
      author: 'Joseph "Robbie" Robertson',
      role: 'Managing Editor',
      avatarInitials: 'RR',
      timestamp: '1 hour ago',
      content: 'The witness accounts corroborate the timeline. While the vault damage is severe, the insurance adjusters confirmed the suspects were detained before accessing safe deposit boxes.',
      stance: 'neutral',
      upvotes: 56,
      isStaff: true
    }
  ]
};
