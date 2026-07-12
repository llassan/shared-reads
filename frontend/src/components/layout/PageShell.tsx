import { ReactNode } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'

interface PageShellProps {
  children: ReactNode
}

/** Standard app chrome: sticky header, content column, footer. */
export const PageShell = ({ children }: PageShellProps) => (
  <div className="min-h-screen flex flex-col bg-paper">
    <Header />
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {children}
    </main>
    <Footer />
  </div>
)
