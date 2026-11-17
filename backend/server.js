import express from 'express';
import cors from 'cors';
import { calculateHisab } from './src/financialEngine.js';
import {
  initStore,
  createPartner,
  listPartners,
  findPartnerById,
  createAgency,
  listAgencies,
  login,
  getSession,
  logout,
  submitHisab,
  listSubmissions,
} from './src/store.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const session = token ? getSession(token) : null;

  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  req.session = session;
  req.token = token;
  next();
}

function requireAdmin(req, res, next) {
  if (req.session.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

function requirePartner(req, res, next) {
  if (req.session.role !== 'partner') {
    return res.status(403).json({ error: 'Delivery partner access required' });
  }
  next();
}

// Any unexpected error in an async route handler below lands here instead of
// crashing the process or hanging the request.
function asyncRoute(handler) {
  return (req, res, next) => handler(req, res, next).catch(next);
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'gas-agency-api' });
});

app.post('/api/auth/login', asyncRoute(async (req, res) => {
  const { username, password } = req.body || {};
  const session = await login(username, password);
  if (!session) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  res.json(session);
}));

app.post('/api/auth/logout', authenticate, (req, res) => {
  logout(req.token);
  res.json({ status: 'ok' });
});

// Admin: manage delivery partner accounts.
app.get('/api/partners', authenticate, requireAdmin, asyncRoute(async (req, res) => {
  res.json(await listPartners());
}));

app.post('/api/partners', authenticate, requireAdmin, asyncRoute(async (req, res) => {
  try {
    const partner = await createPartner(req.body || {});
    res.status(201).json(partner);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}));

app.get('/api/partners/:id/submissions', authenticate, requireAdmin, asyncRoute(async (req, res) => {
  const partner = await findPartnerById(req.params.id);
  if (!partner) {
    return res.status(404).json({ error: 'Partner not found' });
  }
  res.json(await listSubmissions(partner.id));
}));

// Agencies: a master list admin maintains so partners pick a known agency
// (with its agreed rate) instead of free-typing a name every time.
app.get('/api/agencies', authenticate, asyncRoute(async (req, res) => {
  res.json(await listAgencies());
}));

app.post('/api/agencies', authenticate, requireAdmin, asyncRoute(async (req, res) => {
  try {
    const agency = await createAgency(req.body || {});
    res.status(201).json(agency);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}));

// Delivery partner: calculate + submit the day's hisab.
app.post('/api/hisab/preview', authenticate, (req, res) => {
  res.json(calculateHisab(req.body || {}));
});

app.post('/api/hisab/submit', authenticate, requirePartner, asyncRoute(async (req, res) => {
  const record = await submitHisab(req.session.partnerId, req.body || {});
  res.status(201).json(record);
}));

app.get('/api/hisab/mine', authenticate, requirePartner, asyncRoute(async (req, res) => {
  res.json(await listSubmissions(req.session.partnerId));
}));

async function main() {
  await initStore();
  app.listen(PORT, () => {
    console.log(`Gas agency API running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
