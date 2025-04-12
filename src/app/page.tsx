import { CTASection } from "@/components/sections/cta-section";
import { HeroSection } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { KeyFeatures } from "@/components/sections/key-features";
import { ServicesOverview } from "@/components/sections/services";
import { ShippingCalculator } from "@/components/sections/shipping-calculator";
import { StatsAndPartners } from "@/components/sections/stats-partners";
import { Testimonials } from "@/components/sections/testimonials";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <HeroSection />
      <ServicesOverview />
      <KeyFeatures />
      <StatsAndPartners />
      <HowItWorks />
      <ShippingCalculator />
      <Testimonials />
      <CTASection />
    </div>
  );
}
