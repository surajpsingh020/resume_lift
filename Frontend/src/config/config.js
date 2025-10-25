const AUTH_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const API_KEY = import.meta.env.VITE_STRAPI_API_KEY;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL; // e.g. models/text-bison-001
const VITE_APP_URL = import.meta.env.VITE_APP_URL;

export { AUTH_KEY, API_KEY, GEMINI_API_KEY,VITE_APP_URL };
export { GEMINI_MODEL };
