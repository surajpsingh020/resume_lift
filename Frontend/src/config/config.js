const AUTH_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const API_KEY = import.meta.env.VITE_STRAPI_API_KEY;
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL;
const VITE_APP_URL = import.meta.env.VITE_APP_URL;

const API_BASE = VITE_APP_URL || '/';

export { AUTH_KEY, API_KEY, VITE_APP_URL, API_BASE };
export { GEMINI_MODEL };
