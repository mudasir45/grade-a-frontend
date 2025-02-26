import { Card, CardContent } from "@/components/ui/card"
import { Container } from "@/components/ui/container"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Us | Grade-A Express",
  description: "Learn more about Grade-A Express and our commitment to excellence in global shipping and procurement services.",
}

export default function AboutPage() {
  return (
    <Container>
      <div className="py-10 space-y-10 bg-gradient-to-b from-white to-gray-50">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-800">About Grade-A Express</h1>
          <p className="text-lg text-gray-500">
            Your trusted partner in global shipping and procurement solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Our Mission</h2>
              <p className="text-gray-500">
                At Grade-A Express, we strive to provide seamless, reliable, and efficient shipping and procurement services that connect businesses and individuals globally. Our commitment to excellence ensures that your goods are handled with the utmost care and delivered on time.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Our Vision</h2>
              <p className="text-gray-500">
                We envision being the leading global logistics solution provider, known for our innovative approach, customer-centric services, and sustainable practices in shipping and procurement.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Why Choose Us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2 text-gray-800">Global Reach</h3>
                <p className="text-gray-500">
                  With our extensive network, we connect you to markets worldwide, ensuring your shipments reach their destination safely.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2 text-gray-800">Expert Team</h3>
                <p className="text-gray-500">
                  Our experienced professionals provide personalized solutions tailored to your specific needs.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2 text-gray-800">Innovation</h3>
                <p className="text-gray-500">
                  We leverage cutting-edge technology to optimize our services and enhance your shipping experience.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Our Values</h2>
            <div className="space-y-4">
              <p className="text-gray-500">
                <span className="font-medium text-gray-700">Reliability:</span> We deliver on our promises, ensuring your trust is well-placed.
              </p>
              <p className="text-gray-500">
                <span className="font-medium text-gray-700">Transparency:</span> Clear communication and honest business practices are at our core.
              </p>
              <p className="text-gray-500">
                <span className="font-medium text-gray-700">Excellence:</span> We continuously strive to exceed expectations in every aspect of our service.
              </p>
              <p className="text-gray-500">
                <span className="font-medium text-gray-700">Customer Focus:</span> Your success is our priority, and we're dedicated to helping you achieve it.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  )
} 