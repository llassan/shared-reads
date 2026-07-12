import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { BookOpen, HandHeart, Banknote } from 'lucide-react'
import clsx from 'clsx'
import { booksApi } from '../api/books'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { FileUpload } from '../components/common/FileUpload'
import { LocationPicker } from '../components/common/LocationPicker'
import { PageShell } from '../components/layout/PageShell'
import { PageTitle } from '../components/common/PageTitle'
import { CURRENCY_SYMBOL } from '../lib/format'

const listBookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  author: z.string().min(1, 'Author is required').max(200),
  description: z.string().max(1000).optional(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'ACCEPTABLE']),
  rentalType: z.enum(['FREE', 'PAID']),
  rentalPrice: z.number().min(0).optional(),
  depositAmount: z.number().min(0).optional(),
  rentalDuration: z.number().int().min(1).max(90),
})

type ListBookFormData = z.infer<typeof listBookSchema>

export const ListBookPage = () => {
  const navigate = useNavigate()
  const [images, setImages] = useState<File[]>([])
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ListBookFormData>({
    resolver: zodResolver(listBookSchema),
    defaultValues: {
      rentalType: 'FREE',
      condition: 'GOOD',
      rentalDuration: 14,
    },
  })

  const rentalType = watch('rentalType')

  const createMutation = useMutation({
    mutationFn: booksApi.createListing,
    onSuccess: () => {
      navigate('/my-listings')
    },
  })

  const onSubmit = async (data: ListBookFormData) => {
    try {
      setError(null)

      if (images.length < 2) {
        setError('Please upload at least 2 images')
        return
      }

      if (images.length > 5) {
        setError('Maximum 5 images allowed')
        return
      }

      if (!location) {
        setError('Please set your location')
        return
      }

      if (data.rentalType === 'PAID') {
        if (!data.rentalPrice || data.rentalPrice <= 0) {
          setError('Rental price is required for paid rentals')
          return
        }
        if (!data.depositAmount || data.depositAmount <= 0) {
          setError('Deposit amount is required for paid rentals')
          return
        }
      }

      await createMutation.mutateAsync({
        ...data,
        images,
        location,
      })
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create listing')
    }
  }

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto">
        <PageTitle
          title="List a book"
          subtitle="Put a finished book back into circulation — it takes about a minute."
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Book Information */}
          <div className="card !p-7 space-y-4">
            <div className="flex items-center gap-3 mb-1">
              <span className="h-9 w-9 rounded-lg bg-primary-100 text-primary-800 flex items-center justify-center">
                <BookOpen className="h-4.5 w-4.5 h-[18px] w-[18px]" />
              </span>
              <h2 className="font-display text-xl font-semibold text-ink">The book</h2>
            </div>

            <Input
              label="Title"
              placeholder="e.g., The Remains of the Day"
              error={errors.title?.message}
              {...register('title')}
            />

            <Input
              label="Author"
              placeholder="e.g., Kazuo Ishiguro"
              error={errors.author?.message}
              {...register('author')}
            />

            <div>
              <label className="label">Description (optional)</label>
              <textarea
                className="input min-h-[100px]"
                placeholder="Anything the next reader should know?"
                {...register('description')}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="label">Condition</label>
              <select className="input" {...register('condition')}>
                <option value="NEW">New</option>
                <option value="LIKE_NEW">Like new</option>
                <option value="GOOD">Good</option>
                <option value="ACCEPTABLE">Acceptable</option>
              </select>
              {errors.condition && (
                <p className="mt-1 text-sm text-red-600">{errors.condition.message}</p>
              )}
            </div>
          </div>

          {/* Lending Terms */}
          <div className="card !p-7 space-y-4">
            <div className="flex items-center gap-3 mb-1">
              <span className="h-9 w-9 rounded-lg bg-accent-100 text-accent-700 flex items-center justify-center">
                <HandHeart className="h-4.5 w-4.5 h-[18px] w-[18px]" />
              </span>
              <h2 className="font-display text-xl font-semibold text-ink">Lending terms</h2>
            </div>

            <div>
              <label className="label">How do you want to lend it?</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={clsx(
                    'flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors',
                    rentalType === 'FREE'
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-stone-300 hover:border-stone-400'
                  )}
                >
                  <input
                    type="radio"
                    value="FREE"
                    {...register('rentalType')}
                    className="mt-1 w-4 h-4 accent-primary-700"
                  />
                  <span>
                    <span className="block font-semibold text-sm text-ink">Free</span>
                    <span className="block text-xs text-stone-500 mt-0.5">
                      Share for the love of reading
                    </span>
                  </span>
                </label>
                <label
                  className={clsx(
                    'flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors',
                    rentalType === 'PAID'
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-stone-300 hover:border-stone-400'
                  )}
                >
                  <input
                    type="radio"
                    value="PAID"
                    {...register('rentalType')}
                    className="mt-1 w-4 h-4 accent-primary-700"
                  />
                  <span>
                    <span className="block font-semibold text-sm text-ink flex items-center gap-1">
                      <Banknote className="h-3.5 w-3.5" /> Paid
                    </span>
                    <span className="block text-xs text-stone-500 mt-0.5">
                      Set a price and a refundable deposit
                    </span>
                  </span>
                </label>
              </div>
            </div>

            {rentalType === 'PAID' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={`Rental price (${CURRENCY_SYMBOL})`}
                  type="number"
                  placeholder="e.g., 5"
                  error={errors.rentalPrice?.message}
                  {...register('rentalPrice', { valueAsNumber: true })}
                />

                <Input
                  label={`Refundable deposit (${CURRENCY_SYMBOL})`}
                  type="number"
                  placeholder="e.g., 20"
                  error={errors.depositAmount?.message}
                  {...register('depositAmount', { valueAsNumber: true })}
                />
              </div>
            )}

            <Input
              label="Loan duration (days)"
              type="number"
              placeholder="e.g., 14"
              error={errors.rentalDuration?.message}
              {...register('rentalDuration', { valueAsNumber: true })}
            />
          </div>

          {/* Photos & Location */}
          <div className="card !p-7 space-y-6">
            <FileUpload
              maxFiles={5}
              onFilesChange={setImages}
              error={images.length > 0 && images.length < 2 ? 'At least 2 images required' : undefined}
            />

            <LocationPicker
              onLocationChange={setLocation}
              error={!location ? 'Location is required' : undefined}
            />
          </div>

          <Button type="submit" isLoading={createMutation.isPending} className="w-full">
            Put it on the shelf
          </Button>
        </form>
      </div>
    </PageShell>
  )
}
