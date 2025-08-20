import React, { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  provider?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginMutation: any;
  registerMutation: any;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/user"],
    queryFn: async () => {
      const response = await fetch("/api/user", { credentials: "include" });
      if (response.status === 401) return null;
      if (!response.ok) throw new Error("Failed to fetch user");
      return response.json();
    },
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(credentials),
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Login failed");
      }
      return response.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({ title: "Welcome back!", description: "Successfully signed in." });
    },
    onError: (error: Error) => {
      toast({ title: "Sign-in Failed", description: error.message, variant: "destructive" });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; displayName?: string }) => {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Registration failed");
      }
      return response.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({ title: "Account Created!", description: "Welcome to EduMind!" });
    },
    onError: (error: Error) => {
      toast({ title: "Registration Failed", description: error.message, variant: "destructive" });
    },
  });

  const logout = async () => {
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
      queryClient.setQueryData(["/api/user"], null);
      queryClient.clear();
      toast({ title: "Signed Out", description: "You have been successfully signed out." });
      window.location.href = "/auth";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const contextValue = {
    user: user || null,
    isAuthenticated: !!user,
    isLoading,
    loginMutation,
    registerMutation,
    logout,
  };

  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    // Return mock data for development
    return {
      user: { id: '1', email: 'demo@example.com', displayName: 'Demo User' },
      isAuthenticated: true,
      isLoading: false,
      loginMutation: { mutateAsync: async () => {}, isPending: false },
      registerMutation: { mutateAsync: async () => {}, isPending: false },
      logout: () => console.log('logout')
    };
  }
  return context;
}