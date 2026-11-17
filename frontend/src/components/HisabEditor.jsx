import { useMemo, useState } from 'react';
import { calculateHisab, calculateCashDenominationTotal, NOTE_VALUES, COIN_VALUES } from '../utils/hisabEngine';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

function formatCurrency(value) {
  return currencyFormatter.format(value || 0);
}

function nextId(rows) {
  return rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
}

function Card({ title, subtitle, children }) {
  return (
    <section className="glass-card card">
      <div className="card-head">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

// One unified table: every row - agency A, agency B, local retail sale - is
// the exact same shape. Qty x Rate = Expected. Only Cash counts as physically
// Collected today - an Online promise can't be verified on the spot, so it
// stays part of Due. Shortage is a permanent discount nobody will ever pay
// back, so it is subtracted out before Due is calculated, never added to it.
function DeliveriesSection({ rows, setRows }) {
  const updateRow = (id, field, value) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };
  const addRow = () => setRows((current) => [...current, { id: nextId(current), name: '', quantity: 0, rate: 0, cashReceived: 0, onlineReceived: 0, shortCollected: 0 }]);
  const removeRow = (id) => setRows((current) => current.filter((row) => row.id !== id));

  return (
    <Card title="📦 Deliveries & Sales" subtitle="Agency A, Agency B, Local Sale — every cylinder channel, same columns">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Qty</th><th>Rate</th><th>Expected</th><th>Cash</th><th>Online (Phone Pay)</th><th>Shortage</th><th>Collected</th><th>Due</th><th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const expected = Number(row.quantity || 0) * Number(row.rate || 0);
              const collected = Number(row.cashReceived || 0);
              const due = expected - collected - Number(row.shortCollected || 0);
              return (
                <tr key={row.id}>
                  <td><input placeholder="e.g. Agency A / Local Sale" value={row.name} onChange={(e) => updateRow(row.id, 'name', e.target.value)} /></td>
                  <td><input type="number" min="0" className="num-input" value={row.quantity} onChange={(e) => updateRow(row.id, 'quantity', Number(e.target.value))} /></td>
                  <td><input type="number" min="0" className="num-input" value={row.rate} onChange={(e) => updateRow(row.id, 'rate', Number(e.target.value))} /></td>
                  <td className="muted-cell">{formatCurrency(expected)}</td>
                  <td><input type="number" min="0" className="num-input" value={row.cashReceived} onChange={(e) => updateRow(row.id, 'cashReceived', Number(e.target.value))} /></td>
                  <td><input type="number" min="0" className="num-input" value={row.onlineReceived} onChange={(e) => updateRow(row.id, 'onlineReceived', Number(e.target.value))} /></td>
                  <td><input type="number" min="0" className="num-input" value={row.shortCollected} onChange={(e) => updateRow(row.id, 'shortCollected', Number(e.target.value))} /></td>
                  <td className="muted-cell">{formatCurrency(collected)}</td>
                  <td className={due > 0 ? 'muted-cell warn' : 'muted-cell'}>{formatCurrency(due)}</td>
                  <td><button type="button" className="icon-btn" onClick={() => removeRow(row.id)} aria-label="Remove row">✕</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button type="button" className="ghost-btn" onClick={addRow}>+ Add row (agency, dealer, local sale...)</button>
      <p className="hint mt-sm">
        <strong>Online</strong> is a promise that can't be verified on the spot, so it stays part of <strong>Due</strong> until confirmed.
        {' '}<strong>Shortage</strong> is a discount nobody will ever pay back, so it is never counted as Due.
      </p>
    </Card>
  );
}

function ExpensesSection({ expenses, setExpenses }) {
  const updateRow = (id, field, value) => setExpenses((current) => current.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  const addRow = () => setExpenses((current) => [...current, { id: nextId(current), label: '', amount: 0 }]);
  const removeRow = (id) => setExpenses((current) => current.filter((row) => row.id !== id));
  const total = expenses.reduce((sum, row) => sum + Number(row.amount || 0), 0);

  return (
    <Card title="🧾 Expenses" subtitle="Diesel, lunch, and other on-the-road costs">
      <div className="expense-rows">
        {expenses.map((row) => (
          <div className="expense-row" key={row.id}>
            <input placeholder="e.g. Diesel" value={row.label} onChange={(e) => updateRow(row.id, 'label', e.target.value)} />
            <input type="number" min="0" className="num-input" value={row.amount} onChange={(e) => updateRow(row.id, 'amount', Number(e.target.value))} />
            <button type="button" className="icon-btn" onClick={() => removeRow(row.id)} aria-label="Remove expense">✕</button>
          </div>
        ))}
        {expenses.length === 0 && <p className="hint">No expenses added yet.</p>}
      </div>
      <div className="row-between">
        <button type="button" className="ghost-btn" onClick={addRow}>+ Add expense</button>
        <span>Total: <strong>{formatCurrency(total)}</strong></span>
      </div>
    </Card>
  );
}

function DenominationSection({ denominations, setDenominations, netCashInHand }) {
  const update = (value, count) => setDenominations((current) => ({ ...current, [value]: count }));
  const total = calculateCashDenominationTotal(denominations);
  const diff = total - netCashInHand;
  const status = diff === 0 ? 'balanced' : diff > 0 ? 'excess' : 'short';

  return (
    <Card title="💵 Cash Denomination Count" subtitle="Count every note and coin handed over tonight">
      <p className="denom-group-label">Notes</p>
      <div className="denom-grid">
        {NOTE_VALUES.map((value) => (
          <label key={value} className="denom-cell">
            <span>₹{value}</span>
            <input type="number" min="0" value={denominations[value] || 0} onChange={(e) => update(value, Number(e.target.value))} />
            <small>{formatCurrency(value * Number(denominations[value] || 0))}</small>
          </label>
        ))}
      </div>
      <p className="denom-group-label">Coins</p>
      <div className="denom-grid">
        {COIN_VALUES.map((value) => (
          <label key={value} className="denom-cell">
            <span>₹{value}</span>
            <input type="number" min="0" value={denominations[value] || 0} onChange={(e) => update(value, Number(e.target.value))} />
            <small>{formatCurrency(value * Number(denominations[value] || 0))}</small>
          </label>
        ))}
      </div>
      <div className="denom-total">
        <span>Counted total: <strong>{formatCurrency(total)}</strong></span>
        <span className={`status-pill ${status}`}>
          {status === 'balanced' && 'Balanced ✓'}
          {status === 'short' && `Short by ${formatCurrency(Math.abs(diff))}`}
          {status === 'excess' && `Excess by ${formatCurrency(Math.abs(diff))}`}
        </span>
      </div>
    </Card>
  );
}

function SummarySidebar({ hisab, openingStock }) {
  return (
    <aside className="glass-card summary-panel">
      <h3>Today's Summary</h3>

      <div className="summary-block">
        <div className="summary-row"><span>Opening stock</span><strong>{openingStock} cylinders</strong></div>
        <div className="summary-row"><span>Distributed</span><strong>{hisab.cylindersDistributed} cylinders</strong></div>
        <span className={`status-pill small ${hisab.cylinderStatus}`}>
          {hisab.cylinderStatus === 'balanced' && 'All cylinders accounted for ✓'}
          {hisab.cylinderStatus === 'short' && `${hisab.cylinderDifference} cylinders unaccounted`}
          {hisab.cylinderStatus === 'excess' && `${Math.abs(hisab.cylinderDifference)} extra cylinders?`}
        </span>
      </div>

      <div className="summary-block">
        <div className="summary-row"><span>Total expected</span><strong>{formatCurrency(hisab.totalExpected)}</strong></div>
        <div className="summary-row"><span>Cash collected</span><strong>{formatCurrency(hisab.totalCash)}</strong></div>
        <div className="summary-row"><span>Online (Phone Pay/UPI) — unverified</span><strong>{formatCurrency(hisab.totalOnline)}</strong></div>
        {hisab.totalShort > 0 && (
          <div className="summary-row"><span>Shortage (discount, not due)</span><strong>{formatCurrency(hisab.totalShort)}</strong></div>
        )}
        {hisab.totalDue > 0 && (
          <div className="summary-row warn"><span>Due / pending</span><strong>{formatCurrency(hisab.totalDue)}</strong></div>
        )}
        <div className="summary-row"><span>Expenses</span><strong>-{formatCurrency(hisab.totalExpenses)}</strong></div>
      </div>

      <div className="summary-block highlight">
        <div className="summary-row"><span>Net cash to hand over</span></div>
        <div className="big-number">{formatCurrency(hisab.netCashInHand)}</div>
      </div>
    </aside>
  );
}

// A filled-in example so the form is never a wall of blank zeros - this is
// the exact "50 cylinders out of the godown" scenario the app is built around.
// Clear a field and type a real number over it; nothing here is locked.
const DEMO_DELIVERIES = [
  { id: 1, name: 'Shree Balaji Gas Agency', quantity: 2, rate: 1100, cashReceived: 2200, onlineReceived: 0, shortCollected: 0 },
  // Pays 10,000 cash now, promises 2,000 more on Phone Pay - unverified, so it's Due.
  { id: 2, name: 'Annapurna Gas Suppliers', quantity: 10, rate: 1200, cashReceived: 10000, onlineReceived: 2000, shortCollected: 0 },
  // Some customers paid 980 instead of 1000 - a 200 shortage (discount), not a due.
  { id: 3, name: 'Local Retail Sale', quantity: 38, rate: 1000, cashReceived: 37800, onlineReceived: 0, shortCollected: 200 },
];

const DEMO_EXPENSES = [
  { id: 1, label: 'Diesel', amount: 600 },
  { id: 2, label: 'Lunch', amount: 80 },
];

// 98 x 500 + 3 x 100 + 1 x 20 = 49320, matching the demo's net cash exactly.
const DEMO_DENOMINATIONS = { 500: 98, 200: 0, 100: 3, 50: 0, 20: 1, 10: 0, 5: 0, 2: 0, 1: 0 };

export default function HisabEditor({ onSubmit, submitting, lastSavedDate }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [openingStock, setOpeningStock] = useState(50);
  const [deliveries, setDeliveries] = useState(DEMO_DELIVERIES);
  const [expenses, setExpenses] = useState(DEMO_EXPENSES);
  const [denominations, setDenominations] = useState(DEMO_DENOMINATIONS);

  const hisab = useMemo(
    () => calculateHisab({ openingStock, deliveries, expenses }),
    [openingStock, deliveries, expenses],
  );

  const handleSubmit = () => {
    onSubmit({ date, openingStock, deliveries, expenses, denominations });
  };

  return (
    <>
      <div className="glass-card date-card">
        <label className="single-field">
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>

      <div className="hisab-layout">
        <main className="hisab-main">
          <Card title="🛢️ Opening Stock" subtitle="Cylinders taken out of the godown this morning">
            <label className="single-field">
              Cylinders taken
              <input type="number" min="0" value={openingStock} onChange={(e) => setOpeningStock(Number(e.target.value))} />
            </label>
          </Card>

          <DeliveriesSection rows={deliveries} setRows={setDeliveries} />
          <ExpensesSection expenses={expenses} setExpenses={setExpenses} />
          <DenominationSection denominations={denominations} setDenominations={setDenominations} netCashInHand={hisab.netCashInHand} />
        </main>

        <SummarySidebar hisab={hisab} openingStock={openingStock} />
      </div>

      <div className="glass-card submit-bar">
        <button className="primary-btn large" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Submitting…' : "Submit today's hisab"}
        </button>
        {lastSavedDate && <span className="submit-confirm">Saved for {lastSavedDate} ✓</span>}
      </div>
    </>
  );
}
