# Quick Start: Deploy Frontend to Vercel

This is a quick reference guide for deploying the frontend to Vercel (backend stays on Render).

## Step 1: Deploy Backend on Render (If Not Done)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `enactus-backend`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Set Environment Variables:
   ```
   NODE_ENV=production
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_strong_random_secret
   CORS_ORIGIN=https://your-project.vercel.app
   ```
   (Update CORS_ORIGIN after Vercel deployment)
6. Note the backend URL (e.g., `https://enactus-backend.onrender.com`)

## Step 2: Deploy Frontend on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. **Configure Project**:
   - **Framework Preset**: Vite (should auto-detect)
   - **Root Directory**: `client` ⚠️ **IMPORTANT: Set this explicitly**
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
5. **Set Environment Variable** (BEFORE deploying):
   - Click "Environment Variables"
   - Add:
     - **Key**: `VITE_API_URL`
     - **Value**: Your Render backend URL
     - Example: `https://enactus-backend.onrender.com`
6. Click **"Deploy"**
7. Wait for deployment
8. Note your Vercel URL (e.g., `https://your-project.vercel.app`)

## Step 3: Update Backend CORS

1. Go back to Render Dashboard → Your Backend Service
2. Go to **Environment** tab
3. Update `CORS_ORIGIN` to your Vercel URL:
   ```
   CORS_ORIGIN=https://your-project.vercel.app
   ```
4. Save (will trigger redeploy)

## Step 4: Create Admin Account

1. Go to Render Dashboard → Your Backend Service
2. Click **"Shell"** tab
3. Run:
   ```bash
   cd server
   npm run create-admin
   ```
4. Note the admin credentials

## Step 5: Test

1. Visit your Vercel URL
2. Test registration, login, and application submission
3. Test admin dashboard

## Important Notes

- **Root Directory**: Must be set to `client` in Vercel
- **Environment Variables**: Set `VITE_API_URL` BEFORE first deploy
- **CORS**: Must match Vercel URL exactly (including `https://`)
- **MongoDB**: Whitelist all IPs (0.0.0.0/0) or Vercel IPs

## Troubleshooting

### Build Fails
- Check Root Directory is `client`
- Verify environment variables are set
- Check build logs in Vercel dashboard

### API Connection Errors
- Verify `VITE_API_URL` is correct
- Check backend is running on Render
- Verify CORS_ORIGIN matches Vercel URL exactly

### 404 on Routes
- Vercel handles this automatically
- Check `vercel.json` exists in root
- Verify React Router configuration

For detailed information, see [DEPLOYMENT.md](./DEPLOYMENT.md)




