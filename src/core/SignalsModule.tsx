import { useEffect, useState } from 'react'
import {
  listPendingSignals,
  actionSignal,
  dismissSignal,
  getSignalKeyStatus,
  rotateSignalKey,
  apiBase,
  type SignalItem,
  type SignalKeyStatus,
} from './api'
import type { Lang } from './types'
import '../ops-dashboard.css'

interface Props {
  lang: Lang
  onIncidentCreated: (incidentId: string) => void
}

export default function SignalsModule({ lang, onIncidentCreated }: Props) {
  const t = (en: string, bm: string) => (lang === 'bm' ? bm : en)

  const [signals, setSignals] = useState<SignalItem[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [keyStatus, setKeyStatus] = useState<SignalKeyStatus | null>(null)
  const [rotating, setRotating] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const refresh = () => {
    setLoading(true)
    Promise.all([listPendingSignals(), getSignalKeyStatus()])
      .then(([sigs, status]) => {
        setSignals(sigs)
        setKeyStatus(status)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onAction = async (signal: SignalItem) => {
    if (busyId) return
    setBusyId(signal.id)
    try {
      const result = await actionSignal(signal.id)
      setSignals((prev) => prev.filter((s) => s.id !== signal.id))
      onIncidentCreated(result.incident.id)
    } catch {
      // Network/backend error — leave the signal in the list so the user can retry.
    } finally {
      setBusyId(null)
    }
  }

  const onDismiss = async (signal: SignalItem) => {
    if (busyId) return
    setBusyId(signal.id)
    try {
      await dismissSignal(signal.id)
      setSignals((prev) => prev.filter((s) => s.id !== signal.id))
    } catch {
      // Leave it in the list on failure so the user can retry.
    } finally {
      setBusyId(null)
    }
  }

  const onRotate = async () => {
    if (rotating) return
    setRotating(true)
    try {
      const result = await rotateSignalKey()
      setNewKey(result.key)
      setKeyStatus({ configured: true, generated_at: result.generated_at })
    } catch {
      // Best-effort — e.g. RBAC denying a non-Admin, or local demo mode.
    } finally {
      setRotating(false)
    }
  }

  const copyKey = async () => {
    if (!newKey) return
    try {
      await navigator.clipboard.writeText(newKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard API unavailable — nothing actionable to show here.
    }
  }

  return (
    <>
      <section className="card module-card">
        <div className="module-card__head">
          <h2>
            <span className="step">◉</span>
            {t('Signal Intake', 'Pengambilan Isyarat')}
          </h2>
        </div>
        <p className="module-lead">
          {t(
            'External systems you already run — Meltwater, Sentinel, ServiceNow, a generic webhook — push events here. Escalate never duplicates detection; it recommends a severity and waits for a human to create or dismiss the incident.',
            'Sistem luaran yang anda sudah gunakan — Meltwater, Sentinel, ServiceNow, webhook generik — menghantar peristiwa ke sini. Escalate tidak menduplikasi pengesanan; ia mencadangkan keterukan dan menunggu manusia mencipta atau menolak insiden.'
          )}
        </p>

        <div className="form-row">
          <label>{t('Signal key', 'Kunci isyarat')}</label>
          {keyStatus?.configured ? (
            <p className="stmt-hint">
              {t('Configured', 'Dikonfigurasi')}
              {keyStatus.generated_at ? ` · ${new Date(keyStatus.generated_at).toLocaleString('en-MY')}` : ''}
            </p>
          ) : (
            <p className="stmt-hint">{t('Not configured — signals will be rejected until a key is generated.', 'Belum dikonfigurasi — isyarat akan ditolak sehingga kunci dijana.')}</p>
          )}
          {apiBase() && (
            <div className="btn-row" style={{ marginTop: '0.4rem' }}>
              <button type="button" className="btn btn-secondary" onClick={onRotate} disabled={rotating}>
                {rotating
                  ? t('Generating…', 'Menjana…')
                  : keyStatus?.configured
                    ? t('Rotate key', 'Putar kunci')
                    : t('Generate key', 'Jana kunci')}
              </button>
            </div>
          )}
          {newKey && (
            <div className="form-row" style={{ marginTop: '0.75rem' }}>
              <p className="stmt-hint" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                {t('Copy this now — it will not be shown again.', 'Salin sekarang — ia tidak akan dipaparkan lagi.')}
              </p>
              <textarea rows={2} readOnly value={newKey} />
              <div className="btn-row" style={{ marginTop: '0.4rem' }}>
                <button type="button" className="btn btn-secondary" onClick={copyKey}>
                  {copied ? t('Copied', 'Disalin') : t('Copy', 'Salin')}
                </button>
              </div>
              <p className="stmt-hint" style={{ marginTop: '0.6rem' }}>
                {t('Hand this to the admin configuring the webhook, along with:', 'Berikan ini kepada admin yang mengkonfigurasi webhook, bersama:')}
              </p>
              <textarea
                rows={8}
                readOnly
                style={{ fontSize: '0.8rem' }}
                value={`POST ${apiBase() || 'https://escalate-my-api.<your-subdomain>.workers.dev'}/api/v1/signals
Authorization: Bearer ${newKey}
Content-Type: application/json

{
  "organisation_id": "<your organisation id>",
  "incident_type": "reputation",
  "source": "Meltwater",
  "description": "Negative mentions spike +300% — product recall topic",
  "severity_hint": "high",
  "timestamp": "2026-11-04T16:00:00Z"
}`}
              />
            </div>
          )}
        </div>
      </section>

      <section className="card module-card">
        <div className="module-card__head">
          <h2>
            <span className="step">◉</span>
            {t('Pending signals', 'Isyarat tertunggak')}
          </h2>
          <span className="module-card__badge">{signals.length}</span>
        </div>
        {loading && <p className="core-muted">{t('Loading…', 'Memuatkan…')}</p>}
        {!loading && signals.length === 0 && (
          <p className="core-muted">
            {t('No pending signals. Events from connected systems will appear here.', 'Tiada isyarat tertunggak. Peristiwa daripada sistem bersambung akan dipaparkan di sini.')}
          </p>
        )}
        {!loading && signals.length > 0 && (
          <ul className="log-list">
            {signals.map((s) => (
              <li key={s.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {s.recommended_severity && <span className={`sev-badge sev-${s.recommended_severity}`}>L{s.recommended_severity}</span>}
                  <strong>{s.source}</strong>
                  <span className="core-muted">· {s.incident_type}</span>
                  <span className="time" style={{ marginLeft: 'auto' }}>{new Date(s.occurred_at).toLocaleString('en-MY')}</span>
                </div>
                <p style={{ margin: 0 }}>{s.description}</p>
                <div className="btn-row">
                  <button type="button" className="btn btn-primary" onClick={() => onAction(s)} disabled={busyId === s.id}>
                    {busyId === s.id ? t('Working…', 'Memproses…') : t('Create incident', 'Cipta insiden')}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => onDismiss(s)} disabled={busyId === s.id}>
                    {t('Dismiss', 'Tolak')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
