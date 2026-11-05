import { useState } from 'react'
import DemoWalkthrough from './DemoWalkthrough'
import type { Lang } from './core/types'

/**
 * The public, no-login /demo route — a dedicated, shareable URL for social
 * posts and sales outreach (escalate.my/demo). Deliberately does NOT mount
 * CoreShell: no sidebar, no 20-item nav, no Settings/Admin/API management,
 * nothing that needs training to understand. It owns just enough state
 * (language) to host DemoWalkthrough with chrome="full" (a full-viewport
 * takeover with its own exit button back to '/'), for someone who follows
 * this link directly rather than scrolling the marketing Landing page,
 * where the same component now runs inline (chrome="inline", see
 * Landing.tsx's "See it in action" section). Either way the terminal step
 * is a Board Summary + "Book a discussion" / "Request access" CTA — never
 * a portal into the real app.
 */
export default function PublicDemo() {
  const [lang, setLang] = useState<Lang>('en')

  return (
    <DemoWalkthrough
      lang={lang}
      onToggleLang={() => setLang((p) => (p === 'bm' ? 'en' : 'bm'))}
      chrome="full"
      onExit={() => {
        window.location.href = '/'
      }}
    />
  )
}
