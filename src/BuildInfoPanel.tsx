import { useState } from 'react'

type Environment = 'Production' | 'Preview' | 'Local / unknown'

function getEnvironment(): Environment {
  if (!__BUILD_INFO__.isPages) return 'Local / unknown'
  return __BUILD_INFO__.branch === 'main' ? 'Production' : 'Preview'
}

export default function BuildInfoPanel() {
  const [open, setOpen] = useState(false)
  const environment = getEnvironment()
  const isPreview = environment === 'Preview'
  const version = __BUILD_INFO__.commit ? __BUILD_INFO__.commit.slice(0, 7) : 'Unavailable'
  const branch = __BUILD_INFO__.branch || 'Unavailable'

  return (
    <aside className="build-info" aria-label="System build information">
      {isPreview && (
        <p className="build-info__warning" role="status">
          Preview environment — do not use for live incident response.
        </p>
      )}
      <button
        type="button"
        className="build-info__toggle"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        System status · {environment}
      </button>
      {open && (
        <section className="build-info__panel" aria-label="Settings: System">
          <h2>Settings · System</h2>
          {isPreview && <p className="build-info__warning">Preview environment</p>}
          <dl>
            <div><dt>Version</dt><dd>{version}</dd></div>
            <div><dt>Branch</dt><dd>{branch}</dd></div>
            <div><dt>Environment</dt><dd>{environment}</dd></div>
            <div>
              <dt>Deployment URL</dt>
              <dd>
                {__BUILD_INFO__.url ? (
                  <a href={__BUILD_INFO__.url} target="_blank" rel="noreferrer">{__BUILD_INFO__.url}</a>
                ) : 'Unavailable'}
              </dd>
            </div>
          </dl>
        </section>
      )}
    </aside>
  )
}
