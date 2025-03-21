"use client";
import { ShipmentTracking } from "@/components/shipping/shipment-tracking";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function TrackingContent() {
  // useSearchParams() is called within this component, which will be wrapped by Suspense.
  const searchParams = useSearchParams();
  const trackingNumber = searchParams.get("tracking_number");
  console.log(trackingNumber);
  return (
    <>
      <div className="py-10 space-y-10 bg-gradient-to-b from-white to-gray-50">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-800">
            Track Your Shipment
          </h1>
          <p className="text-lg text-gray-500">
            Enter your tracking number to get real-time updates on your
            shipment.
          </p>
        </div>

        <ShipmentTracking IncomingTrackingNumber={trackingNumber || ""} />

        <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Need Help?
            </h2>
            <div className="space-y-4">
              <p className="text-gray-500">
                Can't find your tracking number? Check your email confirmation
                or contact our customer support team for assistance.
              </p>
              <div className="flex flex-col md:flex-row gap-4">
                <Link href="/contact">
                  <Button
                    variant="outline"
                    className="border-gray-200 hover:bg-gray-50 text-gray-700"
                  >
                    Contact Support
                  </Button>
                </Link>
                <Link href="/faq">
                  <Button
                    variant="outline"
                    className="border-gray-200 hover:bg-gray-50 text-gray-700"
                  >
                    FAQ
                  </Button>
                </Link>
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
      <Suspense fallback={<div>Loading tracking page...</div>}>
        <TrackingContent />
      </Suspense>
    </Container>
  );
}
