"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Package,
  Phone,
  Twitter,
} from "lucide-react";
import Link from "next/link";

const footerLinks = {
  services: [
    { name: "International Shipping", href: "#" },
    { name: "Buy4Me Service", href: "#" },
    { name: "Express Delivery", href: "#" },
    { name: "Consolidation", href: "#" },
  ],
  company: [
    { name: "About Us", href: "#" },
    { name: "Contact", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Blog", href: "#" },
  ],
  support: [
    { name: "Help Center", href: "#" },
    { name: "Track Package", href: "#" },
    { name: "Shipping Rates", href: "#" },
    { name: "FAQs", href: "#" },
  ],
  legal: [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Shipping Policy", href: "#" },
    { name: "Returns Policy", href: "#" },
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
                <span>gradeaplus21@gmail.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-red-500" />
                <span>+60 11-3690 7583 (Malaysia office)</span>
                <span>+234 902 020 2928 (Nigeria office)</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-red-500" />
                <span>
                  Shop 23, Victory plaza, beside Mobil filling station, ilepo
                  oke odo bus stop, along abule egba/iyana paja express way,
                  Lagos, Nigeria.
                </span>
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
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </Link>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </Link>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </Link>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
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
              className="text-blue-500 font-semibold"
              href="https://www.imergesolutions.com/"
              target="_blank"
            >
              iMerge Solutions
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
