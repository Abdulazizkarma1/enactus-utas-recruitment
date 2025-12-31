# Deployment Guide - Render (Backend) + Vercel (Frontend)

This guide will help you deploy the Enactus UTAS Recruitment application to production.

## Prerequisites

- MongoDB Atlas account (or MongoDB instance)
- Render account (for backend)
- Vercel account (for frontend)
- Git repository

## Environment Variables

### Backend (Server) - Render Web Service

Set environment variables in Render dashboard:

```env
PORT=5000                    # Auto-set by Render, but can specify
NODE_ENV=production
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_random_jwt_secret
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### Frontend (Client) - Vercel

Set environment variables in Vercel dashboard:

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
   - **Important**: Set `CORS_ORIGIN` to your Vercel frontend URL (you'll update this after frontend deployment)

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note the service URL (e.g., `https://enactus-backend.onrender.com`)

## Frontend Deployment (Vercel)

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your GitHub repository

2. **Configure Project**
   - **Framework Preset**: Vite (should auto-detect)
   - **Root Directory**: `client` (IMPORTANT: Set this explicitly)
   - **Build Command**: `npm run build` (Vercel will use this automatically)
   - **Output Directory**: `dist` (Vercel will use this automatically)
   - **Install Command**: `npm install` (default)

3. **Set Environment Variables**
   - Click "Environment Variables" section
   - Add:
     - **Key**: `VITE_API_URL`
     - **Value**: Your Render backend URL (e.g., `https://enactus-backend.onrender.com`)
   - **Important**: Set this BEFORE deploying

4. **Deploy**
   - Click "Deploy"
   - Wait for build and deployment to complete
   - Your app will be live at `https://your-project.vercel.app`

5. **Update Backend CORS**
   - Go back to your Render backend service settings
   - Update `CORS_ORIGIN` environment variable to match your Vercel frontend URL
   - Example: `https://your-project.vercel.app`
   - Save changes (this will trigger a redeploy)

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

Ensure `CORS_ORIGIN` in backend matches your Vercel frontend URL exactly (including `https://`)

### 3. Test the Application

1. Visit your Vercel frontend URL
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
- **Vercel** automatically handles routing for React Router
- **Environment Variables**: Must be set before building frontend (Vite bakes them into build)

## Vercel-Specific Considerations

### Automatic Configuration
- Vercel auto-detects Vite projects
- Automatically configures build and output directories
- Handles React Router routing automatically
- No need for `_redirects` file (Vercel handles it)

### Environment Variables
- Set in Vercel Dashboard → Project → Settings → Environment Variables
- Available during build time (important for Vite)
- Can set for Production, Preview, and Development separately

### Custom Domain
- Vercel allows custom domains
- Free SSL certificates
- Easy DNS configuration

## Troubleshooting

### Backend Issues

- **MongoDB Connection Error**: 
  - Check `MONGO_URI` is correct
  - Verify MongoDB Atlas IP whitelist includes Render IPs (or allow all IPs)
  - Check MongoDB connection string format

- **CORS Errors**: 
  - Verify `CORS_ORIGIN` matches your Vercel frontend URL exactly
  - Include `https://` protocol
  - No trailing slash
  - Example: `https://your-project.vercel.app`

- **Port Issues**: 
  - Render automatically sets `PORT`, don't hardcode it
  - Use `process.env.PORT || 5000` in code

- **Service Won't Start**:
  - Check build logs for errors
  - Verify `npm start` command works locally
  - Check Node version compatibility

### Frontend Issues

- **API Connection Errors**: 
  - Verify `VITE_API_URL` is set correctly in Vercel
  - Check backend service is running
  - Verify CORS is configured correctly
  - Check browser console for specific errors

- **Build Errors**: 
  - Check build logs in Vercel dashboard
  - Verify Root Directory is set to `client`
  - Check Node version compatibility
  - Look for missing dependencies

- **Environment Variables Not Working**:
  - Vite requires `VITE_` prefix
  - Variables must be set before build
  - Rebuild after changing environment variables
  - Check Vercel build logs to see if variables are available

- **404 Errors on Routes**:
  - Vercel handles this automatically with `vercel.json`
  - If issues persist, check `vercel.json` configuration
  - Ensure React Router is configured correctly

## Security Checklist

- [ ] Strong JWT secret set (32+ characters)
- [ ] MongoDB connection string secured
- [ ] CORS origin restricted to frontend domain
- [ ] No test/admin creation endpoints exposed
- [ ] Environment variables not committed to git
- [ ] HTTPS enabled (automatic on Render/Vercel)
- [ ] MongoDB Atlas IP whitelist configured
- [ ] File upload limits enforced

## Support

For issues or questions, refer to:
- Render Documentation: https://render.com/docs
- Vercel Documentation: https://vercel.com/docs
- Vite Documentation: https://vitejs.dev
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
