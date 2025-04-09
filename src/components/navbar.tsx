"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Menu, Package } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { AuthDialog } from "./auth/auth-dialog";
import { UserNav } from "./user-nav";

const navigation = [
  { name: "Services", href: "/services" },
  { name: "Tracking", href: "/tracking" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const { user } = useAuth();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm dark:bg-gray-900/90"
          : "bg-white/70 backdrop-blur-sm border-b border-gray-100/20 dark:bg-gray-900/70 dark:border-gray-800/20"
      )}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="flex items-center space-x-2">
                <div className="relative">
                  <div className="absolute -inset-1 bg-red-500/20 rounded-full blur-md"></div>
                  <Package className="relative h-8 w-8 text-red-500" />
                </div>
                <span className="text-xl font-bold text-foreground">
                  <span className="text-red-500">Grade A</span> Express
                </span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800",
                  pathname === item.href
                    ? "text-red-500 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-red-500 after:rounded-full"
                    : "text-foreground/80"
                )}
              >
                {item.name}
              </Link>
            ))}

            <div className="ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
              {user ? <UserNav /> : <AuthDialog />}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-4">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground bg-gray-100/80 hover:bg-gray-200/80 dark:bg-gray-800/80 dark:hover:bg-gray-700/80 rounded-full"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[300px] sm:w-[400px] border-l border-gray-200 dark:border-gray-800"
              >
                <div className="pt-6 pb-10">
                  <Link
                    href="/"
                    className="flex items-center space-x-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <Package className="h-8 w-8 text-red-500" />
                    <span className="text-xl font-bold text-foreground">
                      <span className="text-red-500">Grade A</span> Express
                    </span>
                  </Link>
                </div>
                <nav className="flex flex-col gap-2">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "px-4 py-3 text-base font-medium transition-colors rounded-lg",
                        pathname === item.href
                          ? "bg-red-50 text-red-600 dark:bg-gray-800 dark:text-red-500"
                          : "text-foreground/80 hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                    {user ? <UserNav /> : <AuthDialog />}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}
