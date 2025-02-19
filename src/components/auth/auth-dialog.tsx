'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { User } from '@/lib/types/index'
import { AnimatePresence, motion } from 'framer-motion'
import { LogIn, User as UserIcon } from 'lucide-react'
import { useCallback, useState } from 'react'

const INITIAL_FORM_STATE = {
  email: '',
  password: '',
  name: '',
  country: '',
}

export function AuthDialog() {
  const { toast } = useToast()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const {  register, user, isOpen, setIsOpen, setUser} = useAuth()
  const [formData, setFormData] = useState(INITIAL_FORM_STATE)

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
      console.log('data', data)
      if (response.status === 401) {
        toast({
          title: 'Invalid credentials',
          description: 'Please check your email and password',
          variant: 'destructive',
        })
        return null;
      }
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

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_STATE)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }, [])

  const handleAuthSuccess = useCallback((message: string) => {
    toast({
      title: message,
      description: `You have successfully ${isLogin ? 'logged in' : 'created an account'}.`,
    })
    setIsOpen(false)
    resetForm()
  }, [isLogin, setIsOpen, toast, resetForm])

  const handleAuthError = useCallback((error: unknown) => {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Authentication failed. Please try again.'
    
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive',
    })
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        const data = await login(formData.email, formData.password)
        if (data) {
          handleAuthSuccess('Welcome back!')
        }
      } else {
        if (!formData.name.trim()) {
          throw new Error('Please enter your full name')
        }
        await register(formData.email, formData.password, formData.name, "BUY4ME")
        handleAuthSuccess('Account created!')
      }
    } catch (error) {
      handleAuthError(error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAuthMode = useCallback(() => {
    setIsLogin(prev => !prev)
    resetForm()
  }, [resetForm])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button aria-label={user ? 'Open account menu' : 'Sign in'}>
          <UserIcon className="mr-2 h-4 w-4" />
          {user ? 'Account' : 'Sign In'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isLogin ? 'Sign In' : 'Create Account'}</DialogTitle>
          <DialogDescription>
            {isLogin
              ? 'Enter your credentials to access your account'
              : 'Fill in your details to create a new account'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              minLength={3}
            />
          </div>

          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
              aria-busy={loading}
            >
              <LogIn className="mr-2 h-4 w-4" />
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>

            <Button
              type="button"
              variant="link"
              className="text-sm"
              onClick={toggleAuthMode}
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}