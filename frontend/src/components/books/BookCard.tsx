
import { BookListing } from '../../types/book'
import { Button } from '../common/Button'
import { formatMoney } from '../../lib/format'

interface BookCardProps {
  book: BookListing
  onToggleAvailability?: () => void
  onDelete?: () => void
  showActions?: boolean
}

export const BookCard = ({
  book,
  onToggleAvailability,
  onDelete,
  showActions = false,
}: BookCardProps) => {
  return (
    <div className="card !p-0 overflow-hidden hover:shadow-lift transition-shadow">
      {/* Image */}
      <div className="relative">
        <img
          src={book.images[0]}
          alt={book.title}
          className="w-full h-48 object-cover"
        />
        {!book.available && (
          <span className="absolute top-3 right-3 badge bg-stone-800/90 text-white">
            Unavailable
          </span>
        )}
        {book.available && book.rentalType === 'FREE' && (
          <span className="absolute top-3 right-3 badge bg-primary-800 text-white">
            Free
          </span>
        )}
        {book.available && book.rentalType === 'PAID' && book.rentalPrice && (
          <span className="absolute top-3 right-3 badge bg-accent-400 text-primary-950">
            {formatMoney(book.rentalPrice)} / loan
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-2">
        <h3 className="font-semibold text-ink line-clamp-1">{book.title}</h3>
        <p className="text-sm text-stone-500">by {book.author}</p>

        {book.description && (
          <p className="text-sm text-stone-600 line-clamp-2">{book.description}</p>
        )}

        <div className="flex items-center justify-between text-sm pt-1">
          <span className="capitalize text-stone-500">
            {book.condition.replace('_', ' ').toLowerCase()}
          </span>
          <span className="text-stone-500">{book.rentalDuration} days</span>
        </div>

        {book.rentalType === 'PAID' && book.depositAmount && (
          <p className="text-xs text-stone-400">
            Refundable deposit: {formatMoney(book.depositAmount)}
          </p>
        )}

        {showActions && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-stone-100">
            {onToggleAvailability && (
              <Button
                variant="secondary"
                onClick={onToggleAvailability}
                className="flex-1"
              >
                {book.available ? 'Mark unavailable' : 'Mark available'}
              </Button>
            )}
            {onDelete && (
              <Button variant="danger" onClick={onDelete} className="flex-1">
                Delete
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
