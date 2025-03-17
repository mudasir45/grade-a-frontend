"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Package, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ConsolidationPage = () => {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-purple-600 to-indigo-700 py-24 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="/images/pattern-bg.png"
            alt="Background pattern"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Consolidation Service
              </h1>
              <p className="text-xl opacity-90 mb-8">
                Reduce your shipping costs with our Consolidation Service,
                perfect for customers who shop from multiple Malaysian stores
                and want to combine their packages into one shipment.
              </p>
              <Button
                size="lg"
                className="bg-white text-purple-700 hover:bg-gray-100"
                onClick={() => router.push("/")}
              >
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Introduction */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-16"
            >
              <h2 className="text-3xl font-bold mb-6 text-center">
                Save Money with Package Consolidation
              </h2>
              <p className="text-lg text-gray-700 mb-8">
                Instead of paying for multiple separate shipments, we
                consolidate your items, saving you money and customs fees. Our
                consolidation service is designed for shoppers who purchase from
                multiple stores in Malaysia and want to optimize their shipping
                costs.
              </p>

              <div className="bg-white rounded-xl shadow-md p-8 mt-8">
                <h3 className="text-xl font-semibold mb-4">
                  Benefits of Our Consolidation Service
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">
                      <span className="font-medium">Lower Shipping Costs:</span>{" "}
                      Combine multiple purchases into one package and save
                      significantly on shipping fees.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">
                      <span className="font-medium">Flexible Storage:</span> We
                      hold your items until all your orders arrive, giving you
                      time to complete your shopping.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">
                      <span className="font-medium">
                        Fast & Reliable Shipping:
                      </span>{" "}
                      Once consolidated, we ship directly to your doorstep using
                      our trusted shipping partners.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">
                      <span className="font-medium">Real-Time Tracking:</span>{" "}
                      Stay updated on your shipment's progress from our
                      warehouse to your location.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">
                      <span className="font-medium">Reduced Customs Fees:</span>{" "}
                      A single shipment means lower import duties in many cases,
                      saving you even more.
                    </span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* How It Works */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-16"
            >
              <h2 className="text-3xl font-bold mb-8 text-center">
                How It Works
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-white shadow-md">
                  <CardContent className="pt-6">
                    <div className="rounded-full bg-purple-100 w-12 h-12 flex items-center justify-center mb-4">
                      <ShoppingBag className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      1. Shop & Ship
                    </h3>
                    <p className="text-gray-700">
                      Shop from multiple Malaysian stores and send items to our
                      facility. Use our warehouse address as your shipping
                      address.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-md">
                  <CardContent className="pt-6">
                    <div className="rounded-full bg-purple-100 w-12 h-12 flex items-center justify-center mb-4">
                      <Package className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      2. We Consolidate
                    </h3>
                    <p className="text-gray-700">
                      We securely consolidate your packages into one shipment,
                      optimizing space and minimizing shipping costs.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-md">
                  <CardContent className="pt-6">
                    <div className="rounded-full bg-purple-100 w-12 h-12 flex items-center justify-center mb-4">
                      <ArrowRight className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      3. Receive Package
                    </h3>
                    <p className="text-gray-700">
                      Choose your preferred shipping method and receive your
                      package in Nigeria or other destinations.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {/* Pricing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-16"
            >
              <h2 className="text-3xl font-bold mb-8 text-center">
                Consolidation Pricing
              </h2>

              <div className="bg-white rounded-xl shadow-md p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Storage Fees</h3>
                    <p className="text-gray-700 mb-4">
                      We offer free storage for the first 14 days. After that, a
                      small fee applies:
                    </p>
                    <ul className="space-y-2 text-gray-700">
                      <li>
                        • First 14 days:{" "}
                        <span className="font-semibold">FREE</span>
                      </li>
                      <li>
                        • 15-30 days:{" "}
                        <span className="font-semibold">
                          RM5 per package per day
                        </span>
                      </li>
                      <li>
                        • 31+ days:{" "}
                        <span className="font-semibold">
                          RM10 per package per day
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      Consolidation Fees
                    </h3>
                    <p className="text-gray-700 mb-4">
                      Our consolidation service fees are straightforward:
                    </p>
                    <ul className="space-y-2 text-gray-700">
                      <li>
                        • Basic consolidation:{" "}
                        <span className="font-semibold">RM20 per package</span>
                      </li>
                      <li>
                        • Premium consolidation (with photos):{" "}
                        <span className="font-semibold">RM30 per package</span>
                      </li>
                      <li>
                        • Repackaging service:{" "}
                        <span className="font-semibold">RM15 per package</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-gray-700">
                    <span className="font-semibold">Note:</span> Shipping costs
                    are calculated based on the consolidated package dimensions
                    and weight. You'll typically save 30-50% compared to
                    shipping items individually.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold mb-6">
                Ready to Start Consolidating?
              </h2>
              <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
                Maximize your savings and enjoy a hassle-free shipping
                experience with our consolidation service.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                  >
                    Contact Us
                  </Button>
                </Link>
                <Link href="/shipping">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Learn About Shipping
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ConsolidationPage;
