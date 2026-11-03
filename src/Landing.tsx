type Lang = 'bm' | 'en'

interface LandingProps {
  lang: Lang
  onEnterPlaybook: () => void
  onEnterManual: () => void
  onToggleLang: () => void
}

export default function Landing({ lang, onEnterPlaybook, onEnterManual, onToggleLang }: LandingProps) {
  const t = (en: string, bm: string) => (lang === 'bm' ? bm : en)
  const setLang = (next: Lang) => {
    if (lang !== next) onToggleLang()
  }

  return (
    <div className="landing landing--swiss">
      <header className="swiss-header">
        <span className="swiss-brand">
          Escalate <span className="swiss-my">MY</span>
        </span>
        <nav className="swiss-nav">
          <a href="#steps">{t('Method', 'Kaedah')}</a>
          <button type="button" onClick={onEnterManual}>
            {t('Manual', 'Manual')}
          </button>
        </nav>
        <div className="swiss-header-right">
          <div className="swiss-lang">
            <button type="button" className={lang === 'bm' ? 'on' : ''} onClick={() => setLang('bm')}>
              BM
            </button>
            <span>/</span>
            <button type="button" className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>
              EN
            </button>
          </div>
          <button type="button" className="swiss-enter" onClick={onEnterPlaybook}>
            {t('Enter', 'Masuk')}
          </button>
        </div>
      </header>

      <section className="swiss-hero">
        <div className="swiss-hero-num">60</div>
        <div className="swiss-hero-meta">
          <span className="swiss-kicker">{t('MINUTES', 'MINIT')}</span>
          <span className="swiss-kicker">{t('FIRST', 'PERTAMA')}</span>
        </div>
        <h1>
          {t('The first hour decides the direction of the crisis.', 'Satu jam pertama menentukan hala tuju krisis.')}
        </h1>
        <p className="swiss-lead">
          {t(
            'Escalate MY is a crisis intelligence platform for Malaysian organisations. Assess. Coordinate. Decide. Recommendations only — quorum before any external action.',
            'Escalate MY ialah aplikasi krisis pintar untuk organisasi Malaysia. Nilai. Selaras. Keputusan. Cadangan sahaja — kuorum sebelum sebarang tindakan luaran.'
          )}
        </p>
        <button type="button" className="swiss-link" onClick={onEnterPlaybook}>
          {t('Open the Command Centre', 'Buka Pusat Perintah')}
        </button>
      </section>

      <section id="steps" className="swiss-steps">
        <ol>
          <li>
            <span>01</span>
            <strong>{t('Assess', 'Nilai')}</strong>
            <p>{t('Classify severity. Map regulatory exposure. Decision Intelligence recommends next actions.', 'Tentukan tahap. Padankan kewajipan. Kepintaran Keputusan mencadangkan tindakan.')}</p>
          </li>
          <li>
            <span>02</span>
            <strong>{t('Coordinate', 'Selaras')}</strong>
            <p>{t('Activate the first hour. Track quorum. Start regulatory clocks with named owners.', 'Aktifkan sejam pertama. Jejak kuorum. Mulakan jam pematuhan dengan pemilik.')}</p>
          </li>
          <li>
            <span>03</span>
            <strong>{t('Decide', 'Keputusan')}</strong>
            <p>{t('Clear statements. Generate BoardBrief. Every action is in the audit trail.', 'Lulus kenyataan. Jana Ringkasan Lembaga. Setiap tindakan dalam jejak audit.')}</p>
          </li>
        </ol>
      </section>

      <section className="swiss-modules">
        <div className="swiss-modules-head">
          <span>04</span>
          <h2>{t('System', 'Sistem')}</h2>
        </div>
        <ul>
          <li>{t('Command Centre', 'Pusat Perintah')}</li>
          <li>{t('First Sixty Minutes', '60 Minit Pertama')}</li>
          <li>{t('Regulatory Clock', 'Jam Pematuhan')}</li>
          <li>{t('Decision Quorum', 'Kuorum Keputusan')}</li>
          <li>{t('Decision Intelligence', 'Kepintaran Keputusan')}</li>
          <li>{t('Audit Trail', 'Jejak Audit')}</li>
        </ul>
      </section>

      <footer className="swiss-footer">
        <span>Escalate MY · Quantum PR · Malaysia</span>
        <span>
          {t(
            'Operational guidance only — not legal advice.',
            'Panduan operasi sahaja — bukan nasihat undang-undang.'
          )}
        </span>
      </footer>
    </div>
  )
}
