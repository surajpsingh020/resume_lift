import { API_BASE, GEMINI_MODEL, VITE_APP_URL } from "../config/config";

// For backward compatibility other modules import AIChatSession and call
// AIChatSession.sendMessage(prompt). We'll provide a thin wrapper that
// forwards the prompt to the backend proxy at `${VITE_APP_URL}api/ai/generate`.

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

    // To keep the existing consumer code working (which expects
    // result.response.text()), return an object with response.text().
    return {
      response: {
        text: () => JSON.stringify(data),
      },
    };
  },
};

export { AIChatSession };
