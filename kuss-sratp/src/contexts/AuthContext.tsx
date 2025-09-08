import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiService } from '../services/api';
import type { User, SignupRequest } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (signupData: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  tokenExpiry: Date | null;
  timeUntilExpiry: number | null;
  showExpiryWarning: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showExpiryWarning, setShowExpiryWarning] = useState(false);

  const checkAuth = async () => {
    try {
      //console.log('🔐 AuthContext - Starting auth check');
      const userData = await apiService.verifyToken();
      //console.log('🔐 AuthContext - verifyToken result:', userData);
      
      if (userData) {
        //console.log('🔐 AuthContext - Setting user as authenticated:', userData.email);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        //console.log('🔐 AuthContext - No user data, setting as not authenticated');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('🔐 AuthContext - Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (signupData: SignupRequest) => {
    try {
      const response = await apiService.signup(signupData);
      
      if (response.success) {
        // After successful signup, automatically login the user
        await login(signupData.email, signupData.password);
      } else {
        throw new Error(response.error || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      //console.log('🔐 AuthContext - Starting login for:', email);
      const response = await apiService.login(email, password);
      //console.log('🔐 AuthContext - Login response:', response);
      
      if (response.success && response.user) {
        //console.log('🔐 AuthContext - Login successful, setting user:', response.user.email);
        //console.log('🔐 AuthContext - Access token received:', response.access_token ? 'yes' : 'no');
        //console.log('🔐 AuthContext - Token length:', response.access_token?.length || 0);
        
        setUser(response.user);
        setIsAuthenticated(true);
        
        // Store user info in cookie with 2-hour expiry to match backend JWT expiration
        // Use the same cookie approach as apiService
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const expires = new Date();
        expires.setTime(expires.getTime() + (2 * 60 * 60 * 1000)); // 2 hours
        
        let cookieString = `user=${encodeURIComponent(JSON.stringify(response.user))};expires=${expires.toUTCString()};path=/`;
        if (isLocalhost) {
          cookieString += ';SameSite=Lax';
        } else {
          cookieString += ';SameSite=Strict;secure';
        }
        
        document.cookie = cookieString;
        //console.log('🔐 AuthContext - User cookie set');
        
        // Verify token storage
        const storedToken = apiService.getToken();
        //console.log('🔐 AuthContext - Token verification after login:', storedToken ? 'success' : 'failed');
        
        // Additional debugging - check both storage locations
        //const cookieToken = document.cookie.includes('access_token');
        //const localToken = localStorage.getItem('access_token');
        /*console.log('🔐 AuthContext - Storage verification:', {
          cookie: cookieToken,
          localStorage: !!localToken,
          tokenLength: localToken?.length || 0
        });*/
        
        // If token storage failed, try to manually store it
        if (!storedToken && response.access_token) {
          //console.log('🔐 AuthContext - Token storage failed, attempting manual storage');
          apiService.setToken(response.access_token);
          
          // Verify again
          const retryToken = apiService.getToken();
          //console.log('🔐 AuthContext - Manual token storage result:', retryToken ? 'success' : 'failed');
        }
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('🔐 AuthContext - Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setShowExpiryWarning(false);
      // Clear stored user info from cookie
      document.cookie = 'user=;path=/;expires=Thu, 01 Jan 1970 00:00:00 UTC';
    }
  };

  // Helper function to get user from cookie
  const getUserFromCookie = (): User | null => {
    try {
      const userCookie = document.cookie
        .split(';')
        .find(c => c.trim().startsWith('user='));
      
      if (userCookie) {
        const userValue = userCookie.split('=')[1];
        return JSON.parse(decodeURIComponent(userValue));
      }
      return null;
    } catch (error) {
      console.error('Error parsing user cookie:', error);
      return null;
    }
  };

  // Check token expiration periodically
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkTokenExpiry = () => {
      const timeUntilExpiry = apiService.getTimeUntilExpiry();
      
      if (timeUntilExpiry !== null) {
        // Show warning when token expires in less than 10 minutes
        if (timeUntilExpiry < 10 * 60 * 1000) { // 10 minutes in milliseconds
          setShowExpiryWarning(true);
        }
        
        // Auto-logout when token expires
        if (timeUntilExpiry <= 0) {
          //console.log('Token expired, logging out user');
          logout();
        }
      }
    };

    // Check immediately
    checkTokenExpiry();
    
    // Check every minute
    const interval = setInterval(checkTokenExpiry, 60 * 1000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Check auth on mount - try to restore user from cookie if no verify endpoint
  useEffect(() => {
    const storedUser = getUserFromCookie();
    if (storedUser) {
      try {
        //console.log('🔐 AuthContext - Restoring user from cookie:', storedUser.email);
        setUser(storedUser);
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (error) {
        //console.error('🔐 AuthContext - Error parsing stored user:', error);
        document.cookie = 'user=;path=/;expires=Thu, 01 Jan 1970 00:00:00 UTC';
        checkAuth();
      }
    } else {
      checkAuth();
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    checkAuth,
    tokenExpiry: apiService.getTokenExpiry(),
    timeUntilExpiry: apiService.getTimeUntilExpiry(),
    showExpiryWarning,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
