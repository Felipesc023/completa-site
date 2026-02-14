import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

/**
 * Edita uma imagem utilizando o modelo Gemini 2.5 Flash Image.
 * A função valida rigorosamente a resposta para evitar erros de runtime e tipos.
 */
export const editImageWithGemini = async (base64Image: string, prompt: string): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("Gemini API Key não encontrada no ambiente.");
      return "";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Remove o prefixo data:image/...;base64, se presente
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const response: GenerateContentResponse = await ai.models.generateContent({
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

    /**
     * Validação segura em múltiplos níveis utilizando Optional Chaining.
     * Verifica a existência de candidates, content e parts antes de processar.
     */
    const candidates = response?.candidates;
    
    if (candidates && candidates.length > 0) {
      const candidate = candidates[0];
      const parts = candidate?.content?.parts;

      if (parts && parts.length > 0) {
        // Itera pelas partes para encontrar dados de imagem (inlineData) ou texto
        for (const part of parts) {
          // Se o modelo retornar uma nova imagem processada
          if (part.inlineData?.data) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
          
          // Se o modelo retornar apenas texto (explicação ou erro textual)
          if (part.text) {
            return part.text;
          }
        }
      }
    }
    
    // Retorno padrão caso a estrutura esperada não seja encontrada
    return "";
  } catch (error) {
    console.error("Gemini Edit Error:", error);
    // Em caso de erro na API ou rede, retorna string vazia para manter consistência
    return "";
  }
};