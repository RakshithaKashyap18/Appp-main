import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Award, Crown, Star, Target } from "lucide-react";

export default function Leaderboard() {
  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ["/api/leaderboard"],
    retry: false,
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Trophy className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <Award className="h-5 w-5 text-blue-500" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500";
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600";
      default:
        return "bg-gradient-to-r from-blue-500 to-blue-600";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🏆 Leaderboard</h1>
          <p className="text-xl text-gray-600">Top performers in the EduMind community</p>
        </div>

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="mb-12">
            <div className="flex justify-center items-end space-x-4 max-w-4xl mx-auto">
              {/* 2nd Place */}
              <div className="flex flex-col items-center">
                <Card className="w-48 border-2 border-gray-300 shadow-lg">
                  <CardContent className="pt-6 text-center">
                    <div className="relative mb-4">
                      <Avatar className="h-16 w-16 mx-auto border-4 border-gray-300">
                        <AvatarImage src={leaderboard[1]?.photoURL} />
                        <AvatarFallback className="text-lg font-bold">
                          {leaderboard[1]?.displayName?.[0] || leaderboard[1]?.email?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-2 -right-2">
                        <Trophy className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                    <h3 className="font-bold text-lg mb-2">{leaderboard[1]?.displayName || leaderboard[1]?.email}</h3>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-gray-600">{leaderboard[1]?.totalPoints} pts</p>
                      <p className="text-sm text-gray-500">{leaderboard[1]?.coursesCompleted} courses</p>
                    </div>
                  </CardContent>
                </Card>
                <div className="mt-2 px-4 py-2 bg-gray-300 text-gray-800 rounded-full font-bold">
                  2nd Place
                </div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center">
                <Card className="w-52 border-4 border-yellow-400 shadow-xl transform scale-105">
                  <CardContent className="pt-6 text-center">
                    <div className="relative mb-4">
                      <Avatar className="h-20 w-20 mx-auto border-4 border-yellow-400">
                        <AvatarImage src={leaderboard[0]?.photoURL} />
                        <AvatarFallback className="text-xl font-bold">
                          {leaderboard[0]?.displayName?.[0] || leaderboard[0]?.email?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-3 -right-3">
                        <Crown className="h-10 w-10 text-yellow-500" />
                      </div>
                    </div>
                    <h3 className="font-bold text-xl mb-2">{leaderboard[0]?.displayName || leaderboard[0]?.email}</h3>
                    <div className="space-y-1">
                      <p className="text-3xl font-bold text-yellow-600">{leaderboard[0]?.totalPoints} pts</p>
                      <p className="text-sm text-gray-500">{leaderboard[0]?.coursesCompleted} courses</p>
                    </div>
                  </CardContent>
                </Card>
                <div className="mt-2 px-6 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-full font-bold">
                  🥇 Champion
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center">
                <Card className="w-48 border-2 border-amber-400 shadow-lg">
                  <CardContent className="pt-6 text-center">
                    <div className="relative mb-4">
                      <Avatar className="h-16 w-16 mx-auto border-4 border-amber-400">
                        <AvatarImage src={leaderboard[2]?.photoURL} />
                        <AvatarFallback className="text-lg font-bold">
                          {leaderboard[2]?.displayName?.[0] || leaderboard[2]?.email?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-2 -right-2">
                        <Medal className="h-8 w-8 text-amber-600" />
                      </div>
                    </div>
                    <h3 className="font-bold text-lg mb-2">{leaderboard[2]?.displayName || leaderboard[2]?.email}</h3>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-amber-600">{leaderboard[2]?.totalPoints} pts</p>
                      <p className="text-sm text-gray-500">{leaderboard[2]?.coursesCompleted} courses</p>
                    </div>
                  </CardContent>
                </Card>
                <div className="mt-2 px-4 py-2 bg-amber-400 text-white rounded-full font-bold">
                  3rd Place
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6" />
              Complete Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((user: any, index: number) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                    index < 3 ? getRankColor(index + 1) + " text-white" : "bg-white"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getRankIcon(index + 1)}
                      <span className="text-2xl font-bold">#{index + 1}</span>
                    </div>
                    
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.photoURL} />
                      <AvatarFallback>
                        {user.displayName?.[0] || user.email?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h3 className="font-semibold text-lg">
                        {user.displayName || user.email}
                      </h3>
                      <p className={`text-sm ${index < 3 ? "text-white/80" : "text-gray-500"}`}>
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-6">
                      <div>
                        <p className="text-2xl font-bold">{user.totalPoints}</p>
                        <p className={`text-sm ${index < 3 ? "text-white/80" : "text-gray-500"}`}>
                          points
                        </p>
                      </div>
                      <div>
                        <p className="text-xl font-semibold">{user.coursesCompleted}</p>
                        <p className={`text-sm ${index < 3 ? "text-white/80" : "text-gray-500"}`}>
                          courses
                        </p>
                      </div>
                      <Badge variant={index < 3 ? "secondary" : "outline"} className="ml-2">
                        {user.skillLevel}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {leaderboard.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Rankings Yet</h3>
                <p className="text-gray-500">Complete some courses to appear on the leaderboard!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Points System Info */}
        <Card className="max-w-4xl mx-auto mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-6 w-6" />
              How Points Work
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-2">100</div>
                <p className="font-medium">Course Completion</p>
                <p className="text-sm text-gray-600">Finish video + pass test</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-2">+20</div>
                <p className="font-medium">Perfect Test Score</p>
                <p className="text-sm text-gray-600">Score 100% on test</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-2">+10</div>
                <p className="font-medium">Daily Engagement</p>
                <p className="text-sm text-gray-600">Active learning streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}