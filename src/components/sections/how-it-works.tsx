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
    lightColor: "bg-blue-50",
    shadowColor: "shadow-blue-500/20",
    number: "01",
  },
  {
    title: "Place Your Order",
    description:
      "Provide shipping details or shopping links for your desired items",
    icon: ShoppingCart,
    color: "bg-green-500",
    lightColor: "bg-green-50",
    shadowColor: "shadow-green-500/20",
    number: "02",
  },
  {
    title: "We Process & Ship",
    description:
      "We handle the purchase, consolidation, and shipping of your items",
    icon: Truck,
    color: "bg-purple-500",
    lightColor: "bg-purple-50",
    shadowColor: "shadow-purple-500/20",
    number: "03",
  },
  {
    title: "Delivery",
    description:
      "Receive your package at our office or right at your doorstep with real-time tracking.",
    icon: CheckCircle,
    color: "bg-red-500",
    lightColor: "bg-red-50",
    shadowColor: "shadow-red-500/20",
    number: "04",
  },
];

export function HowItWorks() {
  return (
    <section
      className="py-24 bg-gradient-to-b from-gray-50 to-white overflow-hidden"
      id="how-it-works"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1 mb-4 text-sm font-medium rounded-full bg-blue-50 text-blue-600"
          >
            Simple Process
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl"
          >
            How It Works
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-4 text-lg leading-8 text-gray-600 max-w-2xl mx-auto"
          >
            Follow these simple steps to get your packages delivered worldwide
          </motion.p>
        </div>

        {/* Desktop Process Flow (hidden on mobile) */}
        <div className="hidden lg:block relative mb-10">
          {/* Background connecting line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 transform -translate-y-1/2" />

          <div className="grid grid-cols-4 gap-6 relative">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="flex flex-col items-center">
                  {/* Step number badge - outside the card */}
                  <div className="absolute -top-3 left-4 z-10">
                    <div
                      className={`${step.lightColor} text-sm font-bold py-1 px-3 rounded-full ${step.shadowColor}`}
                    >
                      {step.number}
                    </div>
                  </div>

                  {/* Main card with content */}
                  <div
                    className={`h-full w-full p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden`}
                  >
                    {/* Decorative corner flourish */}
                    <div
                      className={`absolute top-0 right-0 w-24 h-24 -mr-10 -mt-10 rounded-full opacity-10 ${step.color}`}
                    ></div>

                    <div className="flex flex-col h-full">
                      {/* Icon with colored background */}
                      <div
                        className={`mb-6 p-3 rounded-xl ${step.lightColor} ${step.shadowColor} self-start`}
                      >
                        <step.icon
                          className={`h-7 w-7 text-${step.color.split("-")[1]}`}
                        />
                      </div>

                      <h3 className="text-xl font-bold mb-3 text-gray-900">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 flex-grow">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Arrow indicator for all but last step */}
                  {index < steps.length - 1 && (
                    <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 z-10">
                      <div className="h-10 w-10 rounded-full bg-white shadow-md flex items-center justify-center">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile Process Flow (vertical, visible only on mobile) */}
        <div className="lg:hidden relative">
          {/* Vertical connecting line */}
          <div className="absolute top-0 left-8 bottom-0 w-0.5 bg-gray-100" />

          <div className="space-y-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Circle indicator on the timeline */}
                <div className="absolute left-[29px] top-8 transform -translate-x-1/2 -translate-y-1/2 z-10">
                  <div
                    className={`h-6 w-6 rounded-full ${step.color} shadow-lg`}
                  ></div>
                </div>

                <div className="pl-16">
                  <div
                    className={`p-6 bg-white rounded-xl shadow-md relative overflow-hidden`}
                  >
                    {/* Step number badge */}
                    <div
                      className={`absolute top-4 right-4 ${step.lightColor} text-sm font-bold py-1 px-2 rounded-full ${step.shadowColor}`}
                    >
                      {step.number}
                    </div>

                    <div
                      className={`mb-4 p-3 rounded-xl ${step.lightColor} ${step.shadowColor} inline-flex`}
                    >
                      <step.icon
                        className={`h-6 w-6 text-${step.color.split("-")[1]}`}
                      />
                    </div>

                    <h3 className="text-lg font-bold mb-2 text-gray-900">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Action button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <a
            href="/services"
            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-full shadow-lg shadow-blue-500/20 transition-all duration-300 hover:shadow-xl"
          >
            Learn More About Our Services
          </a>
        </motion.div>
      </div>
    </section>
  );
}
