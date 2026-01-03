
import { GoogleGenAI, GenerateContentResponse, Type, Modality } from "@google/genai";
import { BASE_SYSTEM_INSTRUCTION } from "../constants";

// Selalu gunakan GoogleGenAI dengan apiKey dari process.env.API_KEY
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Mengirim pesan ke model Gemini 3 Pro untuk tugas teks kompleks.
 */
export const sendMessageToAI = async (
  message: string,
  history: { role: string; parts: string }[] = [],
  systemInstruction: string = BASE_SYSTEM_INSTRUCTION,
  useSearch = true
) => {
  const ai = getAI();
  const model = "gemini-3-pro-preview"; // Menggunakan model pro terbaru untuk kualitas terbaik

  const contents = [
    ...history.map(h => ({ 
      role: h.role === 'user' ? 'user' : 'model', 
      parts: [{ text: h.parts }] 
    })),
    { role: 'user', parts: [{ text: message }] }
  ];

  const config: any = {
    systemInstruction,
    temperature: 0.8,
    topP: 0.95,
  };

  if (useSearch) {
    config.tools = [{ googleSearch: {} }];
  }

  const response: GenerateContentResponse = await ai.models.generateContent({
    model,
    contents,
    config
  });

  return response;
};

/**
 * Menghasilkan gambar menggunakan gemini-2.5-flash-image.
 */
export const generateImage = async (prompt: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `Generate a high-definition, artistic, luxury-themed image: ${prompt}` }]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  return null;
};

/**
 * Menghasilkan video menggunakan veo-3.1-fast-generate-preview.
 * Wajib melakukan pemilihan API key sesuai pedoman model Veo.
 */
export const generateVideo = async (prompt: string) => {
  // Cek apakah pengguna sudah memilih API key berbayar untuk Veo
  if (typeof window !== 'undefined' && (window as any).aistudio) {
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
      // Melanjutkan proses dengan asumsi kunci telah dipilih (menangani race condition)
    }
  }

  // Selalu buat instance baru sebelum pemanggilan API untuk menggunakan kunci terbaru
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let operation;
  try {
    operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });
  } catch (error: any) {
    // Reset pemilihan kunci jika terjadi error 404 terkait billing/project
    if (error.message?.includes("Requested entity was not found.")) {
      if (typeof window !== 'undefined' && (window as any).aistudio) {
        await (window as any).aistudio.openSelectKey();
      }
    }
    throw error;
  }

  // Polling hingga video selesai dibuat (proses memakan waktu beberapa menit)
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) return null;

  // Mengunduh bytes MP4 dengan menyertakan API key pada URL
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  if (!response.ok) throw new Error("Gagal mengunduh berkas video.");

  const blob = await response.blob();
  return URL.createObjectURL(blob);
};
