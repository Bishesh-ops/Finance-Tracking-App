// src/app/page.tsx
"use client";

import { useState } from "react";
import { api } from "@/services/api";
import Link from "next/link";

export default function HomePage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      const newUser = await api.register(username, password);
      setMessage(`Success! User ${newUser.username} registered. Please login.`);
      setUsername("");
      setPassword("");
    } catch (error: unknown) {
      let errorMessage = "An error occurred during registration";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setMessage(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass rounded-2xl p-10 shadow-lg w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-blue-500 shadow-md mb-4 animate-fade-in">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            Create Account
          </h1>
          <p className="text-gray-600 font-medium">Start your financial journey</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
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
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 text-gray-900 transition-all duration-200 hover:border-blue-400 bg-white"
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
              placeholder="Choose a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 text-gray-900 transition-all duration-200 hover:border-blue-400 bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-4 rounded-lg font-semibold text-base hover:bg-blue-600 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500 mt-6"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registering...
              </span>
            ) : (
              "Create Account"
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
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-blue-500 hover:scale-105 inline-block transition-transform duration-200"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
