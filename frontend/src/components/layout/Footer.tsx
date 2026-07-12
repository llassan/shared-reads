import { Link } from 'react-router-dom'
import { Logo } from './Logo'

export const Footer = () => (
  <footer className="border-t border-stone-200 bg-white mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-10">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-3 text-sm text-stone-500 leading-relaxed">
            Your neighborhood library, powered by neighbors. Borrow, lend and
            swap books with readers near you.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 text-sm">
          <div>
            <h4 className="font-semibold text-ink mb-3">Explore</h4>
            <ul className="space-y-2 text-stone-500">
              <li><Link to="/search" className="hover:text-primary-800">Browse books</Link></li>
              <li><Link to="/register" className="hover:text-primary-800">Become a lender</Link></li>
              <li><Link to="/list-book" className="hover:text-primary-800">List a book</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-ink mb-3">Account</h4>
            <ul className="space-y-2 text-stone-500">
              <li><Link to="/login" className="hover:text-primary-800">Log in</Link></li>
              <li><Link to="/register" className="hover:text-primary-800">Sign up</Link></li>
              <li><Link to="/dashboard" className="hover:text-primary-800">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-ink mb-3">Community</h4>
            <ul className="space-y-2 text-stone-500">
              <li><span className="cursor-default">Reading clubs · soon</span></li>
              <li><span className="cursor-default">Book swaps · soon</span></li>
              <li><span className="cursor-default">City shipping · soon</span></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
        <p>© {new Date().getFullYear()} SharedReads. Made by readers, for readers.</p>
        <p>Every book deserves a second reader.</p>
      </div>
    </div>
  </footer>
)
