import { useState } from 'react'
import DemoWalkthrough from './DemoWalkthrough'
import type { Lang } from './core/types'

/**
 * The public, no-login /demo route — a dedicated, shareable URL for social
 * posts and sales outreach (escalate.my/demo). Deliberately does NOT mount
 * CoreShell: no sidebar, no 20-item nav, no Settings/Admin/API management,
 * nothing that needs training to understand. It owns just enough state
 * (language) to host DemoWalkthrough in standalone mode, whose terminal
 * step is a Board Summary + "Book a discussion" / "Request access" CTA —
 * never a portal into the real app. See diagrams/user-funnel.md for how
 * this differs from the embedded "Try it yourself" demo reached from the
 * full marketing Landing page.
 */
export default function PublicDemo() {
  const [lang, setLang] = useState<Lang>('en')

  return (
    <DemoWalkthrough
      lang={lang}
      onToggleLang={() => setLang((p) => (p === 'bm' ? 'en' : 'bm'))}
      onExit={() => {
        window.location.href = '/'
      }}
      standalone
    />
  )
}
