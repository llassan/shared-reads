import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { booksApi } from '../api/books'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { Card } from '../components/common/Card'
import { FileUpload } from '../components/common/FileUpload'
import { LocationPicker } from '../components/common/LocationPicker'
import type { BookCondition, RentalType } from '../types/book'
import { Header } from '../components/layout/Header'

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

      // Validate images
      if (images.length < 2) {
        setError('Please upload at least 2 images')
        return
      }

      if (images.length > 5) {
        setError('Maximum 5 images allowed')
        return
      }

      // Validate location
      if (!location) {
        setError('Please set your location')
        return
      }

      // Validate rental type requirements
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
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <Header />
      <div className="bg-white border-b border-stone-200/70">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary-900">List a Book</h1>
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Form */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Book Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Book Information</h2>

              <Input
                label="Title"
                placeholder="e.g., Clean Code"
                error={errors.title?.message}
                {...register('title')}
              />

              <Input
                label="Author"
                placeholder="e.g., Robert C. Martin"
                error={errors.author?.message}
                {...register('author')}
              />

              <div>
                <label className="label">Description (Optional)</label>
                <textarea
                  className="input min-h-[100px]"
                  placeholder="Brief description of the book..."
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
                  <option value="LIKE_NEW">Like New</option>
                  <option value="GOOD">Good</option>
                  <option value="ACCEPTABLE">Acceptable</option>
                </select>
                {errors.condition && (
                  <p className="mt-1 text-sm text-red-600">{errors.condition.message}</p>
                )}
              </div>
            </div>

            {/* Rental Terms */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Rental Terms</h2>

              <div>
                <label className="label">Rental Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      value="FREE"
                      {...register('rentalType')}
                      className="w-4 h-4 text-primary-600"
                    />
                    <span>Free (No charge)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      value="PAID"
                      {...register('rentalType')}
                      className="w-4 h-4 text-primary-600"
                    />
                    <span>Paid Rental</span>
                  </label>
                </div>
              </div>

              {rentalType === 'PAID' && (
                <>
                  <Input
                    label="Rental Price ($)"
                    type="number"
                    placeholder="e.g., 50"
                    error={errors.rentalPrice?.message}
                    {...register('rentalPrice', { valueAsNumber: true })}
                  />

                  <Input
                    label="Deposit Amount ($)"
                    type="number"
                    placeholder="e.g., 200"
                    error={errors.depositAmount?.message}
                    {...register('depositAmount', { valueAsNumber: true })}
                  />
                </>
              )}

              <Input
                label="Rental Duration (Days)"
                type="number"
                placeholder="e.g., 14"
                error={errors.rentalDuration?.message}
                {...register('rentalDuration', { valueAsNumber: true })}
              />
            </div>

            {/* Photos */}
            <FileUpload
              maxFiles={5}
              onFilesChange={setImages}
              error={images.length > 0 && images.length < 2 ? 'At least 2 images required' : undefined}
            />

            {/* Location */}
            <LocationPicker
              onLocationChange={setLocation}
              error={!location ? 'Location is required' : undefined}
            />

            {/* Submit */}
            <Button
              type="submit"
              isLoading={createMutation.isPending}
              className="w-full"
            >
              List Book
            </Button>
          </form>
        </Card>
      </main>
    </div>
  )
}
