import { ChevronDown, FileText, Home, Menu, ShieldAlert } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useState } from 'react'
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
import { useCurrentActor } from '@/lib/useIdentity'
import { cn } from '@/lib/utils'

function initials(name: string): string {
  return (
    name
      .split(' ')
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'
  )
}

interface NavChild {
  id: string
  label: string
  href: string
}

interface NavItem {
  id: string
  label: string
  icon: LucideIcon
  href: string
  children?: NavChild[]
}

/**
 * Array-driven, not a fixed count — grows by adding an entry, not by
 * revisiting a cap. "Actions" and "Regulatory" are children of "Incidents"
 * (they deep-link into IncidentDetails' own sections, not separate pages)
 * rather than flat siblings, so the nav shape matches what the app actually
 * has today without inventing screens that don't exist yet.
 */
function navItems(activeIncidentId: string | null): NavItem[] {
  const incidentHref = activeIncidentId ? `/incident/${activeIncidentId}` : '/incident'
  return [
    { id: 'home', label: 'Home', icon: Home, href: '/' },
    {
      id: 'incidents',
      label: 'Incidents',
      icon: ShieldAlert,
      href: incidentHref,
      children: [
        { id: 'actions', label: 'Actions', href: `${incidentHref}#actions` },
        { id: 'regulatory', label: 'Regulatory', href: `${incidentHref}#regulatory` },
      ],
    },
    { id: 'board-brief', label: 'BoardBrief', icon: FileText, href: '/board-brief' },
  ]
}

export function AppShell({ activeIncidentId, children }: { activeIncidentId: string | null; children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const items = navItems(activeIncidentId)
  const actor = useCurrentActor()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  function isActive(href: string) {
    const path = href.split('#')[0]
    return path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
  }

  function isGroupActive(item: NavItem) {
    return isActive(item.href) || (item.children?.some((c) => isActive(c.href)) ?? false)
  }

  function isExpanded(item: NavItem) {
    return expanded[item.id] ?? isGroupActive(item)
  }

  return (
    <div className="bg-background flex min-h-dvh flex-col md:flex-row">
      {/* Desktop sidebar — mobile keeps the bottom tab bar below, unchanged. */}
      <aside className="bg-background sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r md:flex">
        <Link to="/" className="flex items-center gap-2 border-b px-5 py-4 font-semibold">
          <span className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md text-xs font-bold">
            E
          </span>
          <span className="flex flex-col leading-tight">
            Escalate MY
            <span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
              Crisis Intelligence
            </span>
          </span>
        </Link>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3" aria-label="Primary">
          {items.map((item) => {
            const groupActive = isGroupActive(item)
            return (
              <div key={item.id}>
                <div className="flex items-center">
                  <Link
                    to={item.href}
                    className={cn(
                      'text-muted-foreground hover:text-foreground hover:bg-accent flex h-11 flex-1 items-center gap-2.5 rounded-md px-3 text-sm font-medium transition-colors',
                      groupActive && 'bg-secondary text-foreground'
                    )}
                  >
                    <item.icon className="size-4 shrink-0" aria-hidden="true" />
                    {item.label}
                  </Link>
                  {item.children && item.children.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setExpanded((prev) => ({ ...prev, [item.id]: !isExpanded(item) }))}
                      aria-expanded={isExpanded(item)}
                      aria-label={`${isExpanded(item) ? 'Collapse' : 'Expand'} ${item.label}`}
                      className="text-muted-foreground hover:text-foreground flex size-11 shrink-0 items-center justify-center rounded-md"
                    >
                      <ChevronDown
                        className={cn('size-4 transition-transform', isExpanded(item) && 'rotate-180')}
                        aria-hidden="true"
                      />
                    </button>
                  )}
                </div>
                {item.children && item.children.length > 0 && isExpanded(item) && (
                  <div className="mt-0.5 ml-4 flex flex-col gap-0.5 border-l pl-3">
                    {item.children.map((child) => {
                      const childActive = isActive(child.href)
                      return (
                        <Link
                          key={child.id}
                          to={child.href}
                          className={cn(
                            'text-muted-foreground hover:text-foreground flex h-11 items-center rounded-md border-l-2 border-transparent pl-3 text-sm font-medium transition-colors',
                            childActive && 'border-primary bg-primary/5 text-primary font-semibold'
                          )}
                        >
                          {child.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="flex items-center gap-2 border-t px-4 py-3" title={actor}>
          <span
            className="bg-secondary text-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
            aria-hidden="true"
          >
            {initials(actor)}
          </span>
          <span className="text-muted-foreground truncate text-sm font-medium">{actor}</span>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-24 md:pb-6">{children}</main>

        {/* Mobile bottom tab bar — collapses the sidebar's items into a fixed strip, fixed, 44px+ targets. */}
        <nav
          className="bg-background fixed inset-x-0 bottom-0 z-20 border-t md:hidden"
          aria-label="Primary"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="grid" style={{ gridTemplateColumns: `repeat(${items.length + 1}, minmax(0, 1fr))` }}>
            {items.map((item) => (
              <Link
                key={item.id}
                to={item.href}
                className={cn(
                  'text-muted-foreground flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium',
                  isGroupActive(item) && 'text-primary'
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
                  {items.flatMap((item) => item.children ?? []).map((child) => (
                    <DrawerClose key={child.id} asChild>
                      <button
                        type="button"
                        onClick={() => navigate(child.href)}
                        className="hover:bg-accent flex min-h-12 items-center rounded-md px-3 text-left text-sm font-medium"
                      >
                        {child.label}
                      </button>
                    </DrawerClose>
                  ))}
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </nav>
      </div>
    </div>
  )
}
