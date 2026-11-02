import { FIRST_60_STEPS } from './playbookData'

type Lang = 'bm' | 'en'

interface Props {
  lang: Lang
  t: (en: string, bm: string) => string
  checked: boolean[]
  onToggle: (idx: number) => void
}

export default function First60Module({ lang, t, checked, onToggle }: Props) {
  const steps = FIRST_60_STEPS[lang]
  const done = checked.filter(Boolean).length
  const total = steps.length
  const pct = Math.round((done / total) * 100)

  const bands = ['0–10 min', '10–20 min', '20–40 min', '40–60 min'] as const

  return (
    <section className="card module-card">
      <div className="module-card__head">
        <h2>
          <span className="step">2</span>
          {t('First Sixty Minutes', 'Enam Puluh Minit Pertama')}
        </h2>
        <span className="module-card__badge">
          {done}/{total} · {pct}%
        </span>
      </div>

      <div className="checklist-progress">
        <div className="checklist-progress__fill" style={{ width: `${pct}%` }} />
      </div>

      <p className="module-lead">
        {t(
          'Thirteen steps in fixed order. Any Core Five member can raise the alarm. Print this sequence for the war room.',
          'Tiga belas langkah dalam urutan tetap. Mana-mana ahli Core Five boleh membunyikan amaran. Cetak urutan ini untuk bilik perang.'
        )}
      </p>

      <div className="timeline-bands">
        {bands.map((band) => {
          const bandSteps = steps.filter((s) => s.band === band)
          if (!bandSteps.length) return null
          return (
            <div key={band} className="timeline-band">
              <div className="timeline-band__label">{band}</div>
              <ul className="checklist checklist--rich">
                {bandSteps.map((item) => {
                  const idx = steps.findIndex((s) => s.step === item.step)
                  return (
                    <li key={item.step} className={checked[idx] ? 'done' : ''}>
                      <label className="checklist-row">
                        <input
                          type="checkbox"
                          checked={!!checked[idx]}
                          onChange={() => onToggle(idx)}
                        />
                        <span className="checklist-row__body">
                          <span className="checklist-row__text">
                            <span className="step-num">{item.step}.</span>
                            {item.text}
                            {item.critical && (
                              <span className="crit-tag">{t('Critical', 'Kritikal')}</span>
                            )}
                          </span>
                          <span className="checklist-row__meta">
                            <span>{item.owner}</span>
                          </span>
                        </span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>
    </section>
  )
}
