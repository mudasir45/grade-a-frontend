import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Providers } from "@/components/providers";
import { AuthProvider } from "@/context/AuthContext";
import { PaymentProvider } from "@/contexts/payment-context";
import type { Metadata } from "next";
import "./globals.css";

const fontClass = "font-sans";

export const metadata: Metadata = {
  title: "Grade A Express",
  description:
    "Your trusted partner for global logistics and Buy4Me services. Fast, reliable, and affordable shipping solutions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={fontClass} suppressHydrationWarning>
        <PaymentProvider>
          <Providers>
            <AuthProvider>
              <Navbar />
              {children}
              <Footer />
            </AuthProvider>
          </Providers>
        </PaymentProvider>
      </body>
    </html>
  );
}
