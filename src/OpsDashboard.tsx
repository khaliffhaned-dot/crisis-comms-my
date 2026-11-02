import './ops-dashboard.css'

type Lang = 'bm' | 'en'

type SeverityData = Record<
  1 | 2 | 3 | 4,
  { en: string; bm: string; actionEn: string; actionBm: string }
>

type Scenario = { id: string; label: string }

type LogEntry = { id: number; time: string; text: string }

type Client = { id: string; name: string; short: string; market: string }

interface OpsDashboardProps {
  lang: Lang
  t: (en: string, bm: string) => string
  client: Client
  severity: 1 | 2 | 3 | 4 | null
  checked: boolean[]
  statement: string
  scenario: string
  log: LogEntry[]
  severityData: SeverityData
  scenarios: { en: Scenario[]; bm: Scenario[] }
  onGoSeverity: () => void
  onGoStatements: () => void
}

export default function OpsDashboard({
  lang,
  t,
  client,
  severity,
  checked,
  statement,
  scenario,
  log,
  severityData,
  scenarios,
  onGoSeverity,
  onGoStatements,
}: OpsDashboardProps) {
  const done = checked.filter(Boolean).length
  return (
    <div className="ops-dashboard">
      <div className="ops-dashboard__top">
        <div className="ops-dashboard__title-block">
          <div className="ops-status-row">
            <span
              className={`ops-status-pill ${
                severity && severity >= 3 ? 'critical' : severity && severity >= 2 ? 'elevated' : 'idle'
              }`}
            >
              {severity
                ? t(`Active · Level ${severity}`, `Aktif · Tahap ${severity}`)
                : t('Standby', 'Sedia')}
            </span>
            <span className="ops-clock">
              {new Date().toLocaleString('en-MY', { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          </div>
          <h2>{t('Incident command dashboard', 'Papan pemuka perintah insiden')}</h2>
          <p className="ops-context">
            {t(
              `Client: ${client.name} · ${client.market}`,
              `Klien: ${client.name} · ${client.market}`
            )}
          </p>
        </div>
        <div className="ops-quick-actions">
          <button type="button" className="btn btn-saffron" onClick={onGoSeverity}>
            {t('Set severity', 'Tetapkan keterukan')}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onGoStatements}>
            {t('Draft statement', 'Gubal kenyataan')}
          </button>
        </div>
      </div>

      <div className="ops-kpi-grid">
        <div className={`ops-kpi ${severity ? 'has-value' : ''}`}>
          <div className="ops-kpi__label">{t('Severity', 'Keterukan')}</div>
          <div className="ops-kpi__value">
            {severity ? (
              <span className={`sev-badge sev-${severity}`}>L{severity}</span>
            ) : (
              <span className="ops-kpi__empty">—</span>
            )}
          </div>
          <div className="ops-kpi__meta">
            {severity
              ? lang === 'bm'
                ? severityData[severity].bm.replace(/^Tahap \d+ – /, '')
                : severityData[severity].en.replace(/^Level \d+ – /, '')
              : t('Not assessed', 'Belum dinilai')}
          </div>
        </div>

        <div className="ops-kpi">
          <div className="ops-kpi__label">{t('First 60 min', '60 min pertama')}</div>
          <div className="ops-kpi__value">
            {done}
            <span className="ops-kpi__denom">/9</span>
          </div>
          <div className="ops-kpi__bar">
            <div className="ops-kpi__bar-fill" style={{ width: `${(done / 9) * 100}%` }} />
          </div>
          <div className="ops-kpi__meta">
            {done === 9
              ? t('Checklist complete', 'Senarai lengkap')
              : t('In progress', 'Dalam proses')}
          </div>
        </div>

        <div className="ops-kpi">
          <div className="ops-kpi__label">{t('Statement', 'Kenyataan')}</div>
          <div className="ops-kpi__value ops-kpi__value--sm">
            {statement ? t('Draft ready', 'Draf sedia') : t('None', 'Tiada')}
          </div>
          <div className="ops-kpi__meta">
            {scenarios[lang].find((s) => s.id === scenario)?.label}
          </div>
        </div>

        <div className="ops-kpi">
          <div className="ops-kpi__label">{t('Decisions logged', 'Keputusan direkod')}</div>
          <div className="ops-kpi__value">{log.length}</div>
          <div className="ops-kpi__meta">
            {log.length
              ? t(`Last: ${log[0].time}`, `Terakhir: ${log[0].time}`)
              : t('No entries yet', 'Belum ada entri')}
          </div>
        </div>
      </div>

      <div className="ops-panels">
        <div className="ops-panel">
          <div className="ops-panel__head">
            <h3>{t('Recommended next steps', 'Langkah seterusnya')}</h3>
          </div>
          <ul className="ops-next-list">
            {!severity && (
              <li>
                <span className="ops-step-num">1</span>
                {t('Assess and set severity level', 'Nilai dan tetapkan tahap keterukan')}
              </li>
            )}
            {severity && severity >= 3 && (
              <li>
                <span className="ops-step-num">!</span>
                {t('Notify Board and assess Bursa disclosure', 'Maklumkan Lembaga dan nilai pendedahan Bursa')}
              </li>
            )}
            <li>
              <span className="ops-step-num">2</span>
              {t('Work through the first-hour checklist', 'Kerjakan senarai semak sejam pertama')}
            </li>
            <li>
              <span className="ops-step-num">3</span>
              {t('Generate and clear a holding statement', 'Jana dan luluskan kenyataan awal')}
            </li>
            <li>
              <span className="ops-step-num">4</span>
              {t('Keep the decision log current', 'Pastikan log keputusan terkini')}
            </li>
          </ul>
        </div>

        <div className="ops-panel">
          <div className="ops-panel__head">
            <h3>{t('Activity feed', 'Suapan aktiviti')}</h3>
          </div>
          {log.length === 0 ? (
            <p className="ops-feed-empty">
              {t(
                'Actions you take will appear here with timestamps.',
                'Tindakan anda akan dipaparkan di sini dengan cap masa.'
              )}
            </p>
          ) : (
            <ul className="ops-feed">
              {log.slice(0, 5).map((entry) => (
                <li key={entry.id}>
                  <span className="ops-feed-time">{entry.time}</span>
                  <span className="ops-feed-text">{entry.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
