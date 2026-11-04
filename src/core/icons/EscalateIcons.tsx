/**
 * Escalate Icon Set — first pass, governance-specific, drawn to spec:
 * 24x24, 2px stroke, rounded caps/joins, no fill.
 *
 * Honest scope note: this is a first AI-drafted pass, not a finished
 * professional icon system. A hand-drawn set like this benefits a lot
 * from a real designer's eye for optical balance and stroke-weight
 * consistency across the whole family — treat this as a starting point
 * to critique and refine, not a done deliverable.
 *
 * Color is deliberately NOT hardcoded per-icon (no baked-in navy/red) —
 * every icon uses `stroke="currentColor"` so the calling context controls
 * color via CSS `color`, exactly like the already-adopted Lucide icons
 * elsewhere in this app (Landing.tsx). This lets the same icon recolor
 * for a severity state (e.g. an Incident icon in L4 red) without a
 * separate icon variant per color, which hardcoding would have required.
 *
 * Note on the navy #0B1F44 in the original spec: the app already has two
 * different --navy tokens on file (index.css #111827, theme.css #18181b).
 * Introducing a third navy just for icons would fragment the palette
 * further, so these default to currentColor (inheriting whatever navy
 * the surrounding UI already uses) rather than a new hardcoded hex.
 *
 * Only 12 of these 15 are wired into real UI so far (moduleConfig.ts's
 * nav, replacing its raw Unicode glyphs — see .ux-profile.md's banned
 * anti-aesthetics note on that file). Severity, Stakeholder and Action
 * don't have a current nav home; they're exported for the next place
 * that needs them rather than left unused in a drawer.
 */
import type { SVGProps } from 'react'

export interface EscalateIconProps extends SVGProps<SVGSVGElement> {
  size?: number
}

function iconProps(size: number, props: SVGProps<SVGSVGElement>) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    ...props,
  }
}

/** Plain shield — the base "Incident" glyph (msg 1's "Active Incident" family starts here). */
export function IncidentIcon({ size = 24, ...props }: EscalateIconProps) {
  return (
    <svg {...iconProps(size, props)}>
      <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" />
    </svg>
  )
}

/** Warning triangle + exclamation — distinct from the plain Incident shield. */
export function SeverityIcon({ size = 24, ...props }: EscalateIconProps) {
  return (
    <svg {...iconProps(size, props)}>
      <path d="M12 4l9 15H3l9-15z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Scales — compliance / obligation tracking. */
export function RegulationIcon({ size = 24, ...props }: EscalateIconProps) {
  return (
    <svg {...iconProps(size, props)}>
      <path d="M12 3v18" />
      <path d="M7 7h10" />
      <path d="M4 7l-3 6a3.5 3.5 0 0 0 7 0L5 7" />
      <path d="M20 7l-3 6a3.5 3.5 0 0 0 7 0l-3-6" />
      <path d="M9 21h6" />
    </svg>
  )
}

/** Branch point — a decision splitting into outcomes. */
export function DecisionIcon({ size = 24, ...props }: EscalateIconProps) {
  return (
    <svg {...iconProps(size, props)}>
      <circle cx="5" cy="12" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="18" cy="18" r="2" />
      <path d="M7 12h3" />
      <path d="M10 12l6-5.3" />
      <path d="M10 12l6 5.3" />
    </svg>
  )
}

/** Magnifier over a checklist — audit / verification. */
export function AuditIcon({ size = 24, ...props }: EscalateIconProps) {
  return (
    <svg {...iconProps(size, props)}>
      <path d="M6 3h10l3 3v6" />
      <path d="M9 8h5" />
      <path d="M9 11h3" />
      <circle cx="10" cy="17" r="4" />
      <path d="M13 20l3 3" />
    </svg>
  )
}

/** Forward arrow — a required action, next step. */
export function ActionIcon({ size = 24, ...props }: EscalateIconProps) {
  return (
    <svg {...iconProps(size, props)}>
      <path d="M5 12h12" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  )
}

/** Single person outline. */
export function StakeholderIcon({ size = 24, ...props }: EscalateIconProps) {
  return (
    <svg {...iconProps(size, props)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </svg>
  )
}

/** Document with a paperclip — preserved evidence. */
export function EvidenceIcon({ size = 24, ...props }: EscalateIconProps) {
  return (
    <svg {...iconProps(size, props)}>
      <path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v4h4" />
      <path d="M9 13h6" />
      <path d="M9 16h6" />
    </svg>
  )
}

/** Horizontal line with 3 nodes — matches the proposal's own "○──○──●──○" sketch. */
export function TimelineIcon({ size = 24, ...props }: EscalateIconProps) {
  return (
    <svg {...iconProps(size, props)}>
      <path d="M3 12h4.5" />
      <path d="M9.5 12h5" />
      <path d="M16.5 12H21" />
      <circle cx="6" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <circle cx="18" cy="12" r="2" />
    </svg>
  )
}

/** 2x2 grid — the command/overview surface. */
export function CommandCentreIcon({ size = 24, ...props }: EscalateIconProps) {
  return (
    <svg {...iconProps(size, props)}>
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  )
}

/** Document with text lines and a folded corner. */
export function ReportIcon({ size = 24, ...props }: EscalateIconProps) {
  return (
    <svg {...iconProps(size, props)}>
      <path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v4h4" />
      <path d="M8 12h8" />
      <path d="M8 15h8" />
      <path d="M8 18h5" />
    </svg>
  )
}

/** Document with a checkmark — sign-off. */
export function ApprovalIcon({ size = 24, ...props }: EscalateIconProps) {
  return (
    <svg {...iconProps(size, props)}>
      <path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v4h4" />
      <path d="M8.5 14.5l2 2 4-4.5" />
    </svg>
  )
}

/** Bell outline. */
export function NotificationIcon({ size = 24, ...props }: EscalateIconProps) {
  return (
    <svg {...iconProps(size, props)}>
      <path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  )
}

/** Two overlapping people — a team, not one stakeholder. */
export function TeamIcon({ size = 24, ...props }: EscalateIconProps) {
  return (
    <svg {...iconProps(size, props)}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 20c0-3.6 2.7-6 6-6s6 2.4 6 6" />
      <path d="M15.5 5a3.5 3.5 0 0 1 0 7" />
      <path d="M21 20c0-3-1.9-5.3-4.5-5.9" />
    </svg>
  )
}

/** Circle with clock hands. */
export function ClockIcon({ size = 24, ...props }: EscalateIconProps) {
  return (
    <svg {...iconProps(size, props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  )
}
