import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, BookOpen, Search, Inbox, Send, LogOut, LayoutDashboard } from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../../hooks/useAuth'
import { Logo } from './Logo'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  clsx(
    'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
    isActive
      ? 'bg-primary-50 text-primary-800'
      : 'text-stone-600 hover:text-primary-800 hover:bg-stone-100'
  )

export const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const appNav = (
    <>
      <NavLink to="/search" className={navLinkClass}>
        <Search className="h-4 w-4" /> Browse
      </NavLink>
      <NavLink to="/my-listings" className={navLinkClass}>
        <BookOpen className="h-4 w-4" /> My Shelf
      </NavLink>
      <NavLink to="/my-requests" className={navLinkClass}>
        <Send className="h-4 w-4" /> Requests
      </NavLink>
      <NavLink to="/incoming-requests" className={navLinkClass}>
        <Inbox className="h-4 w-4" /> Incoming
      </NavLink>
    </>
  )

  return (
    <header className="sticky top-0 z-40 bg-paper/85 backdrop-blur border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo />

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {user ? (
              <>
                {appNav}
                <span className="mx-2 h-6 w-px bg-stone-200" aria-hidden />
                <NavLink to="/dashboard" className={navLinkClass}>
                  <LayoutDashboard className="h-4 w-4" />
                  {user.name?.split(' ')[0] || 'Dashboard'}
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-stone-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Log out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/search" className={navLinkClass}>
                  Browse books
                </NavLink>
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-stone-600 hover:text-primary-800 hover:bg-stone-100 transition-colors"
                >
                  Log in
                </Link>
                <Link to="/register" className="btn btn-primary ml-2 !min-h-0 !py-2">
                  Join free
                </Link>
              </>
            )}
          </nav>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-stone-200 bg-paper px-4 py-3 flex flex-col gap-1">
          {user ? (
            <>
              {appNav}
              <NavLink to="/dashboard" className={navLinkClass}>
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </NavLink>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-stone-500 hover:text-red-700 hover:bg-red-50 text-left"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/search" className={navLinkClass}>
                Browse books
              </NavLink>
              <NavLink to="/login" className={navLinkClass}>
                Log in
              </NavLink>
              <Link to="/register" className="btn btn-primary mt-1">
                Join free
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  )
}
