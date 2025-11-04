// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "@/services/api";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      // 1. Get access token
      const tokenData = await api.login(username, password);

      // 2. Get user data
      const userData = await api.getCurrentUser(tokenData.access_token);

      // 3. Login (saves to localStorage and redirects)
      login(tokenData.access_token, userData);
    } catch (error: unknown) {
      let errorMessage = "An error occurred during login";

      if (error instanceof Error) {
        if (error.message === "UNAUTHORIZED") {
          errorMessage = "Invalid username or password";
        } else {
          errorMessage = error.message;
        }
      }

      setMessage(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass rounded-3xl p-10 shadow-2xl w-full max-w-md animate-scale-in border-2 border-white/30">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-xl mb-4 animate-fade-in">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-700 font-medium">Login to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-bold text-gray-800 mb-2"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 text-gray-900 font-medium transition-all duration-200 hover:border-purple-300 bg-white/90"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-bold text-gray-800 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 text-gray-900 font-medium transition-all duration-200 hover:border-purple-300 bg-white/90"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white py-4 rounded-xl font-bold text-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-6"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {message && (
          <div
            className={`mt-6 p-4 rounded-xl text-center font-semibold animate-scale-in ${
              message.startsWith("Error")
                ? "glass border-2 border-red-300 bg-red-50/90 text-red-800"
                : "glass border-2 border-green-300 bg-green-50/90 text-green-800"
            }`}
          >
            {message}
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-gray-700 font-medium">
            Don&#39;t have an account?{" "}
            <Link
              href="/"
              className="font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent hover:scale-105 inline-block transition-transform duration-200"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
