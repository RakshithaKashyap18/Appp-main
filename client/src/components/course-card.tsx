import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Clock } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    duration: number;
    rating: number;
    imageUrl?: string;
    videoUrl?: string;
    instructorName?: string;
    matchScore?: number;
  };
  showMatchScore?: boolean;
  enrollmentStatus?: 'enrolled' | 'completed' | null;
}

export default function CourseCard({ course, showMatchScore = false, enrollmentStatus = null }: CourseCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const enrollMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/enrollments", {
        courseId: course.id
      });
    },
    onSuccess: () => {
      toast({
        title: "Enrolled Successfully",
        description: `You've been enrolled in ${course.title}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Enrollment Failed",
        description: "Failed to enroll in the course. Please try again.",
        variant: "destructive",
      });
    },
  });

  const trackInteraction = useMutation({
    mutationFn: async (interactionType: string) => {
      await apiRequest("POST", "/api/interactions", {
        courseId: course.id,
        interactionType,
      });
    },
  });

  const handleCourseClick = () => {
    trackInteraction.mutate("view");
    window.location.href = `/course/${course.id}`;
  };

  const handleEnroll = () => {
    enrollMutation.mutate();
    trackInteraction.mutate("enroll");
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'AI/ML': 'bg-blue-100 text-blue-800',
      'Frontend': 'bg-emerald-100 text-emerald-800',
      'Backend': 'bg-purple-100 text-purple-800',
      'Data Science': 'bg-orange-100 text-orange-800',
      'Mobile': 'bg-pink-100 text-pink-800',
      'DevOps': 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: { [key: string]: string } = {
      'beginner': 'bg-green-100 text-green-800',
      'intermediate': 'bg-yellow-100 text-yellow-800',
      'advanced': 'bg-red-100 text-red-800',
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer" onClick={handleCourseClick}>
      <div className="aspect-video w-full overflow-hidden">
        <img 
          src={course.imageUrl || 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200'} 
          alt={course.title}
          className="w-full h-full object-cover"
        />
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Badge className={getCategoryColor(course.category)}>{course.category}</Badge>
            <Badge variant="outline" className={getDifficultyColor(course.difficulty)}>
              {course.difficulty}
            </Badge>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Star className="h-4 w-4 text-amber-400 mr-1" />
            <span>{course.rating.toFixed(1)}</span>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500 flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {course.duration} hours
          </span>
          {showMatchScore && course.matchScore && (
            <span className="text-sm font-medium text-blue-600">
              {Math.round(course.matchScore)}% Match
            </span>
          )}
        </div>
        
        {course.instructorName && (
          <p className="text-sm text-gray-500 mb-4">By {course.instructorName}</p>
        )}
        
        <Button 
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            if (enrollmentStatus === 'enrolled') {
              window.location.href = `/course/${course.id}`;
            } else if (enrollmentStatus === 'completed') {
              window.location.href = `/course/${course.id}`;
            } else {
              handleEnroll();
            }
          }}
          disabled={enrollMutation.isPending}
        >
          {enrollMutation.isPending 
            ? 'Enrolling...' 
            : enrollmentStatus === 'enrolled' 
              ? 'Continue Learning'
              : enrollmentStatus === 'completed'
                ? 'View Certificate'
                : enrollmentStatus === null
                  ? 'Start Course'
                  : 'Enroll Now'
          }
        </Button>
      </CardContent>
    </Card>
  );
}
