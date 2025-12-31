# Enactus CKT-UTAS Recruitment Portal

A full-stack recruitment application for Enactus CKT-UTAS built with React, Node.js, Express, and MongoDB.

## Features

- **User Registration**: Secure registration with voucher system
- **Application Form**: Multi-step application form with auto-save functionality
- **File Uploads**: Profile picture and CV upload support
- **Admin Dashboard**: Manage applicants and generate vouchers
- **Status Tracking**: Track application status (New, Submitted, Interview, Recruited, Declined)

## Tech Stack

### Frontend
- React 19
- Vite
- React Router
- Axios
- Bootstrap 5
- Bootstrap Icons

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Multer (File Uploads)
- Bcrypt (Password Hashing)

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   └── config/        # Configuration files
│   └── package.json
├── server/                 # Backend Express application
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── scripts/           # Utility scripts
│   ├── uploads/           # Uploaded files
│   └── server.js          # Server entry point
└── package.json           # Root package.json
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd Enactus-UTAS-Recruitment
```

2. Install dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up environment variables

Create `server/.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CORS_ORIGIN=http://localhost:5173
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000
```

4. Create admin account (optional)
```bash
cd server
npm run create-admin
```

5. Run the application

From root directory:
```bash
npm start
```

Or run separately:
```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
cd client
npm run dev
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions:
- **Backend**: Render (Web Service)
- **Frontend**: Vercel (Static Site)

Quick start: See [VERCEL_DEPLOYMENT_QUICKSTART.md](./VERCEL_DEPLOYMENT_QUICKSTART.md)

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `CORS_ORIGIN` - Allowed CORS origin

### Frontend (.env)
- `VITE_API_URL` - Backend API URL

## Security Notes

- All environment variables are in `.gitignore`
- Passwords are hashed using bcrypt
- JWT tokens for authentication
- CORS configured for production
- No test/admin endpoints exposed in production

## License

ISC

## Support

For issues or questions, please contact the development team.
