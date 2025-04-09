"use client";

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
    <footer className="bg-gray-950 text-gray-300 border-t border-gray-900 mt-28">
      <div className="max-w-7xl mx-auto">
        {/* Top part with newsletter */}
        {/* <div className="py-12 px-6 lg:px-8 bg-gradient-to-r from-gray-900 to-gray-950 rounded-2xl mx-4 -mt-16 mb-10 shadow-xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                Stay Connected
              </h3>
              <p className="text-gray-400">
                Get the latest updates, promotions, and shipping news directly
                to your inbox.
              </p>
            </div>
            <div>
              <form className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:ring-red-500 focus:border-red-500 h-12"
                />
                <Button className="bg-red-500 hover:bg-red-600 text-white font-medium h-12 px-6 whitespace-nowrap">
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
        </div> */}

        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 px-6 py-16">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative">
                <div className="absolute -inset-1 bg-red-500/20 rounded-full blur-md"></div>
                <Package className="relative h-8 w-8 text-red-500" />
              </div>
              <span className="text-xl font-bold text-white">
                <span className="text-red-500">Grade A</span> Express
              </span>
            </Link>
            <p className="mt-6 text-gray-400 leading-relaxed">
              Your trusted partner for global logistics and Buy4Me services. We
              provide fast, reliable, and affordable shipping solutions
              worldwide.
            </p>

            <div className="mt-8 space-y-4">
              <a
                href="mailto:gradeaplus21@gmail.com"
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 group-hover:bg-red-500/20 transition-colors">
                  <Mail className="h-5 w-5 text-red-500" />
                </span>
                <span>gradeaplus21@gmail.com</span>
              </a>

              <a
                href="tel:+60113690758"
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 group-hover:bg-red-500/20 transition-colors">
                  <Phone className="h-5 w-5 text-red-500" />
                </span>
                <span>+60 11-3690 7583 (Malaysia office)</span>
              </a>

              <a
                href="tel:+2349020202928"
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 group-hover:bg-red-500/20 transition-colors">
                  <Phone className="h-5 w-5 text-red-500" />
                </span>
                <span>+234 902 020 2928 (Nigeria office)</span>
              </a>

              <div className="flex items-center gap-3 text-gray-400 group">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800">
                  <MapPin className="h-5 w-5 text-red-500" />
                </span>
                <address className="not-italic text-sm">
                  Shop 23, Victory plaza, beside Mobil filling station, ilepo
                  oke odo bus stop, along abule egba/iyana paja express way,
                  Lagos, Nigeria.
                </address>
              </div>
            </div>

            <div className="mt-8 flex space-x-4">
              <a
                href="https://www.facebook.com/gradeaexpress/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 text-gray-400 hover:bg-red-500/20 hover:text-white transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/sf.grade.a.delivery/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 text-gray-400 hover:bg-red-500/20 hover:text-white transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.tiktok.com/@gradeaexpress"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 text-gray-400 hover:bg-red-500/20 hover:text-white transition-colors"
              >
                <TikTokIcon />
              </a>
            </div>
          </div>

          {/* Quick Links Columns */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
              Services
            </h3>
            <ul className="space-y-4">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
              Company
            </h3>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
              Support
            </h3>
            <ul className="space-y-4">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="px-6 py-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm text-gray-400">
            <p>
              © {new Date().getFullYear()} Grade A Express. All rights reserved.
            </p>
            <div className="flex gap-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="hover:text-white transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          <p className="text-sm text-center text-gray-500 mt-8">
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
