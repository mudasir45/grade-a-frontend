"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Clock, Mail, MapPin, MessageSquare, Phone, Send } from "lucide-react";
import { useState } from "react";

// export const metadata: Metadata = {
//   title: "Contact Us | Grade-A Express",
//   description:
//     "Get in touch with Grade-A Express for any inquiries about our shipping and procurement services.",
// };

// Define the form data type
type ContactFormData = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

// Initial form state
const INITIAL_FORM_STATE: ContactFormData = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

export default function ContactPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ContactFormData>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});
  const [loading, setLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    // Clear error when user types
    if (errors[id as keyof ContactFormData]) {
      setErrors((prev) => ({
        ...prev,
        [id]: "",
      }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Validate phone (10 digits)
    // if (
    //   formData.phone.trim() &&
    //   !/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))
    // ) {
    //   newErrors.phone = "Please enter a valid 10-digit phone number";
    // }

    // Validate subject
    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    // Validate message
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Form Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/accounts/contact/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            subject: formData.subject,
            message: formData.message,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Something went wrong");
      }

      // Show success dialog
      setShowSuccessDialog(true);

      // Reset form
      setFormData(INITIAL_FORM_STATE);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to submit form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <div className="py-12 space-y-12 bg-gradient-to-b from-white to-gray-50 mb-20">
        {/* Hero Section */}
        <div className="space-y-6 text-center max-w-3xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-red-50 p-3 rounded-full shadow-sm relative">
              <div className="absolute inset-0 bg-red-200 rounded-full blur-md opacity-40"></div>
              <MessageSquare className="h-8 w-8 text-red-600 relative z-10" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight">
            Contact Us
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We're here to assist you with any inquiries about our shipping and
            procurement services. Our team of experts is ready to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-8">
            <Card className="bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <CardContent className="p-8 lg:p-10">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800 tracking-tight">
                  Send Us a Message
                </h2>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700 font-medium">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className={`bg-white border-gray-200 focus:border-red-200 focus:ring-red-100 h-11 ${
                        errors.name ? "border-red-500" : ""
                      }`}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-gray-700 font-medium"
                      >
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                        className={`bg-white border-gray-200 focus:border-red-200 focus:ring-red-100 h-11 ${
                          errors.email ? "border-red-500" : ""
                        }`}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="text-gray-700 font-medium"
                      >
                        Phone Number{" "}
                        <span className="text-gray-400 font-normal">
                          (optional)
                        </span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 234 567 8900"
                        className={`bg-white border-gray-200 focus:border-red-200 focus:ring-red-100 h-11 ${
                          errors.phone ? "border-red-500" : ""
                        }`}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="subject"
                      className="text-gray-700 font-medium"
                    >
                      Subject
                    </Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="What is your inquiry about?"
                      className={`bg-white border-gray-200 focus:border-red-200 focus:ring-red-100 h-11 ${
                        errors.subject ? "border-red-500" : ""
                      }`}
                    />
                    {errors.subject && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="message"
                      className="text-gray-700 font-medium"
                    >
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Please provide details about your inquiry..."
                      className={`min-h-[180px] bg-white border-gray-200 focus:border-red-200 focus:ring-red-100 resize-none ${
                        errors.message ? "border-red-500" : ""
                      }`}
                    />
                    {errors.message && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="px-8 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium transition-colors duration-200 shadow-md flex items-center gap-2 h-12 rounded-md"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Sending Message...
                        </div>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <CardContent className="p-8">
                <h2 className="text-xl font-semibold mb-5 text-gray-800 flex items-center">
                  <div className="bg-red-50 p-1.5 rounded-full mr-2 flex-shrink-0">
                    <Phone className="w-4 h-4 text-red-600" />
                  </div>
                  Contact Details
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-3">
                    <div className="bg-red-50 p-1.5 rounded-full mt-0.5 flex-shrink-0">
                      <MapPin className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="w-full">
                      <p className="font-medium text-gray-700 mb-3 text-lg">
                        Office Addresses
                      </p>

                      <div className="space-y-4">
                        <div className="p-3 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
                          <p className="text-gray-800 font-medium text-base mb-1.5">
                            Malaysia Office
                          </p>
                          <p className="text-gray-600 leading-relaxed">
                            Grade A Express, Bandar Hill Park, 32, Jalan
                            Hillpark 11/3,
                            <br />
                            42300 Puncak Alam, Selangor
                          </p>
                        </div>

                        <div className="p-3 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
                          <p className="text-gray-800 font-medium text-base mb-1.5">
                            Lagos Office
                          </p>
                          <p className="text-gray-600 leading-relaxed">
                            Shop 23, Victory plaza, beside Mobil filling
                            station,
                            <br />
                            ilepo oke odo bus stop, along abule egba/iyana paja
                            express way,
                            <br />
                            Lagos, Nigeria.
                          </p>
                        </div>

                        <div className="p-3 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
                          <p className="text-gray-800 font-medium text-base mb-1.5">
                            Ibadan Office
                          </p>
                          <p className="text-gray-600 leading-relaxed">
                            Flat 2 Block 1, GRA in front of Lifeforte Intl
                            School,
                            <br />
                            Awotan, Ibadan, Oyo State, Nigeria
                          </p>
                        </div>

                        <div className="p-3 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
                          <p className="text-gray-800 font-medium text-base mb-1.5">
                            Kano Office
                          </p>
                          <p className="text-gray-600 leading-relaxed">
                            Aminu Kano International Airport,
                            <br />
                            Kano, Nigeria
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-red-50 p-1.5 rounded-full mt-0.5 flex-shrink-0">
                      <Phone className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 mb-1">Phone</p>
                      <p className="text-gray-600">
                        +60 11-3690 7583{" "}
                        <span className="text-gray-500">(Malaysia)</span>
                      </p>
                      <p className="text-gray-600">
                        +234 902 020 2928{" "}
                        <span className="text-gray-500">(Nigeria)</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-red-50 p-1.5 rounded-full mt-0.5 flex-shrink-0">
                      <Mail className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 mb-1">Email</p>
                      <a
                        href="mailto:gradeaplus21@gmail.com"
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        gradeaplus21@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-red-50 p-1.5 rounded-full mt-0.5 flex-shrink-0">
                      <Clock className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 mb-1">
                        Business Hours
                      </p>
                      <p className="text-gray-600">
                        Monday - Friday:{" "}
                        <span className="font-medium">9:00 AM - 6:00 PM</span>
                      </p>
                      <p className="text-gray-600">
                        Saturday:{" "}
                        <span className="font-medium">9:00 AM - 1:00 PM</span>
                      </p>
                      <p className="text-gray-600">
                        Sunday: <span className="font-medium">Closed</span>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <CardContent className="p-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <div className="bg-white/20 p-1.5 rounded-full mr-2 flex-shrink-0 backdrop-blur-sm">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  Need Urgent Assistance?
                </h2>
                <p className="opacity-90 mb-4 leading-relaxed">
                  We aim to respond to all inquiries within 24 hours during
                  business days. For urgent matters, please contact us by phone.
                </p>
                <a
                  href="tel:+601136907583"
                  className="inline-flex items-center gap-2 bg-white text-red-600 hover:bg-red-50 px-4 py-2 rounded-md font-medium transition-colors mt-2"
                >
                  <Phone className="h-4 w-4" />
                  Call Us Now
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-red-600">
              Thank You!
            </DialogTitle>
            <DialogDescription className="text-center pt-4">
              <div className="flex justify-center mb-6">
                <div className="rounded-full bg-red-50 p-4 relative">
                  <div className="absolute inset-0 bg-red-100 rounded-full blur-md opacity-60"></div>
                  <svg
                    className="h-12 w-12 text-red-600 relative z-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-xl font-medium mb-4 text-gray-800">
                Your message has been successfully sent!
              </p>
              <p className="text-gray-600">
                We appreciate your contact and will get back to you as soon as
                possible.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-6">
            <Button
              onClick={() => setShowSuccessDialog(false)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Container>
  );
}
