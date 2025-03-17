"use client";

import { motion } from "framer-motion";
import { CheckCircle, Package, ShoppingCart, Truck } from "lucide-react";

const steps = [
  {
    title: "Choose Your Service",
    description:
      "Select between direct shipping or Buy4Me service based on your needs",
    icon: Package,
    color: "bg-blue-500",
  },
  {
    title: "Place Your Order",
    description:
      "Provide shipping details or shopping links for your desired items",
    icon: ShoppingCart,
    color: "bg-green-500",
  },
  {
    title: "We Process & Ship",
    description:
      "We handle the purchase, consolidation, and shipping of your items",
    icon: Truck,
    color: "bg-purple-500",
  },
  {
    title: "Delivery",
    description:
      "Receive your package at our office or right at your doorstep with real-time tracking.",
    icon: CheckCircle,
    color: "bg-red-500",
  },
];

export function HowItWorks() {
  return (
    <section
      className="py-16 sm:py-20 md:py-24 bg-gradient-to-r from-gray-100 to-white"
      id="how-it-works"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg md:text-xl leading-8 text-gray-600">
            Simple steps to get your packages delivered worldwide
          </p>
        </div>

        <div className="relative">
          {/* Connection Line for medium and larger screens */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 hidden md:block" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 relative">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="relative hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow hover:shadow-xl transition-shadow">
                  <div
                    className={`w-16 h-16 rounded-full ${step.color} flex items-center justify-center mb-6 relative z-10 shadow-lg transition-transform duration-300 hover:scale-110`}
                  >
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
