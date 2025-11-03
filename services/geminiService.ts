
import { GoogleGenAI } from "@google/genai";

// FIX: Initialize the client as per the coding guidelines, assuming API_KEY is set in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const enhanceNotesWithGemini = async (notes: string): Promise<string> => {
  if (!notes) {
    throw new Error("ノートの内容が空です。");
  }

  // FIX: Use systemInstruction for better prompting, separating instructions from the data.
  const systemInstruction = `あなたは優秀なプレゼンテーションアシスタントです。
    以下の、スライドごとにマークダウン形式で区切られたスピーカーノートを分析してください。
    あなたのタスクは、キーポイントを要約し、より洗練された簡潔なバージョンに再フォーマットすることです。
    各スライドについて、簡単な要約と、主要なアイデアを強調する箇条書きを提供してください。
    プロフェッショナルで明確なトーンを維持してください。`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: notes,
      config: {
        systemInstruction: systemInstruction,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error enhancing notes with Gemini:", error);
    // Provide a more user-friendly error message
    if (error instanceof Error && error.message.includes('API key not valid')) {
        throw new Error("提供されたAPIキーが無効です。設定を確認してください。");
    }
    throw new Error("AIからの応答の取得に失敗しました。サービスが一時的に利用できない可能性があります。");
  }
};