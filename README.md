# EduMind - AI-Powered Learning Platform

A comprehensive learning management system with React frontend, Express.js backend, featuring course browsing, enrollment, and test-based progress tracking with leaderboard system.

## Features

- 🎓 Course browsing and enrollment
- 📝 Test-based course completion (70%+ required to pass)
- 🏆 Points system and leaderboard
- 📊 Learning analytics and progress tracking
- 🔐 Firebase authentication (Google OAuth + Email/Password)
- 📱 Responsive design with dark/light mode

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Firebase Auth
- **State Management**: TanStack Query
- **UI Components**: shadcn/ui + Radix UI

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- Firebase project with authentication enabled

## Local Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd edumind
npm install
```

### 2. Database Setup

**Option A: Local PostgreSQL with pgAdmin (Recommended)**
1. Install PostgreSQL with pgAdmin:
   - **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/) (includes pgAdmin)
   - **macOS**: Download from postgresql.org or `brew install postgresql` + pgAdmin separately
   - **Linux**: `sudo apt install postgresql postgresql-contrib pgadmin4` (Ubuntu/Debian)
2. Start pgAdmin application
3. Create user via pgAdmin or command line:
   
   **Method 1: Using pgAdmin GUI**
   - Open pgAdmin application
   - Connect to PostgreSQL server (password: ramash)
   - Right-click "Login/Group Roles" → Create → Login/Group Role
   - Name: `edumind_user`, Password: `ramash`
   - In Privileges tab: enable "Can login?" and "Superuser?"
   
   **Method 2: Using SQL in pgAdmin Query Tool**
   ```sql
   CREATE USER edumind_user WITH PASSWORD 'ramash';
   GRANT ALL PRIVILEGES ON DATABASE postgres TO edumind_user;
   GRANT ALL ON SCHEMA public TO edumind_user;
   ```

**Option B: Use Neon (Cloud Alternative)**
1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new database
3. Copy the connection string (note: project now uses standard PostgreSQL drivers)

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication:
   - Go to Authentication → Sign-in method
   - Enable "Email/Password" and "Google"
4. Get configuration:
   - Go to Project Settings → General
   - Find "Your apps" section
   - Copy `apiKey`, `projectId`, and `appId`

### 4. Environment Variables

Create a `.env` file in the root directory:

```env
# Database (choose one option)
# Option A: Local PostgreSQL
DATABASE_URL="postgresql://edumind_user:ramash@localhost:5432/postgres"

# Option B: Neon (cloud)
# DATABASE_URL="your-neon-connection-string"

# Firebase Configuration (get from Firebase Console)
VITE_FIREBASE_API_KEY="your-firebase-api-key"
VITE_FIREBASE_PROJECT_ID="your-firebase-project-id"
VITE_FIREBASE_APP_ID="your-firebase-app-id"

# Session Secret (generate a random string - use any 32+ character string)
SESSION_SECRET="my-super-secret-session-key-that-is-very-long-and-random"

# Environment
NODE_ENV="development"
```

### 5. Database Migration

Push the database schema:

```bash
npm run db:push
```

### 6. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and configurations
├── server/                 # Express backend
│   ├── auth.ts            # Authentication logic
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── index.ts           # Server entry point
├── shared/                # Shared types and schemas
│   └── schema.ts          # Database schema with Drizzle
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server (frontend + backend)
- `npm run build` - Build for production
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## Authentication

### Email/Password Sign-up
1. Click "Sign Up" tab
2. Enter email, password (6+ chars), and display name
3. Click "Create Account"

### Google Sign-in
1. Click "Continue with Google"
2. Complete Google OAuth flow
3. Automatic account creation

**Note**: For deployed apps, add your domain to Firebase Console → Authentication → Settings → Authorized domains

## How to Use

1. **Browse Courses**: View available courses on the homepage
2. **Enroll**: Click "Enroll Now" on any course
3. **Take Tests**: Access tests immediately after enrollment
4. **Complete Courses**: Score 70%+ on tests to complete courses
5. **Earn Points**: Get 100 points for each completed course
6. **Track Progress**: View analytics and leaderboard

## Deployment

### Replit Deployment
1. Push code to GitHub
2. Import to Replit
3. Add environment variables in Replit Secrets
4. Click "Deploy"

### Other Platforms
1. Build: `npm run build`
2. Deploy `dist/` folder
3. Set environment variables
4. Ensure PostgreSQL database is accessible

## Troubleshooting

### Common Issues

**Database Connection Error**
- Verify PostgreSQL is running in pgAdmin application
- Check pgAdmin server status (should show green icon when running)
- Test connection: `psql -U edumind_user -d postgres -h localhost -p 5432`
- Verify `DATABASE_URL` format is correct: `postgresql://edumind_user:ramash@localhost:5432/postgres`
- Run `npm run db:push` to create tables

**PostgreSQL/pgAdmin Issues**
- **Windows**: PostgreSQL runs through pgAdmin - start pgAdmin application
- **macOS**: If using Homebrew: `brew services start postgresql`, then start pgAdmin
- **Linux**: Start PostgreSQL service: `sudo systemctl start postgresql`, then start pgAdmin
- **Connection**: Ensure PostgreSQL is running in pgAdmin before testing connection

**Firebase Authentication Error**
- Check all environment variables are set correctly
- Verify Firebase project has Authentication enabled
- For Google auth: add `localhost:5000` to authorized domains in Firebase Console

**Port Already in Use**
- Change port in `server/index.ts` if 5000 is occupied
- Or kill process using port: `lsof -ti:5000 | xargs kill` (macOS/Linux)

**Build Errors**
- Clear cache: `rm -rf node_modules package-lock.json && npm install`
- Check TypeScript errors: `npx tsc --noEmit`

### Database Setup Verification

Test your database connection:
```bash
# Test PostgreSQL connection (password: ramash)
psql -U edumind_user -d postgres -h localhost -p 5432

# Inside psql, list tables (should show tables after db:push)
\dt
```

### Getting Help

1. Check console logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure Firebase and database configurations are valid

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details