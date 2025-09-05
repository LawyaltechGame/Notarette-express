import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, Moon, Sun, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppSelector } from '../../hooks/useAppSelector'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { toggleTheme } from '../../store/slices/uiSlice'
import { appwriteAccount } from '../../lib/appwrite'
import { logout } from '../../store/slices/userSlice'
import { ENVObj } from '../../lib/constant'
import { Teams } from 'appwrite'
import { client } from '../../lib/appwrite'

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const theme = useAppSelector(state => state.ui.theme)
  const isAuthenticated = useAppSelector(state => state.user.isAuthenticated)
  const user = useAppSelector(state => state.user.user)
  const [showNotaryLink, setShowNotaryLink] = useState(false)

  useEffect(() => {
    // Simple heuristic: if user visited notary dashboard successfully once, persist a flag to show link
    try {
      const flag = localStorage.getItem('IS_NOTARY')
      setShowNotaryLink(flag === '1')
    } catch {}
  }, [])

  useEffect(() => {
    let cancelled = false
    const checkTeam = async () => {
      try {
        if (!isAuthenticated || !ENVObj.VITE_NOTARY_TEAM_ID) return
        const teams = new Teams(client)
        const memberships = await teams.listMemberships(ENVObj.VITE_NOTARY_TEAM_ID)
        const email = (user?.email || '').toLowerCase()
        const inTeam = memberships.memberships?.some(m => (m.userEmail || m.userName || '').toLowerCase() === email)
        if (!cancelled && inTeam) {
          setShowNotaryLink(true)
          try { localStorage.setItem('IS_NOTARY', '1') } catch {}
        }
      } catch {}
    }
    checkTeam()
    return () => { cancelled = true }
  }, [isAuthenticated, user?.email])

  // Fallback: allow explicit email list to show link in case team API has delay
  useEffect(() => {
    try {
      const list = String(ENVObj.VITE_NOTARY_EMAILS || '')
        .toLowerCase()
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
      const email = (user?.email || '').toLowerCase()
      if (email && list.includes(email)) setShowNotaryLink(true)
    } catch {}
  }, [user?.email])

  const navigation = [
    { name: 'Services', href: '/services' },
    { name: 'Testimonials', href: '/testimonials' },
    { name: 'FAQ', href: '/faq' },
    ...(showNotaryLink ? [{ name: 'Notary Panel', href: '/notary' }] as const : []),
  ]

  const handleLogout = async () => {
    try {
      try {
        await appwriteAccount.deleteSession('current')
      } catch {}
      if (typeof window !== 'undefined') {
        localStorage.removeItem('LOCAL_USER')
      }
      dispatch(logout())
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100 dark:bg-gray-900/80 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/services" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">NE</span>
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">
              Notarette Express
            </span>
          </Link>

          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-600 hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-400 px-3 py-2 text-sm font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 text-gray-600 hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-400 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                  {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-400 transition-colors"
                aria-label="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>

            <Link
              to="/services"
              className="hidden md:inline-flex items-center px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
            >
              Get Notarized
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-400"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800"
          >
            <div className="px-4 py-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 text-gray-600 hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-400 text-sm font-medium transition-colors"
                >
                  {item.name}
                </Link>
              ))}
              <Link
                to="/services"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center mt-4 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
              >
                Get Notarized
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Header