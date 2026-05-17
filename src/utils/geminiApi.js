import { GoogleGenerativeAI } from '@google/generative-ai';

// In a real enterprise app, this should be called from a backend (e.g. Node.js or edge function)
// to avoid exposing the API key to the client.
// For the hackathon demo, we use Vite env vars.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "DUMMY_KEY";

const genAI = new GoogleGenerativeAI(API_KEY);

export async function generateChatResponse(promptText) {
  if (API_KEY === "DUMMY_KEY") {
    // Fallback to simulated response if no API key is provided
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("Bu bir simüle edilmiş yapay zeka yanıtıdır. Lütfen .env dosyasına VITE_GEMINI_API_KEY ekleyin.");
      }, 1000);
    });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(promptText);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Üzgünüm, şu an sunucularıma erişemiyorum. Lütfen daha sonra tekrar dene.";
  }
}
