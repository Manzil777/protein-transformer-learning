import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { ArrowRight, Dna, Menu, X } from 'lucide-react'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import Analyzer from './pages/Analyzer'

// ===== NAVIGATION =====
function Nav() {
  const location = useLocation()
  const isAnalyzer = location.pathname === '/analyze'
  const [menuOpen, setMenuOpen] = useState(false)

  // Close menu on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-cream/80 backdrop-blur-md border-b border-sand/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 h-16 sm:h-20 flex items-center justify-between">
        <Link to="/" className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
          Protein<em className="text-terracotta">Classify.</em>
        </Link>

        {/* Desktop nav links */}
        {!isAnalyzer && (
          <div className="hidden md:flex items-center gap-12 font-sans text-sm font-medium text-charcoal/70">
            <Link to="/" className="text-terracotta transition-colors">Home</Link>
            <Link to="/analyze" className="hover:text-terracotta transition-colors">Analyzer</Link>
            <a href="#services" className="hover:text-terracotta transition-colors">Services</a>
            <a href="#process" className="hover:text-terracotta transition-colors">Process</a>
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* CTA button — hidden on very small screens if menu is present */}
          <Link to={isAnalyzer ? "/" : "/analyze"} className="btn-organic text-xs sm:text-sm !py-2.5 sm:!py-3 !px-4 sm:!px-6">
            {isAnalyzer ? '← Home' : "Analyze"} {!isAnalyzer && <ArrowRight size={14} />}
          </Link>

          {/* Hamburger — mobile only */}
          {!isAnalyzer && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-sand/50 text-charcoal transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && !isAnalyzer && (
        <div className="md:hidden border-t border-sand/50 bg-cream/95 backdrop-blur-md px-6 py-4 space-y-3 font-sans text-sm font-medium animate-in slide-in-from-top-2 print:hidden">
          <Link to="/" className="block text-terracotta py-2" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/analyze" className="block text-charcoal/70 hover:text-terracotta py-2" onClick={() => setMenuOpen(false)}>Analyzer</Link>
          <a href="#services" className="block text-charcoal/70 hover:text-terracotta py-2" onClick={() => setMenuOpen(false)}>Services</a>
          <a href="#process" className="block text-charcoal/70 hover:text-terracotta py-2" onClick={() => setMenuOpen(false)}>Process</a>
        </div>
      )}
    </nav>
  )
}

// ===== FOOTER =====
function Footer() {
  return (
    <footer className="px-4 sm:px-6 md:px-12 py-6 sm:py-8 border-t border-sand/60 print:hidden">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-3">
        <p className="text-sm text-charcoal/50 font-sans">
          Made with <span className="text-red-400">❤</span> by <span className="font-semibold text-charcoal/70">Manzil</span>
        </p>
        <p className="text-[11px] text-charcoal/25 font-sans">
          Powered by ESM-2 · ESMFold · React · Flask
        </p>
      </div>
    </footer>
  )
}

// ===== MAIN APP =====
function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-cream text-charcoal">
        {/* Noise Overlay */}
        <div className="noise-overlay print:hidden" />

        <Nav />

        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analyze" element={<Analyzer />} />
          </Routes>
        </ErrorBoundary>

        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
