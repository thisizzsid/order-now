"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Customer } from "../types/models";

interface AuthContextType {
  customer: Customer | null;
  isLoading: boolean;
  login: (customer: Customer) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("moc_customer");
    if (stored) {
      setCustomer(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const login = (cust: Customer) => {
    setCustomer(cust);
    localStorage.setItem("moc_customer", JSON.stringify(cust));
  };

  const logout = () => {
    setCustomer(null);
    localStorage.removeItem("moc_customer");
  };

  return (
    <AuthContext.Provider value={{ customer, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
