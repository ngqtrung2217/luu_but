"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { Session } from "@supabase/supabase-js";

interface AuthContextType {
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: any; success: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  isAdmin: false,
  isLoading: true,
  signIn: async () => ({ error: null, success: false }),
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Log environment variables availability on client side
  useEffect(() => {
    console.log("Environment variables check:", {
      adminEmailExists: !!process.env.NEXT_PUBLIC_ADMIN_EMAIL,
      adminPasswordExists: !!process.env.NEXT_PUBLIC_ADMIN_PASSWORD_FOR_LOGIN,
    });
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      checkAdminStatus(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      checkAdminStatus(session);
    });

    return () => subscription.unsubscribe();
  }, []);
  const checkAdminStatus = async (session: Session | null) => {
    // Check if admin status is stored in localStorage
    const isAdminAuthenticated =
      localStorage.getItem("isAdminAuthenticated") === "true";

    if (isAdminAuthenticated) {
      setIsAdmin(true);
      setIsLoading(false);
      return;
    }

    if (!session) {
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    try {
      // This is simplified for demo purposes
      const { data } = await supabase
        .from("admin_users")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      setIsAdmin(!!data);
    } catch (error) {
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };
  const signIn = async (email: string, password: string) => {
    // Check if using admin credentials from env
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD_FOR_LOGIN;

    console.log("Login attempt:", {
      email,
      adminEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
      isEmailMatch: email === adminEmail,
      isPasswordMatch: password === adminPassword,
    });

    if (email === adminEmail && password === adminPassword) {
      // If using admin credentials, set admin status directly
      console.log("Admin credentials matched, setting isAdmin to true");
      setIsAdmin(true);
      // Store a flag in localStorage to persist admin status across page refreshes
      localStorage.setItem("isAdminAuthenticated", "true");
      return { error: null, success: true };
    }

    // Otherwise try regular authentication
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error, success: !error };
    } catch (error: any) {
      return { error, success: false };
    }
  };
  const signOut = async () => {
    localStorage.removeItem("isAdminAuthenticated");
    setIsAdmin(false);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ session, isAdmin, isLoading, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
