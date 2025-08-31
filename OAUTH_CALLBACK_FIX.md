# Fix OAuth Callback Error - Step by Step Guide

## 🚨 The Issue
You're getting `error=Callback` which means Google OAuth authentication is failing during the callback process.

## 🔧 **IMMEDIATE FIXES NEEDED:**

### 1. **Check Google Cloud Console Configuration**

Go to [Google Cloud Console](https://console.cloud.google.com/):

1. **Navigate to APIs & Services → Credentials**
2. **Find your OAuth 2.0 Client ID:** `1084811699535-geqmd5tus8ar2r6j424763s25ihmn17u.apps.googleusercontent.com`
3. **Check Authorized redirect URIs** - Make sure you have EXACTLY these:
   ```
   https://kamwale-tlbc.vercel.app/api/auth/callback/google
   http://localhost:3000/api/auth/callback/google
   ```

### 2. **Verify Vercel Environment Variables**

In your Vercel dashboard, make sure these are set:
```
NEXTAUTH_SECRET=emb8P3Qt25LjhRgPWK9UvhVQVk+Qv6mkRAF9LLMkQa0=
NEXTAUTH_URL=https://kamwale-tlbc.vercel.app
GOOGLE_CLIENT_ID=1084811699535-geqmd5tus8ar2r6j424763s25ihmn17u.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
DATABASE_URL=postgresql://postgres:deepak8273243959@db.rxmzpmwjyfsslcrxunzf.supabase.co:5432/postgres
```

### 3. **Test API Endpoints**

After deployment, test these URLs:
- ✅ `https://kamwale-tlbc.vercel.app/api/auth/providers` - Should show Google provider
- ✅ `https://kamwale-tlbc.vercel.app/api/auth/csrf` - Should return CSRF token

## 🛠️ **DETAILED TROUBLESHOOTING:**

### **Step 1: Verify Google OAuth App Status**
1. In Google Cloud Console → OAuth consent screen
2. Make sure your app is **Published** (not in Testing mode)
3. If in Testing mode, add your email to test users

### **Step 2: Check Domain Verification**
1. In Google Cloud Console → Domain verification
2. Verify that `kamwale-tlbc.vercel.app` is authorized
3. If not, add it to authorized domains

### **Step 3: Environment Variable Debug**
Run these checks in Vercel Functions logs:
- Check if `NEXTAUTH_URL` matches your domain exactly
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct

### **Step 4: Common Callback Error Causes**

| Error | Cause | Fix |
|-------|-------|-----|
| `error=Callback` | Redirect URI mismatch | Add exact callback URL to Google Console |
| `error=OAuthSignin` | Invalid client credentials | Verify Client ID/Secret in Vercel |
| `error=OAuthCallback` | OAuth app not published | Publish app in Google Cloud Console |

## 🔍 **DEBUGGING STEPS:**

### **Test 1: Check Redirect URI**
Visit this URL (replace with your actual client ID):
```
https://accounts.google.com/o/oauth2/v2/auth?client_id=1084811699535-geqmd5tus8ar2r6j424763s25ihmn17u.apps.googleusercontent.com&redirect_uri=https://kamwale-tlbc.vercel.app/api/auth/callback/google&response_type=code&scope=openid%20email%20profile
```

### **Test 2: Verify API Response**
```bash
curl https://kamwale-tlbc.vercel.app/api/auth/providers
```
Should return:
```json
{
  "google": {
    "id": "google",
    "name": "Google",
    "type": "oauth",
    "signinUrl": "...",
    "callbackUrl": "..."
  }
}
```

## 🚀 **QUICK FIX STEPS:**

1. **Double-check Google Cloud Console:**
   - Authorized redirect URIs include: `https://kamwale-tlbc.vercel.app/api/auth/callback/google`
   - OAuth consent screen is published
   - App domain is verified

2. **Verify Vercel Settings:**
   - Environment variables are set correctly
   - `NEXTAUTH_URL` matches your domain exactly
   - Latest deployment is active

3. **Test Authentication:**
   - Clear browser cache and cookies
   - Try signing in again
   - Check browser developer tools for any errors

## 🔧 **IF STILL FAILING:**

### **Option 1: Create New Google OAuth App**
1. Create a new OAuth 2.0 Client ID in Google Cloud Console
2. Use the new credentials in Vercel environment variables
3. Test with the new setup

### **Option 2: Temporary Database-Free Mode**
The auth system now works without database. If database connection is causing issues:
1. Temporarily remove `DATABASE_URL` from Vercel
2. Test authentication (will use JWT-only mode)
3. Add database back once OAuth is working

## 📞 **Support Checklist:**

Before asking for help, verify:
- [ ] Google OAuth redirect URI is exactly: `https://kamwale-tlbc.vercel.app/api/auth/callback/google`
- [ ] All environment variables are set in Vercel
- [ ] Latest code is deployed to Vercel
- [ ] Google OAuth app is published (not in testing mode)
- [ ] No typos in Client ID or Client Secret

## 🎯 **Expected Flow:**
1. User clicks "Sign in with Google"
2. Redirected to Google OAuth
3. User grants permission
4. Google redirects to: `https://kamwale-tlbc.vercel.app/api/auth/callback/google?code=...`
5. NextAuth processes the callback
6. User is signed in and redirected to dashboard

If any step fails, you'll get the callback error. The fixes above address each potential failure point.
