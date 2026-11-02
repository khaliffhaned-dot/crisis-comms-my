type Lang = 'bm' | 'en'

interface LandingProps {
  lang: Lang
  onEnterPlaybook: () => void
  onEnterManual: () => void
  onToggleLang: () => void
}

export default function Landing({ lang, onEnterPlaybook, onEnterManual, onToggleLang }: LandingProps) {
  const t = (en: string, bm: string) => (lang === 'bm' ? bm : en)

  return (
    <div className="landing">
      {/* Top bar */}
      <header className="landing-header">
        <div className="landing-brand">
          <span className="brand-mark">◆</span>
          <span className="brand-name">CrisisComms MY</span>
        </div>
        <div className="lang-toggle">
          <button className={lang === 'bm' ? 'active' : ''} onClick={onToggleLang}>
            BM
          </button>
          <button className={lang === 'en' ? 'active' : ''} onClick={onToggleLang}>
            EN
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <p className="hero-eyebrow">
            {t('Comprehensive Malaysia Edition', 'Edisi Komprehensif Malaysia')}
          </p>
          <h1>
            {t('Crisis Communications', 'Komunikasi Krisis')}
            <br />
            <span className="highlight">{t('Playbook', 'Playbook')}</span>
          </h1>
          <p className="hero-sub">
            {t(
              'Built for Bursa-listed companies. Rapid bilingual response, First Sixty Minutes guidance, and clear actionable protocols to protect reputation and stakeholder trust.',
              'Dibina untuk syarikat tersenarai Bursa. Respons dwibahasa yang pantas, panduan Enam Puluh Minit Pertama, dan protokol jelas untuk melindungi reputasi serta kepercayaan pihak berkepentingan.'
            )}
          </p>

          <ul className="hero-features">
            <li>
              <span className="feat-icon">⚡</span>
              {t('Rapid response for the critical first hour', 'Respons pantas untuk sejam kritikal pertama')}
            </li>
            <li>
              <span className="feat-icon">💬</span>
              {t('Fully bilingual – Bahasa Malaysia + English', 'Sepenuhnya dwibahasa – Bahasa Malaysia + English')}
            </li>
            <li>
              <span className="feat-icon">📋</span>
              {t('Severity assessment, checklists & holding statements', 'Penilaian keterukan, senarai semak & kenyataan awal')}
            </li>
          </ul>

          <div className="hero-cta">
            <button className="btn btn-saffron btn-lg" onClick={onEnterPlaybook}>
              {t('Open Playbook', 'Buka Playbook')} →
            </button>
            <button className="btn btn-secondary btn-lg" onClick={onEnterManual}>
              {t('View Manual', 'Lihat Manual')}
            </button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="mock-window">
            <div className="mock-titlebar">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
              <span className="mock-title">CrisisComms MY</span>
            </div>
            <div className="mock-body">
              <div className="mock-sidebar">
                <div className="mock-nav active">{t('Playbook', 'Playbook')}</div>
                <div className="mock-nav">{t('Severity', 'Keterukan')}</div>
                <div className="mock-nav">{t('Statements', 'Kenyataan')}</div>
                <div className="mock-nav">{t('Log', 'Log')}</div>
              </div>
              <div className="mock-main">
                <div className="mock-label">{t('Severity Levels', 'Tahap Keterukan')}</div>
                <div className="mock-levels">
                  <div className="mock-level l1">1</div>
                  <div className="mock-level l2">2</div>
                  <div className="mock-level l3">3</div>
                  <div className="mock-level l4">4</div>
                </div>
                <div className="mock-label" style={{ marginTop: '0.75rem' }}>
                  {t('Holding Statement', 'Kenyataan Awal')}
                </div>
                <div className="mock-statement">
                  {lang === 'bm'
                    ? '[Nama Syarikat] sedang menyiasat laporan mengenai...'
                    : '[Company Name] is investigating reports concerning...'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="trust-bar">
        <div className="trust-item">
          <strong>{t('For Main & ACE Market', 'Untuk Pasaran Utama & ACE')}</strong>
          <span>{t('Bursa Malaysia listed companies', 'Syarikat tersenarai Bursa Malaysia')}</span>
        </div>
        <div className="trust-item">
          <strong>{t('BM + English', 'BM + English')}</strong>
          <span>{t('Equal weight bilingual support', 'Sokongan dwibahasa setara')}</span>
        </div>
        <div className="trust-item">
          <strong>{t('Operational Focus', 'Fokus Operasi')}</strong>
          <span>{t('Built for live crisis response', 'Dibina untuk respons krisis langsung')}</span>
        </div>
      </section>

      <footer className="landing-footer">
        CrisisComms MY · {t('Comprehensive Malaysia Edition', 'Edisi Komprehensif Malaysia')} · v0.1
        <br />
        {t(
          'This tool does not constitute legal advice.',
          'Alat ini tidak merupakan nasihat undang-undang.'
        )}
      </footer>
    </div>
  )
}
