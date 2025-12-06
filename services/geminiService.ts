import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
// Note: In a production environment, ensure process.env.API_KEY is defined.
// For this demo, we assume the environment variable is injected.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateProductDescription = async (
  title: string,
  condition: string,
  category: string
): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key is missing. Returning placeholder.");
    return "A great item for college students.";
  }

  try {
    const prompt = `
      Write a catchy, short marketing description (max 80 words) for a product being sold on a college marketplace.
      Product Name: ${title}
      Condition: ${condition}
      Category: ${category}
      Target Audience: College Students
      Tone: Friendly, honest, and helpful.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No description generated.";
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "Could not generate description automatically. Please write one manually.";
  }
};