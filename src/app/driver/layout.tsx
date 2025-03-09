"use client";

import { Header } from "@/components/driver/header";
import { Sidebar } from "@/components/driver/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isDriverUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    isDriverUser().then((isDriver) => {
      if (!isDriver) {
        toast({
          title: "You are not authorized to access this page",
          description: "Please contact your administrator",
        });
        router.push("/");
      }
    });
  }, [isDriverUser, router]);

  return (
    <div className="flex h-screen bg-gray-50 mt-8">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
