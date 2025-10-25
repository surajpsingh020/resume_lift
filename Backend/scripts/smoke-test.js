import fetch from 'node-fetch';

const url = process.argv[2] || process.env.URL || 'http://localhost:5001/';

(async () => {
  try {
    const res = await fetch(url, { method: 'GET', redirect: 'manual' });
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Body snippet:', text.slice(0, 400));
    process.exit(0);
  } catch (err) {
    console.error('Request failed:', err.message || err);
    process.exit(1);
  }
})();
