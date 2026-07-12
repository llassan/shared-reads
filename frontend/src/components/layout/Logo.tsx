import { Link } from 'react-router-dom'
import clsx from 'clsx'

interface LogoProps {
  className?: string
  light?: boolean
}

export const Logo = ({ className, light = false }: LogoProps) => (
  <Link to="/" className={clsx('inline-flex items-center gap-2.5 group', className)}>
    <img src="/logo.svg" alt="" className="h-9 w-9 rounded-xl shadow-sm" />
    <span
      className={clsx(
        'font-display text-xl font-semibold tracking-tight',
        light ? 'text-white' : 'text-primary-900'
      )}
    >
      SharedReads
    </span>
  </Link>
)
