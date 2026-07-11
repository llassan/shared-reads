import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { RegisterPage } from './pages/RegisterPage'
import { VerifyOtpPage } from './pages/VerifyOtpPage'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { ListBookPage } from './pages/ListBookPage'
import { MyListingsPage } from './pages/MyListingsPage'
import { SearchPage } from './pages/SearchPage'
import { BookDetailPage } from './pages/BookDetailPage'
import { MyRequestsPage } from './pages/MyRequestsPage'
import { IncomingRequestsPage } from './pages/IncomingRequestsPage'
import { PaymentPage } from './pages/PaymentPage'
import { TransactionDetailPage } from './pages/TransactionDetailPage'
import { CreateReviewPage } from './pages/CreateReviewPage'
import { CreateDisputePage } from './pages/CreateDisputePage'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/list-book" element={<ListBookPage />} />
            <Route path="/my-listings" element={<MyListingsPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/books/:id" element={<BookDetailPage />} />
            <Route path="/my-requests" element={<MyRequestsPage />} />
            <Route path="/incoming-requests" element={<IncomingRequestsPage />} />
            <Route path="/payments/:transactionId" element={<PaymentPage />} />
            <Route path="/transactions/:transactionId" element={<TransactionDetailPage />} />
            <Route path="/reviews/create/:transactionId" element={<CreateReviewPage />} />
            <Route path="/disputes/create/:transactionId" element={<CreateDisputePage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  )
}

// Homepage component
function HomePage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-primary-900 mb-4">
          SharedReads
        </h1>
        <p className="text-xl text-primary-700 mb-8">
          Share Books, Build Community
        </p>
        <div className="space-x-4">
          <Link to="/register">
            <button className="btn btn-primary">Sign Up</button>
          </Link>
          <Link to="/login">
            <button className="btn btn-secondary">Login</button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default App
