import { API_BASE, GEMINI_MODEL, VITE_APP_URL } from "../config/config";

const endpointBase = VITE_APP_URL || API_BASE || "/";

const AIChatSession = {
  sendMessage: async (prompt, opts = {}) => {
    const body = {
      prompt,
      model: GEMINI_MODEL,
      temperature: opts.temperature ?? 0.2,
      maxTokens: opts.maxTokens ?? 512,
    };

    const res = await fetch(`${endpointBase}api/ai/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AI proxy error: ${res.status} ${text}`);
    }

    const data = await res.json();

    const extractModelText = (d) => {
      try {
        if (!d) return '';
        // If it's already a string, return as-is
        if (typeof d === 'string') return d;

        // If data has candidates (client SDK shape)
        if (d.candidates && Array.isArray(d.candidates) && d.candidates.length > 0) {
          // Concatenate all parts text from first candidate
          const cand = d.candidates[0];
          const parts = cand?.content?.parts;
          if (Array.isArray(parts)) {
            return parts.map(p => p.text || '').join('');
          }
        }

        // If it's wrapped under data.data (double-wrapped ApiResponse), unwrap
        if (d.data) {
          return extractModelText(d.data);
        }

        // Fallback: stringify the whole object
        return JSON.stringify(d);
      } catch (e) {
        return '';
      }
    };

    const modelText = extractModelText(data);

    return {
      response: {
        // Keep the same API (text()) so existing code doesn't need changes.
        text: () => modelText,
        // Provide a convenience json() to return parsed JSON when possible
        json: () => {
          try {
            return JSON.parse(modelText);
          } catch (e) {
            return null;
          }
        }
      },
    };
  },
};

export { AIChatSession };
