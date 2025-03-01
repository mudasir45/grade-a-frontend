"use client";

import { AuthContextType } from "@/lib/types/";
import { User } from "@/lib/types/index";
import { useRouter } from "next/navigation";
import { createContext, ReactNode, useEffect, useState } from "react";
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getUser()
      .then((user) => {
        setUser(user);
      })
      .catch((error) => {
        console.error("Failed to get user:", error);
        setIsOpen(true);
      });
    setLoading(false);
  }, []);

  const getUser = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/accounts/users/me/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        return data;
      }
      return null;
    } catch (error) {
      console.error("Failed to get user:", error);
      throw new Error("Failed to get user");
    } finally {
      setLoading(false);
    }
  };

  const login = async (phone: string, password: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/token/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: phone, password }),
        }
      );

      const data = await response.json();
      console.log("data", data);
      if (response.status === 401) {
        setIsOpen(true);
        return data;
      }
      if (data.error) {
        throw new Error(data.error);
      }

      localStorage.setItem("auth_token", data.access);

      // Fetch user details after successful login
      const userResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/accounts/users/me/`,
        {
          headers: {
            Authorization: `Bearer ${data.access}`,
            "Content-Type": "application/json",
          },
        }
      );

      const userData = await userResponse.json();

      if (userData.error) {
        throw new Error(userData.error);
      }

      setUser(userData);
    } catch (error) {
      console.error(error);
      throw new Error("Invalid credentials");
    }
  };

  const register = async (
    phone: string,
    password: string,
    name: string,
    country?: string,
    user_type?: string
  ) => {
    try {
      const [firstName, ...lastNameParts] = name.split(" ");
      const lastName = lastNameParts.join(" ");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/accounts/signup/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: phone,
            phone_number: phone,
            password,
            first_name: firstName,
            last_name: lastName,
            user_type: "BUY4ME",
          }),
        }
      );

      const data = await response.json();
      if (response.status === 400) {
        console.log("data", data);
        throw new Error(data.username[0]);
      }
      if (data.error) {
        throw new Error(data.username[0]);
      }

      // Automatically log in after successful registration
      await login(phone, password);
    } catch (error) {
      console.error(error);
      throw new Error((error as string) || "Registration failed");
    }
  };

  const updateUser = async (user: User) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/accounts/users/update_me/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        }
      );

      const data = await response.json();
      if (response.ok) {
        return data;
      }
      throw new Error("Failed to update user");
    } catch (error) {
      console.error(error);
      throw new Error("Failed to update user");
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/accounts/users/update_password/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            old_password: oldPassword,
            new_password: newPassword,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        return data;
      }
      throw new Error("Failed to change password");
    } catch (error) {
      console.error(error);
      throw new Error("Failed to change password");
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setUser(null);
    router.push("/");
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isOpen,
    setIsOpen,
    setUser,
    getUser,
    changePassword,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
