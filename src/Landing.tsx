import { useState } from 'react'
import {
  ShieldCheck,
  Menu,
  X,
  ArrowRight,
  AlertTriangle,
  Clock,
  Scale,
  FileCheck2,
  Sparkles,
  Users,
} from 'lucide-react'

type Lang = 'bm' | 'en'

interface LandingProps {
  lang: Lang
  onEnterPlaybook: () => void
  onEnterManual: () => void
  onToggleLang: () => void
}

const FEATURES = [
  {
    icon: AlertTriangle,
    en: { title: 'Severity matrix', body: 'L1–L4 with clear criteria, and when a Bursa disclosure assessment is required.' },
    bm: { title: 'Matriks keterukan', body: 'L1–L4 dengan kriteria jelas, dan bila penilaian pendedahan Bursa diperlukan.' },
  },
  {
    icon: Clock,
    en: { title: 'First 60 minutes', body: '13 timed steps with a named owner for every task, from the first minute.' },
    bm: { title: '60 minit pertama', body: '13 langkah berwaktu dengan pemilik dinamakan untuk setiap tugasan.' },
  },
  {
    icon: Scale,
    en: { title: 'Regulatory clock', body: 'Bursa, PDPA, DOSH, NACSA — deadlines tracked with the source reference.' },
    bm: { title: 'Jam pengawalseliaan', body: 'Bursa, PDPA, DOSH, NACSA — tarikh akhir dijejak dengan rujukan sumber.' },
  },
  {
    icon: FileCheck2,
    en: { title: 'Statements + audit', body: 'Bilingual drafts, an approval path, and a full exportable audit trail.' },
    bm: { title: 'Kenyataan + audit', body: 'Draf dwibahasa, laluan kelulusan, dan jejak audit penuh boleh dieksport.' },
  },
]

const STEPS = [
  {
    n: 1,
    en: { title: 'Assess', body: 'Classify severity. Decision Intelligence recommends the next actions.' },
    bm: { title: 'Nilai', body: 'Tentukan tahap keterukan. Kepintaran Keputusan mencadangkan tindakan.' },
  },
  {
    n: 2,
    en: { title: 'Coordinate', body: 'Work the first-60-minutes checklist. Start the regulatory clocks that apply.' },
    bm: { title: 'Selaras', body: 'Jalankan senarai semak 60 minit pertama. Mulakan jam pengawalseliaan berkenaan.' },
  },
  {
    n: 3,
    en: { title: 'Decide & log', body: 'Quorum approves. Every decision is written to the audit trail.' },
    bm: { title: 'Putuskan & rekod', body: 'Kuorum meluluskan. Setiap keputusan direkodkan dalam jejak audit.' },
  },
]

export default function Landing({ lang, onEnterPlaybook, onEnterManual, onToggleLang }: LandingProps) {
  const [navOpen, setNavOpen] = useState(false)
  const t = (en: string, bm: string) => (lang === 'bm' ? bm : en)
  const setLang = (next: Lang) => {
    if (lang !== next) onToggleLang()
  }
  const closeNav = () => setNavOpen(false)

  return (
    <div className="landing landing--ent">
      <header className="ent-header">
        <div className="ent-wrap ent-header__bar">
          <div className="ent-brand">
            <span className="ent-brand__mark" aria-hidden="true">
              <ShieldCheck size={18} strokeWidth={2.4} />
            </span>
            <span className="ent-brand__name">
              Escalate<span className="ent-brand__accent"> MY</span>
            </span>
          </div>

          <nav className={`ent-nav ${navOpen ? 'is-open' : ''}`} aria-label={t('Primary', 'Utama')}>
            <a className="ent-nav__link" href="#features" onClick={closeNav}>
              {t('Features', 'Ciri-ciri')}
            </a>
            <a className="ent-nav__link" href="#how" onClick={closeNav}>
              {t('How it works', 'Cara Kerja')}
            </a>
            <button
              type="button"
              className="ent-nav__link"
              onClick={() => {
                closeNav()
                onEnterManual()
              }}
            >
              {t('Manual', 'Manual')}
            </button>
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
              aria-label={t('Open menu', 'Buka menu')}
              aria-expanded={navOpen}
            >
              {navOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <button type="button" className="ent-btn ent-btn--primary ent-header__cta" onClick={onEnterPlaybook}>
              {t('Open Command Centre', 'Buka Pusat Perintah')}
              <ArrowRight size={15} strokeWidth={2.4} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="ent-hero">
          <div className="ent-wrap ent-hero__grid">
            <div className="ent-hero__copy">
              <span className="ent-eyebrow">
                <span className="ent-eyebrow__dot" aria-hidden="true" />
                {t('For Bursa Malaysia-listed PLCs · Enterprise', 'Untuk PLC Tersenarai Bursa Malaysia · Enterprise')}
              </span>
              <h1 className="ent-h1">
                {t('Crisis response, ', 'Respons krisis, ')}
                <span className="ent-h1__accent">{t('decided in the first hour.', 'diputuskan dalam sejam pertama.')}</span>
              </h1>
              <p className="ent-lead">
                {t(
                  'Escalate MY is the operating system for Bursa-listed PLCs, GLCs and regulated industries. Assess severity, align quorum, and keep a full record of every decision.',
                  'Escalate MY ialah sistem operasi untuk PLC tersenarai Bursa, GLC dan industri terkawal selia. Nilai keterukan, selaras kuorum, dan rekod setiap keputusan.'
                )}
              </p>
              <div className="ent-hero__cta">
                <button type="button" className="ent-btn ent-btn--primary" onClick={onEnterPlaybook}>
                  {t('Open Command Centre', 'Buka Pusat Perintah')}
                  <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
                </button>
                <button type="button" className="ent-btn ent-btn--outline" onClick={onEnterManual}>
                  {t('View the Manual', 'Lihat Manual')}
                </button>
              </div>
              <div className="ent-chips">
                <span className="ent-chip">Bursa LR 9.03–9.11</span>
                <span className="ent-chip">{t('PDPA 72hr', 'PDPA 72 jam')}</span>
                <span className="ent-chip">L1–L4</span>
                <span className="ent-chip ent-chip--accent">
                  {t('Recommendations only · Quorum required', 'Cadangan sahaja · Kuorum wajib')}
                </span>
              </div>
            </div>

            <div className="ent-panel" role="group" aria-label={t('System status preview', 'Pratonton status sistem')}>
              <div className="ent-panel__head">
                <span className="ent-panel__label">{t('SYSTEM', 'SISTEM')}</span>
                <span className="ent-panel__status">
                  <span className="ent-panel__status-dot" aria-hidden="true" />
                  {t('ONLINE', 'DALAM TALIAN')}
                </span>
              </div>
              <div className="ent-panel__grid">
                <div className="ent-panel__tile">
                  <span className="ent-panel__tile-label">{t('SEVERITY', 'TAHAP')}</span>
                  <span className="ent-panel__tile-value">L1–L4</span>
                </div>
                <div className="ent-panel__tile">
                  <span className="ent-panel__tile-label">{t('MODULES', 'MODUL')}</span>
                  <span className="ent-panel__tile-value">9</span>
                </div>
                <div className="ent-panel__tile">
                  <span className="ent-panel__tile-label">{t('FIRST 60 MIN', '60 MINIT')}</span>
                  <span className="ent-panel__tile-value">{t('13 steps', '13 langkah')}</span>
                </div>
                <div className="ent-panel__tile">
                  <span className="ent-panel__tile-label">{t('QUORUM', 'KUORUM')}</span>
                  <span className="ent-panel__tile-value">{t('Core', 'Teras')}</span>
                </div>
              </div>
              <div className="ent-panel__strip">
                <Sparkles size={16} strokeWidth={2} aria-hidden="true" />
                <div className="ent-panel__strip-text">
                  <span>{t('Decision Intelligence', 'Kepintaran Keputusan')}</span>
                  <span className="ent-panel__strip-sub">{t('Recommends, then you approve', 'Cadang, kemudian anda lulus')}</span>
                </div>
              </div>
              <p className="ent-panel__note">
                {t(
                  'Recommendations only. Decision Quorum approves before any external statement or filing.',
                  'Cadangan sahaja. Kuorum Keputusan meluluskan sebelum sebarang kenyataan atau pemfailan luaran.'
                )}
              </p>
            </div>
          </div>
        </section>

        <section id="features" className="ent-section ent-section--muted">
          <div className="ent-wrap">
            <h2 className="ent-h2">{t('Built for the first hour', 'Dibina untuk sejam pertama')}</h2>
            <div className="ent-grid-4">
              {FEATURES.map((f) => {
                const Icon = f.icon
                const copy = lang === 'bm' ? f.bm : f.en
                return (
                  <div className="ent-card" key={copy.title}>
                    <span className="ent-card__icon" aria-hidden="true">
                      <Icon size={18} strokeWidth={1.8} />
                    </span>
                    <h3 className="ent-card__title">{copy.title}</h3>
                    <p className="ent-card__body">{copy.body}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section id="how" className="ent-section">
          <div className="ent-wrap">
            <h2 className="ent-h2">{t('How teams use it', 'Bagaimana pasukan menggunakannya')}</h2>
            <div className="ent-grid-3">
              {STEPS.map((s) => {
                const copy = lang === 'bm' ? s.bm : s.en
                return (
                  <div className="ent-card ent-card--step" key={copy.title}>
                    <span className="ent-step-num" aria-hidden="true">
                      {s.n}
                    </span>
                    <h3 className="ent-card__title">{copy.title}</h3>
                    <p className="ent-card__body">{copy.body}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="ent-section ent-section--muted ent-cta-band">
          <div className="ent-wrap ent-cta-band__inner">
            <Users size={22} strokeWidth={1.8} aria-hidden="true" className="ent-cta-band__icon" />
            <h2 className="ent-h2">{t('Ready for when the first hour matters.', 'Sedia apabila sejam pertama penting.')}</h2>
            <p className="ent-lead ent-lead--center">
              {t(
                'Open the Command Centre for a live response, or the Manual for setup and training.',
                'Buka Pusat Perintah untuk respons langsung, atau Manual untuk persediaan dan latihan.'
              )}
            </p>
            <button type="button" className="ent-btn ent-btn--primary" onClick={onEnterPlaybook}>
              {t('Open Command Centre', 'Buka Pusat Perintah')}
              <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
            </button>
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
