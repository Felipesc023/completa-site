import { GoogleGenAI } from "@google/genai";

export const editImageWithGemini = async (base64Image: string, prompt: string): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("Gemini API Key não encontrada no ambiente.");
      return "";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64,
            },
          },
        ],
      },
    });

    // Validação rigorosa de todos os níveis da resposta
    const candidates = response?.candidates;
    if (candidates && candidates.length > 0) {
      const firstCandidate = candidates[0];
      if (firstCandidate && firstCandidate.content) {
        const parts = firstCandidate.content.parts;
        if (parts && parts.length > 0) {
          for (const part of parts) {
            // Prioridade: Retornar dados da imagem se presentes
            if (part?.inlineData?.data) {
              return `data:image/png;base64,${part.inlineData.data}`;
            }
            // Fallback: Retornar texto se for o que a IA devolveu
            if (part?.text) {
              return part.text;
            }
          }
        }
      }
    }
    
    // Conforme solicitado: Retornar string vazia se não houver conteúdo válido
    return "";
  } catch (error) {
    console.error("Gemini Edit Error:", error);
    return "";
  }
};