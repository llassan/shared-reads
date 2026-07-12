import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, MapPin, Star, BookX, Compass } from 'lucide-react'
import { searchApi } from '../api/search'
import { Button } from '../components/common/Button'
import { PageShell } from '../components/layout/PageShell'
import { formatMoney } from '../lib/format'
import type { BookCondition, RentalType } from '../types/book'

const conditionLabel = (c: string) => c.replace('_', ' ').toLowerCase()

export const SearchPage = () => {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [radius, setRadius] = useState(5)
  const [rentalType, setRentalType] = useState<RentalType | ''>('')
  const [condition, setCondition] = useState<BookCondition | ''>('')
  const [minPrice, setMinPrice] = useState<number | ''>('')
  const [maxPrice, setMaxPrice] = useState<number | ''>('')
  const [hasSearched, setHasSearched] = useState(false)

  // Get user's location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error('Error getting location:', error)
          setLocation({ lat: 0, lng: 0 })
        }
      )
    } else {
      setLocation({ lat: 0, lng: 0 })
    }
  }, [])

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['searchBooks', query, location, radius, rentalType, condition, minPrice, maxPrice],
    queryFn: () =>
      searchApi.searchBooks({
        query: query || undefined,
        latitude: location!.lat,
        longitude: location!.lng,
        radius,
        rentalType: rentalType || undefined,
        condition: condition || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
      }),
    enabled: hasSearched && !!location,
  })

  const handleSearch = () => {
    if (!location) {
      alert('Please enable location access to search for books')
      return
    }
    setHasSearched(true)
    refetch()
  }

  return (
    <PageShell>
      {/* Heading */}
      <div className="mb-8 max-w-2xl">
        <h1 className="font-display text-4xl font-semibold text-primary-950">
          Books near you
        </h1>
        <p className="mt-2 text-stone-500">
          Every result is a real copy on a real shelf, sorted by distance.
        </p>
      </div>

      {/* Search bar */}
      <div className="card !p-4 sm:!p-5 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 h-[18px] w-[18px] text-stone-400" />
            <input
              className="input !pl-10"
              placeholder="Search by title or author…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} isLoading={isLoading} className="sm:w-auto">
            <Search className="h-4 w-4" /> Search
          </Button>
        </div>

        {/* Filters */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="label">Within</label>
            <select
              className="input"
              value={radius}
              onChange={(e) => setRadius(parseFloat(e.target.value))}
            >
              <option value="1">1 km</option>
              <option value="2">2 km</option>
              <option value="5">5 km</option>
              <option value="10">10 km</option>
              <option value="20">20 km</option>
            </select>
          </div>
          <div>
            <label className="label">Type</label>
            <select
              className="input"
              value={rentalType}
              onChange={(e) => setRentalType(e.target.value as RentalType | '')}
            >
              <option value="">All</option>
              <option value="FREE">Free</option>
              <option value="PAID">Paid</option>
            </select>
          </div>
          <div>
            <label className="label">Condition</label>
            <select
              className="input"
              value={condition}
              onChange={(e) => setCondition(e.target.value as BookCondition | '')}
            >
              <option value="">Any</option>
              <option value="NEW">New</option>
              <option value="LIKE_NEW">Like new</option>
              <option value="GOOD">Good</option>
              <option value="ACCEPTABLE">Acceptable</option>
            </select>
          </div>
          <div>
            <label className="label">Min price</label>
            <input
              className="input"
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value ? parseFloat(e.target.value) : '')}
            />
          </div>
          <div>
            <label className="label">Max price</label>
            <input
              className="input"
              type="number"
              placeholder="Any"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value ? parseFloat(e.target.value) : '')}
            />
          </div>
        </div>

        {!location && (
          <div className="mt-4 bg-accent-50 border border-accent-200 text-stone-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <Compass className="h-4 w-4 text-accent-600" />
            Enable location access to find books near you.
          </div>
        )}
      </div>

      {/* Results */}
      {hasSearched && (
        <>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-48 bg-stone-100 rounded-xl mb-4" />
                  <div className="h-4 bg-stone-100 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-stone-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : data && data.books.length > 0 ? (
            <>
              <p className="mb-5 text-sm text-stone-500">
                {data.total} {data.total === 1 ? 'book' : 'books'} within {radius} km
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.books.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => navigate(`/books/${book.id}`)}
                    className="card !p-0 overflow-hidden text-left group hover:shadow-lift hover:-translate-y-0.5 transition-all"
                  >
                    <div className="relative">
                      <img
                        src={book.images[0]}
                        alt={book.title}
                        className="w-full h-48 object-cover"
                      />
                      <span className="absolute top-3 left-3 badge bg-white/95 text-ink shadow-sm">
                        <MapPin className="h-3 w-3 text-primary-600" />
                        {book.distance} km
                      </span>
                      {book.rentalType === 'FREE' ? (
                        <span className="absolute top-3 right-3 badge bg-primary-800 text-white">
                          Free
                        </span>
                      ) : (
                        <span className="absolute top-3 right-3 badge bg-accent-400 text-primary-950">
                          {formatMoney(book.rentalPrice!)} / loan
                        </span>
                      )}
                    </div>

                    <div className="p-5">
                      <h3 className="font-semibold text-ink line-clamp-1 group-hover:text-primary-800 transition-colors">
                        {book.title}
                      </h3>
                      <p className="mt-0.5 text-sm text-stone-500">by {book.author}</p>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="capitalize text-stone-500">
                          {conditionLabel(book.condition)}
                        </span>
                        <span className="flex items-center gap-1 text-stone-600">
                          <Star className="h-3.5 w-3.5 text-accent-500 fill-accent-400" />
                          {book.lender.reputationScore.toFixed(1)}
                          <span className="text-stone-400">
                            · {book.lender.name || 'Lender'}
                          </span>
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20 card">
              <BookX className="h-12 w-12 text-stone-300 mx-auto mb-4" />
              <h2 className="font-display text-2xl font-semibold text-ink mb-2">
                No books found nearby
              </h2>
              <p className="text-stone-500 max-w-sm mx-auto">
                Try widening the radius or loosening the filters — or be the first
                to list this book in your area.
              </p>
            </div>
          )}
        </>
      )}

      {!hasSearched && (
        <div className="text-center py-20 card">
          <Compass className="h-12 w-12 text-stone-300 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-semibold text-ink mb-2">
            Discover your neighborhood's shelf
          </h2>
          <p className="text-stone-500 max-w-sm mx-auto">
            Search by title or author, and we'll show you every copy shared
            within walking distance.
          </p>
        </div>
      )}
    </PageShell>
  )
}
