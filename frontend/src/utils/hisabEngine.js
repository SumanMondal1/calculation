// Mirrors backend/src/financialEngine.js so the page updates instantly as the
// partner types, without a network round trip for every keystroke.

function roundToTwo(value) {
  return Number(Number(value || 0).toFixed(2));
}

function sum(numbers) {
  return numbers.reduce((total, value) => total + Number(value || 0), 0);
}

export function calculateHisab({ openingStock = 0, deliveries = [], expenses = [] }) {
  const rows = deliveries.map((row) => {
    const quantity = Number(row.quantity || 0);
    const rate = Number(row.rate || 0);
    const cashReceived = Number(row.cashReceived || 0);
    const onlineReceived = Number(row.onlineReceived || 0);
    const shortCollected = Number(row.shortCollected || 0);
    const expected = roundToTwo(quantity * rate);
    // Only cash is confirmed in hand - an online promise can't be verified by
    // the partner on the spot, so it stays part of "due" until confirmed.
    const collected = roundToTwo(cashReceived);
    const due = roundToTwo(expected - cashReceived - shortCollected);
    return { ...row, quantity, rate, expected, cashReceived, onlineReceived, shortCollected, collected, due };
  });

  const totalQuantity = sum(rows.map((r) => r.quantity));
  const totalExpected = roundToTwo(sum(rows.map((r) => r.expected)));
  const totalCash = roundToTwo(sum(rows.map((r) => r.cashReceived)));
  const totalOnline = roundToTwo(sum(rows.map((r) => r.onlineReceived)));
  const totalShort = roundToTwo(sum(rows.map((r) => r.shortCollected)));
  const totalCollected = roundToTwo(sum(rows.map((r) => r.collected)));
  const totalDue = roundToTwo(sum(rows.map((r) => r.due)));

  const totalExpenses = roundToTwo(sum(expenses.map((e) => e.amount)));

  const cylinderDifference = roundToTwo(Number(openingStock) - totalQuantity);
  const netCashInHand = roundToTwo(totalCash - totalExpenses);

  return {
    rows,
    cylindersDistributed: totalQuantity,
    cylinderDifference,
    cylinderStatus: cylinderDifference === 0 ? 'balanced' : cylinderDifference > 0 ? 'short' : 'excess',
    totalExpected,
    totalCash,
    totalOnline,
    totalShort,
    totalCollected,
    totalDue,
    totalExpenses,
    netCashInHand,
  };
}

export const DENOMINATION_VALUES = [500, 200, 100, 50, 20, 10, 5, 2, 1];
export const NOTE_VALUES = [500, 200, 100, 50, 20, 10];
export const COIN_VALUES = [5, 2, 1];

export function calculateCashDenominationTotal(denominations = {}) {
  const total = DENOMINATION_VALUES.reduce(
    (runningTotal, value) => runningTotal + value * Number(denominations[value] || 0),
    0,
  );
  return roundToTwo(total);
}
