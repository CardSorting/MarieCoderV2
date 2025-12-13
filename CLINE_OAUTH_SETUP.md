# Cline OAuth Authentication Setup

The authentication system has been updated to use Cline's OAuth flow, which provides access to Cline's free AI models.

## How It Works

1. **User clicks "Sign in with Cline"** on the login page
2. **Backend requests auth URL** from Cline API (`/api/v1/auth/authorize`)
3. **User is redirected** to Cline's OAuth provider (Google, GitHub, etc.)
4. **User authenticates** with the OAuth provider
5. **OAuth provider redirects back** with authorization code
6. **Backend exchanges code** for access and refresh tokens
7. **Tokens are stored** and used for API requests
8. **Access token** is used to access Cline's free models

## Backend Changes

### New Service: `cline-auth-service.ts`
- Handles OAuth flow with Cline API
- Exchanges authorization codes for tokens
- Refreshes expired tokens
- Verifies tokens and gets user info

### Updated Auth Routes: `api/routes/auth.ts`
- `GET /api/v1/auth/authorize` - Get OAuth authorization URL
- `GET /api/v1/auth/callback` - OAuth callback handler
- `POST /api/v1/auth/token` - Exchange code for tokens
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user (uses Cline token)

### Updated Auth Middleware: `api/middleware/auth.ts`
- Verifies Cline access tokens instead of JWT
- Gets user info from Cline API
- Stores Cline token in request context

### Updated Provider Config: `services/provider-config.ts`
- CLINE provider now uses user's access token
- Token is prefixed with `workos:` for backend routing

## Frontend Changes

### Updated Login Page
- Removed username/password form
- Added "Sign in with Cline" button
- Initiates OAuth flow

### New Auth Callback Page
- Handles OAuth callback
- Stores tokens from URL parameters
- Redirects to projects page

### Updated Auth Store
- Stores Cline access and refresh tokens
- Handles token refresh
- Removed username/password login/register

### Updated API Client
- Uses Cline tokens instead of JWT
- Handles token refresh on 401 errors

## Environment Variables

No longer needed:
- `JWT_SECRET` (removed - using Cline tokens)

Optional:
- `CLINE_API_BASE_URL` - Defaults to `https://api.cline.bot`
- `FRONTEND_URL` - For OAuth callback redirects (defaults to `http://localhost:5173`)

## Testing

1. Start backend: `cd cline-backend-mvp && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Open http://localhost:5173
4. Click "Sign in with Cline"
5. Complete OAuth flow
6. You'll be redirected back and logged in

## Token Storage

- **Access Token**: Stored in `localStorage` as `cline_access_token`
- **Refresh Token**: Stored in `localStorage` as `cline_refresh_token`
- **User Info**: Fetched from Cline API on each request

## Benefits

✅ Access to Cline's free AI models
✅ No need to manage user accounts
✅ Secure OAuth flow
✅ Automatic token refresh
✅ Organization support (from Cline)

## Notes

- The old JWT-based auth is removed
- User database is still used for project ownership
- Cline tokens are used for all API authentication
- Tasks automatically use CLINE provider with user's token

