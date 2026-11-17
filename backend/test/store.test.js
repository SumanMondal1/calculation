import test from 'node:test';
import assert from 'node:assert/strict';

// These are integration tests against a real Postgres database (Supabase).
// They only run once DATABASE_URL is set (see backend/.env.example) - skip
// cleanly otherwise so `npm test` still passes before the database exists.
//
// There's no separate test database yet, so this runs against the same
// Supabase project the real app uses - every partner created here MUST be
// deleted again before the test ends (see the `cleanup` array below), or it
// permanently pollutes the live admin dashboard. This happened once
// already; don't let it happen again.
const hasDatabase = Boolean(process.env.DATABASE_URL);

test('store: delivery partner accounts and hisab submissions', { skip: !hasDatabase && 'DATABASE_URL not set - see backend/.env.example' }, async (t) => {
  const { initStore, createPartner, login, submitHisab, listSubmissions, deletePartnerForTests } = await import('../src/store.js');
  await initStore();

  const cleanup = [];
  t.after(async () => {
    await Promise.all(cleanup.map((id) => deletePartnerForTests(id)));
  });

  await t.test('admin can log in with the default seed credentials', async () => {
    const session = await login('admin', process.env.ADMIN_PASSWORD || 'admin123');
    assert.ok(session);
    assert.equal(session.role, 'admin');
  });

  await t.test('wrong password is rejected', async () => {
    assert.equal(await login('admin', 'wrong-password'), null);
  });

  await t.test('a created delivery partner can log in and submit a hisab the admin can then see', async () => {
    const uniqueUsername = `test_rahim_${Date.now()}`;
    const partner = await createPartner({ name: 'Rahim Uddin', username: uniqueUsername, password: 'secret123' });
    cleanup.push(partner.id);

    const session = await login(uniqueUsername, 'secret123');
    assert.ok(session);
    assert.equal(session.role, 'partner');
    assert.equal(session.partner.name, 'Rahim Uddin');

    const record = await submitHisab(partner.id, {
      date: '2026-11-17',
      openingStock: 50,
      deliveries: [
        { name: 'Agency A', quantity: 2, rate: 1100, cashReceived: 2200 },
        { name: 'Local Sale', quantity: 38, rate: 1000, cashReceived: 37800 },
      ],
      expenses: [{ label: 'Diesel', amount: 600 }],
      denominations: { 500: 90 },
    });

    // Agency cash 2200 + local 37800 - diesel 600 = 39400 expected; 90 x 500 notes counted = 45000 -> excess.
    assert.equal(record.result.netCashInHand, 39400);
    assert.equal(record.denominationTotal, 45000);
    assert.equal(record.status, 'excess');

    const mine = await listSubmissions(partner.id);
    assert.equal(mine.length, 1);
    assert.equal(mine[0].date, '2026-11-17');
  });

  await t.test('resubmitting the same partner + date replaces the earlier submission', async () => {
    const uniqueUsername = `test_second_${Date.now()}`;
    const partner = await createPartner({ name: 'Second Partner', username: uniqueUsername, password: 'secret123' });
    cleanup.push(partner.id);

    await submitHisab(partner.id, { date: '2026-11-17', openingStock: 10, deliveries: [{ name: 'Local Sale', quantity: 10, rate: 100, cashReceived: 1000 }], expenses: [] });
    await submitHisab(partner.id, { date: '2026-11-17', openingStock: 20, deliveries: [{ name: 'Local Sale', quantity: 20, rate: 100, cashReceived: 2000 }], expenses: [] });

    const mine = await listSubmissions(partner.id);
    assert.equal(mine.length, 1);
    assert.equal(mine[0].result.totalExpected, 2000);
  });
});
