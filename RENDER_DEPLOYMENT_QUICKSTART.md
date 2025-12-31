# Quick Start: Deploy to Render

This is a quick reference guide for deploying both services to Render.

## Step 1: Deploy Backend

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
   CORS_ORIGIN=https://enactus-frontend.onrender.com
   ```
   (Update CORS_ORIGIN after frontend deployment)
6. Click **"Create Web Service"**
7. Wait for deployment and note the URL (e.g., `https://enactus-backend.onrender.com`)

## Step 2: Deploy Frontend

1. In Render Dashboard, click **"New"** → **"Static Site"**
2. Connect the same GitHub repository
3. Configure:
   - **Name**: `enactus-frontend`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Set Environment Variable:
   ```
   VITE_API_URL=https://enactus-backend.onrender.com
   ```
   (Use your actual backend URL from Step 1)
5. Click **"Create Static Site"**
6. Wait for deployment and note the URL (e.g., `https://enactus-frontend.onrender.com`)

## Step 3: Update Backend CORS

1. Go back to your backend service
2. Update the `CORS_ORIGIN` environment variable to match your frontend URL
3. Save changes (this will trigger a redeploy)

## Step 4: Create Admin Account

1. Go to your backend service in Render
2. Click on **"Shell"** tab
3. Run:
   ```bash
   cd server
   npm run create-admin
   ```
4. Note the admin credentials displayed

## Step 5: Test

1. Visit your frontend URL
2. Test registration, login, and application submission
3. Test admin dashboard with admin credentials

## Important Notes

- **MongoDB Atlas**: Make sure your MongoDB Atlas IP whitelist allows all IPs (0.0.0.0/0) or includes Render's IP ranges
- **Free Tier**: Services may spin down after inactivity. First request may be slow.
- **Environment Variables**: Must be set before building (especially for frontend)
- **CORS**: Must match exactly (including https://)

## Troubleshooting

- **Build fails**: Check Node version (should be 18+)
- **CORS errors**: Verify CORS_ORIGIN matches frontend URL exactly
- **MongoDB connection**: Check connection string and IP whitelist
- **404 on routes**: Ensure `_redirects` file exists in `client/public/`

For detailed information, see [DEPLOYMENT.md](./DEPLOYMENT.md)

