import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const gemini = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateWithGemini(prompt: string): Promise<string> {
  const result = await gemini.generateContent(prompt);
  return result.response.text();
}