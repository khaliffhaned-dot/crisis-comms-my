import { useState } from 'react'
import { ArrowLeft, ArrowRight, Radio, CheckCircle2, XCircle, Eye } from 'lucide-react'
import {
  IncidentIcon,
  SeverityIcon,
  RegulationIcon,
  StakeholderIcon,
  ApprovalIcon,
  ClockIcon,
} from './core/icons/EscalateIcons'
import { DEMO_SIGNALS, type DemoSignalSeed } from './demoSignals'
import { submitDemoSignal, actionSignal, dismissSignal, type SignalItem, type ThreeRLevel } from './core/api'
import type { Lang } from './core/types'
import './ops-dashboard.css'
import './demo-walkthrough.css'

interface Props {
  lang: Lang
  onToggleLang: () => void
  onExit: () => void
  /** Not called in standalone mode — the public demo never hands a prospect into the real app. Optional so PublicDemo.tsx doesn't need a stub. */
  onEnterApp?: (incidentId: string) => void
  /**
   * True for the public, no-login /demo route (PublicDemo.tsx): adds a
   * terminal "Board Summary" step with a conversion CTA instead of handing
   * the visitor into the real Command Centre. False (default) for the
   * embedded "Try it yourself" demo reached from inside the marketing
   * Landing page, which still ends by entering the real app — that visitor
   * already chose to explore the full product.
   */
  standalone?: boolean
}

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7

const STEP_LABELS: Record<Step, { en: string; bm: string }> = {
  1: { en: 'Monitoring', bm: 'Pemantauan' },
  2: { en: 'Signal', bm: 'Isyarat' },
  3: { en: 'Assessment', bm: 'Penilaian' },
  4: { en: '3R Review', bm: 'Semakan 3R' },
  5: { en: 'Decision', bm: 'Keputusan' },
  6: { en: 'Activated', bm: 'Diaktifkan' },
  7: { en: 'Board Summary', bm: 'Ringkasan Lembaga' },
}

/**
 * Severity-keyed response guidance for the Board Summary step — deterministic,
 * same "rules, never AI" posture as the rest of the demo narrative. Mirrors
 * the real product's escalation posture without calling the real API.
 */
function recommendedActions(level: number | null, lang: Lang): string {
  const en: Record<number, string> = {
    1: 'Log and monitor. No external statement required.',
    2: 'Notify the relevant internal owner. Hold a draft statement on standby.',
    3: 'Activate Decision Quorum. Clear a holding statement before any public comment.',
    4: 'Activate Decision Quorum immediately. Regulatory clocks start now — holding statement required before any public comment.',
  }
  const bm: Record<number, string> = {
    1: 'Rekod dan pantau. Tiada kenyataan luaran diperlukan.',
    2: 'Maklumkan pemilik dalaman berkenaan. Sediakan draf kenyataan sedia siaga.',
    3: 'Aktifkan Kuorum Keputusan. Lulus kenyataan awal sebelum sebarang kenyataan awam.',
    4: 'Aktifkan Kuorum Keputusan serta-merta. Jam pengawalseliaan bermula sekarang — kenyataan awal diperlukan sebelum sebarang kenyataan awam.',
  }
  const table = lang === 'bm' ? bm : en
  return (level && table[level]) || (lang === 'bm' ? 'Semakan manual diperlukan.' : 'Manual review required.')
}

function threeRClass(level: ThreeRLevel): string {
  if (level === 'High') return 'sev-chip sev-chip-4'
  if (level === 'Medium') return 'sev-chip sev-chip-3'
  return 'sev-chip sev-chip-closed'
}

export default function DemoWalkthrough({ lang, onToggleLang, onExit, onEnterApp, standalone = false }: Props) {
  const t = (en: string, bm: string) => (lang === 'bm' ? bm : en)

  const [step, setStep] = useState<Step>(1)
  const [seed, setSeed] = useState<DemoSignalSeed | null>(null)
  const [signal, setSignal] = useState<SignalItem | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [decision, setDecision] = useState<'monitor' | 'dismiss' | null>(null)
  const [incidentId, setIncidentId] = useState<string | null>(null)

  const pickSeed = async (s: DemoSignalSeed) => {
    setSeed(s)
    setStep(2)
  }

  const runAssessment = async () => {
    if (!seed || busy) return
    setBusy(true)
    setError(null)
    try {
      const result = await submitDemoSignal({
        source: seed.source,
        incident_type: seed.incidentType,
        description: lang === 'bm' ? seed.bm : seed.en,
        severity_hint: seed.severityHint,
      })
      setSignal(result)
      setStep(3)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Could not reach the demo backend.', 'Tidak dapat menghubungi backend demo.'))
    } finally {
      setBusy(false)
    }
  }

  const monitor = () => {
    setDecision('monitor')
    setStep(5)
  }

  const dismiss = async () => {
    if (!signal || busy) return
    setBusy(true)
    try {
      await dismissSignal(signal.id)
      setDecision('dismiss')
      setStep(5)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Could not reach the demo backend.', 'Tidak dapat menghubungi backend demo.'))
    } finally {
      setBusy(false)
    }
  }

  const createIncident = async () => {
    if (!signal || busy) return
    setBusy(true)
    try {
      const result = await actionSignal(signal.id)
      setIncidentId(result.incident.id)
      setStep(6)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Could not reach the demo backend.', 'Tidak dapat menghubungi backend demo.'))
    } finally {
      setBusy(false)
    }
  }

  const restart = () => {
    setStep(1)
    setSeed(null)
    setSignal(null)
    setDecision(null)
    setIncidentId(null)
    setError(null)
  }

  return (
    <div className="demo-walk">
      <header className="demo-walk__header">
        <button type="button" className="demo-walk__back" onClick={onExit}>
          <ArrowLeft size={16} strokeWidth={2.2} />
          {t('Exit simulation', 'Keluar simulasi')}
        </button>
        <div className="demo-walk__steps">
          {((standalone ? [1, 2, 3, 4, 5, 6, 7] : [1, 2, 3, 4, 5, 6]) as Step[]).map((s) => (
            <span key={s} className={`demo-walk__step ${s === step ? 'is-active' : ''} ${s < step ? 'is-done' : ''}`}>
              {STEP_LABELS[s][lang]}
            </span>
          ))}
        </div>
        <div className="ent-lang">
          <button type="button" className={lang === 'bm' ? 'is-active' : ''} onClick={() => lang !== 'bm' && onToggleLang()}>BM</button>
          <button type="button" className={lang === 'en' ? 'is-active' : ''} onClick={() => lang !== 'en' && onToggleLang()}>EN</button>
        </div>
      </header>

      <main className="demo-walk__main">
        {error && <p className="demo-walk__error">{error}</p>}

        {step === 1 && (
          <section className="demo-walk__panel">
            <div className="ops-status-row" style={{ marginBottom: '1rem' }}>
              <span className="ops-status-pill idle">{t('Normal Operations', 'Operasi Normal')}</span>
            </div>
            <h1>
              {standalone
                ? t(
                    'What if your organisation knew about a crisis 15 minutes earlier?',
                    'Bagaimana jika organisasi anda mengetahui krisis 15 minit lebih awal?'
                  )
                : t('Escalate MY — Command Centre', 'Escalate MY — Pusat Perintah')}
            </h1>
            <p className="demo-walk__lead">
              {standalone
                ? t(
                    'Escalate converts early warning signals into governed incidents with a documented decision trail. This is a live simulation — not a slideshow.',
                    'Escalate menukar isyarat amaran awal kepada insiden bertadbir urus dengan jejak keputusan yang direkod. Ini simulasi langsung — bukan tayangan slaid.'
                  )
                : t(
                    'Escalate MY does not monitor news. It converts trusted external signals into governed incident response — with human oversight, documented decisions, regulatory awareness, and executive accountability.',
                    'Escalate MY tidak memantau berita. Ia menukar isyarat luaran dipercayai kepada respons insiden bertadbir urus — dengan pengawasan manusia, keputusan direkod, kesedaran pengawalseliaan, dan akauntabiliti eksekutif.'
                  )}
            </p>
            <div className="ops-kpi-grid demo-walk__kpis">
              <div className="ops-kpi">
                <div className="ops-kpi__label">{t('Active incidents', 'Insiden aktif')}</div>
                <div className="ops-kpi__value">0</div>
              </div>
              <div className="ops-kpi">
                <div className="ops-kpi__label">{t('Open actions', 'Tindakan terbuka')}</div>
                <div className="ops-kpi__value">0</div>
              </div>
              <div className="ops-kpi">
                <div className="ops-kpi__label">{t('Regulatory clocks', 'Jam pengawalseliaan')}</div>
                <div className="ops-kpi__value">0</div>
              </div>
              <div className="ops-kpi">
                <div className="ops-kpi__label">{t('Early warning sources', 'Sumber amaran awal')}</div>
                <div className="ops-kpi__value">{DEMO_SIGNALS.length}</div>
              </div>
            </div>

            <h2 className="demo-walk__h2">{t('Simulate an early warning signal', 'Simulasikan isyarat amaran awal')}</h2>
            <p className="demo-walk__sub">
              {t(
                'Pick one to see how Escalate turns it into a governed decision.',
                'Pilih satu untuk lihat bagaimana Escalate menukarnya kepada keputusan bertadbir urus.'
              )}
            </p>
            <div className="demo-walk__seeds">
              {DEMO_SIGNALS.map((s) => (
                <button type="button" key={s.id} className="demo-walk__seed" onClick={() => pickSeed(s)}>
                  <Radio size={16} strokeWidth={2} />
                  <div>
                    <strong>{s.source}</strong>
                    <p>{lang === 'bm' ? s.bm : s.en}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 2 && seed && (
          <section className="demo-walk__panel">
            <span className="demo-walk__eyebrow">{t('Signal detected', 'Isyarat dikesan')}</span>
            <h1>{seed.source}</h1>
            <p className="demo-walk__headline">{lang === 'bm' ? seed.bm : seed.en}</p>
            <p className="demo-walk__lead">
              {t(
                'Escalate identifies this signal as potentially relevant and will run a structured assessment — rules-based, never AI-generated.',
                'Escalate mengenal pasti isyarat ini berpotensi relevan dan akan menjalankan penilaian berstruktur — berasaskan peraturan, tidak pernah dijana AI.'
              )}
            </p>
            <button type="button" className="btn btn-primary" onClick={runAssessment} disabled={busy}>
              {busy ? t('Assessing…', 'Menilai…') : t('Run assessment', 'Jalankan penilaian')}
              <ArrowRight size={15} />
            </button>
          </section>
        )}

        {step === 3 && signal && (
          <section className="demo-walk__panel">
            <span className="demo-walk__eyebrow">{t('Incident assessment', 'Penilaian insiden')}</span>
            <h1>{t('Structured, rules-based — not a guess', 'Berstruktur, berasaskan peraturan — bukan tekaan')}</h1>
            <div className="ops-kpi-grid demo-walk__kpis">
              <div className="ops-kpi">
                <div className="ops-kpi__label">{t('Category', 'Kategori')}</div>
                <div className="ops-kpi__value ops-kpi__value--sm" style={{ textTransform: 'capitalize' }}>{signal.incident_type}</div>
              </div>
              <div className="ops-kpi">
                <div className="ops-kpi__label">{t('Suggested severity', 'Keterukan dicadang')}</div>
                <div className="ops-kpi__value">
                  {signal.recommended_severity && (
                    <span className={`sev-chip sev-chip-${signal.recommended_severity}`}>L{signal.recommended_severity}</span>
                  )}
                </div>
              </div>
              <div className="ops-kpi">
                <div className="ops-kpi__label">{t('Confidence', 'Keyakinan')}</div>
                <div className="ops-kpi__value">{signal.confidence ?? '—'}%</div>
              </div>
            </div>
            <div className="demo-walk__two-col">
              <div className="ops-panel">
                <div className="ops-panel__head"><h3><StakeholderIcon size={16} /> {t('Potential stakeholders', 'Pihak berkepentingan berpotensi')}</h3></div>
                <ul className="demo-walk__taglist">
                  {signal.potential_stakeholders.map((s) => <li key={s}>{s}</li>)}
                </ul>
              </div>
              <div className="ops-panel">
                <div className="ops-panel__head"><h3><RegulationIcon size={16} /> {t('Potential authorities', 'Pihak berkuasa berpotensi')}</h3></div>
                {signal.potential_authorities.length > 0 ? (
                  <ul className="demo-walk__taglist">
                    {signal.potential_authorities.map((a) => <li key={a}>{a}</li>)}
                  </ul>
                ) : (
                  <p className="core-muted">{t('None matched automatically.', 'Tiada dipadankan secara automatik.')}</p>
                )}
              </div>
            </div>
            <button type="button" className="btn btn-primary" onClick={() => setStep(4)}>
              {t('Continue to 3R review', 'Teruskan ke semakan 3R')}
              <ArrowRight size={15} />
            </button>
          </section>
        )}

        {step === 4 && signal?.three_r && (
          <section className="demo-walk__panel">
            <span className="demo-walk__eyebrow">{t('Malaysian context risk review', 'Semakan risiko konteks Malaysia')}</span>
            <h1>{t('3R Assessment', 'Penilaian 3R')}</h1>
            <p className="demo-walk__lead">
              {t(
                'Flags only, computed from keyword heuristics — never a determination. Anything above Low should go to Legal / Corporate Affairs before any public statement.',
                'Penanda sahaja, dikira daripada heuristik kata kunci — bukan penentuan. Apa-apa melebihi Rendah perlu ke Legal / Hal Ehwal Korporat sebelum sebarang kenyataan awam.'
              )}
            </p>
            <div className="demo-walk__threeR">
              <div className="demo-walk__threeR-item">
                <span>{t('Royal', 'Diraja')}</span>
                <span className={threeRClass(signal.three_r.royal)}>{signal.three_r.royal}</span>
              </div>
              <div className="demo-walk__threeR-item">
                <span>{t('Race', 'Kaum')}</span>
                <span className={threeRClass(signal.three_r.race)}>{signal.three_r.race}</span>
              </div>
              <div className="demo-walk__threeR-item">
                <span>{t('Religion', 'Agama')}</span>
                <span className={threeRClass(signal.three_r.religion)}>{signal.three_r.religion}</span>
              </div>
            </div>
            <button type="button" className="btn btn-primary" onClick={() => setStep(5)}>
              {t('Continue to decision', 'Teruskan ke keputusan')}
              <ArrowRight size={15} />
            </button>
          </section>
        )}

        {step === 5 && signal && !decision && (
          <section className="demo-walk__panel">
            <span className="demo-walk__eyebrow">{t('Human decision point', 'Titik keputusan manusia')}</span>
            <h1>{t('Escalate never decides this for you', 'Escalate tidak pernah memutuskan ini untuk anda')}</h1>
            <p className="demo-walk__lead">
              {t('An incident is only ever created by an explicit human choice.', 'Insiden hanya dicipta melalui pilihan manusia yang jelas.')}
            </p>
            <div className="demo-walk__decision-row">
              <button type="button" className="btn btn-secondary" onClick={monitor} disabled={busy}>
                <Eye size={15} /> {t('Monitor', 'Pantau')}
              </button>
              <button type="button" className="btn btn-secondary" onClick={dismiss} disabled={busy}>
                <XCircle size={15} /> {busy ? t('Working…', 'Memproses…') : t('Dismiss', 'Tolak')}
              </button>
              <button type="button" className="btn btn-primary" onClick={createIncident} disabled={busy}>
                <IncidentIcon size={15} /> {busy ? t('Working…', 'Memproses…') : t('Create incident', 'Cipta insiden')}
              </button>
            </div>
          </section>
        )}

        {step === 5 && decision && (
          <section className="demo-walk__panel">
            <span className="demo-walk__eyebrow">{t('Decision recorded', 'Keputusan direkodkan')}</span>
            <h1>
              {decision === 'monitor'
                ? t('Signal stays on watch', 'Isyarat kekal dipantau')
                : t('Signal dismissed', 'Isyarat ditolak')}
            </h1>
            <p className="demo-walk__lead">
              {t(
                'Either way, this decision is itself recorded — nothing in Escalate disappears silently.',
                'Walau apa pun, keputusan ini sendiri direkodkan — tiada apa dalam Escalate hilang senyap.'
              )}
            </p>
            <button type="button" className="btn btn-secondary" onClick={restart}>
              {t('Run another simulation', 'Jalankan simulasi lain')}
            </button>
          </section>
        )}

        {step === 6 && incidentId && (
          <section className="demo-walk__panel">
            <span className="demo-walk__eyebrow">{t('Incident activated', 'Insiden diaktifkan')}</span>
            <h1>{t('A real incident now exists', 'Insiden sebenar kini wujud')}</h1>
            <p className="demo-walk__lead">
              {t(
                'Severity tracking, the decision log, the stakeholder register, the First 60 Minutes checklist, and regulatory clocks are all live for this incident, right now.',
                'Penjejakan keterukan, log keputusan, daftar pihak berkepentingan, senarai semak 60 Minit Pertama, dan jam pengawalseliaan semuanya aktif untuk insiden ini, sekarang.'
              )}
            </p>
            <div className="demo-walk__activated-grid">
              <div className="demo-walk__activated-item"><SeverityIcon size={18} /> {t('Severity tracking', 'Penjejakan keterukan')}</div>
              <div className="demo-walk__activated-item"><ApprovalIcon size={18} /> {t('Decision log', 'Log keputusan')}</div>
              <div className="demo-walk__activated-item"><StakeholderIcon size={18} /> {t('Stakeholder register', 'Daftar pihak berkepentingan')}</div>
              <div className="demo-walk__activated-item"><CheckCircle2 size={18} /> {t('First 60 Minutes checklist', 'Senarai semak 60 Minit Pertama')}</div>
              <div className="demo-walk__activated-item"><ClockIcon size={18} /> {t('Regulatory review timer', 'Pemasa semakan pengawalseliaan')}</div>
            </div>
            {standalone ? (
              <button type="button" className="btn btn-primary" onClick={() => setStep(7)}>
                {t('View board summary', 'Lihat ringkasan lembaga')}
                <ArrowRight size={15} />
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={() => onEnterApp?.(incidentId)}>
                {t('Continue to Executive Command Centre', 'Teruskan ke Pusat Perintah Eksekutif')}
                <ArrowRight size={15} />
              </button>
            )}
          </section>
        )}

        {step === 7 && standalone && signal && (
          <section className="demo-walk__panel">
            <span className="demo-walk__eyebrow">{t('Board summary — generated', 'Ringkasan lembaga — dijana')}</span>
            <h1>{t('Board-ready in under 3 minutes', 'Sedia untuk lembaga dalam masa kurang 3 minit')}</h1>
            <p className="demo-walk__lead">
              {t(
                `${seed?.source ?? 'The source'} reported a potential incident. Escalate assessed it as Severity L${signal.recommended_severity ?? '—'} with ${signal.confidence ?? '—'}% confidence, surfaced ${signal.potential_authorities.length} regulator${signal.potential_authorities.length === 1 ? '' : 's'} and ${signal.potential_stakeholders.length} stakeholder group${signal.potential_stakeholders.length === 1 ? '' : 's'} for review. A human operator reviewed the recommendation and activated a governed incident — the decision itself, and everything after it, is on the record.`,
                `${seed?.source ?? 'Sumber'} melaporkan potensi insiden. Escalate menilainya sebagai Keterukan L${signal.recommended_severity ?? '—'} dengan keyakinan ${signal.confidence ?? '—'}%, mengenal pasti ${signal.potential_authorities.length} pihak berkuasa dan ${signal.potential_stakeholders.length} kumpulan pihak berkepentingan untuk semakan. Seorang operator manusia menyemak cadangan tersebut dan mengaktifkan insiden bertadbir urus — keputusan itu sendiri, dan segala-galanya selepasnya, direkodkan.`
              )}
            </p>

            <div className="demo-walk__board-grid">
              <div className="ops-panel">
                <div className="ops-panel__head"><h3><SeverityIcon size={16} /> {t('Incident severity', 'Keterukan insiden')}</h3></div>
                {signal.recommended_severity && (
                  <span className={`sev-chip sev-chip-${signal.recommended_severity}`}>L{signal.recommended_severity}</span>
                )}
              </div>
              <div className="ops-panel">
                <div className="ops-panel__head"><h3><RegulationIcon size={16} /> {t('Regulatory implications', 'Implikasi pengawalseliaan')}</h3></div>
                {signal.potential_authorities.length > 0 ? (
                  <ul className="demo-walk__taglist">{signal.potential_authorities.map((a) => <li key={a}>{a}</li>)}</ul>
                ) : (
                  <p className="core-muted">{t('None matched automatically.', 'Tiada dipadankan secara automatik.')}</p>
                )}
              </div>
              <div className="ops-panel">
                <div className="ops-panel__head"><h3><StakeholderIcon size={16} /> {t('Stakeholder impact', 'Kesan pihak berkepentingan')}</h3></div>
                <ul className="demo-walk__taglist">{signal.potential_stakeholders.map((s) => <li key={s}>{s}</li>)}</ul>
              </div>
              <div className="ops-panel">
                <div className="ops-panel__head"><h3><ApprovalIcon size={16} /> {t('Recommended actions', 'Tindakan dicadangkan')}</h3></div>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#e5e7eb' }}>
                  {recommendedActions(signal.recommended_severity, lang)}
                </p>
              </div>
            </div>

            <div className="demo-walk__cta-row">
              <a className="btn btn-primary" href="mailto:hello@escalate.my?subject=Escalate%20MY%20—%20book%20a%20discussion">
                {t('Book a discussion', 'Tempah perbincangan')}
              </a>
              <a className="btn btn-secondary" href="mailto:hello@escalate.my?subject=Escalate%20MY%20—%20request%20access">
                {t('Request access', 'Minta akses')}
              </a>
            </div>
            <button type="button" className="demo-walk__restart-link" onClick={restart}>
              {t('Run another simulation', 'Jalankan simulasi lain')}
            </button>
          </section>
        )}
      </main>
    </div>
  )
}
