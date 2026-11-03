import type { Incident, Lang } from './types'

interface Props {
  lang: Lang
  incident: Incident
}

export default function AuditModule({ lang, incident }: Props) {
  const t = (en: string, bm: string) => (lang === 'bm' ? bm : en)

  const exportTrail = () => {
    const lines = incident.audit
      .map((a) => `${a.at}\t${a.actor}\t${a.action}\t${a.detail || ''}`)
      .join('\n')
    const blob = new Blob([`id\t${incident.id}\ntitle\t${incident.title}\n\n${lines}`], {
      type: 'text/plain;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-${incident.id}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="card module-card">
      <div className="module-card__head">
        <h2>
          <span className="step">☰</span>
          {t('Audit Trail', 'Jejak Audit')}
        </h2>
        <button type="button" className="btn btn-secondary" onClick={exportTrail}>
          {t('Export', 'Eksport')}
        </button>
      </div>
      <p className="module-lead">
        {t(
          'Who created · approved · modified · closed — with timestamps. Retain per policy (e.g. 7 years).',
          'Siapa mencipta · meluluskan · mengubah · menutup — dengan cap masa. Simpan mengikut polisi (cth. 7 tahun).'
        )}
      </p>
      <ul className="audit-list">
        {incident.audit.map((a) => (
          <li key={a.id}>
            <span className="mono">{new Date(a.at).toLocaleString('en-MY')}</span>
            <span className="audit-actor">{a.actor}</span>
            <span>
              {a.action}
              {a.detail ? ` — ${a.detail}` : ''}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
