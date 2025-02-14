"use client"

import { AuthContextType } from '@/lib/types/';
import { User } from '@/lib/types/index';
import { createContext, ReactNode, useEffect, useState } from 'react';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('current_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('current_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:8000/api/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: email, password }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      localStorage.setItem('auth_token', data.access);
      
      // Fetch user details after successful login
      const userResponse = await fetch('http://127.0.0.1:8000/api/accounts/users/me/', {
        headers: {
          'Authorization': `Bearer ${data.access}`,
          'Content-Type': 'application/json',
        },
      });
      
      const userData = await userResponse.json();
      
      if (userData.error) {
        throw new Error(userData.error);
      }

      const userObj: User = {
        id: userData.id,
        email: userData.email,
        country: userData.country,
        first_name: userData.first_name,
        last_name: userData.last_name,
        user_type: userData.user_type,
      };

      localStorage.setItem('current_user', JSON.stringify(userObj));
      setUser(userObj);
    } catch (error) {
      console.error(error);
      throw new Error('Invalid credentials');
    }
  };

  const register = async (email: string, password: string, name: string, country: string, user_type: string) => {
    try {
      const [firstName, ...lastNameParts] = name.split(' ');
      const lastName = lastNameParts.join(' ');

      const response = await fetch('http://127.0.0.1:8000/api/accounts/signup/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: email,
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          country,
          user_type
        }),
      });
      
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Automatically log in after successful registration
      await login(email, password);
    } catch (error) {
      console.error(error);
      throw new Error('Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('current_user');
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
