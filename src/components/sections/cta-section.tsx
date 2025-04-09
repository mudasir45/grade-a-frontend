"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MessageSquare, Phone, ShoppingBag } from "lucide-react";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background with gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100"></div>
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-red-50/60 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-50/60 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>

      {/* Content container */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left column: Main CTA */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white p-8 md:p-12 shadow-xl shadow-red-500/20 overflow-hidden relative"
          >
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-xl transform -translate-x-1/2 translate-y-1/2"></div>

            <div className="relative">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold tracking-tight mb-6"
              >
                Ready to Ship Worldwide?
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-white/90 text-lg mb-8 max-w-md"
              >
                Get started with Grade A Express and experience hassle-free
                international shipping with competitive rates and reliable
                service.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-red-600 hover:bg-red-50 border-0 shadow-md"
                >
                  <Button
                    onClick={() => {
                      window.location.href = `https://wa.me/+601136907583?text=${encodeURIComponent(
                        "Hello, I would like to get more information about shipping services"
                      )}`;
                    }}
                  >
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Start Shipping
                  </Button>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-white text-white hover:bg-white/20 backdrop-blur-sm"
                >
                  <Link href="/contact">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Contact Sales
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Right column: Service highlight */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-white p-8 md:p-12 shadow-xl border border-gray-100 flex flex-col justify-between"
          >
            <div>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="inline-block bg-gray-900 text-white px-4 py-1 rounded-full text-sm font-medium mb-6"
              >
                Premium Service
              </motion.span>

              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-2xl md:text-3xl font-bold text-gray-900 mb-6"
              >
                Need Personalized Assistance?
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-gray-600 mb-6"
              >
                Our logistics experts are ready to help you with custom shipping
                solutions tailored to your specific needs.
              </motion.p>

              <motion.ul
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
                className="space-y-3 mb-8"
              >
                {[
                  "Custom shipping and handling solutions",
                  "Special rates for business clients",
                  "Dedicated account manager",
                  "Priority customer support",
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <div className="bg-green-50 text-green-600 rounded-full p-1 mr-3 mt-0.5">
                      <svg
                        className="h-3 w-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </motion.ul>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                <a
                  href="tel:+601136907583"
                  className="flex items-center gap-2 text-gray-900 font-medium hover:text-red-600 transition-colors"
                >
                  <div className="bg-red-50 p-2 rounded-full">
                    <Phone className="h-4 w-4 text-red-600" />
                  </div>
                  +60 11-3690 7583
                </a>
                <span className="text-gray-300">|</span>
                <a
                  href="mailto:gradeaplus21@gmail.com"
                  className="text-gray-600 hover:text-red-600 transition-colors"
                >
                  gradeaplus21@gmail.com
                </a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
