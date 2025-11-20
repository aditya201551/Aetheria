import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

// Initialize the client with the API key from the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

    return response.text || "The wind whispers, but the words are unclear...";
  } catch (error) {
    console.error("Error generating lore:", error);
    return "A strange silence falls over the land. (Connection to the Spirit World lost)";
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
        maxOutputTokens: 20,
      }
    });

    return (response.text || "Unknown Landmark").trim().replace(/^"|"$/g, '');
  } catch (error) {
    return "Ancient Remnant";
  }
};