import { useState } from 'react'
import type { Incident, Lang } from './types'
import {
  assessIncident,
  assessIncidentLocal,
  hasApiBase,
  type AssessResult,
} from './intelligenceApi'

interface Props {
  lang: Lang
  incidents: Incident[]
  activeId: string | null
  backend: string
  onOpen: (id: string) => void
  onCreate: () => void
  onGo: (section: string) => void
  onApplySeverity?: (level: 1 | 2 | 3 | 4) => void
}

export default function CommandCentre({
  lang,
  incidents,
  activeId,
  backend,
  onOpen,
  onCreate,
  onGo,
  onApplySeverity,
}: Props) {
  const t = (en: string, bm: string) => (lang === 'bm' ? bm : en)
  const open = incidents.filter((i) => i.status !== 'closed')
  const critical = open.filter((i) => i.severity && i.severity >= 3).length
  const active = incidents.find((i) => i.id === activeId) || open[0]

  const [facts, setFacts] = useState(
    active?.title
      ? `${active.title}. Listed company context.`
      : 'Product recall. Three customers affected. National media not involved. Bursa-listed company.'
  )
  const [bursaListed, setBursaListed] = useState(true)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AssessResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runAssess = async () => {
    setLoading(true)
    setError(null)
    try {
      if (hasApiBase()) {
        const r = await assessIncident({ facts, bursaListed })
        setResult(r)
      } else {
        setResult(assessIncidentLocal(facts, bursaListed))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Assess failed')
      setResult(assessIncidentLocal(facts, bursaListed))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="core-command">
      <div className="core-command__top">
        <div>
          <h2>{t('Command Centre', 'Pusat Perintah')}</h2>
          <p className="core-muted">
            {t('Active incidents · readiness · executive view', 'Insiden aktif · kesediaan · paparan eksekutif')}
            {' · '}
            <span className="mono">{backend}</span>
            {hasApiBase() ? (
              <span className="backend-pill api"> API</span>
            ) : (
              <span className="backend-pill"> local assess</span>
            )}
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={onCreate}>
          {t('New incident', 'Insiden baharu')}
        </button>
      </div>

      <div className="core-kpi">
        <div className="core-kpi__card">
          <span className="lbl">{t('Open', 'Terbuka')}</span>
          <span className="val">{open.length}</span>
        </div>
        <div className="core-kpi__card warn">
          <span className="lbl">{t('L3+ Material', 'T3+ Material')}</span>
          <span className="val">{critical}</span>
        </div>
        <div className="core-kpi__card">
          <span className="lbl">{t('Active severity', 'Keterukan aktif')}</span>
          <span className="val">{active?.severity ? `L${active.severity}` : '—'}</span>
        </div>
        <div className="core-kpi__card">
          <span className="lbl">{t('First 60 progress', 'Kemajuan 60 min')}</span>
          <span className="val">
            {active ? `${active.checked.filter(Boolean).length}/${active.checked.length}` : '—'}
          </span>
        </div>
      </div>

      {/* Decision Intelligence */}
      <div className="core-panel intel-panel">
        <div className="core-panel__head">
          <h3>{t('Decision Intelligence', 'Kepintaran Keputusan')}</h3>
          <span className="module-card__badge">{t('Recommend only', 'Cadangan sahaja')}</span>
        </div>
        <p className="core-muted" style={{ marginBottom: '0.75rem' }}>
          {t(
            'What should leadership do next? Recommendations require Quorum before any external action.',
            'Apa yang perlu dilakukan kepimpinan seterusnya? Cadangan memerlukan Kuorum sebelum sebarang tindakan luaran.'
          )}
        </p>
        <div className="form-row">
          <label>{t('Incident facts', 'Fakta insiden')}</label>
          <textarea
            rows={3}
            value={facts}
            onChange={(e) => setFacts(e.target.value)}
            placeholder={t('Describe what is known…', 'Terangkan apa yang diketahui…')}
          />
        </div>
        <label className="intel-check">
          <input type="checkbox" checked={bursaListed} onChange={(e) => setBursaListed(e.target.checked)} />
          {t('Bursa-listed company', 'Syarikat tersenarai Bursa')}
        </label>
        <div className="btn-row" style={{ marginTop: '0.75rem' }}>
          <button type="button" className="btn btn-primary" disabled={loading || !facts.trim()} onClick={runAssess}>
            {loading
              ? t('Assessing…', 'Menilai…')
              : t('Run assessment', 'Jalankan penilaian')}
          </button>
        </div>
        {error && (
          <p className="core-muted" style={{ color: '#b91c1c', marginTop: '0.5rem' }}>
            {error} — {t('showing local fallback', 'paparan sandaran tempatan')}
          </p>
        )}
        {result && (
          <div className="intel-result">
            <div className="intel-result__meta">
              <span className="intel-sev">L{result.severity}</span>
              <span>
                {t('Confidence', 'Keyakinan')} {result.confidence}%
              </span>
              <span>
                {t('Regulatory risk', 'Risiko kawal selia')}: {result.regulatory_risk}
              </span>
              <span className="mono">{result.source}</span>
            </div>
            <p className="core-muted">{result.rationale}</p>
            <ol className="intel-actions">
              {result.first_actions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ol>
            <p className="stmt-hint">{result.disclaimer}</p>
            {onApplySeverity && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onApplySeverity(result.severity)}
              >
                {t(`Apply L${result.severity} to active incident`, `Guna L${result.severity} pada insiden aktif`)}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="core-panel">
        <div className="core-panel__head">
          <h3>{t('Active incidents', 'Insiden aktif')}</h3>
        </div>
        {open.length === 0 ? (
          <p className="core-muted">{t('No open incidents.', 'Tiada insiden terbuka.')}</p>
        ) : (
          <table className="core-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>{t('Title', 'Tajuk')}</th>
                <th>{t('Severity', 'Keterukan')}</th>
                <th>{t('Status', 'Status')}</th>
                <th>{t('Owner', 'Pemilik')}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {open.map((inc) => (
                <tr key={inc.id} className={inc.id === activeId ? 'is-active' : ''}>
                  <td className="mono">{inc.id}</td>
                  <td>{inc.title}</td>
                  <td>{inc.severity ? `L${inc.severity}` : '—'}</td>
                  <td>{inc.status}</td>
                  <td>{inc.owner}</td>
                  <td>
                    <button type="button" className="btn btn-secondary" onClick={() => onOpen(inc.id)}>
                      {t('Open', 'Buka')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="core-quick">
        <button type="button" className="btn btn-secondary" onClick={() => onGo('first60')}>
          {t('First 60 min', '60 min pertama')}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => onGo('clocks')}>
          {t('Regulatory clocks', 'Jam pengawalseliaan')}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => onGo('quorum')}>
          {t('Decision quorum', 'Kuorum keputusan')}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => onGo('statements')}>
          {t('Statements', 'Kenyataan')}
        </button>
      </div>
    </div>
  )
}
