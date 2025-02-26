'use client'

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { CheckCircle, Globe, ShoppingBag, Warehouse } from 'lucide-react';

// export const metadata: Metadata = {
//   title: "Services | Grade-A Express",
//   description: "Explore our comprehensive range of shipping and buying services.",
// };

const services = [
  {
    title: "International Shipping",
    description: "Fast and reliable international shipping services with real-time tracking and competitive rates.",
    icon: Globe,
    color: "text-blue-500",
    features: [
      "Door-to-door delivery",
      "Express shipping options",
      "Package consolidation",
      "Custom clearance assistance",
    ],
  },
  {
    title: "Buy4Me Service",
    description: "Let us handle your purchases from US stores with our professional buying assistance.",
    icon: ShoppingBag,
    color: "text-green-500",
    features: [
      "Personal shopping assistant",
      "Best price guarantee",
      "Secure payment handling",
      "Quality inspection",
    ],
  },
  {
    title: "Warehouse Storage",
    description: "Secure storage solutions for your packages with flexible duration options.",
    icon: Warehouse,
    color: "text-purple-500",
    features: [
      "Climate-controlled facility",
      "24/7 security",
      "Package consolidation",
      "Inventory management",
    ],
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
    <div className="min-h-screen bg-gray-50">
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
              Discover our comprehensive range of shipping and buying services designed to make international shopping easier for you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div key={service.title} variants={itemVariants}>
                  <Card className="h-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                    <CardHeader>
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-50">
                        <Icon className={`h-6 w-6 ${service.color}`} />
                      </div>
                      <CardTitle className="mt-4">{service.title}</CardTitle>
                      <CardDescription className="text-gray-600">{service.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {service.features.map((feature, featureIndex) => (
                          <li
                            key={featureIndex}
                            className="flex items-center text-gray-700"
                          >
                            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
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
            Join thousands of satisfied customers who trust Grade-A Express for their international shipping and shopping needs.
          </p>
          <Button
            size="lg"
            className="bg-primary text-white hover:bg-primary/90 transition-colors duration-300"
          >
            Contact Us Today
          </Button>
        </motion.div>
      </section>
    </div>
  );
};

export default ServicesPage; 