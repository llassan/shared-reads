import { BookListing } from '../../types/book'
import { Button } from '../common/Button'

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
    <div className="card hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative">
        <img
          src={book.images[0]}
          alt={book.title}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
        {!book.available && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Unavailable
          </div>
        )}
        {book.rentalType === 'FREE' && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            FREE
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
          {book.title}
        </h3>
        <p className="text-sm text-gray-600">by {book.author}</p>

        {book.description && (
          <p className="text-sm text-gray-700 line-clamp-2">{book.description}</p>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Condition: {book.condition.replace('_', ' ')}</span>
          {book.rentalType === 'PAID' && book.rentalPrice && (
            <span className="font-semibold text-primary-600">₹{book.rentalPrice}/rent</span>
          )}
        </div>

        {book.rentalType === 'PAID' && book.depositAmount && (
          <p className="text-sm text-gray-600">Deposit: ₹{book.depositAmount}</p>
        )}

        <p className="text-sm text-gray-600">
          Duration: {book.rentalDuration} days
        </p>

        {showActions && (
          <div className="flex gap-2 mt-4 pt-4 border-t">
            {onToggleAvailability && (
              <Button
                variant="secondary"
                onClick={onToggleAvailability}
                className="flex-1"
              >
                {book.available ? 'Mark Unavailable' : 'Mark Available'}
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
