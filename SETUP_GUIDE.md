# Complete Setup Guide for EduMind

This guide will help you set up the EduMind learning platform on any computer from scratch.

## Step-by-Step Setup

### 1. Install Prerequisites

#### Node.js (Required)
- Go to [nodejs.org](https://nodejs.org/)
- Download and install Node.js 18+ (LTS version recommended)
- Verify installation: `node --version` and `npm --version`

#### PostgreSQL Database (Required)

**Windows:**
1. Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run installer and remember the password you set for `postgres` user
3. Add PostgreSQL to your PATH (installer usually does this)

**macOS:**
```bash
# Using Homebrew (recommended)
brew install postgresql
brew services start postgresql

# Or download from postgresql.org
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Setup Database

#### Create Database User via pgAdmin
1. **Open pgAdmin application**
2. **Connect to PostgreSQL server** (use password: ramash)
3. **Create user via GUI:**
   - Right-click "Login/Group Roles" → Create → Login/Group Role
   - General tab: Name = `edumind_user`
   - Definition tab: Password = `ramash`
   - Privileges tab: Enable "Can login?" and "Superuser?"
   - Click Save

4. **Alternative: Create user via SQL**
   - In pgAdmin, right-click your server → Query Tool
   - Run these commands:
   ```sql
   CREATE USER edumind_user WITH PASSWORD 'ramash';
   GRANT ALL PRIVILEGES ON DATABASE postgres TO edumind_user;
   GRANT ALL ON SCHEMA public TO edumind_user;
   ```

#### Test Connection
You can test the connection through pgAdmin by connecting with the new user, or via command line:
```bash
psql -U edumind_user -d postgres -h localhost -p 5432
# Enter password: ramash
```

### 3. Setup Firebase Authentication

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name (e.g., "edumind-app")
4. Disable Google Analytics (optional)
5. Click "Create project"

#### Enable Authentication
1. In your project, click "Authentication" in sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" → Toggle and Save
5. Enable "Google" → Toggle, add support email, Save

#### Get Configuration Keys
1. Click gear icon → "Project settings"
2. Scroll to "Your apps" section
3. Click web icon `</>`
4. Register app with name "EduMind Web"
5. Copy these values:
   - `apiKey`
   - `projectId` 
   - `appId`

#### Add Authorized Domain (Important!)
1. In Authentication → Settings → Authorized domains
2. Add `localhost` (for local development)
3. Later add your deployment domain

### 4. Download and Setup Project

#### Clone Repository
```bash
git clone <your-repository-url>
cd edumind
npm install
```

#### Create Environment File
1. Copy `.env.example` to `.env`
2. Fill in your values:

```env
# Database
DATABASE_URL="postgresql://edumind_user:ramash@localhost:5432/postgres"

# Firebase (replace with your values)
VITE_FIREBASE_API_KEY="your-api-key-from-firebase"
VITE_FIREBASE_PROJECT_ID="your-project-id-from-firebase"
VITE_FIREBASE_APP_ID="your-app-id-from-firebase"

# Session Secret (any random string 32+ characters)
SESSION_SECRET="my-super-secret-session-key-that-is-very-long-and-random"

NODE_ENV="development"
```

#### Initialize Database Schema
```bash
npm run db:push
```

### 5. Start the Application

```bash
npm run dev
```

The app will be available at: `http://localhost:5000`

## Verification Checklist

- [ ] Node.js installed and `npm --version` works
- [ ] PostgreSQL installed and running
- [ ] Database `edumind` created with user `edumind_user`
- [ ] Firebase project created with Authentication enabled
- [ ] Environment variables set in `.env` file
- [ ] `npm install` completed successfully
- [ ] `npm run db:push` completed without errors
- [ ] `npm run dev` starts without errors
- [ ] Can access app at `http://localhost:5000`
- [ ] Can sign up with email/password
- [ ] Can browse courses and enroll

## Quick Test

1. Open `http://localhost:5000`
2. Click "Sign Up" tab
3. Create account with:
   - Email: `test@example.com`
   - Password: `password123`
   - Name: `Test User`
4. Click "Create Account"
5. You should be logged in and see the course dashboard

## Common Issues and Solutions

### "Database connection failed"
- Check PostgreSQL is running: `pg_ctl status`
- Verify credentials: `psql -U edumind_user -d edumind -h localhost`
- Check `.env` file has correct DATABASE_URL

### "Firebase auth error"
- Verify all Firebase environment variables are set
- Check Firebase Console has Authentication enabled
- Ensure `localhost` is in authorized domains

### "Port 5000 already in use"
- Find process: `lsof -i :5000` (macOS/Linux) or `netstat -ano | findstr :5000` (Windows)
- Kill process or change port in `server/index.ts`

### "npm install fails"
- Clear cache: `npm cache clean --force`
- Delete node_modules: `rm -rf node_modules package-lock.json`
- Try again: `npm install`

## Production Deployment

For deployment to platforms like Heroku, Vercel, or others:

1. Build the project: `npm run build`
2. Set environment variables on your platform
3. Ensure database is accessible from deployment platform
4. Add your deployment domain to Firebase authorized domains

## Support

If you encounter issues:
1. Check the console for error messages
2. Verify all environment variables are correct
3. Ensure all prerequisites are properly installed
4. Check the troubleshooting section in README.md