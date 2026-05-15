"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "admin" | "manager" | "participant" | "guest";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company: string;
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  company: string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: () => {},
  isAuthenticated: false,
});

// Demo users for the hackathon
const DEMO_USERS: (AuthUser & { password: string })[] = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah@company.com",
    password: "demo123",
    role: "admin",
    company: "Acme Corp",
  },
  {
    id: "2",
    name: "James Okafor",
    email: "james@company.com",
    password: "demo123",
    role: "manager",
    company: "Acme Corp",
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = async (email: string, password: string) => {
    const found = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (found) {
      const { password: _, ...authUser } = found;
      setUser(authUser);
      return { success: true };
    }
    // Allow any email/password for demo — create a guest user
    if (email && password.length >= 6) {
      setUser({
        id: Date.now().toString(),
        name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        email,
        role: "participant",
        company: email.split("@")[1]?.split(".")[0] ?? "My Company",
      });
      return { success: true };
    }
    return { success: false, error: "Invalid credentials. Password must be at least 6 characters." };
  };

  const register = async (data: RegisterData) => {
    if (!data.email || !data.name || !data.password || data.password.length < 6) {
      return { success: false, error: "All fields required. Password minimum 6 characters." };
    }
    setUser({
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      role: data.role,
      company: data.company,
    });
    return { success: true };
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
