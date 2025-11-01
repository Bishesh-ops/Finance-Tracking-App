// src/app/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

// Define the shape of your context's state
interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

// 1. Create the context with a default value of `null`
const AuthContext = createContext<AuthContextType | null>(null);

// Create the AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  const login = (newToken: string) => {
    setToken(newToken);
    // In a real app, you'd save this to localStorage or httpOnly cookies
    console.log("Token saved:", newToken);
    router.push("/dashboard"); // <-- Redirect to dashboard after login!
  };

  const logout = () => {
    setToken(null);
    // Clear token from storage
    router.push("/login"); // Redirect to login on logout
  };

  const isAuthenticated = () => {
    return !!token;
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

// Create a custom hook to easily use the context
export function useAuth() {
  // 2. The type of `context` is inferred as `AuthContextType | null`
  const context = useContext(AuthContext);

  // 3. Check for `null` instead of `undefined`
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
