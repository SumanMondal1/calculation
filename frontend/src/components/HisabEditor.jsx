import { useEffect, useMemo, useState } from 'react';
import { calculateHisab, calculateCashDenominationTotal, NOTE_VALUES, COIN_VALUES } from '../utils/hisabEngine';
import { api } from '../api';
import { useLanguage } from '../i18n/LanguageContext';

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

// A controlled number input that eagerly converts '' to 0 on every keystroke
// makes it impossible to clear the field - backspacing to empty immediately
// snaps back to showing "0" before you can type a new number. Keeping '' as
// '' until there's a real digit lets the field empty out properly; every
// calculation already does Number(value || 0), so '' is still treated as 0
// everywhere it's used, nothing downstream needs to change.
function numericValue(rawValue) {
  return rawValue === '' ? '' : Number(rawValue);
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

// One unified table: every row - a saved agency, a one-off dealer, the local
// retail sale - is the exact same shape. Qty x Rate = Expected. Only Cash
// counts as physically Collected today - an Online promise can't be
// verified on the spot, so it stays part of Due. Shortage is a permanent
// discount nobody will ever pay back, so it is subtracted out before Due is
// calculated, never added to it.
function DeliveriesSection({ rows, setRows, agencies }) {
  const { t } = useLanguage();
  const updateRow = (id, field, value) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const handleNameChange = (id, value) => {
    setRows((current) => current.map((row) => {
      if (row.id !== id) return row;
      // Picked (or typed exactly) a known agency and haven't set a rate yet -
      // fill in their agreed rate automatically so it isn't typed twice.
      const match = agencies.find((a) => a.name.toLowerCase() === value.trim().toLowerCase());
      if (match && !row.rate) {
        return { ...row, name: value, rate: match.defaultRate };
      }
      return { ...row, name: value };
    }));
  };

  const addRow = () => setRows((current) => [...current, { id: nextId(current), name: '', quantity: 0, rate: 0, cashReceived: 0, onlineReceived: 0, shortCollected: 0 }]);
  const removeRow = (id) => setRows((current) => current.filter((row) => row.id !== id));

  return (
    <Card title={t('deliveriesTitle')} subtitle={t('deliveriesSubtitle')}>
      <datalist id="agency-options">
        {agencies.map((agency) => <option key={agency.id} value={agency.name} />)}
      </datalist>

      <div className="delivery-cards">
        {rows.map((row, index) => {
          const expected = Number(row.quantity || 0) * Number(row.rate || 0);
          const collected = Number(row.cashReceived || 0);
          const due = expected - collected - Number(row.shortCollected || 0);
          return (
            <div className="delivery-card" key={row.id}>
              <div className="delivery-card-head">
                <span className="delivery-card-index">{index + 1}</span>
                <input
                  className="delivery-name-input"
                  list="agency-options"
                  placeholder={t('agencyNamePlaceholder')}
                  value={row.name}
                  onChange={(e) => handleNameChange(row.id, e.target.value)}
                />
                <button type="button" className="icon-btn" onClick={() => removeRow(row.id)} aria-label="Remove row">✕</button>
              </div>

              <div className="field-grid">
                <label>{t('quantityLabel')}
                  <input type="number" min="0" value={row.quantity} onChange={(e) => updateRow(row.id, 'quantity', numericValue(e.target.value))} />
                </label>
                <label>{t('rateLabel')}
                  <input type="number" min="0" value={row.rate} onChange={(e) => updateRow(row.id, 'rate', numericValue(e.target.value))} />
                </label>
                <label>{t('cashReceivedLabel')}
                  <input type="number" min="0" value={row.cashReceived} onChange={(e) => updateRow(row.id, 'cashReceived', numericValue(e.target.value))} />
                </label>
                <label>{t('onlineReceivedLabel')}
                  <input type="number" min="0" value={row.onlineReceived} onChange={(e) => updateRow(row.id, 'onlineReceived', numericValue(e.target.value))} />
                </label>
                <label>{t('shortageLabel')}
                  <input type="number" min="0" value={row.shortCollected} onChange={(e) => updateRow(row.id, 'shortCollected', numericValue(e.target.value))} />
                </label>
              </div>

              <div className="delivery-card-summary">
                <span>{t('expected')}<strong>{formatCurrency(expected)}</strong></span>
                <span>{t('collected')}<strong>{formatCurrency(collected)}</strong></span>
                <span className={due > 0 ? 'warn' : ''}>{t('due')}<strong>{formatCurrency(due)}</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      <button type="button" className="ghost-btn" onClick={addRow}>{t('addDeliveryRow')}</button>
      {/* eslint-disable-next-line react/no-danger -- fixed app copy, not user input */}
      <p className="hint mt-sm" dangerouslySetInnerHTML={{ __html: t('deliveriesHint') }} />
    </Card>
  );
}

function ExpensesSection({ expenses, setExpenses }) {
  const { t } = useLanguage();
  const updateRow = (id, field, value) => setExpenses((current) => current.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  const addRow = () => setExpenses((current) => [...current, { id: nextId(current), label: '', amount: 0 }]);
  const removeRow = (id) => setExpenses((current) => current.filter((row) => row.id !== id));
  const total = expenses.reduce((sum, row) => sum + Number(row.amount || 0), 0);

  return (
    <Card title={t('expensesTitle')} subtitle={t('expensesSubtitle')}>
      <div className="expense-rows">
        {expenses.map((row) => (
          <div className="expense-row" key={row.id}>
            <input placeholder={t('expensePlaceholder')} value={row.label} onChange={(e) => updateRow(row.id, 'label', e.target.value)} />
            <input type="number" min="0" className="num-input" value={row.amount} onChange={(e) => updateRow(row.id, 'amount', numericValue(e.target.value))} />
            <button type="button" className="icon-btn" onClick={() => removeRow(row.id)} aria-label="Remove expense">✕</button>
          </div>
        ))}
        {expenses.length === 0 && <p className="hint">{t('noExpensesYet')}</p>}
      </div>
      <div className="row-between">
        <button type="button" className="ghost-btn" onClick={addRow}>{t('addExpense')}</button>
        <span>{t('total')}: <strong>{formatCurrency(total)}</strong></span>
      </div>
    </Card>
  );
}

function DenominationSection({ denominations, setDenominations, netCashInHand }) {
  const { t } = useLanguage();
  const update = (value, rawCount) => setDenominations((current) => ({ ...current, [value]: numericValue(rawCount) }));
  const total = calculateCashDenominationTotal(denominations);
  const diff = total - netCashInHand;
  const status = diff === 0 ? 'balanced' : diff > 0 ? 'excess' : 'short';

  return (
    <Card title={t('denominationTitle')} subtitle={t('denominationSubtitle')}>
      <p className="denom-group-label">{t('notes')}</p>
      <div className="denom-grid">
        {NOTE_VALUES.map((value) => (
          <label key={value} className="denom-cell">
            <span>₹{value}</span>
            <input type="number" min="0" value={denominations[value]} onChange={(e) => update(value, e.target.value)} />
            <small>{formatCurrency(value * Number(denominations[value] || 0))}</small>
          </label>
        ))}
      </div>
      <p className="denom-group-label">{t('coins')}</p>
      <div className="denom-grid">
        {COIN_VALUES.map((value) => (
          <label key={value} className="denom-cell">
            <span>₹{value}</span>
            <input type="number" min="0" value={denominations[value]} onChange={(e) => update(value, e.target.value)} />
            <small>{formatCurrency(value * Number(denominations[value] || 0))}</small>
          </label>
        ))}
      </div>
      <div className="denom-total">
        <span>{t('countedTotal')}: <strong>{formatCurrency(total)}</strong></span>
        <span className={`status-pill ${status}`}>
          {status === 'balanced' && t('balanced')}
          {status === 'short' && t('shortBy', { amount: formatCurrency(Math.abs(diff)) })}
          {status === 'excess' && t('excessBy', { amount: formatCurrency(Math.abs(diff)) })}
        </span>
      </div>
    </Card>
  );
}

function SummarySidebar({ hisab, openingStock }) {
  const { t } = useLanguage();
  return (
    <aside className="glass-card summary-panel">
      <h3>{t('todaysSummary')}</h3>

      <div className="summary-block">
        <div className="summary-row"><span>{t('openingStockRow')}</span><strong>{openingStock} {t('cylinders')}</strong></div>
        <div className="summary-row"><span>{t('distributed')}</span><strong>{hisab.cylindersDistributed} {t('cylinders')}</strong></div>
        <span className={`status-pill small ${hisab.cylinderStatus}`}>
          {hisab.cylinderStatus === 'balanced' && t('allAccountedFor')}
          {hisab.cylinderStatus === 'short' && t('cylindersUnaccounted', { count: hisab.cylinderDifference })}
          {hisab.cylinderStatus === 'excess' && t('extraCylinders', { count: Math.abs(hisab.cylinderDifference) })}
        </span>
      </div>

      <div className="summary-block">
        <div className="summary-row"><span>{t('totalExpected')}</span><strong>{formatCurrency(hisab.totalExpected)}</strong></div>
        <div className="summary-row"><span>{t('cashCollected')}</span><strong>{formatCurrency(hisab.totalCash)}</strong></div>
        <div className="summary-row"><span>{t('onlineUnverified')}</span><strong>{formatCurrency(hisab.totalOnline)}</strong></div>
        {hisab.totalShort > 0 && (
          <div className="summary-row"><span>{t('shortageNotDue')}</span><strong>{formatCurrency(hisab.totalShort)}</strong></div>
        )}
        {hisab.totalDue > 0 && (
          <div className="summary-row warn"><span>{t('duePending')}</span><strong>{formatCurrency(hisab.totalDue)}</strong></div>
        )}
        <div className="summary-row"><span>{t('expensesRow')}</span><strong>-{formatCurrency(hisab.totalExpenses)}</strong></div>
      </div>

      <div className="summary-block highlight">
        <div className="summary-row"><span>{t('netCashToHandOver')}</span></div>
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

export default function HisabEditor({ token, onSubmit, submitting, lastSavedDate }) {
  const { t } = useLanguage();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [openingStock, setOpeningStock] = useState(50);
  const [deliveries, setDeliveries] = useState(DEMO_DELIVERIES);
  const [expenses, setExpenses] = useState(DEMO_EXPENSES);
  const [denominations, setDenominations] = useState(DEMO_DENOMINATIONS);
  const [agencies, setAgencies] = useState([]);

  useEffect(() => {
    api.listAgencies(token).then(setAgencies).catch(() => {});
  }, [token]);

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
          {t('date')}
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>

      <div className="hisab-layout">
        <main className="hisab-main">
          <Card title={t('openingStockTitle')} subtitle={t('openingStockSubtitle')}>
            <label className="single-field">
              {t('cylindersTaken')}
              <input type="number" min="0" value={openingStock} onChange={(e) => setOpeningStock(numericValue(e.target.value))} />
            </label>
          </Card>

          <DeliveriesSection rows={deliveries} setRows={setDeliveries} agencies={agencies} />
          <ExpensesSection expenses={expenses} setExpenses={setExpenses} />
          <DenominationSection denominations={denominations} setDenominations={setDenominations} netCashInHand={hisab.netCashInHand} />
        </main>

        <SummarySidebar hisab={hisab} openingStock={openingStock} />
      </div>

      <div className="glass-card submit-bar">
        <button className="primary-btn large" onClick={handleSubmit} disabled={submitting}>
          {submitting ? t('submitting') : t('submitHisab')}
        </button>
        {lastSavedDate && <span className="submit-confirm">{t('savedFor', { date: lastSavedDate })}</span>}
      </div>
    </>
  );
}
