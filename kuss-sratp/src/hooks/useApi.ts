import { useCallback } from 'react';
import { apiService } from '../services/api';

export const useApi = () => {
  const authenticatedFetch = useCallback(async (
    url: string, 
    options: RequestInit = {}
  ): Promise<Response> => {
    const token = apiService.getToken();
    
    if (!token) {
      // Token is expired or missing, redirect to login
      window.location.href = '/';
      throw new Error('No authentication token available');
    }

    // Check if token is expired before making request
    if (!apiService.isTokenValid()) {
      apiService.clearToken();
      window.location.href = '/';
      throw new Error('Authentication token has expired');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 responses (unauthorized/expired token)
    if (response.status === 401) {
      apiService.clearToken();
      window.location.href = '/';
      throw new Error('Authentication failed - please log in again');
    }

    return response;
  }, []);

  const get = useCallback(async (url: string): Promise<Response> => {
    return authenticatedFetch(url, { method: 'GET' });
  }, [authenticatedFetch]);

  const post = useCallback(async (url: string, data?: any): Promise<Response> => {
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
