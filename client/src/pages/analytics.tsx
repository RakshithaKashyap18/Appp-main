import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import AnalyticsChart from "@/components/analytics-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  Target, 
  TrendingUp, 
  Calendar,
  Star,
  Award
} from "lucide-react";

export default function Analytics() {
  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics/user"],
    retry: false,
  });

  const { data: learningActivity = [] } = useQuery({
    queryKey: ["/api/analytics/learning-activity"],
    retry: false,
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ["/api/enrollments"],
    retry: false,
  });

  const completedCourses = enrollments.filter((e: any) => e.status === 'completed' || e.progress === 100);
  const avgRating = completedCourses.reduce((sum: number, e: any) => sum + (e.rating || 0), 0) / (completedCourses.length || 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Learning Analytics</h1>
          <p className="text-gray-600">Track your learning progress and insights</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{analytics?.totalCourses || 0}</p>
                  <p className="text-gray-600 text-sm">Total Courses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Clock className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{analytics?.totalLearningHours || 0}h</p>
                  <p className="text-gray-600 text-sm">Study Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Trophy className="h-5 w-5 text-amber-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{analytics?.achievements || 0}</p>
                  <p className="text-gray-600 text-sm">Achievements</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Target className="h-5 w-5 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{Math.round(avgRating * 20) || 0}%</p>
                  <p className="text-gray-600 text-sm">Avg. Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Learning Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Learning Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <AnalyticsChart data={learningActivity} />
            </CardContent>
          </Card>

          {/* Learning Streak */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-amber-600 mb-2">
                  {analytics?.currentStreak || 0}
                </div>
                <p className="text-gray-600 mb-4">Days in a row</p>
                <div className="flex justify-center space-x-1">
                  {Array.from({ length: 7 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        i < (analytics?.currentStreak || 0) 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Progress Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Overall Progress</span>
                  <span className="font-medium">{analytics?.overallProgress || 0}%</span>
                </div>
                <Progress value={analytics?.overallProgress || 0} />
              </div>
              
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Courses Completed</span>
                  <span className="font-medium">{completedCourses.length}/{enrollments.length}</span>
                </div>
                <Progress value={(completedCourses.length / (enrollments.length || 1)) * 100} />
              </div>
              
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Average Rating</span>
                  <span className="font-medium flex items-center">
                    {avgRating.toFixed(1)} <Star className="h-3 w-3 text-amber-400 ml-1" />
                  </span>
                </div>
                <Progress value={avgRating * 20} />
              </div>
            </CardContent>
          </Card>

          {/* Learning Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { category: 'AI/ML', count: 5, color: 'bg-blue-100 text-blue-800' },
                  { category: 'Frontend', count: 3, color: 'bg-emerald-100 text-emerald-800' },
                  { category: 'Backend', count: 2, color: 'bg-purple-100 text-purple-800' },
                  { category: 'Data Science', count: 2, color: 'bg-orange-100 text-orange-800' },
                ].map((item) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <Badge className={item.color}>{item.category}</Badge>
                    <span className="text-sm text-gray-600">{item.count} courses</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { title: 'First Course Completed', date: '2 days ago', icon: Trophy },
                  { title: '7-Day Streak', date: '1 week ago', icon: Calendar },
                  { title: 'Perfect Score', date: '2 weeks ago', icon: Award },
                  { title: 'Quick Learner', date: '3 weeks ago', icon: TrendingUp },
                ].map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <achievement.icon className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{achievement.title}</p>
                      <p className="text-xs text-gray-500">{achievement.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
