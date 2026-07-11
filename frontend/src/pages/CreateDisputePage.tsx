import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { transactionsApi } from '../api/transactions'
import { disputesApi } from '../api/disputes'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'

export const CreateDisputePage = () => {
  const { transactionId } = useParams<{ transactionId: string }>()
  const navigate = useNavigate()

  const [reason, setReason] = useState<'DAMAGE' | 'NOT_RETURNED' | 'WRONG_CONDITION' | 'OTHER'>('DAMAGE')
  const [description, setDescription] = useState('')
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([])
  const [evidencePreviews, setEvidencePreviews] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const { data: transaction, isLoading } = useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: () => transactionsApi.getTransaction(transactionId!),
    enabled: !!transactionId,
  })

  const createDisputeMutation = useMutation({
    mutationFn: (data: any) => disputesApi.createDispute(data),
    onSuccess: () => {
      navigate(`/transactions/${transactionId}?dispute=created`)
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to create dispute')
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + evidenceFiles.length > 5) {
      setError('Maximum 5 evidence photos allowed')
      return
    }

    setEvidenceFiles([...evidenceFiles, ...files])

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setEvidencePreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeEvidence = (index: number) => {
    setEvidenceFiles(evidenceFiles.filter((_, i) => i !== index))
    setEvidencePreviews(evidencePreviews.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!description.trim()) {
      setError('Please provide a description of the issue')
      return
    }

    if (description.trim().length < 20) {
      setError('Description must be at least 20 characters')
      return
    }

    createDisputeMutation.mutate({
      transactionId: transactionId!,
      reason,
      description: description.trim(),
      evidencePhotos: evidencePreviews,
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Transaction not found</h2>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="secondary" onClick={() => navigate(`/transactions/${transactionId}`)}>
            ← Back to Transaction
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Raise a Dispute</h1>

          {/* Transaction Info */}
          <div className="mb-6 pb-6 border-b">
            <div className="flex gap-4">
              <img
                src={transaction.bookListing.images[0]}
                alt={transaction.bookListing.title}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div>
                <h3 className="font-semibold text-gray-900">{transaction.bookListing.title}</h3>
                <p className="text-sm text-gray-600">by {transaction.bookListing.author}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Transaction ID: {transaction.id.slice(0, 8)}...
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Type *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="DAMAGE">Book Damaged</option>
                <option value="NOT_RETURNED">Book Not Returned</option>
                <option value="WRONG_CONDITION">Wrong Condition</option>
                <option value="OTHER">Other Issue</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description * (min 20 characters)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Describe the issue in detail. Include what happened, when it happened, and any relevant details..."
              />
              <p className="text-sm text-gray-500 mt-1">{description.length} characters</p>
            </div>

            {/* Evidence Photos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Evidence Photos (Optional, max 5)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="w-full"
                disabled={evidenceFiles.length >= 5}
              />
              {evidencePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {evidencePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeEvidence(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
              ⚠️ Please ensure all information is accurate. False disputes may result in account
              suspension. An admin will review your case and make a fair decision.
            </div>

            {/* Submit */}
            <Button
              type="submit"
              isLoading={createDisputeMutation.isPending}
              disabled={!description.trim() || description.trim().length < 20}
              className="w-full"
            >
              Submit Dispute
            </Button>
          </form>
        </Card>
      </main>
    </div>
  )
}
