/**
 * AGRINOVA backend — zero-dependency Node.js HTTP server (multi-user edition).
 *
 * Matches the client contract in src/app/lib/api.ts: email/password auth with
 * bearer tokens, per-user profiles (farmer or customer), per-user soil reports
 * and crop recommendations, a shared marketplace, per-user carts, orders, and
 * notifications. Uses only Node built-ins — no `npm install` needed to run it.
 *
 * Run:
 *   node server/server.js
 * Env:
 *   PORT            (default 5000)
 *   GEMINI_API_KEY  (optional — enables real AI responses)
 *   GEMINI_MODEL    (default "gemini-2.0-flash")
 *
 * Demo accounts (seeded, password for both is "demo1234"):
 *   farmer@agrinova.test    (userType: farmer)
 *   customer@agrinova.test  (userType: customer)
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'db.json');
const SEED_PATH = path.join(__dirname, 'db.seed.json');
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const DEMO_PASSWORD = 'demo1234';

// ---------------------------------------------------------------------------
// Tiny JSON file "database"
// ---------------------------------------------------------------------------

function loadDb() {
  if (!fs.existsSync(DB_PATH)) {
    fs.copyFileSync(SEED_PATH, DB_PATH);
  }
  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  // Fill in demo-account password hashes on first run (seed file ships with
  // empty placeholders so the plaintext demo password isn't committed as-is).
  let changed = false;
  for (const user of db.users) {
    if (!user.passwordHash) {
      user.passwordHash = hashPassword(DEMO_PASSWORD);
      changed = true;
    }
  }
  if (changed) saveDb(db);
  return db;
}

function saveDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  });
  res.end(payload);
}

function sendError(res, status, message) {
  sendJson(res, status, { error: message });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 15 * 1024 * 1024) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Auth: password hashing + bearer-token sessions
// ---------------------------------------------------------------------------

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt] = stored.split(':');
  return hashPassword(password, salt) === stored;
}

function sanitizeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

function createSession(db, userId) {
  const token = crypto.randomBytes(24).toString('hex');
  db.sessions[token] = userId;
  saveDb(db);
  return token;
}

function getAuthedUser(req, db) {
  const header = req.headers['authorization'] || '';
  const match = header.match(/^Bearer (.+)$/);
  if (!match) return null;
  const userId = db.sessions[match[1]];
  if (!userId) return null;
  return db.users.find((u) => u.id === userId) || null;
}

function requireAuth(req, res, db) {
  const user = getAuthedUser(req, db);
  if (!user) {
    sendError(res, 401, 'Not authenticated — please sign in.');
    return null;
  }
  return user;
}

// ---------------------------------------------------------------------------
// Weather (Open-Meteo — free, no key)
// ---------------------------------------------------------------------------

async function geocodeVillage(query) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
  const res = await fetchWithTimeout(url);
  const data = await res.json();
  if (data && data.results && data.results.length > 0) {
    const r = data.results[0];
    return { lat: r.latitude, lon: r.longitude, resolvedName: `${r.name}, ${r.admin1 || ''}`.trim() };
  }
  return null;
}

async function fetchLiveWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&timezone=auto&forecast_days=7`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`Open-Meteo request failed: ${res.status}`);
  return res.json();
}

function mockWeather() {
  return {
    current: { temperature_2m: 31, relative_humidity_2m: 68, precipitation: 0, wind_speed_10m: 12, weather_code: 1 },
    daily: {
      time: Array.from({ length: 7 }, (_, i) => new Date(Date.now() + i * 86400000).toISOString().slice(0, 10)),
      temperature_2m_max: [33, 34, 32, 31, 33, 34, 32],
      temperature_2m_min: [24, 25, 24, 23, 24, 25, 24],
      precipitation_probability_max: [10, 20, 60, 70, 30, 10, 5],
      weather_code: [1, 2, 61, 63, 2, 1, 1],
    },
  };
}

// ---------------------------------------------------------------------------
// Gemini helper — advisor chat, crop-health vision, soil-doc parsing.
// ---------------------------------------------------------------------------

async function callGemini({ prompt, imageBase64, imageMimeType, jsonOutput }) {
  if (!GEMINI_API_KEY) return null;
  const parts = [{ text: prompt }];
  if (imageBase64) {
    parts.push({ inline_data: { mime_type: imageMimeType || 'image/jpeg', data: imageBase64 } });
  }
  const body = {
    contents: [{ role: 'user', parts }],
    ...(jsonOutput ? { generationConfig: { responseMimeType: 'application/json' } } : {}),
  };
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const res = await fetchWithTimeout(
    url,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
    20000
  );
  if (!res.ok) throw new Error(`Gemini request failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
}

// ---------------------------------------------------------------------------
// Crop recommendation engine — weighted match against a small crop catalog
// ---------------------------------------------------------------------------

const CROP_CATALOG = [
  { id: 'crop_rice', name: 'Rice (Paddy)', season: 'Kharif', idealPh: [5.5, 7.0], preferredTexture: ['Clay loam', 'Clay'], nutrientNeeds: { nitrogen: 'High', phosphorus: 'Medium', potassium: 'Medium' }, notes: 'Needs standing water and warm temperatures through the growing cycle.' },
  { id: 'crop_cotton', name: 'Cotton (Bt hybrid)', season: 'Kharif', idealPh: [6.0, 8.0], preferredTexture: ['Black soil', 'Loam', 'Clay loam'], nutrientNeeds: { nitrogen: 'High', phosphorus: 'Medium', potassium: 'High' }, notes: 'Strong regional market and MSP support; needs a nitrogen-rich basal dose.' },
  { id: 'crop_redgram', name: 'Red Gram (Tur Dal)', season: 'Kharif', idealPh: [6.0, 7.5], preferredTexture: ['Loam', 'Clay loam'], nutrientNeeds: { nitrogen: 'Low', phosphorus: 'Medium', potassium: 'Medium' }, notes: 'Deep roots fix nitrogen and improve soil structure for the next cycle.' },
  { id: 'crop_blackgram', name: 'Black Gram', season: 'Rabi', idealPh: [6.5, 7.5], preferredTexture: ['Loam', 'Clay loam'], nutrientNeeds: { nitrogen: 'Low', phosphorus: 'Medium', potassium: 'Medium' }, notes: 'Good rotation crop to fix nitrogen after a cereal like rice.' },
  { id: 'crop_greengram', name: 'Green Gram (Moong)', season: 'Rabi', idealPh: [6.2, 7.2], preferredTexture: ['Loam', 'Sandy loam'], nutrientNeeds: { nitrogen: 'Low', phosphorus: 'Low', potassium: 'Medium' }, notes: 'Short-duration cover crop that restores organic matter before the main season.' },
  { id: 'crop_maize', name: 'Maize', season: 'Kharif', idealPh: [5.8, 7.0], preferredTexture: ['Loam', 'Sandy loam'], nutrientNeeds: { nitrogen: 'High', phosphorus: 'High', potassium: 'Medium' }, notes: 'Heavy feeder — responds strongly to split nitrogen doses.' },
  { id: 'crop_sugarcane', name: 'Sugarcane', season: 'Year-round', idealPh: [6.0, 7.5], preferredTexture: ['Clay loam', 'Loam'], nutrientNeeds: { nitrogen: 'High', phosphorus: 'Medium', potassium: 'High' }, notes: 'Long-duration, high water need; best on deep, well-drained soils.' },
  { id: 'crop_groundnut', name: 'Groundnut', season: 'Kharif', idealPh: [6.0, 7.0], preferredTexture: ['Sandy loam', 'Loam'], nutrientNeeds: { nitrogen: 'Low', phosphorus: 'Medium', potassium: 'Medium' }, notes: 'Prefers loose, well-drained soil for easy pod development.' },
  { id: 'crop_turmeric', name: 'Turmeric', season: 'Kharif', idealPh: [5.5, 7.5], preferredTexture: ['Clay loam', 'Loam'], nutrientNeeds: { nitrogen: 'Medium', phosphorus: 'Medium', potassium: 'High' }, notes: 'High-value spice crop; benefits from rich organic matter.' },
  { id: 'crop_chilli', name: 'Chilli', season: 'Rabi', idealPh: [6.0, 7.0], preferredTexture: ['Loam', 'Sandy loam'], nutrientNeeds: { nitrogen: 'Medium', phosphorus: 'High', potassium: 'High' }, notes: 'Sensitive to waterlogging; needs good drainage and potassium for fruit set.' },
];

const LEVEL_SCORE = { Low: 1, Medium: 2, High: 3 };

function nutrientCloseness(have, need) {
  const diff = Math.abs((LEVEL_SCORE[have] ?? 2) - (LEVEL_SCORE[need] ?? 2));
  return diff === 0 ? 100 : diff === 1 ? 65 : 30;
}

function phCloseness(ph, [min, max]) {
  if (ph >= min && ph <= max) return 100;
  const distance = ph < min ? min - ph : ph - max;
  return Math.max(20, 100 - distance * 40);
}

function textureCloseness(texture, preferred) {
  if (!texture) return 60;
  return preferred.some((t) => t.toLowerCase() === texture.toLowerCase()) ? 100 : 55;
}

function computeCropRecommendations(soil) {
  const scored = CROP_CATALOG.map((crop) => {
    const phScore = phCloseness(soil.ph, crop.idealPh);
    const nScore = nutrientCloseness(soil.nitrogen, crop.nutrientNeeds.nitrogen);
    const pScore = nutrientCloseness(soil.phosphorus, crop.nutrientNeeds.phosphorus);
    const kScore = nutrientCloseness(soil.potassium, crop.nutrientNeeds.potassium);
    const textureScore = textureCloseness(soil.texture, crop.preferredTexture);
    const suitability = Math.round(phScore * 0.25 + textureScore * 0.15 + nScore * 0.2 + pScore * 0.2 + kScore * 0.2);

    const gaps = [];
    if (nScore < 70) gaps.push('nitrogen');
    if (pScore < 70) gaps.push('phosphorus');
    if (kScore < 70) gaps.push('potassium');

    const reason = gaps.length === 0
      ? `Strong match: soil pH ${soil.ph} and ${soil.texture.toLowerCase()} texture suit this crop well. ${crop.notes}`
      : `Viable, but watch ${gaps.join(' and ')} before sowing. ${crop.notes}`;

    return { id: crop.id, name: crop.name, suitability: Math.max(0, Math.min(100, suitability)), reason, season: crop.season };
  });
  return scored.sort((a, b) => b.suitability - a.suitability).slice(0, 6);
}

function computeStrataScore({ nitrogen, phosphorus, potassium, organicMatter }) {
  const levelPoints = { Low: 40, Medium: 70, High: 95 };
  const avg = (levelPoints[nitrogen] + levelPoints[phosphorus] + levelPoints[potassium]) / 3;
  const omBonus = Math.min(organicMatter * 5, 15);
  return Math.round(Math.min(avg + omBonus, 100));
}

function defaultSoilReport() {
  return {
    score: 65,
    ph: 6.5,
    nitrogen: 'Medium',
    phosphorus: 'Medium',
    potassium: 'Medium',
    organicMatter: 1.5,
    texture: 'Loam',
    lastUpdated: new Date().toISOString(),
    summary: 'No soil report on file yet — these are starting estimates. Upload a soil test photo for a real analysis.',
  };
}

// ---------------------------------------------------------------------------
// Mock fallbacks for AI endpoints
// ---------------------------------------------------------------------------

function mockAdvisorReply(message, ctx) {
  const m = (message || '').toLowerCase();
  const crop = ctx.profile.primaryCrop || ctx.profile.cropTypes?.[0] || 'your crop';
  if (m.includes('pest') || m.includes('insect')) {
    return `Based on ${crop} at this time of year, check the undersides of leaves for early pest signs. Neem-oil spray in the evening is a safe first step before considering chemical pesticides. Would you like a specific product recommendation?`;
  }
  if (m.includes('fertil') || m.includes('nutrient')) {
    return `Your last soil report shows ${ctx.soil.phosphorus.toLowerCase()} phosphorus and ${ctx.soil.potassium.toLowerCase()} potassium. For ${crop}, I'd suggest a phosphorus-focused top dressing (like DAP) in the next 1-2 weeks, split into two applications.`;
  }
  if (m.includes('weather') || m.includes('rain') || m.includes('water') || m.includes('irrigat')) {
    return `Keep an eye on the 7-day forecast on the Weather page — if rain is expected in the next 2 days, it's best to hold off on any fertilizer, pesticide spraying, or irrigation so it isn't wasted.`;
  }
  return `Thanks for sharing that. For your ${ctx.profile.landSizeAcres || 'few'}-acre farm growing ${crop} in ${ctx.profile.village || ctx.profile.district}, I'd recommend checking your soil score and this week's weather before deciding. Could you tell me a bit more about what you're seeing in the field?`;
}

function mockCropHealthDiagnosis() {
  const options = [
    { disease: 'Leaf Blight (early stage)', confidence: 0.81, severity: 'Mild', treatment: 'Remove affected leaves, apply copper-based fungicide, improve field drainage to reduce leaf moisture.' },
    { disease: 'Nutrient Deficiency (Nitrogen)', confidence: 0.74, severity: 'Mild', treatment: 'Apply urea top-dressing in split doses; yellowing should reduce within 7-10 days.' },
    { disease: 'Aphid Infestation', confidence: 0.79, severity: 'Moderate', treatment: 'Spray 1% soap-water solution or neem-based bio-pesticide every 5 days; encourage ladybird beetles.' },
    { disease: 'Healthy — no disease detected', confidence: 0.88, severity: 'None', treatment: 'Crop looks healthy. Continue current watering and fertilization schedule.' },
  ];
  return options[Math.floor(Math.random() * options.length)];
}

function mockSoilAnalysis() {
  const levels = ['Low', 'Medium', 'High'];
  return {
    ph: Math.round((6.0 + Math.random() * 1.5) * 10) / 10,
    nitrogen: levels[Math.floor(Math.random() * 3)],
    phosphorus: levels[Math.floor(Math.random() * 3)],
    potassium: levels[Math.floor(Math.random() * 3)],
    organicMatter: Math.round((1 + Math.random() * 2) * 10) / 10,
    texture: 'Clay loam',
    summary: 'Extracted from your uploaded report (mock mode — set GEMINI_API_KEY for real document parsing). Overall soil health looks moderate; keep an eye on the flagged nutrients this season.',
  };
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function validateRegister(body) {
  if (!body.email || typeof body.email !== 'string' || !body.email.includes('@')) return 'A valid email is required';
  if (!body.password || typeof body.password !== 'string' || body.password.length < 6) return 'Password must be at least 6 characters';
  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) return 'Name is required';
  if (body.userType !== 'farmer' && body.userType !== 'customer') return 'userType must be "farmer" or "customer"';
  return null;
}

function validateListing(body) {
  if (!body.title || typeof body.title !== 'string' || !body.title.trim()) return 'title is required';
  if (!body.crop || typeof body.crop !== 'string' || !body.crop.trim()) return 'crop is required';
  const qty = Number(body.quantityKg);
  if (!Number.isFinite(qty) || qty <= 0) return 'quantityKg must be a positive number';
  const price = Number(body.pricePerKg);
  if (!Number.isFinite(price) || price <= 0) return 'pricePerKg must be a positive number';
  return null;
}

// ---------------------------------------------------------------------------
// Cart helpers
// ---------------------------------------------------------------------------

function getCartItems(db, userId) {
  const cart = db.carts[userId] || {};
  const items = [];
  for (const [productId, quantity] of Object.entries(cart)) {
    const product = db.marketplace.find((l) => l.id === productId);
    if (product && quantity > 0) items.push({ productId, quantity, product });
  }
  return items;
}

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

const routes = {
  // --- Auth ---------------------------------------------------------------
  'POST /api/auth/register': async (req, res, db) => {
    const body = await readBody(req);
    const err = validateRegister(body);
    if (err) return sendError(res, 400, err);
    if (db.users.some((u) => u.email.toLowerCase() === body.email.toLowerCase())) {
      return sendError(res, 409, 'An account with this email already exists');
    }
    const user = {
      id: `${body.userType}_${crypto.randomUUID().slice(0, 8)}`,
      email: body.email,
      passwordHash: hashPassword(body.password),
      userType: body.userType,
      name: body.name,
      phone: body.phone || '',
      state: body.state || '',
      district: body.district || '',
      village: body.village || '',
      pinCode: body.pinCode || '',
      preferredLanguage: body.preferredLanguage || 'en',
      landSizeAcres: body.userType === 'farmer' ? Number(body.landSizeAcres) || 0 : undefined,
      primaryCrop: body.userType === 'farmer' ? body.primaryCrop || '' : undefined,
      cropTypes: body.userType === 'farmer' ? (body.cropTypes || []) : undefined,
      address: body.userType === 'customer' ? body.address || '' : undefined,
      registeredAt: new Date().toISOString(),
    };
    db.users.push(user);
    if (user.userType === 'farmer') {
      db.soilReports[user.id] = defaultSoilReport();
    }
    const token = createSession(db, user.id);
    saveDb(db);
    sendJson(res, 201, { token, profile: sanitizeUser(user) });
  },

  'POST /api/auth/login': async (req, res, db) => {
    const body = await readBody(req);
    if (!body.email || !body.password) return sendError(res, 400, 'email and password are required');
    const user = db.users.find((u) => u.email.toLowerCase() === String(body.email).toLowerCase());
    if (!user || !verifyPassword(body.password, user.passwordHash)) {
      return sendError(res, 401, 'Invalid email or password');
    }
    const token = createSession(db, user.id);
    sendJson(res, 200, { token, profile: sanitizeUser(user) });
  },

  // --- Profile --------------------------------------------------------------
  'GET /api/profile': (req, res, db) => {
    const user = requireAuth(req, res, db);
    if (!user) return;
    sendJson(res, 200, sanitizeUser(user));
  },

  'POST /api/profile': async (req, res, db) => {
    const user = requireAuth(req, res, db);
    if (!user) return;
    const body = await readBody(req);
    delete body.id;
    delete body.email;
    delete body.passwordHash;
    delete body.userType;
    delete body.registeredAt;
    Object.assign(user, body);
    saveDb(db);
    sendJson(res, 200, sanitizeUser(user));
  },

  // --- Soil & crop recommendations -----------------------------------------
  'GET /api/soil': (req, res, db) => {
    const user = requireAuth(req, res, db);
    if (!user) return;
    if (!db.soilReports[user.id]) {
      db.soilReports[user.id] = defaultSoilReport();
      saveDb(db);
    }
    sendJson(res, 200, db.soilReports[user.id]);
  },

  'GET /api/crop-recommendations': (req, res, db) => {
    const user = requireAuth(req, res, db);
    if (!user) return;
    const soil = db.soilReports[user.id] || defaultSoilReport();
    sendJson(res, 200, computeCropRecommendations(soil));
  },

  'POST /api/soil/analyze': async (req, res, db) => {
    const user = requireAuth(req, res, db);
    if (!user) return;
    const body = await readBody(req);
    let result = null;
    let mode = 'mock';

    if (GEMINI_API_KEY && body.imageBase64) {
      try {
        const prompt = `Extract soil-test values from this soil report image/document. Respond ONLY with JSON:
{"ph": number, "nitrogen": "Low"|"Medium"|"High", "phosphorus": "Low"|"Medium"|"High", "potassium": "Low"|"Medium"|"High", "organicMatter": number, "texture": string, "summary": string (2-3 plain-language sentences for a farmer)}`;
        const text = await callGemini({ prompt, imageBase64: body.imageBase64, imageMimeType: body.imageMimeType, jsonOutput: true });
        result = JSON.parse(text);
        mode = 'gemini';
      } catch {
        result = null;
      }
    }
    if (!result) {
      result = mockSoilAnalysis();
      mode = 'mock';
    }

    const score = computeStrataScore(result);
    db.soilReports[user.id] = { ...result, score, lastUpdated: new Date().toISOString() };
    saveDb(db);
    sendJson(res, 200, { ...db.soilReports[user.id], mode });
  },

  // --- Crop health ----------------------------------------------------------
  'POST /api/crop-health/analyze': async (req, res, db) => {
    const user = getAuthedUser(req, db); // optional — works for guests too
    const body = await readBody(req);
    let result = null;
    let mode = 'mock';

    if (GEMINI_API_KEY && body.imageBase64) {
      try {
        const crop = user?.primaryCrop || 'a common Indian crop';
        const prompt = `You are a plant pathologist analyzing a crop photo for an Indian farmer growing ${crop}.
Respond ONLY with JSON: {"disease": string, "confidence": number (0-1), "severity": "None"|"Mild"|"Moderate"|"Severe", "treatment": string (2-3 practical sentences)}`;
        const text = await callGemini({ prompt, imageBase64: body.imageBase64, imageMimeType: body.imageMimeType, jsonOutput: true });
        result = JSON.parse(text);
        mode = 'gemini';
      } catch {
        result = null;
      }
    }
    if (!result) {
      result = mockCropHealthDiagnosis();
      mode = 'mock';
    }
    sendJson(res, 200, { ...result, mode });
  },

  // --- Weather ----------------------------------------------------------------
  'GET /api/weather': async (req, res, db, query) => {
    try {
      const place = query.get('village') || 'Chennai';
      const geo = await geocodeVillage(place);
      if (!geo) return sendJson(res, 200, { live: false, reason: 'Could not resolve location', ...mockWeather() });
      const weather = await fetchLiveWeather(geo.lat, geo.lon);
      sendJson(res, 200, { live: true, location: geo.resolvedName, ...weather });
    } catch (err) {
      sendJson(res, 200, { live: false, reason: String(err.message || err), ...mockWeather() });
    }
  },

  // --- Marketplace ------------------------------------------------------------
  'GET /api/marketplace': (req, res, db) => {
    sendJson(res, 200, db.marketplace);
  },

  'GET /api/marketplace/:id': (req, res, db, query, id) => {
    const listing = db.marketplace.find((l) => l.id === id);
    if (!listing) return sendError(res, 404, 'Listing not found');
    sendJson(res, 200, listing);
  },

  'POST /api/marketplace': async (req, res, db) => {
    const user = requireAuth(req, res, db);
    if (!user) return;
    if (user.userType !== 'farmer') return sendError(res, 403, 'Only farmer accounts can list produce');
    const body = await readBody(req);
    const err = validateListing(body);
    if (err) return sendError(res, 400, err);

    const listing = {
      id: `listing_${crypto.randomUUID().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
      farmerId: user.id,
      farmerName: user.name,
      location: `${user.village || user.district}, ${user.state}`,
      title: body.title,
      crop: body.crop,
      quantityKg: Number(body.quantityKg),
      pricePerKg: Number(body.pricePerKg),
      image: body.image || '',
      description: body.description || '',
      organic: Boolean(body.organic),
      rating: 4.8,
    };
    db.marketplace.unshift(listing);
    saveDb(db);
    sendJson(res, 201, listing);
  },

  // --- Cart ---------------------------------------------------------------
  'GET /api/cart': (req, res, db) => {
    const user = requireAuth(req, res, db);
    if (!user) return;
    sendJson(res, 200, getCartItems(db, user.id));
  },

  'POST /api/cart/add': async (req, res, db) => {
    const user = requireAuth(req, res, db);
    if (!user) return;
    const body = await readBody(req);
    const { productId, quantity } = body;
    if (!productId || typeof quantity !== 'number') return sendError(res, 400, 'productId and quantity are required');
    if (!db.marketplace.some((l) => l.id === productId)) return sendError(res, 404, 'Listing not found');

    if (!db.carts[user.id]) db.carts[user.id] = {};
    // `quantity` is a delta: positive to add units, negative to remove them.
    // The item is dropped once its total reaches zero or below.
    const current = db.carts[user.id][productId] || 0;
    const next = current + quantity;
    if (next <= 0) {
      delete db.carts[user.id][productId];
    } else {
      db.carts[user.id][productId] = next;
    }
    saveDb(db);
    sendJson(res, 200, getCartItems(db, user.id));
  },

  'POST /api/cart/remove': async (req, res, db) => {
    const user = requireAuth(req, res, db);
    if (!user) return;
    const body = await readBody(req);
    if (db.carts[user.id]) delete db.carts[user.id][body.productId];
    saveDb(db);
    sendJson(res, 200, getCartItems(db, user.id));
  },

  'POST /api/cart/clear': async (req, res, db) => {
    const user = requireAuth(req, res, db);
    if (!user) return;
    db.carts[user.id] = {};
    saveDb(db);
    sendJson(res, 200, []);
  },

  // --- Orders / checkout ----------------------------------------------------
  'POST /api/orders/checkout': async (req, res, db) => {
    const user = requireAuth(req, res, db);
    if (!user) return;
    const body = await readBody(req);
    if (!body.deliveryAddress || !String(body.deliveryAddress).trim()) {
      return sendError(res, 400, 'deliveryAddress is required');
    }
    const requestedItems = Array.isArray(body.items) ? body.items : [];
    if (requestedItems.length === 0) return sendError(res, 400, 'Cart is empty');

    const orderItems = [];
    for (const { productId, quantity } of requestedItems) {
      const listing = db.marketplace.find((l) => l.id === productId);
      if (!listing || !(quantity > 0)) continue;
      orderItems.push({
        productId,
        title: listing.title,
        pricePerKg: listing.pricePerKg,
        quantity,
        farmerId: listing.farmerId,
        farmerName: listing.farmerName,
      });
    }
    if (orderItems.length === 0) return sendError(res, 400, 'No valid items to order');

    const subtotal = orderItems.reduce((sum, i) => sum + i.pricePerKg * i.quantity, 0);
    const deliveryCharges = subtotal >= 500 ? 0 : 50;
    const order = {
      id: crypto.randomUUID().slice(0, 8).toUpperCase(),
      customerId: user.id,
      customerName: user.name,
      items: orderItems,
      totalPrice: subtotal + deliveryCharges,
      deliveryCharges,
      deliveryAddress: body.deliveryAddress,
      status: 'Confirmed',
      estimatedDelivery: new Date(Date.now() + 3 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
    };
    db.orders.push(order);
    db.carts[user.id] = {};
    db.notifications.push({
      id: crypto.randomUUID().slice(0, 8),
      userId: user.id,
      text: `Order #${order.id} placed successfully — total ₹${order.totalPrice}.`,
      type: 'order',
      read: false,
      createdAt: new Date().toISOString(),
    });
    saveDb(db);
    sendJson(res, 201, order);
  },

  'GET /api/orders': (req, res, db) => {
    const user = requireAuth(req, res, db);
    if (!user) return;
    const orders = db.orders
      .filter((o) => o.customerId === user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    sendJson(res, 200, orders);
  },

  // --- Notifications --------------------------------------------------------
  'GET /api/notifications': (req, res, db) => {
    const user = requireAuth(req, res, db);
    if (!user) return;
    const notifications = db.notifications
      .filter((n) => n.userId === user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    sendJson(res, 200, notifications);
  },

  'POST /api/notifications/read': async (req, res, db) => {
    const user = requireAuth(req, res, db);
    if (!user) return;
    const body = await readBody(req);
    const n = db.notifications.find((n) => n.id === body.id && n.userId === user.id);
    if (n) n.read = true;
    saveDb(db);
    sendJson(res, 200, { success: Boolean(n) });
  },

  // --- Government schemes -----------------------------------------------------
  'GET /api/schemes': (req, res, db) => {
    const user = getAuthedUser(req, db);
    const eligible = db.governmentSchemes.filter((s) => {
      const e = s.eligibility || {};
      if (!user) return false;
      if (e.maxLandSizeAcres != null && (user.landSizeAcres ?? 0) > e.maxLandSizeAcres) return false;
      if (e.states && user.state && !e.states.includes(user.state)) return false;
      return true;
    });
    sendJson(res, 200, { all: db.governmentSchemes, eligible });
  },

  // --- AI Farm Advisor chat ---------------------------------------------------
  'POST /api/advisor/chat': async (req, res, db) => {
    const user = getAuthedUser(req, db); // optional — advisor works for guests with generic advice
    const body = await readBody(req);
    if (!body.message || typeof body.message !== 'string' || !body.message.trim()) {
      return sendError(res, 400, 'message is required');
    }
    const profile = user || { landSizeAcres: null, primaryCrop: null, village: null, district: 'your area' };
    const soil = (user && db.soilReports[user.id]) || defaultSoilReport();
    const ctx = { profile, soil };
    let reply = null;
    let mode = 'mock';

    if (GEMINI_API_KEY) {
      try {
        const prompt = `You are AGRINOVA's AI farm advisor, speaking to a farmer.
Farmer profile: ${JSON.stringify(profile)}
Latest soil report: ${JSON.stringify(soil)}
Conversation history: ${JSON.stringify(body.history || [])}
Farmer's new message: "${body.message}"

Reply directly and practically, in 2-4 sentences, as their advisor. Do not repeat the profile data back verbatim.`;
        reply = await callGemini({ prompt });
        mode = 'gemini';
      } catch {
        reply = null;
      }
    }
    if (!reply) {
      reply = mockAdvisorReply(body.message, ctx);
      mode = 'mock';
    }
    sendJson(res, 200, { reply, mode });
  },
};

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

function matchRoute(method, pathname) {
  const key = `${method} ${pathname}`;
  if (routes[key]) return { handler: routes[key], params: [] };
  for (const routeKey of Object.keys(routes)) {
    const [routeMethod, routePath] = routeKey.split(' ');
    if (routeMethod !== method || !routePath.includes(':')) continue;
    const routeParts = routePath.split('/');
    const pathParts = pathname.split('/');
    if (routeParts.length !== pathParts.length) continue;
    const params = [];
    let ok = true;
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) params.push(pathParts[i]);
      else if (routeParts[i] !== pathParts[i]) { ok = false; break; }
    }
    if (ok) return { handler: routes[routeKey], params };
  }
  return null;
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    });
    return res.end();
  }

  const fullUrl = new URL(req.url, `http://${req.headers.host}`);
  const match = matchRoute(req.method, fullUrl.pathname);
  if (!match) return sendError(res, 404, `No route for ${req.method} ${fullUrl.pathname}`);

  const db = loadDb();
  try {
    await match.handler(req, res, db, fullUrl.searchParams, ...match.params);
  } catch (err) {
    console.error(err);
    sendError(res, 500, String(err.message || err));
  }
});

server.listen(PORT, () => {
  console.log(`AGRINOVA backend listening on http://localhost:${PORT}`);
  console.log(`AI features: ${GEMINI_API_KEY ? `LIVE (model: ${GEMINI_MODEL})` : 'MOCK (set GEMINI_API_KEY to enable Gemini)'}`);
  console.log(`Demo logins: farmer@agrinova.test / customer@agrinova.test — password "${DEMO_PASSWORD}"`);
});
