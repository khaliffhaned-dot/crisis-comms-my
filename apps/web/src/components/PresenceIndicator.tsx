import type { PresenceEntry } from '@/lib/types'
import { cn } from '@/lib/utils'

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?'
}

/** Who else is looking at this incident right now. Renders nothing when
 * no one else is connected — presence is only worth saying something when
 * there's something to say (same principle as ActionBanner). */
export function PresenceIndicator({ presence, className }: { presence: PresenceEntry[]; className?: string }) {
  if (presence.length === 0) return null

  const shown = presence.slice(0, 4)
  const overflow = presence.length - shown.length

  return (
    <div className={cn('flex items-center gap-2', className)} aria-label={`${presence.length} viewing this incident now`}>
      <div className="flex -space-x-2">
        {shown.map((p) => (
          <span
            key={p.id}
            title={p.name}
            className="bg-secondary text-secondary-foreground border-background flex size-6 items-center justify-center rounded-full border-2 text-[10px] font-bold"
          >
            {initials(p.name)}
          </span>
        ))}
        {overflow > 0 && (
          <span className="bg-muted text-muted-foreground border-background flex size-6 items-center justify-center rounded-full border-2 text-[10px] font-bold">
            +{overflow}
          </span>
        )}
      </div>
      <span className="text-muted-foreground text-xs font-medium">
        {presence.length} online
      </span>
    </div>
  )
}
