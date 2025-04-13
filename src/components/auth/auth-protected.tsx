"use client";

import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AuthProtectedProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function AuthProtected({
  children,
  requiredRole,
}: AuthProtectedProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      // If no user is logged in, redirect to login
      if (!user) {
        router.push("/");
        return;
      }

      // If a specific role is required, check if user has it
      if (requiredRole) {
        const hasRequiredRole = user.user_type === requiredRole;
        setIsAuthorized(hasRequiredRole);
        if (!hasRequiredRole) {
          router.push("/");
          return;
        }
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, loading, router, requiredRole]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
