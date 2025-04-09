"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { useState } from "react";

// Testimonial data
const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Business Owner",
    avatar: "/testimonials/avatar-1.jpg",
    initials: "SJ",
    content:
      "Grade A Express completely transformed our logistics operations. Their international shipping services are fast, reliable, and cost-effective. We've been able to expand our business globally thanks to their exceptional service.",
    rating: 5,
    location: "Malaysia",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "E-commerce Entrepreneur",
    avatar: "/testimonials/avatar-2.jpg",
    initials: "MC",
    content:
      "The Buy4Me service is a game-changer! I can now purchase products from stores that don't ship internationally. Their team is incredibly responsive and the shipping process is seamless.",
    rating: 5,
    location: "Nigeria",
  },
  {
    id: 3,
    name: "David Okafor",
    role: "Online Shopper",
    avatar: "/testimonials/avatar-3.jpg",
    initials: "DO",
    content:
      "I've been using Grade A Express for 2 years and never had any issues. Their tracking system provides real-time updates, and the packages always arrive in perfect condition. Highly recommended!",
    rating: 4,
    location: "Lagos",
  },
  {
    id: 4,
    name: "Amanda Wong",
    role: "Import Manager",
    avatar: "/testimonials/avatar-4.jpg",
    initials: "AW",
    content:
      "Their consolidation service has saved us thousands in shipping costs. The team is professional, and they handle our packages with care. The customer service is outstanding.",
    rating: 5,
    location: "Kuala Lumpur",
  },
  {
    id: 5,
    name: "Emmanuel Adeyemi",
    role: "Fashion Retailer",
    avatar: "/testimonials/avatar-5.jpg",
    initials: "EA",
    content:
      "Express delivery options are truly express! I've had urgent shipments delivered across continents in just days. Worth every penny for time-sensitive items.",
    rating: 5,
    location: "Abuja",
  },
  {
    id: 6,
    name: "Sophia Lim",
    role: "Personal Shopper",
    avatar: "/testimonials/avatar-6.jpg",
    initials: "SL",
    content:
      "As someone who helps clients shop internationally, Grade A Express has been an invaluable partner. Their rates are competitive and the service is consistently excellent.",
    rating: 4,
    location: "Singapore",
  },
];

// Star rating component
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${
            i < rating ? "text-amber-400" : "text-gray-300"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const testimonialVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

export function Testimonials() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute left-0 top-0 w-72 h-72 bg-red-50 rounded-full blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute right-0 bottom-0 w-72 h-72 bg-blue-50 rounded-full blur-3xl opacity-50 translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1 mb-4 text-sm font-medium rounded-full bg-red-50 text-red-600"
          >
            Customer Stories
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl mb-6"
          >
            What Our Customers Say
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, width: 0 }}
            whileInView={{ opacity: 1, width: "80px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="h-1 bg-red-500 mx-auto mb-6"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Don't just take our word for it. Here's what our customers have to
            say about our services.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              custom={index}
              variants={testimonialVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              onHoverStart={() => setHoveredId(testimonial.id)}
              onHoverEnd={() => setHoveredId(null)}
            >
              <Card
                className={`h-full transition-shadow duration-300 ${
                  hoveredId === testimonial.id ? "shadow-xl" : "shadow-md"
                } border-0 overflow-hidden`}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-gray-100">
                        <AvatarImage
                          src={testimonial.avatar}
                          alt={testimonial.name}
                        />
                        <AvatarFallback className="bg-red-100 text-red-600">
                          {testimonial.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {testimonial.name}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          {testimonial.role}
                          <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                          {testimonial.location}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`text-red-400 transition-opacity duration-300 ${
                        hoveredId === testimonial.id
                          ? "opacity-100"
                          : "opacity-70"
                      }`}
                    >
                      <Quote className="h-6 w-6" />
                    </div>
                  </div>

                  <p className="text-gray-700 mb-6">{testimonial.content}</p>

                  <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                    <StarRating rating={testimonial.rating} />
                    <span className="text-xs text-gray-500">
                      Verified Customer
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <a
            href="/testimonials"
            className="inline-flex items-center justify-center gap-2 text-red-600 font-medium hover:text-red-800 transition-colors"
          >
            View more customer testimonials
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14"></path>
              <path d="M12 5l7 7-7 7"></path>
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
