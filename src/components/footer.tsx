"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Package,
  Phone,
} from "lucide-react";
import Link from "next/link";

// Custom TikTok icon component
const TikTokIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-5 w-5"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const footerLinks = {
  services: [
    { name: "International Shipping", href: "/shipping" },
    { name: "Buy4Me Service", href: "/driver/buy4me" },
    { name: "Express Delivery", href: "/shipping" },
    { name: "Consolidation", href: "/consolidation" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Services", href: "/services" },
    { name: "Track Package", href: "/tracking" },
  ],
  support: [
    { name: "Help Center", href: "/faq" },
    { name: "Track Package", href: "/tracking" },
    { name: "Shipping Calculator", href: "/shipping" },
    { name: "FAQs", href: "/faq" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/terms-of-service" },
    { name: "Shipping Policy", href: "/shipping-policy" },
    { name: "Returns Policy", href: "/returns-policy" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-red-500" />
              <span className="text-xl font-bold text-white">
                Grade A Express
              </span>
            </Link>
            <p className="mt-4 text-sm leading-6">
              Your trusted partner for global logistics and Buy4Me services.
              Fast, reliable, and affordable shipping solutions worldwide.
            </p>
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-red-500" />
                <a
                  href="mailto:gradeaplus21@gmail.com"
                  className="hover:text-white transition-colors"
                >
                  gradeaplus21@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-red-500" />
                <a
                  href="tel:+60113690758"
                  className="hover:text-white transition-colors"
                >
                  +60 11-3690 7583 (Malaysia office)
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-red-500" />
                <a
                  href="tel:+2349020202928"
                  className="hover:text-white transition-colors"
                >
                  +234 902 020 2928 (Nigeria office)
                </a>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-red-500" />
                <address className="not-italic">
                  Shop 23, Victory plaza, beside Mobil filling station, ilepo
                  oke odo bus stop, along abule egba/iyana paja express way,
                  Lagos, Nigeria.
                </address>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Services
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Company
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Stay Updated
            </h3>
            <p className="mt-4 text-sm">
              Subscribe to our newsletter for the latest updates and offers.
            </p>
            <form className="mt-4 space-y-3">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
              />
              <Button className="w-full bg-red-500 hover:bg-red-600">
                Subscribe
              </Button>
            </form>
            <div className="mt-6">
              <div className="flex space-x-4">
                <Link
                  href="https://www.facebook.com/gradeaexpress/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </Link>
                <Link
                  href="https://www.instagram.com/sf.grade.a.delivery/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </Link>
                <Link
                  href="https://www.tiktok.com/@gradeaexpress"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <TikTokIcon />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <p className="text-sm text-center">
            © {new Date().getFullYear()} Grade A Express. All rights reserved.
          </p>
          <p className="text-sm text-center">
            Developed by{" "}
            <a
              className="text-blue-500 font-semibold hover:text-blue-400 transition-colors"
              href="https://www.imergesolutions.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              iMerge Solutions
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
