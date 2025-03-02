import { ShipmentTracking } from "@/components/shipping/shipment-tracking";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Your Shipment | Grade-A Express",
  description:
    "Track your shipment in real-time with Grade-A Express tracking system.",
};

export default function TrackingPage() {
  return (
    <Container>
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

        <ShipmentTracking />

        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Shipment Information
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Tracking Number</p>
                    <p className="font-medium text-gray-700">
                      Enter tracking number above
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium text-gray-700">-</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Origin</p>
                    <p className="font-medium text-gray-700">-</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Destination</p>
                    <p className="font-medium text-gray-700">-</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estimated Delivery</p>
                    <p className="font-medium text-gray-700">-</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Service Type</p>
                    <p className="font-medium text-gray-700">-</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Tracking Timeline
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-3 opacity-50">
                  <Package className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-700">
                      Package Received
                    </p>
                    <p className="text-sm text-gray-500">
                      Waiting for tracking number
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 opacity-50">
                  <Truck className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-700">In Transit</p>
                    <p className="text-sm text-gray-500">
                      Package is on the way
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 opacity-50">
                  <Clock className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-700">
                      Out for Delivery
                    </p>
                    <p className="text-sm text-gray-500">
                      Package is out for delivery
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 opacity-50">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-700">Delivered</p>
                    <p className="text-sm text-gray-500">
                      Package has been delivered
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div> */}

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
                <Button
                  variant="outline"
                  className="border-gray-200 hover:bg-gray-50 text-gray-700"
                >
                  Contact Support
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-200 hover:bg-gray-50 text-gray-700"
                >
                  FAQ
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
