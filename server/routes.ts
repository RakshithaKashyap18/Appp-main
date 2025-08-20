import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.ts";
import { setupAuth } from "./auth.ts";
import { insertCourseSchema, insertEnrollmentSchema, insertUserInteractionSchema } from "../shared/schema.ts";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);

  // Auth middleware function
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    next();
  };

  // Course routes
  app.get('/api/courses', async (req, res) => {
    try {
      const { category, difficulty, search, limit = 20, offset = 0 } = req.query;
      const courses = await storage.getCourses({
        category: category as string,
        difficulty: difficulty as string,
        search: search as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get('/api/courses/:id', async (req, res) => {
    try {
      const course = await storage.getCourseById(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  // Enrollment routes
  app.post('/api/enrollments', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const enrollmentData = insertEnrollmentSchema.parse({
        ...req.body,
        userId,
      });
      
      const enrollment = await storage.createEnrollment(enrollmentData);
      res.json(enrollment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid enrollment data", errors: error.errors });
      }
      console.error("Error creating enrollment:", error);
      res.status(500).json({ message: "Failed to create enrollment" });
    }
  });

  app.get('/api/enrollments', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { status } = req.query;
      const enrollments = await storage.getUserEnrollments(userId, status as string);
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  app.patch('/api/enrollments/:id/progress', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { progress } = req.body;
      
      if (typeof progress !== 'number' || progress < 0 || progress > 100) {
        return res.status(400).json({ message: "Progress must be a number between 0 and 100" });
      }

      const enrollment = await storage.updateEnrollmentProgress(
        req.params.id,
        progress
      );
      
      if (!enrollment) {
        return res.status(404).json({ message: "Enrollment not found" });
      }
      
      res.json(enrollment);
    } catch (error) {
      console.error("Error updating enrollment progress:", error);
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // User interaction tracking
  app.post('/api/interactions', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const interactionData = insertUserInteractionSchema.parse({
        ...req.body,
        userId,
      });
      
      const interaction = await storage.createUserInteraction(interactionData);
      res.json(interaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid interaction data", errors: error.errors });
      }
      console.error("Error creating interaction:", error);
      res.status(500).json({ message: "Failed to create interaction" });
    }
  });

  // Recommendations
  app.get('/api/recommendations', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { limit = 6 } = req.query;
      const recommendations = await storage.getRecommendationsForUser(userId);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  // Analytics
  app.get('/api/analytics/user', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const analytics = await storage.getUserAnalytics(userId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching user analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get('/api/analytics/learning-activity', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { days = 7 } = req.query;
      const activity = await storage.getLearningActivity(userId);
      res.json(activity);
    } catch (error) {
      console.error("Error fetching learning activity:", error);
      res.status(500).json({ message: "Failed to fetch learning activity" });
    }
  });

  // Admin routes (for seeding data)
  app.post('/api/admin/courses', async (req, res) => {
    try {
      const courseData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(courseData);
      res.json(course);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid course data", errors: error.errors });
      }
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  // Seed initial data
  app.post('/api/seed', async (req, res) => {
    try {
      await storage.seedInitialData();
      res.json({ message: "Initial data seeded successfully" });
    } catch (error) {
      console.error("Error seeding data:", error);
      res.status(500).json({ message: "Failed to seed data" });
    }
  });

  // Get leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  });

  // Mark video as completed
  app.post("/api/enrollments/:enrollmentId/video-complete", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const { enrollmentId } = req.params;
      const { videoId } = req.body;
      
      // Get current enrollment
      const currentEnrollment = await storage.getEnrollmentById(enrollmentId);
      if (!currentEnrollment) {
        return res.status(404).json({ error: "Enrollment not found" });
      }

      // Get completed videos list (handle both old and new schema)
      let completedVideos = [];
      if (currentEnrollment.videosCompleted) {
        completedVideos = Array.isArray(currentEnrollment.videosCompleted) 
          ? currentEnrollment.videosCompleted 
          : [];
      }

      // Add new video to completed list if not already there
      if (!completedVideos.includes(videoId)) {
        completedVideos.push(videoId);
        
        // Award points for completing a video (25 points per video)
        await storage.updateUserPoints(req.user.id, 25);
        
        // Log interaction for analytics - temporarily disabled due to schema mismatch
        // await storage.createUserInteraction({
        //   userId: req.user.id,
        //   courseId: currentEnrollment.courseId,
        //   interactionType: 'video_complete',
        //   timeSpent: 60, // 1 hour in minutes
        // });
      }

      // Videos are for learning only - they don't affect course progress
      // Progress is only updated by test completion
      let status = currentEnrollment.status;
      
      const enrollment = await storage.updateEnrollment(enrollmentId, {
        videosCompleted: completedVideos,
        lastAccessedAt: new Date(),
        // Keep existing progress and status - only test completion changes these
      });
      
      res.json(enrollment);
    } catch (error) {
      console.error('Error marking video as completed:', error);
      res.status(500).json({ error: 'Failed to update video completion' });
    }
  });

  // Submit test and complete course
  app.post("/api/enrollments/:enrollmentId/submit-test", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const { enrollmentId } = req.params;
      const { answers, score } = req.body;
      
      const passed = score >= 70; // 70% passing grade
      const completedAt = passed ? new Date() : null;
      
      const enrollment = await storage.updateEnrollment(enrollmentId, {
        testCompleted: true,
        testScore: score,
        progress: passed ? 100 : 75,
        completedAt,
        status: passed ? 'completed' : 'active',
        lastAccessedAt: new Date(),
      });

      // Award points if course completed
      if (passed) {
        const course = await storage.getCourse(enrollment.courseId);
        const basePoints = course?.pointsValue || 100;
        const bonusPoints = score === 100 ? 20 : 0; // Perfect score bonus
        const totalPoints = basePoints + bonusPoints;

        await storage.updateUserPoints(req.user.id, totalPoints);
        
        res.json({ enrollment, passed, pointsAwarded: totalPoints });
      } else {
        res.json({ enrollment, passed, pointsAwarded: 0 });
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      res.status(500).json({ error: 'Failed to submit test' });
    }
  });

  // Test submission endpoint - main course completion driver
  app.post("/api/enrollments/:enrollmentId/test-complete", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const { enrollmentId } = req.params;
      const { score, passed } = req.body;
      
      // Get current enrollment
      const currentEnrollment = await storage.getEnrollmentById(enrollmentId);
      if (!currentEnrollment) {
        return res.status(404).json({ error: "Enrollment not found" });
      }

      // Update enrollment - test completion drives course completion
      const enrollment = await storage.updateEnrollment(enrollmentId, {
        testCompleted: true,
        testScore: score,
        progress: passed ? 100 : 75,  // 100% only when test is passed
        status: passed ? 'completed' : 'in_progress',
        completedAt: passed ? new Date() : null,
        lastAccessedAt: new Date(),
      });

      // Award points for test completion and course completion
      let pointsAwarded = 0;
      if (passed) {
        // Course completion points (100 base points)
        pointsAwarded = 100;
        await storage.updateUserPoints(req.user.id, pointsAwarded);
        
        // Log interaction for analytics - temporarily disabled due to schema mismatch
        // await storage.createUserInteraction({
        //   userId: req.user.id,
        //   courseId: currentEnrollment.courseId,
        //   interactionType: 'course_complete',
        //   timeSpent: 30, // 30 minutes for test
        // });
      } else {
        // Log test attempt - temporarily disabled due to schema mismatch
        // await storage.createUserInteraction({
        //   userId: req.user.id,
        //   courseId: currentEnrollment.courseId,
        //   interactionType: 'test_attempt',
        //   timeSpent: 30,
        // });
      }
      
      res.json({ enrollment, passed, pointsAwarded });
    } catch (error) {
      console.error('Error completing test:', error);
      res.status(500).json({ error: 'Failed to complete test' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
