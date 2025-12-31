# Deployment Guide - Render

This guide will help you deploy the Enactus UTAS Recruitment application to production on Render.

## Prerequisites

- MongoDB Atlas account (or MongoDB instance)
- Render account
- Git repository

## Environment Variables

### Backend (Server) - Render Web Service

Set environment variables in Render dashboard:

```env
PORT=5000                    # Auto-set by Render, but can specify
NODE_ENV=production
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_random_jwt_secret
CORS_ORIGIN=https://your-frontend-service.onrender.com
```

### Frontend (Client) - Render Static Site

Set environment variables in Render dashboard:

```env
VITE_API_URL=https://your-backend-service.onrender.com
```

## Backend Deployment (Render Web Service)

1. **Connect Repository**
   - Go to Render dashboard
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - **Name**: `enactus-backend` (or your preferred name)
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Choose appropriate plan (Free tier available)

3. **Set Environment Variables**
   - Add all environment variables from the Backend section above
   - Make sure `MONGO_URI` and `JWT_SECRET` are set correctly
   - **Important**: Set `CORS_ORIGIN` to your frontend Render URL (you'll update this after frontend deployment)

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note the service URL (e.g., `https://enactus-backend.onrender.com`)

## Frontend Deployment (Render Static Site)

1. **Connect Repository**
   - Go to Render dashboard
   - Click "New" → "Static Site"
   - Connect your GitHub repository

2. **Configure Static Site**
   - **Name**: `enactus-frontend` (or your preferred name)
   - **Root Directory**: `client` (exactly this, no slash, no path)
   - **Build Command**: `npm ci && npm run build` (or `npm install && npm run build`)
   - **Publish Directory**: `dist` (exactly this, lowercase, no slash)
   - **Node Version**: `18` (explicitly set in Render settings)

3. **Set Environment Variables**
   - Add `VITE_API_URL` with your Render backend URL
   - Example: `VITE_API_URL=https://enactus-backend.onrender.com`
   - **Important**: Environment variables must be set before the first build

4. **Deploy**
   - Click "Create Static Site"
   - Wait for build and deployment to complete
   - Your app will be live at `https://your-frontend-service.onrender.com`

5. **Update Backend CORS**
   - Go back to your backend service settings
   - Update `CORS_ORIGIN` environment variable to match your frontend URL
   - Redeploy the backend service

## Post-Deployment Steps

### 1. Create Admin Account

After deployment, create an admin account. You have two options:

**Option A: Using Render Shell (Recommended)**
1. Go to your backend service in Render
2. Click on "Shell" tab
3. Run:
```bash
cd server
npm run create-admin
```

**Option B: Using Local Machine**
1. Clone your repository locally
2. Set up `.env` file with production MongoDB URI
3. Run:
```bash
cd server
npm run create-admin
```

**Option C: Manual MongoDB Creation**
Manually create an admin user in MongoDB with:
- `role: 'admin'`
- Valid `studentId` and `email`
- Hashed `password` (use bcrypt)

### 2. Verify CORS Configuration

Ensure `CORS_ORIGIN` in backend matches your frontend URL exactly (including `https://`)

### 3. Test the Application

1. Visit your Render frontend URL
2. Test registration with a voucher
3. Test login functionality
4. Test application submission
5. Test admin dashboard (if applicable)
6. Verify file uploads work (profile pic, CV)

## Important Notes

- **Never commit `.env` files** - They are in `.gitignore`
- **Use strong JWT secrets** in production (at least 32 characters)
- **MongoDB Atlas** is recommended for production database
- **File uploads** are stored in `server/uploads/` - ensure this directory exists
- **CORS** must be configured correctly for frontend-backend communication
- **Render Free Tier**: Services may spin down after inactivity. First request may be slow.
- **Environment Variables**: Must be set before building frontend (Vite bakes them into build)

## Render-Specific Considerations

### Free Tier Limitations
- Services may spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- Consider upgrading to paid plan for production use

### Build Configuration
- Frontend builds on Render's servers
- Environment variables are available during build
- Build artifacts are served as static files

### Backend Configuration
- Render automatically sets `PORT` environment variable
- Don't hardcode port numbers
- Health checks are automatic

## Troubleshooting

### Backend Issues

- **MongoDB Connection Error**: 
  - Check `MONGO_URI` is correct
  - Verify MongoDB Atlas IP whitelist includes Render IPs (or allow all IPs)
  - Check MongoDB connection string format

- **CORS Errors**: 
  - Verify `CORS_ORIGIN` matches your frontend URL exactly
  - Include `https://` protocol
  - No trailing slash

- **Port Issues**: 
  - Render automatically sets `PORT`, don't hardcode it
  - Use `process.env.PORT || 5000` in code

- **Service Won't Start**:
  - Check build logs for errors
  - Verify `npm start` command works locally
  - Check Node version compatibility

### Frontend Issues

- **API Connection Errors**: 
  - Verify `VITE_API_URL` is set correctly in Render
  - Check backend service is running
  - Verify CORS is configured correctly

- **Build Errors**: 
  - Check Node version (specify in package.json or Render settings)
  - Check build logs for specific errors
  - Verify all dependencies are in package.json

- **Environment Variables Not Working**:
  - Vite requires `VITE_` prefix
  - Variables must be set before first build
  - Rebuild after changing environment variables

- **404 Errors on Routes**:
  - Render static sites need redirect configuration
  - Add `_redirects` file in `client/public/` (see below)

### Static Site Routing

For React Router to work on Render static sites, create `client/public/_redirects`:

```
/*    /index.html   200
```

This ensures all routes are handled by React Router.

## Security Checklist

- [ ] Strong JWT secret set (32+ characters)
- [ ] MongoDB connection string secured
- [ ] CORS origin restricted to frontend domain
- [ ] No test/admin creation endpoints exposed
- [ ] Environment variables not committed to git
- [ ] HTTPS enabled (automatic on Render)
- [ ] MongoDB Atlas IP whitelist configured
- [ ] File upload limits enforced

## Support

For issues or questions, refer to:
- Render Documentation: https://render.com/docs
- Render Static Sites: https://render.com/docs/static-sites
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
