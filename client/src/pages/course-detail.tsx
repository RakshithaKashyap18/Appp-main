import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import Navigation from "@/components/navigation";
import MultiVideoPlayer from "@/components/multi-video-player";
import CourseTest from "@/components/course-test";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { 
  Star, 
  Clock, 
  Users, 
  BookOpen, 
  PlayCircle,
  CheckCircle,
  Award,
  Trophy,
  Target
} from "lucide-react";

export default function CourseDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: course, isLoading } = useQuery({
    queryKey: ["/api/courses", id],
    retry: false,
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ["/api/enrollments"],
    retry: false,
  });

  const enrollMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/enrollments", {
        courseId: id
      });
    },
    onSuccess: () => {
      toast({
        title: "Enrolled Successfully",
        description: `You've been enrolled in ${(course as any)?.title}`,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">Loading course details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
            <p className="text-gray-600">The course you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const currentEnrollment = (enrollments as any[]).find((e: any) => e.courseId === (course as any)?.id);
  const isEnrolled = !!currentEnrollment;
  // Test is always available once enrolled - videos are for learning only
  const videoCompleted = isEnrolled;
  const testCompleted = currentEnrollment?.testCompleted || false;
  const courseCompleted = currentEnrollment?.status === 'completed';

  const handleVideoComplete = () => {
    setActiveTab("test");
  };

  const handleTestComplete = (passed: boolean, score: number) => {
    if (passed) {
      toast({
        title: "Course Completed! 🏆",
        description: `Congratulations! You've successfully completed ${(course as any)?.title} with a score of ${score}%.`,
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'AI/ML': 'bg-blue-100 text-blue-800',
      'Frontend': 'bg-emerald-100 text-emerald-800',
      'Backend': 'bg-purple-100 text-purple-800',
      'Data Science': 'bg-orange-100 text-orange-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className={getCategoryColor((course as any)?.category || '')}>
                      {(course as any)?.category}
                    </Badge>
                    <Badge variant="outline">
                      {(course as any)?.difficulty}
                    </Badge>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{(course as any)?.title}</h1>
                  <p className="text-gray-600">{(course as any)?.description}</p>
                </div>
                <img 
                  src={(course as any)?.imageUrl || 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?auto=format&fit=crop&w=300&h=200'} 
                  alt={(course as any)?.title}
                  className="w-48 h-32 rounded-lg object-cover ml-6"
                />
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-amber-400 mr-1" />
                  <span>{(course as any)?.rating?.toFixed(1)} ({(course as any)?.totalRatings} reviews)</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{(course as any)?.duration} hours</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{(course as any)?.totalEnrollments} students</span>
                </div>
              </div>
              
              {(course as any)?.instructorName && (
                <p className="text-sm text-gray-600 mt-2">
                  Instructor: <span className="font-medium">{(course as any).instructorName}</span>
                </p>
              )}
            </div>

            {/* Course Video Preview */}
            {(course as any)?.videoUrl && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Course Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video">
                    <iframe
                      width="100%"
                      height="100%"
                      src={(course as any).videoUrl?.includes('youtube.com/watch') 
                        ? (course as any).videoUrl.replace('watch?v=', 'embed/')
                        : (course as any).videoUrl?.includes('youtu.be/') 
                          ? (course as any).videoUrl.replace('youtu.be/', 'youtube.com/embed/')
                          : (course as any).videoUrl
                      }
                      title="Course Preview Video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="rounded-lg"
                    ></iframe>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Course Content Preview */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>What You'll Learn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(course as any)?.topics?.map((topic: string, index: number) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                      <span className="text-sm text-gray-700">{topic}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Course Learning Content - Only for enrolled students */}
            {isEnrolled && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="video">
                    Video {videoCompleted && <CheckCircle className="h-4 w-4 ml-1 text-green-600" />}
                  </TabsTrigger>
                  <TabsTrigger value="test" disabled={!videoCompleted}>
                    Test {testCompleted && <Trophy className="h-4 w-4 ml-1 text-green-600" />}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Course Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{(course as any)?.description}</p>
                      <div className="space-y-2">
                        <h4 className="font-semibold">What you'll learn:</h4>
                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                          <li>Core concepts and fundamentals</li>
                          <li>Practical applications and examples</li>
                          <li>Best practices and industry standards</li>
                          <li>Hands-on exercises and projects</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="video" className="mt-6">
                  {(course as any)?.videos && currentEnrollment ? (
                    <MultiVideoPlayer
                      videos={(course as any).videos || []}
                      enrollmentId={currentEnrollment.id}
                      completedVideoIds={(currentEnrollment as any)?.videosCompleted || []}
                      onVideoComplete={handleVideoComplete}
                    />
                  ) : (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <p className="text-gray-500">No videos available for this course</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="test" className="mt-6">
                  {videoCompleted && currentEnrollment ? (
                    <CourseTest
                      enrollmentId={currentEnrollment.id}
                      courseTitle={(course as any)?.title || ''}
                      onTestComplete={handleTestComplete}
                    />
                  ) : (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-2">Enroll to take the test</p>
                        <p className="text-sm text-gray-400">Test completion drives your course progress and completion</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            )}

            {/* Course Syllabus */}
            <Card>
              <CardHeader>
                <CardTitle>Course Syllabus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    "Introduction and Setup",
                    "Core Concepts",
                    "Hands-on Projects",
                    "Advanced Topics",
                    "Final Assessment"
                  ].map((module, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900">
                          Module {index + 1}: {module}
                        </span>
                      </div>
                      <PlayCircle className="h-4 w-4 text-blue-600" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Card className="mb-6">
                <CardContent className="p-6">
                  {isEnrolled ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Progress</span>
                        <span className="text-sm font-bold text-gray-900">
                          {Math.round(currentEnrollment?.progress || 0)}%
                        </span>
                      </div>
                      <Progress value={currentEnrollment?.progress || 0} />
                      
                      {courseCompleted ? (
                        <div className="flex items-center justify-center p-4 bg-emerald-50 rounded-lg">
                          <Award className="h-5 w-5 text-emerald-600 mr-2" />
                          <span className="text-emerald-700 font-medium">Course Completed!</span>
                        </div>
                      ) : (
                        <Button 
                          className="w-full"
                          onClick={() => {
                            setActiveTab("video");
                            toast({
                              title: "Starting Video",
                              description: "Taking you to the course video...",
                            });
                          }}
                        >
                          Continue Learning
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 mb-1">Free Course</div>
                        <p className="text-sm text-gray-600">Start learning today</p>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={() => enrollMutation.mutate()}
                        disabled={enrollMutation.isPending}
                      >
                        {enrollMutation.isPending ? 'Enrolling...' : 'Enroll Now'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Course Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Students</span>
                    <span className="font-medium">{(course as any)?.totalEnrollments}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Average Rating</span>
                    <div className="flex items-center">
                      <span className="font-medium mr-1">{(course as any)?.rating?.toFixed(1)}</span>
                      <Star className="h-4 w-4 text-amber-400" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">{(course as any)?.duration} hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Difficulty</span>
                    <Badge variant="outline">{(course as any)?.difficulty}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
