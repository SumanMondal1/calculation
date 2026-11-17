const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

function formatCurrency(value) {
  return currencyFormatter.format(value || 0);
}

export default function HisabReport({ submission }) {
  const { result, payload, denominationTotal, shortExcess, status, submittedAt } = submission;

  return (
    <div className="glass-card report-card">
      <div className="report-head">
        <h3>Hisab for {submission.date}</h3>
        <span className={`status-pill ${status}`}>
          {status === 'balanced' && 'Balanced ✓'}
          {status === 'short' && `Short ${formatCurrency(Math.abs(shortExcess))}`}
          {status === 'excess' && `Excess ${formatCurrency(Math.abs(shortExcess))}`}
        </span>
      </div>

      <div className="report-block cylinder-strip">
        <span>Opening stock: <strong>{payload.openingStock}</strong></span>
        <span>Distributed: <strong>{result.cylindersDistributed}</strong></span>
        <span className={result.cylinderStatus !== 'balanced' ? 'warn' : ''}>
          {result.cylinderStatus === 'balanced'
            ? 'All accounted for ✓'
            : `${Math.abs(result.cylinderDifference)} ${result.cylinderStatus === 'short' ? 'unaccounted' : 'extra'}`}
        </span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Qty</th><th>Rate</th><th>Expected</th><th>Cash</th><th>Online</th><th>Shortage</th><th>Collected</th><th>Due</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row, i) => (
              <tr key={i}>
                <td>{row.name || '—'}</td>
                <td>{row.quantity}</td>
                <td>{formatCurrency(row.rate)}</td>
                <td className="muted-cell">{formatCurrency(row.expected)}</td>
                <td>{formatCurrency(row.cashReceived)}</td>
                <td>{formatCurrency(row.onlineReceived)}</td>
                <td>{formatCurrency(row.shortCollected)}</td>
                <td className="muted-cell">{formatCurrency(row.collected)}</td>
                <td className={row.due > 0 ? 'muted-cell warn' : 'muted-cell'}>{formatCurrency(row.due)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td><strong>Total</strong></td>
              <td><strong>{result.cylindersDistributed}</strong></td>
              <td></td>
              <td className="muted-cell"><strong>{formatCurrency(result.totalExpected)}</strong></td>
              <td><strong>{formatCurrency(result.totalCash)}</strong></td>
              <td><strong>{formatCurrency(result.totalOnline)}</strong></td>
              <td><strong>{formatCurrency(result.totalShort)}</strong></td>
              <td className="muted-cell"><strong>{formatCurrency(result.totalCollected)}</strong></td>
              <td className={result.totalDue > 0 ? 'muted-cell warn' : 'muted-cell'}><strong>{formatCurrency(result.totalDue)}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="report-grid">
        <div className="report-block">
          <h4>Expenses</h4>
          <ul className="plain-list">
            {(payload.expenses || []).map((e, i) => (
              <li key={i}>{e.label || 'Expense'}: {formatCurrency(e.amount)}</li>
            ))}
            {(!payload.expenses || payload.expenses.length === 0) && <li className="hint">None</li>}
          </ul>
          <p>Total: <strong>{formatCurrency(result.totalExpenses)}</strong></p>
        </div>

        <div className="report-block highlight">
          <h4>Cash</h4>
          <p>Online pending (unverified): <strong>{formatCurrency(result.totalOnline)}</strong></p>
          <p>Shortage (discount, not due): <strong>{formatCurrency(result.totalShort)}</strong></p>
          <p>Net cash expected: <strong>{formatCurrency(result.netCashInHand)}</strong></p>
          <p>Counted by partner: <strong>{formatCurrency(denominationTotal)}</strong></p>
        </div>
      </div>

      <p className="submitted-at">Submitted {new Date(submittedAt).toLocaleString()}</p>
    </div>
  );
}
