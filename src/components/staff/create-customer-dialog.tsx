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
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react'
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { useCallback, useState } from "react";
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
    // Check if it's exactly 10 digits
    return digitsOnly.length === 10;
};

interface CreateCustomerDialogProps {
    open: boolean;
    onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
}

export function CreateCustomerDialog({
    open,
    onOpenChange,
}: CreateCustomerDialogProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [phoneError, setPhoneError] = useState("");

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const { id, value } = e.target;

            if (id === "phone") {
                const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
                if (digitsOnly.length > 0) {
                    if (digitsOnly.length !== 10) {
                        setPhoneError("Phone number must be 10 digits");
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
                description: "Please enter a valid 10-digit phone number",
                variant: "destructive",
            });
            return;
        }
        if (!formData.name.trim()) {
            throw new Error("Please enter your full name");
        }
        setLoading(true);

        try {

            const [firstName, ...lastNameParts] = formData.name.split(' ');
            const lastName = lastNameParts.join(' ');

            //Create new user
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/signup/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.phone,
                    phone_number: formData.phone,
                    email: formData.email,
                    password: formData.password,
                    first_name: firstName,
                    last_name: lastName,
                    user_type: "WALK_IN"
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create user');
            }

            const result = await response.json();
            toast({
                title: "Success",
                description: "User created successfully",

            });
            // Reset form after successful creation
            setFormData(INITIAL_FORM_STATE);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

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
                            placeholder="Enter your 10-digit phone number"
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