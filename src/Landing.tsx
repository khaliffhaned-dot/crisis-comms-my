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
    <div className="landing landing--light">
      <header className="landing-header">
        <div className="landing-brand">
          <span className="brand-name">
            Escalate <span className="brand-my">MY</span>
          </span>
          <span className="brand-tag">{t('Quantum PR', 'Quantum PR')}</span>
        </div>
        <nav className="landing-nav">
          <a href="#features">{t('Modules', 'Modul')}</a>
          <a href="#how">{t('How it works', 'Cara Kerja')}</a>
          <button type="button" onClick={onEnterManual}>
            {t('Manual', 'Manual')}
          </button>
        </nav>
        <div className="header-right">
          <div className="lang-toggle">
            <button type="button" className={lang === 'bm' ? 'active' : ''} onClick={() => setLang('bm')}>
              BM
            </button>
            <button type="button" className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>
              EN
            </button>
          </div>
          <button type="button" className="btn btn-primary" onClick={onEnterPlaybook}>
            {t('Launch Command Centre', 'Buka Pusat Perintah')}
          </button>
        </div>
      </header>

      <section className="hero hero-enterprise">
        <div className="hero-content">
          <p className="hero-eyebrow">
            <span className="dot-live" />
            {t(
              'Crisis Intelligence Platform for Malaysian Organisations',
              'Aplikasi Krisis Pintar untuk Organisasi Malaysia'
            )}
          </p>
          <h1>
            {t('The First Hour', 'Satu Jam Pertama')}
            <br />
            <span className="hero-display">
              {t('Decides Everything.', 'Menentukan Hala Tuju Krisis.')}
            </span>
          </h1>
          <p className="hero-sub">
            {t(
              'Know what happened. Know what matters. Know what to do next. Escalate MY helps organisations assess incidents, coordinate decision-makers, manage regulatory obligations and execute response actions through a unified Crisis Command Centre.',
              'Escalate MY membantu organisasi menilai insiden, menyelaras tindakan, mengurus keperluan kawal selia dan mempercepat proses membuat keputusan ketika berhadapan situasi kritikal.'
            )}
          </p>
          <div className="hero-cta">
            <button type="button" className="btn btn-primary btn-lg" onClick={onEnterPlaybook}>
              {t('Launch Command Centre', 'Buka Pusat Perintah')}
            </button>
            <button type="button" className="btn btn-secondary btn-lg" onClick={onEnterManual}>
              {t('View Platform Overview', 'Lihat Manual')}
            </button>
          </div>
          <div className="hero-trust">
            <span>{t('Bursa LR 9.03–9.11', 'Bursa LR 9.03–9.11')}</span>
            <span>{t('PDPA 72h', 'PDPA 72j')}</span>
            <span>{t('Decision Quorum', 'Kuorum Keputusan')}</span>
            <span className="trust-human">
              {t('From uncertainty to action', 'Daripada ketidakpastian kepada keputusan yang tepat')}
            </span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="live-card">
            <div className="live-card__head">
              <span className="live-card__title">{t('COMMAND CENTRE', 'PUSAT PERINTAH')}</span>
              <span className="live-card__online">
                <span className="dot-live" />
                ONLINE
              </span>
            </div>
            <div className="live-card__grid">
              <div className="live-tile">
                <span className="live-tile__label">{t('SEVERITY', 'TAHAP')}</span>
                <span className="live-tile__value">L1 – L4</span>
                <span className="live-tile__meta">{t('Severity Engine', 'Enjin Penentuan Tahap')}</span>
              </div>
              <div className="live-tile">
                <span className="live-tile__label">{t('FIRST 60', '60 MINIT')}</span>
                <span className="live-tile__value">13</span>
                <span className="live-tile__meta">{t('Guided steps', 'Langkah berpandu')}</span>
              </div>
              <div className="live-tile">
                <span className="live-tile__label">{t('CLOCKS', 'JAM')}</span>
                <span className="live-tile__value">MY</span>
                <span className="live-tile__meta">{t('Bursa · PDPA · DOSH', 'Bursa · PDPA · JKKP')}</span>
              </div>
              <div className="live-tile">
                <span className="live-tile__label">{t('QUORUM', 'KUORUM')}</span>
                <span className="live-tile__value">Core</span>
                <span className="live-tile__meta">{t('CEO · Legal · Ops', 'CEO · Legal · Ops')}</span>
              </div>
            </div>
            <div className="live-card__status">
              <span className="status-warn">◆</span>
              <div>
                <strong>{t('Decision Intelligence', 'Kepintaran Keputusan')}</strong>
                <span>{t('Recommend · then clear', 'Cadang · kemudian lulus')}</span>
              </div>
              <span className="status-timer">T+ 00:00</span>
            </div>
            <p className="live-card__note">
              {t(
                'Recommendations only. Decision Quorum before any external statement or filing.',
                'Cadangan sahaja. Kuorum Keputusan sebelum sebarang kenyataan atau pemfailan luaran.'
              )}
            </p>
          </div>
        </div>
      </section>

      <section id="features" className="features-section">
        <h2 className="section-title">{t('Platform Modules', 'Modul Platform')}</h2>
        <div className="features-grid features-grid--bento">
          <article className="feature-card">
            <div className="feature-icon">◆</div>
            <h3>{t('Command Centre™', 'Pusat Perintah™')}</h3>
            <p>
              {t(
                'A single operational picture for leadership teams. Monitor incidents, readiness and critical actions.',
                'Gambaran operasi secara menyeluruh untuk membantu kepimpinan memahami situasi semasa.'
              )}
            </p>
          </article>
          <article className="feature-card">
            <div className="feature-icon">①</div>
            <h3>{t('First Sixty Minutes™', '60 Minit Pertama™')}</h3>
            <p>
              {t(
                'A guided framework for the most critical stage. Establish control. Assign responsibilities. Execute.',
                'Panduan tindakan berstruktur untuk mengawal keadaan dan melaksanakan tindakan kritikal.'
              )}
            </p>
          </article>
          <article className="feature-card">
            <div className="feature-icon">⏱</div>
            <h3>{t('Regulatory Clock™', 'Jam Pematuhan™')}</h3>
            <p>
              {t(
                'Bursa, PDPA, DOSH, NACSA, SC, BNM — track obligations and disclosure considerations.',
                'Membantu menjejaki keperluan pelaporan, tempoh pematuhan dan kewajipan kawal selia.'
              )}
            </p>
          </article>
          <article className="feature-card">
            <div className="feature-icon">✎</div>
            <h3>{t('Decision Quorum™', 'Kuorum Keputusan™')}</h3>
            <p>
              {t(
                'Ensure the right people decide before delays become risks. Track approvals and accountability.',
                'Memastikan keputusan penting melibatkan pihak yang mempunyai kuasa untuk bertindak.'
              )}
            </p>
          </article>
        </div>
      </section>

      <section id="how" className="how-section">
        <h2 className="section-title">{t('From uncertainty to action', 'Daripada ketidakpastian kepada tindakan')}</h2>
        <ol className="how-steps">
          <li>
            <span className="step-num">1</span>
            <div>
              <strong>{t('Assess', 'Nilai')}</strong>
              <p>{t('Classify severity. Map regulatory exposure. Decision Intelligence recommends next actions.', 'Tentukan tahap. Padankan kewajipan. Kepintaran Keputusan mencadangkan tindakan.')}</p>
            </div>
          </li>
          <li>
            <span className="step-num">2</span>
            <div>
              <strong>{t('Coordinate', 'Selaras')}</strong>
              <p>{t('Activate the first hour. Track quorum. Start regulatory clocks with named owners.', 'Aktifkan sejam pertama. Jejak kuorum. Mulakan jam pematuhan dengan pemilik.')}</p>
            </div>
          </li>
          <li>
            <span className="step-num">3</span>
            <div>
              <strong>{t('Decide & record', 'Keputusan & rekod')}</strong>
              <p>{t('Clear statements. Generate BoardBrief. Every action is in the audit trail.', 'Lulus kenyataan. Jana Ringkasan Lembaga. Setiap tindakan dalam jejak audit.')}</p>
            </div>
          </li>
        </ol>
      </section>

      <section className="cta-band cta-band--light">
        <div className="cta-band-inner">
          <h2>
            {t(
              'Make decisions with confidence when every minute matters.',
              'Buat keputusan dengan yakin apabila setiap minit penting.'
            )}
          </h2>
          <p>
            {t(
              'Escalate MY™ — Crisis Intelligence Platform for Malaysian Organisations.',
              'Escalate MY™ — Aplikasi Krisis Pintar untuk Organisasi Malaysia.'
            )}
          </p>
          <div className="hero-cta">
            <button type="button" className="btn btn-primary btn-lg" onClick={onEnterPlaybook}>
              {t('Launch Command Centre', 'Buka Pusat Perintah')}
            </button>
            <button type="button" className="btn btn-secondary btn-lg" onClick={onEnterManual}>
              {t('View Manual', 'Lihat Manual')}
            </button>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-inner">
          <span>Escalate MY™ · Quantum PR · {t('Malaysia', 'Malaysia')}</span>
          <span>
            {t(
              'Operational guidance only — not legal advice. Verify obligations with counsel.',
              'Panduan operasi sahaja — bukan nasihat undang-undang. Sahkan kewajipan dengan peguam.'
            )}
          </span>
        </div>
      </footer>
    </div>
  )
}
