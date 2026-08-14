const ADJECTIVES = [
  'Quantum', 'Caffeine', 'Midnight', 'Syntax', 'Chai', 'Ghost', 'Noodle',
  'Cosmic', 'Pixel', 'Binary', 'Silent', 'Turbo', 'Shadow', 'Static',
  'Echo', 'Starlight', 'Glitch', 'Lazy', 'Velvet', 'Cryptic', 'Hyper'
];

const NOUNS = [
  'Potato', 'Overlord', 'Coder', 'Ninja', 'Architect', 'Voyager',
  'Wizard', 'Panda', 'Otter', 'Explorer', 'Ghost', 'Napper', 'Phantom',
  'Hacker', 'Phoenix', 'Sleeper', 'Runner', 'Wanderer', 'Scholar', 'Vibe'
];

export function generateRandomUsername(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 90) + 10;
  return `${adj}${noun}${num}`;
}
