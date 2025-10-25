import { URL } from 'url';

const base = process.env.URL || 'http://localhost:5001';

function log(...args) {
  console.log(...args);
}

async function http(path, opts = {}) {
  const res = await fetch(new URL(path, base).toString(), opts);
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch (e) { body = text; }
  return { status: res.status, headers: Object.fromEntries(res.headers.entries()), body };
}

function extractCookie(setCookieHeader) {
  if (!setCookieHeader) return null;
  // setCookieHeader can be array or string
  const header = Array.isArray(setCookieHeader) ? setCookieHeader[0] : setCookieHeader;
  const cookie = header.split(';')[0];
  return cookie;
}

(async () => {
  try {
    log('Integration test starting against', base);

    // 1) Register a new user (unique email)
    const email = `test+${Date.now()}@example.com`;
    const registerPayload = { fullName: 'Integration Tester', email, password: 'Pass123!@#' };
    log('Registering user:', email);
    const reg = await http('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerPayload),
    });
    log('Register status:', reg.status);
    if (reg.status !== 201) {
      console.error('Registration failed:', reg.body);
      process.exit(1);
    }

    // 2) Login
    log('Logging in');
    const login = await fetch(base + '/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: registerPayload.password }),
      redirect: 'manual'
    });
    const setCookie = login.headers.get('set-cookie');
    const cookie = extractCookie(setCookie);
    log('Login status:', login.status, 'cookie:', cookie ? 'received' : 'none');
    if (login.status !== 200 || !cookie) {
      const txt = await login.text();
      console.error('Login failed:', txt);
      process.exit(1);
    }

    // 3) Create Resume (authenticated)
    log('Creating resume');
    const create = await http('/api/resumes/createResume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
      body: JSON.stringify({ title: 'Integration Resume', themeColor: '#123456' }),
    });
    log('Create resume status:', create.status);
    if (create.status !== 201) {
      console.error('Create resume failed:', create.body);
      process.exit(1);
    }

    // 4) Get all resumes
    log('Fetching all resumes');
    const all = await http('/api/resumes/getAllResume', { headers: { Cookie: cookie } });
    log('GetAll status:', all.status);
    if (all.status !== 200) {
      console.error('GetAll failed:', all.body);
      process.exit(1);
    }

    log('Integration test passed — flows working: register, login, createResume, getAllResume');
    console.log('Resumes returned (count):', Array.isArray(all.body?.data) ? all.body.data.length : 'unknown');
    process.exit(0);
  } catch (err) {
    console.error('Integration test error:', err.message || err);
    process.exit(1);
  }
})();
