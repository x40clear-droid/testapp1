import { GoogleGenAI } from "@google/genai";
import { GeneratedImage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateWallpapers = async (prompt: string): Promise<GeneratedImage[]> => {
  try {
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
      throw new Error("이미지를 생성하지 못했습니다. (모델 응답 없음)");
    }

    return validImages;

  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    throw error;
  }
};