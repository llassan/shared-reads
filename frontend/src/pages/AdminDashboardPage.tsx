import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  BarChart3,
  FileWarning,
  Users,
  LogOut,
  Star,
  BookOpen,
  ArrowLeftRight,
  Banknote,
  CheckCircle2,
} from 'lucide-react'
import clsx from 'clsx'
import { adminApi } from '../api/admin'
import { Button } from '../components/common/Button'
import { StatusBadge } from '../components/common/StatusBadge'
import { EmptyState } from '../components/common/EmptyState'
import { formatMoney } from '../lib/format'

const StatCard = ({
  icon: Icon,
  label,
  value,
  detail,
  accent = false,
}: {
  icon: any
  label: string
  value: string | number
  detail?: string
  accent?: boolean
}) => (
  <div className="card">
    <div className="flex items-center gap-3 mb-3">
      <span
        className={clsx(
          'h-9 w-9 rounded-lg flex items-center justify-center',
          accent ? 'bg-accent-100 text-accent-700' : 'bg-primary-100 text-primary-800'
        )}
      >
        <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
      </span>
      <h3 className="text-sm font-medium text-stone-500">{label}</h3>
    </div>
    <p className="font-display text-3xl font-semibold text-ink">{value}</p>
    {detail && <p className="text-sm text-stone-400 mt-1">{detail}</p>}
  </div>
)

export const AdminDashboardPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'stats' | 'disputes' | 'users'>('stats')
  const [selectedDispute, setSelectedDispute] = useState<any>(null)
  const [resolutionOutcome, setResolutionOutcome] = useState<string>('REFUND_TO_BORROWER')
  const [resolutionNotes, setResolutionNotes] = useState('')

  const { data: stats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: adminApi.getStats,
  })

  const { data: disputes } = useQuery({
    queryKey: ['pendingDisputes'],
    queryFn: adminApi.getPendingDisputes,
  })

  const { data: usersData } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => adminApi.getAllUsers(1, 20),
  })

  const resolveDisputeMutation = useMutation({
    mutationFn: ({ disputeId, data }: any) => adminApi.resolveDispute(disputeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingDisputes'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
      setSelectedDispute(null)
      setResolutionNotes('')
    },
  })

  const suspendUserMutation = useMutation({
    mutationFn: ({ userId, reason }: any) => adminApi.suspendUser(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
    },
  })

  const activateUserMutation = useMutation({
    mutationFn: (userId: string) => adminApi.activateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
    },
  })

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminData')
    navigate('/admin/login')
  }

  const handleResolveDispute = () => {
    if (!selectedDispute) return

    if (confirm(`Resolve dispute with outcome: ${resolutionOutcome}?`)) {
      resolveDisputeMutation.mutate({
        disputeId: selectedDispute.id,
        data: {
          resolutionOutcome,
          resolutionNotes: resolutionNotes.trim() || undefined,
        },
      })
    }
  }

  const handleSuspendUser = (userId: string, userName: string) => {
    const reason = prompt(`Reason for suspending ${userName}:`)
    if (reason && reason.trim()) {
      suspendUserMutation.mutate({ userId, reason: reason.trim() })
    }
  }

  const tabs = [
    { key: 'stats' as const, label: 'Platform stats', icon: BarChart3 },
    { key: 'disputes' as const, label: `Disputes (${disputes?.length || 0})`, icon: FileWarning },
    { key: 'users' as const, label: 'Users', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-paper">
      {/* Admin header */}
      <header className="bg-primary-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src="/logo.svg" alt="" className="h-8 w-8 rounded-lg" />
              <span className="font-display text-lg font-semibold">SharedReads</span>
              <span className="badge bg-accent-500 text-primary-950">Admin</span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-primary-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-stone-200/80 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={clsx(
                  'inline-flex items-center gap-1.5 py-3.5 px-1 border-b-2 font-medium text-sm transition-colors',
                  activeTab === tab.key
                    ? 'border-primary-700 text-primary-800'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                )}
              >
                <tab.icon className="h-4 w-4" /> {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Tab */}
        {activeTab === 'stats' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              icon={Users}
              label="Total users"
              value={stats.users.total}
              detail={`Active ${stats.users.active} · Suspended ${stats.users.suspended}`}
            />
            <StatCard
              icon={BookOpen}
              label="Total books"
              value={stats.books.total}
              detail={`Available ${stats.books.available} · Borrowed ${stats.books.borrowed}`}
            />
            <StatCard
              icon={ArrowLeftRight}
              label="Transactions"
              value={stats.transactions.total}
              detail={`Completed ${stats.transactions.completed}`}
            />
            <StatCard
              icon={Banknote}
              label="Revenue"
              value={formatMoney(stats.revenue.total.toFixed(2))}
              detail="Platform fees collected"
              accent
            />
            <StatCard
              icon={FileWarning}
              label="Disputes"
              value={stats.disputes.total}
              detail={`Pending ${stats.disputes.pending} · Resolved ${stats.disputes.resolved}`}
            />
          </div>
        )}

        {/* Disputes Tab */}
        {activeTab === 'disputes' && (
          <div className="space-y-6">
            {disputes && disputes.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="No pending disputes"
                body="The community is at peace. Resolved disputes appear in platform stats."
              />
            ) : (
              disputes?.map((dispute: any) => (
                <div key={dispute.id} className="card !p-7 space-y-5">
                  {/* Book & Transaction Info */}
                  <div className="flex gap-4 pb-5 border-b border-stone-100">
                    <img
                      src={dispute.transaction.bookListing.images[0]}
                      alt={dispute.transaction.bookListing.title}
                      className="w-16 h-24 object-cover rounded-xl shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-display text-lg font-semibold text-ink">
                          {dispute.transaction.bookListing.title}
                        </h3>
                        <span className="badge bg-red-100 text-red-700">
                          {dispute.reason.replaceAll('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-stone-500 mt-1">
                        Raised by {dispute.raisedBy.name || dispute.raisedBy.email}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-ink mb-1.5">Description</h4>
                    <p className="text-sm text-stone-600">{dispute.description}</p>
                  </div>

                  {dispute.evidencePhotos && dispute.evidencePhotos.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-ink mb-2">Evidence</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {dispute.evidencePhotos.map((photo: string, index: number) => (
                          <img
                            key={index}
                            src={photo}
                            alt={`Evidence ${index + 1}`}
                            className="w-full h-24 object-cover rounded-xl"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {dispute.counterDescription && (
                    <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl">
                      <h4 className="text-sm font-semibold text-ink mb-1.5">Counter-evidence</h4>
                      <p className="text-sm text-stone-600 mb-2">{dispute.counterDescription}</p>
                      {dispute.counterEvidence && dispute.counterEvidence.length > 0 && (
                        <div className="grid grid-cols-4 gap-2">
                          {dispute.counterEvidence.map((photo: string, index: number) => (
                            <img
                              key={index}
                              src={photo}
                              alt={`Counter ${index + 1}`}
                              className="w-full h-24 object-cover rounded-xl"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-stone-400 font-semibold mb-1">
                        Borrower
                      </p>
                      <p className="font-medium text-ink">
                        {dispute.transaction.borrower.name || 'Anonymous'}
                      </p>
                      <p className="flex items-center gap-1 text-stone-500">
                        <Star className="h-3 w-3 text-accent-500 fill-accent-400" />
                        {dispute.transaction.borrower.reputationScore.toFixed(1)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-stone-400 font-semibold mb-1">
                        Lender
                      </p>
                      <p className="font-medium text-ink">
                        {dispute.transaction.lender.name || 'Anonymous'}
                      </p>
                      <p className="flex items-center gap-1 text-stone-500">
                        <Star className="h-3 w-3 text-accent-500 fill-accent-400" />
                        {dispute.transaction.lender.reputationScore.toFixed(1)}
                      </p>
                    </div>
                  </div>

                  {selectedDispute?.id === dispute.id ? (
                    <div className="bg-primary-50 border border-primary-200 p-5 rounded-xl space-y-4">
                      <div>
                        <label className="label">Resolution outcome</label>
                        <select
                          value={resolutionOutcome}
                          onChange={(e) => setResolutionOutcome(e.target.value)}
                          className="input"
                        >
                          <option value="REFUND_TO_BORROWER">Refund to borrower</option>
                          <option value="KEEP_WITH_LENDER">Keep with lender</option>
                          <option value="SPLIT_50_50">Split 50/50</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">Resolution notes (optional)</label>
                        <textarea
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                          rows={3}
                          className="input"
                          placeholder="Add any notes about this resolution…"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleResolveDispute}
                          isLoading={resolveDisputeMutation.isPending}
                        >
                          Confirm resolution
                        </Button>
                        <Button variant="secondary" onClick={() => setSelectedDispute(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button onClick={() => setSelectedDispute(dispute)}>Resolve dispute</Button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && usersData && (
          <div className="card !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/60 text-left text-xs uppercase tracking-wide text-stone-400">
                    <th className="py-3 px-5 font-semibold">User</th>
                    <th className="py-3 px-5 font-semibold">Email</th>
                    <th className="py-3 px-5 font-semibold">Phone</th>
                    <th className="py-3 px-5 font-semibold">Reputation</th>
                    <th className="py-3 px-5 font-semibold">Status</th>
                    <th className="py-3 px-5 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersData.users.map((user: any) => (
                    <tr key={user.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                      <td className="py-3 px-5 font-medium text-ink">
                        {user.name || 'Anonymous'}
                      </td>
                      <td className="py-3 px-5 text-stone-500">{user.email}</td>
                      <td className="py-3 px-5 text-stone-500">{user.phone || '—'}</td>
                      <td className="py-3 px-5">
                        <span className="inline-flex items-center gap-1 text-stone-600">
                          <Star className="h-3.5 w-3.5 text-accent-500 fill-accent-400" />
                          {user.reputationScore.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-3 px-5">
                        <StatusBadge status={user.accountStatus} />
                      </td>
                      <td className="py-3 px-5">
                        {user.accountStatus === 'ACTIVE' ? (
                          <button
                            onClick={() => handleSuspendUser(user.id, user.name || user.email)}
                            className="font-medium text-red-600 hover:text-red-800"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              if (confirm(`Activate user ${user.name || user.email}?`)) {
                                activateUserMutation.mutate(user.id)
                              }
                            }}
                            className="font-medium text-primary-700 hover:text-primary-900"
                          >
                            Activate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
