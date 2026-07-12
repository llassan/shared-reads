import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, MapPin, ShieldCheck } from 'lucide-react'
import { Logo } from './Logo'

interface AuthLayoutProps {
  title: string
  subtitle?: ReactNode
  children: ReactNode
}

const points = [
  { icon: BookOpen, text: 'List the books on your shelf in under a minute' },
  { icon: MapPin, text: 'Find copies within walking distance' },
  { icon: ShieldCheck, text: 'Verified members, deposits and honest reviews' },
]

export const AuthLayout = ({ title, subtitle, children }: AuthLayoutProps) => (
  <div className="min-h-screen grid lg:grid-cols-[5fr_7fr] bg-paper">
    {/* Brand panel */}
    <aside className="hidden lg:flex flex-col justify-between bg-primary-950 p-12 relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(36rem 22rem at 0% 0%, #29533f 0%, transparent 60%), radial-gradient(28rem 18rem at 100% 100%, #f59e0b22 0%, transparent 60%)',
        }}
      />
      <div className="relative">
        <Logo light />
      </div>
      <div className="relative max-w-md">
        <h2 className="font-display text-3xl font-semibold text-white leading-snug">
          Every book deserves a second reader.
        </h2>
        <ul className="mt-8 space-y-4">
          {points.map((p) => (
            <li key={p.text} className="flex items-center gap-3 text-primary-100">
              <span className="h-9 w-9 shrink-0 rounded-lg bg-white/10 flex items-center justify-center">
                <p.icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
              </span>
              <span className="text-sm">{p.text}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="relative text-xs text-primary-300">
        Free to join · Community-powered · Readers worldwide
      </p>
    </aside>

    {/* Form panel */}
    <main className="flex items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-md">
        <div className="lg:hidden mb-8 flex justify-center">
          <Logo />
        </div>
        <h1 className="font-display text-3xl font-semibold text-primary-950">{title}</h1>
        {subtitle && <p className="mt-2 text-stone-500 text-sm">{subtitle}</p>}
        <div className="mt-8">{children}</div>
        <p className="mt-10 text-center text-xs text-stone-400">
          <Link to="/" className="hover:text-primary-800">← Back to sharedreads.com</Link>
        </p>
      </div>
    </main>
  </div>
)
