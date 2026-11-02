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
      <header className="landing-header">
        <div className="landing-brand">
          <span className="brand-mark">◆</span>
          <div>
            <span className="brand-name">Escalate MY</span>
            <span className="brand-tag">{t('Enterprise Edition', 'Edisi Enterprise')}</span>
          </div>
        </div>
        <div className="header-right">
          <nav className="landing-nav">
            <button type="button" onClick={onEnterPlaybook}>{t('Playbook', 'Playbook')}</button>
            <button type="button" onClick={onEnterManual}>{t('Manual', 'Manual')}</button>
          </nav>
          <div className="lang-toggle">
            <button className={lang === 'bm' ? 'active' : ''} onClick={onToggleLang}>BM</button>
            <button className={lang === 'en' ? 'active' : ''} onClick={onToggleLang}>EN</button>
          </div>
        </div>
      </header>

      <section className="hero hero-enterprise">
        <div className="hero-content">
          <p className="hero-eyebrow">{t('For Main Market & ACE Market Issuers', 'Untuk Penerbit Pasaran Utama & ACE')}</p>
          <h1>
            {t('Crisis communications,', 'Komunikasi krisis,')}
            <br />
            <span className="highlight">{t('under control in the first hour.', 'terkawal dalam sejam pertama.')}</span>
          </h1>
          <p className="hero-sub">
            {t(
              'An operational playbook and reference manual built for Malaysian listed companies. Severity assessment, bilingual holding statements, decision logging, and Bursa-aware guidance — in one focused tool.',
              'Playbook operasi dan manual rujukan dibina untuk syarikat tersenarai Malaysia. Penilaian keterukan, kenyataan awal dwibahasa, log keputusan, dan panduan sedar Bursa — dalam satu alat berfokus.'
            )}
          </p>
          <div className="hero-cta">
            <button className="btn btn-saffron btn-lg" onClick={onEnterPlaybook}>
              {t('Open Playbook', 'Buka Playbook')}
            </button>
            <button className="btn btn-secondary btn-lg" onClick={onEnterManual}>
              {t('View Manual', 'Lihat Manual')}
            </button>
          </div>
          <p className="hero-note">
            {t('No account required for this demo build. Content is for operational readiness, not legal advice.', 'Tiada akaun diperlukan untuk binaan demo ini. Kandungan untuk kesediaan operasi, bukan nasihat undang-undang.')}
          </p>
        </div>
        <div className="hero-visual">
          <div className="dash-preview">
            <div className="dash-preview-header">
              <span className="dash-preview-title">Escalate MY</span>
              <span className="dash-preview-badge">{t('Live mode', 'Mod langsung')}</span>
            </div>
            <div className="dash-preview-grid">
              <div className="dash-preview-card">
                <span className="dpc-label">{t('Severity', 'Keterukan')}</span>
                <span className="dpc-value">L2–L4</span>
              </div>
              <div className="dash-preview-card">
                <span className="dpc-label">{t('Languages', 'Bahasa')}</span>
                <span className="dpc-value">BM · EN</span>
              </div>
              <div className="dash-preview-card">
                <span className="dpc-label">{t('Scenarios', 'Senario')}</span>
                <span className="dpc-value">6</span>
              </div>
              <div className="dash-preview-card">
                <span className="dpc-label">{t('First hour', 'Sejam pertama')}</span>
                <span className="dpc-value">60 min</span>
              </div>
            </div>
            <div className="dash-preview-row">
              <div className="severity-pills">
                <span className="pill l1">1</span>
                <span className="pill l2">2</span>
                <span className="pill l3">3</span>
                <span className="pill l4">4</span>
              </div>
              <span className="dash-preview-caption">{t('Severity matrix ready', 'Matriks keterukan sedia')}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="enterprise-strip">
        <div className="strip-inner">
          <div className="strip-item">
            <strong>{t('Bursa-oriented', 'Berorientasikan Bursa')}</strong>
            <span>{t('Disclosure-aware sequencing and language', 'Penjujukan dan bahasa sedar pendedahan')}</span>
          </div>
          <div className="strip-item">
            <strong>{t('Equal-weight BM', 'BM setara')}</strong>
            <span>{t('Bahasa Malaysia as a primary working language', 'Bahasa Malaysia sebagai bahasa kerja utama')}</span>
          </div>
          <div className="strip-item">
            <strong>{t('Operational focus', 'Fokus operasi')}</strong>
            <span>{t('Built for live response, not slide decks', 'Dibina untuk respons langsung, bukan slaid')}</span>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">{t('What you get', 'Apa yang anda peroleh')}</h2>
        <div className="features-grid">
          <article className="feature-card">
            <h3>{t('Playbook Mode', 'Mod Playbook')}</h3>
            <p>{t('Severity assessment, First Sixty Minutes checklist, holding statement builder, and timestamped decision log — designed for use under time pressure.', 'Penilaian keterukan, senarai semak Enam Puluh Minit Pertama, pembina kenyataan awal, dan log keputusan berwaktu — direka untuk digunakan di bawah tekanan masa.')}</p>
          </article>
          <article className="feature-card">
            <h3>{t('Manual Mode', 'Mod Manual')}</h3>
            <p>{t('Reference guidance: principles, roles, stakeholder priorities, media protocols, BM guidance, East Malaysia considerations, post-crisis review, and glossary.', 'Panduan rujukan: prinsip, peranan, keutamaan pihak berkepentingan, protokol media, panduan BM, pertimbangan Malaysia Timur, semakan pasca-krisis, dan glosari.')}</p>
          </article>
          <article className="feature-card">
            <h3>{t('Six scenario templates', 'Enam templat senario')}</h3>
            <p>{t('Operational/safety, market-sensitive, community/land, internal, cyber/data, and governance — each with bilingual holding language ready to adapt.', 'Operasi/keselamatan, sensitif pasaran, komuniti/tanah, dalaman, siber/data, dan tadbir urus — setiap satu dengan bahasa kenyataan awal dwibahasa sedia diadaptasi.')}</p>
          </article>
        </div>
      </section>

      <section className="how-section">
        <h2 className="section-title">{t('How teams use it', 'Bagaimana pasukan menggunakannya')}</h2>
        <ol className="how-steps">
          <li>
            <span className="step-num">1</span>
            <div>
              <strong>{t('Assess', 'Nilai')}</strong>
              <p>{t('Select severity level. Recommended actions appear immediately.', 'Pilih tahap keterukan. Tindakan disyorkan dipaparkan serta-merta.')}</p>
            </div>
          </li>
          <li>
            <span className="step-num">2</span>
            <div>
              <strong>{t('Check', 'Semak')}</strong>
              <p>{t('Work through the First Sixty Minutes checklist and log decisions.', 'Kerjakan senarai semak Enam Puluh Minit Pertama dan log keputusan.')}</p>
            </div>
          </li>
          <li>
            <span className="step-num">3</span>
            <div>
              <strong>{t('Draft', 'Gubal')}</strong>
              <p>{t('Generate a bilingual holding statement, edit, and copy for clearance.', 'Jana kenyataan awal dwibahasa, sunting, dan salin untuk kelulusan.')}</p>
            </div>
          </li>
        </ol>
      </section>

      <section className="cta-band">
        <div className="cta-band-inner">
          <h2>{t('Ready when the first hour matters.', 'Sedia apabila sejam pertama penting.')}</h2>
          <p>{t('Open the Playbook for live response, or the Manual for preparation and training.', 'Buka Playbook untuk respons langsung, atau Manual untuk persediaan dan latihan.')}</p>
          <div className="hero-cta">
            <button className="btn btn-saffron btn-lg" onClick={onEnterPlaybook}>{t('Open Playbook', 'Buka Playbook')}</button>
            <button className="btn btn-secondary btn-lg" onClick={onEnterManual}>{t('View Manual', 'Lihat Manual')}</button>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-inner">
          <span>Escalate MY · {t('Comprehensive Malaysia Edition', 'Edisi Komprehensif Malaysia')} · v0.2</span>
          <span>{t('This tool does not constitute legal advice. Verify all regulatory obligations with counsel.', 'Alat ini tidak merupakan nasihat undang-undang. Sahkan semua kewajipan peraturan dengan penasihat.')}</span>
        </div>
      </footer>
    </div>
  )
}
