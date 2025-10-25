import { Gem } from "lucide-react";
import { GEMINI_API_KEY, GEMINI_MODEL } from "../config/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = GEMINI_API_KEY;

// Default to a commonly available text model if the user hasn't specified one.
const defaultModel = "models/text-bison-001";

let AIChatSession = null;

if (!apiKey) {
  // Provide a stub that throws helpfully when invoked
  AIChatSession = {
    sendMessage: async () => {
      throw new Error(
        "Missing Gemini API key. Set VITE_GEMINI_API_KEY in Frontend/.env.local"
      );
    },
  };
} else {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = GEMINI_MODEL || defaultModel;

    // Try to create the model and start a chat session. If the model isn't
    // available for this API version, this will throw and we'll return a
    // helpful error to the UI.
    const model = genAI.getGenerativeModel({ model: modelName });

    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    };

    AIChatSession = model.startChat({ generationConfig, history: [] });
  } catch (err) {
    AIChatSession = {
      sendMessage: async () => {
        // Surface the original error with a short, actionable hint
        throw new Error(
          `AI initialization failed: ${err.message}.\n` +
            `Possible causes: invalid model name (set VITE_GEMINI_MODEL), ` +
            `unsupported model for the installed client or API version, or a bad API key. ` +
            `Run 'node scripts/list-gemini-models.js' (set GEMINI_API_KEY env) to see the models your key supports, then set VITE_GEMINI_MODEL to a supported model.`
        );
      },
    };
  }
}

export { AIChatSession };
