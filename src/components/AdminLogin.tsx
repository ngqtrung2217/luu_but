"use client";

import { useState, useEffect } from "react";
import { motion } from "@/utils/motion";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuth();

  // Direct admin login function as a fallback
  const directAdminLogin = () => {
    if (
      email === process.env.NEXT_PUBLIC_ADMIN_EMAIL &&
      password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD_FOR_LOGIN
    ) {
      console.log("Direct admin login: Setting isAdminAuthenticated to true");
      localStorage.setItem("isAdminAuthenticated", "true");
      toast.success("Đăng nhập thành công!");
      window.location.reload();
      return true;
    }
    return false;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Vui lòng nhập email và mật khẩu");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Login attempt with:", {
        email,
        passwordLength: password.length,
      });

      // Try specific hardcoded values for debugging if they match env variables
      if (
        email === process.env.NEXT_PUBLIC_ADMIN_EMAIL &&
        password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD_FOR_LOGIN
      ) {
        console.log("Credentials match the expected values from .env.local");
      }
      // Try direct admin login first
      const directLoginSuccessful = directAdminLogin();

      if (!directLoginSuccessful) {
        // Use the admin login credentials from .env.local
        const { error, success } = await signIn(email, password);
        console.log("Login result:", { error, success });

        if (error) throw error;
        if (!success) throw new Error("Email hoặc mật khẩu không chính xác");
      }

      toast.success("Đăng nhập thành công!");

      // Force page reload after successful login
      window.location.reload();
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(`Lỗi đăng nhập: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-900/50 backdrop-blur-md p-8 rounded-lg border border-gray-700 shadow-xl w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Đăng nhập Admin
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Đang đăng nhập...
              </span>
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
