# Fix: "Publish directory does not exist" on Render

## The Problem

Render says "publish directory does not exist" because the build is failing before creating the `dist` folder.

## Solution: Update Render Settings

### Step 1: Delete Current Static Site (if exists)

1. Go to Render Dashboard
2. Find your Static Site
3. Delete it (we'll recreate with correct settings)

### Step 2: Create New Static Site with EXACT Settings

1. Click **"New"** → **"Static Site"**
2. Connect your GitHub repository
3. Configure with these EXACT values:

```
Name: enactus-frontend
Root Directory: client
Build Command: npm ci && npm run build
Publish Directory: dist
Node Version: 18
```

**Important Notes:**
- Use `npm ci` instead of `npm install` (faster, more reliable)
- **Root Directory MUST be**: `client` (not empty, not root)
- **Publish Directory MUST be**: `dist` (lowercase, no trailing slash)
- **Node Version**: Explicitly set to `18` or `20`

### Step 3: Set Environment Variable BEFORE Creating

**CRITICAL**: Set the environment variable BEFORE clicking "Create Static Site"

1. In the environment variables section (before creating):
   - Key: `VITE_API_URL`
   - Value: `https://recruitment-enactusutas-6l8f.onrender.com`
   (Use your actual backend URL)

2. **Then** click "Create Static Site"

### Step 4: Verify Build

1. After creation, go to "Events" tab
2. Watch the build process
3. If it fails, check the logs for:
   - Missing dependencies
   - Environment variable errors
   - Node version issues

## Alternative Build Command

If `npm ci` doesn't work, try:

```
npm install --legacy-peer-deps && npm run build
```

Or the original:
```
npm install && npm run build
```

## Common Issues & Fixes

### Issue 1: Build Command Syntax
**Wrong:**
- `npm run build` (missing install)
- `cd client && npm install && npm run build` (wrong if root is `client`)

**Correct:**
- `npm ci && npm run build` (recommended)
- `npm install && npm run build` (alternative)

### Issue 2: Root Directory
**Wrong:**
- Empty (root of repo)
- `/client` (with slash)

**Correct:**
- `client` (just the folder name)

### Issue 3: Publish Directory
**Wrong:**
- `dist/` (with trailing slash)
- `./dist` (with dot-slash)
- `client/dist` (with parent folder)

**Correct:**
- `dist` (just the folder name)

### Issue 4: Environment Variable Timing
**Wrong:**
- Setting env var after build starts
- Setting env var after service is created

**Correct:**
- Set env var BEFORE creating the service
- Or set it and manually trigger rebuild

## Debugging Steps

1. **Check Build Logs**:
   - Go to Static Site → Events
   - Look for build step
   - Find the actual error message

2. **Test Build Locally**:
   ```bash
   cd client
   export VITE_API_URL=https://recruitment-enactusutas-6l8f.onrender.com
   npm ci
   npm run build
   ls -la dist  # Should show files
   ```

3. **Verify Package.json**:
   - Make sure all dependencies are listed
   - Check Node version requirement

4. **Check Node Version**:
   - Render might be using wrong Node version
   - Explicitly set to 18 in settings

## If Still Failing

Share the build log output from Render's Events tab. Look for:
- Error messages
- Missing module warnings
- Environment variable warnings
- Node version mismatches

The actual error in the logs will tell us exactly what's wrong.



