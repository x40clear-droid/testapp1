import { GoogleGenAI } from "@google/genai";
import { GeneratedImage } from "../types";
import { getApiKey } from "./storageService";

// Helper to initialize the client dynamically
const getClient = (customKey?: string) => {
  // Prioritize custom key (for testing), then local storage, then env var
  const apiKey = customKey || getApiKey() || process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key가 설정되지 않았습니다. 우측 상단 설정 버튼을 눌러 키를 등록해주세요.");
  }
  
  return new GoogleGenAI({ apiKey });
};

export const testConnection = async (apiKey: string): Promise<boolean> => {
  try {
    const ai = getClient(apiKey);
    // Lightweight call to verify credentials
    await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Ping',
    });
    return true;
  } catch (error) {
    console.error("Connection Test Failed:", error);
    return false;
  }
};

export const generateWallpapers = async (prompt: string): Promise<GeneratedImage[]> => {
  try {
    const ai = getClient();
    
    // Enhance prompt for wallpaper quality
    const enhancedPrompt = `${prompt}, high quality phone wallpaper, vertical 9:16 aspect ratio, 8k resolution, aesthetic, masterpiece, photorealistic, no text`;

    // gemini-2.5-flash-image uses generateContent and typically generates one image per request.
    // We execute 4 parallel requests to get 4 variations.
    const promises = Array(4).fill(null).map(async (_, index) => {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: enhancedPrompt,
          config: {
            imageConfig: {
              aspectRatio: '9:16',
            }
          },
        });

        // Extract image from response parts
        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            return {
              id: `${Date.now()}-${index}`,
              base64: part.inlineData.data,
              prompt: prompt
            } as GeneratedImage;
          }
        }
      } catch (e) {
        console.warn(`Image generation attempt ${index} failed:`, e);
      }
      return null;
    });

    const results = await Promise.all(promises);
    const validImages = results.filter((img): img is GeneratedImage => img !== null);

    if (validImages.length === 0) {
      throw new Error("이미지를 생성하지 못했습니다. API Key를 확인하거나 잠시 후 다시 시도해주세요.");
    }

    return validImages;

  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    throw error;
  }
};