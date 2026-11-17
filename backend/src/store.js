import crypto from 'node:crypto';
import pg from 'pg';
import { calculateHisab, calculateCashDenominationTotal } from './financialEngine.js';

const ADMIN_USERNAME = 'admin';

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = String(stored || '').split(':');
  if (!salt || !hash) return false;
  const hashBuf = Buffer.from(hash, 'hex');
  const candidateBuf = crypto.scryptSync(String(password), salt, 64);
  if (hashBuf.length !== candidateBuf.length) return false;
  return crypto.timingSafeEqual(hashBuf, candidateBuf);
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not set. Copy backend/.env.example to backend/.env and fill in your Supabase connection string.',
  );
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Partner accounts and submitted hisabs live in Postgres (Supabase free tier)
// so they survive restarts/deploys. Login sessions stay in memory - losing
// them just means logging back in, which is a fine tradeoff on a free host
// that can spin down after idle time.
const adminPasswordHash = hashPassword(process.env.ADMIN_PASSWORD || 'admin123');
const sessions = new Map();

function toPublicPartner(row) {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    createdAt: row.created_at,
  };
}

function toSubmission(row) {
  return {
    id: row.id,
    partnerId: row.partner_id,
    date: row.date instanceof Date ? row.date.toISOString().slice(0, 10) : row.date,
    payload: row.payload,
    result: row.result,
    denominationTotal: Number(row.denomination_total),
    shortExcess: Number(row.short_excess),
    status: row.status,
    submittedAt: row.submitted_at,
  };
}

export async function initStore() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS partners (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS submissions (
      id SERIAL PRIMARY KEY,
      partner_id INTEGER NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      payload JSONB NOT NULL,
      result JSONB NOT NULL,
      denomination_total NUMERIC NOT NULL,
      short_excess NUMERIC NOT NULL,
      status TEXT NOT NULL,
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (partner_id, date)
    );
  `);

  await seedDemoData();
}

async function seedDemoData() {
  const existing = await pool.query('SELECT id FROM partners WHERE username = $1', ['suresh']);
  if (existing.rows.length > 0) {
    return;
  }

  const demoPartner = await createPartner({ name: 'Suresh Kumar', username: 'suresh', password: 'partner123' });

  const isoDateDaysAgo = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().slice(0, 10);
  };

  await submitHisab(demoPartner.id, {
    date: isoDateDaysAgo(1),
    openingStock: 45,
    deliveries: [
      { name: 'Shree Balaji Gas Agency', quantity: 3, rate: 1100, cashReceived: 3300, onlineReceived: 0, shortCollected: 0 },
      { name: 'Annapurna Gas Suppliers', quantity: 8, rate: 1200, cashReceived: 9600, onlineReceived: 0, shortCollected: 0 },
      { name: 'Local Retail Sale', quantity: 34, rate: 1000, cashReceived: 33600, onlineReceived: 0, shortCollected: 400 },
    ],
    expenses: [
      { label: 'Diesel', amount: 550 },
      { label: 'Lunch', amount: 70 },
    ],
    denominations: { 500: 93 },
  });

  await submitHisab(demoPartner.id, {
    date: isoDateDaysAgo(0),
    openingStock: 50,
    deliveries: [
      { name: 'Shree Balaji Gas Agency', quantity: 2, rate: 1100, cashReceived: 2200, onlineReceived: 0, shortCollected: 0 },
      { name: 'Annapurna Gas Suppliers', quantity: 10, rate: 1200, cashReceived: 10000, onlineReceived: 2000, shortCollected: 0 },
      { name: 'Local Retail Sale', quantity: 38, rate: 1000, cashReceived: 37800, onlineReceived: 0, shortCollected: 200 },
    ],
    expenses: [
      { label: 'Diesel', amount: 600 },
      { label: 'Lunch', amount: 80 },
    ],
    denominations: { 500: 98, 100: 3, 20: 1 },
  });
}

export async function createPartner({ name, username, password } = {}) {
  const cleanName = String(name || '').trim();
  const cleanUsername = String(username || '').trim().toLowerCase();

  if (!cleanName || !cleanUsername || !password) {
    throw new Error('Name, username and password are all required');
  }
  if (cleanUsername === ADMIN_USERNAME) {
    throw new Error('That username is already taken');
  }

  try {
    const result = await pool.query(
      'INSERT INTO partners (name, username, password_hash) VALUES ($1, $2, $3) RETURNING *',
      [cleanName, cleanUsername, hashPassword(password)],
    );
    return toPublicPartner(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      throw new Error('That username is already taken');
    }
    throw err;
  }
}

export async function listPartners() {
  const result = await pool.query('SELECT * FROM partners ORDER BY name ASC');
  return result.rows.map(toPublicPartner);
}

export async function findPartnerById(id) {
  const result = await pool.query('SELECT * FROM partners WHERE id = $1', [Number(id)]);
  return result.rows[0] ? toPublicPartner(result.rows[0]) : null;
}

function createSession(session, partner) {
  const token = crypto.randomUUID();
  sessions.set(token, session);
  return { token, role: session.role, partner: partner || null };
}

export async function login(username, password) {
  const cleanUsername = String(username || '').trim().toLowerCase();

  if (cleanUsername === ADMIN_USERNAME && verifyPassword(password, adminPasswordHash)) {
    return createSession({ role: 'admin' });
  }

  const result = await pool.query('SELECT * FROM partners WHERE username = $1', [cleanUsername]);
  const partnerRow = result.rows[0];
  if (partnerRow && verifyPassword(password, partnerRow.password_hash)) {
    return createSession({ role: 'partner', partnerId: partnerRow.id }, toPublicPartner(partnerRow));
  }

  return null;
}

export function getSession(token) {
  return sessions.get(token) || null;
}

export function logout(token) {
  sessions.delete(token);
}

export async function submitHisab(partnerId, payload = {}) {
  const date = payload.date || new Date().toISOString().slice(0, 10);
  const result = calculateHisab(payload);
  const denominationTotal = calculateCashDenominationTotal(payload.denominations).totalPhysicalCash;
  const shortExcess = Math.round((denominationTotal - result.netCashInHand) * 100) / 100;
  const status = shortExcess === 0 ? 'balanced' : shortExcess > 0 ? 'excess' : 'short';

  // One hisab per partner per day - resubmitting the same day replaces it.
  const inserted = await pool.query(
    `INSERT INTO submissions (partner_id, date, payload, result, denomination_total, short_excess, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (partner_id, date) DO UPDATE SET
       payload = EXCLUDED.payload,
       result = EXCLUDED.result,
       denomination_total = EXCLUDED.denomination_total,
       short_excess = EXCLUDED.short_excess,
       status = EXCLUDED.status,
       submitted_at = now()
     RETURNING *`,
    [Number(partnerId), date, payload, result, denominationTotal, shortExcess, status],
  );

  return toSubmission(inserted.rows[0]);
}

export async function listSubmissions(partnerId) {
  const result = partnerId
    ? await pool.query('SELECT * FROM submissions WHERE partner_id = $1 ORDER BY date DESC', [Number(partnerId)])
    : await pool.query('SELECT * FROM submissions ORDER BY date DESC');
  return result.rows.map(toSubmission);
}
