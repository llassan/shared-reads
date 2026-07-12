import { ReactNode } from 'react'

interface PageTitleProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export const PageTitle = ({ title, subtitle, actions }: PageTitleProps) => (
  <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
    <div>
      <h1 className="font-display text-4xl font-semibold text-primary-950">{title}</h1>
      {subtitle && <p className="mt-2 text-stone-500">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>}
  </div>
)
