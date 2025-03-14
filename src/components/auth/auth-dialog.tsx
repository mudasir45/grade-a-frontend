"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useBuy4Me } from "@/hooks/use-buy4me";
import { useToast } from "@/hooks/use-toast";
import { Country } from "@/lib/types/index";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, LogIn, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import SearchableSelect from "../ui/searchable-select";

const INITIAL_FORM_STATE = {
  phone: "",
  password: "",
  name: "",
  country: "",
};

// Helper function to validate phone number
const isValidPhoneNumber = (phone: string) => {
  // Remove any non-digit characters
  const digitsOnly = phone.replace(/\D/g, "");
  // Check if it's between 7 and 12 digits
  return digitsOnly.length >= 7 && digitsOnly.length <= 12;
};

export function AuthDialog() {
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { register, user, isOpen, setIsOpen, setUser } = useAuth();
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [phoneError, setPhoneError] = useState("");
  const router = useRouter();
  const [countries, setCountries] = useState<Country[]>([]);
  const { getUserCountries, loading: countriesLoading } = useBuy4Me();

  useEffect(() => {
    const fetchCountries = async () => {
      const countries = await getUserCountries();
      setCountries(countries || []);
    };
    fetchCountries();
  }, [getUserCountries]);

  const login = async (phone: string, password: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/token/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phone_number: phone, password }),
        }
      );

      const data = await response.json();
      console.log("data", data);
      if (response.status === 401) {
        toast({
          title: "Invalid credentials",
          description: "Please check your phone number and password",
          variant: "destructive",
        });
        return null;
      }

      if (response.status === 400) {
        toast({
          title: "Something went wrong!",
          description: "Please check your credentials and try again.",
          variant: "destructive",
        });
        return null;
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
      if (userData.user_type === "DRIVER") {
        router.push("/driver");
      } else if (userData.user_type === "ADMIN") {
        router.push("/staff");
      }

      if (userData.error) {
        throw new Error(userData.error);
      }

      setUser(userData);
    } catch (error) {
      console.error(error);
      throw new Error("Invalid credentials");
    }
  };

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_STATE);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;

      if (id === "phone") {
        // Allow only numbers and limit to 12 digits
        const digitsOnly = value.replace(/\D/g, "").slice(0, 12);

        // Validate phone number
        if (digitsOnly.length > 0) {
          if (digitsOnly.length < 7 || digitsOnly.length > 12) {
            setPhoneError("Phone number must be between 7 and 12 digits");
          } else {
            setPhoneError("");
          }
        } else {
          setPhoneError("");
        }

        setFormData((prev) => ({
          ...prev,
          [id]: digitsOnly,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [id]: value,
        }));
      }
    },
    []
  );

  const handleAuthSuccess = useCallback(
    (message: string) => {
      toast({
        title: message,
        description: `You have successfully ${
          isLogin ? "logged in" : "created an account"
        }.`,
      });
      setIsOpen(false);
      resetForm();
    },
    [isLogin, setIsOpen, toast, resetForm]
  );

  const handleAuthError = useCallback(
    (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Authentication failed. Please try again.";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
    [toast]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone number before submission
    if (!isValidPhoneNumber(formData.phone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number (7-12 digits)",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const data = await login(formData.phone, formData.password);
        if (data) {
          handleAuthSuccess("Welcome back!");
        }
      } else {
        if (!formData.name.trim()) {
          throw new Error("Please enter your full name");
        }
        const response = await register(
          formData.phone,
          formData.password,
          formData.name,
          formData.country,
          "BUY4ME"
        );
        console.log("response", response);
        handleAuthSuccess("Account created!");
      }
    } catch (error) {
      console.log("error", error);
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = useCallback(() => {
    setIsLogin((prev) => !prev);
    resetForm();
  }, [resetForm]);

  if (countriesLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button aria-label={user ? "Open account menu" : "Sign in"}>
          <UserIcon className="mr-2 h-4 w-4" />
          {user ? "Account" : "Sign In"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isLogin ? "Sign In" : "Create Account"}</DialogTitle>
          <DialogDescription>
            {isLogin
              ? "Enter your credentials to access your account"
              : "Fill in your details to create a new account"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number (7-12 digits)"
              autoComplete="tel"
              className={phoneError ? "border-red-500" : ""}
              maxLength={12}
            />
            {phoneError && (
              <p className="text-sm text-red-500 mt-1">{phoneError}</p>
            )}
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
              autoComplete={isLogin ? "current-password" : "new-password"}
              minLength={3}
            />
          </div>

          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
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

                <SearchableSelect
                  label="Country"
                  options={countries.map((country) => ({
                    value: country.id,
                    label: country.name,
                  }))}
                  className="text-black"
                  value={formData.country}
                  onChange={(value) =>
                    setFormData({ ...formData, country: value })
                  }
                />
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
              {loading
                ? "Please wait..."
                : isLogin
                ? "Sign In"
                : "Create Account"}
            </Button>

            <Button
              type="button"
              variant="link"
              className="text-sm"
              onClick={toggleAuthMode}
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
