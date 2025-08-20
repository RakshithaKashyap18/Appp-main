import { 
  users, 
  courses, 
  enrollments, 
  userInteractions, 
  userPreferences,
  type User, 
  type UpsertUser,
  type Course,
  type InsertCourse,
  type Enrollment,
  type InsertEnrollment,
  type UserInteraction,
  type InsertUserInteraction,
  type UserPreference,
  type InsertUserPreference
} from "../shared/schema.ts";
import { db } from "./db.ts";
import { eq, desc, sql, and, count, avg } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Partial<User> & { email: string }): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Session store for authentication
  sessionStore: any;
  
  // Course methods
  getCourses(filters?: { category?: string; difficulty?: string; search?: string; limit?: number; offset?: number }): Promise<Course[]>;
  getCourseById(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  
  // Enrollment methods
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  getUserEnrollments(userId: string, status?: string): Promise<any[]>;
  updateEnrollmentProgress(enrollmentId: string, progress: number): Promise<Enrollment>;
  
  // User interaction methods
  createUserInteraction(interaction: InsertUserInteraction): Promise<UserInteraction>;
  
  // Analytics and recommendations
  getRecommendationsForUser(userId: string): Promise<Course[]>;
  getUserAnalytics(userId: string): Promise<any>;
  getLearningActivity(userId: string): Promise<any[]>;
  
  // Admin methods
  seedInitialData(): Promise<void>;
  
  // Additional methods for course completion and leaderboard
  updateEnrollment(enrollmentId: string, updates: any): Promise<Enrollment>;
  getEnrollmentById(enrollmentId: string): Promise<Enrollment | undefined>;
  getLeaderboard(): Promise<any[]>;
  updateUserPoints(userId: string, pointsToAdd: number): Promise<void>;
  getCourse(courseId: string): Promise<Course | undefined>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    // Initialize session store - will be set up synchronously in setupAuth
    this.sessionStore = null;
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(userData: Partial<User> & { email: string }): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values({
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    const [existingUser] = await db.select().from(users).where(eq(users.id, user.id!));
    
    if (existingUser) {
      const [updatedUser] = await db
        .update(users)
        .set({
          ...user,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id!))
        .returning();
      return updatedUser;
    } else {
      const [newUser] = await db
        .insert(users)
        .values(user)
        .returning();
      return newUser;
    }
  }

  async getCourses(filters?: { category?: string; difficulty?: string; search?: string; limit?: number; offset?: number }): Promise<Course[]> {
    const conditions = [eq(courses.isActive, true)];
    
    if (filters?.category) {
      conditions.push(eq(courses.category, filters.category));
    }
    
    if (filters?.difficulty) {
      conditions.push(eq(courses.difficulty, filters.difficulty));
    }
    
    let baseQuery = db.select().from(courses).where(and(...conditions)).orderBy(desc(courses.rating));
    
    if (filters?.limit && filters?.offset) {
      return await baseQuery.limit(filters.limit).offset(filters.offset);
    } else if (filters?.limit) {
      return await baseQuery.limit(filters.limit);
    } else if (filters?.offset) {
      return await baseQuery.offset(filters.offset);
    }
    
    return await baseQuery;
  }

  async getCourseById(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course || undefined;
  }

  async getCourse(id: string): Promise<Course | undefined> {
    return this.getCourseById(id);
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db
      .insert(courses)
      .values(course)
      .returning();
    return newCourse;
  }

  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const [newEnrollment] = await db
      .insert(enrollments)
      .values(enrollment)
      .returning();
    return newEnrollment;
  }

  async getUserEnrollments(userId: string, status?: string): Promise<any[]> {
    const conditions = [eq(enrollments.userId, userId)];
    
    if (status) {
      conditions.push(eq(enrollments.status, status));
    }
    
    const query = db
      .select({
        id: enrollments.id,
        userId: enrollments.userId,
        courseId: enrollments.courseId,
        progress: enrollments.progress,
        status: enrollments.status,
        rating: enrollments.rating,
        enrolledAt: enrollments.enrolledAt,
        completedAt: enrollments.completedAt,
        lastAccessedAt: enrollments.lastAccessedAt,
        course: courses,
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(and(...conditions))
      .orderBy(desc(enrollments.lastAccessedAt));

    return await query;
  }

  async updateEnrollmentProgress(enrollmentId: string, progress: number): Promise<Enrollment> {
    const [updatedEnrollment] = await db
      .update(enrollments)
      .set({ 
        progress,
        lastAccessedAt: new Date(),
        ...(progress >= 100 ? { status: 'completed', completedAt: new Date() } : {})
      })
      .where(eq(enrollments.id, enrollmentId))
      .returning();
    return updatedEnrollment;
  }

  async createUserInteraction(interaction: InsertUserInteraction): Promise<UserInteraction> {
    // Only insert fields that exist in the current database schema
    const { metadata, ...validFields } = interaction as any;
    const [newInteraction] = await db
      .insert(userInteractions)
      .values(validFields)
      .returning();
    return newInteraction;
  }

  async getRecommendationsForUser(userId: string): Promise<Course[]> {
    // Simple recommendation: return top-rated active courses
    return await db
      .select()
      .from(courses)
      .where(eq(courses.isActive, true))
      .orderBy(desc(courses.rating))
      .limit(6);
  }

  async getUserAnalytics(userId: string): Promise<any> {
    const userEnrollments = await this.getUserEnrollments(userId);
    const totalCourses = userEnrollments.length;
    const completedCourses = userEnrollments.filter(e => e.status === 'completed').length;
    
    // Calculate learning hours based on video completions + test time
    const totalLearningHours = userEnrollments.reduce((sum, e) => {
      const videosCompleted = Array.isArray(e.videosCompleted) ? e.videosCompleted.length : 0;
      const testTime = e.testCompleted ? 0.5 : 0; // 30 minutes for test
      return sum + videosCompleted + testTime; // 1 hour per video + test time
    }, 0);
    
    // Calculate average test score for completed tests
    const testScores = userEnrollments
      .filter(e => e.testCompleted && e.testScore !== null && e.testScore !== undefined)
      .map(e => e.testScore || 0);
    const averageScore = testScores.length > 0 
      ? Math.round(testScores.reduce((sum, score) => (sum || 0) + (score || 0), 0) / testScores.length)
      : 0;
    
    return {
      totalCourses,
      completedCourses,
      totalLearningHours: Math.round(totalLearningHours * 10) / 10, // Round to 1 decimal
      currentStreak: 7, // Mock data for now
      overallProgress: totalCourses > 0 ? (completedCourses / totalCourses) * 100 : 0,
      achievements: completedCourses,
      averageScore: averageScore,
      recommendationAccuracy: 92, // Mock data
      averageRating: 4.2, // Mock data
    };
  }

  async getLearningActivity(userId: string): Promise<any[]> {
    // Mock learning activity data for now
    return [
      { day: 'Mon', hours: 2 },
      { day: 'Tue', hours: 3 },
      { day: 'Wed', hours: 1 },
      { day: 'Thu', hours: 4 },
      { day: 'Fri', hours: 2 },
      { day: 'Sat', hours: 3 },
      { day: 'Sun', hours: 1 },
    ];
  }

  async updateEnrollment(enrollmentId: string, updates: any): Promise<Enrollment> {
    const [enrollment] = await db
      .update(enrollments)
      .set({ ...updates, lastAccessedAt: new Date() })
      .where(eq(enrollments.id, enrollmentId))
      .returning();
    return enrollment;
  }

  async getEnrollmentById(enrollmentId: string): Promise<Enrollment | undefined> {
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.id, enrollmentId));
    return enrollment || undefined;
  }

  async getLeaderboard(): Promise<any[]> {
    const usersData = await db
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        photoURL: users.photoURL,
        totalPoints: users.totalPoints,
        coursesCompleted: users.coursesCompleted,
        skillLevel: users.skillLevel,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.totalPoints), desc(users.coursesCompleted))
      .limit(50);
    
    return usersData;
  }

  async updateUserPoints(userId: string, pointsToAdd: number): Promise<void> {
    await db
      .update(users)
      .set({
        totalPoints: sql`${users.totalPoints} + ${pointsToAdd}`,
        coursesCompleted: sql`${users.coursesCompleted} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async seedInitialData(): Promise<void> {
    // Check if courses already exist
    const existingCourses = await db.select().from(courses).limit(1);
    if (existingCourses.length > 0) {
      return; // Data already seeded
    }

    // Seed some initial courses
    const sampleCourses: InsertCourse[] = [
      {
        title: "Introduction to Machine Learning",
        description: "Learn the fundamentals of machine learning and artificial intelligence",
        category: "Technology",
        difficulty: "beginner",
        duration: 20,
        instructorName: "Dr. Sarah Johnson",
        topics: ["AI", "Python", "Data Science"],
        imageUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400",
        videos: [
          {
            id: "video1",
            title: "ML Fundamentals & Setup",
            url: "https://www.youtube.com/watch?v=ukzFI9rgwfU"
          },
          {
            id: "video2", 
            title: "Algorithms & Practice",
            url: "https://www.youtube.com/watch?v=7eh4d6sabA0"
          }
        ]
      },
      {
        title: "Advanced React Development",
        description: "Master advanced React patterns and best practices",
        category: "Technology",
        difficulty: "advanced",
        duration: 30,
        instructorName: "Mike Chen",
        topics: ["React", "JavaScript", "Frontend"],
        imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
        videos: [
          {
            id: "video1",
            title: "Advanced Patterns & Hooks",
            url: "https://www.youtube.com/watch?v=w7ejDZ8SWv8"
          },
          {
            id: "video2", 
            title: "Performance & Optimization",
            url: "https://www.youtube.com/watch?v=Tn6-PIqc4UM"
          }
        ]
      },
      {
        title: "Digital Marketing Fundamentals",
        description: "Learn the basics of digital marketing and social media",
        category: "Business",
        difficulty: "beginner",
        duration: 15,
        instructorName: "Lisa Martinez",
        topics: ["Marketing", "Social Media", "SEO"],
        imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
        videos: [
          {
            id: "video1",
            title: "Digital Marketing Basics",
            url: "https://www.youtube.com/watch?v=bixR-kIJkHQ"
          },
          {
            id: "video2", 
            title: "Social Media Strategy",
            url: "https://www.youtube.com/watch?v=nU-IIXBWlS4"
          }
        ]
      },
      {
        title: "Data Visualization with D3.js",
        description: "Create stunning data visualizations using D3.js",
        category: "Technology",
        difficulty: "intermediate",
        duration: 25,
        instructorName: "Alex Thompson",
        topics: ["D3.js", "Data Visualization", "JavaScript"],
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
        videos: [
          {
            id: "video1",
            title: "Data Visualization Basics",
            url: "https://www.youtube.com/watch?v=_8V5o2UHG0E"
          },
          {
            id: "video2", 
            title: "Interactive Charts with D3",
            url: "https://www.youtube.com/watch?v=TOJ9yjvlapY"
          }
        ]
      },
      {
        title: "Project Management Essentials",
        description: "Master project management methodologies and tools",
        category: "Business",
        difficulty: "intermediate",
        duration: 18,
        instructorName: "David Wilson",
        topics: ["Project Management", "Agile", "Leadership"],
        imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400",
        videos: [
          {
            id: "video1",
            title: "Project Planning & Methodology",
            url: "https://www.youtube.com/watch?v=wAVAx0ZeAeU"
          },
          {
            id: "video2", 
            title: "Team Management & Delivery",
            url: "https://www.youtube.com/watch?v=5hW2qLhKV-Y"
          }
        ]
      },
      {
        title: "UX/UI Design Principles",
        description: "Learn user experience and interface design fundamentals",
        category: "Design",
        difficulty: "beginner",
        duration: 22,
        instructorName: "Emma Rodriguez",
        topics: ["UX", "UI", "Design", "Figma"],
        imageUrl: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=400",
        videos: [
          {
            id: "video1",
            title: "UX Research & Design Process",
            url: "https://www.youtube.com/watch?v=Ovj4hFxko7c"
          },
          {
            id: "video2", 
            title: "Prototyping & User Testing",
            url: "https://www.youtube.com/watch?v=GJlbBda5w0w"
          }
        ]
      }
    ];

    await db.insert(courses).values(sampleCourses);
  }
}

export const storage = new DatabaseStorage();