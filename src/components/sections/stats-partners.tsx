"use client";

import { motion } from "framer-motion";
import { Briefcase, MapPin, Package, Users } from "lucide-react";

const stats = [
  {
    value: "10+",
    label: "Years of Experience",
    description: "Providing logistics excellence since 2012",
    icon: Briefcase,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    value: "50,000+",
    label: "Packages Delivered",
    description: "Successfully shipped across the globe",
    icon: Package,
    color: "bg-red-500/10 text-red-600",
  },
  {
    value: "150+",
    label: "Global Destinations",
    description: "Connecting businesses worldwide",
    icon: MapPin,
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    value: "5,000+",
    label: "Happy Customers",
    description: "Business and individual clients",
    icon: Users,
    color: "bg-purple-500/10 text-purple-600",
  },
];

const partners = [
  {
    name: "DHL",
    logo: "/logos/dhl.svg",
  },
  {
    name: "FedEx",
    logo: "/logos/fedex.svg",
  },
  {
    name: "UPS",
    logo: "/logos/ups.svg",
  },
  {
    name: "Shopify",
    logo: "/logos/shopify.svg",
  },
  {
    name: "Amazon",
    logo: "/logos/amazon.svg",
  },
  {
    name: "PayPal",
    logo: "/logos/paypal.svg",
  },
];

export function StatsAndPartners() {
  return (
    <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-0 left-1/3 w-2/3 h-64 bg-gradient-radial from-blue-500/20 to-transparent blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-1/2 h-80 bg-gradient-radial from-red-500/10 to-transparent blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 rounded-full border border-white/5"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Stats Section */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="inline-block px-4 py-1 mb-4 text-sm font-medium rounded-full bg-white/10 text-white backdrop-blur-sm">
              Our Impact
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              Trusted Globally for Excellence
            </h2>
            <p className="text-gray-300">
              Grade A Express has established itself as a leading logistics
              provider, connecting businesses and individuals across the globe
              with reliable shipping solutions.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-colors duration-300"
              >
                <div
                  className={`inline-flex p-3 rounded-xl mb-6 ${stat.color}`}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-xl font-medium mb-3 text-gray-200">
                  {stat.label}
                </div>
                <p className="text-gray-400">{stat.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Partners Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="border-t border-white/10 pt-16"
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl font-semibold mb-4">Our Partners</h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We collaborate with leading companies to ensure the best service
              for our customers
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {partners.map((partner, index) => (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="flex items-center justify-center p-6 bg-white/5 backdrop-blur-sm rounded-xl hover:bg-white/10 transition-colors duration-300"
              >
                <div className="h-12 w-full flex items-center justify-center">
                  <div className="relative h-8 w-32">
                    {/* Placeholder for partner logos */}
                    <div className="absolute inset-0 flex items-center justify-center text-gray-200 font-medium">
                      {partner.name}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
