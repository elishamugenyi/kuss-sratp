# Authentication System

This document describes the authentication system implemented in the KUSS-SRTP application.

## Overview

The application now integrates with a backend API for user authentication and role-based access control. Users can log in with their email and password, and the system will automatically redirect them to the appropriate dashboard based on their role.

## Features

- **Email-based login**: Users authenticate using their email address and password
- **JWT token management**: Access tokens are automatically stored and managed
- **Role-based routing**: Automatic redirection to role-specific dashboards
- **Session persistence**: Users remain logged in across browser sessions
- **Automatic token verification**: Tokens are verified on app load and before requests
- **Secure logout**: Proper cleanup of authentication state
- **Token expiration handling**: Automatic warnings and logout when tokens expire
- **Real-time expiry monitoring**: Continuous monitoring of token validity

## API Integration

### Backend Endpoints

- **Login**: `POST /auth/login`
- **Logout**: `POST /auth/logout` 
- **Token Verification**: `GET /auth/verify`

### Expected Response Format

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 5,
    "email": "test@example.com",
    "role": "bishop",
    "created_at": "2025-08-16T19:01:29.373469+00:00"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Token Expiration

### 24-Hour Token Lifetime

- **Default expiration**: 24 hours from login
- **Warning threshold**: 10 minutes before expiration
- **Auto-logout**: Automatic logout when token expires
- **Real-time monitoring**: Continuous checking every minute

### Expiration Features

- **Visual warnings**: Yellow banner appears 10 minutes before expiry
- **Time display**: Shows remaining time in user menu
- **Refresh option**: Users can refresh their session
- **Automatic cleanup**: Expired tokens are automatically removed

## User Roles

The system supports the following user roles:

- `bishop` - Bishop dashboard
- `eq` - EQ Presidency dashboard  
- `stake_representative` - Stake Representative dashboard
- `stake_committee` - Stake Committee dashboard
- `stake_president` - Stake President dashboard
- `instructor` - Instructor dashboard
- `student` - Student dashboard

## Implementation Details

### Authentication Context

The `AuthContext` provides authentication state and methods throughout the application:

```typescript
const { 
  user, 
  isAuthenticated, 
  isLoading, 
  login, 
  logout,
  tokenExpiry,
  timeUntilExpiry,
  showExpiryWarning
} = useAuth();
```

### API Service

The `ApiService` class handles all authentication-related API calls:

```typescript
import { apiService } from './services/api';

// Login
await apiService.login(email, password);

// Logout
await apiService.logout();

// Verify token
const user = await apiService.verifyToken();

// Check token validity
const isValid = apiService.isTokenValid();

// Get token expiry information
const expiry = apiService.getTokenExpiry();
const timeLeft = apiService.getTimeUntilExpiry();
```

### Authenticated API Calls

Use the `useApi` hook for making authenticated requests to other endpoints:

```typescript
import { useApi } from './hooks/useApi';

const { get, post, put, delete: del } = useApi();

// Example: Get user data
const response = await get('/api/user/profile');
const userData = await response.json();
```

## Security Features

- **Token storage**: Access tokens are stored in localStorage with expiry tracking
- **Automatic token inclusion**: All authenticated requests include the Bearer token
- **Token verification**: Tokens are verified on app load and before requests
- **Automatic cleanup**: Invalid or expired tokens are automatically cleared
- **Expiration monitoring**: Real-time monitoring prevents expired token usage
- **Auto-redirect**: Users are automatically redirected to login when tokens expire

## Token Expiration Handling

### Warning System

- **10-minute warning**: Yellow banner appears when token expires soon
- **Time display**: Shows remaining time in hours and minutes
- **Refresh button**: Allows users to refresh their session
- **Visual indicators**: Color-coded time remaining (red when <30 minutes)

### Automatic Actions

- **Periodic checks**: Token validity checked every minute
- **Auto-logout**: Automatic logout when token expires
- **Cleanup**: Expired tokens removed from storage
- **Redirect**: Users sent to login page

### User Experience

- **Clear notifications**: Users know when their session will expire
- **Graceful handling**: No sudden disconnections
- **Recovery options**: Refresh session or re-login
- **Time awareness**: Always know how much time remains

## Usage Examples

### Login Component

```typescript
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { login } = useAuth();
  
  const handleSubmit = async (email: string, password: string) => {
    try {
      await login(email, password);
      // User will be automatically redirected to their dashboard
    } catch (error) {
      // Handle login errors
    }
  };
};
```

### Protected Component

```typescript
import { useAuth } from '../contexts/AuthContext';

const ProtectedComponent = () => {
  const { user, isAuthenticated, logout, showExpiryWarning } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      <h1>Welcome, {user?.email}</h1>
      <p>Role: {user?.role}</p>
      {showExpiryWarning && (
        <div className="warning">Session expires soon!</div>
      )}
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

### Token Expiry Monitoring

```typescript
import { useAuth } from '../contexts/AuthContext';

const TokenInfo = () => {
  const { tokenExpiry, timeUntilExpiry, showExpiryWarning } = useAuth();
  
  return (
    <div>
      {tokenExpiry && (
        <p>Session expires: {tokenExpiry.toLocaleString()}</p>
      )}
      {timeUntilExpiry && (
        <p className={showExpiryWarning ? 'warning' : ''}>
          {Math.floor(timeUntilExpiry / (1000 * 60))} minutes remaining
        </p>
      )}
    </div>
  );
};
```

## Error Handling

The system includes comprehensive error handling:

- **Network errors**: Displayed to users with retry options
- **Authentication errors**: Automatic logout and redirect to login
- **Invalid tokens**: Automatic cleanup and re-authentication prompt
- **Expired tokens**: Automatic warnings and logout
- **Role validation**: Fallback UI for unknown roles
- **Token expiration**: Real-time monitoring and user notifications

## Configuration

### Backend URL

Update the backend URL in `src/services/api.ts`:

```typescript
private baseUrl = 'http://localhost:3000'; // Change as needed
```

### Token Expiration Settings

Adjust warning thresholds in `src/contexts/AuthContext.tsx`:

```typescript
// Show warning when token expires in less than 10 minutes
if (timeUntilExpiry < 10 * 60 * 1000) { // 10 minutes in milliseconds
  setShowExpiryWarning(true);
}

// Check every minute
const interval = setInterval(checkTokenExpiry, 60 * 1000);
```

### CORS

Ensure your backend allows requests from the frontend origin and includes the necessary CORS headers.

## Testing

To test the authentication system:

1. Start the backend server on `http://localhost:3000`
2. Use the test credentials: `test@example.com` / `password`
3. Verify role-based routing works correctly
4. Test session persistence by refreshing the page
5. Test logout functionality
6. Test token expiration handling (modify backend for testing)

## Troubleshooting

### Common Issues

- **CORS errors**: Check backend CORS configuration
- **Token not found**: Verify localStorage is enabled
- **Role not recognized**: Check role mapping in App.tsx
- **Login fails**: Verify backend endpoint is accessible
- **Token expires immediately**: Check backend token generation
- **Warnings not showing**: Verify token expiry calculation

### Debug Mode

Enable debug logging by checking the browser console for detailed error messages and API call logs.

### Token Expiration Debugging

- Check browser console for token expiry warnings
- Verify localStorage contains `access_token` and `token_expiry`
- Monitor network requests for 401 responses
- Check token payload in browser dev tools
