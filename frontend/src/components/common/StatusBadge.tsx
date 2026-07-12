import clsx from 'clsx'

const STYLES: Record<string, string> = {
  // requests
  PENDING: 'bg-accent-100 text-accent-800',
  APPROVED: 'bg-primary-100 text-primary-800',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-stone-100 text-stone-600',
  EXPIRED: 'bg-stone-100 text-stone-600',
  // transactions
  INITIATED: 'bg-accent-100 text-accent-800',
  DEPOSIT_PAID: 'bg-primary-100 text-primary-800',
  BOOK_RECEIVED: 'bg-primary-100 text-primary-800',
  BOOK_RETURNED: 'bg-accent-100 text-accent-800',
  PAYMENT_PENDING: 'bg-accent-100 text-accent-800',
  ACTIVE: 'bg-primary-100 text-primary-800',
  HANDED_OVER: 'bg-primary-100 text-primary-800',
  RETURN_PENDING: 'bg-accent-100 text-accent-800',
  RETURNED: 'bg-primary-100 text-primary-800',
  COMPLETED: 'bg-primary-800 text-white',
  DISPUTED: 'bg-red-100 text-red-700',
  // payments
  PAID: 'bg-primary-100 text-primary-800',
  FAILED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-stone-100 text-stone-600',
}

export const StatusBadge = ({ status }: { status: string }) => (
  <span className={clsx('badge', STYLES[status] || 'bg-stone-100 text-stone-600')}>
    {status.replaceAll('_', ' ')}
  </span>
)
