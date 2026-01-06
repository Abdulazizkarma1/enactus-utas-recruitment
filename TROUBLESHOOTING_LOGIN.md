# Troubleshooting Login Error

## Error: "Error logging in" or "Cannot connect to server"

This error usually means the frontend cannot reach the backend API. Here's how to fix it:

## Step 1: Check Environment Variable in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify `VITE_API_URL` is set to your Render backend URL
3. Example: `https://recruitment-enactusutas-6l8f.onrender.com`
4. **Important**: If you changed this, you need to **redeploy** the frontend

## Step 2: Verify Backend is Running

1. Open your backend URL in browser:
   - Example: `https://recruitment-enactusutas-6l8f.onrender.com`
2. You should see: `{"message":"Enactus UTAS Recruitment API is running","status":"ok",...}`
3. If you see 404 or error, backend is not running correctly

## Step 3: Check CORS Configuration

1. Go to Render Dashboard → Your Backend Service → Environment
2. Check `CORS_ORIGIN` value
3. It should match your Vercel URL exactly:
   - Example: `https://your-project.vercel.app`
   - Must include `https://`
   - No trailing slash
4. If wrong, update it and save (will trigger redeploy)

## Step 4: Test API Endpoint Directly

1. Open browser console (F12)
2. Try this in console:
   ```javascript
   fetch('https://your-backend-url.onrender.com/api/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ studentId: 'test', password: 'test' })
   })
   .then(r => r.json())
   .then(console.log)
   .catch(console.error)
   ```
3. Check the error message - it will tell you if it's CORS, network, or server error

## Step 5: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try logging in
4. Look for:
   - CORS errors (red text about CORS policy)
   - Network errors (failed to fetch)
   - API URL logged (check if it's correct)

## Common Issues & Fixes

### Issue 1: CORS Error
**Error in console**: "Access to fetch at ... has been blocked by CORS policy"

**Fix**:
- Update `CORS_ORIGIN` in Render backend to match Vercel URL exactly
- Make sure it includes `https://`
- No trailing slash
- Save and wait for redeploy

### Issue 2: Network Error
**Error in console**: "Failed to fetch" or "Network Error"

**Possible causes**:
- Backend is down (check Render dashboard)
- Wrong API URL in Vercel environment variable
- Backend URL has changed

**Fix**:
- Verify backend is running on Render
- Check `VITE_API_URL` in Vercel matches backend URL
- Redeploy frontend if you changed the env var

### Issue 3: 404 Error
**Error**: "404 Not Found" or "Cannot POST /api/auth/login"

**Fix**:
- Verify backend routes are working
- Check backend URL is correct
- Test backend health endpoint first

### Issue 4: Environment Variable Not Set
**Error**: API URL is `http://localhost:5000` in console

**Fix**:
- Set `VITE_API_URL` in Vercel
- **Redeploy** frontend (env vars are baked into build)
- Check Vercel build logs to verify env var was available during build

## Quick Debug Steps

1. **Check API URL in browser console**:
   - After login attempt, check console
   - Look for "API URL:" log
   - Verify it's your Render backend URL, not localhost

2. **Check Network tab**:
   - Open DevTools → Network tab
   - Try logging in
   - Look for the login request
   - Check:
     - Request URL (should be your backend)
     - Status code (200 = success, 4xx/5xx = error)
     - Response (shows actual error message)

3. **Test backend directly**:
   - Visit: `https://your-backend.onrender.com/api/auth/login`
   - Should get error (needs POST with body), but confirms backend is reachable

## Still Not Working?

Share these details:
1. Error message from browser console
2. Network tab request details (status, response)
3. Your Vercel URL
4. Your Render backend URL
5. CORS_ORIGIN value in Render

This will help identify the exact issue.







