/**
 * Web Audio API synthesizer for retro Daily Bugle sound effects
 * Zero external audio files required. Safe for all environments.
 */

// Safe AudioContext getter
const getAudioContext = (): AudioContext | null => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    return new AudioCtx();
  } catch {
    return null;
  }
};

/**
 * Play authentic comic "THWIP!" web-shooter sound effect
 */
export const playWebShooterSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;

  // High-to-low rapid resonant frequency sweep (the "THWIP")
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(2400, now);
  osc.frequency.exponentialRampToValueAtTime(180, now + 0.16);

  // Bandpass filter for that distinct synthetic web sound
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1200, now);
  filter.Q.setValueAtTime(3.5, now);

  gain.gain.setValueAtTime(0.01, now);
  gain.gain.linearRampToValueAtTime(0.35, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.23);
};

/**
 * Play desk slam / typewriter keystroke sound effect
 */
export const playTypewriterSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(600, now);
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.1);
};

/**
 * Play loud editorial desk slam sound
 */
export const playDeskSlamSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;

  // Low frequency thud
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(160, now);
  osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);

  gain.gain.setValueAtTime(0.5, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.4);
};

/**
 * Speak Jameson's quote aloud using browser SpeechSynthesis with an urgent, loud cadence
 */
export const speakJamesonQuote = (text: string, onEnd?: () => void): boolean => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.15; // Fast, impatient newsroom pace
    utterance.pitch = 0.85; // Gruff, authoritative voice
    utterance.volume = 1.0;

    // Pick an assertive English voice if available
    const voices = window.speechSynthesis.getVoices();
    const enVoices = voices.filter(v => v.lang.startsWith('en'));
    const preferredVoice = enVoices.find(v => v.name.includes('Male') || v.name.includes('David') || v.name.includes('George') || v.name.includes('Google UK English Male'));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
};

export const stopSpeech = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Play authentic newspaper broadsheet rustle sound effect
 */
export const playPaperRustleSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;
  const bufferSize = ctx.sampleRate * 0.12;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  // Generate gentle paper-like pink/white noise
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.15;
  }

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(1800, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.01, now);
  gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

  noiseSource.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noiseSource.start(now);
  noiseSource.stop(now + 0.12);
};

/**
 * Play subtle cinematic whoosh sound for scroll section transitions
 */
export const playWhooshSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(140, now);
  osc.frequency.exponentialRampToValueAtTime(380, now + 0.12);
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.28);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(600, now);
  filter.frequency.linearRampToValueAtTime(1200, now + 0.12);
  filter.frequency.exponentialRampToValueAtTime(200, now + 0.3);

  gain.gain.setValueAtTime(0.01, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.33);
};

/**
 * Play gentle bell chime sound for the Reminder CTA section
 */
export const playBellChimeSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;
  // Fundamental chime frequencies
  [880, 1760, 2640].forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    const initialGain = 0.15 / (idx + 1);
    gain.gain.setValueAtTime(initialGain, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 1.0);
  });
};

/**
 * Play vintage SLR camera mirror snap and shutter click
 */
export const playCameraShutterSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;

  // Mirror flip (low transient)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'triangle';
  osc1.frequency.setValueAtTime(450, now);
  osc1.frequency.exponentialRampToValueAtTime(120, now + 0.04);
  gain1.gain.setValueAtTime(0.2, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.05);

  // Metal shutter blade snap (high burst)
  const bufferSize = ctx.sampleRate * 0.05;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.3;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(2800, now + 0.03);
  const gain2 = ctx.createGain();
  gain2.gain.setValueAtTime(0.001, now);
  gain2.gain.setValueAtTime(0.3, now + 0.03);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
  noise.connect(filter);
  filter.connect(gain2);
  gain2.connect(ctx.destination);
  noise.start(now + 0.03);
  noise.stop(now + 0.1);
};

/**
 * Play subtle rhythmic printing press steam clack
 */
export const playPrintingPressSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(110, now);
  osc.frequency.exponentialRampToValueAtTime(40, now + 0.07);

  gain.gain.setValueAtTime(0.06, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.09);
};

/**
 * Play authentic cash register "KA-CHING" sound for $10,000 bounty win
 */
export const playCashRegisterSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;

  // Crisp register bell chime (high double tone)
  const bell1 = ctx.createOscillator();
  const bell2 = ctx.createOscillator();
  const bellGain = ctx.createGain();

  bell1.type = 'sine';
  bell1.frequency.setValueAtTime(2093, now); // C7
  bell2.type = 'sine';
  bell2.frequency.setValueAtTime(3135, now); // G7

  bellGain.gain.setValueAtTime(0.01, now);
  bellGain.gain.linearRampToValueAtTime(0.35, now + 0.01);
  bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

  bell1.connect(bellGain);
  bell2.connect(bellGain);
  bellGain.connect(ctx.destination);

  bell1.start(now);
  bell2.start(now);
  bell1.stop(now + 0.9);
  bell2.stop(now + 0.9);

  // Mechanical register drawer sliding out (noise burst)
  const bufferSize = ctx.sampleRate * 0.15;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.18;
  }
  const drawerNoise = ctx.createBufferSource();
  drawerNoise.buffer = buffer;
  const drawerFilter = ctx.createBiquadFilter();
  drawerFilter.type = 'bandpass';
  drawerFilter.frequency.setValueAtTime(900, now + 0.05);

  const drawerGain = ctx.createGain();
  drawerGain.gain.setValueAtTime(0.01, now + 0.05);
  drawerGain.gain.linearRampToValueAtTime(0.2, now + 0.08);
  drawerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

  drawerNoise.connect(drawerFilter);
  drawerFilter.connect(drawerGain);
  drawerGain.connect(ctx.destination);

  drawerNoise.start(now + 0.05);
  drawerNoise.stop(now + 0.23);
};

/**
 * Play paper tearing sound when JJJ rejects a substandard photo
 */
export const playPaperTearSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;
  const bufferSize = ctx.sampleRate * 0.18;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    const envelope = Math.sin((i / bufferSize) * Math.PI);
    data[i] = (Math.random() * 2 - 1) * 0.35 * envelope;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(2400, now);
  filter.Q.setValueAtTime(1.5, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.01, now);
  gain.gain.linearRampToValueAtTime(0.3, now + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + 0.19);
};

/**
 * Play heavy broadsheet newspaper bundle thud
 */
export const playBundleThudSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;

  // Deep low-frequency bundle thump
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(95, now);
  osc.frequency.exponentialRampToValueAtTime(32, now + 0.16);

  gain.gain.setValueAtTime(0.4, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.22);
};



