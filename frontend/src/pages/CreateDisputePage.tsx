import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ArrowLeft, AlertTriangle, X, SearchX } from 'lucide-react'
import { transactionsApi } from '../api/transactions'
import { disputesApi } from '../api/disputes'
import { Button } from '../components/common/Button'
import { PageShell } from '../components/layout/PageShell'
import { EmptyState } from '../components/common/EmptyState'

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
      <PageShell>
        <div className="max-w-2xl mx-auto animate-pulse space-y-6">
          <div className="h-8 bg-stone-100 rounded w-1/3" />
          <div className="h-96 bg-stone-100 rounded-2xl" />
        </div>
      </PageShell>
    )
  }

  if (!transaction) {
    return (
      <PageShell>
        <EmptyState
          icon={SearchX}
          title="Loan not found"
          body="This transaction doesn't exist or you don't have access to it."
          action={<Button onClick={() => navigate('/dashboard')}>Back to dashboard</Button>}
        />
      </PageShell>
    )
  }

  return (
    <PageShell>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(`/transactions/${transactionId}`)}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-primary-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to loan
        </button>

        <h1 className="font-display text-4xl font-semibold text-primary-950 mb-8">
          Raise a dispute
        </h1>

        <div className="card !p-7">
          {/* Context */}
          <div className="flex gap-4 pb-6 border-b border-stone-100">
            <img
              src={transaction.bookListing.images[0]}
              alt={transaction.bookListing.title}
              className="w-16 h-24 object-cover rounded-xl shrink-0"
            />
            <div>
              <p className="font-display text-lg font-semibold text-ink">
                {transaction.bookListing.title}
              </p>
              <p className="text-sm text-stone-500">by {transaction.bookListing.author}</p>
              <p className="text-xs text-stone-400 mt-1">
                Loan ID: {transaction.id.slice(0, 8)}…
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl my-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 pt-6">
            <div>
              <label className="label">What went wrong?</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                className="input"
              >
                <option value="DAMAGE">Book damaged</option>
                <option value="NOT_RETURNED">Book not returned</option>
                <option value="WRONG_CONDITION">Condition didn't match the listing</option>
                <option value="OTHER">Other issue</option>
              </select>
            </div>

            <div>
              <label className="label">Description (min 20 characters)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="input min-h-[140px]"
                placeholder="Describe the issue in detail — what happened, when, and anything else that helps the reviewer understand."
              />
              <p className="text-xs text-stone-400 mt-1">{description.length} characters</p>
            </div>

            <div>
              <label className="label">Evidence photos (optional, max 5)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="w-full text-sm"
                disabled={evidenceFiles.length >= 5}
              />
              {evidencePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {evidencePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-24 object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => removeEvidence(index)}
                        aria-label="Remove photo"
                        className="absolute top-1.5 right-1.5 bg-ink/80 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-start gap-3 bg-accent-50 border border-accent-200 text-stone-700 px-4 py-3 rounded-xl text-sm">
              <AlertTriangle className="h-4.5 w-4.5 h-[18px] w-[18px] mt-0.5 shrink-0 text-accent-600" />
              Please make sure everything is accurate — false disputes can lead to account
              suspension. An admin reviews every case and decides fairly.
            </div>

            <Button
              type="submit"
              isLoading={createDisputeMutation.isPending}
              disabled={!description.trim() || description.trim().length < 20}
              className="w-full"
            >
              Submit dispute
            </Button>
          </form>
        </div>
      </div>
    </PageShell>
  )
}
