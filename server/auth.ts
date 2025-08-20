import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import type { Express } from "express";
import session from "express-session";
import { storage } from "./storage.ts";
import { User as SelectUser } from "../shared/schema.ts";
import bcrypt from "bcryptjs";
import connectPg from "connect-pg-simple";
import { pool } from "./db.ts";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const loadServiceAccount = () => {
  try {
    // First try environment variable (for production)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    }
    
    // Fall back to file (for development)
    const serviceAccountPath = join(__dirname, "serviceAccountKey.json");
    const serviceAccountContent = readFileSync(serviceAccountPath, "utf8");
    return JSON.parse(serviceAccountContent);
  } catch (error) {
    console.error("Failed to load service account:", error);
    return null;
  }
};

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  return bcrypt.compare(supplied, stored);
}

export function setupAuth(app: Express) {
  // Set up PostgreSQL session store
  const PostgresSessionStore = connectPg(session);
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'dev-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    store: new PostgresSessionStore({
      pool: pool,
      createTableIfMissing: false, // Don't auto-create to avoid index conflicts
      tableName: 'session',
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user || !user.password || !(await comparePasswords(password, user.password))) {
            return done(null, false, { message: 'Invalid email or password' });
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Register with email/password
  app.post("/api/register", async (req, res, next) => {
    try {
      const { email, password, displayName } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        displayName: displayName || null,
        provider: 'email',
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json({
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          provider: user.provider,
        });
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // Login with email/password
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ error: info?.message || 'Authentication failed' });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        res.json({
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          provider: user.provider,
        });
      });
    })(req, res, next);
  });

  // Google OAuth callback (for Firebase Auth)
  app.post("/api/auth/google", async (req, res, next) => {
    console.log('=== Google auth route called ===');
    console.log('Request body:', req.body);
    
    try {
      const { idToken, email, displayName, photoURL, uid } = req.body;
      
      // Validate required fields
      if (!idToken) {
        return res.status(400).json({ error: 'Missing idToken' });
      }
      if (!email) {
        return res.status(400).json({ error: 'Missing email' });
      }
      if (!uid) {
        return res.status(400).json({ error: 'Missing uid' });
      }
      
      // Initialize Firebase Admin SDK if needed
      if (!getApps().length) {
        console.log('Initializing Firebase Admin...');
        const serviceAccount = loadServiceAccount();
        if (!serviceAccount) {
          throw new Error('Service account not loaded');
        }
        initializeApp({
          credential: cert(serviceAccount),
        });
      }
      
      // Verify the ID token
      const auth = getAuth();
      const decodedToken = await auth.verifyIdToken(idToken);
      console.log('Token verified successfully for UID:', decodedToken.uid);
      
      // Ensure the token belongs to the expected user
      if (decodedToken.uid !== uid) {
        return res.status(400).json({ error: 'Token UID mismatch' });
      }
      
      // Check if user exists
      let user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Create new user
        console.log('Creating new user with email:', email);
        user = await storage.createUser({
          id: uid,
          email,
          displayName: displayName || null,
          photoURL: photoURL || null,
          provider: 'google',
          password: null,
        });
      } else {
        // Update existing user to Google provider
        if (user.provider !== 'google') {
          console.log('Updating existing user to Google provider:', email);
          await storage.updateUser(user.id, {
            provider: 'google',
            displayName: displayName || user.displayName,
            photoURL: photoURL || user.photoURL,
          });
          user = { 
            ...user, 
            provider: 'google' as const, 
            displayName: displayName || user.displayName, 
            photoURL: photoURL || user.photoURL 
          };
        }
      }
      
      // Create session
      req.login(user, (err) => {
        if (err) {
          console.error('Session creation error:', err);
          return next(err);
        }
        
        console.log('Authentication successful for:', email);
        res.json({
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          provider: user.provider,
        });
      });
      
    } catch (error) {
      console.error('Google auth error:', error);
      res.status(500).json({ error: 'Google authentication failed' });
    }
  });

  // Logout
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Get current user
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json({
      id: req.user.id,
      email: req.user.email,
      displayName: req.user.displayName,
      photoURL: req.user.photoURL,
      provider: req.user.provider,
    });
  });
}