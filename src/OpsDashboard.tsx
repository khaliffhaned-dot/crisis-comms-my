import { useEffect, useState, useMemo } from 'react'
import './ops-dashboard.css'

type Lang = 'bm' | 'en'
type SeverityData = Record<1 | 2 | 3 | 4, { en: string; bm: string; actionEn: string; actionBm: string }>
type Scenario = { id: string; label: string }
type LogEntry = { id: number; time: string; text: string }
type Client = { id: string; name: string; short: string; market: string }

interface OpsDashboardProps {
  lang: Lang
  t: (en: string, bm: string) => string
  client: Client
  severity: 1 | 2 | 3 | 4 | null
  checked: boolean[]
  statement: string
  scenario: string
  log: LogEntry[]
  severityData: SeverityData
  scenarios: { en: Scenario[]; bm: Scenario[] }
  onGoSeverity: () => void
  onGoStatements: () => void
}

interface LiveMetrics {
  mediaMentions: number
  socialVolume: number
  sentimentNeg: number
  monitoringSources: number
  lastTick: number
}

interface TickerItem {
  id: number
  source: string
  text: string
  tone: 'neutral' | 'elevated' | 'critical'
  time: string
}

function seedFromClient(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return h
}

function formatMY(date: Date) {
  return date.toLocaleString('en-MY', {
    timeZone: 'Asia/Kuala_Lumpur',
    dateStyle: 'medium',
    timeStyle: 'medium',
  })
}

function formatTimeMY(date: Date) {
  return date.toLocaleTimeString('en-MY', {
    timeZone: 'Asia/Kuala_Lumpur',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const TICKER_EN = [
  { source: 'Bernama', text: 'Wire monitoring: no new material statements on issuer', tone: 'neutral' as const },
  { source: 'The Star', text: 'Business desk query logged — awaiting holding language', tone: 'elevated' as const },
  { source: 'X / Twitter', text: 'Conversation volume +12% in last 15 min (issuer cashtag)', tone: 'elevated' as const },
  { source: 'Bursa', text: 'No new issuer announcement in last scan window', tone: 'neutral' as const },
  { source: 'Facebook', text: 'Community page comments trending on related topic', tone: 'elevated' as const },
  { source: 'Internal', text: 'Crisis team channel active — 3 members online', tone: 'neutral' as const },
  { source: 'TikTok', text: 'Short-form clip recirculating — verify origin', tone: 'critical' as const },
  { source: 'WhatsApp', text: 'Stakeholder forward detected in monitored groups', tone: 'elevated' as const },
]

const TICKER_BM = [
  { source: 'Bernama', text: 'Pemantauan wayar: tiada kenyataan material baharu mengenai penerbit', tone: 'neutral' as const },
  { source: 'The Star', text: 'Pertanyaan meja perniagaan direkod — menunggu bahasa kenyataan', tone: 'elevated' as const },
  { source: 'X / Twitter', text: 'Volum perbualan +12% dalam 15 min terakhir (cashtag penerbit)', tone: 'elevated' as const },
  { source: 'Bursa', text: 'Tiada pengumuman penerbit baharu dalam tetingkap imbasan', tone: 'neutral' as const },
  { source: 'Facebook', text: 'Komen halaman komuniti meningkat mengenai topik berkaitan', tone: 'elevated' as const },
  { source: 'Dalaman', text: 'Saluran pasukan krisis aktif — 3 ahli dalam talian', tone: 'neutral' as const },
  { source: 'TikTok', text: 'Klip pendek dikitar semula — sahkan sumber', tone: 'critical' as const },
  { source: 'WhatsApp', text: 'Pemajuan pihak berkepentingan dikesan dalam kumpulan dipantau', tone: 'elevated' as const },
]

export default function OpsDashboard({
  lang, t, client, severity, checked, statement, scenario, log,
  severityData, scenarios, onGoSeverity, onGoStatements,
}: OpsDashboardProps) {
  const done = checked.filter(Boolean).length
  const seed = useMemo(() => seedFromClient(client.id), [client.id])

  const [now, setNow] = useState(() => new Date())
  const [metrics, setMetrics] = useState<LiveMetrics>(() => ({
    mediaMentions: 18 + (seed % 40),
    socialVolume: 120 + (seed % 200),
    sentimentNeg: 12 + (seed % 25),
    monitoringSources: 6,
    lastTick: Date.now(),
  }))
  const [ticker, setTicker] = useState<TickerItem[]>([])
  const [liveOn, setLiveOn] = useState(true)
  const [tickCount, setTickCount] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (!liveOn) return
    const templates = lang === 'bm' ? TICKER_BM : TICKER_EN

    const pushTick = () => {
      const tpl = templates[Math.floor(Math.random() * templates.length)]
      const item: TickerItem = {
        id: Date.now() + Math.random(),
        source: tpl.source,
        text: tpl.text,
        tone: severity && severity >= 3 && Math.random() > 0.5 ? 'critical' : tpl.tone,
        time: formatTimeMY(new Date()),
      }
      setTicker((prev) => [item, ...prev].slice(0, 8))
      setMetrics((m) => {
        const spike = severity && severity >= 3 ? 4 : severity && severity >= 2 ? 2 : 1
        return {
          mediaMentions: Math.max(0, m.mediaMentions + Math.floor(Math.random() * 3 * spike) - (Math.random() > 0.7 ? 1 : 0)),
          socialVolume: Math.max(0, m.socialVolume + Math.floor(Math.random() * 12 * spike) - 2),
          sentimentNeg: Math.min(95, Math.max(5, m.sentimentNeg + (Math.random() > 0.55 ? spike : -1))),
          monitoringSources: m.monitoringSources,
          lastTick: Date.now(),
        }
      })
      setTickCount((c) => c + 1)
    }

    if (ticker.length === 0) {
      setTicker(
        templates.slice(0, 4).map((tpl, i) => ({
          id: Date.now() - i * 1000,
          source: tpl.source,
          text: tpl.text,
          tone: tpl.tone,
          time: formatTimeMY(new Date(Date.now() - i * 45000)),
        }))
      )
    }

    const id = window.setInterval(pushTick, 4500 + (seed % 1500))
    return () => window.clearInterval(id)
  }, [liveOn, lang, severity, client.id, seed])

  useEffect(() => {
    if (!severity) return
    setMetrics((m) => ({
      ...m,
      mediaMentions: m.mediaMentions + severity * 3,
      socialVolume: m.socialVolume + severity * 15,
      sentimentNeg: Math.min(90, m.sentimentNeg + severity * 4),
      lastTick: Date.now(),
    }))
  }, [severity])

  const secondsAgo = Math.max(0, Math.floor((Date.now() - metrics.lastTick) / 1000))

  return (
    <div className="ops-dashboard">
      <div className="ops-dashboard__top">
        <div className="ops-dashboard__title-block">
          <div className="ops-status-row">
            <span className={`ops-status-pill ${severity && severity >= 3 ? 'critical' : severity && severity >= 2 ? 'elevated' : 'idle'}`}>
              {severity ? t(`Active · Level ${severity}`, `Aktif · Tahap ${severity}`) : t('Standby', 'Sedia')}
            </span>
            <span className={`ops-live-badge ${liveOn ? 'on' : 'off'}`}>
              <span className="ops-live-dot" />
              {liveOn ? t('LIVE', 'LANGSUNG') : t('PAUSED', 'DIJEDA')}
            </span>
            <span className="ops-clock">{formatMY(now)} · MYT</span>
          </div>
          <h2>{t('Incident command dashboard', 'Papan pemuka perintah insiden')}</h2>
          <p className="ops-context">
            {t(`Client: ${client.name} · ${client.market} · Feed ticks: ${tickCount}`, `Klien: ${client.name} · ${client.market} · Tick suapan: ${tickCount}`)}
          </p>
        </div>
        <div className="ops-quick-actions">
          <button type="button" className={`btn ${liveOn ? 'btn-secondary' : 'btn-saffron'}`} onClick={() => setLiveOn((v) => !v)}>
            {liveOn ? t('Pause live feed', 'Jeda suapan langsung') : t('Resume live feed', 'Sambung suapan')}
          </button>
          <button type="button" className="btn btn-saffron" onClick={onGoSeverity}>{t('Set severity', 'Tetapkan keterukan')}</button>
          <button type="button" className="btn btn-secondary" onClick={onGoStatements}>{t('Draft statement', 'Gubal kenyataan')}</button>
        </div>
      </div>

      <div className="ops-kpi-grid ops-kpi-grid--6">
        <div className={`ops-kpi ${severity ? 'has-value' : ''}`}>
          <div className="ops-kpi__label">{t('Severity', 'Keterukan')}</div>
          <div className="ops-kpi__value">
            {severity ? <span className={`sev-badge sev-${severity}`}>L{severity}</span> : <span className="ops-kpi__empty">—</span>}
          </div>
          <div className="ops-kpi__meta">
            {severity
              ? lang === 'bm'
                ? severityData[severity].bm.replace(/^Tahap \d+ – /, '')
                : severityData[severity].en.replace(/^Level \d+ – /, '')
              : t('Not assessed', 'Belum dinilai')}
          </div>
        </div>

        <div className="ops-kpi">
          <div className="ops-kpi__label">{t('First 60 min', '60 min pertama')}</div>
          <div className="ops-kpi__value">{done}<span className="ops-kpi__denom">/9</span></div>
          <div className="ops-kpi__bar"><div className="ops-kpi__bar-fill" style={{ width: `${(done / 9) * 100}%` }} /></div>
          <div className="ops-kpi__meta">{done === 9 ? t('Checklist complete', 'Senarai lengkap') : t('In progress', 'Dalam proses')}</div>
        </div>

        <div className="ops-kpi ops-kpi--live">
          <div className="ops-kpi__label">{t('Media mentions', 'Sebutan media')}</div>
          <div className="ops-kpi__value">{metrics.mediaMentions}</div>
          <div className="ops-kpi__meta">{t(`Updated ${secondsAgo}s ago`, `Dikemas kini ${secondsAgo}s lalu`)}</div>
        </div>

        <div className="ops-kpi ops-kpi--live">
          <div className="ops-kpi__label">{t('Social volume', 'Volum sosial')}</div>
          <div className="ops-kpi__value">{metrics.socialVolume}</div>
          <div className="ops-kpi__meta">{t('Posts / comments (rolling)', 'Siaran / komen (bergulung)')}</div>
        </div>

        <div className="ops-kpi ops-kpi--live">
          <div className="ops-kpi__label">{t('Neg. sentiment', 'Sentimen neg.')}</div>
          <div className="ops-kpi__value">{Math.round(metrics.sentimentNeg)}<span className="ops-kpi__denom">%</span></div>
          <div className="ops-kpi__bar"><div className="ops-kpi__bar-fill ops-kpi__bar-fill--warn" style={{ width: `${Math.min(100, metrics.sentimentNeg)}%` }} /></div>
          <div className="ops-kpi__meta">{t('Share of negative tone', 'Bahagian nada negatif')}</div>
        </div>

        <div className="ops-kpi">
          <div className="ops-kpi__label">{t('Decisions logged', 'Keputusan direkod')}</div>
          <div className="ops-kpi__value">{log.length}</div>
          <div className="ops-kpi__meta">{log.length ? t(`Last: ${log[0].time}`, `Terakhir: ${log[0].time}`) : t('No entries yet', 'Belum ada entri')}</div>
        </div>
      </div>

      <div className="ops-panels ops-panels--3">
        <div className="ops-panel">
          <div className="ops-panel__head"><h3>{t('Recommended next steps', 'Langkah seterusnya')}</h3></div>
          <ul className="ops-next-list">
            {!severity && (<li><span className="ops-step-num">1</span>{t('Assess and set severity level', 'Nilai dan tetapkan tahap keterukan')}</li>)}
            {severity && severity >= 3 && (<li><span className="ops-step-num">!</span>{t('Notify Board and assess Bursa disclosure', 'Maklumkan Lembaga dan nilai pendedahan Bursa')}</li>)}
            <li><span className="ops-step-num">2</span>{t('Work through the first-hour checklist', 'Kerjakan senarai semak sejam pertama')}</li>
            <li><span className="ops-step-num">3</span>{t('Generate and clear a holding statement', 'Jana dan luluskan kenyataan awal')}</li>
            <li><span className="ops-step-num">4</span>{t('Keep the decision log current', 'Pastikan log keputusan terkini')}</li>
          </ul>
          <div className="ops-statement-chip">
            {statement ? t('Holding draft ready', 'Draf kenyataan sedia') : t(`Scenario: ${scenarios[lang].find((s) => s.id === scenario)?.label}`, `Senario: ${scenarios[lang].find((s) => s.id === scenario)?.label}`)}
          </div>
        </div>

        <div className="ops-panel ops-panel--wide">
          <div className="ops-panel__head ops-panel__head--row">
            <h3>{t('Live monitoring feed', 'Suapan pemantauan langsung')}</h3>
            <span className="ops-feed-hint">{t('Demo stream · plug API later', 'Suapan demo · sambung API kemudian')}</span>
          </div>
          {ticker.length === 0 ? (
            <p className="ops-feed-empty">{t('Waiting for live ticks…', 'Menunggu tick langsung…')}</p>
          ) : (
            <ul className="ops-live-feed">
              {ticker.map((item) => (
                <li key={item.id} className={`tone-${item.tone}`}>
                  <span className="ops-live-feed__time">{item.time}</span>
                  <span className="ops-live-feed__source">{item.source}</span>
                  <span className="ops-live-feed__text">{item.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="ops-panel">
          <div className="ops-panel__head"><h3>{t('Activity log', 'Log aktiviti')}</h3></div>
          {log.length === 0 ? (
            <p className="ops-feed-empty">{t('Actions you take will appear here with timestamps.', 'Tindakan anda akan dipaparkan di sini dengan cap masa.')}</p>
          ) : (
            <ul className="ops-feed">
              {log.slice(0, 6).map((entry) => (
                <li key={entry.id}>
                  <span className="ops-feed-time">{entry.time}</span>
                  <span className="ops-feed-text">{entry.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
