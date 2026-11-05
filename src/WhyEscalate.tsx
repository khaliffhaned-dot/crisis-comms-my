import { useState } from 'react'
import { ArrowRight, ShieldCheck, Radar, FileWarning, Workflow, MessageSquareText, Menu, X } from 'lucide-react'
import './landing-light.css'
import './why-escalate.css'

type Lang = 'bm' | 'en'

/**
 * Category positioning only — never names a competitor (Dataminr, Meltwater,
 * Resolver, ServiceNow, etc.). A category survives even when products
 * change; a named-competitor comparison needs ongoing fact-checking this
 * page doesn't want to own. See the "Governance Gap" copy below for why:
 * detection/communication/workflow tools are common, a system that governs
 * decisions in the first hour is the gap Escalate fills.
 */
const COMPARISON = [
  {
    icon: Radar,
    en: { category: 'Monitoring Platforms', purpose: 'Identify signals and events', role: 'Coordinate response' },
    bm: { category: 'Platform Pemantauan', purpose: 'Kenal pasti isyarat dan peristiwa', role: 'Selaraskan respons' },
  },
  {
    icon: FileWarning,
    en: { category: 'Risk Platforms', purpose: 'Record risks and controls', role: 'Govern live incidents' },
    bm: { category: 'Platform Risiko', purpose: 'Rekod risiko dan kawalan', role: 'Tadbir insiden langsung' },
  },
  {
    icon: Workflow,
    en: { category: 'Workflow Platforms', purpose: 'Automate business processes', role: 'Orchestrate crisis decisions' },
    bm: { category: 'Platform Aliran Kerja', purpose: 'Automasi proses perniagaan', role: 'Selaraskan keputusan krisis' },
  },
  {
    icon: MessageSquareText,
    en: { category: 'Communications Tools', purpose: 'Publish messages', role: 'Maintain auditable command and control' },
    bm: { category: 'Alat Komunikasi', purpose: 'Terbitkan mesej', role: 'Kekalkan arahan dan kawalan boleh audit' },
  },
]

const GAP_STEPS = [
  { en: 'Detect', bm: 'Pengesanan' },
  { en: 'Mobilise', bm: 'Mobilisasi' },
  { en: 'Govern', bm: 'Tadbir Urus' },
]

const AUDIENCE = [
  { en: 'Public Listed Companies', bm: 'Syarikat Tersenarai Awam' },
  { en: 'Government-Linked Companies', bm: 'Syarikat Berkaitan Kerajaan' },
  { en: 'Regulated Industries', bm: 'Industri Terkawal Selia' },
  { en: 'Corporate Affairs', bm: 'Hal Ehwal Korporat' },
  { en: 'Risk Management', bm: 'Pengurusan Risiko' },
  { en: 'Executive Leadership', bm: 'Kepimpinan Eksekutif' },
]

export default function WhyEscalate() {
  const [lang, setLang] = useState<Lang>('en')
  const [navOpen, setNavOpen] = useState(false)
  const t = (en: string, bm: string) => (lang === 'bm' ? bm : en)
  const closeNav = () => setNavOpen(false)

  return (
    <div className="landing landing--ent">
      <header className="ent-header">
        <div className="ent-wrap ent-header__bar">
          <a className="ent-brand" href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="ent-brand__mark" aria-hidden="true">
              <ShieldCheck size={18} strokeWidth={2.4} />
            </span>
            <span className="ent-brand__name">
              Escalate<span className="ent-brand__accent"> MY</span>
            </span>
          </a>

          <nav className={`ent-nav ${navOpen ? 'is-open' : ''}`} aria-label={t('Primary', 'Utama')}>
            <a className="ent-nav__link" href="/" onClick={closeNav}>
              {t('Home', 'Laman Utama')}
            </a>
            <a className="ent-nav__link" href="/demo" onClick={closeNav}>
              {t('Live demo', 'Demo Langsung')}
            </a>
            <div className="ent-lang" role="group" aria-label={t('Language', 'Bahasa')}>
              <button type="button" className={lang === 'bm' ? 'is-active' : ''} onClick={() => setLang('bm')}>
                BM
              </button>
              <button type="button" className={lang === 'en' ? 'is-active' : ''} onClick={() => setLang('en')}>
                EN
              </button>
            </div>
          </nav>

          <div className="ent-header__actions">
            <button
              type="button"
              className="ent-menu-btn"
              onClick={() => setNavOpen((v) => !v)}
              aria-label={navOpen ? t('Close menu', 'Tutup menu') : t('Open menu', 'Buka menu')}
              aria-expanded={navOpen}
            >
              {navOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <a className="ent-btn ent-btn--primary ent-header__cta" href="/">
              {t('See the platform', 'Lihat platform')}
              <ArrowRight size={15} strokeWidth={2.4} aria-hidden="true" />
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="ent-section why-hero">
          <div className="ent-wrap" style={{ textAlign: 'center', maxWidth: '760px' }}>
            <span className="ent-eyebrow">
              <span className="ent-eyebrow__dot" aria-hidden="true" />
              {t('Why Escalate exists', 'Mengapa Escalate wujud')}
            </span>
            <h1 className="ent-h1" style={{ fontSize: '2.4rem' }}>
              {t('Most platforms solve one part of a crisis.', 'Kebanyakan platform menyelesaikan satu bahagian krisis sahaja.')}
              <br />
              <span className="ent-h1__accent">{t('Escalate MY™ governs the response.', 'Escalate MY™ mentadbir respons tersebut.')}</span>
            </h1>
          </div>
        </section>

        <section className="ent-section ent-section--muted">
          <div className="ent-wrap">
            <h2 className="ent-h2">{t('Where Escalate sits', 'Kedudukan Escalate')}</h2>
            <p className="ent-lead" style={{ marginBottom: '28px' }}>
              {t(
                'Category positioning, not a feature comparison — the tools below are common and useful. Escalate is what most organisations are missing: the layer that governs the decision, not just the input to it.',
                'Kedudukan kategori, bukan perbandingan ciri — alat di bawah lazim dan berguna. Escalate ialah apa yang kebanyakan organisasi tiada: lapisan yang mentadbir keputusan, bukan sekadar input kepadanya.'
              )}
            </p>
            <div className="why-compare-scroll">
              <table className="why-compare-table">
                <thead>
                  <tr>
                    <th>{t('Platform Category', 'Kategori Platform')}</th>
                    <th>{t('Primary Purpose', 'Tujuan Utama')}</th>
                    <th>{t("Escalate's Role", 'Peranan Escalate')}</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row) => {
                    const copy = lang === 'bm' ? row.bm : row.en
                    const Icon = row.icon
                    return (
                      <tr key={copy.category}>
                        <td>
                          <span className="why-compare-table__category">
                            <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
                            {copy.category}
                          </span>
                        </td>
                        <td className="why-compare-table__muted">{copy.purpose}</td>
                        <td className="why-compare-table__role">{copy.role}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="ent-section">
          <div className="ent-wrap" style={{ textAlign: 'center' }}>
            <h2 className="ent-h2">{t('The governance gap', 'Jurang tadbir urus')}</h2>
            <div className="why-gap-steps">
              {GAP_STEPS.map((s, i) => (
                <div className="why-gap-step" key={s.en}>
                  <span className="why-gap-step__label">{lang === 'bm' ? s.bm : s.en}</span>
                  {i < GAP_STEPS.length - 1 && <ArrowRight size={18} strokeWidth={2} className="why-gap-step__arrow" aria-hidden="true" />}
                </div>
              ))}
            </div>
            <div className="why-gap-copy">
              <p>{t('Most organisations have tools for detection.', 'Kebanyakan organisasi mempunyai alat untuk pengesanan.')}</p>
              <p>{t('Many have tools for communication.', 'Ramai mempunyai alat untuk komunikasi.')}</p>
              <p className="why-gap-copy__emphasis">
                {t(
                  'Few have a system for governing decisions during the first hour of a crisis.',
                  'Hanya segelintir mempunyai sistem untuk mentadbir keputusan dalam sejam pertama krisis.'
                )}
              </p>
            </div>
          </div>
        </section>

        <section className="ent-section ent-section--muted">
          <div className="ent-wrap" style={{ textAlign: 'center' }}>
            <h2 className="ent-h2">{t("Who it's for", 'Untuk siapa')}</h2>
            <ul className="why-audience-list">
              {AUDIENCE.map((a) => (
                <li key={a.en}>
                  <span className="ent-chip">{lang === 'bm' ? a.bm : a.en}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="ent-section ent-cta-band">
          <div className="ent-wrap ent-cta-band__inner">
            <h2 className="ent-h2">{t('See how it works.', 'Lihat cara ia berfungsi.')}</h2>
            <div className="why-cta-row">
              <a className="ent-btn ent-btn--primary" href="/">
                {t('See the platform', 'Lihat platform')}
                <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
              </a>
              <a className="ent-btn ent-btn--outline" href="/demo">
                {t('Try the live demonstration', 'Cuba demonstrasi langsung')}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="ent-footer">
        <div className="ent-wrap ent-footer__inner">
          <div className="ent-brand ent-brand--sm">
            <span className="ent-brand__mark" aria-hidden="true">
              <ShieldCheck size={14} strokeWidth={2.4} />
            </span>
            <span>{t('Escalate MY · Quantum PR · Malaysia', 'Escalate MY · Quantum PR · Malaysia')}</span>
          </div>
          <span className="ent-footer__disclaimer">
            {t('Operational guidance only — not legal advice.', 'Panduan operasi sahaja — bukan nasihat undang-undang.')}
          </span>
        </div>
      </footer>
    </div>
  )
}
