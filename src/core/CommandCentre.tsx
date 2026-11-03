import type { Incident, Lang } from './types'

interface Props {
  lang: Lang
  incidents: Incident[]
  activeId: string | null
  backend: string
  onOpen: (id: string) => void
  onCreate: () => void
  onGo: (section: string) => void
}

export default function CommandCentre({ lang, incidents, activeId, backend, onOpen, onCreate, onGo }: Props) {
  const t = (en: string, bm: string) => (lang === 'bm' ? bm : en)
  const open = incidents.filter((i) => i.status !== 'closed')
  const critical = open.filter((i) => i.severity && i.severity >= 3).length
  const active = incidents.find((i) => i.id === activeId) || open[0]

  return (
    <div className="core-command">
      <div className="core-command__top">
        <div>
          <h2>{t('Command Centre', 'Pusat Perintah')}</h2>
          <p className="core-muted">
            {t('Active incidents · readiness · executive view', 'Insiden aktif · kesediaan · paparan eksekutif')}
            {' · '}
            <span className="mono">{backend}</span>
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={onCreate}>
          {t('New incident', 'Insiden baharu')}
        </button>
      </div>

      <div className="core-kpi">
        <div className="core-kpi__card">
          <span className="lbl">{t('Open', 'Terbuka')}</span>
          <span className="val">{open.length}</span>
        </div>
        <div className="core-kpi__card warn">
          <span className="lbl">{t('L3+ Material', 'T3+ Material')}</span>
          <span className="val">{critical}</span>
        </div>
        <div className="core-kpi__card">
          <span className="lbl">{t('Active severity', 'Keterukan aktif')}</span>
          <span className="val">{active?.severity ? `L${active.severity}` : '—'}</span>
        </div>
        <div className="core-kpi__card">
          <span className="lbl">{t('First 60 progress', 'Kemajuan 60 min')}</span>
          <span className="val">
            {active ? `${active.checked.filter(Boolean).length}/${active.checked.length}` : '—'}
          </span>
        </div>
      </div>

      <div className="core-panel">
        <div className="core-panel__head">
          <h3>{t('Active incidents', 'Insiden aktif')}</h3>
        </div>
        {open.length === 0 ? (
          <p className="core-muted">{t('No open incidents.', 'Tiada insiden terbuka.')}</p>
        ) : (
          <table className="core-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>{t('Title', 'Tajuk')}</th>
                <th>{t('Severity', 'Keterukan')}</th>
                <th>{t('Status', 'Status')}</th>
                <th>{t('Owner', 'Pemilik')}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {open.map((inc) => (
                <tr key={inc.id} className={inc.id === activeId ? 'is-active' : ''}>
                  <td className="mono">{inc.id}</td>
                  <td>{inc.title}</td>
                  <td>{inc.severity ? `L${inc.severity}` : '—'}</td>
                  <td>{inc.status}</td>
                  <td>{inc.owner}</td>
                  <td>
                    <button type="button" className="btn btn-secondary" onClick={() => onOpen(inc.id)}>
                      {t('Open', 'Buka')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="core-quick">
        <button type="button" className="btn btn-secondary" onClick={() => onGo('first60')}>
          {t('First 60 min', '60 min pertama')}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => onGo('clocks')}>
          {t('Regulatory clocks', 'Jam pengawalseliaan')}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => onGo('quorum')}>
          {t('Decision quorum', 'Kuorum keputusan')}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => onGo('statements')}>
          {t('Statements', 'Kenyataan')}
        </button>
      </div>
    </div>
  )
}
