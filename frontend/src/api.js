// Deployed on Render, backed by Supabase Postgres - works from any network,
// any location, not tied to this PC or any particular Wi-Fi.
const BASE_URL = 'https://calculation-w6of.onrender.com';

async function request(path, { method = 'GET', token, body } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
}

export const api = {
  login: (username, password) => request('/api/auth/login', { method: 'POST', body: { username, password } }),
  logout: (token) => request('/api/auth/logout', { method: 'POST', token }),
  listPartners: (token) => request('/api/partners', { token }),
  createPartner: (token, data) => request('/api/partners', { method: 'POST', token, body: data }),
  partnerSubmissions: (token, partnerId) => request(`/api/partners/${partnerId}/submissions`, { token }),
  submitHisab: (token, payload) => request('/api/hisab/submit', { method: 'POST', token, body: payload }),
  mySubmissions: (token) => request('/api/hisab/mine', { token }),
};
