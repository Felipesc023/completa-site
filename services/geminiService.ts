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
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      console.error("Gemini API Key não encontrada no ambiente.");
      return "";
    }

    const ai = new GoogleGenAI({ apiKey });

    // Remove o prefixo data:image/...;base64, se presente
    const cleanBase64 = base64Image.replace(
      /^data:image\/(png|jpeg|jpg|webp);base64,/,
      ""
    );

    const response: GenerateContentResponse =
      await ai.models.generateContent({
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

    // 🔒 EXTRAÇÃO 100% SEGURA

    const candidates = response?.candidates;

    // Verifica se candidates é um array válido e não vazio
    if (!Array.isArray(candidates) || candidates.length === 0) {
      return "";
    }

    const firstCandidate = candidates[0];

    // Verifica se o candidato e seu conteúdo existem
    if (!firstCandidate || !firstCandidate.content) {
      return "";
    }

    const parts = firstCandidate.content.parts;

    // Verifica se parts é um array válido e não vazio
    if (!Array.isArray(parts) || parts.length === 0) {
      return "";
    }

    // 1. Procura por imagem gerada (inlineData)
    for (const part of parts) {
      if (
        part &&
        typeof part === "object" &&
        part.inlineData &&
        typeof part.inlineData.data === "string"
      ) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    // 2. Fallback para texto caso não haja imagem
    const firstPart = parts[0];
    if (firstPart && typeof firstPart.text === "string") {
      return firstPart.text;
    }

    return "";
  } catch (error) {
    console.error("Gemini Edit Error:", error);
    return "";
  }
};