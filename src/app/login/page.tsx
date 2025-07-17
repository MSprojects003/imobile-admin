"use client";
import { Login } from "@/lib/db/admin";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Admin {
  password: string;
  // add other fields if needed
}

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: admins = [] } = useQuery<Admin[]>({
    queryKey: ['admin'],
    queryFn: Login,
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Check if any admin has the entered password
    const found = admins.find((admin) => admin.password === password);
    if (found) {
      localStorage.setItem('admin_session', 'true');
      toast.success("Login success");
      setTimeout(() => {
        setIsLoading(false);
        router.push("/");
      }, 800);
    } else {
      toast.error("Invalid password");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Laptop-style Login Card */}
        <div className="bg-white shadow-2xl rounded-3xl p-10 flex flex-col items-center relative">
          {/* Admin Avatar */}
          <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg border-4 border-white">
              {/* Placeholder user icon */}
              <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="8" r="4" strokeWidth="2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 20c0-2.5 3.5-4.5 8-4.5s8 2 8 4.5" />
              </svg>
            </div>
            <span className="mt-2 text-lg font-semibold text-gray-800">Admin Login</span>
          </div>
          <div className="mt-16 w-full">
            <h2 className="text-2xl font-bold text-center mb-6">Sign In to DataCellular</h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-60"
                disabled={isLoading || !password}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            © 2024 DataCellular. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
