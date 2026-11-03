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
          <span className="brand-tag">{t('Enterprise', 'Enterprise')}</span>
        </div>
        <nav className="landing-nav">
          <a href="#features">{t('Features', 'Ciri-ciri')}</a>
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
            {t('Open Playbook', 'Buka Playbook')}
          </button>
        </div>
      </header>

      <section className="hero hero-enterprise">
        <div className="hero-content">
          <p className="hero-eyebrow">
            <span className="dot-live" />
            {t('For Bursa Malaysia listed PLCs · Enterprise v1.4', 'Untuk PLC tersenarai Bursa Malaysia · Enterprise v1.4')}
          </p>
          <h1>
            {t('Crisis communications,', 'Komunikasi Krisis,')}
            <br />
            <span className="hero-display">
              {t('100% human oversight.', '100% Pantauan Manusia.')}
            </span>
          </h1>
          <p className="hero-sub">
            {t(
              'Operational playbook for Bursa-listed companies. Clear steps. Named owners. Decisions you can defend.',
              'Playbook operasi untuk syarikat tersenarai Bursa Malaysia. Langkah jelas. Pihak yang bertanggungjawab. Keputusan yang yakin.'
            )}
          </p>
          <div className="hero-cta">
            <button type="button" className="btn btn-primary btn-lg" onClick={onEnterPlaybook}>
              {t('Open Playbook', 'Buka Playbook')}
            </button>
            <button type="button" className="btn btn-secondary btn-lg" onClick={onEnterManual}>
              {t('View Manual', 'Lihat Manual')}
            </button>
          </div>
          <div className="hero-trust">
            <span>{t('Bursa LR 9.03–9.11', 'Bursa LR 9.03–9.11')}</span>
            <span>{t('PDPA 72h', 'PDPA 72j')}</span>
            <span>{t('7-year audit trail', 'Jejak audit 7 tahun')}</span>
            <span className="trust-human">{t('100% HUMAN · NO AI DRAFT', '100% MANUSIA · TIADA DRAF AI')}</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="live-card">
            <div className="live-card__head">
              <span className="live-card__title">{t('LIVE SYSTEM', 'SISTEM AKTIF')}</span>
              <span className="live-card__online">
                <span className="dot-live" />
                ONLINE
              </span>
            </div>
            <div className="live-card__grid">
              <div className="live-tile">
                <span className="live-tile__label">{t('SEVERITY', 'TAHAP')}</span>
                <span className="live-tile__value">L1 – L4</span>
                <span className="live-tile__meta">{t('Severity matrix', 'Matriks keterukan')}</span>
              </div>
              <div className="live-tile">
                <span className="live-tile__label">{t('DIMENSION', 'DIMENSI')}</span>
                <span className="live-tile__value">3 Axis</span>
                <span className="live-tile__meta">{t('Com / Pol / Nat', 'Kom / Pol / Nas')}</span>
              </div>
              <div className="live-tile">
                <span className="live-tile__label">{t('SCENARIO', 'SENARIO')}</span>
                <span className="live-tile__value">6</span>
                <span className="live-tile__meta">{t('Bursa ready', 'Sedia Bursa')}</span>
              </div>
              <div className="live-tile">
                <span className="live-tile__label">{t('CONTACTS', 'KONTAK')}</span>
                <span className="live-tile__value">12</span>
                <span className="live-tile__meta">{t('tel: direct', 'tel: terus')}</span>
              </div>
            </div>
            <div className="live-card__status">
              <span className="status-warn">⚠</span>
              <div>
                <strong>{t('Classification', 'Klasifikasi Semasa')}</strong>
                <span>{t('Not set', 'Belum ditetapkan')}</span>
              </div>
              <span className="status-timer">T+ 00:00</span>
            </div>
            <p className="live-card__note">
              {t(
                'No AI writes statements. Every draft needs human clearance: Legal → Board → Final.',
                'Tiada AI menjana kenyataan. Semua draf memerlukan kelulusan manusia: Legal → Lembaga → Muktamad.'
              )}
            </p>
          </div>
        </div>
      </section>

      <section id="features" className="features-section">
        <h2 className="section-title">{t('Built for the first hour', 'Dibina untuk sejam pertama')}</h2>
        <div className="features-grid features-grid--4">
          <article className="feature-card">
            <div className="feature-icon">◆</div>
            <h3>{t('Severity matrix', 'Matriks keterukan')}</h3>
            <p>
              {t(
                'L1–L4 with who convenes, who approves, and when Bursa assessment is mandatory.',
                'T1–T4 dengan siapa bersidang, siapa meluluskan, dan bila penilaian Bursa wajib.'
              )}
            </p>
          </article>
          <article className="feature-card">
            <div className="feature-icon">①</div>
            <h3>{t('First 60 minutes', '60 minit pertama')}</h3>
            <p>
              {t(
                'Thirteen timed steps with named owners. Critical path for listed issuers.',
                'Tiga belas langkah berwaktu dengan pemilik dinamakan. Laluan kritikal untuk penerbit tersenarai.'
              )}
            </p>
          </article>
          <article className="feature-card">
            <div className="feature-icon">⏱</div>
            <h3>{t('Regulatory clocks', 'Jam pengawalseliaan')}</h3>
            <p>
              {t(
                'Bursa, PDPA, NACSA, DOSH — verified deadlines with source lines.',
                'Bursa, PDPA, NACSA, JKKP — tarikh akhir disahkan dengan baris sumber.'
              )}
            </p>
          </article>
          <article className="feature-card">
            <div className="feature-icon">✎</div>
            <h3>{t('Statements + log', 'Kenyataan + log')}</h3>
            <p>
              {t(
                'EN/BM holding drafts, clearance path, timestamped decisions, export-ready trail.',
                'Draf kenyataan BM/EN, laluan kelulusan, keputusan berwaktu, jejak sedia eksport.'
              )}
            </p>
          </article>
        </div>
      </section>

      <section id="how" className="how-section">
        <h2 className="section-title">{t('How teams use it', 'Bagaimana pasukan menggunakannya')}</h2>
        <ol className="how-steps">
          <li>
            <span className="step-num">1</span>
            <div>
              <strong>{t('Assess', 'Nilai')}</strong>
              <p>{t('Set severity and dimension. Bursa flags appear on L3+.', 'Tetapkan keterukan dan dimensi. Bendera Bursa muncul pada T3+.')}</p>
            </div>
          </li>
          <li>
            <span className="step-num">2</span>
            <div>
              <strong>{t('Act', 'Bertindak')}</strong>
              <p>{t('Run the first-hour checklist and start regulatory clocks.', 'Jalankan senarai sejam pertama dan mulakan jam pengawalseliaan.')}</p>
            </div>
          </li>
          <li>
            <span className="step-num">3</span>
            <div>
              <strong>{t('Clear & log', 'Lulus & log')}</strong>
              <p>{t('Draft → Legal → Board → Final. Every decision timed.', 'Draf → Legal → Lembaga → Muktamad. Setiap keputusan berwaktu.')}</p>
            </div>
          </li>
        </ol>
      </section>

      <section className="cta-band cta-band--light">
        <div className="cta-band-inner">
          <h2>{t('Ready when the first hour matters.', 'Sedia apabila sejam pertama penting.')}</h2>
          <p>
            {t(
              'Open the Playbook for live response, or the Manual for preparation and training.',
              'Buka Playbook untuk respons langsung, atau Manual untuk persediaan dan latihan.'
            )}
          </p>
          <div className="hero-cta">
            <button type="button" className="btn btn-primary btn-lg" onClick={onEnterPlaybook}>
              {t('Open Playbook', 'Buka Playbook')}
            </button>
            <button type="button" className="btn btn-secondary btn-lg" onClick={onEnterManual}>
              {t('View Manual', 'Lihat Manual')}
            </button>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-inner">
          <span>Escalate MY · {t('Malaysia Edition', 'Edisi Malaysia')} · v1.4</span>
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
