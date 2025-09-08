# Backend Setup Guide

## Current Issues & Fixes Applied

The frontend has been updated to fix the following issues:

### ✅ **Fixed Issues:**
1. **React Hooks order violation** - Fixed conditional hook calls in App.tsx
2. **API endpoint mismatch** - Frontend now uses correct `/auth/add_user` endpoints
3. **Response format handling** - Updated to handle backend response structure
4. **Cookie-based authentication** - Switched from localStorage to cookies for better security
5. **CORS credentials** - Added `credentials: 'include'` to all API calls

### 🔧 **Current Status:**
- **Frontend**: Ready and configured for backend integration
- **Backend**: Needs to be running on `http://localhost:3000`
- **Authentication**: JWT-based with cookie storage
- **Endpoints**: Properly configured for backend controller

## Required Backend Endpoints

Your backend should implement these endpoints (which it already does):

### 1. Authentication Endpoints
```
POST /auth/login - User login
POST /auth/logout - User logout  
GET  /auth/verify - Verify token
```

### 2. User Management Endpoints
```
POST /auth/add_user - Add new user
GET  /auth/add_user - Fetch all users
```

### 3. First Time Login Endpoints
```
POST /auth/check-email - Check if email exists in system
POST /auth/set-password - Set password for first time login
```

## Backend Server Requirements

### Port
- **Frontend expects backend on**: `http://localhost:3000`
- **If using different port**: Update `src/services/api.ts` line 30

### CORS Configuration
Your backend must allow requests from the frontend origin with credentials:

```typescript
// NestJS CORS configuration
app.enableCors({
  origin: 'http://localhost:5173', // Vite dev server
  credentials: true, // Important for cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

// Express CORS example
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### Expected Response Formats

#### Login Response ✅
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

#### Users Response ✅
```json
{
  "success": true,
  "message": "Users fetched successfully",
  "count": 1,
  "users": [
    {
      "id": "1",
      "name": "John Smith",
      "role": "eq",
      "ward": "Entebbe",
      "email": "john@example.com",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Add User Response ✅
```json
{
  "success": true,
  "message": "User added to registered_users successfully",
  "user": {
    "id": "2",
    "name": "Jane Doe",
    "role": "rs",
    "ward": "Kajjansi 1",
    "email": "jane@example.com",
    "created_at": "2024-01-15T00:00:00Z"
  }
}
```

#### Check Email Response ✅
```json
{
  "exists": true,
  "message": "Email found in system"
}
```

#### Set Password Response ✅
```json
{
  "success": true,
  "message": "Password set successfully",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "role": "eq",
    "ward": "Entebbe",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

## Frontend Changes Made

### 1. **Cookie-based Authentication**
- Replaced localStorage with secure cookies
- Added `credentials: 'include'` to all fetch calls
- Proper token expiration handling

### 2. **API Integration**
- Fixed endpoint URLs to match backend
- Proper response format handling
- Better error handling and user feedback

### 3. **User Experience**
- Connection status indicator
- Test connection button
- Success/error message display
- Loading states and retry mechanisms

## Testing Backend Connection

### 1. **Quick Test Script**
Run the included test script to verify backend connectivity:

```bash
node test-backend.js
```

### 2. **Manual Testing**
```bash
# Test if backend is running
curl http://localhost:3000/auth/login

# Test login endpoint
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Test users endpoint
curl http://localhost:3000/auth/add_user
```

### 3. **Browser Testing**
1. Open browser dev tools (F12)
2. Go to Network tab
3. Try to login or add a user
4. Check for CORS errors or connection issues

## Common Issues & Solutions

### Issue: "Failed to fetch" error
**Cause**: Backend server not running or wrong port
**Solution**: Start backend server on port 3000

### Issue: CORS error
**Cause**: Backend not configured to allow frontend origin with credentials
**Solution**: Update CORS configuration to include `credentials: true`

### Issue: 401 Unauthorized
**Cause**: JWT token not being sent or invalid
**Solution**: Check Authorization header format: `Bearer <token>`

### Issue: "Unexpected token '<'" error
**Cause**: Backend returning HTML instead of JSON
**Solution**: Check backend route implementation and CORS

### Issue: Login works but add_user fails
**Cause**: JWT token not being passed to protected endpoints
**Solution**: Verify token is being sent in Authorization header

## Quick Start Checklist

- [ ] **Backend server running** on `http://localhost:3000`
- [ ] **CORS configured** with `credentials: true`
- [ ] **JWT middleware** properly configured
- [ ] **All endpoints** implemented and responding
- [ ] **Frontend running** on `http://localhost:5173`
- [ ] **Test connection** using test script

## Development Tips

- **Check browser console** for detailed error messages
- **Use Network tab** to see actual API calls and responses
- **Verify CORS headers** in response
- **Test endpoints manually** before testing with frontend
- **Check backend logs** for incoming requests
- **Verify JWT token** format and expiration

## Need Help?

If you're still experiencing issues:

1. **Run the test script**: `node test-backend.js`
2. **Check backend logs** for errors
3. **Verify CORS configuration** includes credentials
4. **Test endpoints manually** with curl/Postman
5. **Check browser console** for JavaScript errors
6. **Verify JWT middleware** is working correctly

## Current Frontend Status

✅ **Ready for testing** with proper backend
✅ **All API endpoints** configured correctly  
✅ **Error handling** implemented
✅ **User feedback** provided
✅ **Connection testing** available
✅ **Cookie-based auth** implemented

The frontend is now properly configured and should work with your NestJS backend once CORS is configured correctly.
