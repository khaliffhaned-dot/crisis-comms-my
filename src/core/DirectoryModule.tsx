import { DEFAULT_DIRECTORY } from './directoryData'
import type { Lang } from './types'

interface Props {
  lang: Lang
}

export default function DirectoryModule({ lang }: Props) {
  const t = (en: string, bm: string) => (lang === 'bm' ? bm : en)

  return (
    <section className="card module-card">
      <div className="module-card__head">
        <h2>
          <span className="step">☎</span>
          {t('Organisation Directory', 'Direktori Organisasi')}
        </h2>
        <span className="module-card__badge">{DEFAULT_DIRECTORY.length}</span>
      </div>
      <p className="module-lead">
        {t(
          'Crisis team, legal, board channel, government and media contacts. tel: direct.',
          'Pasukan krisis, undang-undang, saluran lembaga, kerajaan dan media. tel: terus.'
        )}
      </p>
      <div className="dir-grid">
        {DEFAULT_DIRECTORY.map((c) => (
          <a key={c.id} className="dir-card" href={`tel:${c.tel}`}>
            <div className="dir-avatar">{c.name.charAt(0)}</div>
            <div>
              <strong>{c.name}</strong>
              <div className="core-muted">
                {c.role} · {c.group}
              </div>
              <div className="mono">{c.tel}</div>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
