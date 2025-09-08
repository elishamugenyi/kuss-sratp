import { useState } from 'react'
import Login from './components/Login'
import Bishop from './components/Bishop'
import EQ from './components/EQ'
//import Navigation from './components/Navigation'
import StakeRepresentative from './components/StakeRepresentative'
import StakeCommitee from './components/StakeCommitee'
import Student from './components/Student'
import StakePresident from './components/StakePresident'
import Instructor from './components/Instructor'
import { useAuth } from './contexts/AuthContext'
import './App.css'

function App() {
  const { user, isAuthenticated, isLoading, logout, tokenExpiry, timeUntilExpiry, showExpiryWarning } = useAuth()
  const [showMenu, setShowMenu] = useState(false)

  const handleLogout = async () => {
    await logout()
    setShowMenu(false)
  }

  const handleUpdateProfile = () => {
    // TODO: Implement update profile functionality
    alert('Update Profile functionality coming soon!')
    setShowMenu(false)
  }

  const handleChangePassword = () => {
    // TODO: Implement change password functionality
    alert('Change Password functionality coming soon!')
    setShowMenu(false)
  }

  // Format time until expiry
  const formatTimeUntilExpiry = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated && user) {
    return (
      <>
        {/* Token Expiry Warning Banner */}
        {showExpiryWarning && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900 px-4 py-3 text-center">
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="font-semibold">
                Your session will expire soon! 
                {timeUntilExpiry && ` (${formatTimeUntilExpiry(timeUntilExpiry)} remaining)`}
              </span>
              <button
                onClick={() => window.location.reload()}
                className="ml-4 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
              >
                Refresh Session
              </button>
            </div>
          </div>
        )}

        {/* Ellipsis Menu */}
        <div className="fixed left-6 top-6 z-50">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="bg-white rounded-full p-3 shadow-lg border border-teal-200 hover:bg-gray-50 transition-all duration-200"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute left-0 top-12 bg-white rounded-xl shadow-2xl border border-teal-200 min-w-56 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-teal-600">User Menu</p>
                  <p className="text-xs text-gray-500">Logged in as: {user.email}</p>
                  <p className="text-xs text-gray-500">Role: {user.role}</p>
                  {tokenExpiry && (
                    <p className="text-xs text-gray-500 mt-1">
                      Session expires: {tokenExpiry.toLocaleTimeString()}
                    </p>
                  )}
                  {timeUntilExpiry && (
                    <p className={`text-xs ${timeUntilExpiry < 30 * 60 * 1000 ? 'text-red-500' : 'text-gray-500'}`}>
                      {timeUntilExpiry < 30 * 60 * 1000 ? '⚠️ ' : ''}
                      {formatTimeUntilExpiry(timeUntilExpiry)} remaining
                    </p>
                  )}
                </div>
                
                <button
                  onClick={handleUpdateProfile}
                  className="w-full text-left px-4 py-3 text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors duration-200 flex items-center space-x-3"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Update Profile</span>
                </button>

                <button
                  onClick={handleChangePassword}
                  className="w-full text-left px-4 py-3 text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors duration-200 flex items-center space-x-3 mt-4"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  <span>Change Password</span>
                </button>

                <div className="border-t border-gray-100 my-2"></div>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 flex items-center space-x-3"
                >
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Close menu when clicking outside */}
        {showMenu && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)}
          ></div>
        )}

        {/* Render appropriate dashboard based on user role */}
        {user.role === 'bishop' && <Bishop />}
        {user.role === "eq" && <EQ />}
        {user.role === 'stake_representative' && <StakeRepresentative />}
        {user.role === 'stake_committee' && <StakeCommitee />}
        {user.role === 'stake_president' && <StakePresident />}
        {user.role === 'instructor' && <Instructor />}
        {user.role === 'student' && <Student />}
        
        {/* Fallback for unknown roles */}
        {!['bishop', 'eq', 'stake_representative', 'stake_committee', 'stake_president', 'instructor', 'student'].includes(user.role) && (
          <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Unknown Role</h1>
              <p className="text-gray-600 mb-4">Your role "{user.role}" is not recognized.</p>
              <button
                onClick={handleLogout}
                className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </>
    )
  }

  return <Login />
}

export default App
