import { HeroSection } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { KeyFeatures } from "@/components/sections/key-features";
import { ServicesOverview } from "@/components/sections/services";
import { ShippingCalculator } from "@/components/sections/shipping-calculator";
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <ServicesOverview />
      <KeyFeatures />
      <HowItWorks />
      <ShippingCalculator />
      {/* <Testimonials /> */}
   
    </div>
  );
}
