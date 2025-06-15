"use client";

import Link from "next/link";
import { motion } from "@/utils/motion";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

interface NavigationProps {
  activeSection?: number;
}

export default function Navigation({ activeSection = 0 }: NavigationProps) {
  const { session, isAdmin, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: "Trang chủ", href: "/" },
    { label: "Lưu bút", href: "#guestbook" },
    { label: "Liên hệ", href: "#contact" },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gray-900/70 backdrop-blur-md border-b border-gray-800"
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-xl font-bold text-white hover:text-purple-400 transition-colors"
        >
          Lưu Bút
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex space-x-6 items-center">
          {navItems.map((item, index) => (
            <a
              key={item.label}
              href={item.href}
              className={`text-sm font-medium transition-colors ${
                activeSection === index
                  ? "text-purple-400"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              {item.label}
            </a>
          ))}

          {isAdmin ? (
            <Link
              href="/admin"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Admin
            </Link>
          ) : null}

          {session ? (
            <button
              onClick={() => signOut()}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Đăng xuất
            </button>
          ) : null}
        </div>

        <div className="relative md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-300 hover:text-white focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>

          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50"
            >
              <div className="py-1" role="menu" aria-orientation="vertical">
                {navItems.map((item, index) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className={`block px-4 py-2 text-sm ${
                      activeSection === index
                        ? "text-purple-400"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </a>
                ))}

                {isAdmin && (
                  <Link
                    href="/admin"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    Admin
                  </Link>
                )}

                {session && (
                  <button
                    onClick={() => signOut()}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    Đăng xuất
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
