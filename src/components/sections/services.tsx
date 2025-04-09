"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Clock,
  CreditCard,
  Globe,
  Package,
  ShoppingBag,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const services = [
  {
    title: "International Shipping",
    description:
      "Fast and reliable shipping services to over 100+ countries worldwide",
    icon: Globe,
    color: "text-blue-500",
    accentColor: "border-blue-500",
    href: "/services#international-shipping",
    features: [
      "Competitive international rates",
      "Fast customs clearance",
      "Door-to-door delivery",
    ],
  },
  {
    title: "Buy4Me Service",
    description:
      "We help you purchase items from your favorite stores and ship them to you",
    icon: ShoppingBag,
    color: "text-emerald-500",
    accentColor: "border-emerald-500",
    href: "/services#buy4me",
    features: [
      "Personal shopping assistance",
      "Secure payment processing",
      "Combined shipping options",
    ],
  },
  {
    title: "Express Delivery",
    description: "Priority shipping options for time-sensitive deliveries",
    icon: Truck,
    color: "text-red-500",
    accentColor: "border-red-500",
    href: "/services#express",
    features: [
      "Next-day delivery options",
      "Priority handling",
      "Expedited customs clearance",
    ],
  },
  {
    title: "Real-time Tracking",
    description: "Track your shipments 24/7 with our advanced tracking system",
    icon: Clock,
    color: "text-purple-500",
    accentColor: "border-purple-500",
    href: "/services#tracking",
    features: [
      "Live package updates",
      "Delivery notifications",
      "Mobile tracking app",
    ],
  },
  {
    title: "Consolidation",
    description:
      "Combine multiple packages into one shipment to save on shipping costs",
    icon: Package,
    color: "text-orange-500",
    accentColor: "border-orange-500",
    href: "/services#consolidation",
    features: [
      "Package bundling services",
      "Cost-effective shipping",
      "Simplified customs processing",
    ],
  },
  {
    title: "Secure Payment",
    description: "Multiple payment options with secure transaction processing",
    icon: CreditCard,
    color: "text-indigo-500",
    accentColor: "border-indigo-500",
    href: "/services#payment",
    features: [
      "Multiple payment methods",
      "Encrypted transactions",
      "Transparent pricing",
    ],
  },
];

// Container animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
    },
  },
};

// Item animations
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 100,
    },
  },
};

// Define types for service items
interface ServiceItem {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  accentColor: string;
  href: string;
  features: string[];
}

function ServiceCard({ service }: { service: ServiceItem }) {
  const Icon = service.icon;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      variants={itemVariants}
      className="h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
    >
      <Link href={service.href} className="block h-full outline-none">
        <Card className="h-full overflow-hidden bg-white border-0 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
          {/* Accent Border */}
          <div
            className={`h-1 w-full ${service.accentColor.replace(
              "border",
              "bg"
            )}`}
          ></div>

          <CardHeader className="pt-6 pb-0 relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span
                className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${service.color} bg-gray-50`}
              >
                <Icon className="h-5 w-5" />
              </span>

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: isHovered ? 1 : 0.8,
                  opacity: isHovered ? 1 : 0,
                  x: isHovered ? 0 : 10,
                }}
                className={`text-gray-300 transition-colors`}
              >
                <ArrowRight className="h-5 w-5" />
              </motion.div>
            </div>

            <CardTitle className="text-xl font-semibold text-gray-900">
              {service.title}
            </CardTitle>

            <CardDescription className="mt-2 text-gray-600 line-clamp-2">
              {service.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="pb-0 mt-auto flex-grow flex flex-col">
            <div className="w-full h-px bg-gray-100 my-4"></div>

            <ul className="space-y-2 mt-auto">
              {service.features.map((feature, idx) => (
                <motion.li
                  key={idx}
                  className="text-sm text-gray-600 flex items-start gap-2"
                  initial={{ opacity: 0, x: -5 }}
                  animate={
                    isHovered
                      ? {
                          opacity: 1,
                          x: 0,
                          transition: { delay: idx * 0.1 },
                        }
                      : {
                          opacity: 0.8,
                          x: 0,
                          transition: { delay: 0 },
                        }
                  }
                >
                  <span
                    className={`h-1 w-1 rounded-full ${service.color.replace(
                      "text",
                      "bg"
                    )} mt-2 flex-shrink-0`}
                  ></span>
                  <span>{feature}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>

          <CardFooter className="pt-3 pb-5">
            <motion.div
              className="flex items-center text-sm mt-2"
              initial={{ opacity: 0 }}
              animate={
                isHovered
                  ? {
                      opacity: 1,
                      transition: { delay: 0.2 },
                    }
                  : {
                      opacity: 0,
                    }
              }
            >
              <span className={`${service.color} font-medium`}>Learn more</span>
              <ArrowRight className={`ml-1 h-3 w-3 ${service.color}`} />
            </motion.div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}

export function ServicesOverview() {
  return (
    <section
      className="py-24 bg-gradient-to-b from-gray-50 to-white overflow-hidden"
      id="services"
    >
      {/* Subtle background elements */}
      <div className="absolute right-0 top-1/3 w-96 h-96 rounded-full bg-blue-50/30 blur-3xl -z-10 opacity-50"></div>
      <div className="absolute left-0 bottom-1/4 w-96 h-96 rounded-full bg-red-50/30 blur-3xl -z-10 opacity-50"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1 mb-4 text-xs uppercase tracking-wider font-semibold rounded-full bg-gray-100 text-gray-800"
          >
            Services
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900"
          >
            Premium Shipping Solutions
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, width: 0 }}
            whileInView={{ opacity: 1, width: "80px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="h-1 bg-red-500 mx-auto my-6"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-4 text-lg leading-8 text-gray-600 max-w-2xl mx-auto"
          >
            Tailored logistics and shipping services designed for reliability,
            speed and convenience across global markets.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {services.map((service) => (
            <ServiceCard key={service.title} service={service} />
          ))}
        </motion.div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <Link
            href="/services"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
          >
            <span>Explore All Services</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
