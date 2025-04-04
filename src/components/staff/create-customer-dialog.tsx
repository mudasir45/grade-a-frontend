"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBuy4Me } from "@/hooks/use-buy4me";
import { useToast } from "@/hooks/use-toast";
import { Country } from "@/lib/types/index";
import { Loader2, LogIn } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import SearchableSelect from "../ui/searchable-select";
const INITIAL_FORM_STATE = {
  phone: "",
  email: "",
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

interface CreateCustomerDialogProps {
  setIsCreated?: React.Dispatch<React.SetStateAction<boolean>>;
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
}

export function CreateCustomerDialog({
  setIsCreated,
  open,
  onOpenChange,
}: CreateCustomerDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [phoneError, setPhoneError] = useState("");
  const { getUserCountries, loading: countriesLoading } = useBuy4Me();
  const [countries, setCountries] = useState<Country[]>([]);

  useEffect(() => {
    const fetchCountries = async () => {
      const countries = await getUserCountries();
      setCountries(countries || []);
    };
    fetchCountries();
  }, [getUserCountries]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;

      if (id === "phone") {
        const digitsOnly = value.replace(/\D/g, "").slice(0, 12);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidPhoneNumber(formData.phone)) {
      toast({
        title: "Invalid Phone Number",
        description:
          "Please enter a valid phone number between 7 and 12 digits",
        variant: "destructive",
      });
      return;
    }
    if (!formData.name.trim()) {
      throw new Error("Please enter your full name");
    }
    setLoading(true);

    try {
      const [firstName, ...lastNameParts] = formData.name.split(" ");
      const lastName = lastNameParts.join(" ");

      //Create new user
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/accounts/signup/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: formData.phone,
            phone_number: formData.phone,
            email: formData.email,
            password: formData.password,
            first_name: firstName,
            last_name: lastName,
            user_type: "WALK_IN",
            country: formData.country,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create user");
      }

      const result = await response.json();
      toast({
        title: "Success",
        description: "User created successfully",
      });
      setIsCreated?.(true);
      // Reset form after successful creation
      setFormData(INITIAL_FORM_STATE);
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (countriesLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Customer</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new customer account
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
            />
            {phoneError && (
              <p className="text-sm text-red-500 mt-1">{phoneError}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
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
              placeholder="Enter password"
              autoComplete="new-password"
              minLength={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter full name"
              autoComplete="name"
            />
          </div>
          <SearchableSelect
            label="Country"
            options={countries.map((country) => ({
              value: country.id,
              label: country.name,
            }))}
            value={formData.country}
            onChange={(value) => setFormData({ ...formData, country: value })}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating..."
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Create Account
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
