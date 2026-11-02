import { VERIFIED_CLOCKS, statusLabel, type VerifyStatus } from './verifiedPractice'

type Lang = 'bm' | 'en'

interface Props {
  lang: Lang
  t: (en: string, bm: string) => string
  /** which clocks the user has marked as started */
  started: Record<string, boolean>
  onToggle: (id: string) => void
}

export default function ClocksModule({ lang, t, started, onToggle }: Props) {
  const active = VERIFIED_CLOCKS.filter((c) => started[c.id]).length

  return (
    <section className="card module-card">
      <div className="module-card__head">
        <h2>
          <span className="step">⏱</span>
          {t('Regulatory clocks', 'Jam pengawalseliaan')}
        </h2>
        <span className="module-card__badge">
          {active}/{VERIFIED_CLOCKS.length} {t('started', 'dimulakan')}
        </span>
      </div>

      <p className="module-lead">
        {t(
          'Start every relevant clock at once. One named owner each. Verified against Bursa LR Ch.9, PDPA Guideline 2025, CSA 2024, NADOPOD 2004.',
          'Mulakan setiap jam yang relevan sekaligus. Satu pemilik dinamakan setiap jam. Disahkan terhadap LR Bursa Bab 9, Garis Panduan PDPA 2025, CSA 2024, NADOPOD 2004.'
        )}
      </p>

      <div className="clocks-grid">
        {VERIFIED_CLOCKS.map((c) => {
          const on = !!started[c.id]
          return (
            <article key={c.id} className={`clock-card ${on ? 'on' : ''} status-${c.status}`}>
              <div className="clock-card__top">
                <label className="clock-card__toggle">
                  <input type="checkbox" checked={on} onChange={() => onToggle(c.id)} />
                  <span className="clock-card__title">{lang === 'bm' ? c.clockBm : c.clockEn}</span>
                </label>
                <span className={`verify-pill verify-${c.status}`}>
                  {statusLabel(c.status as VerifyStatus, lang)}
                </span>
              </div>
              <div className="clock-card__deadline">
                {lang === 'bm' ? c.deadlineBm : c.deadlineEn}
              </div>
              <div className="clock-card__owner">
                {t('Owner', 'Pemilik')}: {lang === 'bm' ? c.ownerBm : c.ownerEn}
              </div>
              <div className="clock-card__applies">{c.appliesTo}</div>
              <p className="clock-card__note">{lang === 'bm' ? c.noteBm : c.noteEn}</p>
              <div className="clock-card__source">{c.source}</div>
            </article>
          )
        })}
      </div>

      <p className="module-disclaimer">
        {t(
          'Operational guidance only — not legal advice. Counsel must verify before adoption.',
          'Panduan operasi sahaja — bukan nasihat undang-undang. Peguam mesti mengesahkan sebelum diguna pakai.'
        )}
      </p>
    </section>
  )
}
