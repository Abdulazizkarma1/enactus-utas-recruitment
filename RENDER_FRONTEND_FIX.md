# Fix for Frontend Build Error on Render

## Error: "Publish directory npm run build does not exist!"

This error means the build is failing before creating the `dist` directory.

## Common Causes & Solutions

### 1. Build Command Issue

**Problem**: The build command might be failing silently.

**Solution**: Make sure your build command in Render is exactly:
```
npm install && npm run build
```

**NOT**:
- `npm run build` (missing install)
- `npm install; npm run build` (wrong separator)
- `cd client && npm install && npm run build` (wrong if root directory is already set)

### 2. Environment Variable Missing

**Problem**: `VITE_API_URL` might not be set, causing build to fail.

**Solution**: 
1. Go to your Static Site settings in Render
2. Add environment variable:
   - Key: `VITE_API_URL`
   - Value: `https://your-backend-url.onrender.com`
3. **Important**: Set this BEFORE building
4. If already built, delete and recreate the service with the env var set

### 3. Node Version Issue

**Problem**: Wrong Node version might cause build failures.

**Solution**:
1. In Render Static Site settings, check "Node Version"
2. Set it to `18` or `20`
3. Or add to `client/package.json`:
   ```json
   "engines": {
     "node": ">=18.0.0"
   }
   ```

### 4. Root Directory Issue

**Problem**: Root directory not set correctly.

**Solution**: 
- Make sure **Root Directory** is set to: `client`
- NOT the root of the repository

### 5. Build Logs Check

**To Debug**:
1. Go to your Static Site in Render
2. Click on "Events" or "Logs" tab
3. Check the build logs for specific errors
4. Look for:
   - Module not found errors
   - Environment variable errors
   - Node version mismatches
   - Missing dependencies

## Step-by-Step Fix

1. **Delete the current Static Site** (if it exists and is failing)

2. **Create New Static Site** with these exact settings:
   - **Name**: `enactus-frontend`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Node Version**: `18` or `20`

3. **Set Environment Variable FIRST** (before creating):
   - Key: `VITE_API_URL`
   - Value: Your backend URL (e.g., `https://recruitment-enactusutas-6l8f.onrender.com`)

4. **Create the service**

5. **Check build logs** - if it still fails, the logs will show the exact error

## Alternative: Manual Build Check

If you want to test the build locally first:

```bash
cd client
export VITE_API_URL=https://your-backend-url.onrender.com
npm install
npm run build
ls -la dist  # Should show dist directory with files
```

If this works locally but fails on Render, check:
- Node version matches
- All dependencies are in package.json (not just package-lock.json)
- No platform-specific dependencies

## Correct Render Configuration

**Static Site Settings:**
```
Name: enactus-frontend
Root Directory: client
Build Command: npm install && npm run build
Publish Directory: dist
Node Version: 18 (or 20)
```

**Environment Variables:**
```
VITE_API_URL=https://recruitment-enactusutas-6l8f.onrender.com
```

## Still Not Working?

Check the build logs in Render and look for:
- Any error messages
- Missing modules
- Environment variable warnings
- Node version mismatches

Share the build log output for further debugging.



