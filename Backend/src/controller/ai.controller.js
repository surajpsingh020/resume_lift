import fetch from 'node-fetch';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

// POST /api/ai/generate
// body: { prompt: string, model?: string, temperature?: number, maxTokens?: number }
const generateText = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json(new ApiError(500, 'Server misconfigured: GEMINI_API_KEY missing'));
    }

    const { prompt, model, temperature = 0.2, maxTokens = 512 } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json(new ApiError(400, "Missing or invalid 'prompt' in request body"));
    }

    const modelName = model || process.env.GEMINI_MODEL || process.env.VITE_GEMINI_MODEL || 'models/text-bison-001';

    const url = `https://generativelanguage.googleapis.com/v1beta2/models/${encodeURIComponent(modelName)}:generateText?key=${encodeURIComponent(apiKey)}`;

    const body = {
      prompt: { text: prompt },
      temperature,
      maxOutputTokens: maxTokens,
    };

    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const text = await r.text();
      console.error('Generative API error:', r.status, text);
      return res.status(502).json(new ApiError(502, 'Upstream AI error', [], text));
    }

    const data = await r.json();
    return res.status(200).json(new ApiResponse(200, data, 'OK'));
  } catch (err) {
    console.error('AI proxy error:', err);
    return res.status(500).json(new ApiError(500, 'Internal Server Error', [], err.stack));
  }
};

export { generateText };
import { TextGenerationModel, TextGenerationInput } from "@google/generative-ai"; // adapt if package exports differ
import { ApiResponse, ApiError } from "../utils/ApiResponse.js"; // reuse your response helpers if you have them

// If the package uses a client factory, follow the package docs — example below is generic
const MODEL = process.env.VITE_GEMINI_MODEL || process.env.GEMINI_MODEL || "models/gemini-2.5-flash";

async function generateText(req, res) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json(new ApiError(500, "Server misconfigured: GEMINI_API_KEY missing"));

    const { prompt, temperature = 0.2, maxTokens = 512 } = req.body;
    if (!prompt) return res.status(400).json(new ApiError(400, "Missing 'prompt' in body"));

    // Example using fetch if you prefer to avoid client lib (simpler, explicit)
    const body = {
      model: MODEL,
      prompt,
      temperature,
      max_output_tokens: maxTokens
    };

    const response = await fetch("https://generativeai.googleapis.com/v1beta2/models/" + encodeURIComponent(MODEL) + ":generateText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}` // depends on API auth form; some endpoints expect "Authorization: Bearer <OAUTH_TOKEN>" rather than API key
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error:", errText);
      return res.status(502).json(new ApiError(502, "Upstream AI error", [], errText));
    }

    const data = await response.json();
    return res.status(200).json(new ApiResponse(200, data, "OK"));
  } catch (err) {
    console.error("AI proxy error:", err);
    return res.status(500).json(new ApiError(500, "Internal Server Error", [], err.stack));
  }
}

export { generateText };