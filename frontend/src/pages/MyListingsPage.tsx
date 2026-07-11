import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { booksApi } from '../api/books'
import { Button } from '../components/common/Button'
import { BookCard } from '../components/books/BookCard'

export const MyListingsPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: listings, isLoading } = useQuery({
    queryKey: ['myListings'],
    queryFn: booksApi.getMyListings,
  })

  const toggleMutation = useMutation({
    mutationFn: (id: string) => booksApi.toggleAvailability(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myListings'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => booksApi.deleteListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myListings'] })
    },
  })

  const handleToggleAvailability = async (id: string) => {
    if (confirm('Toggle availability for this book?')) {
      await toggleMutation.mutateAsync(id)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this listing? This cannot be undone.')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your listings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary-900">My Listings</h1>
            <div className="flex gap-2">
              <Button onClick={() => navigate('/list-book')}>
                + List a Book
              </Button>
              <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!listings || listings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No listings yet
            </h2>
            <p className="text-gray-600 mb-6">
              Start sharing books with your community!
            </p>
            <Button onClick={() => navigate('/list-book')}>
              List Your First Book
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                {listings.length} {listings.length === 1 ? 'listing' : 'listings'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  showActions
                  onToggleAvailability={() => handleToggleAvailability(book.id)}
                  onDelete={() => handleDelete(book.id)}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
