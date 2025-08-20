import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import CourseCard from "@/components/course-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Clock, Trophy, Calendar } from "lucide-react";

export default function MyLearning() {
  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ["/api/enrollments"],
    retry: false,
  });

  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics/user"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">Loading your learning progress...</p>
          </div>
        </div>
      </div>
    );
  }

  const activeCourses = enrollments.filter((e: any) => e.status === 'active' && e.progress < 100);
  const completedCourses = enrollments.filter((e: any) => e.status === 'completed' || e.progress === 100);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Learning</h1>
          <p className="text-gray-600">Track your progress and continue your learning journey</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{enrollments.length}</p>
                  <p className="text-gray-600 text-sm">Total Enrolled</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Trophy className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{completedCourses.length}</p>
                  <p className="text-gray-600 text-sm">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{analytics?.totalLearningHours || 0}h</p>
                  <p className="text-gray-600 text-sm">Learning Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{analytics?.currentStreak || 0}</p>
                  <p className="text-gray-600 text-sm">Day Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Active Courses ({activeCourses.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedCourses.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-6">
            {activeCourses.length === 0 ? (
              <Card className="p-12 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Courses</h3>
                <p className="text-gray-600 mb-4">Start learning by enrolling in a course</p>
                <Button onClick={() => window.location.href = '/courses'}>
                  Browse Courses
                </Button>
              </Card>
            ) : (
              <div className="space-y-6">
                {activeCourses.map((enrollment: any) => (
                  <Card key={enrollment.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <img 
                          src={enrollment.course?.imageUrl || 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=120&h=80'} 
                          alt={enrollment.course?.title}
                          className="w-32 h-20 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {enrollment.course?.title}
                              </h3>
                              <p className="text-gray-600 text-sm mb-2">
                                {enrollment.course?.category} • {enrollment.course?.difficulty}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                                <span>Duration: {enrollment.course?.duration}h</span>
                                <span>•</span>
                                <span>Last accessed: {new Date(enrollment.lastAccessedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <Badge variant="outline">
                              {Math.round(enrollment.progress)}% Complete
                            </Badge>
                          </div>
                          
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-medium">{Math.round(enrollment.progress)}%</span>
                            </div>
                            <Progress value={enrollment.progress} className="w-full" />
                          </div>
                          
                          <Button className="w-full sm:w-auto">
                            Continue Learning
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-6">
            {completedCourses.length === 0 ? (
              <Card className="p-12 text-center">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Completed Courses</h3>
                <p className="text-gray-600">Complete your first course to see it here</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedCourses.map((enrollment: any) => (
                  <CourseCard 
                    key={enrollment.id} 
                    course={enrollment.course} 
                    enrollmentStatus="completed"
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
