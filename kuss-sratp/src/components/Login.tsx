import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { SignupRequest } from '../services/api';

const Login: React.FC = () => {
  const { login, signup } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  
  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  // Signup form states
  const [signupData, setSignupData] = useState<SignupRequest>({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
  });
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignupLoading, setIsSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Please fill in all fields');
      return;
    }

    setIsLoginLoading(true);
    setLoginError('');

    try {
      await login(loginEmail, loginPassword);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Wrong Username or Password. Please try again.');
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!signupData.name.trim() || !signupData.email.trim() || !signupData.phoneNumber.trim() || !signupData.password.trim()) {
      setSignupError('Please fill in all fields');
      return;
    }

    if (signupData.password !== confirmPassword) {
      setSignupError('Passwords do not match');
      return;
    }

    if (signupData.password.length < 6) {
      setSignupError('Password must be at least 6 characters long');
      return;
    }

    setIsSignupLoading(true);
    setSignupError('');
    setSignupSuccess('');

    try {
      await signup(signupData);
      setSignupSuccess('Account created successfully! You are now logged in.');
    } catch (err) {
      setSignupError(err instanceof Error ? err.message : 'Signup failed. Please try again.');
    } finally {
      setIsSignupLoading(false);
    }
  };

  const toggleLoginPasswordVisibility = () => {
    setShowLoginPassword(!showLoginPassword);
  };

  const toggleSignupPasswordVisibility = () => {
    setShowSignupPassword(!showSignupPassword);
  };

  const resetForms = () => {
    setLoginEmail('');
    setLoginPassword('');
    setLoginError('');
    setSignupData({
      name: '',
      email: '',
      phoneNumber: '',
      password: '',
    });
    setConfirmPassword('');
    setSignupError('');
    setSignupSuccess('');
  };

  const switchToSignup = () => {
    setIsSignup(true);
    resetForms();
  };

  const switchToLogin = () => {
    setIsSignup(false);
    resetForms();
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-6xl border border-teal-200 shadow-teal-100">
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Content */}
          <div className="lg:w-1/2 bg-white p-8 lg:p-12 flex flex-col justify-center border-r border-gray-100">
            <div className="max-w-md mx-auto lg:mx-0">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6 leading-tight">
                KUSS-SRTP
              </h1>
              <h2 className="text-2xl lg:text-3xl font-semibold text-gray-800 mb-6">
                Self-Reliance Tracking Portal
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                Welcome to the KUSS Stake Self-Reliance And Tracking Portal. 
                This platform enables ward leaders to effectively track, report, and 
                record self-reliance classes and groups throughout the stake.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">
                    Monitor class attendance and progress across all wards
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">
                    Generate comprehensive reports for stake leadership
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">
                    Track individual and group achievements
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login/Signup Form */}
          <div className="lg:w-1/2 bg-white p-8 lg:p-12 flex items-center justify-center relative">
            {/* SE Icon positioned on the right */}
            <div className="absolute top-8 right-8 lg:top-12 lg:right-12">
              <img 
                src="/SE-icon.png" 
                alt="SE Icon" 
                className="w-16 h-16 lg:w-20 lg:h-20"
              />
            </div>
            
            <div className="w-full max-w-md">

              {!isSignup ? (
                /* Login Form */
                <>
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-800 mr-10 mb-2">
                      Welcome to KUSS-SRTP
                    </h3>
                    <p className="text-gray-600 mr-14">
                      Access your ward's self-reliance dashboard
                    </p>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-6">
                    {loginError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
                        {loginError}
                      </div>
                    )}
                    
                    <div>
                      <label htmlFor="loginEmail" className="block text-sm font-semibold text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="loginEmail"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200 font-medium text-gray-800 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={isLoginLoading}
                      />
                    </div>

                    <div>
                      <label htmlFor="loginPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showLoginPassword ? 'text' : 'password'}
                          id="loginPassword"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200 font-medium text-gray-800 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          disabled={isLoginLoading}
                        />
                        <button
                          type="button"
                          onClick={toggleLoginPasswordVisibility}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isLoginLoading}
                        >
                          {showLoginPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                      disabled={isLoginLoading}
                    >
                      {isLoginLoading ? (
                        <div className="flex items-center justify-center space-x-3">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Signing in...</span>
                        </div>
                      ) : (
                        'Sign In'
                      )}
                    </button>
                  </form>
                </>
              ) : (
                /* Signup Form */
                <>
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-800 mr-10 mb-2">
                      Create Your Account
                    </h3>
                    <p className="text-gray-600 mr-10">
                      Join the self-reliance tracking portal
                    </p>
                  </div>

                  <form onSubmit={handleSignupSubmit} className="space-y-6">
                    {signupError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
                        {signupError}
                      </div>
                    )}

                    {signupSuccess && (
                      <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm text-center">
                        {signupSuccess}
                      </div>
                    )}
                    
                    <div>
                      <label htmlFor="signupName" className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="signupName"
                        value={signupData.name}
                        onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200 font-medium text-gray-800 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={isSignupLoading}
                      />
                    </div>

                    <div>
                      <label htmlFor="signupEmail" className="block text-sm font-semibold text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="signupEmail"
                        value={signupData.email}
                        onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                        placeholder="Enter your email"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200 font-medium text-gray-800 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={isSignupLoading}
                      />
                    </div>

                    <div>
                      <label htmlFor="signupPhone" className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="signupPhone"
                        value={signupData.phoneNumber}
                        onChange={(e) => setSignupData({...signupData, phoneNumber: e.target.value})}
                        placeholder="Enter your phone number"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200 font-medium text-gray-800 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={isSignupLoading}
                      />
                    </div>

                    <div>
                      <label htmlFor="signupPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showSignupPassword ? 'text' : 'password'}
                          id="signupPassword"
                          value={signupData.password}
                          onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                          placeholder="Create a password"
                          className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200 font-medium text-gray-800 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          disabled={isSignupLoading}
                        />
                        <button
                          type="button"
                          onClick={toggleSignupPasswordVisibility}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isSignupLoading}
                        >
                          {showSignupPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200 font-medium text-gray-800 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={isSignupLoading}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                      disabled={isSignupLoading}
                    >
                      {isSignupLoading ? (
                        <div className="flex items-center justify-center space-x-3">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Creating account...</span>
                        </div>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </form>
                </>
              )}

              <div className="text-center mt-8 pt-6 border-t border-gray-200">
                {!isSignup ? (
                  <>
                    <p className="text-gray-600 text-sm mb-3">
                      Don't have an account?
                    </p>
                    <button
                      onClick={switchToSignup}
                      className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg"
                    >
                      Sign Up Here
                    </button>
                    <p className="text-gray-600 text-sm mt-3">
                      Need access? Contact your stake administrator
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600 text-sm mb-3">
                      Already have an account?
                    </p>
                    <button
                      onClick={switchToLogin}
                      className="text-teal-600 hover:text-teal-700 font-medium transition-colors duration-200 underline"
                    >
                      Sign in here
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 