function roundToTwo(value) {
  return Number(Number(value || 0).toFixed(2));
}

function sum(numbers) {
  return numbers.reduce((total, value) => total + Number(value || 0), 0);
}

/**
 * Calculates a delivery partner's full day hisab from one unified list of
 * "where did the cylinders go" rows - agencies/dealers AND local retail sale
 * are all the same shape: a name, a quantity, a rate, and how that rate's
 * value came back - cash, online (PhonePe/UPI), a permanent shortage
 * (discount given that nobody will ever pay back), or still due.
 *
 * Only cash counts as physically "collected" today - an online transfer
 * promised by an agency can't be verified by the partner on the spot, so it
 * stays part of "due" until it's confirmed. A shortage is different from a
 * due: it is money that will never be collected from anyone (a discount
 * given to a customer), so it is tracked separately and does not count
 * against the agency/customer as outstanding.
 *
 * Plus the day's expenses (diesel, lunch, etc).
 *
 * It reconciles cylinders (did every cylinder taken out get accounted for?)
 * and cash (how much physical cash should the partner be carrying tonight?).
 */
export function calculateHisab({ openingStock = 0, deliveries = [], expenses = [] } = {}) {
  const rows = deliveries.map((row) => {
    const quantity = Number(row.quantity || 0);
    const rate = Number(row.rate || 0);
    const cashReceived = Number(row.cashReceived || 0);
    const onlineReceived = Number(row.onlineReceived || 0);
    const shortCollected = Number(row.shortCollected || 0);
    const expected = roundToTwo(quantity * rate);
    const collected = roundToTwo(cashReceived);
    const due = roundToTwo(expected - cashReceived - shortCollected);

    return {
      name: row.name || 'Untitled',
      quantity,
      rate,
      expected,
      cashReceived: roundToTwo(cashReceived),
      onlineReceived: roundToTwo(onlineReceived),
      shortCollected: roundToTwo(shortCollected),
      collected,
      due,
    };
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
    openingStock: Number(openingStock || 0),
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

/**
 * Totals up a physical cash count given as { denominationValue: count }.
 * Supports the common Indian currency notes and coins in circulation.
 */
export function calculateCashDenominationTotal(denominations = {}) {
  const values = {
    500: Number(denominations[500] || 0),
    200: Number(denominations[200] || 0),
    100: Number(denominations[100] || 0),
    50: Number(denominations[50] || 0),
    20: Number(denominations[20] || 0),
    10: Number(denominations[10] || 0),
    5: Number(denominations[5] || 0),
    2: Number(denominations[2] || 0),
    1: Number(denominations[1] || 0),
  };

  const total = Object.entries(values).reduce((runningTotal, [value, qty]) => runningTotal + Number(value) * Number(qty), 0);

  return {
    ...values,
    totalPhysicalCash: roundToTwo(total),
  };
}
