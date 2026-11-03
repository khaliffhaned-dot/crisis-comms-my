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
  incident: Incident | null
  onApplySeverity?: (level: 1 | 2 | 3 | 4) => void
}

const OBLIGATIONS = [
  { id: 'bursa', regulator: 'Bursa Malaysia', title: 'Material disclosure (LR 9.03 / 9.11)', hints: /bursa|material|share|investor|listed|recall|announcement/i },
  { id: 'pdpa', regulator: 'PDPA', title: 'Data breach notification (72h)', hints: /data|pdpa|personal|breach|cyber|leak|privacy/i },
  { id: 'dosh', regulator: 'DOSH', title: 'Workplace incident (NADOPOD)', hints: /accident|injury|fatality|factory|workplace|dosh|jkkp/i },
  { id: 'nacsa', regulator: 'NACSA', title: 'NCII / critical cyber incident', hints: /cyber|ransomware|ncii|critical infrastructure|nacsa/i },
  { id: 'sc', regulator: 'SC Malaysia', title: 'Capital market disclosure', hints: /securities|capital market|sc malaysia|investor/i },
  { id: 'bnm', regulator: 'BNM', title: 'Operational incident (licensed FIs)', hints: /bank|insurance|payment|bnm|financial/i },
]

export function DecisionIntelligence({ lang, incident, onApplySeverity }: Props) {
  const t = (en: string, bm: string) => (lang === 'bm' ? bm : en)
  const [facts, setFacts] = useState(incident?.title || 'Product recall. Three customers affected. National media not involved. Bursa-listed company.')
  const [bursaListed, setBursaListed] = useState(true)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AssessResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const run = async () => {
    setLoading(true)
    setError(null)
    try {
      setResult(hasApiBase() ? await assessIncident({ facts, bursaListed }) : assessIncidentLocal(facts, bursaListed))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Assess failed')
      setResult(assessIncidentLocal(facts, bursaListed))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="card module-card">
      <div className="module-card__head">
        <h2><span className="step">◆</span> {t('Decision Intelligence™', 'Kepintaran Keputusan™')}</h2>
        <span className="module-card__badge">{t('Recommend only', 'Cadangan sahaja')}</span>
      </div>
      <p className="module-lead">
        {t('What should leadership do next?', 'Apa yang perlu dilakukan kepimpinan seterusnya?')}
      </p>
      <div className="form-row">
        <label>{t('Incident facts', 'Fakta insiden')}</label>
        <textarea rows={4} value={facts} onChange={(e) => setFacts(e.target.value)} />
      </div>
      <label className="intel-check">
        <input type="checkbox" checked={bursaListed} onChange={(e) => setBursaListed(e.target.checked)} />
        {t('Bursa-listed company', 'Syarikat tersenarai Bursa')}
      </label>
      <div className="btn-row" style={{ marginTop: '0.75rem' }}>
        <button type="button" className="btn btn-primary" disabled={loading || !facts.trim()} onClick={run}>
          {loading ? t('Assessing…', 'Menilai…') : t('Run assessment', 'Jalankan penilaian')}
        </button>
      </div>
      {error && <p className="stmt-hint" style={{ color: '#b91c1c' }}>{error}</p>}
      {result && (
        <div className="intel-result">
          <div className="intel-result__meta">
            <span className="intel-sev">L{result.severity}</span>
            <span>{t('Confidence', 'Keyakinan')} {result.confidence}%</span>
            <span>{t('Regulatory risk', 'Risiko kawal selia')}: {result.regulatory_risk}</span>
            <span className="mono">{result.source}</span>
          </div>
          <p className="core-muted">{result.rationale}</p>
          <ol className="intel-actions">{result.first_actions.map((a) => <li key={a}>{a}</li>)}</ol>
          <p className="stmt-hint">{result.disclaimer}</p>
          {onApplySeverity && (
            <button type="button" className="btn btn-secondary" onClick={() => onApplySeverity(result.severity)}>
              {t(`Apply L${result.severity} to active incident`, `Guna L${result.severity} pada insiden aktif`)}
            </button>
          )}
        </div>
      )}
    </section>
  )
}

export function RegulatoryIntelligence({ lang }: { lang: Lang }) {
  const t = (en: string, bm: string) => (lang === 'bm' ? bm : en)
  const [facts, setFacts] = useState('Potential data breach affecting customer records. Company is Bursa-listed.')
  const [matched, setMatched] = useState<typeof OBLIGATIONS>([])

  const run = () => {
    setMatched(OBLIGATIONS.filter((o) => o.hints.test(facts)))
  }

  return (
    <section className="card module-card">
      <div className="module-card__head">
        <h2><span className="step">⏱</span> {t('Regulatory Intelligence™', 'Kepintaran Kawal Selia™')}</h2>
        <span className="module-card__badge">{t('Review required', 'Semakan diperlukan')}</span>
      </div>
      <p className="module-lead">
        {t('Match incident facts to potential Malaysian regulatory obligations.', 'Padankan fakta insiden dengan kewajipan kawal selia Malaysia yang berpotensi.')}
      </p>
      <div className="form-row">
        <label>{t('Incident facts', 'Fakta insiden')}</label>
        <textarea rows={4} value={facts} onChange={(e) => setFacts(e.target.value)} />
      </div>
      <div className="btn-row" style={{ marginTop: '0.75rem' }}>
        <button type="button" className="btn btn-primary" onClick={run}>{t('Match obligations', 'Padankan kewajipan')}</button>
      </div>
      {matched.length > 0 && (
        <div className="intel-result">
          <p><strong>{t('Potential obligations detected — review required', 'Kewajipan berpotensi dikesan — semakan diperlukan')}</strong></p>
          <ul className="intel-actions">
            {matched.map((m) => (
              <li key={m.id}><strong>{m.regulator}</strong> — {m.title}</li>
            ))}
          </ul>
          <p className="stmt-hint">{t('Not legal advice. Counsel must verify all obligations.', 'Bukan nasihat undang-undang. Peguam mesti mengesahkan semua kewajipan.')}</p>
        </div>
      )}
      {matched.length === 0 && facts && (
        <p className="core-muted" style={{ marginTop: '0.75rem' }}>{t('Run match to see results.', 'Jalankan padanan untuk melihat hasil.')}</p>
      )}
    </section>
  )
}

export function BoardIntelligence({ lang, incident }: { lang: Lang; incident: Incident | null }) {
  const t = (en: string, bm: string) => (lang === 'bm' ? bm : en)
  if (!incident) {
    return <p className="core-muted">{t('Open an incident first.', 'Buka insiden dahulu.')}</p>
  }
  const pendingQuorum = incident.quorum.filter((q) => q.state === 'pending')
  const openTasks = incident.checked.filter((c) => !c).length
  const topRisks: string[] = []
  if (!incident.severity) topRisks.push(t('Severity not yet classified', 'Tahap belum ditetapkan'))
  if (incident.severity && incident.severity >= 3) topRisks.push(t('Material or critical severity — board oversight expected', 'Tahap material atau kritikal — pengawasan lembaga dijangka'))
  if (incident.status === 'open') topRisks.push(t('Incident remains open', 'Insiden masih terbuka'))

  const pending: string[] = []
  if (pendingQuorum.length) pending.push(t(`Quorum pending: ${pendingQuorum.map((q) => q.role).join(', ')}`, `Kuorum tertunda: ${pendingQuorum.map((q) => q.role).join(', ')}`))
  if (!incident.statement) pending.push(t('Holding statement not yet drafted', 'Kenyataan awal belum digubal'))
  if (openTasks > 0) pending.push(t(`${openTasks} open first-hour tasks`, `${openTasks} tugas 60 minit masih terbuka`))

  let score = 40
  if (incident.severity) score += 15
  if (incident.statement) score += 10
  if (pendingQuorum.length === 0 && incident.quorum.length > 0) score += 20
  if (openTasks === 0) score += 10
  score = Math.min(100, score)

  return (
    <section className="card module-card">
      <div className="module-card__head">
        <h2><span className="step">✎</span> {t('Board Intelligence™', 'Kepintaran Lembaga™')}</h2>
        <span className="module-card__badge">{t('Readiness', 'Kesediaan')} {score}/100</span>
      </div>
      <p className="module-lead">{incident.title}</p>
      <div className="core-kpi" style={{ marginTop: '1rem' }}>
        <div className="core-kpi__card"><span className="lbl">{t('Severity', 'Tahap')}</span><span className="val">{incident.severity ? `L${incident.severity}` : '—'}</span></div>
        <div className="core-kpi__card"><span className="lbl">{t('Status', 'Status')}</span><span className="val">{incident.status}</span></div>
        <div className="core-kpi__card"><span className="lbl">{t('Open tasks', 'Tugas terbuka')}</span><span className="val">{openTasks}</span></div>
        <div className="core-kpi__card"><span className="lbl">{t('Quorum pending', 'Kuorum tertunda')}</span><span className="val">{pendingQuorum.length}</span></div>
      </div>
      <div className="intel-result">
        <strong>{t('Top risks', 'Risiko utama')}</strong>
        <ul className="intel-actions">{topRisks.map((r) => <li key={r}>{r}</li>)}</ul>
        <strong>{t('Pending decisions', 'Keputusan tertunda')}</strong>
        <ul className="intel-actions">{pending.length ? pending.map((p) => <li key={p}>{p}</li>) : <li>{t('None flagged', 'Tiada')}</li>}</ul>
        <strong>{t('Recommended board actions', 'Tindakan lembaga yang disyorkan')}</strong>
        <ul className="intel-actions">
          <li>{t('Review Decision Quorum before any external statement', 'Semak Kuorum Keputusan sebelum sebarang kenyataan luaran')}</li>
          <li>{t('Confirm Regulatory Clock owners and deadlines', 'Sahkan pemilik dan tarikh akhir Jam Pematuhan')}</li>
          {incident.severity && incident.severity >= 3 && <li>{t('Schedule formal Board update (BoardBrief)', 'Jadualkan kemas kini Lembaga formal (Ringkasan Lembaga)')}</li>}
        </ul>
        <p className="stmt-hint">{t('Operational insights only — not legal or disclosure advice.', 'Wawasan operasi sahaja — bukan nasihat undang-undang atau pendedahan.')}</p>
      </div>
    </section>
  )
}
