"use client";

import { motion, useInView } from "framer-motion";
import { Check, Clock, DollarSign, Globe, Shield } from "lucide-react";
import { useRef } from "react";

const features = [
  {
    name: "Secure Shipping",
    description:
      "Your packages are fully insured and handled with care throughout the journey.",
    icon: Shield,
    value: "100%",
    suffix: "",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    shadowColor: "shadow-blue-500/20",
    benefits: [
      "Full package insurance",
      "Real-time tracking",
      "Secure handling",
    ],
  },
  {
    name: "Fast Delivery",
    description: "Express shipping options available for urgent deliveries.",
    icon: Clock,
    value: "2-5",
    suffix: " Days",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    shadowColor: "shadow-emerald-500/20",
    benefits: [
      "Express shipping option",
      "Optimized routes",
      "Priority handling",
    ],
  },
  {
    name: "Global Coverage",
    description: "Shipping services available to and from countries worldwide.",
    icon: Globe,
    value: "100+",
    suffix: " Countries",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    shadowColor: "shadow-purple-500/20",
    benefits: [
      "Worldwide shipping",
      "International partnerships",
      "Local expertise",
    ],
  },
  {
    name: "Cost Effective",
    description: "Competitive rates with no hidden fees.",
    icon: DollarSign,
    value: "30%",
    suffix: " Savings",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    shadowColor: "shadow-red-500/20",
    benefits: ["Competitive pricing", "No hidden fees", "Volume discounts"],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function KeyFeatures() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      className="py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden"
      ref={ref}
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-1/2 left-0 w-64 h-64 rounded-full bg-blue-50 blur-3xl opacity-70 transform -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-red-50 blur-3xl opacity-70 transform translate-x-1/4 translate-y-1/4"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1 mb-4 text-sm font-medium rounded-full bg-purple-50 text-purple-600"
          >
            Why Choose Us
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl"
          >
            Experience Excellence in Global Logistics
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto"
          >
            We provide reliable, efficient, and cost-effective logistics
            solutions tailored to your needs
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              variants={itemVariants}
              className="rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group relative overflow-hidden"
            >
              {/* Decorative gradient background that appears on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Content positioned above the background */}
              <div className="relative z-10">
                {/* Decorative corner gradient */}
                <div
                  className={`absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 rounded-full opacity-20 ${feature.bgColor}`}
                ></div>

                {/* Icon with background */}
                <div
                  className={`relative z-10 mb-6 inline-flex p-3 rounded-xl ${feature.bgColor} ${feature.shadowColor}`}
                >
                  <feature.icon className={`h-7 w-7 ${feature.color}`} />
                </div>

                {/* Feature stat */}
                <div className="flex items-end mb-2">
                  <span className={`text-4xl font-bold ${feature.color}`}>
                    {feature.value}
                  </span>
                  <span className="text-gray-700 font-medium ml-1 mb-1">
                    {feature.suffix}
                  </span>
                </div>

                {/* Feature name and description */}
                <h3 className="text-xl font-bold leading-7 text-gray-900 mb-3">
                  {feature.name}
                </h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>

                {/* Feature benefits list */}
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, i) => (
                    <li
                      key={i}
                      className="flex items-center text-sm text-gray-600"
                    >
                      <Check className={`h-4 w-4 mr-2 ${feature.color}`} />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Customer trust indicators */}
        {/* <div className="mt-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center text-sm text-gray-500 mb-8"
          >
            TRUSTED BY BUSINESSES WORLDWIDE
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap justify-center items-center gap-8 md:gap-12 lg:gap-16 opacity-70"
          >
     
            <div className="h-6 w-24 bg-gray-300 rounded"></div>
            <div className="h-6 w-28 bg-gray-300 rounded"></div>
            <div className="h-6 w-20 bg-gray-300 rounded"></div>
            <div className="h-6 w-32 bg-gray-300 rounded"></div>
            <div className="h-6 w-24 bg-gray-300 rounded"></div>
          </motion.div>
        </div> */}
      </div>
    </section>
  );
}
