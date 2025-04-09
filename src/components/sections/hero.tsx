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
    <div className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image with Modern Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070"
          alt="Global Logistics"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/70"></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-red-500/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 sm:py-40 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="inline-block px-4 py-1 mb-6 text-sm font-medium rounded-full bg-white/10 text-white backdrop-blur-sm border border-white/20"
          >
            Premium Logistics Solutions
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            <span className="block">Global Logistics</span>
            <span className="block mt-1 bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
              Made Simple
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-8 text-lg leading-8 text-gray-300 max-w-2xl mx-auto"
          >
            Your one-stop solution for international shipping and shopping
            assistance. We make it easy to ship worldwide and buy from your
            favorite stores.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-10 flex flex-col md:flex-row gap-6 items-center justify-center"
          >
            <Button
              onClick={() => {
                window.location.href = `https://wa.me/+601136907583?text=${encodeURIComponent(
                  "Hello, I would like to get more information about shipping services"
                )}`;
              }}
              size="lg"
              className="gap-2 cursor-pointer bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/20 px-8 py-6 h-auto text-base font-medium w-full md:w-auto"
            >
              <Package className="h-5 w-5" />
              Ship Now
              <ArrowRight className="h-4 w-4" />
            </Button>
            {/* 
            <Button
              onClick={() => router.push("/tracking")}
              size="lg"
              className="gap-2 cursor-pointer bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/20 px-8 py-6 h-auto text-base font-medium w-full md:w-auto"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M7.5 12h9M14 7.5 19 12l-5 4.5" />
                <path d="M18 18V6H4v12z" />
              </svg>
              Track Package
            </Button> */}

            <Button
              onClick={() => router.push("/buy4me")}
              size="lg"
              className="gap-2 cursor-pointer bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/20 px-8 py-6 h-auto text-base font-medium w-full md:w-auto"
            >
              <ShoppingBag className="h-5 w-5" />
              Buy4Me Service
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-16 py-4 px-6 rounded-xl bg-white/5 backdrop-blur-sm inline-flex gap-x-8 items-center"
          >
            <div className="flex flex-col items-center">
              <span className="font-bold text-2xl text-white">5000+</span>
              <span className="text-xs text-gray-400">Packages Shipped</span>
            </div>
            <div className="h-10 w-px bg-white/10"></div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-2xl text-white">24/7</span>
              <span className="text-xs text-gray-400">Customer Support</span>
            </div>
            <div className="h-10 w-px bg-white/10"></div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-2xl text-white">100+</span>
              <span className="text-xs text-gray-400">Global Destinations</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
