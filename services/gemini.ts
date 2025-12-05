import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisData } from "../types";

export const analyzeAccessibility = async (base64Image: string): Promise<AnalysisData> => {
  // Validación de seguridad para entornos propios
  // Verificamos si la key está vacía o si sigue teniendo el valor por defecto del archivo .env de ejemplo
  if (!process.env.API_KEY || process.env.API_KEY === 'PEGAR_TU_API_KEY_AQUI') {
    throw new Error("API_KEY no configurada. Por favor abre el archivo .env en la raíz del proyecto y pega tu llave de Google Gemini.");
  }

  // Use process.env.API_KEY as per system instructions
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const base64Data = base64Image.split(',')[1] || base64Image;

  const prompt = `
    Analiza la imagen de este espacio arquitectónico como un experto en accesibilidad universal.
    
    Debes evaluar el espacio y categorizar los hallazgos.
    
    Categorías requeridas:
    1. Accesibilidad Motriz: Rampas, escalones, ancho de puertas, superficies de suelo, espacios de giro.
    2. Accesibilidad Visual y Señalética: Contraste, braille, guías podotáctiles, claridad de la señalización, iluminación.
    3. Accesibilidad General y Confort: Mobiliario, seguridad, ergonomía, obstáculos temporales.

    Para cada categoría, determina un estado: 'positive' (bueno), 'warning' (mejorable/precaución), o 'negative' (barrera detectada/malo).
    
    Genera también un "fullReportMarkdown" que sea un informe detallado y profesional en formato Markdown para ser impreso en un PDF.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data
            }
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: { type: Type.STRING, description: "Veredicto final corto, ej: 'Accesible', 'No Accesible'" },
            summary: { type: Type.STRING, description: "Resumen ejecutivo de 2-3 oraciones" },
            categories: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  status: { type: Type.STRING, enum: ["positive", "warning", "negative"] },
                  details: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            },
            fullReportMarkdown: { type: Type.STRING, description: "Informe completo y detallado en Markdown" }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text");
    
    return JSON.parse(text) as AnalysisData;
  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    throw error;
  }
};