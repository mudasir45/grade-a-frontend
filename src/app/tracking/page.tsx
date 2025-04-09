"use client";
import { ShipmentTracking } from "@/components/shipping/shipment-tracking";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  FiHelpCircle,
  FiMessageSquare,
  FiPackage,
  FiPhone,
} from "react-icons/fi";

function TrackingContent() {
  // useSearchParams() is called within this component, which will be wrapped by Suspense.
  const searchParams = useSearchParams();
  const trackingNumber = searchParams.get("tracking_number");
  console.log(trackingNumber);
  return (
    <>
      <div className="py-10 space-y-10 bg-gradient-to-b from-white to-gray-50 mb-20">
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <div className="flex items-center justify-center mb-2">
            <div className="bg-red-50 p-3 rounded-full">
              <FiPackage className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Track Your Shipment
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Enter your tracking number to get real-time updates on your
            shipment.
          </p>
        </div>

        <ShipmentTracking IncomingTrackingNumber={trackingNumber || ""} />

        <Card className="bg-white border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300 max-w-3xl mx-auto overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="bg-red-50 p-2 rounded-full flex-shrink-0 mt-1">
                <FiHelpCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Need Help?
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-500">
                    Can't find your tracking number? Check your email
                    confirmation or contact our customer support team for
                    assistance.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/contact">
                      <Button
                        variant="outline"
                        className="border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-gray-700 transition-colors w-full sm:w-auto gap-2"
                      >
                        <FiPhone className="h-4 w-4" />
                        Contact Support
                      </Button>
                    </Link>
                    <Link href="/faq">
                      <Button
                        variant="outline"
                        className="border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-gray-700 transition-colors w-full sm:w-auto gap-2"
                      >
                        <FiMessageSquare className="h-4 w-4" />
                        FAQ
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default function TrackingPage() {
  return (
    <Container>
      <Suspense
        fallback={
          <div className="py-24 text-center">Loading tracking page...</div>
        }
      >
        <TrackingContent />
      </Suspense>
    </Container>
  );
}
