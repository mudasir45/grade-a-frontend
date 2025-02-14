"use client"


import { AuthContext } from "@/context/AuthContext";
import { AuthContextType } from "@/lib/types/index";
import { useContext } from "react";


export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
  }