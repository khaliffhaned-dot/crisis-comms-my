import CoreShell from './CoreShell'
import PublicDemo from './PublicDemo'
import WhyEscalate from './WhyEscalate'
import BuildInfoPanel from './BuildInfoPanel'
import './index.css'
import './modules.css'
import './landing-light.css'

/**
 * /demo and /why-escalate are dedicated, shareable public URLs — a direct
 * hit on either (e.g. from a social post or a sales link) must never show
 * app chrome or load the real Command Centre's data. No router library
 * here by design (this is a small marketing + guided-demo app); a path
 * check is enough for a couple of dedicated routes. public/_redirects
 * makes a direct hit on either resolve to this same index.html on
 * Cloudflare Pages.
 */
const path = window.location.pathname.replace(/\/+$/, '')
const isPublicDemo = path === '/demo'
const isWhyEscalate = path === '/why-escalate'

export default function App() {
  if (isPublicDemo) return <PublicDemo />
  if (isWhyEscalate) return <WhyEscalate />

  return (
    <>
      <CoreShell />
      <BuildInfoPanel />
    </>
  )
}
