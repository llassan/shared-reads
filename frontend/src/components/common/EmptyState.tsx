import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  body: string
  action?: ReactNode
}

export const EmptyState = ({ icon: Icon, title, body, action }: EmptyStateProps) => (
  <div className="card text-center py-20">
    <Icon className="h-12 w-12 text-stone-300 mx-auto mb-4" />
    <h2 className="font-display text-2xl font-semibold text-ink mb-2">{title}</h2>
    <p className="text-stone-500 max-w-sm mx-auto">{body}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
)
