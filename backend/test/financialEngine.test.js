import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateHisab, calculateCashDenominationTotal } from '../src/financialEngine.js';

test('calculateHisab reconciles a full delivery partner day', () => {
  // 50 cylinders out of the godown: 2 to Agency A, 10 to Agency B, 38 sold locally.
  // Agencies and local sale are all the same kind of row - name, qty, rate, cash, online, shortage.
  const result = calculateHisab({
    openingStock: 50,
    deliveries: [
      { name: 'Agency A', quantity: 2, rate: 1100, cashReceived: 2200, onlineReceived: 0, shortCollected: 0 },
      // Agency B pays 10000 cash now and promises 2000 more on PhonePe - that promise
      // can't be verified on the spot, so it is NOT "collected" yet, it stays due.
      { name: 'Agency B', quantity: 10, rate: 1200, cashReceived: 10000, onlineReceived: 2000, shortCollected: 0 },
      // Local sale: some customers paid 980 instead of 1000 - that 200 gap is a
      // permanent discount (a "shortage"), nobody owes it, so it is NOT due.
      { name: 'Local Sale', quantity: 38, rate: 1000, cashReceived: 37800, onlineReceived: 0, shortCollected: 200 },
    ],
    expenses: [
      { label: 'Diesel', amount: 600 },
      { label: 'Lunch', amount: 80 },
    ],
  });

  // Cylinders: 2 + 10 + 38 = 50, matches the opening stock exactly.
  assert.equal(result.cylindersDistributed, 50);
  assert.equal(result.cylinderDifference, 0);
  assert.equal(result.cylinderStatus, 'balanced');

  // Agency A: 2 x 1100 = 2200, fully paid in cash, nothing due.
  assert.equal(result.rows[0].expected, 2200);
  assert.equal(result.rows[0].collected, 2200);
  assert.equal(result.rows[0].due, 0);

  // Agency B: 10 x 1200 = 12000. Only the 10000 cash counts as collected -
  // the 2000 online promise is unverified, so it shows up as due, not collected.
  assert.equal(result.rows[1].expected, 12000);
  assert.equal(result.rows[1].collected, 10000);
  assert.equal(result.rows[1].due, 2000);

  // Local sale: 38 x 1000 = 38000 expected, 37800 collected in cash, 200 written
  // off as shortage - so due is 0, that 200 is a loss, not an outstanding balance.
  assert.equal(result.rows[2].expected, 38000);
  assert.equal(result.rows[2].collected, 37800);
  assert.equal(result.rows[2].due, 0);

  assert.equal(result.totalExpected, 52200);
  assert.equal(result.totalCash, 50000);
  assert.equal(result.totalOnline, 2000);
  assert.equal(result.totalShort, 200);
  assert.equal(result.totalCollected, 50000);
  assert.equal(result.totalDue, 2000);

  // Diesel 600 + lunch 80 = 680 expenses.
  assert.equal(result.totalExpenses, 680);

  // Cash in hand tonight: cash actually collected (50000) - expenses (680).
  assert.equal(result.netCashInHand, 49320);
});

test('calculateHisab flags a cylinder mismatch when counts do not add up', () => {
  const result = calculateHisab({
    openingStock: 50,
    deliveries: [
      { name: 'Agency A', quantity: 2, rate: 1100, cashReceived: 2200 },
      { name: 'Local Sale', quantity: 38, rate: 1000, cashReceived: 38000 },
    ],
    expenses: [],
  });

  // 2 + 38 = 40, but 50 left the godown - 10 cylinders are unaccounted for.
  assert.equal(result.cylindersDistributed, 40);
  assert.equal(result.cylinderDifference, 10);
  assert.equal(result.cylinderStatus, 'short');
});

test('calculateCashDenominationTotal aggregates a cash count', () => {
  const result = calculateCashDenominationTotal({
    500: 2,
    200: 4,
    100: 1,
    50: 3,
    20: 2,
  });

  assert.equal(result.totalPhysicalCash, 2090);
});
