import { useCallback, useEffect, useState } from 'react'
import Landing from './Landing'
import Manual from './Manual'
import First60Module from './First60Module'
import ClocksModule from './ClocksModule'
import CommandCentre from './core/CommandCentre'
import QuorumModule from './core/QuorumModule'
import AuditModule from './core/AuditModule'
import DirectoryModule from './core/DirectoryModule'
import SignalsModule from './core/SignalsModule'
import { DecisionIntelligence, RegulatoryIntelligence, BoardIntelligence } from './core/IntelligenceModules'
import { CORE_MODULES, type CoreSection } from './core/moduleConfig'
import {
  listIncidents,
  saveIncident,
  createIncident,
  appendAudit,
  backendMode,
  generateHoldingStatement,
  generateApprovedResponse,
  getOrganisationSettings,
  saveOrganisationSettings,
  getIncident,
  type HoldingStatementResult,
  type ApprovedResponseResult,
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

/**
 * Approved Responses™ catalog — mirrors api/packages/incidents/src/
 * approvedResponses.ts APPROVED_RESPONSE_TEMPLATES exactly (ids, labels,
 * audiences). Kept as a small client-side mirror rather than a fetch so the
 * audience/type selectors can render with zero network round-trip, same
 * posture as SCENARIOS above being a local mirror of holding.ts's
 * HoldingScenario keys. The actual statement bodies are never duplicated
 * here — only the catalog metadata — so there is nothing legally-sensitive
 * to keep in sync, just 6 labels and their audience tags.
 */
const APPROVED_RESPONSE_TYPES: Array<{ id: string; en: string; bm: string; audiences: string[] }> = [
  { id: 'holding', en: 'Holding Statement', bm: 'Kenyataan Media', audiences: ['Media', 'Regulator'] },
  {
    id: 'product_recall',
    en: 'Product Recall Statement',
    bm: 'Kenyataan Penarikan Balik Produk',
    audiences: ['Customer', 'Media'],
  },
  {
    id: 'material_disclosure',
    en: 'Bursa / Material Disclosure',
    bm: 'Pendedahan Material',
    audiences: ['Regulator', 'Board'],
  },
  {
    id: 'crisis_update',
    en: 'Crisis Update',
    bm: 'Kemas Kini Situasi',
    audiences: ['Media', 'Board', 'Employee'],
  },
  {
    id: 'incident_closure',
    en: 'Incident Closure',
    bm: 'Kenyataan Penutupan Insiden',
    audiences: ['Board', 'Regulator', 'Employee'],
  },
  {
    id: 'social_media',
    en: 'Short Social Media Version',
    bm: 'Versi Media Sosial Ringkas',
    audiences: ['Social Media'],
  },
]

const RESPONSE_AUDIENCES = ['Regulator', 'Media', 'Customer', 'Employee', 'Board', 'Social Media']

export default function CoreShell() {
  const [lang, setLang] = useState<Lang>('en')
  const [mode, setMode] = useState<'landing' | 'app'>('landing')

  useEffect(() => {
    document.documentElement.lang = lang === 'bm' ? 'ms' : 'en'
  }, [lang])

  const [section, setSection] = useState<CoreSection>('command')
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [statementBusy, setStatementBusy] = useState(false)
  const [statementMeta, setStatementMeta] = useState<Pick<HoldingStatementResult, 'disclaimer' | 'source'> | null>(
    null
  )
  const [orgName, setOrgName] = useState('Demo Holdings Bhd')
  const [productName, setProductName] = useState('')
  const [audienceFilter, setAudienceFilter] = useState('All')
  const [responseType, setResponseType] = useState('holding')
  const [approvedBusy, setApprovedBusy] = useState(false)
  const [approvedResult, setApprovedResult] = useState<ApprovedResponseResult | null>(null)
  const [orgSettingsSaving, setOrgSettingsSaving] = useState(false)
  const [orgSettingsSavedAt, setOrgSettingsSavedAt] = useState<number | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const backend = backendMode()
  const t = useCallback((en: string, bm: string) => (lang === 'bm' ? bm : en), [lang])

  const active = incidents.find((i) => i.id === activeId) || incidents[0] || null

  useEffect(() => {
    listIncidents().then((list) => {
      setIncidents(list)
      if (list[0]) setActiveId(list[0].id)
      setLoading(false)
    })
    // Replaces the previous hardcoded "Demo Holdings Bhd" default with the
    // organisation's real saved name (CONFIG KV via orgSettings.ts), if any
    // has been set. Best-effort: a fetch failure just leaves the existing
    // placeholder default in place rather than blocking the page.
    getOrganisationSettings()
      .then((settings) => setOrgName(settings.name))
      .catch(() => {})
  }, [])

  // Switching incidents must not leave a previous incident's generated
  // draft or product-recall product name sitting on screen looking like it
  // belongs to the newly active one. Organisation name, audience filter and
  // response type are sticky user preferences, not incident-bound, so they
  // deliberately survive the switch.
  useEffect(() => {
    setStatementMeta(null)
    setApprovedResult(null)
    setProductName('')
  }, [activeId])

  const copyText = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField((f) => (f === field ? null : f)), 1500)
    } catch {
      // Clipboard API unavailable (no HTTPS context, permission denied) —
      // nothing actionable to surface mid-draft, so fail silently.
    }
  }

  const saveOrgName = async () => {
    if (orgSettingsSaving) return
    setOrgSettingsSaving(true)
    try {
      await saveOrganisationSettings({ name: orgName })
      setOrgSettingsSavedAt(Date.now())
    } catch {
      // Best-effort — e.g. local demo mode with no backend, or RBAC denying
      // a non-Admin. Silent: there's nothing actionable to show mid-draft.
    } finally {
      setOrgSettingsSaving(false)
    }
  }

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

  /** The incident was already created server-side (SignalsModule.onAction -> POST /api/v1/signals/:id/action); this just folds it into the already-loaded list and switches to it. */
  const onSignalIncidentCreated = async (incidentId: string) => {
    const inc = await getIncident(incidentId)
    if (!inc) return
    setIncidents((prev) => [inc, ...prev.filter((i) => i.id !== inc.id)])
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

  const generateStatement = async () => {
    if (!active || statementBusy) return
    setStatementBusy(true)
    try {
      const result = await generateHoldingStatement({
        scenario: active.scenario,
        company: orgName,
        issue: active.title,
        lang: active.statementLang,
      })
      setStatementMeta({ disclaimer: result.disclaimer, source: result.source })
      const text = (active.statementLang === 'bm' ? result.bm : result.en) || result.en || result.bm || ''
      await patchActive((inc) => appendAudit({ ...inc, statement: text }, 'Operator', 'Holding statement generated'))
    } catch (err) {
      setStatementMeta({
        disclaimer: err instanceof Error ? err.message : 'Could not reach escalate-my-api.',
        source: 'local',
      })
    } finally {
      setStatementBusy(false)
    }
  }

  const onAudienceChange = (value: string) => {
    setAudienceFilter(value)
    const matches = APPROVED_RESPONSE_TYPES.filter((r) => value === 'All' || r.audiences.includes(value))
    if (matches.length && !matches.some((m) => m.id === responseType)) {
      setResponseType(matches[0].id)
    }
  }

  const generateApproved = async () => {
    if (!active || approvedBusy) return
    setApprovedBusy(true)
    try {
      const result = await generateApprovedResponse({
        incidentId: active.id,
        type: responseType,
        lang: 'both',
        company: orgName,
        productName: responseType === 'product_recall' ? productName : undefined,
      })
      setApprovedResult(result)
    } catch (err) {
      setApprovedResult({
        type: responseType,
        disclaimer: err instanceof Error ? err.message : 'Could not reach escalate-my-api.',
      })
    } finally {
      setApprovedBusy(false)
    }
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
                  <label>{t('Organisation name', 'Nama organisasi')}</label>
                  <input value={orgName} onChange={(e) => { setOrgName(e.target.value); setOrgSettingsSavedAt(null) }} />
                  {!orgName.trim() && (
                    <p className="stmt-hint">{t('Required to generate a draft', 'Diperlukan untuk menjana draf')}</p>
                  )}
                  {backend === 'api' && (
                    <div className="btn-row" style={{ marginTop: '0.4rem' }}>
                      <button type="button" className="btn btn-secondary" onClick={saveOrgName} disabled={orgSettingsSaving}>
                        {orgSettingsSaving ? t('Saving…', 'Menyimpan…') : t('Save as organisation default', 'Simpan sebagai lalai organisasi')}
                      </button>
                      {orgSettingsSavedAt && <span className="stmt-source-badge">{t('Saved', 'Disimpan')}</span>}
                    </div>
                  )}
                </div>
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
                <button type="button" className="btn btn-primary" onClick={generateStatement} disabled={statementBusy || !orgName.trim()}>
                  {statementBusy ? t('Generating…', 'Menjana…') : t('Generate draft', 'Jana draf')}
                </button>
                {statementMeta?.source === 'workers-ai' && (
                  <span className="stmt-source-badge">{t('AI-drafted', 'Draf AI')}</span>
                )}
              </div>
              <div className="form-row" style={{ marginTop: '1rem' }}>
                <label>{t('Draft', 'Draf')}</label>
                <textarea rows={10} value={active.statement} onChange={(e) => patchActive((inc) => ({ ...inc, statement: e.target.value }))} />
                {active.statement && (
                  <div className="btn-row" style={{ marginTop: '0.4rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => copyText(active.statement, 'holding')}>
                      {copiedField === 'holding' ? t('Copied', 'Disalin') : t('Copy', 'Salin')}
                    </button>
                  </div>
                )}
                <p className="stmt-hint">
                  {statementMeta?.disclaimer ||
                    t(
                      'Clear via Decision Quorum before release. Not legal advice.',
                      'Lulus melalui Kuorum Keputusan sebelum keluaran. Bukan nasihat undang-undang.'
                    )}
                </p>
              </div>
            </section>
          )}

          {!loading && active && section === 'statements' && (
            <section className="card module-card">
              <div className="module-card__head">
                <h2><span className="step">✓</span> {t('Approved Responses™', 'Respons Diluluskan™')}</h2>
              </div>
              <p className="module-lead">
                {t(
                  'Pre-vetted, template-fill statements — never AI-generated. Clear via Decision Quorum (Legal / Corporate Affairs) before release.',
                  'Kenyataan templat pra-lulus — tidak pernah dijana AI. Lulus melalui Kuorum Keputusan (Legal / Hal Ehwal Korporat) sebelum keluaran.'
                )}
              </p>
              <div className="stmt-controls">
                <div className="form-row">
                  <label>{t('Audience', 'Audiens')}</label>
                  <select value={audienceFilter} onChange={(e) => onAudienceChange(e.target.value)}>
                    <option value="All">{t('All', 'Semua')}</option>
                    {RESPONSE_AUDIENCES.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <label>{t('Response type', 'Jenis respons')}</label>
                  <select value={responseType} onChange={(e) => setResponseType(e.target.value)}>
                    {APPROVED_RESPONSE_TYPES.filter((r) => audienceFilter === 'All' || r.audiences.includes(audienceFilter)).map((r) => (
                      <option key={r.id} value={r.id}>{lang === 'bm' ? r.bm : r.en}</option>
                    ))}
                  </select>
                </div>
                {responseType === 'product_recall' && (
                  <div className="form-row">
                    <label>{t('Product name', 'Nama produk')}</label>
                    <input
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder={t('Optional — leave blank to fill manually', 'Pilihan — biar kosong untuk diisi secara manual')}
                    />
                  </div>
                )}
              </div>
              <div className="btn-row">
                <button type="button" className="btn btn-primary" onClick={generateApproved} disabled={approvedBusy || !orgName.trim()}>
                  {approvedBusy ? t('Generating…', 'Menjana…') : t('Generate approved draft', 'Jana draf diluluskan')}
                </button>
              </div>
              {approvedResult?.en && (
                <div className="form-row" style={{ marginTop: '1rem' }}>
                  <label>EN</label>
                  <textarea
                    rows={10}
                    value={approvedResult.en}
                    onChange={(e) => setApprovedResult((prev) => (prev ? { ...prev, en: e.target.value } : prev))}
                  />
                  <div className="btn-row" style={{ marginTop: '0.4rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => copyText(approvedResult.en || '', 'approved-en')}>
                      {copiedField === 'approved-en' ? t('Copied', 'Disalin') : t('Copy', 'Salin')}
                    </button>
                  </div>
                </div>
              )}
              {approvedResult?.bm && (
                <div className="form-row" style={{ marginTop: '1rem' }}>
                  <label>BM</label>
                  <textarea
                    rows={10}
                    value={approvedResult.bm}
                    onChange={(e) => setApprovedResult((prev) => (prev ? { ...prev, bm: e.target.value } : prev))}
                  />
                  <div className="btn-row" style={{ marginTop: '0.4rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => copyText(approvedResult.bm || '', 'approved-bm')}>
                      {copiedField === 'approved-bm' ? t('Copied', 'Disalin') : t('Copy', 'Salin')}
                    </button>
                  </div>
                </div>
              )}
              {approvedResult && (
                <p className="stmt-hint">
                  {approvedResult.disclaimer}
                </p>
              )}
            </section>
          )}

          {!loading && active && section === 'audit' && <AuditModule lang={lang} incident={active} />}
          {!loading && section === 'signals' && <SignalsModule lang={lang} onIncidentCreated={onSignalIncidentCreated} />}
          {!loading && section === 'directory' && <DirectoryModule lang={lang} />}

          {!loading && !active && !['command', 'manual', 'directory', 'signals', 'regulatory-intel', 'decision-intel'].includes(section) && (
            <p className="core-muted">{t('Create or open an incident first.', 'Cipta atau buka insiden dahulu.')}</p>
          )}
        </div>
      </div>
    </div>
  )
}
