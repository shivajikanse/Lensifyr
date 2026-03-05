import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Home from './pages/Home'
import Profile from './pages/Profile'
import AuthForm from './features/auth/AuthForm'
import { useAuth } from './hooks/useAuth'

const App = () => {
  const [currentPage, setCurrentPage] = useState('home')
  const { user, login, logout, isAuthenticated } = useAuth()

  const handleAuthSuccess = (response) => {
    login(response.user, response.token)
    setCurrentPage('profile')
  }

  const handleLogout = () => {
    logout()
    setCurrentPage('home')
  }

  const navigateTo = (page) => {
    setCurrentPage(page)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigateTo('home')}
              className="flex items-center gap-2 font-bold text-xl text-indigo-600"
            >
              📸 Lensifyr
            </motion.button>

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <span className="text-gray-600 text-sm">
                    {user?.email?.split('@')[0]}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => navigateTo('profile')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Dashboard
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleLogout}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900"
                  >
                    Logout
                  </motion.button>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => navigateTo('auth')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Photographer Login
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentPage === 'home' && <Home />}
          {currentPage === 'auth' && (
            <div className="flex items-center justify-center min-h-screen px-4">
              <AuthForm onSuccess={handleAuthSuccess} />
            </div>
          )}
          {currentPage === 'profile' && (
            <Profile
              user={user}
              onLogout={handleLogout}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default App
