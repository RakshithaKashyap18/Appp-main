import { useMemo } from "react";

interface Course {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  rating: number;
  topics: string[];
  totalEnrollments: number;
}

interface UserProfile {
  preferredTopics: string[];
  skillLevel: string;
  learningStyle: string;
}

interface UserInteraction {
  courseId: string;
  interactionType: string;
  timeSpent?: number;
}

interface RecommendationEngineProps {
  courses: Course[];
  userProfile: UserProfile;
  userInteractions: UserInteraction[];
  enrollments: any[];
  limit?: number;
}

export function useRecommendationEngine({
  courses,
  userProfile,
  userInteractions,
  enrollments,
  limit = 6
}: RecommendationEngineProps) {
  
  const recommendations = useMemo(() => {
    if (!courses || courses.length === 0) return [];

    // Get enrolled course IDs to exclude from recommendations
    const enrolledCourseIds = new Set(enrollments.map(e => e.courseId));
    
    // Filter out already enrolled courses
    const availableCourses = courses.filter(course => !enrolledCourseIds.has(course.id));

    // Calculate recommendation scores for each course
    const scoredCourses = availableCourses.map(course => {
      let score = 0;
      
      // Content-based filtering
      score += calculateContentBasedScore(course, userProfile);
      
      // Collaborative filtering (simplified)
      score += calculateCollaborativeScore(course, userInteractions, courses);
      
      // Popularity boost
      score += Math.log(course.totalEnrollments + 1) * 0.1;
      
      // Rating boost
      score += course.rating * 0.2;

      return {
        ...course,
        matchScore: Math.min(100, Math.max(0, score * 10)) // Scale to 0-100
      };
    });

    // Sort by score and return top results
    return scoredCourses
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  }, [courses, userProfile, userInteractions, enrollments, limit]);

  return recommendations;
}

function calculateContentBasedScore(course: Course, userProfile: UserProfile): number {
  let score = 0;
  
  // Topic matching
  const topicMatches = course.topics.filter(topic => 
    userProfile.preferredTopics.includes(topic)
  ).length;
  score += topicMatches * 2;
  
  // Skill level matching
  const skillLevels = ['beginner', 'intermediate', 'advanced'];
  const userSkillIndex = skillLevels.indexOf(userProfile.skillLevel);
  const courseSkillIndex = skillLevels.indexOf(course.difficulty);
  
  if (userSkillIndex === courseSkillIndex) {
    score += 3; // Perfect match
  } else if (Math.abs(userSkillIndex - courseSkillIndex) === 1) {
    score += 1; // Close match
  }
  
  return score;
}

function calculateCollaborativeScore(
  course: Course, 
  userInteractions: UserInteraction[],
  allCourses: Course[]
): number {
  let score = 0;
  
  // Find courses the user has interacted with positively
  const positiveInteractions = userInteractions.filter(
    interaction => 
      interaction.interactionType === 'like' || 
      interaction.interactionType === 'complete' ||
      (interaction.timeSpent && interaction.timeSpent > 300) // 5+ minutes
  );
  
  // Find similar courses based on category and topics
  positiveInteractions.forEach(interaction => {
    const interactedCourse = allCourses.find(c => c.id === interaction.courseId);
    if (interactedCourse) {
      // Same category bonus
      if (interactedCourse.category === course.category) {
        score += 1;
      }
      
      // Shared topics bonus
      const sharedTopics = interactedCourse.topics.filter(topic =>
        course.topics.includes(topic)
      ).length;
      score += sharedTopics * 0.5;
    }
  });
  
  return score;
}

export default function RecommendationEngine(props: RecommendationEngineProps) {
  const recommendations = useRecommendationEngine(props);
  return <div>{/* This component can be used to display recommendations */}</div>;
}
