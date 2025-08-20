# EduMind - AI-Powered Learning Platform

## Overview

EduMind is a comprehensive learning management system built with a modern full-stack architecture. The application provides personalized course recommendations powered by AI, user analytics, and a complete learning experience with course enrollment and progress tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with React 18 using TypeScript and implements a modern component-based architecture:
- **UI Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
The backend follows a REST API pattern with Express.js:
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage

### Database Design
The application uses PostgreSQL with the following key entities:
- **Users**: Profile information, learning preferences, skill levels
- **Courses**: Course metadata, difficulty levels, categories
- **Enrollments**: User-course relationships with progress tracking
- **Sessions**: Authentication session storage (required for Replit Auth)

## Key Components

### Authentication System
- **Provider**: Firebase Authentication with Google OAuth and Email/Password
- **Session Storage**: PostgreSQL-backed sessions with express-session
- **Security**: HTTP-only cookies with secure flags in production
- **User Management**: Automatic user creation and profile management
- **Domain Authorization**: Requires adding deployment domains to Firebase Console for Google auth

### Course Management
- **Course Catalog**: Browsable course library with filtering and search
- **Enrollment System**: User enrollment tracking with progress monitoring
- **Recommendation Engine**: AI-powered course suggestions based on user preferences and behavior
- **Analytics**: Learning progress tracking and visualization

### AI Recommendation Engine
The recommendation system considers multiple factors:
- User learning preferences and skill level
- Course difficulty and category matching
- User interaction history and time spent
- Content-based filtering using course topics
- Collaborative filtering based on similar user behaviors

### UI/UX Design
- **Design System**: shadcn/ui components with consistent styling
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Mode**: CSS variable-based theming support
- **Accessibility**: Radix UI primitives ensure ARIA compliance

## Data Flow

1. **Authentication Flow**: Users authenticate via Replit Auth, sessions stored in PostgreSQL
2. **Course Discovery**: Users browse courses with real-time filtering and search
3. **Recommendation Pipeline**: AI engine processes user data to generate personalized suggestions
4. **Enrollment Process**: Users enroll in courses, progress tracked in database
5. **Analytics Collection**: User interactions logged for recommendation improvement
6. **Progress Tracking**: Real-time updates of learning progress and achievements

## External Dependencies

### Core Technologies
- **Database**: PostgreSQL with standard pg driver
- **Authentication**: Replit Auth service
- **UI Components**: Radix UI primitives
- **Styling**: Tailwind CSS framework
- **Development**: Vite for build tooling and HMR

### Key Libraries
- **ORM**: Drizzle ORM for type-safe database operations
- **Validation**: Zod for runtime type checking
- **State Management**: TanStack Query for API state
- **Date Handling**: date-fns for date utilities
- **Icons**: Lucide React for consistent iconography

## Deployment Strategy

### Development Environment
- **Build Tool**: Vite with React plugin
- **Dev Server**: Express with Vite middleware integration
- **Hot Reload**: Vite HMR with error overlay
- **Type Checking**: TypeScript with strict mode enabled

### Production Build
- **Frontend**: Vite builds optimized React bundle
- **Backend**: esbuild compiles TypeScript to ESM
- **Static Assets**: Served from dist/public directory
- **Environment**: NODE_ENV-based configuration

### Database Management
- **Schema**: Drizzle migrations in ./migrations directory
- **Deployment**: `drizzle-kit push` for schema updates
- **Connection**: Environment variable-based configuration
- **Sessions**: Automatic session table management

### Security Considerations
- **HTTPS**: Required for secure cookie transmission
- **CORS**: Configured for cross-origin requests
- **Session Security**: HTTP-only cookies with appropriate expiration
- **Input Validation**: Zod schemas for all API inputs
- **SQL Injection**: Prevention via Drizzle ORM parameterized queries

The architecture prioritizes type safety, developer experience, and scalability while maintaining a clean separation of concerns between frontend, backend, and database layers.