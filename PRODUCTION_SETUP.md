# Production Setup Guide

This guide will help you prepare the application for production use.

## Step 1: Clear Test Data

Before going live, clear all test data from the database:

```bash
cd server
npm run clear-test-data
```

This will:
- Delete all applications
- Delete all vouchers
- Delete all applicant users
- **Preserve admin accounts**

## Step 2: Create Admin Accounts

Create the 3 production admin accounts:

```bash
cd server
npm run create-admins
```

This will create/update the following admin accounts:

1. **President**
   - Email: `president@enactusutas.org`
   - Password: `president@enactus`
   - Student ID: `president001`

2. **Advisor**
   - Email: `advisor@enactusutas.org`
   - Password: `advisor@enactus`
   - Student ID: `advisor001`

3. **Vice President**
   - Email: `vp@enactusutas.org`
   - Password: `vp@enactus`
   - Student ID: `vp001`

**⚠️ IMPORTANT**: Change these passwords immediately after first login for security!

## Step 3: Generate New Vouchers

After clearing test data, generate new vouchers for actual applicants through the admin dashboard.

## Step 4: Verify Environment Variables

### Backend (Render)
Ensure these are set in Render dashboard:
- `MONGO_URI` - Your MongoDB connection string
- `JWT_SECRET` - Strong secret key for JWT tokens
- `CORS_ORIGIN` - Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)
- `NODE_ENV` - Set to `production` (optional but recommended)

### Frontend (Vercel)
Ensure these are set in Vercel dashboard:
- `VITE_API_URL` - Your Render backend URL (e.g., `https://your-backend.onrender.com`)

**Note**: After changing environment variables, you must redeploy the application.

## Step 5: Production Checklist

- [ ] Test data cleared
- [ ] Admin accounts created
- [ ] Admin passwords changed (after first login)
- [ ] New vouchers generated
- [ ] Environment variables verified
- [ ] Backend health check working
- [ ] Frontend can connect to backend
- [ ] Registration flow tested
- [ ] Login flow tested
- [ ] Application submission tested
- [ ] Admin dashboard accessible
- [ ] File uploads working (profile photos, CVs)
- [ ] PDF download working in admin dashboard

## Step 6: Security Recommendations

1. **Change Admin Passwords**: After first login, change all admin passwords to strong, unique passwords.

2. **JWT Secret**: Ensure `JWT_SECRET` is a strong, random string (at least 32 characters).

3. **MongoDB Security**: 
   - Use MongoDB Atlas with IP whitelist
   - Enable authentication
   - Use strong database passwords

4. **CORS**: Ensure `CORS_ORIGIN` is set to your exact frontend URL (no wildcards in production).

5. **File Storage**: Consider using cloud storage (AWS S3, Cloudinary) instead of local filesystem for production, as Render's filesystem is ephemeral.

## Troubleshooting

### Admin Login Issues
- Verify admin accounts were created: Check MongoDB or run `npm run create-admins` again
- Ensure you're using the correct email and password
- Check that the user role is set to 'admin' in the database

### Database Connection Issues
- Verify `MONGO_URI` is correct in Render
- Check MongoDB Atlas IP whitelist includes Render's IP ranges
- Verify database credentials are correct

### File Upload Issues
- Remember: Render's filesystem is ephemeral - files will be lost on redeploy
- Consider implementing cloud storage for production
- Current setup works but files won't persist across deployments

## Support

If you encounter any issues during production setup, check:
1. Render logs for backend errors
2. Vercel logs for frontend build errors
3. Browser console for client-side errors
4. Network tab for API request/response details

