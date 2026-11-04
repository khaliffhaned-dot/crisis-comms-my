import { ClipboardCheck, Home, Menu, ShieldAlert, Timer } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { cn } from '@/lib/utils'

/**
 * Exactly 5 tabs, per the product brief: no Analytics, no Charts, no
 * Reports, no Monitoring tab. "Actions" and "Regulatory" deep-link into
 * IncidentDetails' own sections (#actions / #regulatory) rather than being
 * separate pages — this prototype is 3 screens, not 5.
 */
function navItems(activeIncidentId: string | null) {
  const incidentHref = activeIncidentId ? `/incident/${activeIncidentId}` : '/incident'
  return [
    { id: 'home', label: 'Home', icon: Home, href: '/' },
    { id: 'incidents', label: 'Incidents', icon: ShieldAlert, href: incidentHref },
    { id: 'actions', label: 'Actions', icon: ClipboardCheck, href: `${incidentHref}#actions` },
    { id: 'regulatory', label: 'Regulatory', icon: Timer, href: `${incidentHref}#regulatory` },
  ] as const
}

export function AppShell({ activeIncidentId, children }: { activeIncidentId: string | null; children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const items = navItems(activeIncidentId)

  function isActive(href: string) {
    const path = href.split('#')[0]
    return path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
  }

  return (
    <div className="bg-background flex min-h-dvh flex-col">
      <header className="bg-background/95 sticky top-0 z-20 border-b backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-6 px-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md text-xs font-bold">
              E
            </span>
            Escalate MY
          </Link>
          <nav className="hidden flex-1 items-center gap-1 md:flex" aria-label="Primary">
            {items.map((item) => (
              <Link
                key={item.id}
                to={item.href}
                className={cn(
                  'text-muted-foreground hover:text-foreground flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors',
                  isActive(item.href) && 'bg-secondary text-foreground'
                )}
              >
                <item.icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            ))}
            <Link
              to="/board-brief"
              className={cn(
                'text-muted-foreground hover:text-foreground flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors',
                isActive('/board-brief') && 'bg-secondary text-foreground'
              )}
            >
              BoardBrief
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-24 md:pb-6">{children}</main>

      {/* Mobile bottom tab bar — 5 tabs exactly, fixed, 44px+ targets. */}
      <nav
        className="bg-background fixed inset-x-0 bottom-0 z-20 border-t md:hidden"
        aria-label="Primary"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-5">
          {items.map((item) => (
            <Link
              key={item.id}
              to={item.href}
              className={cn(
                'text-muted-foreground flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium',
                isActive(item.href) && 'text-primary'
              )}
            >
              <item.icon className="size-5" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
          <Drawer>
            <DrawerTrigger asChild>
              <button
                type="button"
                className="text-muted-foreground flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium"
              >
                <Menu className="size-5" aria-hidden="true" />
                More
              </button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>More</DrawerTitle>
              </DrawerHeader>
              <div className="flex flex-col gap-1 p-4 pt-0">
                <DrawerClose asChild>
                  <button
                    type="button"
                    onClick={() => navigate('/board-brief')}
                    className="hover:bg-accent flex min-h-12 items-center rounded-md px-3 text-left text-sm font-medium"
                  >
                    BoardBrief
                  </button>
                </DrawerClose>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </nav>
    </div>
  )
}
