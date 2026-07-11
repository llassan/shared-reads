import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { searchApi } from '../api/search'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { Card } from '../components/common/Card'
import type { BookCondition, RentalType } from '../types/book'

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
          // Default to some coordinates if geolocation fails
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary-900">Search Books</h1>
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Filters */}
        <Card className="mb-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Search Filters</h2>

            {/* Search Query */}
            <Input
              label="Search by Title or Author"
              placeholder="e.g., Clean Code, Robert Martin"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />

            {/* Filters Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Radius (km)</label>
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
                <label className="label">Rental Type</label>
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
                  <option value="">All</option>
                  <option value="NEW">New</option>
                  <option value="LIKE_NEW">Like New</option>
                  <option value="GOOD">Good</option>
                  <option value="ACCEPTABLE">Acceptable</option>
                </select>
              </div>
            </div>

            {/* Price Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Min Price (₹)"
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value ? parseFloat(e.target.value) : '')}
              />
              <Input
                label="Max Price (₹)"
                type="number"
                placeholder="1000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value ? parseFloat(e.target.value) : '')}
              />
            </div>

            {!location && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm">
                Please enable location access to search for books nearby
              </div>
            )}

            <Button onClick={handleSearch} isLoading={isLoading} className="w-full">
              🔍 Search Books
            </Button>
          </div>
        </Card>

        {/* Results */}
        {hasSearched && (
          <>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Searching...</p>
              </div>
            ) : data && data.books.length > 0 ? (
              <>
                <div className="mb-4">
                  <p className="text-gray-600">
                    Found {data.total} {data.total === 1 ? 'book' : 'books'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.books.map((book) => (
                    <Card
                      key={book.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => navigate(`/books/${book.id}`)}
                    >
                      <img
                        src={book.images[0]}
                        alt={book.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />

                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                          {book.title}
                        </h3>
                        <p className="text-sm text-gray-600">by {book.author}</p>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {book.distance} km away
                          </span>
                          {book.rentalType === 'FREE' ? (
                            <span className="font-semibold text-green-600">FREE</span>
                          ) : (
                            <span className="font-semibold text-primary-600">
                              ₹{book.rentalPrice}/rent
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-600">
                          Condition: {book.condition.replace('_', ' ')}
                        </p>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>⭐ {book.lender.reputationScore.toFixed(1)}</span>
                          <span>•</span>
                          <span>{book.lender.name || 'Lender'}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  No books found
                </h2>
                <p className="text-gray-600">
                  Try adjusting your search filters or increase the radius
                </p>
              </div>
            )}
          </>
        )}

        {!hasSearched && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Start Searching
            </h2>
            <p className="text-gray-600">
              Enter search criteria and click "Search Books" to find books nearby
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
