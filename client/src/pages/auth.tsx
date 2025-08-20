import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { signInWithPopup, User as FirebaseUser } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, BookOpen, Users, TrendingUp, Award } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, loginMutation, registerMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const [registerForm, setRegisterForm] = useState({
    email: "",
    password: "",
    displayName: "",
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  if (user) {
    return null; // Will redirect above
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginMutation.mutateAsync(loginForm);
      setLocation("/");
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerMutation.mutateAsync(registerForm);
      setLocation("/");
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      console.log('Starting Google sign-in...');
      googleProvider.addScope('email');
      googleProvider.addScope('profile');
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user as FirebaseUser;
      
      console.log('Google sign-in successful, user:', {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        providerData: user.providerData
      });

      console.log('Google credential result:', result);
      
      let userEmail = user.email;
      if (!userEmail && user.providerData && user.providerData.length > 0) {
        userEmail = user.providerData[0].email;
        console.log('Using email from provider data:', userEmail);
      }

      if (!userEmail) {
        throw new Error('Unable to retrieve email from Google account. This might be due to account settings or Firebase configuration. Please use email/password sign-in instead.');
      }
      
      const idToken = await user.getIdToken();
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          idToken,
          uid: user.uid,
          email: userEmail,
          displayName: user.displayName,
          photoURL: user.photoURL,
        }),
      });

      console.log('Backend response status:', response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log('Backend authentication successful:', userData);
        window.location.reload();
        toast({
          title: "Welcome!",
          description: "Successfully signed in with Google.",
        });
      } else {
        const errorText = await response.text();
        console.error('Backend authentication failed:', errorText);
        throw new Error(errorText || 'Failed to authenticate with backend');
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      let errorMessage = error.message || "Failed to sign in with Google";
      if (error.code === 'auth/popup-blocked') {
        errorMessage = "Pop-up blocked. Please allow pop-ups for this site.";
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign-in cancelled. Please try again.";
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = "This domain is not authorized for Google sign-in.";
      }
      
      toast({
        title: "Sign-in Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
              Welcome to <span className="text-blue-600">EduMind</span>
            </h1>
            <p className="text-xl text-gray-600">
              Your AI-powered learning companion. Discover courses tailored to your goals and track your progress with intelligent insights.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center space-y-2">
              <div className="bg-white p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center shadow-md">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Expert Courses</h3>
              <p className="text-sm text-gray-600">Learn from industry professionals</p>
            </div>
            <div className="text-center space-y-2">
              <div className="bg-white p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center shadow-md">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Track Progress</h3>
              <p className="text-sm text-gray-600">Monitor your learning journey</p>
            </div>
            <div className="text-center space-y-2">
              <div className="bg-white p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center shadow-md">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Community</h3>
              <p className="text-sm text-gray-600">Connect with fellow learners</p>
            </div>
            <div className="text-center space-y-2">
              <div className="bg-white p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center shadow-md">
                <Award className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Certifications</h3>
              <p className="text-sm text-gray-600">Earn recognized certificates</p>
            </div>
          </div>
        </div>
        {/* Auth Forms */}
        <Card className="w-full max-w-md mx-auto shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Get Started</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>
              {/* Google Sign In Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={loginMutation.isPending || registerMutation.isPending}
              >
                <FcGoogle className="h-4 w-4 mr-2" />
                Continue with Google
              </Button>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                <p className="font-medium">Firebase Domain Authorization Needed</p>
                <p>For deployed apps, add your replit.app domain to Firebase Console → Authentication → Settings → Authorized domains. Use email sign-in as backup.</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Sign in with email</span>
                </div>
              </div>
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginForm.email}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={(e) =>
                          setLoginForm({ ...loginForm, password: e.target.value })
                        }
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleEmailRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Display Name (Optional)</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Enter your name"
                      value={registerForm.displayName}
                      onChange={(e) =>
                        setRegisterForm({ ...registerForm, displayName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Enter your email"
                      value={registerForm.email}
                      onChange={(e) =>
                        setRegisterForm({ ...registerForm, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password (min. 6 characters)"
                        value={registerForm.password}
                        onChange={(e) =>
                          setRegisterForm({ ...registerForm, password: e.target.value })
                        }
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}