import { useCallback, useEffect, useState } from 'react'
import Landing from './Landing'
import Manual from './Manual'
import First60Module from './First60Module'
import ClocksModule from './ClocksModule'
import CommandCentre from './core/CommandCentre'
import QuorumModule from './core/QuorumModule'
import AuditModule from './core/AuditModule'
import DirectoryModule from './core/DirectoryModule'
import { DecisionIntelligence, RegulatoryIntelligence, BoardIntelligence } from './core/IntelligenceModules'
import { CORE_MODULES, type CoreSection } from './core/moduleConfig'
import {
  listIncidents,
  saveIncident,
  createIncident,
  appendAudit,
  backendMode,
} from './core/api'
import type { Incident, Lang, QuorumState, Severity } from './core/types'
import { SEVERITY_DATA } from './playbookData'
import './core/core.css'

const SCENARIOS = {
  en: [
    { id: 'operational', label: 'Operational / Safety' },
    { id: 'market', label: 'Market-Sensitive' },
    { id: 'community', label: 'Community / Land' },
    { id: 'internal', label: 'Internal' },
    { id: 'cyber', label: 'Cyber / Data' },
    { id: 'governance', label: 'Governance' },
  ],
  bm: [
    { id: 'operational', label: 'Operasi / Keselamatan' },
    { id: 'market', label: 'Sensitif Pasaran' },
    { id: 'community', label: 'Komuniti / Tanah' },
    { id: 'internal', label: 'Dalaman' },
    { id: 'cyber', label: 'Siber / Data' },
    { id: 'governance', label: 'Tadbir Urus' },
  ],
}

const STATEMENTS: Record<string, { en: string; bm: string }> = {
  operational: {
    en: `[Company] is investigating reports concerning [issue]. We take safety seriously. Further statement when verified. Media: [Name] | [Tel]`,
    bm: `[Syarikat] sedang menyiasat laporan mengenai [isu]. Kami mengambil berat keselamatan. Kenyataan lanjut apabila disahkan. Media: [Nama] | [Tel]`,
  },
  market: {
    en: `[Company] is aware of speculation regarding [issue]. We comply with Bursa Listing Requirements. Material information will be announced via official channels.`,
    bm: `[Syarikat] sedar akan spekulasi mengenai [isu]. Kami mematuhi Peraturan Penyenaraian Bursa. Maklumat material akan diumumkan melalui saluran rasmi.`,
  },
  cyber: {
    en: `[Company] is investigating a potential cybersecurity / data incident. Incident response is active. Updates when verified.`,
    bm: `[Syarikat] sedang menyiasat kemungkinan insiden siber / data. Respons insiden aktif. Kemas kini apabila disahkan.`,
  },
  community: {
    en: `[Company] takes community concerns regarding [issue] seriously. We are engaging representatives and authorities.`,
    bm: `[Syarikat] mengambil berat kebimbangan komuniti mengenai [isu]. Kami berhubung dengan wakil dan pihak berkuasa.`,
  },
  internal: {
    en: `Colleagues — Management is treating [issue] seriously. Refer only to official internal channels.`,
    bm: `Rakan sekerja — Pengurusan sedang menangani [isu] dengan serius. Rujuk hanya saluran dalaman rasmi.`,
  },
  governance: {
    en: `[Company] is aware of matters relating to [governance issue]. The Board is taking appropriate steps.`,
    bm: `[Syarikat] sedar akan perkara berkaitan [isu tadbir urus]. Lembaga mengambil langkah sewajarnya.`,
  },
}

export default function CoreShell() {
  const [lang, setLang] = useState<Lang>('bm')
  const [mode, setMode] = useState<'landing' | 'app'>('landing')

  useEffect(() => {
    document.documentElement.lang = lang === 'bm' ? 'ms' : 'en'
  }, [lang])

  const [section, setSection] = useState<CoreSection>('command')
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const backend = backendMode()
  const t = useCallback((en: string, bm: string) => (lang === 'bm' ? bm : en), [lang])

  const active = incidents.find((i) => i.id === activeId) || incidents[0] || null

  useEffect(() => {
    listIncidents().then((list) => {
      setIncidents(list)
      if (list[0]) setActiveId(list[0].id)
      setLoading(false)
    })
  }, [])

  const persist = async (inc: Incident) => {
    const saved = await saveIncident(inc)
    setIncidents((prev) => {
      const next = prev.filter((i) => i.id !== saved.id)
      return [saved, ...next]
    })
    setActiveId(saved.id)
    return saved
  }

  const patchActive = async (fn: (inc: Incident) => Incident) => {
    if (!active) return
    await persist(fn(active))
  }

  const onCreate = async () => {
    const title =
      lang === 'bm' ? `Insiden ${new Date().toLocaleString('en-MY')}` : `Incident ${new Date().toLocaleString('en-MY')}`
    const inc = await createIncident(title)
    setIncidents((prev) => [inc, ...prev])
    setActiveId(inc.id)
    setSection('incident')
  }

  const setSeverity = (level: Severity) =>
    patchActive((inc) =>
      appendAudit({ ...inc, severity: level }, 'Operator', `Severity set to L${level}`)
    )

  const toggleCheck = (idx: number) =>
    patchActive((inc) => {
      const checked = [...inc.checked]
      checked[idx] = !checked[idx]
      return appendAudit({ ...inc, checked }, 'Operator', `Checklist step ${idx + 1} ${checked[idx] ? 'done' : 'undone'}`)
    })

  const toggleClock = (id: string) =>
    patchActive((inc) => {
      const on = !inc.clocks[id]
      return appendAudit(
        { ...inc, clocks: { ...inc.clocks, [id]: on } },
        'Operator',
        on ? `Clock started: ${id}` : `Clock stopped: ${id}`
      )
    })

  const onVote = (role: string, state: QuorumState) =>
    patchActive((inc) => ({
      ...appendAudit(inc, 'Operator', `Quorum ${role} → ${state}`),
      quorum: inc.quorum.map((q) =>
        q.role === role ? { ...q, state, at: new Date().toISOString() } : q
      ),
    }))

  const generateStatement = () => {
    if (!active) return
    const tpl = STATEMENTS[active.scenario] || STATEMENTS.operational
    const text = (active.statementLang === 'bm' ? tpl.bm : tpl.en).replace(/\[Company\]|\[Syarikat\]/g, 'Demo Holdings Bhd')
    patchActive((inc) => appendAudit({ ...inc, statement: text }, 'Operator', 'Holding statement generated'))
  }

  if (mode === 'landing') {
    return (
      <Landing
        lang={lang}
        onEnterPlaybook={() => {
          setSection('command')
          setMode('app')
        }}
        onEnterManual={() => {
          setSection('manual')
          setMode('app')
        }}
        onToggleLang={() => setLang((p) => (p === 'bm' ? 'en' : 'bm'))}
      />
    )
  }

  const pageTitle = CORE_MODULES.find((m) => m.id === section)
  const title = pageTitle ? (lang === 'bm' ? pageTitle.bm : pageTitle.en) : 'Command'

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__header">
          <div className="sidebar__logo-wrapper">
            <span className="sidebar__title" onClick={() => setMode('landing')}>
              Escalate <span className="sidebar__title-v">MY</span>
            </span>
          </div>
          <div className="sidebar__tagline">{t('Core Enterprise', 'Teras Enterprise')}</div>
        </div>
        <nav className="sidebar__nav">
          <div className="nav-pillar">
            {CORE_MODULES.filter((m) => m.group === 'core').map((m) => (
              <button key={m.id} type="button" className={`nav-item ${section === m.id ? 'active-parent' : ''}`} onClick={() => setSection(m.id)}>
                <span className="nav-item__content">
                  <span className="nav-item__icon">{m.icon}</span>
                  <span className="nav-item__text">{lang === 'bm' ? m.bm : m.en}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="nav-pillar">
            {CORE_MODULES.filter((m) => m.group === 'intel').map((m) => (
              <button key={m.id} type="button" className={`nav-item ${section === m.id ? 'active-parent' : ''}`} onClick={() => setSection(m.id)}>
                <span className="nav-item__content">
                  <span className="nav-item__icon">{m.icon}</span>
                  <span className="nav-item__text">{lang === 'bm' ? m.bm : m.en}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="nav-pillar">
            {CORE_MODULES.filter((m) => m.group === 'ref').map((m) => (
              <button key={m.id} type="button" className={`nav-item ${section === m.id ? 'active-parent' : ''}`} onClick={() => setSection(m.id)}>
                <span className="nav-item__content">
                  <span className="nav-item__icon">{m.icon}</span>
                  <span className="nav-item__text">{lang === 'bm' ? m.bm : m.en}</span>
                </span>
              </button>
            ))}
          </div>
        </nav>
        <div className="sidebar__footer">
          Escalate MY · Intelligence
          <br />
          <span className={`backend-pill ${backend}`}>{backend}</span>
        </div>
      </aside>

      <div className="main-wrapper">
        <header className="shell-header">
          <h2>{title}</h2>
          <div className="shell-header__actions">
            {active && (
              <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {active.id} · {active.title.slice(0, 28)}
              </span>
            )}
            <div className="lang-toggle">
              <button type="button" className={lang === 'bm' ? 'active' : ''} onClick={() => setLang('bm')}>BM</button>
              <button type="button" className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
            </div>
          </div>
        </header>

        <div className="shell-main">
          {loading && <p className="core-muted">{t('Loading…', 'Memuatkan…')}</p>}

          {!loading && section === 'command' && (
            <CommandCentre
              lang={lang}
              incidents={incidents}
              activeId={activeId}
              backend={backend}
              onOpen={(id) => { setActiveId(id); setSection('incident') }}
              onCreate={onCreate}
              onGo={(s) => setSection(s as CoreSection)}
              onApplySeverity={(level) => setSeverity(level)}
            />
          )}

          {!loading && section === 'decision-intel' && (
            <DecisionIntelligence lang={lang} incident={active} onApplySeverity={(level) => setSeverity(level)} />
          )}
          {!loading && section === 'regulatory-intel' && <RegulatoryIntelligence lang={lang} />}
          {!loading && section === 'board-intel' && <BoardIntelligence lang={lang} incident={active} />}

          {!loading && section === 'manual' && (
            <Manual lang={lang} onBackToPlaybook={() => setSection('command')} />
          )}

          {!loading && active && section === 'incident' && (
            <section className="card module-card">
              <div className="module-card__head">
                <h2><span className="step">◆</span> {t('Incident Management', 'Pengurusan Insiden')}</h2>
                <span className="module-card__badge">{active.status}</span>
              </div>
              <div className="form-row">
                <label>{t('Title', 'Tajuk')}</label>
                <input value={active.title} onChange={(e) => patchActive((inc) => ({ ...inc, title: e.target.value }))} />
              </div>
              <div className="form-row">
                <label>{t('Owner', 'Pemilik')}</label>
                <input value={active.owner} onChange={(e) => patchActive((inc) => ({ ...inc, owner: e.target.value }))} />
              </div>
              <div className="form-row">
                <label>{t('Status', 'Status')}</label>
                <select value={active.status} onChange={(e) => patchActive((inc) => appendAudit({ ...inc, status: e.target.value as Incident['status'] }, 'Operator', `Status → ${e.target.value}`))}>
                  <option value="open">open</option>
                  <option value="monitoring">monitoring</option>
                  <option value="contained">contained</option>
                  <option value="closed">closed</option>
                </select>
              </div>
              <p className="module-lead">{t('Severity classification', 'Pengelasan keterukan')}</p>
              <div className="severity-grid severity-grid--rich">
                {([1, 2, 3, 4] as const).map((level) => {
                  const d = SEVERITY_DATA[level]
                  return (
                    <button key={level} type="button" className={`severity-btn level-${level} ${active.severity === level ? 'selected' : ''}`} onClick={() => setSeverity(level)}>
                      <span className="level">{t(`Level ${level}`, `Tahap ${level}`)}</span>
                      <span className="bm">{lang === 'bm' ? d.shortBm : d.shortEn}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {!loading && active && section === 'first60' && (
            <First60Module lang={lang} t={t} checked={active.checked} onToggle={toggleCheck} />
          )}
          {!loading && active && section === 'clocks' && (
            <ClocksModule lang={lang} t={t} started={active.clocks} onToggle={toggleClock} />
          )}
          {!loading && active && section === 'quorum' && (
            <QuorumModule lang={lang} incident={active} onVote={onVote} />
          )}
          {!loading && active && section === 'statements' && (
            <section className="card module-card">
              <div className="module-card__head">
                <h2><span className="step">✎</span> {t('Holding Statement Builder', 'Pembina Kenyataan Awal')}</h2>
              </div>
              <div className="stmt-controls">
                <div className="form-row">
                  <label>{t('Scenario', 'Senario')}</label>
                  <select value={active.scenario} onChange={(e) => patchActive((inc) => ({ ...inc, scenario: e.target.value }))}>
                    {SCENARIOS[lang].map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <label>{t('Language', 'Bahasa')}</label>
                  <select value={active.statementLang} onChange={(e) => patchActive((inc) => ({ ...inc, statementLang: e.target.value as Lang }))}>
                    <option value="bm">BM</option>
                    <option value="en">EN</option>
                  </select>
                </div>
              </div>
              <div className="btn-row">
                <button type="button" className="btn btn-primary" onClick={generateStatement}>{t('Generate draft', 'Jana draf')}</button>
              </div>
              <div className="form-row" style={{ marginTop: '1rem' }}>
                <label>{t('Draft', 'Draf')}</label>
                <textarea rows={10} value={active.statement} onChange={(e) => patchActive((inc) => ({ ...inc, statement: e.target.value }))} />
                <p className="stmt-hint">{t('Clear via Decision Quorum before release. Not legal advice.', 'Lulus melalui Kuorum Keputusan sebelum keluaran. Bukan nasihat undang-undang.')}</p>
              </div>
            </section>
          )}

          {!loading && active && section === 'audit' && <AuditModule lang={lang} incident={active} />}
          {!loading && section === 'directory' && <DirectoryModule lang={lang} />}

          {!loading && !active && !['command', 'manual', 'directory', 'regulatory-intel', 'decision-intel'].includes(section) && (
            <p className="core-muted">{t('Create or open an incident first.', 'Cipta atau buka insiden dahulu.')}</p>
          )}
        </div>
      </div>
    </div>
  )
}
