
import { GoogleGenerativeAI, GenerateContentResponse } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("VITE_GEMINI_API_KEY is not set in the environment.");
}
// FIX: Initialize the client as per the coding guidelines, assuming API_KEY is set in the environment.
const ai = new GoogleGenerativeAI(apiKey);

export const enhanceNotesWithGemini = async (notes: string, systemInstruction: string): Promise<GenerateContentResponse> => {
  if (!notes) {
    throw new Error("ノートの内容が空です。");
  }
  if (!systemInstruction) {
    throw new Error("システムプロンプトが空です。");
  }

  try {
    const model = ai.getGenerativeModel({ model: "gemini-2.5-pro" });
    // `generateContent` にシステムプロンプトとユーザープロンプトを渡す形式に変更
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemInstruction }],
        },
        {
          role: "model",
          parts: [{ text: "はい、承知いたしました。スピーカーノートの分析を開始します。" }],
        },
      ],
    });
          const result = await chat.sendMessage(notes);
          return result.response;  } catch (error) {
    console.error("Error enhancing notes with Gemini:", error);
    // Re-throw the original error to be caught by the UI component
    throw error;
  }
};