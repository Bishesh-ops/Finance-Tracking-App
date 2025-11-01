// src/app/context/AuthContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

// ============================================================================
// TYPES
// ============================================================================

interface User {
  id: number;
  username: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isLoading: boolean;
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const AuthContext = createContext<AuthContextType | null>(null);

// ============================================================================
// AUTH PROVIDER COMPONENT
// ============================================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load auth state from localStorage on mount (client-side only)
  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }

    try {
      const storedToken = localStorage.getItem("auth_token");
      const storedUser = localStorage.getItem("auth_user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error loading auth state:", error);
      // Clear potentially corrupted data
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);

    // Persist to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", newToken);
      localStorage.setItem("auth_user", JSON.stringify(newUser));
    }

    // Redirect to dashboard
    router.push("/dashboard");
  };

  const logout = () => {
    setToken(null);
    setUser(null);

    // Clear localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    }

    // Redirect to login
    router.push("/login");
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        isAuthenticated,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// CUSTOM HOOK
// ============================================================================

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
