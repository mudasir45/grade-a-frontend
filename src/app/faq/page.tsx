"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { motion } from "framer-motion";
import { HelpCircle, Mail, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const faqs = [
  {
    question: "How can I track my shipment?",
    answer:
      "You can track your shipment by entering your tracking number on our tracking page. The tracking number is provided in your shipping confirmation email. Our system provides real-time updates on your package's location and estimated delivery date.",
    category: "tracking",
  },
  {
    question: "What should I do if my tracking number isn't working?",
    answer:
      "If your tracking number isn't working, please wait 24-48 hours after receiving it as it may take time to activate in our system. If it still doesn't work after this period, please contact our customer support team with your order details.",
    category: "tracking",
  },
  {
    question: "How long does shipping from Malaysia to Nigeria take?",
    answer:
      "Shipping times vary based on the service you choose. Express delivery typically takes 3-5 business days, while standard shipping takes 7-10 business days. Delivery times may be affected by customs clearance and local delivery conditions.",
    category: "shipping",
  },
  {
    question: "What are the shipping rates?",
    answer:
      "Our shipping rates depend on the package weight, dimensions, destination, and chosen service level. You can get an instant quote using our shipping calculator on the shipping page. We offer competitive rates with no hidden fees.",
    category: "shipping",
  },
  {
    question: "Do you provide customs clearance assistance?",
    answer:
      "Yes, we provide customs clearance assistance for all international shipments. Our team handles the necessary documentation and works with customs authorities to ensure smooth processing. However, any import duties or taxes are the responsibility of the recipient.",
    category: "customs",
  },
  {
    question: "How does the Buy4Me service work?",
    answer:
      "Our Buy4Me service allows you to purchase items from Malaysian stores that don't ship internationally. Simply send us the details of what you want to buy, we'll purchase it on your behalf, and ship it to your address in Nigeria or other destinations.",
    category: "services",
  },
  {
    question: "What is package consolidation and how does it save money?",
    answer:
      "Package consolidation combines multiple packages into a single shipment. This saves money by reducing the overall shipping cost and potentially lowering customs fees. It's ideal if you're shopping from multiple stores in Malaysia.",
    category: "services",
  },
  {
    question: "What happens if my package is lost or damaged?",
    answer:
      "All shipments include basic insurance coverage. If your package is lost or damaged during transit, please contact our customer support within 7 days of the expected delivery date. We'll investigate and process a claim based on our shipping insurance policy.",
    category: "issues",
  },
  {
    question: "Can I change my delivery address after shipping?",
    answer:
      "Address changes may be possible if the package hasn't been dispatched for final delivery. Contact our customer support team as soon as possible with your tracking number and the new delivery address. Additional fees may apply.",
    category: "shipping",
  },
  {
    question: "Do you ship to other countries besides Nigeria?",
    answer:
      "Yes, while we specialize in Malaysia to Nigeria shipping, we also serve many other countries. Contact our customer service team for specific destination availability and rates.",
    category: "shipping",
  },
];

const categories = [
  { id: "all", name: "All Questions" },
  { id: "tracking", name: "Tracking" },
  { id: "shipping", name: "Shipping" },
  { id: "customs", name: "Customs" },
  { id: "services", name: "Our Services" },
  { id: "issues", name: "Issues & Claims" },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedItem, setExpandedItem] = useState<string | undefined>(
    undefined
  );

  // Filter FAQs based on selected category
  const filteredFaqs =
    activeCategory === "all"
      ? faqs
      : faqs.filter((faq) => faq.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16 text-white">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <HelpCircle className="h-16 w-16 mx-auto mb-6 opacity-90" />
            <h1 className="text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl opacity-90">
              Find answers to common questions about our shipping services,
              tracking, and more.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <Container>
          <div className="max-w-4xl mx-auto">
            {/* Category Filters */}
            <div className="mb-10 overflow-x-auto pb-4">
              <div className="flex space-x-2 min-w-max">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={
                      activeCategory === category.id ? "default" : "outline"
                    }
                    className="whitespace-nowrap"
                    onClick={() => {
                      setActiveCategory(category.id);
                      setExpandedItem(undefined); // Reset expanded item when changing category
                    }}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* FAQ Accordion */}
            {filteredFaqs.length > 0 ? (
              <Accordion
                type="single"
                collapsible
                className="space-y-4"
                value={expandedItem}
                onValueChange={setExpandedItem}
              >
                {filteredFaqs.map((faq, index) => (
                  <motion.div
                    key={`${activeCategory}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <AccordionItem
                      value={`item-${index}`}
                      className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 text-left font-medium text-gray-800">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="px-6 py-4 text-gray-600">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">No FAQs found in this category.</p>
              </div>
            )}

            {/* Contact Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-16 bg-white p-8 rounded-xl shadow-sm border border-gray-200"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Still have questions?
              </h2>
              <p className="text-gray-600 mb-6">
                If you couldn't find the answer to your question, our support
                team is here to help.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/contact">
                  <Button className="w-full bg-primary hover:bg-primary/90 flex items-center justify-center gap-2">
                    <Mail className="h-4 w-4" />
                    Contact Support
                  </Button>
                </Link>
                <Link href="/tracking">
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Track Your Shipment
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>
    </div>
  );
}
