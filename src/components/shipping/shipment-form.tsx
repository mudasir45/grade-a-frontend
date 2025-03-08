"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import useShippingData from "@/hooks/use-shipping-data";
import { useToast } from "@/hooks/use-toast";
import { ShippingAPI } from "@/lib/api/shipping";
import type {
  NewShipmentResponse,
  ShipmentRequest,
  ShippingRate,
} from "@/lib/types/shipping";
import { cn } from "@/lib/utils";
import { ArrowRight, Clock, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import PaymentForm from "../payment/payment-gateway";
import PaymentModal from "../payment/PaymentForm";

// Validation schemas
const emailSchema = z.string().email("Invalid email address");
const phoneSchema = z
  .string()
  .regex(
    /^\+?[1-9]\d{1,14}$/,
    "Phone number must be in international format (e.g., +1234567890)"
  );

// Update the restore shipment data function to handle NewShipmentResponse
const restoreShipmentData = (
  shipment: NewShipmentResponse
): ShipmentRequest => {
  return {
    sender_name: shipment.sender_name,
    sender_email: shipment.sender_email,
    sender_phone: shipment.sender_phone,
    sender_address: shipment.sender_address,
    sender_country: shipment.sender_country,
    recipient_name: shipment.recipient_name,
    recipient_email: shipment.recipient_email,
    recipient_phone: shipment.recipient_phone,
    recipient_address: shipment.recipient_address,
    recipient_country: shipment.recipient_country,
    package_type: shipment.package_type,
    weight: parseFloat(shipment.weight),
    length: parseFloat(shipment.length),
    width: parseFloat(shipment.width),
    height: parseFloat(shipment.height),
    description: shipment.description || "",
    declared_value: parseFloat(shipment.declared_value),
    service_type: shipment.service_type,
    insurance_required: shipment.insurance_required,
    signature_required: shipment.signature_required,
  };
};

export function ShipmentForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [shippingRate, setShippingRate] = useState<ShippingRate | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [pendingShipments, setPendingShipments] = useState<
    NewShipmentResponse[]
  >([]);
  const [selectedShipment, setSelectedShipment] =
    useState<NewShipmentResponse | null>(null);

  const {
    departureCountries,
    destinationCountries,
    serviceTypes,
    shippingZones,
    isLoading,
    error: dataError,
    refetch,
  } = useShippingData();

  const [fieldErrors, setFieldErrors] = useState<
    { field: string; message: string }[]
  >([]);

  const [formData, setFormData] = useState<ShipmentRequest>({
    sender_name: "",
    sender_email: "",
    sender_phone: "",
    sender_address: "",
    sender_country: "",
    recipient_name: "",
    recipient_email: "",
    recipient_phone: "",
    recipient_address: "",
    recipient_country: "",
    package_type: "",
    weight: 0,
    length: 0,
    width: 0,
    height: 0,
    description: "",
    declared_value: 0,
    service_type: "",
    insurance_required: false,
    signature_required: false,
  });

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const response = await ShippingAPI.getShipments();
      const pendingShipments = response.filter(
        (shipment: NewShipmentResponse) => shipment.payment_status === "PENDING"
      );
      setPendingShipments(pendingShipments);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch shipments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (
      typeof value === "string" &&
      (field.includes("email") || field.includes("phone"))
    ) {
      const error = validateField(field, value);
      if (error) {
        setFieldErrors((prev) => [
          ...prev.filter((e) => e.field !== field),
          { field, message: error },
        ]);
      } else {
        setFieldErrors((prev) => prev.filter((e) => e.field !== field));
      }
    }
  };

  // Validate field
  const validateField = (field: string, value: string): string | null => {
    try {
      switch (field) {
        case "sender_email":
        case "recipient_email":
          emailSchema.parse(value);
          return null;
        case "sender_phone":
        case "recipient_phone":
          phoneSchema.parse(value);
          return null;
        default:
          return null;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0].message;
      }
      return "Invalid input";
    }
  };

  // Get error message for a field
  const getFieldError = (field: string): string | undefined => {
    return fieldErrors.find((e) => e.field === field)?.message;
  };

  // Calculate shipping rate when relevant fields change
  useEffect(() => {
    const calculateRate = async () => {
      const requiredFields = [
        "sender_country",
        "recipient_country",
        "weight",
        "length",
        "width",
        "height",
        "service_type",
      ];

      const hasAllFields = requiredFields.every((field) => {
        const value = formData[field as keyof ShipmentRequest];
        return typeof value === "number" ? value > 0 : Boolean(value);
      });

      if (!hasAllFields) return;

      setCalculating(true);
      try {
        const rate = await ShippingAPI.calculateRate({
          origin_country: formData.sender_country,
          destination_country: formData.recipient_country,
          weight: formData.weight,
          length: formData.length,
          width: formData.width,
          height: formData.height,
          service_type: formData.service_type,
          declared_value: formData.declared_value || 0,
          insurance_required: formData.insurance_required || false,
        });
        setShippingRate(rate);
      } catch (error) {
        console.error("Rate calculation error:", error);
        toast({
          title: "Rate Calculation Failed",
          description:
            error instanceof Error ? error.message : "Failed to calculate rate",
          variant: "destructive",
        });
      } finally {
        setCalculating(false);
      }
    };

    const timeoutId = setTimeout(calculateRate, 500);
    return () => clearTimeout(timeoutId);
  }, [formData, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
      return;
    }

    if (!shippingRate) {
      toast({
        title: "Missing Rate",
        description: "Please wait for the shipping rate calculation.",
        variant: "destructive",
      });
      return;
    }

    setShowPayment(true);
  };

  const validateForm = (): boolean => {
    const requiredFields = [
      "sender_name",
      "sender_email",
      "sender_phone",
      "sender_address",
      "sender_country",
      "recipient_name",
      "recipient_email",
      "recipient_phone",
      "recipient_address",
      "recipient_country",
      "package_type",
      "weight",
      "length",
      "width",
      "height",
      "service_type",
    ];

    const newErrors = [];

    for (const field of requiredFields) {
      const value = formData[field as keyof ShipmentRequest];
      if (!value || (typeof value === "number" && value <= 0)) {
        newErrors.push({
          field,
          message: `${field.replace(/_/g, " ")} is required`,
        });
      }
    }

    setFieldErrors(newErrors);
    return newErrors.length === 0;
  };

  // Update the payment continuation handler
  const handlePaymentContinuation = async (shipment: NewShipmentResponse) => {
    setLoading(true);
    try {
      // First restore the shipment data
      const restoredData = restoreShipmentData(shipment);

      // Calculate shipping rate first
      const rate = await ShippingAPI.calculateRate({
        origin_country: restoredData.sender_country,
        destination_country: restoredData.recipient_country,
        weight: restoredData.weight,
        length: restoredData.length,
        width: restoredData.width,
        height: restoredData.height,
        service_type: restoredData.service_type,
        declared_value: restoredData.declared_value || 0,
        insurance_required: restoredData.insurance_required || false,
      });

      // Only update form and state if we got a valid rate
      setShippingRate(rate);
      setFormData(restoredData);
      setSelectedShipment(shipment);

      // Scroll to form section
      const formElement = document.querySelector("form");
      if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      toast({
        title: "Shipment Restored",
        description: "Please review the details and complete the payment",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to restore shipment details",
        variant: "destructive",
      });
      // Reset states on error
      setSelectedShipment(null);
      setShippingRate(null);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">
          Error loading shipping data: {dataError.message}
        </p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (showPayment && shippingRate) {
    return (
      <PaymentForm
        amount={shippingRate.cost_breakdown.total_cost.toString()}
        shippingAddress={formData.sender_address}
        paymentType="shipping"
        metadata={{
          requestType: "shipping",
          shipmentData: formData,
          shipmentStatus: { payment_status: "PAID" },
          shipmentId: selectedShipment?.id,
        }}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Pending Shipments List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Shipments
          </CardTitle>
          <CardDescription>
            Select a shipment to view and update details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full rounded-md border">
            <div className="p-4">
              {pendingShipments.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  No pending shipments
                </p>
              ) : (
                <div className="space-y-4">
                  {pendingShipments.map((shipment) => (
                    <div
                      key={shipment.id}
                      className={cn(
                        "flex items-center justify-between p-4 border rounded-lg transition-colors hover:bg-gray-50",
                        selectedShipment?.id === shipment.id &&
                          "border-blue-500 bg-blue-50 hover:bg-blue-50"
                      )}
                    >
                      <div className="space-y-1">
                        <p className="font-medium">
                          #{shipment.tracking_number}
                        </p>
                        <p className="text-sm text-gray-500">
                          From: {shipment.sender_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          To: {shipment.recipient_name}
                        </p>
                        <Badge
                          variant={
                            shipment.status === "DELIVERED"
                              ? "success"
                              : "default"
                          }
                        >
                          {shipment.status}
                        </Badge>
                      </div>
                      <div>
                        <Button
                          size="sm"
                          variant={
                            selectedShipment?.id === shipment.id
                              ? "secondary"
                              : "default"
                          }
                          onClick={() => {
                            if (selectedShipment?.id === shipment.id) {
                              setSelectedShipment(null);
                              setFormData({
                                sender_name: "",
                                sender_email: "",
                                sender_phone: "",
                                sender_address: "",
                                sender_country: "",
                                recipient_name: "",
                                recipient_email: "",
                                recipient_phone: "",
                                recipient_address: "",
                                recipient_country: "",
                                package_type: "",
                                weight: 0,
                                length: 0,
                                width: 0,
                                height: 0,
                                description: "",
                                declared_value: 0,
                                service_type: "",
                                insurance_required: false,
                                signature_required: false,
                              });
                            } else {
                              handlePaymentContinuation(shipment);
                            }
                          }}
                        >
                          {selectedShipment?.id === shipment.id
                            ? "Cancel"
                            : "View Details"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <PaymentModal
        price={shippingRate?.cost_breakdown.total_cost || 0}
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        metadata={{
          requestType: "shipping",
          shipmentData: formData,
          shipmentStatus: { payment_status: "PAID" },
          shipmentId: selectedShipment?.id,
        }}
      />

      {/* Show form only when a shipment is selected */}
      {selectedShipment && (
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Shipment Details
              </CardTitle>
              <CardDescription>
                Review and update shipment information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sender Details */}
              <div className="space-y-4">
                <h3 className="font-medium">Sender Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sender_name">Full Name</Label>
                    <Input
                      id="sender_name"
                      value={formData.sender_name}
                      onChange={(e) =>
                        handleFieldChange("sender_name", e.target.value)
                      }
                      className={cn(
                        getFieldError("sender_name") && "border-red-500"
                      )}
                    />
                    {getFieldError("sender_name") && (
                      <p className="text-xs text-red-500">
                        {getFieldError("sender_name")}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sender_email">Email</Label>
                    <Input
                      id="sender_email"
                      type="email"
                      value={formData.sender_email}
                      onChange={(e) =>
                        handleFieldChange("sender_email", e.target.value)
                      }
                      className={cn(
                        getFieldError("sender_email") && "border-red-500"
                      )}
                    />
                    {getFieldError("sender_email") && (
                      <p className="text-xs text-red-500">
                        {getFieldError("sender_email")}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sender_phone">Phone</Label>
                    <Input
                      id="sender_phone"
                      value={formData.sender_phone}
                      onChange={(e) =>
                        handleFieldChange("sender_phone", e.target.value)
                      }
                      className={cn(
                        getFieldError("sender_phone") && "border-red-500"
                      )}
                    />
                    {getFieldError("sender_phone") && (
                      <p className="text-xs text-red-500">
                        {getFieldError("sender_phone")}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sender_country">Country</Label>
                    <Select
                      value={formData.sender_country}
                      onValueChange={(value) =>
                        handleFieldChange("sender_country", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {departureCountries.map((country) => (
                          <SelectItem key={country.code} value={country.id}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="sender_address">Address</Label>
                    <Textarea
                      id="sender_address"
                      value={formData.sender_address}
                      onChange={(e) =>
                        handleFieldChange("sender_address", e.target.value)
                      }
                      className={cn(
                        "min-h-[80px]",
                        getFieldError("sender_address") && "border-red-500"
                      )}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Recipient Details */}
              <div className="space-y-4">
                <h3 className="font-medium">Recipient Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipient_name">Full Name</Label>
                    <Input
                      id="recipient_name"
                      value={formData.recipient_name}
                      onChange={(e) =>
                        handleFieldChange("recipient_name", e.target.value)
                      }
                      className={cn(
                        getFieldError("recipient_name") && "border-red-500"
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recipient_email">Email</Label>
                    <Input
                      id="recipient_email"
                      type="email"
                      value={formData.recipient_email}
                      onChange={(e) =>
                        handleFieldChange("recipient_email", e.target.value)
                      }
                      className={cn(
                        getFieldError("recipient_email") && "border-red-500"
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recipient_phone">Phone</Label>
                    <Input
                      id="recipient_phone"
                      value={formData.recipient_phone}
                      onChange={(e) =>
                        handleFieldChange("recipient_phone", e.target.value)
                      }
                      className={cn(
                        getFieldError("recipient_phone") && "border-red-500"
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recipient_country">Country</Label>
                    <Select
                      value={formData.recipient_country}
                      onValueChange={(value) =>
                        handleFieldChange("recipient_country", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {destinationCountries.map((country) => (
                          <SelectItem key={country.code} value={country.id}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="recipient_address">Address</Label>
                    <Textarea
                      id="recipient_address"
                      value={formData.recipient_address}
                      onChange={(e) =>
                        handleFieldChange("recipient_address", e.target.value)
                      }
                      className={cn(
                        "min-h-[80px]",
                        getFieldError("recipient_address") && "border-red-500"
                      )}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Package Details */}
              <div className="space-y-4">
                <h3 className="font-medium">Package Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="package_type">Package Type</Label>
                    <Select
                      value={formData.package_type}
                      onValueChange={(value) =>
                        handleFieldChange("package_type", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select package type" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          { id: "document", name: "Document" },
                          { id: "parcel", name: "Parcel" },
                          { id: "box", name: "Box" },
                          { id: "pallet", name: "Pallet" },
                        ].map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service_type">Service Type</Label>
                    <Select
                      value={formData.service_type}
                      onValueChange={(value) =>
                        handleFieldChange("service_type", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) =>
                        handleFieldChange("weight", parseFloat(e.target.value))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Dimensions (cm)</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Length"
                        type="number"
                        min="1"
                        value={formData.length}
                        onChange={(e) =>
                          handleFieldChange(
                            "length",
                            parseFloat(e.target.value)
                          )
                        }
                      />
                      <Input
                        placeholder="Width"
                        type="number"
                        min="1"
                        value={formData.width}
                        onChange={(e) =>
                          handleFieldChange("width", parseFloat(e.target.value))
                        }
                      />
                      <Input
                        placeholder="Height"
                        type="number"
                        min="1"
                        value={formData.height}
                        onChange={(e) =>
                          handleFieldChange(
                            "height",
                            parseFloat(e.target.value)
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="declared_value">Declared Value (USD)</Label>
                    <Input
                      id="declared_value"
                      type="number"
                      min="0"
                      value={formData.declared_value}
                      onChange={(e) =>
                        handleFieldChange(
                          "declared_value",
                          parseFloat(e.target.value)
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Package Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        handleFieldChange("description", e.target.value)
                      }
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="col-span-2 space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="insurance_required"
                        checked={formData.insurance_required}
                        onCheckedChange={(checked) =>
                          handleFieldChange(
                            "insurance_required",
                            checked as boolean
                          )
                        }
                      />
                      <Label
                        htmlFor="insurance_required"
                        className="text-sm text-muted-foreground"
                      >
                        Add Insurance (Optional)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="signature_required"
                        checked={formData.signature_required}
                        onCheckedChange={(checked) =>
                          handleFieldChange(
                            "signature_required",
                            checked as boolean
                          )
                        }
                      />
                      <Label
                        htmlFor="signature_required"
                        className="text-sm text-muted-foreground"
                      >
                        Require Signature (Optional)
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              {calculating && (
                <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Calculating shipping rate...</span>
                </div>
              )}

              {shippingRate && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Shipping Cost Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid gap-2">
                      <div className="flex justify-between">
                        <span>Base Rate:</span>
                        <span>${shippingRate.rate_details.base_rate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Weight Charge:</span>
                        <span>${shippingRate.rate_details.weight_charge}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Service Charge:</span>
                        <span>
                          ${shippingRate.cost_breakdown.service_price}
                        </span>
                      </div>
                      {shippingRate.cost_breakdown.additional_charges.map(
                        (charge) => (
                          <div
                            key={charge.name}
                            className="flex justify-between"
                          >
                            <span>{charge.name}:</span>
                            <span>${charge.amount}</span>
                          </div>
                        )
                      )}
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>${shippingRate.cost_breakdown.total_cost}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
            <CardFooter>
              <div className="flex justify-between w-full">
                <Button
                  type="submit"
                  disabled={loading || !shippingRate || fieldErrors.length > 0}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Complete Payment (BizaPay)
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  )}
                </Button>
                <Button
                  onClick={() => setPaymentModalOpen(true)}
                  type="button"
                  disabled={loading || !shippingRate || fieldErrors.length > 0}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Payment (Using PayStack)
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  );
}
