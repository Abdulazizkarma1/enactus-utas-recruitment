# MongoDB Connection Issue Fix

## Problem
You're seeing this error:
```
MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster. 
One common reason is that you're trying to access the database from an IP that isn't whitelisted.
```

## Solution

### Step 1: Access MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Log in to your account
3. Select your cluster

### Step 2: Whitelist Your IP Address
1. Click on **"Network Access"** in the left sidebar
2. Click **"Add IP Address"** button
3. You have two options:
   - **Option A (Recommended for Development):** Click **"Add Current IP Address"** - This adds your current IP
   - **Option B (For Production):** Click **"Allow Access from Anywhere"** - This allows access from any IP (use `0.0.0.0/0`)
4. Click **"Confirm"**

### Step 3: Verify Connection String
Make sure your `.env` file has the correct connection string:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

### Step 4: Restart Server
After whitelisting your IP, restart your server:
```bash
cd server
npm start
```

## Note
- IP whitelisting can take a few minutes to propagate
- If you're on a dynamic IP, you may need to update it periodically
- For production, consider using a static IP or VPN

