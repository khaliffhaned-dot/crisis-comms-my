import { useState, useCallback, useRef, useEffect } from 'react'
import Landing from './Landing'
import Manual from './Manual'
import OpsDashboard from './OpsDashboard'
import './index.css'
import './modules.css'

type Lang = 'bm' | 'en'
type Mode = 'landing' | 'playbook' | 'manual'
type Severity = 1 | 2 | 3 | 4 | null
type ShellSection = 'playbook' | 'manual' | 'severity' | 'checklist' | 'statements' | 'log'

interface LogEntry { id: number; time: string; text: string }
interface Client { id: string; name: string; short: string; market: string }

const CLIENTS: Client[] = [
  { id: 'demo-main', name: 'Demo Holdings Bhd', short: 'DH', market: 'Main Market' },
  { id: 'ace-tech', name: 'ACE Tech Solutions', short: 'AT', market: 'ACE Market' },
  { id: 'sabah-infra', name: 'Sabah Infra Group', short: 'SI', market: 'Main Market' },
]

const SEVERITY_DATA = {
  1: {
    en: 'Level 1 – Routine Operational Issue', bm: 'Tahap 1 – Isu Operasi Biasa',
    actionEn: 'Monitor closely. Prepare holding language if needed.',
    actionBm: 'Pantau dengan teliti. Sediakan bahasa kenyataan awal jika perlu.',
    criteriaEn: ['Limited operational impact', 'No material investor interest', 'Contained locally'],
    criteriaBm: ['Kesan operasi terhad', 'Tiada minat pelabur material', 'Terkawal di peringkat tempatan'],
    notifyEn: ['Ops Lead', 'Comms Officer'], notifyBm: ['Ketua Operasi', 'Pegawai Komunikasi'], bursa: false,
  },
  2: {
    en: 'Level 2 – Moderate Incident', bm: 'Tahap 2 – Insiden Sederhana',
    actionEn: 'Activate core Crisis Team. Issue holding statement. Intensify monitoring.',
    actionBm: 'Aktifkan Pasukan Krisis teras. Keluarkan kenyataan awal. Perhebat pemantauan.',
    criteriaEn: ['Media or community attention rising', 'Potential reputational risk', 'May need holding statement within the hour'],
    criteriaBm: ['Perhatian media atau komuniti meningkat', 'Risiko reputasi berpotensi', 'Mungkin perlu kenyataan awal dalam sejam'],
    notifyEn: ['Crisis Lead', 'Company Secretary', 'Comms Head'], notifyBm: ['Ketua Krisis', 'Setiausaha Syarikat', 'Ketua Komunikasi'], bursa: false,
  },
  3: {
    en: 'Level 3 – Material Crisis', bm: 'Tahap 3 – Krisis Material',
    actionEn: 'Full activation. Notify Board. Assess Bursa disclosure obligation.',
    actionBm: 'Pengaktifan penuh. Maklumkan Lembaga Pengarah. Nilai kewajipan pendedahan Bursa.',
    criteriaEn: ['Material information likely', 'Board-level attention required', 'Bursa disclosure assessment mandatory'],
    criteriaBm: ['Maklumat material berkemungkinan', 'Perhatian tahap Lembaga diperlukan', 'Penilaian pendedahan Bursa wajib'],
    notifyEn: ['Board Chair', 'CEO', 'Company Secretary', 'Crisis Lead', 'Legal'], notifyBm: ['Pengerusi Lembaga', 'CEO', 'Setiausaha Syarikat', 'Ketua Krisis', 'Undang-undang'], bursa: true,
  },
  4: {
    en: 'Level 4 – Critical Crisis', bm: 'Tahap 4 – Krisis Kritikal',
    actionEn: 'Highest-level response. Continuous Board and regulatory engagement.',
    actionBm: 'Respons tahap tertinggi. Penglibatan berterusan dengan Lembaga dan pengawal selia.',
    criteriaEn: ['Systemic or multi-stakeholder impact', 'Continuous regulatory engagement', 'Dedicated war-room recommended'],
    criteriaBm: ['Kesan sistemik atau berbilang pihak', 'Penglibatan pengawal selia berterusan', 'Bilik perang khusus disyorkan'],
    notifyEn: ['Full Board', 'CEO', 'Regulators as required', 'External counsel', 'Crisis Team'], notifyBm: ['Lembaga penuh', 'CEO', 'Pengawal selia jika perlu', 'Peguam luar', 'Pasukan Krisis'], bursa: true,
  },
}

const CHECKLIST_ITEMS = {
  en: [
    { text: 'Facts confirmed and source verified', owner: 'Comms / Ops', mins: 10, critical: true },
    { text: 'Severity level assessed and recorded', owner: 'Crisis Lead', mins: 15, critical: true },
    { text: 'Crisis Lead and Company Secretary notified', owner: 'Crisis Lead', mins: 15, critical: true },
    { text: 'Disclosure assessment initiated (Bursa LR)', owner: 'Company Secretary', mins: 30, critical: true },
    { text: 'Holding statement drafted and cleared', owner: 'Comms', mins: 45, critical: true },
    { text: 'Spokespeople aligned; others instructed not to comment', owner: 'Comms', mins: 30, critical: false },
    { text: 'Media and social monitoring activated', owner: 'Comms / Digital', mins: 20, critical: false },
    { text: 'Decision log started', owner: 'Crisis Lead', mins: 15, critical: false },
    { text: 'Board notification considered / completed (Level 3+)', owner: 'CEO / Sec', mins: 60, critical: true },
  ],
  bm: [
    { text: 'Fakta disahkan dan sumber disahkan', owner: 'Komunikasi / Ops', mins: 10, critical: true },
    { text: 'Tahap keterukan dinilai dan direkodkan', owner: 'Ketua Krisis', mins: 15, critical: true },
    { text: 'Ketua Krisis dan Setiausaha Syarikat dimaklumkan', owner: 'Ketua Krisis', mins: 15, critical: true },
    { text: 'Penilaian pendedahan dimulakan (Peraturan Bursa)', owner: 'Setiausaha Syarikat', mins: 30, critical: true },
    { text: 'Kenyataan awal digubal dan diluluskan', owner: 'Komunikasi', mins: 45, critical: true },
    { text: 'Jurucakap diselaraskan; yang lain diarahkan tidak memberi komen', owner: 'Komunikasi', mins: 30, critical: false },
    { text: 'Pemantauan media dan sosial diaktifkan', owner: 'Komunikasi / Digital', mins: 20, critical: false },
    { text: 'Log keputusan dimulakan', owner: 'Ketua Krisis', mins: 15, critical: false },
    { text: 'Pemberitahuan Lembaga dipertimbangkan / selesai (Tahap 3+)', owner: 'CEO / Sec', mins: 60, critical: true },
  ],
}

const SCENARIOS = {
  en: [
    { id: 'operational', label: 'Operational / Safety Incident' },
    { id: 'market', label: 'Market-Sensitive / Financial Matter' },
    { id: 'community', label: 'Community or Land-Related Issue' },
    { id: 'internal', label: 'Internal Employee Communication' },
    { id: 'cyber', label: 'Cybersecurity or Data Incident' },
    { id: 'governance', label: 'Governance / Senior Management Issue' },
  ],
  bm: [
    { id: 'operational', label: 'Insiden Operasi / Keselamatan' },
    { id: 'market', label: 'Isu Berkaitan Pasaran / Kewangan' },
    { id: 'community', label: 'Isu Komuniti atau Tanah' },
    { id: 'internal', label: 'Komunikasi Dalaman kepada Kakitangan' },
    { id: 'cyber', label: 'Insiden Siber atau Data' },
    { id: 'governance', label: 'Isu Tadbir Urus / Pengurusan Kanan' },
  ],
}

const STATEMENTS: Record<string, { en: string; bm: string }> = {
  operational: {
    en: `[Company Name] is investigating reports concerning [brief description of issue].\n\nWe take the safety and well-being of all parties involved seriously. Our team is working to establish accurate and verified information.\n\nWe will issue a further statement once complete information is available.\n\nMedia enquiries: [Name] | [Title] | [Telephone] | [Email]`,
    bm: `[Nama Syarikat] sedang menyiasat laporan mengenai [ringkasan isu].\n\nKami mengambil berat tentang keselamatan dan kesejahteraan semua pihak yang terlibat. Pasukan kami sedang bekerja untuk mendapatkan maklumat yang tepat dan disahkan.\n\nKami akan mengeluarkan kenyataan lanjut sebaik sahaja maklumat yang lengkap tersedia.\n\nUntuk pertanyaan media: [Nama] | [Jawatan] | [Telefon] | [E-mel]`,
  },
  market: {
    en: `[Company Name] is aware of speculation currently circulating regarding [issue].\n\nWe emphasise that the Company complies with its disclosure obligations under the Bursa Malaysia Listing Requirements. Any material information will be announced through official Bursa Malaysia channels at the appropriate time.\n\nStakeholders are advised to refer only to official Company announcements.`,
    bm: `[Nama Syarikat] sedar akan spekulasi yang sedang beredar mengenai [isu].\n\nKami ingin menegaskan bahawa syarikat sentiasa mematuhi keperluan pendedahan di bawah Peraturan Penyenaraian Bursa Malaysia. Sebarang maklumat material akan diumumkan melalui saluran rasmi Bursa Malaysia pada masa yang sesuai.\n\nKami menasihati pihak berkepentingan supaya merujuk hanya kepada pengumuman rasmi syarikat.`,
  },
  community: {
    en: `[Company Name] takes seriously the concerns raised by the local community regarding [issue].\n\nWe are engaging directly with community representatives and the relevant state authorities to understand the matter more fully.\n\nOpen, respectful, and fact-based dialogue is our priority. We will continue to communicate with all affected parties.`,
    bm: `[Nama Syarikat] mengambil berat terhadap kebimbangan yang ditimbulkan oleh komuniti setempat mengenai [isu].\n\nKami sedang berhubung secara langsung dengan wakil komuniti dan pihak berkuasa negeri yang berkaitan untuk memahami isu ini dengan lebih mendalam.\n\nDialog yang terbuka, saling menghormati dan berasaskan fakta adalah keutamaan kami. Kami akan terus berkomunikasi dengan semua pihak yang terjejas.`,
  },
  internal: {
    en: `Dear colleagues,\n\nYou may have heard about [issue]. Management is treating the matter seriously and taking appropriate steps.\n\nOfficial information will be shared through designated internal channels. Please refer only to official Company information and avoid speculation.\n\nThank you for your cooperation.`,
    bm: `Kepada semua rakan sekerja,\n\nAnda mungkin telah mendengar mengenai [isu]. Pengurusan sedang menangani perkara ini dengan serius dan mengambil langkah-langkah yang sesuai.\n\nMaklumat rasmi akan dikongsi melalui saluran dalaman yang ditetapkan. Sila rujuk hanya kepada maklumat rasmi syarikat dan elakkan spekulasi.\n\nTerima kasih atas kerjasama anda.`,
  },
  cyber: {
    en: `[Company Name] is investigating a potential cybersecurity / data-related incident.\n\nWe have activated our incident response protocols and are working with specialist advisors to assess the scope and impact. Protecting the security of our systems and the privacy of stakeholders is our priority.\n\nWe will provide further updates as verified information becomes available. Media enquiries: [Name] | [Title] | [Telephone] | [Email]`,
    bm: `[Nama Syarikat] sedang menyiasat kemungkinan insiden siber / berkaitan data.\n\nKami telah mengaktifkan protokol respons insiden dan bekerjasama dengan penasihat pakar untuk menilai skop dan kesan. Melindungi keselamatan sistem kami dan privasi pihak berkepentingan adalah keutamaan kami.\n\nKami akan memberikan kemas kini lanjut apabila maklumat yang disahkan tersedia. Pertanyaan media: [Nama] | [Jawatan] | [Telefon] | [E-mel]`,
  },
  governance: {
    en: `[Company Name] is aware of matters relating to [governance / senior management issue].\n\nThe Board is treating the matter with appropriate seriousness and is taking the necessary steps in accordance with good governance practice and applicable requirements.\n\nFurther information will be provided through the proper channels at the appropriate time. Stakeholders are advised to refer only to official Company announcements.`,
    bm: `[Nama Syarikat] sedar akan perkara berkaitan [isu tadbir urus / pengurusan kanan].\n\nLembaga Pengarah sedang menangani perkara ini dengan keseriusan yang sewajarnya dan mengambil langkah yang diperlukan selaras dengan amalan tadbir urus yang baik serta keperluan yang berkenaan.\n\nMaklumat lanjut akan disediakan melalui saluran yang betul pada masa yang sesuai. Pihak berkepentingan dinasihati supaya merujuk hanya kepada pengumuman rasmi syarikat.`,
  },
}

function App() {
  const [lang, setLang] = useState<Lang>('bm')
  const [mode, setMode] = useState<Mode>('landing')
  const [section, setSection] = useState<ShellSection>('playbook')
  const [clientId, setClientId] = useState(CLIENTS[0].id)
  const [clientOpen, setClientOpen] = useState(false)
  const clientRef = useRef<HTMLDivElement>(null)
  const [severity, setSeverity] = useState<Severity>(null)
  const [checked, setChecked] = useState<boolean[]>(Array(9).fill(false))
  const [scenario, setScenario] = useState('operational')
  const [audience, setAudience] = useState('media')
  const [manualLog, setManualLog] = useState('')
  const [statement, setStatement] = useState('')
  const [log, setLog] = useState<LogEntry[]>([])
  const [copied, setCopied] = useState(false)
  const client = CLIENTS.find((c) => c.id === clientId) || CLIENTS[0]
  const t = useCallback((en: string, bm: string) => (lang === 'bm' ? bm : en), [lang])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (clientRef.current && !clientRef.current.contains(e.target as Node)) setClientOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const addLog = (text: string) => {
    setLog((prev) => [{
      id: Date.now(),
      time: new Date().toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      text,
    }, ...prev])
  }

  const handleSeverity = (level: 1 | 2 | 3 | 4) => {
    setSeverity(level)
    const label = lang === 'bm' ? SEVERITY_DATA[level].bm : SEVERITY_DATA[level].en
    addLog(t(`Severity set to ${label}`, `Tahap keterukan ditetapkan: ${label}`))
  }

  const toggleCheck = (idx: number) => {
    setChecked((prev) => { const next = [...prev]; next[idx] = !next[idx]; return next })
  }

  const generateStatement = () => {
    let text = STATEMENTS[scenario]?.[lang] || ''
    text = text.replace(/\[Company Name\]/g, client.name).replace(/\[Nama Syarikat\]/g, client.name)
    setStatement(text)
    addLog(t(`Generated holding statement: ${SCENARIOS.en.find((s) => s.id === scenario)?.label}`, `Menjana kenyataan awal: ${SCENARIOS.bm.find((s) => s.id === scenario)?.label}`))
  }

  const copyStatement = async () => {
    if (!statement) return
    try {
      await navigator.clipboard.writeText(statement)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      addLog(t('Statement copied to clipboard', 'Kenyataan disalin ke papan keratan'))
    } catch { addLog(t('Copy failed', 'Salinan gagal')) }
  }

  const downloadStatement = () => {
    if (!statement) return
    const blob = new Blob([statement], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `holding-statement-${client.short}-${scenario}.txt`
    a.click()
    URL.revokeObjectURL(url)
    addLog(t('Statement downloaded', 'Kenyataan dimuat turun'))
  }

  const addManualLog = () => {
    const note = manualLog.trim()
    if (!note) return
    addLog(note)
    setManualLog('')
  }

  const exportLog = () => {
    if (!log.length) return
    const lines = log.slice().reverse().map((e) => `[${e.time}] ${e.text}`).join('\n')
    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `decision-log-${client.short}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearLog = () => setLog([])
  const goShell = (s: ShellSection) => { setSection(s); setMode(s === 'manual' ? 'manual' : 'playbook') }

  const pageTitle =
    section === 'manual' ? t('Manual', 'Manual')
    : section === 'severity' ? t('Severity', 'Keterukan')
    : section === 'checklist' ? t('First Sixty Minutes', 'Enam Puluh Minit Pertama')
    : section === 'statements' ? t('Holding Statements', 'Kenyataan Awal')
    : section === 'log' ? t('Decision Log', 'Log Keputusan')
    : t('Operational Playbook', 'Playbook Operasi')

  if (mode === 'landing') {
    return (
      <Landing lang={lang}
        onEnterPlaybook={() => { setSection('playbook'); setMode('playbook') }}
        onEnterManual={() => { setSection('manual'); setMode('manual') }}
        onToggleLang={() => setLang((p) => (p === 'bm' ? 'en' : 'bm'))} />
    )
  }

  const showFullPlaybook = section === 'playbook'
  const showSeverity = showFullPlaybook || section === 'severity'
  const showChecklist = showFullPlaybook || section === 'checklist'
  const showStatements = showFullPlaybook || section === 'statements'
  const showLog = showFullPlaybook || section === 'log'

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__header">
          <div className="sidebar__logo-wrapper">
            <span className="sidebar__title" onClick={() => setMode('landing')}>Escalate <span className="sidebar__title-v">MY</span></span>
          </div>
          <div className="sidebar__tagline">{t('Crisis communications', 'Komunikasi krisis')}</div>
        </div>
        <nav className="sidebar__nav">
          <div className="nav-pillar">
            <button type="button" className={`nav-item ${section === 'playbook' || ['severity','checklist','statements','log'].includes(section) ? 'active-parent' : ''}`} onClick={() => goShell('playbook')}>
              <span className="nav-item__content"><span className="nav-item__icon">⚡</span><span className="nav-item__text">{t('Playbook', 'Playbook')}</span></span>
            </button>
            <div className="sub-nav-list">
              <button type="button" className={`sub-nav-item ${section === 'severity' ? 'active' : ''}`} onClick={() => goShell('severity')}>{t('Severity', 'Keterukan')}</button>
              <button type="button" className={`sub-nav-item ${section === 'checklist' ? 'active' : ''}`} onClick={() => goShell('checklist')}>{t('First 60 min', '60 min pertama')}</button>
              <button type="button" className={`sub-nav-item ${section === 'statements' ? 'active' : ''}`} onClick={() => goShell('statements')}>{t('Statements', 'Kenyataan')}</button>
              <button type="button" className={`sub-nav-item ${section === 'log' ? 'active' : ''}`} onClick={() => goShell('log')}>{t('Decision log', 'Log keputusan')}</button>
            </div>
          </div>
          <div className="nav-pillar">
            <button type="button" className={`nav-item ${section === 'manual' ? 'active-parent' : ''}`} onClick={() => goShell('manual')}>
              <span className="nav-item__content"><span className="nav-item__icon">📘</span><span className="nav-item__text">{t('Manual', 'Manual')}</span></span>
            </button>
          </div>
        </nav>
        <div className="sidebar__footer">Escalate MY · v0.3<br />{client.market}</div>
      </aside>

      <div className="main-wrapper">
        <header className="shell-header">
          <h2>{pageTitle}</h2>
          <div className="shell-header__actions">
            <div className="client-switcher" ref={clientRef}>
              <button type="button" className="client-switcher__display" onClick={() => setClientOpen((o) => !o)}>
                <span className="client-switcher__logo">{client.short}</span>
                <span className="client-switcher__info">
                  <span className="client-switcher__name">{client.name}</span>
                  <span className="client-switcher__label">{t('Active client', 'Klien aktif')}</span>
                </span>
                <span className="client-switcher__arrow">{clientOpen ? '▴' : '▾'}</span>
              </button>
              {clientOpen && (
                <div className="client-switcher__menu">
                  {CLIENTS.map((c) => (
                    <button key={c.id} type="button" className={`client-switcher__option ${c.id === clientId ? 'active' : ''}`}
                      onClick={() => { setClientId(c.id); setClientOpen(false); addLog(t(`Switched client to ${c.name}`, `Tukar klien kepada ${c.name}`)) }}>
                      <span className="client-switcher__logo">{c.short}</span>
                      <span><span className="client-switcher__option-name">{c.name}</span><br /><span className="client-switcher__option-meta">{c.market}</span></span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="lang-toggle">
              <button type="button" className={lang === 'bm' ? 'active' : ''} onClick={() => setLang('bm')}>BM</button>
              <button type="button" className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
            </div>
          </div>
        </header>

        <div className="shell-main">
          {section === 'manual' ? (
            <Manual lang={lang} onBackToPlaybook={() => goShell('playbook')} />
          ) : (
            <>
              {showFullPlaybook && (
                <OpsDashboard lang={lang} t={t} client={client} severity={severity} checked={checked} statement={statement} scenario={scenario} log={log} severityData={SEVERITY_DATA} scenarios={SCENARIOS} onGoSeverity={() => goShell('severity')} onGoStatements={() => goShell('statements')} />
              )}

              {showSeverity && (
                <section className="card module-card">
                  <div className="module-card__head">
                    <h2><span className="step">1</span>{t('Assess Severity', 'Nilai Tahap Keterukan')}</h2>
                    <span className="module-card__badge">{severity ? t(`Selected: L${severity}`, `Dipilih: T${severity}`) : t('Not set', 'Belum ditetapkan')}</span>
                  </div>
                  <p className="module-lead">{t('Select the level that best matches impact, media pressure, and disclosure risk. Level 3+ triggers Board and Bursa assessment.', 'Pilih tahap yang paling sepadan dengan kesan, tekanan media, dan risiko pendedahan. Tahap 3+ mencetuskan penilaian Lembaga dan Bursa.')}</p>
                  <div className="severity-grid severity-grid--rich">
                    {([1, 2, 3, 4] as const).map((level) => {
                      const d = SEVERITY_DATA[level]
                      return (
                        <button key={level} type="button" className={`severity-btn level-${level} ${severity === level ? 'selected' : ''}`} onClick={() => handleSeverity(level)}>
                          <span className="severity-btn__top">
                            <span className="level">{t(`Level ${level}`, `Tahap ${level}`)}</span>
                            {d.bursa && <span className="bursa-chip">Bursa</span>}
                          </span>
                          <span className="bm">{lang === 'bm' ? d.bm.replace(`Tahap ${level} – `, '') : d.en.replace(`Level ${level} – `, '')}</span>
                          <ul className="severity-criteria">{(lang === 'bm' ? d.criteriaBm : d.criteriaEn).map((c, i) => <li key={i}>{c}</li>)}</ul>
                        </button>
                      )
                    })}
                  </div>
                  {severity && (
                    <div className="severity-detail">
                      <div className="severity-detail__action">
                        <strong>{t('Recommended action', 'Tindakan disyorkan')}</strong>
                        <p>{lang === 'bm' ? SEVERITY_DATA[severity].actionBm : SEVERITY_DATA[severity].actionEn}</p>
                      </div>
                      <div className="severity-detail__notify">
                        <strong>{t('Notify now', 'Maklumkan sekarang')}</strong>
                        <div className="notify-chips">{(lang === 'bm' ? SEVERITY_DATA[severity].notifyBm : SEVERITY_DATA[severity].notifyEn).map((n) => <span key={n} className="notify-chip">{n}</span>)}</div>
                      </div>
                      {SEVERITY_DATA[severity].bursa && (
                        <div className="bursa-alert">{t('Disclosure assessment required under Bursa Malaysia Listing Requirements. Involve Company Secretary before any external statement.', 'Penilaian pendedahan diperlukan di bawah Peraturan Penyenaraian Bursa Malaysia. Libatkan Setiausaha Syarikat sebelum sebarang kenyataan luaran.')}</div>
                      )}
                    </div>
                  )}
                </section>
              )}

              {showChecklist && (
                <section className="card module-card">
                  <div className="module-card__head">
                    <h2><span className="step">2</span>{t('First Sixty Minutes Checklist', 'Senarai Semak Enam Puluh Minit Pertama')}</h2>
                    <span className="module-card__badge">{checked.filter(Boolean).length}/9 · {Math.round((checked.filter(Boolean).length / 9) * 100)}%</span>
                  </div>
                  <div className="checklist-progress"><div className="checklist-progress__fill" style={{ width: `${(checked.filter(Boolean).length / 9) * 100}%` }} /></div>
                  <p className="module-lead">{t('Work top-down. Critical items are marked. Target times are guides for the first hour.', 'Kerjakan dari atas ke bawah. Item kritikal ditanda. Masa sasaran adalah panduan untuk sejam pertama.')}</p>
                  <ul className="checklist checklist--rich">
                    {CHECKLIST_ITEMS[lang].map((item, idx) => (
                      <li key={idx} className={checked[idx] ? 'done' : ''}>
                        <label className="checklist-row">
                          <input type="checkbox" checked={checked[idx]} onChange={() => toggleCheck(idx)} />
                          <span className="checklist-row__body">
                            <span className="checklist-row__text">{item.text}{item.critical && <span className="crit-tag">{t('Critical', 'Kritikal')}</span>}</span>
                            <span className="checklist-row__meta"><span>{item.owner}</span><span>≤ {item.mins} {t('min', 'min')}</span></span>
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {showStatements && (
                <section className="card module-card">
                  <div className="module-card__head">
                    <h2><span className="step">3</span>{t('Holding Statement Builder', 'Pembina Kenyataan Awal')}</h2>
                    <span className="module-card__badge">{statement ? t('Draft ready', 'Draf sedia') : t('No draft', 'Tiada draf')}</span>
                  </div>
                  <p className="module-lead">{t(`Templates auto-insert ${client.name}. Edit before release. Company Secretary should clear market-sensitive language.`, `Templat memasukkan ${client.name} secara automatik. Sunting sebelum keluaran. Setiausaha Syarikat harus meluluskan bahasa sensitif pasaran.`)}</p>
                  <div className="stmt-controls">
                    <div className="form-row">
                      <label>{t('Scenario type', 'Jenis senario')}</label>
                      <select value={scenario} onChange={(e) => setScenario(e.target.value)}>{SCENARIOS[lang].map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select>
                    </div>
                    <div className="form-row">
                      <label>{t('Audience', 'Khalayak')}</label>
                      <select value={audience} onChange={(e) => setAudience(e.target.value)}>
                        <option value="media">{t('Media / public', 'Media / awam')}</option>
                        <option value="internal">{t('Internal staff', 'Kakitangan dalaman')}</option>
                        <option value="investors">{t('Investors / analysts', 'Pelabur / penganalisis')}</option>
                      </select>
                    </div>
                  </div>
                  <div className="btn-row">
                    <button type="button" className="btn btn-primary" onClick={generateStatement}>{t('Generate Statement', 'Jana Kenyataan')}</button>
                    {statement && (<>
                      <button type="button" className="btn btn-saffron" onClick={copyStatement}>{copied ? t('Copied', 'Disalin') : t('Copy', 'Salin')}</button>
                      <button type="button" className="btn btn-secondary" onClick={downloadStatement}>{t('Download .txt', 'Muat turun .txt')}</button>
                    </>)}
                  </div>
                  {statement && (
                    <div className="form-row" style={{ marginTop: '1rem' }}>
                      <label>{t('Editable statement', 'Kenyataan boleh sunting')}<span className="char-count">{statement.length} {t('chars', 'aksara')}</span></label>
                      <textarea value={statement} onChange={(e) => setStatement(e.target.value)} rows={12} />
                      <p className="stmt-hint">{t('Do not release until cleared. Log the clearance decision below.', 'Jangan keluarkan sehingga diluluskan. Log keputusan kelulusan di bawah.')}</p>
                    </div>
                  )}
                </section>
              )}

              {showLog && (
                <section className="card module-card">
                  <div className="module-card__head">
                    <h2><span className="step">4</span>{t('Decision Log', 'Log Keputusan')}</h2>
                    <span className="module-card__badge">{log.length} {t('entries', 'entri')}</span>
                  </div>
                  <p className="module-lead">{t('Every material decision should be timed and attributable. Export for after-action review.', 'Setiap keputusan material harus berwaktu dan boleh dikesan. Eksport untuk semakan selepas tindakan.')}</p>
                  <div className="log-compose">
                    <input type="text" className="form-input" placeholder={t('Add a manual decision note…', 'Tambah nota keputusan manual…')} value={manualLog} onChange={(e) => setManualLog(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addManualLog() }} />
                    <button type="button" className="btn btn-primary" onClick={addManualLog}>{t('Add', 'Tambah')}</button>
                  </div>
                  {log.length === 0 ? (
                    <p className="empty-state">{t('No decisions recorded yet. Actions above will appear here.', 'Tiada keputusan direkodkan lagi. Tindakan di atas akan dipaparkan di sini.')}</p>
                  ) : (
                    <>
                      <ul className="log-list log-list--rich">{log.map((entry) => (<li key={entry.id}><div className="log-list__time">{entry.time}</div><div className="log-list__body">{entry.text}</div></li>))}</ul>
                      <div className="btn-row">
                        <button type="button" className="btn btn-secondary" onClick={exportLog}>{t('Export log', 'Eksport log')}</button>
                        <button type="button" className="btn btn-secondary" onClick={clearLog}>{t('Clear Log', 'Kosongkan Log')}</button>
                      </div>
                    </>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
