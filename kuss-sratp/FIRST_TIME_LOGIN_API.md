# First Time Login API Endpoints

## Overview

The frontend now includes a "First time Login?" feature that allows new users to set up their passwords. This requires two new backend endpoints to be implemented.

**⚠️ IMPORTANT**: These endpoints should be **PUBLIC** (no authentication required) since users don't have passwords yet.

## Required Backend Endpoints

### 1. Check Email Endpoint

**Endpoint**: `POST /auth/check-email`

**Purpose**: Verify if an email exists in the registered_users table before allowing password setup

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Expected Response**:
```json
{
  "exists": true,
  "message": "Email found in system"
}
```

**Error Response**:
```json
{
  "exists": false,
  "message": "Email not found in system"
}
```

**Backend Implementation** (NestJS):
```typescript
@Post('check-email')
async checkEmail(@Body() body: { email: string }) {
  try {
    // Check if email exists in registered_users table
    const user = await this.supabaseService
      .getDatabase()
      .from('registered_users')
      .select('email')
      .eq('email', body.email)
      .single();
    
    if (user) {
      return {
        exists: true,
        message: 'Email found in system'
      };
    } else {
      return {
        exists: false,
        message: 'Email not found in system'
      };
    }
  } catch (error) {
    return {
      exists: false,
      message: 'Error checking email'
    };
  }
}
```

### 2. Set Password Endpoint

**Endpoint**: `POST /auth/set-password`

**Purpose**: Allow users to set their password in a table called `verify_user` for the first time after confirming email exists. The email from the `registered_users` table is used as a foreign key here. Once password is set, they can now login.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "newPassword123"
}
```

**Expected Response**:
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

**Error Response**:
```json
{
  "success": false,
  "message": "Failed to set password",
  "error": "User not found"
}
```

**Backend Implementation** (NestJS):
```typescript
@Post('set-password')
async setPassword(@Body() body: { email: string; password: string }) {
  try {
    // First verify email exists in registered_users table
    const { data: user, error: userError } = await this.supabaseService
      .getDatabase()
      .from('registered_users')
      .select('id, email, role, ward, created_at')
      .eq('email', body.email)
      .single();
    
    if (userError || !user) {
      return {
        success: false,
        message: 'User not found in registered_users table'
      };
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(body.password, 10);
    
    // Insert or update password in verify_user table
    const { data: verifyUser, error: verifyError } = await this.supabaseService
      .getDatabase()
      .from('verify_user')
      .upsert({
        email: body.email,
        password_hash: hashedPassword,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'email'
      })
      .select()
      .single();

    if (verifyError) {
      return {
        success: false,
        message: 'Failed to save password',
        error: verifyError.message
      };
    }
    
    return {
      success: true,
      message: 'Password set successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        ward: user.ward,
        created_at: user.created_at
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to set password',
      error: error.message
    };
  }
}
```

## Frontend Flow

### Step 1: User clicks "First time Login?"
- Modal opens with email input field
- User enters their email address
- Frontend calls `POST /auth/check-email`

### Step 2: Email verification
- If email exists: Show password setup form
- If email doesn't exist: Show error message

### Step 3: Password setup
- User enters new password and confirmation
- Frontend validates password requirements
- Frontend calls `POST /auth/set-password`

### Step 4: Auto-login
- If password setup successful: Auto-login user
- User is redirected to their dashboard

## Security Considerations

### 1. **Password Requirements**
- Minimum 6 characters
- Frontend validation before submission
- Backend should also validate

### 2. **Rate Limiting**
- Apply rate limiting to prevent abuse
- Limit password setup attempts per email

### 3. **Email Verification**
- Only allow password setup for verified emails
- Consider adding email verification step

### 4. **Password Hashing**
- Always hash passwords before storing
- Use bcrypt or similar secure hashing

## Database Schema Updates

Based on your setup, you'll need a `verify_user` table to store passwords separately from the `registered_users` table:

```sql
-- Create verify_user table for password storage
CREATE TABLE verify_user (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key reference to registered_users table
  FOREIGN KEY (email) REFERENCES registered_users(email)
);

-- Alternative: If you want to add password to existing table
-- ALTER TABLE registered_users ADD COLUMN password_hash VARCHAR(255);
```

**Note**: The `verify_user` table uses email as a foreign key to link with the `registered_users` table.

```sql
-- Add password field to existing user table
ALTER TABLE registered_users ADD COLUMN password_hash VARCHAR(255);

-- Or if using a separate auth table
CREATE TABLE user_auth (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES registered_users(id),
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Testing

### Test the endpoints manually:

```bash
# Test email check
curl -X POST http://localhost:3000/auth/check-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Test password setup
curl -X POST http://localhost:3000/auth/set-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"newPassword123"}'
```

### Test the complete flow:
1. Click "First time Login?" on frontend
2. Enter existing email
3. Set new password
4. Verify auto-login works

## Error Handling

### Common Error Scenarios:
- **Email not found**: User needs to contact administrator
- **Password too weak**: Frontend validation prevents submission
- **Database errors**: Backend should return meaningful error messages
- **Network errors**: Frontend shows retry options

### User Experience:
- Clear error messages
- Loading states during API calls
- Success feedback
- Smooth transitions between steps

## Integration with Existing Auth

### 1. **Login Flow**
- Existing login should work with new passwords
- Password field should be required for all users

### 2. **Password Reset**
- Consider adding password reset functionality
- Similar flow but with email verification

### 3. **User Management**
- Admins can still manage users
- Passwords are securely hashed

## Next Steps

1. **Implement backend endpoints** in your NestJS controller
2. **Make endpoints PUBLIC** (no @UseGuards decorator)
3. **Update database schema** to include verify_user table
4. **Test endpoints** with curl/Postman
5. **Test frontend flow** with real users
6. **Add password reset functionality** (optional enhancement)

## Important Backend Notes

### Make Endpoints Public
These endpoints should NOT have the `@UseGuards(JwtAuthGuard)` decorator since users don't have passwords yet:

```typescript
// ✅ CORRECT - Public endpoint
@Post('check-email')
async checkEmail(@Body() body: { email: string }) {
  // ... implementation
}

// ✅ CORRECT - Public endpoint  
@Post('set-password')
async setPassword(@Body() body: { email: string; password: string }) {
  // ... implementation
}

// ❌ WRONG - Don't add guards
@UseGuards(JwtAuthGuard)  // Remove this!
@Post('check-email')
async checkEmail(@Body() body: { email: string }) {
  // ... implementation
}
```

The frontend is ready and will work once these backend endpoints are implemented! 🎉
