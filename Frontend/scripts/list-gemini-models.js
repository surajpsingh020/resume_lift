#!/usr/bin/env node
/*
  Simple script to list available models for your Google Generative API key.
  Usage (PowerShell):
    $env:GEMINI_API_KEY = "YOUR_KEY"
    node scripts/list-gemini-models.js

  Or pass key as first argument:
    node scripts/list-gemini-models.js YOUR_KEY
*/

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

async function listModels(apiKey) {
  const url = `${API_URL}?key=${encodeURIComponent(apiKey)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    const data = await res.json();
    if (!data.models || !Array.isArray(data.models)) {
      console.log('No models array returned:', JSON.stringify(data, null, 2));
      return;
    }

    console.log('Available models:');
    data.models.forEach((m) => {
      console.log(`- ${m.name}`);
      if (m.supportedMethods) {
        console.log(`    methods: ${m.supportedMethods.join(', ')}`);
      }
      if (m.description) {
        console.log(`    ${m.description.split('\n')[0]}`);
      }
    });
  } catch (err) {
    console.error('Error listing models:', err.message || err);
    process.exitCode = 2;
  }
}

const argKey = process.argv[2];
const envKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const apiKey = argKey || envKey;
if (!apiKey) {
  console.error('Missing API key. Provide it as env GEMINI_API_KEY or as the first argument.');
  process.exit(1);
}

(async () => {
  await listModels(apiKey);
})();
