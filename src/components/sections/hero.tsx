"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Package, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function HeroSection() {
  const router = useRouter();

  useEffect(() => {
    const paymentData = JSON.parse(localStorage.getItem("paymentData") || "{}");
    if (paymentData) {
      localStorage.removeItem("paymentData");
    }
  }, []);

  return (
    <div className="relative min-h-screen flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070"
          alt="Global Logistics"
          fill
          className="object-cover brightness-50"
          priority
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 sm:py-40 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-4xl font-bold tracking-tight text-white sm:text-6xl"
          >
            Global Logistics & Shopping
            <br />
            Made Simple
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-6 text-lg leading-8 text-gray-300 max-w-2xl mx-auto"
          >
            Your one-stop solution for international shipping and shopping
            assistance. We make it easy to ship worldwide and buy from your
            favorite stores.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-10 flex flex-col md:flex-row gap-6 items-center justify-center gap-x-6"
          >
            <Button
              onClick={() => router.push("/shipping")}
              size="lg"
              className="gap-2"
            >
              <Package className="h-5 w-5" />
              Ship Now
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => router.push("/buy4me")}
              size="lg"
              variant="ghost"
              className="gap-2 bg-gray-900 text-white hover:text-white hover:bg-gray-800"
            >
              <ShoppingBag className="h-5 w-5" />
              Buy4Me Service
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
