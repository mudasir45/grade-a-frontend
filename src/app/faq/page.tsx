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
import { useEffect, useState } from "react";

// Define interfaces for API data
interface FAQCategory {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  created_at: string;
  updated_at: string;
  category: string;
}

export default function FAQPage() {
  const [categories, setCategories] = useState<
    (FAQCategory | { id: string; name: string })[]
  >([{ id: "all", name: "All Questions" }]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedItem, setExpandedItem] = useState<string | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories and FAQs on component mount
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const fetchCategoriesAndFaqs = async () => {
      setIsLoading(true);
      try {
        // Fetch categories
        const categoriesResponse = await fetch(
          `${apiUrl}/website-content/faq-categories/`
        );
        if (!categoriesResponse.ok) {
          throw new Error("Failed to fetch categories");
        }
        const categoriesData: FAQCategory[] = await categoriesResponse.json();

        // Add "All Questions" category at the beginning
        setCategories([
          { id: "all", name: "All Questions" },
          ...categoriesData.map((cat) => ({
            id: cat.id,
            name: cat.name.charAt(0).toUpperCase() + cat.name.slice(1), // Capitalize first letter
          })),
        ]);

        // Fetch FAQs
        const faqsResponse = await fetch(`${apiUrl}/website-content/faqs/`);
        if (!faqsResponse.ok) {
          throw new Error("Failed to fetch FAQs");
        }
        const faqsData: FAQ[] = await faqsResponse.json();
        setFaqs(faqsData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load FAQ data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoriesAndFaqs();
  }, []);

  // Filter FAQs based on selected category
  const filteredFaqs =
    activeCategory === "all"
      ? faqs
      : faqs.filter((faq) => faq.category === activeCategory);

  // Function to get category name by ID
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Uncategorized";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading FAQ data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto p-6 bg-white rounded-lg shadow">
          <HelpCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Error Loading FAQs
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Hero Section */}
      <section className="bg-white py-16 text-black">
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
                    key={faq.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <AccordionItem
                      value={faq.id}
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
