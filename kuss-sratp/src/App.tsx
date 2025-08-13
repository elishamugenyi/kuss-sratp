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
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [currentUser, setCurrentUser] = useState<string>('')

  const handleLogin = async (username: string, password: string) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simple validation - in real app, this would be an API call
    if (username === 'bishop' && password === 'password') {
      setIsAuthenticated(true)
      setCurrentUser('bishop')
    } else if (username === 'EQ' && password === 'password') {
      setIsAuthenticated(true)
      setCurrentUser('EQ')
    } else if (username === 'stakerep' && password === 'password') {
      setIsAuthenticated(true)
      setCurrentUser('stakerep')
    } else if (username === 'stakecom' && password === 'password') {
      setIsAuthenticated(true)
      setCurrentUser('stakecom')
    } else if (username === 'stakepres' && password === 'password') {
      setIsAuthenticated(true)
      setCurrentUser('stakepres')
    } else if (username === 'instructor' && password === 'password') {
      setIsAuthenticated(true)
      setCurrentUser('instructor')
    } else if (username === 'student' && password === 'password') {
      setIsAuthenticated(true)
      setCurrentUser('student')
    }
    else {
      throw new Error('Invalid credentials')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setShowMenu(false)
    setCurrentUser('')
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

  if (isAuthenticated) {
    return (
      <>
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
                  <p className="text-xs text-gray-500">Logged in as: {currentUser}</p>
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
        {currentUser === 'bishop' && <Bishop />}
        {currentUser === 'EQ' && <EQ />}
        {currentUser === 'stakerep' && <StakeRepresentative />}
        {currentUser === 'stakecom' && <StakeCommitee />}
        {currentUser === 'stakepres' && <StakePresident />}
        {currentUser === 'instructor' && <Instructor />}
        {currentUser === 'student' && <Student />}
      </>
    )
  }

  return <Login onLogin={handleLogin} />
}

export default App
