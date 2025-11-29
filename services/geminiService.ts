import { GoogleGenAI, Type } from "@google/genai";
import { PlantAnalysisResult } from "../types";

const processEnvApiKey = process.env.API_KEY;

if (!processEnvApiKey) {
  console.error("API_KEY environment variable is missing.");
}

const ai = new GoogleGenAI({ apiKey: processEnvApiKey || "" });

const plantSchema = {
  type: Type.OBJECT,
  properties: {
    identified: { type: Type.BOOLEAN, description: "True if a specific plant, millet, or pulse is clearly identified, false if unclear." },
    commonName: { type: Type.STRING },
    botanicalName: { type: Type.STRING },
    ayurvedicName: { type: Type.STRING, description: "The Sanskrit or Ayurvedic name." },
    family: { type: Type.STRING },
    shortDescription: { type: Type.STRING },
    medicinalUses: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of key medicinal or health benefits."
    },
    preparationMethods: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          methodName: { type: Type.STRING, description: "e.g., Decoction, Paste, Porridge" },
          instructions: { type: Type.STRING, description: "Brief instructions." }
        },
        required: ["methodName", "instructions"]
      }
    },
    dosage: {
      type: Type.OBJECT,
      properties: {
        children: { type: Type.STRING },
        adults: { type: Type.STRING },
        elderly: { type: Type.STRING }
      },
      required: ["children", "adults", "elderly"]
    },
    safetyWarnings: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Contraindications, side effects, or warnings." 
    },
    ayurvedicProperties: {
      type: Type.OBJECT,
      properties: {
        rasa: { type: Type.STRING, description: "Taste (e.g., Sweet, Bitter)" },
        virya: { type: Type.STRING, description: "Potency (e.g., Hot, Cold)" },
        vipaka: { type: Type.STRING, description: "Post-digestive effect" },
        doshaKarma: { type: Type.STRING, description: "Effect on Vata, Pitta, Kapha" }
      }
    },
    confidenceScore: { type: Type.INTEGER, description: "Confidence in identification from 0 to 100." },
    safetyProfileScore: { type: Type.INTEGER, description: "General safety rating from 1 (toxic) to 10 (very safe)." }
  },
  required: ["identified", "confidenceScore"]
};

export const analyzePlantImage = async (base64Image: string): Promise<PlantAnalysisResult> => {
  if (!processEnvApiKey) {
    throw new Error("API Key is missing. Please configure the environment.");
  }

  // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
  const cleanBase64 = base64Image.split(',')[1] || base64Image;
  const mimeType = base64Image.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || "image/jpeg";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64
            }
          },
          {
            text: `
              Analyze the provided image. Is it a medicinal plant, leaf, raw millet, or pulse/legume? 
              If yes, identify it precisely and provide detailed Ayurvedic medicinal and nutritional information.
              Return the data strictly in the specified JSON format.
              If it is none of these or cannot be identified, set 'identified' to false.
              Ensure Ayurvedic properties (Rasa, Virya, Vipaka) are accurate according to classical texts.
              For millets and pulses, include dietary benefits in 'medicinalUses' and serving suggestions in 'dosage'.
              Provide safety warnings if applicable (e.g., cooking requirements to remove anti-nutrients, allergens).
            `
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: plantSchema,
        temperature: 0.2
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const data = JSON.parse(text) as PlantAnalysisResult;
    
    // Safety check on the result structure
    if (data.identified && !data.commonName) {
        // Fallback if AI gets confused but says identified
        data.identified = false;
    }

    return data;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to process the image. Please try again.");
  }
};