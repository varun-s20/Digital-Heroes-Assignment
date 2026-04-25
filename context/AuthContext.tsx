"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Role, User } from "@/lib/types";
import { mockUsers } from "@/lib/mock-data";

interface AuthContextType {
  user: User | null;
  role: Role;
  setRole: (role: Role) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("visitor");
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate auth loading
    setIsLoading(true);
    setTimeout(() => {
      if (role === "visitor") {
        setUser(null);
      } else {
        const foundUser = mockUsers.find((u) => u.role === role) || null;
        setUser(foundUser);
      }
      setIsLoading(false);
    }, 300);
  }, [role]);

  return (
    <AuthContext.Provider value={{ user, role, setRole, isLoading }}>
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
