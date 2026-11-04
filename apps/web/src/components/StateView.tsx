import { AlertCircle, Inbox, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function LoadingState({ label = 'Loading incident…' }: { label?: string }) {
  return (
    <Card>
      <CardContent className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-sm">
        <Loader2 className="size-5 animate-spin" aria-hidden="true" />
        {label}
      </CardContent>
    </Card>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        <AlertCircle className="text-destructive size-6" aria-hidden="true" />
        <p className="text-sm font-medium">Could not load this incident</p>
        <p className="text-muted-foreground max-w-sm text-xs">{message}</p>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            Try again
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
        <Inbox className="text-muted-foreground size-6" aria-hidden="true" />
        <p className="text-sm font-medium">{title}</p>
        <p className="text-muted-foreground max-w-sm text-xs">{body}</p>
      </CardContent>
    </Card>
  )
}
