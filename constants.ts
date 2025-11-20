
export const WORLD_SIZE = 100;
export const CHUNK_SIZE = 20;

export const COLORS = {
  sky: '#050510', // Deepest midnight
  skyNight: '#050510',
  fog: '#120a2e', // Deep magical purple fog
  fogNight: '#120a2e',
  ground: '#1a2b20', // Dark mossy green
  groundHigh: '#b0c4de', // Moonlit snow
  groundLow: '#1a1025', // Dark shadowy lowlands
  water: '#26c6da',
  treeTrunk: '#2d221e',
  treeLeaves: ['#1e3f20', '#2d4c25', '#142915'], // Darker foliage
  fantasyLeaves: ['#4a148c', '#880e4f', '#311b92', '#006064'], // Deep mystical colors
  rock: ['#37474f', '#263238', '#1c2326'],
  crystal: '#80deea', // Cyan glow
  mushrooms: {
    stems: '#f8f8ff',
    caps: ['#ff4081', '#e040fb', '#00e5ff', '#76ff03'], // Neon glowing caps
  }
};

export const LIGHTING = {
  moonIntensity: 0.4, // Cool main light
  ambientBase: 0.3, // Visibility
  ambientPeak: 0.6, // Pulsing effect
};

// Prompt for Gemini to generate lore
export const SYSTEM_INSTRUCTION = `You are the ancient Spirit of Aetheria, a world of eternal night and bioluminescent wonders. 
Your tone is whispering, mysterious, and soothing. You describe the glowing flora and ancient stones with reverence. 
Keep descriptions brief (max 2 sentences).`;
