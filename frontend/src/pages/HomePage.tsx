import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  BookOpen,
  MapPin,
  Repeat,
  ShieldCheck,
  Search,
  HandHeart,
  Sparkles,
  ArrowRight,
  Users,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import { statsApi } from '../api/stats'
import { formatMoney } from '../lib/format'

const daysAgo = (iso: string): string => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (days <= 0) return 'Added today'
  if (days === 1) return 'Added yesterday'
  return `Added ${days} days ago`
}

const spines = [
  { title: 'The Night Library', h: 'h-40', c: 'bg-primary-800', t: 'text-primary-100' },
  { title: 'Paper Towns & Rivers', h: 'h-48', c: 'bg-accent-500', t: 'text-primary-950' },
  { title: 'A Reader’s Atlas', h: 'h-36', c: 'bg-stone-700', t: 'text-stone-100' },
  { title: 'Borrowed Time', h: 'h-52', c: 'bg-primary-600', t: 'text-primary-50' },
  { title: 'The Swap', h: 'h-44', c: 'bg-red-800/80', t: 'text-red-50' },
]

const steps = [
  {
    icon: BookOpen,
    title: 'Shelve your books',
    body: 'Snap two photos, set free or paid lending, and your books join your neighborhood’s shared shelf.',
  },
  {
    icon: Search,
    title: 'Discover books near you',
    body: 'Search by title or author and see exactly how far each copy is — sorted by distance, not algorithms.',
  },
  {
    icon: HandHeart,
    title: 'Meet, borrow, return',
    body: 'Request, agree on a handoff, and read. Deposits, photo evidence and reviews keep everyone honest.',
  },
]

const features = [
  {
    icon: MapPin,
    title: 'Hyper-local by design',
    body: 'Every search is distance-aware. Find the copy that’s a ten-minute walk away, not a warehouse away.',
  },
  {
    icon: ShieldCheck,
    title: 'Trust built in',
    body: 'Verified emails, reputation scores, condition photos at handoff and return, and fair dispute resolution.',
  },
  {
    icon: Repeat,
    title: 'Lend free or paid',
    body: 'Share for the love of it, or set a rental price with a refundable deposit. Your books, your rules.',
  },
  {
    icon: Sparkles,
    title: 'More than borrowing',
    body: 'Book swaps, reading clubs and city-to-city shipping are on the roadmap — built with the community.',
  },
]

export const HomePage = () => {
  const { user } = useAuth()
  const primaryCta = user ? '/dashboard' : '/register'
  const primaryLabel = user ? 'Go to your dashboard' : 'Start sharing — it’s free'

  const { data: stats } = useQuery({
    queryKey: ['publicStats'],
    queryFn: statsApi.getPublicStats,
    staleTime: 60_000,
  })

  // Social proof only helps once there is something to prove — both
  // sections stay hidden while the platform is empty.
  const showProof = (stats?.totalBooks ?? 0) > 0
  const liveStats = showProof
    ? [
        {
          icon: BookOpen,
          value: stats!.totalBooks,
          label: stats!.totalBooks === 1 ? 'book available' : 'books available',
        },
        {
          icon: Users,
          value: stats!.totalReaders,
          label: stats!.totalReaders === 1 ? 'reader' : 'readers',
        },
        ...(stats!.exchangedThisMonth > 0
          ? [
              {
                icon: Repeat,
                value: stats!.exchangedThisMonth,
                label: stats!.exchangedThisMonth === 1 ? 'loan this month' : 'loans this month',
              },
            ]
          : []),
      ]
    : []

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.55]"
          style={{
            background:
              'radial-gradient(60rem 30rem at 85% -10%, #e0ede5 0%, transparent 60%), radial-gradient(40rem 24rem at -10% 30%, #fef3c7 0%, transparent 55%)',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="inline-flex items-center gap-2 badge bg-primary-100 text-primary-800 mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />
              Community-powered book sharing
            </p>
            <h1 className="font-display text-5xl lg:text-6xl font-semibold text-primary-950 leading-[1.05]">
              Your neighborhood library, powered by neighbors.
            </h1>
            <p className="mt-6 text-lg text-stone-600 leading-relaxed max-w-xl">
              Most books are read once, then sit on a shelf for years. SharedReads
              connects you with readers nearby so every book gets a second life —
              borrow what you want to read, lend what you’ve finished.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to={primaryCta} className="btn btn-primary text-base !px-7 !py-3.5">
                {primaryLabel} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/search" className="btn btn-secondary text-base !px-7 !py-3.5">
                Browse books nearby
              </Link>
            </div>
            <p className="mt-6 text-sm text-stone-500">
              Free to join · No subscriptions · Readers worldwide
            </p>
          </div>

          {/* Book spine composition */}
          <div className="hidden lg:flex items-end justify-center gap-2 select-none" aria-hidden>
            <div className="flex items-end gap-2 rotate-[-2deg]">
              {spines.map((s) => (
                <div
                  key={s.title}
                  className={`${s.h} ${s.c} w-14 rounded-t-md rounded-b-sm shadow-lift flex items-end justify-center pb-4 transition-transform hover:-translate-y-2 duration-300`}
                >
                  <span
                    className={`${s.t} font-display text-[11px] tracking-wide`}
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                  >
                    {s.title}
                  </span>
                </div>
              ))}
            </div>
            <div className="ml-6 mb-2 card !p-4 w-52 rotate-2 shadow-lift">
              <p className="text-xs font-semibold text-primary-800 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> 0.4 km away
              </p>
              <p className="mt-1 text-sm font-semibold text-ink">"The Night Library"</p>
              <p className="text-xs text-stone-500">Lent 12 times · ★ 4.9 lender</p>
              <span className="mt-2 inline-block badge bg-primary-100 text-primary-800">
                Free to borrow
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Live platform proof */}
      {showProof && (
        <section className="border-y border-stone-200/70 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {liveStats.map((s) => (
                <div key={s.label} className="flex items-center gap-4">
                  <span className="h-12 w-12 shrink-0 rounded-xl bg-primary-100 text-primary-800 flex items-center justify-center">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-display text-3xl font-semibold text-primary-950 leading-none">
                      {s.value.toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm text-stone-500">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recently added shelf */}
            {stats!.recentBooks.length > 0 && (
              <div className="mt-12">
                <div className="flex items-end justify-between mb-5">
                  <h2 className="font-display text-2xl font-semibold text-primary-950">
                    Recently added
                  </h2>
                  <Link
                    to="/search"
                    className="text-sm font-medium text-primary-700 hover:text-primary-900 inline-flex items-center gap-1"
                  >
                    Browse all <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="grid grid-flow-col auto-cols-[minmax(160px,1fr)] sm:auto-cols-[minmax(180px,1fr)] gap-4 overflow-x-auto pb-2 -mx-1 px-1">
                  {stats!.recentBooks.map((book) => (
                    <Link
                      key={book.id}
                      to={`/books/${book.id}`}
                      className="card !p-0 overflow-hidden group hover:shadow-lift hover:-translate-y-0.5 transition-all"
                    >
                      <div className="relative">
                        <img
                          src={book.images[0]}
                          alt={book.title}
                          loading="lazy"
                          className="w-full aspect-[3/4] object-cover"
                        />
                        {book.rentalType === 'FREE' ? (
                          <span className="absolute top-2.5 left-2.5 badge bg-primary-800 text-white">
                            Free
                          </span>
                        ) : (
                          book.rentalPrice != null && (
                            <span className="absolute top-2.5 left-2.5 badge bg-accent-400 text-primary-950">
                              {formatMoney(book.rentalPrice)}
                            </span>
                          )
                        )}
                      </div>
                      <div className="p-3.5">
                        <p className="font-semibold text-sm text-ink line-clamp-1 group-hover:text-primary-800 transition-colors">
                          {book.title}
                        </p>
                        <p className="text-xs text-stone-500 line-clamp-1">by {book.author}</p>
                        <p className="mt-1.5 text-[11px] text-stone-400">
                          {daysAgo(book.createdAt)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="bg-white border-y border-stone-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl lg:text-4xl font-semibold text-primary-950">
              How SharedReads works
            </h2>
            <p className="mt-3 text-stone-600">
              Three steps between a book gathering dust and a book being read.
            </p>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div key={step.title} className="card !p-7 relative">
                <span className="absolute top-6 right-7 font-display text-5xl font-semibold text-stone-100 select-none">
                  {i + 1}
                </span>
                <div className="h-11 w-11 rounded-xl bg-primary-100 text-primary-800 flex items-center justify-center">
                  <step.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm text-stone-600 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl lg:text-4xl font-semibold text-primary-950">
              Built for readers who share
            </h2>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 gap-6">
            {features.map((f) => (
              <div key={f.title} className="flex gap-5 card !p-7">
                <div className="shrink-0 h-11 w-11 rounded-xl bg-accent-100 text-accent-700 flex items-center justify-center">
                  <f.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-ink">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-stone-600 leading-relaxed">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-primary-900 px-8 py-14 lg:px-16 text-center">
            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                background:
                  'radial-gradient(30rem 16rem at 20% 0%, #468262 0%, transparent 60%), radial-gradient(24rem 14rem at 90% 100%, #f59e0b33 0%, transparent 60%)',
              }}
            />
            <h2 className="relative font-display text-3xl lg:text-4xl font-semibold text-white">
              The best library is the one your neighbors already own.
            </h2>
            <p className="relative mt-4 text-primary-200 max-w-xl mx-auto">
              Join SharedReads, list the books on your shelf, and turn your street
              into a library.
            </p>
            <div className="relative mt-8">
              <Link to={primaryCta} className="btn btn-accent text-base !px-8 !py-3.5">
                {user ? 'Open your dashboard' : 'Create your free account'}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
