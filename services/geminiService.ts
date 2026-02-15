import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

/**
 * Edita uma imagem utilizando o modelo Gemini 2.5 Flash Image.
 * Implementação 100% segura para TypeScript strict e compatível com build de produção.
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

    // 🔒 EXTRAÇÃO 100% SEGURA VALIDADA PARA O COMPILADOR TSC
    const candidates = response?.candidates;

    // 1. Verifica se candidates existe e é um array com elementos
    if (!Array.isArray(candidates) || candidates.length === 0) {
      return "";
    }

    const firstCandidate = candidates[0];

    // 2. Verifica se o primeiro candidato e o conteúdo existem
    if (!firstCandidate || !firstCandidate.content) {
      return "";
    }

    const parts = firstCandidate.content.parts;

    // 3. Verifica se parts existe e é um array com elementos
    if (!Array.isArray(parts) || parts.length === 0) {
      return "";
    }

    // 4. Procura imagem gerada (iterando de forma segura)
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

    // 5. Fallback para texto (se não houver imagem)
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