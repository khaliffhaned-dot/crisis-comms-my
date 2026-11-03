import type { Incident, Lang, QuorumState } from './types'

interface Props {
  lang: Lang
  incident: Incident
  onVote: (role: string, state: QuorumState) => void
}

export default function QuorumModule({ lang, incident, onVote }: Props) {
  const t = (en: string, bm: string) => (lang === 'bm' ? bm : en)
  const approved = incident.quorum.filter((q) => q.state === 'approved').length
  const total = incident.quorum.length

  return (
    <section className="card module-card">
      <div className="module-card__head">
        <h2>
          <span className="step">◎</span>
          {t('Decision Quorum', 'Kuorum Keputusan')}
        </h2>
        <span className="module-card__badge">
          {approved}/{total} {t('approved', 'diluluskan')}
        </span>
      </div>
      <p className="module-lead">
        {t(
          'Who must approve · who has responded · who is pending. Required before external release on L3+.',
          'Siapa mesti meluluskan · siapa telah menjawab · siapa menunggu. Wajib sebelum keluaran luaran pada T3+.'
        )}
      </p>
      <ul className="quorum-list">
        {incident.quorum.map((q) => (
          <li key={q.role} className={`quorum-row state-${q.state}`}>
            <div>
              <strong>{q.role}</strong>
              {q.at && <span className="mono core-muted"> · {new Date(q.at).toLocaleString('en-MY')}</span>}
            </div>
            <div className="quorum-actions">
              {(['approved', 'pending', 'rejected'] as QuorumState[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`btn btn-secondary ${q.state === s ? 'is-on' : ''}`}
                  onClick={() => onVote(q.role, s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
