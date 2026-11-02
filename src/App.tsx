import { useState, useCallback } from 'react'
import Landing from './Landing'
import Manual from './Manual'
import './index.css'

type Lang = 'bm' | 'en'
type Mode = 'landing' | 'playbook' | 'manual'
type Severity = 1 | 2 | 3 | 4 | null

interface LogEntry {
  id: number
  time: string
  text: string
}

const SEVERITY_DATA = {
  1: {
    en: 'Level 1 – Routine Operational Issue',
    bm: 'Tahap 1 – Isu Operasi Biasa',
    actionEn: 'Monitor closely. Prepare holding language if needed.',
    actionBm: 'Pantau dengan teliti. Sediakan bahasa kenyataan awal jika perlu.',
  },
  2: {
    en: 'Level 2 – Moderate Incident',
    bm: 'Tahap 2 – Insiden Sederhana',
    actionEn: 'Activate core Crisis Team. Issue holding statement. Intensify monitoring.',
    actionBm: 'Aktifkan Pasukan Krisis teras. Keluarkan kenyataan awal. Perhebat pemantauan.',
  },
  3: {
    en: 'Level 3 – Material Crisis',
    bm: 'Tahap 3 – Krisis Material',
    actionEn: 'Full activation. Notify Board. Assess Bursa disclosure obligation.',
    actionBm: 'Pengaktifan penuh. Maklumkan Lembaga Pengarah. Nilai kewajipan pendedahan Bursa.',
  },
  4: {
    en: 'Level 4 – Critical Crisis',
    bm: 'Tahap 4 – Krisis Kritikal',
    actionEn: 'Highest-level response. Continuous Board and regulatory engagement.',
    actionBm: 'Respons tahap tertinggi. Penglibatan berterusan dengan Lembaga dan pengawal selia.',
  },
}

const CHECKLIST_ITEMS = {
  en: [
    'Facts confirmed and source verified',
    'Severity level assessed and recorded',
    'Crisis Lead and Company Secretary notified',
    'Disclosure assessment initiated',
    'Holding statement drafted and cleared',
    'Spokespeople aligned; others instructed not to comment',
    'Media and social monitoring activated',
    'Decision log started',
    'Board notification considered / completed (Level 3+)',
  ],
  bm: [
    'Fakta disahkan dan sumber disahkan',
    'Tahap keterukan dinilai dan direkodkan',
    'Ketua Krisis dan Setiausaha Syarikat dimaklumkan',
    'Penilaian pendedahan dimulakan',
    'Kenyataan awal digubal dan diluluskan',
    'Jurucakap diselaraskan; yang lain diarahkan tidak memberi komen',
    'Pemantauan media dan sosial diaktifkan',
    'Log keputusan dimulakan',
    'Pemberitahuan Lembaga dipertimbangkan / selesai (Tahap 3+)',
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
  const [severity, setSeverity] = useState<Severity>(null)
  const [checked, setChecked] = useState<boolean[]>(Array(9).fill(false))
  const [scenario, setScenario] = useState('operational')
  const [statement, setStatement] = useState('')
  const [log, setLog] = useState<LogEntry[]>([])
  const [copied, setCopied] = useState(false)

  const t = useCallback(
    (en: string, bm: string) => (lang === 'bm' ? bm : en),
    [lang]
  )

  const toggleLang = () => setLang((prev) => (prev === 'bm' ? 'en' : 'bm'))

  const addLog = (text: string) => {
    const entry: LogEntry = {
      id: Date.now(),
      time: new Date().toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      text,
    }
    setLog((prev) => [entry, ...prev])
  }

  const handleSeverity = (level: 1 | 2 | 3 | 4) => {
    setSeverity(level)
    const label = lang === 'bm' ? SEVERITY_DATA[level].bm : SEVERITY_DATA[level].en
    addLog(t(`Severity set to ${label}`, `Tahap keterukan ditetapkan: ${label}`))
  }

  const toggleCheck = (idx: number) => {
    setChecked((prev) => {
      const next = [...prev]
      next[idx] = !next[idx]
      return next
    })
  }

  const generateStatement = () => {
    const text = STATEMENTS[scenario]?.[lang] || ''
    setStatement(text)
    addLog(
      t(
        `Generated holding statement: ${SCENARIOS.en.find((s) => s.id === scenario)?.label}`,
        `Menjana kenyataan awal: ${SCENARIOS.bm.find((s) => s.id === scenario)?.label}`
      )
    )
  }

  const copyStatement = async () => {
    if (!statement) return
    try {
      await navigator.clipboard.writeText(statement)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      addLog(t('Statement copied to clipboard', 'Kenyataan disalin ke papan keratan'))
    } catch {
      addLog(t('Copy failed', 'Salinan gagal'))
    }
  }

  const clearLog = () => setLog([])

  if (mode === 'landing') {
    return (
      <Landing
        lang={lang}
        onEnterPlaybook={() => setMode('playbook')}
        onEnterManual={() => setMode('manual')}
        onToggleLang={toggleLang}
      />
    )
  }

  return (
    <>
      <header className="app-header">
        <div>
          <h1 style={{ cursor: 'pointer' }} onClick={() => setMode('landing')}>
            Escalate MY
          </h1>
          <div className="subtitle">
            {t('Crisis Communications Playbook', 'Buku Panduan Komunikasi Krisis')}
          </div>
        </div>

        <div className="header-actions">
          <nav className="mode-nav">
            <button
              className={mode === 'playbook' ? 'active' : ''}
              onClick={() => setMode('playbook')}
            >
              {t('Playbook', 'Playbook')}
            </button>
            <button
              className={mode === 'manual' ? 'active' : ''}
              onClick={() => setMode('manual')}
            >
              {t('Manual', 'Manual')}
            </button>
          </nav>

          <div className="lang-toggle">
            <button className={lang === 'bm' ? 'active' : ''} onClick={() => setLang('bm')}>
              BM
            </button>
            <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>
              EN
            </button>
          </div>
        </div>
      </header>

      <main>
        {mode === 'playbook' ? (
          <>
            <div className="dashboard-banner">
              <div>
                <h2>{t('Operational Playbook', 'Playbook Operasi')}</h2>
                <p>{t('Assess severity, complete the first-hour checklist, draft holding language, and log decisions.', 'Nilai keterukan, lengkapkan senarai semak sejam pertama, gubal bahasa kenyataan, dan log keputusan.')}</p>
              </div>
              <div className="dashboard-stats">
                <div className="dashboard-stat">
                  <span className="val">{severity ? `L${severity}` : '—'}</span>
                  <span className="lbl">{t('Severity', 'Keterukan')}</span>
                </div>
                <div className="dashboard-stat">
                  <span className="val">{checked.filter(Boolean).length}/9</span>
                  <span className="lbl">{t('Checklist', 'Senarai')}</span>
                </div>
                <div className="dashboard-stat">
                  <span className="val">{log.length}</span>
                  <span className="lbl">{t('Log entries', 'Entri log')}</span>
                </div>
              </div>
            </div>
            <section className="card">
              <h2>
                <span className="step">1</span>
                {t('Assess Severity', 'Nilai Tahap Keterukan')}
              </h2>
              <div className="severity-grid">
                {([1, 2, 3, 4] as const).map((level) => (
                  <button
                    key={level}
                    className={`severity-btn level-${level} ${severity === level ? 'selected' : ''}`}
                    onClick={() => handleSeverity(level)}
                  >
                    <span className="level">{t(`Level ${level}`, `Tahap ${level}`)}</span>
                    <span className="bm">
                      {lang === 'bm'
                        ? SEVERITY_DATA[level].bm.replace(`Tahap ${level} – `, '')
                        : SEVERITY_DATA[level].en.replace(`Level ${level} – `, '')}
                    </span>
                  </button>
                ))}
              </div>
              {severity && (
                <div className="severity-action">
                  <strong>{t('Recommended action:', 'Tindakan disyorkan:')}</strong>{' '}
                  {lang === 'bm' ? SEVERITY_DATA[severity].actionBm : SEVERITY_DATA[severity].actionEn}
                </div>
              )}
            </section>

            <section className="card">
              <h2>
                <span className="step">2</span>
                {t('First Sixty Minutes Checklist', 'Senarai Semak Enam Puluh Minit Pertama')}
              </h2>
              <ul className="checklist">
                {CHECKLIST_ITEMS[lang].map((item, idx) => (
                  <li key={idx}>
                    <input type="checkbox" checked={checked[idx]} onChange={() => toggleCheck(idx)} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="card">
              <h2>
                <span className="step">3</span>
                {t('Holding Statement Builder', 'Pembina Kenyataan Awal')}
              </h2>
              <div className="form-row">
                <label>{t('Scenario type', 'Jenis senario')}</label>
                <select value={scenario} onChange={(e) => setScenario(e.target.value)}>
                  {SCENARIOS[lang].map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="btn-row">
                <button className="btn btn-primary" onClick={generateStatement}>
                  {t('Generate Statement', 'Jana Kenyataan')}
                </button>
              </div>
              {statement && (
                <>
                  <div className="form-row" style={{ marginTop: '1rem' }}>
                    <label>{t('Editable statement', 'Kenyataan boleh sunting')}</label>
                    <textarea value={statement} onChange={(e) => setStatement(e.target.value)} />
                  </div>
                  <div className="btn-row">
                    <button className="btn btn-saffron" onClick={copyStatement}>
                      {copied ? t('Copied', 'Disalin') : t('Copy to Clipboard', 'Salin ke Papan Keratan')}
                    </button>
                  </div>
                </>
              )}
            </section>

            <section className="card">
              <h2>
                <span className="step">4</span>
                {t('Decision Log', 'Log Keputusan')}
              </h2>
              {log.length === 0 ? (
                <p className="empty-state">
                  {t(
                    'No decisions recorded yet. Actions above will appear here.',
                    'Tiada keputusan direkodkan lagi. Tindakan di atas akan dipaparkan di sini.'
                  )}
                </p>
              ) : (
                <>
                  <ul className="log-list">
                    {log.map((entry) => (
                      <li key={entry.id}>
                        <div className="time">{entry.time}</div>
                        <div>{entry.text}</div>
                      </li>
                    ))}
                  </ul>
                  <div className="btn-row">
                    <button className="btn btn-secondary" onClick={clearLog}>
                      {t('Clear Log', 'Kosongkan Log')}
                    </button>
                  </div>
                </>
              )}
            </section>
          </>
        ) : (
          <Manual lang={lang} onBackToPlaybook={() => setMode('playbook')} />
        )}
      </main>

      <footer className="app-footer">
        Escalate MY · {t('Comprehensive Malaysia Edition', 'Edisi Komprehensif Malaysia')} · v0.2
        <br />
        {t(
          'This tool does not constitute legal advice. Verify all regulatory obligations with counsel.',
          'Alat ini tidak merupakan nasihat undang-undang. Sahkan semua kewajipan peraturan dengan penasihat.'
        )}
      </footer>
    </>
  )
}

export default App
