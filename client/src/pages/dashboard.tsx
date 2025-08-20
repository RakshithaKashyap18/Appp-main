import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import CourseCard from "@/components/course-card";
import AnalyticsChart from "@/components/analytics-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  Target, 
  Star, 
  PlayCircle, 
  TrendingUp, 
  Lightbulb,
  Flame,
  MessageCircle,
  Brain,
  ChartLine
} from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const { data: recommendations = [] } = useQuery({
    queryKey: ["/api/recommendations"],
    retry: false,
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ["/api/enrollments"],
    retry: false,
  });

  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics/user"],
    retry: false,
  });

  const { data: learningActivity = [] } = useQuery({
    queryKey: ["/api/analytics/learning-activity"],
    retry: false,
  });

  const { data: trendingCourses = [] } = useQuery({
    queryKey: ["/api/courses"],
    retry: false,
    select: (data: any[]) => data.slice(0, 3) // Get first 3 as trending
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading your learning dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const inProgressCourses = enrollments.filter((e: any) => e.status === 'active' && e.progress < 100);
  const completedCourses = enrollments.filter((e: any) => e.status === 'completed' || e.progress === 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Courses Completed</span>
                  <span className="font-semibold text-blue-600">{completedCourses.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Learning Hours</span>
                  <span className="font-semibold text-emerald-600">{analytics?.totalLearningHours || 0}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Current Streak</span>
                  <span className="font-semibold text-amber-600">{analytics?.currentStreak || 0} days</span>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Learning Progress</h4>
                <Progress value={analytics?.overallProgress || 0} className="w-full" />
                <p className="text-xs text-gray-500 mt-1">{analytics?.overallProgress || 0}% to next milestone</p>
              </div>
            </Card>

            {/* Learning Goals Widget */}
            <Card className="p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week's Goals</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Checkbox id="goal1" />
                  <label htmlFor="goal1" className="text-sm text-gray-700">Complete React Fundamentals</label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox id="goal2" />
                  <label htmlFor="goal2" className="text-sm text-gray-700">Practice 2 coding challenges</label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox id="goal3" />
                  <label htmlFor="goal3" className="text-sm text-gray-700">Read ML research paper</label>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white mb-8">
              <h1 className="text-2xl font-bold mb-2">
                Welcome back, {user?.firstName || 'Learner'}!
              </h1>
              <p className="text-blue-100">Continue your learning journey with personalized recommendations</p>
              <div className="mt-4 flex items-center">
                <Flame className="h-5 w-5 text-amber-400 mr-2" />
                <span className="text-sm">You're on a {analytics?.currentStreak || 0}-day learning streak!</span>
              </div>
            </div>

            {/* Recommended For You */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Star className="h-5 w-5 text-amber-500 mr-2" />
                  Recommended For You
                </h2>
                <Button 
                  variant="ghost" 
                  className="text-blue-600 hover:text-blue-700"
                  onClick={() => window.location.href = "/courses"}
                >
                  View All
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {recommendations.map((course: any) => (
                  <CourseCard 
                    key={course.id} 
                    course={course} 
                    showMatchScore={true}
                  />
                ))}
              </div>
            </section>

            {/* Continue Learning */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <PlayCircle className="h-5 w-5 text-blue-600 mr-2" />
                Continue Learning
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {inProgressCourses.map((enrollment: any) => (
                  <Card key={enrollment.id} className="p-6">
                    <div className="flex items-start">
                      <img 
                        src={enrollment.course?.imageUrl || 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80'} 
                        alt={enrollment.course?.title}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{enrollment.course?.title}</h3>
                        <p className="text-gray-600 text-sm mt-1">Continue from where you left off</p>
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Progress</span>
                            <span className="font-medium">{Math.round(enrollment.progress)}%</span>
                          </div>
                          <Progress value={enrollment.progress} className="w-full mt-1" />
                        </div>
                        <Button 
                          variant="ghost" 
                          className="mt-4 text-blue-600 hover:text-blue-700 p-0"
                          onClick={() => window.location.href = `/course/${enrollment.course?.id}`}
                        >
                          Continue Lesson →
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            {/* Learning Analytics */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <ChartLine className="h-5 w-5 text-emerald-600 mr-2" />
                Learning Analytics
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900">{analytics?.totalCourses || 0}</p>
                      <p className="text-gray-600 text-sm">Total Courses</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Clock className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900">{analytics?.totalLearningHours || 0}h</p>
                      <p className="text-gray-600 text-sm">Study Time</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Trophy className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900">{analytics?.achievements || 0}</p>
                      <p className="text-gray-600 text-sm">Achievements</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Target className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900">{analytics?.averageScore || 0}%</p>
                      <p className="text-gray-600 text-sm">Avg. Score</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Learning Activity Chart */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Learning Activity</h3>
                <AnalyticsChart data={learningActivity} />
              </Card>
            </section>

            {/* AI Recommendations Insights */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Lightbulb className="h-5 w-5 text-amber-500 mr-2" />
                AI Recommendations Insights
              </h2>
              
              <Card className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Learning Profile</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Preferred Learning Style</span>
                        <span className="font-medium text-gray-900">{user?.learningStyle || 'Visual & Hands-on'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Skill Level</span>
                        <span className="font-medium text-gray-900">{user?.skillLevel || 'Intermediate'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Focus Areas</span>
                        <div className="flex space-x-2">
                          {user?.preferredTopics?.slice(0, 2).map((topic: string, index: number) => (
                            <Badge key={index} variant="secondary">{topic}</Badge>
                          )) || [
                            <Badge key="ai" variant="secondary">AI/ML</Badge>,
                            <Badge key="web" variant="secondary">Web Dev</Badge>
                          ]}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendation Accuracy</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Overall Match Rate</span>
                        <span className="font-medium text-emerald-600">{analytics?.recommendationAccuracy || 87}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Courses Completed</span>
                        <span className="font-medium text-gray-900">{completedCourses.length}/{enrollments.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Avg. Rating Given</span>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900 mr-1">{analytics?.averageRating || 4.6}</span>
                          <Star className="h-4 w-4 text-amber-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start">
                    <Brain className="h-5 w-5 text-blue-600 mt-1 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">AI Recommendation Update</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Based on your recent activity, we've updated your recommendations to include more advanced machine learning topics and hands-on projects.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* Trending Courses */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <TrendingUp className="h-5 w-5 text-red-500 mr-2" />
                Trending in Your Field
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {trendingCourses.slice(0, 3).map((course: any) => (
                  <Card key={course.id} className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-3">
                      <Flame className="h-4 w-4 text-red-500 mr-2" />
                      <span className="text-sm font-medium text-red-600">Hot Topic</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {course.totalEnrollments} students
                      </span>
                      <span className="flex items-center">
                        <Star className="h-4 w-4 text-amber-400 mr-1" />
                        {course.rating}
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.location.href = `/course/${course.id}`}
                    >
                      Explore Course
                    </Button>
                  </Card>
                ))}
              </div>
            </section>

          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg">
          <MessageCircle className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
