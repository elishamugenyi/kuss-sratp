import { config } from '../config/config';

interface LoginResponse {
  success: boolean;
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    ward: string;
  };
  access_token: string;
  expires_in: string;
}

interface SignupRequest {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
}

interface SignupResponse {
  success: boolean;
  message: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
    ward: string;
  };
  error?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  ward: string;
}

interface TokenPayload {
  sub: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

interface GroupAssignmentRequest {
  instructorname: string;
  instructoremail: string;
  groupname: string;
  groupdescription: string;
  startdate: string;
  enddate: string;
}

interface UpdateGroupRequest {
  instructorname: string;
  instructoremail: string;
  groupname: string;
  groupdescription: string;
  startdate: string;
  enddate: string;
}

interface UpdateGroupResponse {
  success: boolean;
  message: string;
  data?: {
    groupid: string;
    groupname: string;
    groupdescription: string | null;
    instructorid: string;
    startdate: string;
    enddate: string;
    maxstudents: number;
    currentstudents: number;
    status: string;
    created_at: string;
    updated_at: string;
  };
  error?: string;
}

interface GroupAssignmentResponse {
  success: boolean;
  message: string;
  group?: {
    groupid: string;
    groupname: string;
    groupdescription: string;
    instructorname: string;
    instructoremail: string;
    startdate: string;
    enddate: string;
    status: string;
  };
  error?: string;
}

interface GroupData {
  groupid: string;
  groupname: string;
  groupdescription: string | null;
  instructorid: string;
  startdate: string;
  enddate: string;
  maxstudents: number;
  currentstudents: number;
  status: string;
  created_at: string;
  updated_at: string;
  instructor: {
    instructorid: string;
    instructorbio: string | null;
    instructorname: string;
    instructoremail: string;
    instructorphone: string | null;
    instructorspecialization: string | null;
  };
}

interface GetGroupsResponse {
  success: boolean;
  data?: GroupData[];
  error?: string;
}

interface GetParticipantsResponse {
  success: boolean;
  data: any;
  error?: string;
}
class ApiService {
  private baseUrl = config.API_BASE_URL;
  private token: string | null = null;
  private tokenExpiry: number | null = null;

  // Cookie utility functions with enhanced security and proper parsing
  private setCookie(name: string, value: string, days: number = 2/24) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    
    // For development (localhost), use more permissive settings
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    let cookieString = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
    
    if (isLocalhost) {
      // For localhost development, don't set SameSite=Strict or secure
      cookieString += ';SameSite=Lax';
    } else {
      // For production, use strict security
      cookieString += ';SameSite=Strict;secure';
    }
    
    //console.log('🍪 Setting cookie:', name, 'with value length:', value.length);
    //console.log('🍪 Cookie string:', cookieString);
    document.cookie = cookieString;
    
    // Verify cookie was set
    //const verifyCookie = this.getCookie(name);
    //console.log('🍪 Cookie verification:', name, verifyCookie ? 'set successfully' : 'failed to set');
  }

  private getCookie(name: string): string | null {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(';');
    
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i];
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1);
      }
      if (cookie.indexOf(nameEQ) === 0) {
        const value = cookie.substring(nameEQ.length);
        //console.log('🍪 Retrieved cookie:', name, 'value length:', value.length);
        return decodeURIComponent(value);
      }
    }
    
    //console.log('🍪 Cookie not found:', name);
    return null;
  }

  private deleteCookie(name: string) {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isLocalhost) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`;
    } else {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Strict;secure`;
    }
    
    //console.log('🍪 Deleted cookie:', name);
  }

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
    //console.log('🔐 Setting token, length:', token.length);
    this.token = token;
    const payload = this.decodeToken(token);
    this.tokenExpiry = payload ? payload.exp * 1000 : null; // Convert to milliseconds
    
    //console.log('🔐 Token payload:', payload);
    //console.log('🔐 Token expiry:', this.tokenExpiry);
    
    // Store token in localStorage first (more reliable)
    localStorage.setItem('access_token', token);
    if (this.tokenExpiry) {
      localStorage.setItem('token_expiry', this.tokenExpiry.toString());
    }
    //console.log('🔐 Token stored in localStorage');
    
    // Also try to store in cookie as backup
    try {
      this.setCookie('access_token', token, 2/24); // 2 hours (2/24 days)
      if (this.tokenExpiry) {
        this.setCookie('token_expiry', this.tokenExpiry.toString(), 2/24);
      }
      //console.log('🔐 Token also stored in cookies');
    } catch (error) {
      //console.log('🔐 Cookie storage failed, but localStorage is working:', error);
    }
    
    // Verify token was stored
    //const storedLocalToken = localStorage.getItem('access_token');
    //const storedCookieToken = this.getCookie('access_token');
    //console.log('🔐 Stored token verification - localStorage:', !!storedLocalToken, 'cookie:', !!storedCookieToken);
  }

  // Get token from localStorage first, then cookies as fallback
  getToken(): string | null {
    if (!this.token) {
      //console.log('🔐 Getting token...');
      
      // Try localStorage first (more reliable)
      this.token = localStorage.getItem('access_token');
      if (this.token) {
        //console.log('🔐 Token retrieved from localStorage');
      } else {
        // Fallback to cookie
        this.token = this.getCookie('access_token');
        if (this.token) {
          //console.log('🔐 Token retrieved from cookie');
        } else {
          //console.log('🔐 No token found in localStorage or cookie');
        }
      }
      
      // Get expiry from either source
      let expiry = localStorage.getItem('token_expiry');
      if (!expiry) {
        expiry = this.getCookie('token_expiry');
      }
      
      if (expiry) {
        this.tokenExpiry = parseInt(expiry);
        //console.log('🔐 Retrieved token expiry:', this.tokenExpiry);
      }
      
      //console.log('🔐 Retrieved token:', this.token ? `length: ${this.token.length}` : 'null');
    }
    
    // Check if token exists and is not expired
    if (this.token && this.isTokenExpired(this.token)) {
      //console.log('🔐 Token expired, clearing');
      this.clearToken();
      return null;
    }
    
    //console.log('🔐 Returning token:', this.token ? 'valid' : 'null');
    return this.token;
  }

  // Clear token on logout or expiration
  clearToken() {
    this.token = null;
    this.tokenExpiry = null;
    this.deleteCookie('access_token');
    this.deleteCookie('token_expiry');
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_expiry');
    //console.log('🔐 Token cleared from all storage');
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

  // Signup API call
  async signup(signupData: SignupRequest): Promise<SignupResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${config.API_ENDPOINTS.SIGNUP}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
        credentials: 'omit', // Don't send cookies for public endpoints
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Signup failed');
      }

      const data: SignupResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  // Login API call
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      //console.log('🔐 apiService - Starting login for:', email);
      const loginUrl = `${this.baseUrl}${config.API_ENDPOINTS.LOGIN}`;
      //console.log('🔐 apiService - Login URL:', loginUrl);
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Include cookies
      });

      //console.log('🔐 apiService - Login response status:', response.status);
      //console.log('🔐 apiService - Login response headers:', response.headers);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        //console.log('🔐 apiService - Login failed with error:', errorData);
        throw new Error(errorData.message || 'Login failed');
      }

      const data: LoginResponse = await response.json();
      //console.log('🔐 apiService - Login response data:', data);
      
      if (data.success) {
        //console.log('🔐 apiService - Setting token:', data.access_token ? 'exists' : 'null');
        this.setToken(data.access_token);
        // console.log('🔐 apiService - Token set, checking if valid:', this.isTokenValid());
      }
      
      return data;
    } catch (error) {
      console.error('🔐 apiService - Login error:', error);
      throw error;
    }
  }

  // Verify token validity - simplified since we don't have a verify endpoint
  async verifyToken(): Promise<User | null> {
    try {
      //console.log('🔐 apiService - Starting token verification (local check only)');
      const token = this.getToken();
      //console.log('🔐 apiService - Token from getToken():', token ? 'exists' : 'null');
      
      if (!token) {
        //console.log('🔐 apiService - No token found');
        return null;
      }

      // Check if token is expired locally
      if (this.isTokenExpired(token)) {
        //console.log('🔐 apiService - Token expired locally, clearing');
        this.clearToken();
        return null;
      }

      // Check if token will expire soon and show warning
      if (this.isTokenExpiringSoon(token)) {
        console.warn('🔐 apiService - Token will expire soon. Consider refreshing.');
      }

      // Since we don't have a verify endpoint, we'll just check if the token exists and is valid locally
      // The token will be validated when making actual API calls
      //console.log('🔐 apiService - Token appears valid locally');
      
      // Return a basic user object based on the token payload
      const payload = this.decodeToken(token);
      if (payload) {
        return {
          id: payload.sub,
          email: payload.email,
          role: payload.role,
          name: 'User', // We don't have this info without a verify endpoint
          ward: 'Unknown' // We don't have this info without a verify endpoint
        };
      }
      
      return null;
    } catch (error) {
      console.error('🔐 apiService - Token verification error:', error);
      this.clearToken();
      return null;
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      if (token) {
        await fetch(`${this.baseUrl}${config.API_ENDPOINTS.LOGOUT}`, {
          method: 'POST',
          headers: this.getHeaders(),
          credentials: 'include',
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

  //fetch users
  async fetchUsers(): Promise<User[]> {
    const response = await fetch(`${this.baseUrl}$/auth/add_user`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch users');
    }
    const data: User[] = await response.json();
    return data;
  }
  // Assign group API call
  async assignGroup(groupData: GroupAssignmentRequest): Promise<GroupAssignmentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${config.API_ENDPOINTS.ASSIGN_GROUP}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(groupData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Group assignment failed');
      }

      const data: GroupAssignmentResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Group assignment error:', error);
      throw error;
    }
  }

  // Update group API call
  async updateGroup(groupId: string, groupData: UpdateGroupRequest): Promise<UpdateGroupResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${config.API_ENDPOINTS.UPDATE_GROUP}/${groupId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(groupData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Group update failed');
      }

      const data: UpdateGroupResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Group update error:', error);
      throw error;
    }
  }

  // Get groups API call
  async getGroups(): Promise<GetGroupsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${config.API_ENDPOINTS.GET_GROUPS}`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch groups');
      }

      const data: GetGroupsResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Get groups error:', error);
      throw error;
    }
  }

  // Get available groups for students
  async getAvailableGroups(): Promise<{ success: boolean; data: any[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/group/available`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch available groups');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get available groups error:', error);
      throw error;
    }
  }

  // Join a group
  async joinGroup(joinData: { groupid: string; studentid: string }): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}${config.API_ENDPOINTS.JOIN_GROUP}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(joinData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to join group');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Join group error:', error);
      throw error;
    }
  }

  // Join a group with student details
  async joinGroupWithDetails(joinData: { groupid: string; studentname: string; studentemail: string; studentphone: string; notes: string }): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}${config.API_ENDPOINTS.JOIN_GROUP}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(joinData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to join group');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Join group error:', error);
      throw error;
    }
  }

  // Get student details from registered_users table
  async getStudentDetails(email: string): Promise<{ success: boolean; data: any; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/student/details/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch student details');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get student details error:', error);
      throw error;
    }
  }

  // Get student enrollment (groups they are enrolled in)
  async getStudentEnrollment(userId: string): Promise<{ success: boolean; data: any[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}${config.API_ENDPOINTS.MY_ENROLLMENTS}`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch student enrollment');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get student enrollment error:', error);
      throw error;
    }
  }

  // Get instructor groups
  async getInstructorGroups(instructorId: string): Promise<{ success: boolean; data: any[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}${config.API_ENDPOINTS.MY_GROUPS}?instructorid=${encodeURIComponent(instructorId)}`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch instructor groups');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get instructor groups error:', error);
      throw error;
    }
  }

  // Get instructor students for a specific group
  async getInstructorStudents(instructorId: string, groupId: string): Promise<{ success: boolean; data: any[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}${config.API_ENDPOINTS.MY_STUDENTS}/${groupId}`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch instructor students');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get instructor students error:', error);
      throw error;
    }
  }

  // Leave a group
  async leaveGroup(leaveData: { groupid: string; studentid: string }): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/group/leave`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(leaveData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to leave group');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Leave group error:', error);
      throw error;
    }
  }

  // =====================================================
  // ATTENDANCE MANAGEMENT METHODS
  // =====================================================

  // Mark attendance for a single student
  async markAttendance(attendanceData: {
    studentid: string;
    groupid: string;
    weeknumber: number;
    status: 'present' | 'absent' | 'late' | 'excused' | 'makeup';
    attendancedate?: string;
    notes?: string;
  }): Promise<{ success: boolean; message: string; data?: any; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}${config.API_ENDPOINTS.MARK_ATTENDANCE}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(attendanceData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to mark attendance');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Mark attendance error:', error);
      throw error;
    }
  }

  // Get attendance for a group (all weeks or specific week)
  async getAttendance(groupid: string, weeknumber?: number): Promise<{ success: boolean; data: any[]; error?: string }> {
    try {
      const url = weeknumber 
        ? `${this.baseUrl}${config.API_ENDPOINTS.GET_ATTENDANCE_BY_WEEK}/${groupid}/week/${weeknumber}`
        : `${this.baseUrl}${config.API_ENDPOINTS.GET_ATTENDANCE}/${groupid}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch attendance');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get attendance error:', error);
      throw error;
    }
  }

  // Get students with attendance for a specific week
  async getStudentsWithAttendanceForWeek(groupid: string, weeknumber: number): Promise<{ success: boolean; data: any; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}${config.API_ENDPOINTS.GET_STUDENTS_WITH_ATTENDANCE}/${groupid}/week/${weeknumber}/students`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch students with attendance');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get students with attendance error:', error);
      throw error;
    }
  }

  // Mark attendance for multiple students for a week
  async markAttendanceForWeek(groupid: string, weeknumber: number, attendanceData: Array<{
    studentid: string;
    status: 'present' | 'absent' | 'late' | 'excused' | 'makeup';
    notes?: string;
  }>): Promise<{ success: boolean; message: string; data?: any; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}${config.API_ENDPOINTS.MARK_ATTENDANCE_FOR_WEEK}/${groupid}/week/${weeknumber}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(attendanceData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to mark attendance for week');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Mark attendance for week error:', error);
      throw error;
    }
  }

  // Update existing attendance record
  async updateAttendanceRecord(attendanceid: string, updateData: {
    status?: 'present' | 'absent' | 'late' | 'excused' | 'makeup';
    attendancedate?: string;
    weeknumber?: number;
    notes?: string;
  }): Promise<{ success: boolean; message: string; data?: any; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}${config.API_ENDPOINTS.UPDATE_ATTENDANCE_RECORD}/${attendanceid}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(updateData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update attendance');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Update attendance error:', error);
      throw error;
    }
  }
  
  // =====================================================
  // VIEW PARTICIPANTS - Reports and other participant views
  // =====================================================
  /*async getParticipants(groupid: string): Promise<GetParticipantsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${config.API_ENDPOINTS.VIEW_PARTICIPANTS}/${encodeURIComponent(groupid)}`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch participants');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get participants error:', error);
      throw error;
    }
  }*/ 

  async searchParticipantsByEmail(studentemail: string): Promise<GetParticipantsResponse> {
    try {
      const url = `${this.baseUrl}${config.API_ENDPOINTS.VIEW_PARTICIPANTS}?studentemail=${encodeURIComponent(studentemail)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to search participants by email');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Search participants by email error:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
export type { LoginResponse, User, TokenPayload, SignupRequest, SignupResponse, GroupAssignmentRequest, GroupAssignmentResponse, GroupData, GetGroupsResponse, UpdateGroupRequest, UpdateGroupResponse };
