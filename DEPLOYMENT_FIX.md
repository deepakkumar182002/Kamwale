# Deployment Guide for Kamwale

## Quick Fix for OAuth Callback Error

The OAuth callback error you're experiencing is likely due to one of these issues:

### 1. Environment Variables in Vercel

Make sure these environment variables are set in your Vercel dashboard:

```
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://your-app-name.vercel.app
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
DATABASE_URL=your_postgresql_connection_string_here
UPLOADTHING_SECRET=your_uploadthing_secret_here
UPLOADTHING_APP_ID=your_uploadthing_app_id_here
```

### 2. Google Cloud Console Configuration

In your Google Cloud Console (https://console.cloud.google.com/):

1. Go to **APIs & Services** → **Credentials**
2. Find your OAuth 2.0 Client ID
3. Add these **Authorized redirect URIs**:
   ```
   https://your-app-name.vercel.app/api/auth/callback/google
   http://localhost:3000/api/auth/callback/google
   ```

### 3. Steps to Fix

1. **Update Environment Variables in Vercel:**
   - Go to https://vercel.com/dashboard
   - Select your project
   - Go to **Settings** → **Environment Variables**
   - Update `NEXTAUTH_URL` to: `https://your-app-name.vercel.app`
   - Ensure all other variables match your .env file

2. **Redeploy:**
   - After updating environment variables, redeploy your project
   - You can trigger a redeploy by pushing a small change or using Vercel dashboard

3. **Test the Authentication:**
   - Visit: `https://your-app-name.vercel.app/api/auth/providers`
   - This should return a JSON response with your providers

### 4. Debugging Steps

If the issue persists:

1. **Check Vercel Function Logs:**
   - Go to Vercel dashboard → Your project → Functions tab
   - Look for any error messages in the logs

2. **Test Database Connection:**
   - The app now gracefully handles database connection issues
   - Authentication will work even if the database is temporarily unavailable

3. **Verify Google OAuth Setup:**
   - Make sure your Google OAuth app is published (not in testing mode)
   - Verify the client ID and secret are correct

### 5. Fallback Mode

The updated authentication configuration includes:

- **Graceful database error handling** - app works even if DB is down
- **Better error logging** - easier to debug issues
- **Automatic user creation** - creates users on first Google sign-in
- **Improved session management** - more reliable authentication state

### 6. Common Issues and Solutions

**Issue: "error=Callback"**
- Solution: Check Google OAuth redirect URIs and NEXTAUTH_URL

**Issue: Database connection errors**
- Solution: The app now works without database (uses JWT sessions)

**Issue: "error=Configuration"**
- Solution: Verify all environment variables are set correctly in Vercel

**Issue: "error=AccessDenied"**
- Solution: Check Google OAuth app configuration and approval status

### 7. Testing Locally

To test the fix locally:

```bash
npm run dev
```

Then visit: http://localhost:3000/signin

### 8. Production Checklist

- [ ] Environment variables set in Vercel
- [ ] Google OAuth redirect URIs updated
- [ ] NEXTAUTH_URL points to production domain
- [ ] Project redeployed after environment variable changes
- [ ] Database connection string is correct (if using database features)

The authentication system is now more robust and should handle various deployment scenarios gracefully.
