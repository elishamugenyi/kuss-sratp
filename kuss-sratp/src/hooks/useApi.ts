import { useCallback } from 'react';
import { apiService } from '../services/api';
import { config } from '../config/config';

export const useApi = () => {
  const authenticatedFetch = useCallback(async (
    url: string, 
    options: RequestInit = {}
  ): Promise<Response> => {
    //console.log('🔐 useApi - Starting authenticated request to:', url);
    
    const token = apiService.getToken();
    //console.log('🔐 useApi - Token retrieved:', token ? `length: ${token.length}` : 'null');
    
    if (!token) {
      // Token is expired or missing, but don't redirect immediately
      //console.log('❌ useApi - No token found, but not redirecting yet');
      //console.log('❌ useApi - Current cookies:', document.cookie);
      //console.log('❌ useApi - localStorage access_token:', localStorage.getItem('access_token'));
      
      // Instead of redirecting, throw an error that can be caught
      throw new Error('No authentication token available');
    }

    // Check if token is expired before making request
    if (!apiService.isTokenValid()) {
      //console.log('❌ useApi - Token expired, but not redirecting yet');
      apiService.clearToken();
      throw new Error('Authentication token has expired');
    }

    // Construct the full URL
    const fullUrl = url.startsWith('http') ? url : `${config.API_BASE_URL}${url}`;
    //console.log('🔐 useApi - Making request to:', fullUrl);

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    /*console.log('🔐 useApi - Request headers:', {
      'Content-Type': headers['Content-Type'],
      'Authorization': `Bearer ${token.substring(0, 20)}...`,
      ...Object.fromEntries(Object.entries(headers).filter(([key]) => !['Content-Type', 'Authorization'].includes(key)))
    });*/

    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers,
        credentials: 'include', // Include cookies
      });

      //console.log('🔐 useApi - Response status:', response.status);
      //console.log('🔐 useApi - Response URL:', response.url);

      // Handle 401 responses (unauthorized/expired token)
      if (response.status === 401) {
        //console.log('❌ useApi - 401 response, but not redirecting yet');
        apiService.clearToken();
        throw new Error('Authentication failed - please log in again');
      }

      return response;
    } catch (error) {
      console.error('🔐 useApi - Fetch error:', error);
      throw error;
    }
  }, []);

  const get = useCallback(async (url: string): Promise<Response> => {
    //console.log('🔐 useApi - GET request to:', url);
    return authenticatedFetch(url, { method: 'GET' });
  }, [authenticatedFetch]);

  const post = useCallback(async (url: string, data?: any): Promise<Response> => {
    //console.log('🔐 useApi - POST request to:', url, 'with data:', data);
    return authenticatedFetch(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }, [authenticatedFetch]);

  const put = useCallback(async (url: string, data?: any): Promise<Response> => {
    return authenticatedFetch(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }, [authenticatedFetch]);

  const del = useCallback(async (url: string): Promise<Response> => {
    return authenticatedFetch(url, { method: 'DELETE' });
  }, [authenticatedFetch]);

  return {
    get,
    post,
    put,
    delete: del,
    authenticatedFetch,
  };
};
