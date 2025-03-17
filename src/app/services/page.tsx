"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  Globe,
  Package,
  ShoppingBag,
  Truck,
} from "lucide-react";
import Link from "next/link";

// export const metadata: Metadata = {
//   title: "Services | Grade-A Express",
//   description: "Explore our comprehensive range of shipping and buying services.",
// };

const services = [
  {
    title: "International Shipping",
    description:
      "Ship your packages seamlessly from Malaysia to Nigeria and beyond with our reliable and efficient international shipping service.",
    icon: Globe,
    color: "text-blue-500",
    features: [
      "Fast & Secure: We handle your shipments with care and provide real-time tracking.",
      "Competitive Rates: Get cost-effective shipping solutions with transparent pricing.",
      "Customs Clearance Assistance: We help navigate the customs process smoothly.",
      "Flexible Shipping Options: Choose from express, standard, or economy shipping.",
      "Global Reach: While we specialize in Malaysia-to-Nigeria shipments, other routes are available too.",
    ],
    cta: "Start Shipping Today!",
    href: "/shipping",
  },
  {
    title: "Buy4Me Service",
    description:
      "Want to shop from Malaysia but can't make the purchase yourself? Our Buy4Me service makes international shopping effortless!",
    icon: ShoppingBag,
    color: "text-green-500",
    features: [
      "Access Malaysian Products – Shop from Malaysian stores hassle-free.",
      "Secure & Reliable Payments – We handle transactions safely.",
      "Fast Processing – Get your items quickly without delays.",
      "Affordable Service Fees – No hidden charges, just clear pricing.",
    ],
    steps: [
      "Send Your Request: Provide details of the items you want to purchase.",
      "We Buy for You: We place the order and handle payment on your behalf.",
      "Storage & Inspection: Your items arrive at our Malaysian facility for safe handling.",
      "Delivery to Nigeria & Beyond: We ship your items securely to your doorstep.",
    ],
    cta: "Request a Purchase Now!",
    href: "/driver/buy4me",
  },
  {
    title: "Express Delivery",
    description:
      "Need urgent shipping? Our Express Delivery service ensures your packages reach Nigeria from Malaysia in the shortest time possible.",
    icon: Truck,
    color: "text-red-500",
    features: [
      "Fast Shipping: Get your items delivered in record time.",
      "Secure Handling: Your package is well-protected throughout transit.",
      "Malaysia-to-Nigeria Specialist: Focused on fast deliveries along this major route.",
      "Real-Time Tracking: Monitor your shipment at every stage.",
      "Affordable Express Rates: Premium service without the hefty price tag.",
    ],
    cta: "Book Your Express Delivery Now!",
    href: "/shipping",
  },
  {
    title: "Consolidation Service",
    description:
      "Reduce your shipping costs with our Consolidation Service, perfect for customers who shop from multiple Malaysian stores.",
    icon: Package,
    color: "text-purple-500",
    features: [
      "Lower Shipping Costs: Combine multiple purchases into one package.",
      "Flexible Storage: We hold your items until all your orders arrive.",
      "Fast & Reliable Shipping: Once consolidated, we ship directly to your doorstep.",
      "Real-Time Tracking: Stay updated on your shipment's progress.",
      "Reduced Customs Fees: A single shipment means lower import duties in many cases.",
    ],
    steps: [
      "Shop from multiple Malaysian stores and send items to our facility.",
      "We securely consolidate your packages into one shipment.",
      "Choose your preferred shipping method and receive your package in Nigeria or other destinations.",
    ],
    cta: "Start Consolidating Today!",
    href: "/consolidation",
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

const ServicesPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Hero Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">
              Our Services
            </h1>
            <p className="text-xl text-gray-600">
              Discover our comprehensive range of shipping and buying services
              designed to make international shopping and shipping between
              Malaysia and Nigeria easier for you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Detailed Services Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-16"
          >
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  variants={itemVariants}
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                >
                  <div className="p-8 md:p-10">
                    <div className="flex flex-col md:flex-row gap-8">
                      {/* Service Icon and Title */}
                      <div className="md:w-1/3">
                        <div className="flex items-center mb-4">
                          <div
                            className={`p-3 rounded-lg ${service.color} bg-opacity-10`}
                          >
                            <Icon className={`h-8 w-8 ${service.color}`} />
                          </div>
                          <h2 className="text-2xl font-bold ml-4">
                            {service.title}
                          </h2>
                        </div>
                        <p className="text-gray-700 mb-6">
                          {service.description}
                        </p>

                        {/* CTA Button */}
                        <Link href={service.href}>
                          <Button className="w-full md:w-auto bg-primary hover:bg-primary/90">
                            {service.cta}{" "}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>

                      {/* Service Details */}
                      <div className="md:w-2/3">
                        <div className="space-y-6">
                          {/* Features */}
                          <div>
                            <h3 className="text-lg font-semibold mb-3">
                              {service.title === "Buy4Me Service" ||
                              service.title === "Consolidation Service"
                                ? "Why Choose Our " + service.title
                                : "Key Features of Our " + service.title}
                            </h3>
                            <ul className="space-y-2">
                              {service.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start">
                                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                  <span className="text-gray-700">
                                    {feature}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Steps if available */}
                          {service.steps && (
                            <div>
                              <h3 className="text-lg font-semibold mb-3">
                                How It Works:
                              </h3>
                              <ol className="space-y-2">
                                {service.steps.map((step, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                                      {idx + 1}
                                    </div>
                                    <span className="text-gray-700">
                                      {step}
                                    </span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust Grade A Express for
            their international shipping and shopping needs between Malaysia and
            Nigeria.
          </p>
          <Link href="/contact">
            <Button
              size="lg"
              className="bg-primary text-white hover:bg-primary/90 transition-colors duration-300"
            >
              Contact Us Today
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default ServicesPage;
