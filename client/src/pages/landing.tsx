import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Brain, TrendingUp, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <Brain className="h-16 w-16 text-blue-600 mr-4" />
            <h1 className="text-5xl font-bold text-gray-900">EduMind</h1>
          </div>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Your intelligent learning companion powered by AI. Get personalized course recommendations
            tailored to your learning style and goals.
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/api/login'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            Start Learning Today
          </Button>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <div className="p-2 bg-blue-100 rounded-lg w-fit">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Vast Course Library</CardTitle>
              <CardDescription>
                Access thousands of courses across AI/ML, Web Development, Data Science, and more
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="p-2 bg-emerald-100 rounded-lg w-fit">
                <Brain className="h-6 w-6 text-emerald-600" />
              </div>
              <CardTitle>AI-Powered Recommendations</CardTitle>
              <CardDescription>
                Get personalized course suggestions based on your learning patterns and preferences
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="p-2 bg-purple-100 rounded-lg w-fit">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Track Your Progress</CardTitle>
              <CardDescription>
                Monitor your learning journey with detailed analytics and achievement tracking
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-100">Active Learners</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Courses Available</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-blue-100">Recommendation Accuracy</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.8/5</div>
              <div className="text-blue-100">Average Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to Transform Your Learning?
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Join thousands of learners who are advancing their careers with EduMind
        </p>
        <Button 
          size="lg" 
          onClick={() => window.location.href = '/api/login'}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
        >
          Get Started Now
        </Button>
      </div>
    </div>
  );
}
