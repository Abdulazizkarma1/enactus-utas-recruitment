# Debug: 404 Error on Login

## The Problem

Getting "Server error: 404" when trying to login means the request URL is wrong or the route doesn't exist.

## Quick Checks

### 1. Check API URL in Browser Console

1. Open your Vercel site
2. Press F12 → Console tab
3. Try logging in
4. Look for the log: `API URL: ...`
5. Verify it shows your Render backend URL (not localhost)

**Expected**: `https://recruitment-enactusutas-6l8f.onrender.com`
**Wrong**: `http://localhost:5000` (means env var not set)

### 2. Check Network Tab

1. Open DevTools → Network tab
2. Try logging in
3. Find the `/api/auth/login` request
4. Check the **Request URL**:
   - Should be: `https://your-backend.onrender.com/api/auth/login`
   - NOT: `https://your-backend.onrender.com//api/auth/login` (double slash)
   - NOT: `https://your-backend.onrender.com/api/auth/login/` (trailing slash)

### 3. Test Backend Endpoint Directly

Open in browser:
```
https://recruitment-enactusutas-6l8f.onrender.com/api/auth/login
```

**Expected**: Error about POST method required (means route exists)
**If 404**: Route not registered correctly

### 4. Verify Environment Variable in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Check `VITE_API_URL`:
   - Should be: `https://recruitment-enactusutas-6l8f.onrender.com`
   - NO trailing slash
   - Must include `https://`
3. **If you changed it**: You MUST redeploy frontend

## Common Issues

### Issue 1: Environment Variable Not Set
**Symptom**: API URL shows `http://localhost:5000` in console

**Fix**:
1. Set `VITE_API_URL` in Vercel
2. **Redeploy** frontend (critical - env vars are baked into build)

### Issue 2: Trailing Slash in API URL
**Symptom**: Request URL has double slash: `//api/auth/login`

**Fix**: 
- Remove trailing slash from `VITE_API_URL` in Vercel
- Should be: `https://backend.onrender.com` (no trailing slash)
- Redeploy frontend

### Issue 3: Wrong Backend URL
**Symptom**: 404 on correct route path

**Fix**:
- Verify backend URL is correct
- Test backend health endpoint first
- Check Render dashboard for actual service URL

### Issue 4: Route Not Registered
**Symptom**: Backend returns 404 even with correct URL

**Fix**:
- Check Render logs for errors
- Verify routes are loading correctly
- Check server.js has all route imports

## Quick Test

Run this in browser console on your Vercel site:

```javascript
// Check API URL
console.log('API URL:', import.meta.env.VITE_API_URL);

// Test backend connection
fetch('https://recruitment-enactusutas-6l8f.onrender.com/')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

This will show:
1. What API URL is being used
2. If backend is reachable

## Most Likely Fix

**The issue is usually**: Environment variable not set or not redeployed

1. Go to Vercel → Settings → Environment Variables
2. Set `VITE_API_URL` = `https://recruitment-enactusutas-6l8f.onrender.com`
3. **Redeploy** the frontend (go to Deployments → Redeploy)
4. Wait for deployment to complete
5. Try again

The environment variable must be set BEFORE building, and if you add it after, you must rebuild/redeploy.







