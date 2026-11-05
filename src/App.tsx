import CoreShell from './CoreShell'
import PublicDemo from './PublicDemo'
import BuildInfoPanel from './BuildInfoPanel'
import './index.css'
import './modules.css'
import './landing-light.css'

/**
 * /demo is the dedicated, shareable public-demo URL (see PublicDemo.tsx) —
 * a direct hit on it (e.g. from a social post) must never show app chrome
 * or load the real Command Centre's data. No router library here by
 * design (this is a small marketing + guided-demo app); a path check is
 * enough for one dedicated route. public/_redirects makes a direct hit on
 * /demo resolve to this same index.html on Cloudflare Pages.
 */
const isPublicDemo = window.location.pathname.replace(/\/+$/, '') === '/demo'

export default function App() {
  if (isPublicDemo) return <PublicDemo />

  return (
    <>
      <CoreShell />
      <BuildInfoPanel />
    </>
  )
}
