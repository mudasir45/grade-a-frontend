import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Container } from "@/components/ui/container"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Clock, Mail, MapPin, Phone } from "lucide-react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us | Grade-A Express",
  description: "Get in touch with Grade-A Express for any inquiries about our shipping and procurement services.",
}

export default function ContactPage() {
  return (
    <Container>
      <div className="py-10 space-y-10 bg-gradient-to-b from-white to-gray-50">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-800">Contact Us</h1>
          <p className="text-lg text-gray-500">
            We're here to help! Reach out to us with any questions or concerns.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-gray-700">First Name</Label>
                      <Input 
                        id="firstName" 
                        placeholder="Enter your first name"
                        className="bg-white border-gray-200 focus:border-blue-200 focus:ring-blue-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-gray-700">Last Name</Label>
                      <Input 
                        id="lastName" 
                        placeholder="Enter your last name"
                        className="bg-white border-gray-200 focus:border-blue-200 focus:ring-blue-100"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="Enter your email address"
                      className="bg-white border-gray-200 focus:border-blue-200 focus:ring-blue-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-gray-700">Subject</Label>
                    <Input 
                      id="subject" 
                      placeholder="What is your message about?"
                      className="bg-white border-gray-200 focus:border-blue-200 focus:ring-blue-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-gray-700">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Type your message here..."
                      className="min-h-[150px] bg-white border-gray-200 focus:border-blue-200 focus:ring-blue-100"
                    />
                  </div>

                  <Button type="submit" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Contact Information</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-700">Address</p>
                      <p className="text-gray-500">123 Shipping Lane</p>
                      <p className="text-gray-500">Dubai, UAE</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-700">Phone</p>
                      <p className="text-gray-500">+971 4 123 4567</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-700">Email</p>
                      <p className="text-gray-500">info@gradeaexpress.com</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-700">Business Hours</p>
                      <p className="text-gray-500">Monday - Friday: 9:00 AM - 6:00 PM</p>
                      <p className="text-gray-500">Saturday: 9:00 AM - 1:00 PM</p>
                      <p className="text-gray-500">Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Quick Response</h2>
                <p className="text-gray-500">
                  We aim to respond to all inquiries within 24 hours during business days. For urgent matters, please contact us by phone.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Container>
  )
} 