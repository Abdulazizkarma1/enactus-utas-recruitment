# Render Deployment Troubleshooting

## Common Errors and Solutions

### Error: "Cannot find module '/opt/render/project/src/index.js'"

**Problem**: Render is trying to run `node index.js` instead of using `npm start`.

**Solution**:
1. Go to your Render service settings
2. Under **"Start Command"**, make sure it's set to: `npm start`
3. **DO NOT** leave it as auto-detected or `node index.js`
4. Save and redeploy

**Root Directory Check**:
- Make sure **Root Directory** is set to: `server`
- NOT the root of the repository

**Correct Configuration**:
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `npm start` (explicitly set this)

### Error: "Cannot find module" or "Module not found"

**Possible Causes**:
1. Root directory not set correctly
2. Dependencies not installed
3. Wrong Node version

**Solutions**:
- Verify Root Directory is `server`
- Check Build Command includes `npm install`
- Ensure Node version is 18+ (specified in package.json)

### Error: "Port already in use" or Port Issues

**Solution**:
- Render automatically sets `PORT` environment variable
- Make sure your code uses `process.env.PORT || 5000`
- Don't hardcode port numbers

### Error: MongoDB Connection Failed

**Solutions**:
1. Check `MONGO_URI` is set correctly in Render environment variables
2. Verify MongoDB Atlas IP whitelist includes:
   - `0.0.0.0/0` (all IPs) OR
   - Render's IP ranges
3. Check connection string format (should include database name)

### Error: CORS Errors

**Solutions**:
1. Set `CORS_ORIGIN` environment variable in backend
2. Must match frontend URL exactly (including `https://`)
3. No trailing slash
4. Example: `https://enactus-frontend.onrender.com`

### Build Succeeds but Service Won't Start

**Check**:
1. Start command is `npm start` (not `node index.js`)
2. Root directory is `server`
3. `server.js` file exists in server directory
4. All dependencies are in `package.json`

### Frontend Build Fails

**Common Issues**:
1. Environment variables not set before build
2. Node version incompatible
3. Missing dependencies

**Solutions**:
- Set `VITE_API_URL` before first build
- Specify Node version in package.json (`"engines": { "node": ">=18.0.0" }`)
- Check build logs for specific errors

## Verification Checklist

Before deploying, verify:

- [ ] Root Directory: `server` (for backend)
- [ ] Root Directory: `client` (for frontend)
- [ ] Start Command: `npm start` (explicitly set, not auto)
- [ ] Build Command: `npm install` (for backend)
- [ ] Build Command: `npm install && npm run build` (for frontend)
- [ ] All environment variables set
- [ ] `server.js` exists in server directory
- [ ] `package.json` has correct `main` field (`server.js`)

## Quick Fix for Current Error

If you're seeing the "Cannot find module index.js" error:

1. Go to Render Dashboard → Your Service → Settings
2. Scroll to **"Start Command"**
3. Change it to: `npm start`
4. Make sure **Root Directory** is: `server`
5. Click **"Save Changes"**
6. Service will automatically redeploy

This should fix the issue immediately.


