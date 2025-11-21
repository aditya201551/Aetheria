import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

// Initialize the client with the API key from the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const FALLBACK_NAMES = [
  "Whispering Spire", 
  "Crystal Sanctum", 
  "Glowshroom Grove", 
  "Shadow Keep", 
  "Starfall Crater",
  "Moonlit Altar",
  "Void Stone"
];

const FALLBACK_LORE = [
  "The ancient stones hum with a forgotten melody, vibrating with the memories of the past.",
  "A soft light pulses from within, suggesting a dormant power waiting to be awakened.",
  "Legend says this place was once a meeting ground for the star-walkers.",
  "The air here feels thick with magic, making your skin tingle pleasantly.",
  "You feel a sense of profound peace standing before this ancient monument.",
  "It is said that those who listen closely can hear the voices of ancestors here.",
  "A faint warmth emanates from the structure, defying the cold night air."
];

export const generateLore = async (landmarkName: string, landmarkType: string): Promise<string> => {
  try {
    const prompt = `The traveler has discovered a ${landmarkType} named "${landmarkName}". Describe its magical significance and the feeling it evokes.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    return response.text || FALLBACK_LORE[Math.floor(Math.random() * FALLBACK_LORE.length)];
  } catch (error) {
    console.warn("Gemini API unavailable (likely quota), using fallback lore.");
    return FALLBACK_LORE[Math.floor(Math.random() * FALLBACK_LORE.length)];
  }
};

export const generateLandmarkName = async (type: string): Promise<string> => {
  try {
    const prompt = `Generate a mystical, fantasy name for a ${type} in a peaceful world. Return ONLY the name.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 1.0,
        // Removing maxOutputTokens to avoid requirement for thinkingConfig
        // The prompt already asks for "ONLY the name"
      }
    });

    const text = response.text?.trim().replace(/^"|"$/g, '');
    return text || FALLBACK_NAMES[Math.floor(Math.random() * FALLBACK_NAMES.length)];
  } catch (error) {
    return FALLBACK_NAMES[Math.floor(Math.random() * FALLBACK_NAMES.length)];
  }
};