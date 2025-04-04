"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useBuy4Me } from "@/hooks/use-buy4me";
import { useToast } from "@/hooks/use-toast";
import { Buy4MeRequest, City } from "@/lib/types/index";
import { convertCurrency, formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import PaymentForm from "../payment/payment-gateway";
import PaymentModal from "../payment/PaymentForm";
import { OrderTracking } from "./order-tracking";

export function OrderSummary() {
  const {
    activeRequest,
    calculateTotals,
    submitRequest,
    loading: requestLoading,
  } = useBuy4Me();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [submittedRequest, setSubmittedRequest] =
    useState<Buy4MeRequest | null>(null);
  const [shippingAddress, setShippingAddress] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [cityDeliveryCharge, setCityDeliveryCharge] = useState<number>(0);
  const [convertedAmount, setConvertedAmount] = useState<number>(0);
  const [convertingCurrency, setConvertingCurrency] = useState(false);

  const apiTotalCost = activeRequest?.total_cost
    ? parseFloat(activeRequest.total_cost)
    : 0;
  const totals = calculateTotals();
  const totalWithCityCharge = apiTotalCost + cityDeliveryCharge;

  useEffect(() => {
    if (activeRequest) {
      console.log("API total_cost:", activeRequest.total_cost);
      console.log("Calculated total with city charge:", totalWithCityCharge);
    }
  }, [activeRequest, totalWithCityCharge]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/accounts/cities/`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch cities");
        }
        const data = await response.json();
        setCities(data);
      } catch (error) {
        console.error("Error fetching cities:", error);
        toast({
          title: "Error",
          description: "Failed to fetch cities",
          variant: "destructive",
        });
      }
    };
    fetchCities();
  }, [toast]);

  useEffect(() => {
    const performCurrencyConversion = async () => {
      if (totalWithCityCharge > 0) {
        try {
          setConvertingCurrency(true);
          const nairaAmount = await convertCurrency(
            totalWithCityCharge,
            "MYR",
            "NGN"
          );
          setConvertedAmount(nairaAmount);
        } catch (error) {
          console.error("Error converting currency:", error);
          toast({
            title: "Currency Conversion Error",
            description:
              "Failed to convert currency. Using approximate conversion.",
            variant: "destructive",
          });
          setConvertedAmount(totalWithCityCharge * 340);
        } finally {
          setConvertingCurrency(false);
        }
      }
    };

    performCurrencyConversion();
  }, [totalWithCityCharge, toast]);

  const handleCityChange = (cityId: string) => {
    setSelectedCity(cityId);
    const city = cities.find((c) => c.id === cityId);
    if (city) {
      setCityDeliveryCharge(parseFloat(city.delivery_charge));
    } else {
      setCityDeliveryCharge(0);
    }
  };

  const handleProceedToPayment = () => {
    if (!activeRequest || activeRequest.items.length === 0) {
      toast({
        title: "No Items",
        description: "Please add items to your request list before proceeding.",
        variant: "destructive",
      });
      return;
    }

    if (!shippingAddress.trim()) {
      toast({
        title: "Missing Address",
        description: "Please provide a shipping address.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCity) {
      toast({
        title: "Missing City",
        description: "Please select a city for delivery.",
        variant: "destructive",
      });
      return;
    }

    setShowPayment(true);
  };

  const handlePaymentSuccess = async (transactionId: string) => {
    try {
      setLoading(true);
      const submitted = await submitRequest(shippingAddress, selectedCity);
      setSubmittedRequest(submitted);
      setShowPayment(false);

      toast({
        title: "Request Submitted",
        description: "Your request has been submitted successfully.",
      });

      setShippingAddress("");
      setSelectedCity("");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to submit request.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  const handlePayStackPayment = () => {
    if (!activeRequest || activeRequest.items.length === 0) {
      toast({
        title: "No Items",
        description: "Please add items to your request list before proceeding.",
        variant: "destructive",
      });
      return;
    }

    if (!shippingAddress.trim()) {
      toast({
        title: "Missing Address",
        description: "Please provide a shipping address.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCity) {
      toast({
        title: "Missing City",
        description: "Please select a city for delivery.",
        variant: "destructive",
      });
      return;
    }

    setPaymentModalOpen(true);
  };

  if (submittedRequest) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Request Submitted</CardTitle>
            <CardDescription>
              Thank you for your request. You can track its status below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OrderTracking order={submittedRequest} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showPayment) {
    return (
      <PaymentForm
        amount={totalWithCityCharge.toString()}
        shippingAddress={shippingAddress}
        paymentType="buy4me"
        metadata={{
          requestType: "buy4me",
          requestId: activeRequest?.id,
          items: activeRequest?.items,
          shipping_address: shippingAddress,
          city: selectedCity,
          total: totalWithCityCharge,
        }}
      />
    );
  }

  if (requestLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!activeRequest || activeRequest.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-lg text-muted-foreground">
          Add items to your request list to proceed
        </p>
      </div>
    );
  }

  return (
    <>
      <PaymentModal
        price={convertedAmount}
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        metadata={{
          requestType: "buy4me",
          requestId: activeRequest?.id,
          items: activeRequest?.items,
          shipping_address: shippingAddress,
          city: selectedCity,
          returnUrl: "/buy4me",
          activeRequest: JSON.stringify(activeRequest),
          total: totalWithCityCharge,
        }}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
            <CardDescription>
              Review your request details before submission
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeRequest.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-start border-b pb-3"
              >
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {item.quantity}
                  </p>
                  {(item.color || item.size) && (
                    <p className="text-sm text-muted-foreground">
                      Specs:{" "}
                      {[item.color, item.size].filter(Boolean).join(", ")}
                    </p>
                  )}
                  {item.store_to_warehouse_delivery_charge &&
                    parseFloat(item.store_to_warehouse_delivery_charge) > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Delivery:{" "}
                        {formatCurrency(
                          parseFloat(item.store_to_warehouse_delivery_charge)
                        )}
                      </p>
                    )}
                </div>
                <p className="font-medium">
                  {formatCurrency(parseFloat(item.unit_price) * item.quantity)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
            <CardDescription>Estimated costs for your order</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Products Total</span>
              <span>{formatCurrency(totals.productsTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charges (Items)</span>
              <span>
                {formatCurrency(
                  activeRequest.items.reduce(
                    (total, item) =>
                      total +
                      parseFloat(
                        item.store_to_warehouse_delivery_charge || "0"
                      ),
                    0
                  )
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Platform Fee</span>
              <span>{formatCurrency(apiTotalCost - totals.productsTotal)}</span>
            </div>
            {selectedCity && (
              <div className="flex justify-between text-primary">
                <span>City Delivery Charge</span>
                <span>{formatCurrency(cityDeliveryCharge)}</span>
              </div>
            )}
            <Separator />
            <div className="border-t pt-4 flex justify-between font-bold">
              <span>Total (MYR)</span>
              <span>{formatCurrency(totalWithCityCharge)}</span>
            </div>
            {convertedAmount > 0 && (
              <div className="flex justify-between text-primary font-medium">
                <span>Naira Equivalent</span>
                <span>
                  {convertingCurrency
                    ? "Calculating..."
                    : `₦${convertedAmount.toLocaleString()}`}
                </span>
              </div>
            )}

            <div className="pt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Delivery City</label>
                <Select value={selectedCity} onValueChange={handleCityChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id || ""}>
                        {city.name} - Delivery: RM{city.delivery_charge}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="shipping-address"
                  className="text-sm font-medium"
                >
                  Shipping Address
                </label>
                <Textarea
                  id="shipping-address"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Enter your complete shipping address"
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3">
            <Button
              className="w-full"
              onClick={handleProceedToPayment}
              disabled={
                loading ||
                !activeRequest.items.length ||
                !shippingAddress.trim() ||
                !selectedCity
              }
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Pay with BizaPay"
              )}
            </Button>
            <Button
              className="w-full"
              variant="outline"
              onClick={handlePayStackPayment}
              disabled={
                loading ||
                convertingCurrency ||
                !activeRequest.items.length ||
                !shippingAddress.trim() ||
                !selectedCity
              }
            >
              {convertingCurrency ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Converting...
                </>
              ) : (
                "Pay with PayStack"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
