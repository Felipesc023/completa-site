import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

/**
 * Edita uma imagem utilizando o modelo Gemini 2.5 Flash Image.
 * Implementação 100% segura para TypeScript strict.
 */
export const editImageWithGemini = async (
  base64Image: string,
  prompt: string
): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      console.error("Gemini API Key não encontrada no ambiente.");
      return "";
    }

    const ai = new GoogleGenAI({ apiKey });

    const cleanBase64 = base64Image.replace(
      /^data:image\/(png|jpeg|jpg|webp);base64,/,
      ""
    );

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64,
            },
          },
        ],
      },
    });

    // Extração segura de candidatos
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      return "";
    }

    const firstCandidate = candidates[0];
    if (!firstCandidate || !firstCandidate.content) {
      return "";
    }

    const parts = firstCandidate.content.parts;
    if (!parts || parts.length === 0) {
      return "";
    }

    // Busca por imagem retornada
    for (const part of parts) {
      if (part.inlineData?.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    // Fallback para texto
    const firstPart = parts[0];
    if (firstPart && "text" in firstPart && typeof firstPart.text === "string") {
      return firstPart.text;
    }

    return "";
  } catch (error) {
    console.error("Gemini Edit Error:", error);
    return "";
  }
};