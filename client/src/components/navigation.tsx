import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Bell, Brain, Search } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Navigation() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", active: location === "/" },
    { path: "/courses", label: "Browse Courses", active: location === "/courses" },
    { path: "/my-learning", label: "My Learning", active: location === "/my-learning" },
    { path: "/analytics", label: "Analytics", active: location === "/analytics" },
    { path: "/leaderboard", label: "Leaderboard", active: location === "/leaderboard" },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Brain className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">EduMind</span>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <Link key={item.path} href={item.path}>
                    <span
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        item.active
                          ? "text-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-end">
            <div className="max-w-lg w-full lg:max-w-xs">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search courses, topics..."
                  type="search"
                />
              </div>
            </div>
          </div>
          
          {/* User Profile */}
          <div className="ml-4 flex items-center md:ml-6">
            <Button variant="ghost" size="sm" className="p-2">
              <Bell className="h-4 w-4 text-gray-400 hover:text-gray-500" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="ml-3">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={user?.photoURL} 
                      alt="User avatar"
                      className="object-cover"
                    />
                    <AvatarFallback>
                      {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="ml-2 text-sm font-medium text-gray-700 hidden sm:block">
                    {user?.displayName || user?.email}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                <DropdownMenuItem>Learning Preferences</DropdownMenuItem>
                <DropdownMenuItem>Help & Support</DropdownMenuItem>
                <DropdownMenuItem onClick={() => logout()}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
