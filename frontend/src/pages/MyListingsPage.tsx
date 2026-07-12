import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BookPlus, LibraryBig } from 'lucide-react'
import { booksApi } from '../api/books'
import { Button } from '../components/common/Button'
import { BookCard } from '../components/books/BookCard'
import { PageShell } from '../components/layout/PageShell'
import { PageTitle } from '../components/common/PageTitle'
import { EmptyState } from '../components/common/EmptyState'

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

  return (
    <PageShell>
      <PageTitle
        title="My shelf"
        subtitle="The books you're sharing with your neighborhood."
        actions={
          <Button onClick={() => navigate('/list-book')}>
            <BookPlus className="h-4 w-4" /> List a book
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-48 bg-stone-100 rounded-xl mb-4" />
              <div className="h-4 bg-stone-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-stone-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : !listings || listings.length === 0 ? (
        <EmptyState
          icon={LibraryBig}
          title="Your shelf is empty"
          body="List the books you've finished reading and put them back into circulation."
          action={
            <Button onClick={() => navigate('/list-book')}>
              <BookPlus className="h-4 w-4" /> List your first book
            </Button>
          }
        />
      ) : (
        <>
          <p className="mb-5 text-sm text-stone-500">
            {listings.length} {listings.length === 1 ? 'book' : 'books'} on your shelf
          </p>

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
    </PageShell>
  )
}
