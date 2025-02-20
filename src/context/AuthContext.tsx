"use client"

import { AuthContextType } from '@/lib/types/';
import { User } from '@/lib/types/index';
import { useRouter } from 'next/navigation';
import { createContext, ReactNode, useEffect, useState } from 'react';
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter();
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
    // getUser()
    // .then((user) => {
    //   setUser(user)
    // })
    // .catch((error) => {
    //   console.error('Failed to get user:', error);
    //   setIsOpen(true)
    // })
    setLoading(false);
  }, []);


  const getUser = async () => {
   try{
       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/users/me/`, {
         headers: {
           'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
         }
       })
       const data = await response.json();
       if (response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
        setUser(null);
           setIsOpen(true)
           return null;
       }
       return data;
 
   } catch (error) {
    console.error('Failed to get user:', error);
    throw new Error('Failed to get user');
   }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: email, password }),
      });
      
      const data = await response.json();
      console.log('data', data)
      if (response.status === 401) {
        setIsOpen(true)
        return data;
      }
      if (data.error) {
        throw new Error(data.error);
      }

      localStorage.setItem('auth_token', data.access);
      
      // Fetch user details after successful login
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/users/me/`, {
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

  const register = async (email: string, password: string, name: string, country?: string, user_type?  : string) => {
    try {
      const [firstName, ...lastNameParts] = name.split(' ');
      const lastName = lastNameParts.join(' ');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/signup/`, {
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
          user_type: "BUY4ME"
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
    router.push('/');
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
