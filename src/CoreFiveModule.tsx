import { CORE_FIVE } from './playbookData'

type Lang = 'bm' | 'en'

interface Props {
  lang: Lang
  t: (en: string, bm: string) => string
}

export default function CoreFiveModule({ lang, t }: Props) {
  const roles = CORE_FIVE[lang]

  return (
    <section className="card module-card">
      <div className="module-card__head">
        <h2>
          <span className="step">◎</span>
          {t('The Core Five', 'Core Five')}
        </h2>
      </div>

      <p className="module-lead">
        {t(
          'Any one of the Core Five may declare a minimum Level 2 on their own authority. Call by phone, not email. Nobody needs permission to raise the alarm.',
          'Mana-mana ahli Core Five boleh isytihar minimum Tahap 2 atas kuasa sendiri. Hubungi melalui telefon, bukan e-mel. Tiada siapa memerlukan kebenaran untuk membunyikan amaran.'
        )}
      </p>

      <ol className="core-five-list">
        {roles.map((r, i) => (
          <li key={i} className="core-five-item">
            <span className="core-five-num">{i + 1}</span>
            <div>
              <div className="core-five-role">{r.role}</div>
              <div className="core-five-why">{r.why}</div>
            </div>
          </li>
        ))}
      </ol>

      <div className="bursa-alert" style={{ marginTop: '1.25rem' }}>
        {t(
          'Company Secretary controls Bursa LINK. Head of Comms owns EN + BM statements. Crisis Lead is the single accountable decision-maker.',
          'Setiausaha Syarikat mengawal Bursa LINK. Ketua Komunikasi memiliki kenyataan BM + EN. Ketua Krisis adalah pembuat keputusan tunggal yang bertanggungjawab.'
        )}
      </div>
    </section>
  )
}
