interface LoginResponse {
  success: boolean;
  message: string;
  user: {
    id: number;
    email: string;
    role: string;
    created_at: string;
  };
  access_token: string;
}

interface User {
  id: number;
  email: string;
  role: string;
  created_at: string;
}

interface TokenPayload {
  sub: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

class ApiService {
  private baseUrl = 'http://localhost:3000';
  private token: string | null = null;
  private tokenExpiry: number | null = null;

  // Decode JWT token to get payload
  private decodeToken(token: string): TokenPayload | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  }

  // Check if token is expired
  private isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  }

  // Check if token will expire soon (within 5 minutes)
  private isTokenExpiringSoon(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    const fiveMinutes = 5 * 60; // 5 minutes in seconds
    return (payload.exp - currentTime) < fiveMinutes;
  }

  // Set token after login
  setToken(token: string) {
    this.token = token;
    const payload = this.decodeToken(token);
    this.tokenExpiry = payload ? payload.exp * 1000 : null; // Convert to milliseconds
    
    localStorage.setItem('access_token', token);
    if (this.tokenExpiry) {
      localStorage.setItem('token_expiry', this.tokenExpiry.toString());
    }
  }

  // Get token from localStorage
  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('access_token');
      const expiry = localStorage.getItem('token_expiry');
      if (expiry) {
        this.tokenExpiry = parseInt(expiry);
      }
    }
    
    // Check if token exists and is not expired
    if (this.token && this.isTokenExpired(this.token)) {
      this.clearToken();
      return null;
    }
    
    return this.token;
  }

  // Clear token on logout or expiration
  clearToken() {
    this.token = null;
    this.tokenExpiry = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_expiry');
  }

  // Get headers with authentication
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  // Login API call
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Login failed');
      }

      const data: LoginResponse = await response.json();
      
      if (data.success) {
        this.setToken(data.access_token);
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Verify token validity
  async verifyToken(): Promise<User | null> {
    try {
      const token = this.getToken();
      if (!token) {
        return null;
      }

      // Check if token is expired locally first
      if (this.isTokenExpired(token)) {
        this.clearToken();
        return null;
      }

      // Check if token will expire soon and show warning
      if (this.isTokenExpiringSoon(token)) {
        console.warn('Token will expire soon. Consider refreshing.');
      }

      const response = await fetch(`${this.baseUrl}/auth/verify`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid or expired
          this.clearToken();
        }
        return null;
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Token verification error:', error);
      this.clearToken();
      return null;
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      if (token) {
        await fetch(`${this.baseUrl}/auth/logout`, {
          method: 'POST',
          headers: this.getHeaders(),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearToken();
    }
  }

  // Get token expiry time
  getTokenExpiry(): Date | null {
    if (this.tokenExpiry) {
      return new Date(this.tokenExpiry);
    }
    return null;
  }

  // Get time until token expires
  getTimeUntilExpiry(): number | null {
    if (this.tokenExpiry) {
      const currentTime = Date.now();
      return Math.max(0, this.tokenExpiry - currentTime);
    }
    return null;
  }

  // Check if token is valid and not expired
  isTokenValid(): boolean {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired(token);
  }
}

export const apiService = new ApiService();
export type { LoginResponse, User, TokenPayload };
