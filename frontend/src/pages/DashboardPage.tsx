import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import {
  BookOpen,
  BookPlus,
  Search,
  Send,
  Inbox,
  Star,
  BadgeCheck,
  ArrowRight,
  UserRound,
  Pencil,
  Check,
  X,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { PageShell } from '../components/layout/PageShell'

const actions = [
  {
    to: '/list-book',
    icon: BookPlus,
    title: 'List a book',
    body: 'Put a finished book back into circulation.',
    featured: true,
  },
  {
    to: '/search',
    icon: Search,
    title: 'Browse nearby',
    body: 'See what readers around you are sharing.',
  },
  {
    to: '/my-listings',
    icon: BookOpen,
    title: 'My shelf',
    body: 'Manage the books you have listed.',
  },
  {
    to: '/my-requests',
    icon: Send,
    title: 'My requests',
    body: 'Track books you asked to borrow.',
  },
  {
    to: '/incoming-requests',
    icon: Inbox,
    title: 'Incoming requests',
    body: 'Respond to borrowers of your books.',
  },
]

export const DashboardPage = () => {
  const { user, isLoading, updateProfile } = useAuth()
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [savingName, setSavingName] = useState(false)

  const startNameEdit = () => {
    setNameDraft(user?.name || '')
    setEditingName(true)
  }

  const saveName = async () => {
    if (!nameDraft.trim() || savingName) return
    setSavingName(true)
    try {
      await updateProfile({ name: nameDraft.trim() })
      setEditingName(false)
    } catch {
      // keep the editor open so the user can retry
    } finally {
      setSavingName(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-stone-500">Loading…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <PageShell>
      {/* Greeting */}
      <div className="mb-10">
        <h1 className="font-display text-4xl font-semibold text-primary-950">
          Welcome back{user.name ? `, ${user.name.split(' ')[0]}` : ''}.
        </h1>
        <p className="mt-2 text-stone-500">
          What would you like to do with your shelf today?
        </p>
      </div>

      {/* Account strip */}
      <div className="mb-10 card !p-5 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
        <div className="flex items-center gap-2">
          <UserRound className="h-4.5 w-4.5 h-[18px] w-[18px] text-primary-600" />
          {editingName ? (
            <span className="flex items-center gap-1.5">
              <input
                className="input !min-h-0 !py-1.5 !w-44"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveName()
                  if (e.key === 'Escape') setEditingName(false)
                }}
                placeholder="Your name"
                maxLength={100}
                autoFocus
              />
              <button
                onClick={saveName}
                disabled={savingName || !nameDraft.trim()}
                className="p-1.5 rounded-lg text-primary-700 hover:bg-primary-50 disabled:opacity-40"
                aria-label="Save name"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() => setEditingName(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100"
                aria-label="Cancel"
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <span className={user.name ? 'font-medium text-ink' : 'italic text-stone-400'}>
                {user.name || 'Add your name'}
              </span>
              <button
                onClick={startNameEdit}
                className="p-1 rounded-lg text-stone-400 hover:text-primary-700 hover:bg-primary-50 transition-colors"
                aria-label="Edit name"
                title="Edit name"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <BadgeCheck className="h-4.5 w-4.5 h-[18px] w-[18px] text-primary-600" />
          <span className="text-stone-600">{user.email}</span>
          {user.emailVerified && (
            <span className="badge bg-primary-100 text-primary-800">Verified</span>
          )}
        </div>
        {user.phone && (
          <div className="flex items-center gap-2 text-stone-600">
            <span>{user.phone}</span>
            {user.phoneVerified && (
              <span className="badge bg-primary-100 text-primary-800">Verified</span>
            )}
          </div>
        )}
        <div className="flex items-center gap-1.5 text-stone-600">
          <Star className="h-4 w-4 text-accent-500 fill-accent-400" />
          <span className="font-semibold text-ink">{user.reputationScore.toFixed(1)}</span>
          <span className="text-stone-400">/ 5.0 reputation</span>
        </div>
        <span className="badge bg-primary-100 text-primary-800 ml-auto">
          {user.accountStatus}
        </span>
      </div>

      {/* Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {actions.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className={
              a.featured
                ? 'group card !p-7 bg-primary-900 !border-primary-800 hover:bg-primary-800 transition-colors'
                : 'group card !p-7 hover:shadow-lift hover:-translate-y-0.5 transition-all'
            }
          >
            <div
              className={
                a.featured
                  ? 'h-11 w-11 rounded-xl bg-white/10 text-accent-400 flex items-center justify-center'
                  : 'h-11 w-11 rounded-xl bg-primary-100 text-primary-800 flex items-center justify-center'
              }
            >
              <a.icon className="h-5 w-5" />
            </div>
            <h3
              className={
                a.featured
                  ? 'mt-5 text-lg font-semibold text-white flex items-center gap-2'
                  : 'mt-5 text-lg font-semibold text-ink flex items-center gap-2'
              }
            >
              {a.title}
              <ArrowRight
                className={
                  a.featured
                    ? 'h-4 w-4 text-accent-400 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all'
                    : 'h-4 w-4 text-primary-600 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all'
                }
              />
            </h3>
            <p
              className={
                a.featured ? 'mt-1.5 text-sm text-primary-200' : 'mt-1.5 text-sm text-stone-500'
              }
            >
              {a.body}
            </p>
          </Link>
        ))}
      </div>
    </PageShell>
  )
}
