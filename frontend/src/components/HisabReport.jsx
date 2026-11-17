import { useLanguage } from '../i18n/LanguageContext';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

function formatCurrency(value) {
  return currencyFormatter.format(value || 0);
}

export default function HisabReport({ submission }) {
  const { t } = useLanguage();
  const { result, payload, denominationTotal, shortExcess, status, submittedAt } = submission;

  return (
    <div className="glass-card report-card">
      <div className="report-head">
        <h3>{t('hisabFor', { date: submission.date })}</h3>
        <span className={`status-pill ${status}`}>
          {status === 'balanced' && t('balanced')}
          {status === 'short' && t('short', { amount: formatCurrency(Math.abs(shortExcess)) })}
          {status === 'excess' && t('excess', { amount: formatCurrency(Math.abs(shortExcess)) })}
        </span>
      </div>

      <div className="report-block cylinder-strip">
        <span>{t('openingStockColon')} <strong>{payload.openingStock}</strong></span>
        <span>{t('distributedColon')} <strong>{result.cylindersDistributed}</strong></span>
        <span className={result.cylinderStatus !== 'balanced' ? 'warn' : ''}>
          {result.cylinderStatus === 'balanced'
            ? t('allAccountedForShort')
            : `${Math.abs(result.cylinderDifference)} ${result.cylinderStatus === 'short' ? t('unaccounted') : t('extra')}`}
        </span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t('agencyNameCol')}</th><th>{t('reportQty')}</th><th>{t('reportRate')}</th><th>{t('expected')}</th>
              <th>{t('reportCash')}</th><th>{t('reportOnline')}</th><th>{t('reportShortage')}</th><th>{t('collected')}</th><th>{t('reportDue')}</th>
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
              <td><strong>{t('reportTotal')}</strong></td>
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
          <h4>{t('expensesTitle')}</h4>
          <ul className="plain-list">
            {(payload.expenses || []).map((e, i) => (
              <li key={i}>{e.label || t('expensesRow')}: {formatCurrency(e.amount)}</li>
            ))}
            {(!payload.expenses || payload.expenses.length === 0) && <li className="hint">{t('noneLabel')}</li>}
          </ul>
          <p>{t('total')}: <strong>{formatCurrency(result.totalExpenses)}</strong></p>
        </div>

        <div className="report-block highlight">
          <h4>{t('cashSection')}</h4>
          <p>{t('onlinePendingUnverified')} <strong>{formatCurrency(result.totalOnline)}</strong></p>
          <p>{t('shortageDiscountNotDue')} <strong>{formatCurrency(result.totalShort)}</strong></p>
          <p>{t('netCashExpected')} <strong>{formatCurrency(result.netCashInHand)}</strong></p>
          <p>{t('countedByPartner')} <strong>{formatCurrency(denominationTotal)}</strong></p>
        </div>
      </div>

      <p className="submitted-at">{t('submittedAt', { datetime: new Date(submittedAt).toLocaleString() })}</p>
    </div>
  );
}
