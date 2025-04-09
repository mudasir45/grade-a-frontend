import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Metadata } from "next";
import {
  FiCheck,
  FiEye,
  FiGlobe,
  FiPackage,
  FiStar,
  FiTarget,
  FiUsers,
  FiZap,
} from "react-icons/fi";

export const metadata: Metadata = {
  title: "About Us | Grade-A Express",
  description:
    "Learn more about Grade-A Express and our commitment to excellence in global shipping and procurement services.",
};

export default function AboutPage() {
  return (
    <Container>
      <div className="py-10 space-y-12 bg-gradient-to-b from-white to-gray-50 mb-20">
        {/* Hero Section */}
        <div className="space-y-6 text-center max-w-3xl mx-auto">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-50 p-3 rounded-full">
              <FiPackage className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            About Grade-A Express
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Your trusted partner in global shipping and procurement solutions
            since 2018, connecting businesses and individuals across the world.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-white border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="bg-red-50 p-2 rounded-full flex-shrink-0 mt-1">
                  <FiTarget className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">
                    Our Mission
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    At Grade-A Express, we strive to provide seamless, reliable,
                    and efficient shipping and procurement services that connect
                    businesses and individuals globally. Our commitment to
                    excellence ensures that your goods are handled with the
                    utmost care and delivered on time.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="bg-red-50 p-2 rounded-full flex-shrink-0 mt-1">
                  <FiEye className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">
                    Our Vision
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    We envision being the leading global logistics solution
                    provider, known for our innovative approach,
                    customer-centric services, and sustainable practices in
                    shipping and procurement.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Why Choose Us */}
        <Card className="bg-white border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
              Why Choose Us?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-red-50 p-4 rounded-full">
                  <FiGlobe className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-800">
                  Global Reach
                </h3>
                <p className="text-gray-600">
                  With our extensive network, we connect you to markets
                  worldwide, ensuring your shipments reach their destination
                  safely.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-red-50 p-4 rounded-full">
                  <FiUsers className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-800">
                  Expert Team
                </h3>
                <p className="text-gray-600">
                  Our experienced professionals provide personalized solutions
                  tailored to your specific needs.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-red-50 p-4 rounded-full">
                  <FiZap className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-800">
                  Innovation
                </h3>
                <p className="text-gray-600">
                  We leverage cutting-edge technology to optimize our services
                  and enhance your shipping experience.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Our Values */}
        <Card className="bg-white border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
              Our Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="bg-red-50 p-2 rounded-full flex-shrink-0 mt-1">
                  <FiCheck className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-gray-800">
                    Reliability
                  </h3>
                  <p className="text-gray-600">
                    We deliver on our promises, ensuring your trust is
                    well-placed. Consistency in service quality is our hallmark.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-red-50 p-2 rounded-full flex-shrink-0 mt-1">
                  <FiCheck className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-gray-800">
                    Transparency
                  </h3>
                  <p className="text-gray-600">
                    Clear communication and honest business practices are at our
                    core. We believe in building lasting relationships.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-red-50 p-2 rounded-full flex-shrink-0 mt-1">
                  <FiStar className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-gray-800">
                    Excellence
                  </h3>
                  <p className="text-gray-600">
                    We continuously strive to exceed expectations in every
                    aspect of our service, setting new standards in the
                    industry.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-red-50 p-2 rounded-full flex-shrink-0 mt-1">
                  <FiUsers className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-gray-800">
                    Customer Focus
                  </h3>
                  <p className="text-gray-600">
                    Your success is our priority, and we're dedicated to helping
                    you achieve it through exceptional service.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
