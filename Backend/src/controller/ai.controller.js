import fetch from 'node-fetch';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

// Try to import the official Google Generative AI client if available.
let GoogleGenerativeAIClient = null;
try {
  // dynamic import to avoid hard crash if package API differs
  // @ts-ignore
  const mod = await import('@google/generative-ai');
  GoogleGenerativeAIClient = mod.GoogleGenerativeAI || null;
} catch (e) {
  GoogleGenerativeAIClient = null;
}

// POST /api/ai/generate
// body: { prompt: string, model?: string, temperature?: number, maxTokens?: number }
const generateText = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json(new ApiError(500, 'Server misconfigured: GEMINI_API_KEY missing'));
    }

    const { prompt, model, temperature = 0.2, maxTokens = 512 } = req.body;
    if (!prompt || (typeof prompt !== 'string' && typeof prompt?.text !== 'string')) {
      return res.status(400).json(new ApiError(400, "Missing or invalid 'prompt' in request body"));
    }

    // Accept prompt either as string or object { text }
    const promptText = typeof prompt === 'string' ? prompt : prompt.text;

  const modelName = model || process.env.GEMINI_MODEL || process.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
  // Some client methods expect the model resource to begin with 'models/'.
  const modelResource = modelName.startsWith('models/') ? modelName : `models/${modelName}`;

    // First try using the official client if it was importable and appears usable.
    if (GoogleGenerativeAIClient) {
      try {
        const genai = new GoogleGenerativeAIClient(apiKey);
        const genModel = genai.getGenerativeModel({ model: modelResource });
        // generateContent accepts a string or structured request. Use simple string for now.
        const result = await genModel.generateContent(promptText);
        // the client returns { response }
        return res.status(200).json(new ApiResponse(200, result.response, 'OK'));
      } catch (clientErr) {
        console.warn('Generative AI client failed, falling back to REST call:', clientErr?.message || clientErr);
      }
    }

    // Fallback: use the REST endpoint (keeps previous behavior)
  const url = `https://generativelanguage.googleapis.com/v1beta2/models/${encodeURIComponent(modelResource)}:generateText?key=${encodeURIComponent(apiKey)}`;
    const body = {
      prompt: { text: promptText },
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
    return res.status(500).json(new ApiError(500, 'Internal Server Error', [], err?.stack || String(err)));
  }
};

export { generateText };