"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  username: string;
  phoneNumber: string;
  profilePhoto?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication on mount and when needed
  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/user", {
        credentials: 'include', // Include cookies in the request
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial auth check
  useEffect(() => {
    checkAuth();
  }, []);

  // Listen for storage events (for cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "auth_state") {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = async (userData: User) => {
    setUser(userData);
    // Set cookies (already done in LoginModal, but ensure sync)
    document.cookie = `user_id=${userData.id}; path=/; max-age=31536000`;
    document.cookie = `username=${userData.username}; path=/; max-age=31536000`;
    document.cookie = `phone_number=${userData.phoneNumber}; path=/; max-age=31536000`;
    // Trigger storage event for cross-tab sync
    localStorage.setItem("auth_state", "logged_in");
    localStorage.removeItem("auth_state"); // Remove immediately, just trigger event
    // Refresh user data to ensure we have the latest profile photo from database
    await checkAuth();
  };

  const logout = () => {
    // Clear cookies
    document.cookie = "user_id=; path=/; max-age=0";
    document.cookie = "username=; path=/; max-age=0";
    document.cookie = "phone_number=; path=/; max-age=0";
    
    setUser(null);
    // Trigger storage event for cross-tab sync
    localStorage.setItem("auth_state", "logged_out");
    localStorage.removeItem("auth_state");
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

