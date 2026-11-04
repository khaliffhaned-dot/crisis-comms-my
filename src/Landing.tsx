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
  CheckCircle2,
} from 'lucide-react'
import './ops-dashboard.css'

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
    en: {
      title: 'Regulatory clock',
      body: 'Mandatory disclosure deadlines tracked automatically, with the source reference.',
      meta: 'Bursa · PDPA · DOSH · NACSA',
    },
    bm: {
      title: 'Jam pengawalseliaan',
      body: 'Tarikh akhir pendedahan wajib dijejak secara automatik, dengan rujukan sumber.',
      meta: 'Bursa · PDPA · DOSH · NACSA',
    },
  },
  {
    icon: FileCheck2,
    en: {
      title: 'Every decision traceable',
      body: 'Statements, approvals and authorisations — preserved in one exportable audit record.',
    },
    bm: {
      title: 'Setiap keputusan dijejak',
      body: 'Kenyataan, kelulusan dan kebenaran — direkod dalam satu jejak audit boleh dieksport.',
    },
  },
]

const STEPS = [
  {
    n: 1,
    en: { title: 'Detect', body: 'Establish facts and classify severity. Decision Intelligence recommends the next actions.' },
    bm: { title: 'Pengesanan', body: 'Tentukan fakta dan tahap keterukan. Kepintaran Keputusan mencadangkan tindakan.' },
  },
  {
    n: 2,
    en: { title: 'Mobilise', body: 'Activate owners and response teams. Work the first-60-minutes checklist; start the regulatory clocks that apply.' },
    bm: { title: 'Mobilisasi', body: 'Aktifkan pemilik dan pasukan respons. Jalankan senarai semak 60 minit pertama; mulakan jam pengawalseliaan berkenaan.' },
  },
  {
    n: 3,
    en: { title: 'Govern', body: 'Approve actions and maintain audit evidence. Quorum approves — every decision is written to the audit trail.' },
    bm: { title: 'Tadbir Urus', body: 'Luluskan tindakan dan kekalkan bukti audit. Kuorum meluluskan — setiap keputusan direkodkan dalam jejak audit.' },
  },
]

/**
 * Only claims the shipped product can actually back — no invented metrics
 * (e.g. no "assessed in under 5 minutes", which nothing in this codebase
 * measures or proves). Each line maps to a real, verifiable capability:
 * the 13-step First 60 Minutes™ checklist, the Regulatory Clock cron that
 * tracks and escalates the 4 obligation sources, the SHA-256 hash-chained
 * audit_log, the QuorumRole-gated approval flow, and the 6 Approved
 * Responses™ templates.
 */
const PROOF = {
  en: [
    '13 First 60 Minutes™ steps, each with a named owner and a timed deadline',
    'Regulatory deadlines tracked automatically — Bursa, PDPA, DOSH, NACSA — and escalated if overdue',
    'Every statement, approval and audit entry hash-chained for tamper-evidence',
    'Decision Quorum requires named sign-off — nothing releases without approval',
    'Approved Responses™ — six pre-vetted bilingual statement templates ready for Legal',
  ],
  bm: [
    '13 langkah First 60 Minutes™, setiap satu dengan pemilik dinamakan dan tarikh akhir berwaktu',
    'Tarikh akhir pengawalseliaan dijejak secara automatik — Bursa, PDPA, DOSH, NACSA — dan dieskalasi jika tertunggak',
    'Setiap kenyataan, kelulusan dan entri audit dirantai cincang untuk bukti anti-ganggu',
    'Kuorum Keputusan memerlukan kelulusan bernama — tiada apa dikeluarkan tanpa kelulusan',
    'Respons Diluluskan™ — enam templat kenyataan dwibahasa pra-lulus sedia untuk Legal',
  ],
}

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
              {t('View Command Centre', 'Lihat Pusat Perintah')}
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
                  {t('View Command Centre', 'Lihat Pusat Perintah')}
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
                    {'meta' in copy && copy.meta && <p className="ent-card__meta">{copy.meta}</p>}
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

        <section className="ent-section ent-section--muted">
          <div className="ent-wrap" style={{ textAlign: 'center' }}>
            <span className="ent-eyebrow">
              <span className="ent-eyebrow__dot" aria-hidden="true" />
              {t('See it in action', 'Lihat ia beraksi')}
            </span>
            <h2 className="ent-h2" style={{ marginBottom: '8px' }}>
              {t('What Command Centre looks like mid-incident', 'Rupa Pusat Perintah semasa insiden')}
            </h2>
            <p className="ent-lead ent-lead--center" style={{ marginBottom: '28px' }}>
              {t(
                'An illustrative incident, not live data — the same view your team sees once logged in.',
                'Insiden ilustrasi, bukan data langsung — paparan sama yang dilihat pasukan anda selepas log masuk.'
              )}
            </p>
            <div className="ops-dashboard ent-dashboard-preview" style={{ textAlign: 'left' }}>
              <div className="ops-dashboard__top">
                <div className="ops-dashboard__title-block">
                  <div className="ops-status-row">
                    <span className="ops-status-pill elevated">{t('Active · Level 3', 'Aktif · Tahap 3')}</span>
                    <span className="ent-example-badge">{t('EXAMPLE INCIDENT', 'CONTOH INSIDEN')}</span>
                  </div>
                  <h3>{t('Incident command dashboard', 'Papan pemuka perintah insiden')}</h3>
                  <p className="ops-context">
                    {t('Product recall scenario · illustrative', 'Senario penarikan balik produk · ilustrasi')}
                  </p>
                </div>
              </div>
              <div className="ops-kpi-grid ent-dashboard-kpis">
                <div className="ops-kpi">
                  <div className="ops-kpi__label">{t('Severity', 'Keterukan')}</div>
                  <div className="ops-kpi__value"><span className="sev-badge sev-3">L3</span></div>
                  <div className="ops-kpi__meta">{t('Material impact likely', 'Kesan material berkemungkinan')}</div>
                </div>
                <div className="ops-kpi">
                  <div className="ops-kpi__label">{t('Regulatory clock', 'Jam pengawalseliaan')}</div>
                  <div className="ops-kpi__value">18<span className="ops-kpi__denom">h</span> 32<span className="ops-kpi__denom">m</span></div>
                  <div className="ops-kpi__meta">{t('Bursa disclosure window', 'Tetingkap pendedahan Bursa')}</div>
                </div>
                <div className="ops-kpi">
                  <div className="ops-kpi__label">{t('Decisions logged', 'Keputusan direkod')}</div>
                  <div className="ops-kpi__value">12</div>
                  <div className="ops-kpi__meta">{t('Hash-chained audit trail', 'Jejak audit rantaian cincang')}</div>
                </div>
                <div className="ops-kpi">
                  <div className="ops-kpi__label">{t('Stakeholders active', 'Pihak berkepentingan aktif')}</div>
                  <div className="ops-kpi__value">7</div>
                  <div className="ops-kpi__meta">{t('Core quorum engaged', 'Kuorum teras terlibat')}</div>
                </div>
                <div className="ops-kpi">
                  <div className="ops-kpi__label">{t('Open actions', 'Tindakan terbuka')}</div>
                  <div className="ops-kpi__value">14</div>
                  <div className="ops-kpi__meta">{t('First 60 Minutes tasks', 'Tugasan 60 Minit Pertama')}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="ent-section">
          <div className="ent-wrap">
            <h2 className="ent-h2">{t('Every incident leaves a record', 'Setiap insiden meninggalkan rekod')}</h2>
            <ul className="ent-proof-list">
              {PROOF[lang].map((line) => (
                <li className="ent-proof-item" key={line}>
                  <CheckCircle2 size={18} strokeWidth={2} aria-hidden="true" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
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
              {t('View Command Centre', 'Lihat Pusat Perintah')}
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
