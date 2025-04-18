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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import useShippingData from "@/hooks/use-shipping-data";
import { useToast } from "@/hooks/use-toast";
import { ShippingAPI } from "@/lib/api/shipping";
import { City } from "@/lib/types/index";
import type {
  Extras,
  NewShipmentResponse,
  ShipmentRequest,
  ShippingRate,
} from "@/lib/types/shipping";
import { cn, convertCurrency } from "@/lib/utils";
import {
  ArrowRight,
  Check,
  CheckSquare,
  Clock,
  DollarSign,
  FileText,
  Loader2,
  MapPin,
  Shield,
  Truck,
  Weight,
} from "lucide-react";
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

// Define our custom types
interface CityData {
  id: string;
  name: string;
}

// Update the restore shipment data function to handle NewShipmentResponse
const restoreShipmentData = (
  shipment: NewShipmentResponse
): NewShipmentResponse => {
  return {
    ...shipment,
    city:
      typeof shipment.city === "object" && shipment.city !== null
        ? shipment.city
        : {
            name: "",
            postal_code: "",
            delivery_charge: "0",
          },
  };
};

export function ShipmentForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [shippingRate, setShippingRate] = useState<ShippingRate | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [codFeePercentage, setCodFeePercentage] = useState<number>(5);
  const [extras, setExtras] = useState<Extras[]>([]);
  const [pendingShipments, setPendingShipments] = useState<
    NewShipmentResponse[]
  >([]);
  const [selectedShipment, setSelectedShipment] =
    useState<NewShipmentResponse | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "COD">(
    "ONLINE"
  );
  const [paymentCurrency, setPaymentCurrency] = useState<"MYR" | "NGN">("MYR");
  const { getDynamicRates } = useAuth();

  // At the component level, add a state for converted amounts
  const [nairaTotalAmount, setNairaTotalAmount] = useState<number | null>(null);
  const [nairaCodTotalAmount, setNairaCodTotalAmount] = useState<number | null>(
    null
  );

  // Add a loading state for currency conversion
  const [currencyLoading, setCurrencyLoading] = useState(false);

  useEffect(() => {
    const getExtras = async () => {
      try {
        const extras = await ShippingAPI.getExtras();
        setExtras(extras);
      } catch (error) {
        console.log("error while fetching extras");
      }
    };
    getExtras();
  }, [codFeePercentage]);

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

  useEffect(() => {
    const fetchDynamicRates = async () => {
      try {
        const data = await getDynamicRates();
        console.log("Dynamic rates:", data);
        if (data && Array.isArray(data)) {
          // Find COD fee in dynamic rates
          const codRate = data.find(
            (rate) =>
              rate.rate_type === "COD_FEE" && rate.charge_type === "PERCENTAGE"
          );

          if (codRate && codRate.is_active) {
            setCodFeePercentage(codRate.value);
            console.log("COD fee percentage:", codRate.value);
          }
        }
      } catch (error) {
        console.error("Error fetching dynamic rates:", error);
      }
    };
    fetchDynamicRates();
  }, [getDynamicRates]);

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

  const [formData, setFormData] = useState<NewShipmentResponse>({
    id: "",
    user: "",
    cod_amount: "",
    payment_method: "ONLINE",
    payment_status: "PENDING",
    payment_date: "",
    transaction_id: "",
    receipt: "",
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
    weight: "0",
    length: "0",
    width: "0",
    height: "0",
    description: "",
    declared_value: "0",
    insurance_required: false,
    signature_required: false,
    tracking_number: "",
    current_location: "",
    estimated_delivery: null,
    status: "PENDING",
    base_rate: "0",
    per_kg_rate: "0",
    weight_charge: "0",
    service_charge: "0",
    total_additional_charges: "0",
    total_cost: "0",
    notes: "",
    created_at: "",
    updated_at: "",
    staff: null,
    service_type: "",
    city: {
      name: "",
      postal_code: "",
      delivery_charge: "0",
      is_active: true,
    },
    extras: [],
    delivery_charge: "0",
  });

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const response = await ShippingAPI.getShipments();

      // Check if response exists and has the expected structure
      if (response && Array.isArray(response)) {
        const pendingShipments = response.filter(
          (shipment: NewShipmentResponse) =>
            shipment.payment_status === "PENDING" ||
            shipment.payment_status === "COD_PENDING"
        );
        console.log("Pending payment shipments:", pendingShipments);
        setPendingShipments(pendingShipments);
      } else if (response && response.data && Array.isArray(response.data)) {
        // Some APIs return data in a nested structure like { data: [...] }
        const pendingShipmentsFromData = response.data.filter(
          (shipment: NewShipmentResponse) =>
            shipment.payment_status === "PENDING"
        );
        console.log(
          "Pending payment shipments from data:",
          pendingShipmentsFromData
        );
        setPendingShipments(pendingShipmentsFromData);
      } else {
        console.error("Unexpected response format:", response);
        toast({
          title: "Data Format Error",
          description: "Received unexpected data format from server",
          variant: "destructive",
        });
        setPendingShipments([]);
      }
    } catch (error) {
      console.error("Error fetching shipments:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch shipments",
        variant: "destructive",
      });
      setPendingShipments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);

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

  // Update the city selection handler
  const handleCityChange = (value: string) => {
    const selectedCity = cities.find((city) => city.id === value);
    if (selectedCity) {
      setFormData((prev) => ({
        ...prev,
        city: {
          id: selectedCity.id,
          name: selectedCity.name,
          postal_code: selectedCity.postal_code,
          delivery_charge: selectedCity.delivery_charge,
          is_active: selectedCity.is_active,
        },
      }));
      setHasChanges(true);
    }
  };

  // Update the handleExtraChange function
  const handleExtraChange = (
    extraId: string,
    checked: boolean,
    quantity: number = 1
  ) => {
    setFormData((prev) => {
      const currentExtras = prev.extras || [];
      let newExtras;

      if (checked) {
        const extra = extras.find((e) => e.id === extraId);
        if (extra) {
          // For percentage charge types, always set quantity to 1
          const finalQuantity =
            extra.charge_type.toUpperCase() === "PERCENTAGE" ? 1 : quantity;

          newExtras = [
            ...currentExtras,
            {
              id: extra.id,
              name: extra.name,
              charge_type: extra.charge_type,
              value: extra.value,
              quantity: finalQuantity,
            },
          ];
        }
      } else {
        newExtras = currentExtras.filter((extra) => extra.id !== extraId);
      }

      return {
        ...prev,
        extras: newExtras || currentExtras,
        payment_method: extraId === "cod_charge" ? "COD" : "ONLINE",
      };
    });
    setHasChanges(true);
  };

  // Update the handleQuantityChange function
  const handleQuantityChange = (extraId: string, value: string | number) => {
    const newQuantity =
      typeof value === "string" ? parseInt(value) || 1 : value;

    // Find the extra to check its charge type
    const extraItem = extras.find((e) => e.id === extraId);

    // Don't update quantity for percentage charges
    if (extraItem && extraItem.charge_type.toUpperCase() === "PERCENTAGE") {
      return;
    }

    setFormData((prev) => {
      const currentExtras = prev.extras || [];
      const updatedExtras = currentExtras.map((extra) =>
        extra.id === extraId ? { ...extra, quantity: newQuantity } : extra
      );
      return {
        ...prev,
        extras: updatedExtras,
      };
    });
    setHasChanges(true);
  };

  // Update the calculateRate function
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
        "city",
      ];

      const hasAllFields = requiredFields.every((field) => {
        const value = formData[field as keyof NewShipmentResponse];
        return typeof value === "number" ? value > 0 : Boolean(value);
      });

      if (!hasAllFields) return;

      setCalculating(true);
      try {
        const rate = await ShippingAPI.calculateRate({
          origin_country: formData.sender_country,
          destination_country: formData.recipient_country,
          weight: parseFloat(formData.weight),
          length: parseFloat(formData.length),
          width: parseFloat(formData.width),
          height: parseFloat(formData.height),
          service_type: formData.service_type,
          declared_value: formData.declared_value,
          city: formData.city.id,
          calculation_type: "weight",
          additional_charges: formData.extras.map((extra) => ({
            id: extra.id,
            name: extra.name,
            charge_type: extra.charge_type,
            value: extra.value,
            quantity: extra.quantity,
          })),
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

  // Update the handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if shipping rate exists before proceeding
    if (!shippingRate) {
      toast({
        title: "Missing Rate",
        description: "Please wait for the shipping rate calculation.",
        variant: "destructive",
      });
      return;
    }

    // Check if selected shipment exists (should always be the case here)
    if (!selectedShipment) {
      toast({
        title: "Error",
        description: "No shipment selected for payment.",
        variant: "destructive",
      });
      return;
    }

    // Check for form errors
    if (fieldErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form.",
        variant: "destructive",
      });
      return;
    }

    // Check for pending changes
    if (hasChanges) {
      toast({
        title: "Unsaved Changes",
        description: "Please save your changes before proceeding with payment.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // For online payments, proceed to payment gateway
      if (paymentMethod === "ONLINE") {
        // For BizaPay, use MYR currency
        setPaymentCurrency("MYR");
        setShowPayment(true);
      } else if (paymentMethod === "COD") {
        // COD payments are handled by the COD button, but add fallback logic
        await ShippingAPI.updateShipment(selectedShipment.id, {
          payment_status: "COD_PENDING",
          payment_method: "COD",
        });
        toast({
          title: "Success",
          description: "Shipment updated to COD successfully",
        });
        // Reset form and refresh data
        resetForm();
        fetchShipments();
        onSuccess();
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add a helper function to reset the form
  const resetForm = () => {
    setSelectedShipment(null);
    setFormData({
      id: "",
      user: "",
      cod_amount: "",
      payment_method: "ONLINE",
      payment_status: "PENDING",
      payment_date: "",
      transaction_id: "",
      receipt: "",
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
      weight: "0",
      length: "0",
      width: "0",
      height: "0",
      description: "",
      declared_value: "0",
      insurance_required: false,
      signature_required: false,
      tracking_number: "",
      current_location: "",
      estimated_delivery: null,
      status: "PENDING",
      base_rate: "0",
      per_kg_rate: "0",
      weight_charge: "0",
      service_charge: "0",
      total_additional_charges: "0",
      total_cost: "0",
      notes: "",
      created_at: "",
      updated_at: "",
      staff: null,
      service_type: "",
      city: {
        name: "",
        postal_code: "",
        delivery_charge: "0",
      },
      extras: [],
      delivery_charge: "0",
    });
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
        weight: parseFloat(restoredData.weight),
        length: parseFloat(restoredData.length),
        width: parseFloat(restoredData.width),
        height: parseFloat(restoredData.height),
        service_type: restoredData.service_type,
        declared_value: restoredData.declared_value,
        city: restoredData.city.id,
        calculation_type: "weight",
        additional_charges: restoredData.extras || [],
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
      console.error("Payment continuation error:", error);
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

  // Update the service type display in the form
  const getServiceTypeName = (serviceTypeId: string) => {
    const serviceType = serviceTypes.find((type) => type.id === serviceTypeId);
    return serviceType ? serviceType.name : serviceTypeId;
  };

  // Add new function to handle updates
  const handleUpdate = async () => {
    if (!selectedShipment) return;

    try {
      setLoading(true);
      const shipmentData: ShipmentRequest = {
        sender_name: formData.sender_name,
        sender_email: formData.sender_email,
        sender_phone: formData.sender_phone,
        sender_address: formData.sender_address,
        sender_country: formData.sender_country,
        recipient_name: formData.recipient_name,
        recipient_email: formData.recipient_email,
        recipient_phone: formData.recipient_phone,
        recipient_address: formData.recipient_address,
        recipient_country: formData.recipient_country,
        package_type: formData.package_type,
        weight: parseFloat(formData.weight),
        length: parseFloat(formData.length),
        width: parseFloat(formData.width),
        height: parseFloat(formData.height),
        description: formData.description,
        declared_value: parseFloat(formData.declared_value),
        service_type: formData.service_type,
        city: formData.city.id!,
        additional_charges: formData.extras.map((extra) => ({
          id: extra.id,
          name: extra.name,
          type: extra.charge_type,
          value: parseFloat(extra.value.toString()),
          amount: parseFloat(extra.value.toString()) * (extra.quantity || 1),
          description: extra.name,
        })),
        payment_method: formData.payment_method as "ONLINE" | "COD" | undefined,
        notes: formData.notes,
      };

      await ShippingAPI.updateShipment(selectedShipment.id, shipmentData);
      toast({
        title: "Success",
        description: "Shipment updated successfully",
      });
      setHasChanges(false);
      setIsUpdating(false);
      fetchShipments();
      if (typeof onSuccess === "function") {
        onSuccess();
      }
    } catch (error) {
      console.error("Error updating shipment:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update shipment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add helper functions after the existing ones
  const getCountryName = (countryId: string, countries: any[]) => {
    const country = countries.find((c) => c.id === countryId);
    return country ? country.name : countryId;
  };

  // Update the PayStack button click handler to use NGN
  const handlePayStackClick = () => {
    setPaymentCurrency("NGN");
    setPaymentModalOpen(true);
  };

  // Add a function to handle COD button click
  const handleCodButtonClick = async () => {
    if (!selectedShipment) return;

    try {
      setLoading(true);
      await ShippingAPI.updateShipment(selectedShipment.id, {
        payment_status: "COD_PENDING",
        payment_method: "COD",
      });
      toast({
        title: "Success",
        description: "Shipment updated to COD successfully",
      });
      // Reset form and refresh data
      resetForm();
      fetchShipments();
      if (typeof onSuccess === "function") {
        onSuccess();
      }
    } catch (error) {
      console.error("Error updating shipment to COD:", error);
      toast({
        title: "Error",
        description: "Failed to update shipment to COD",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update the currency conversion effect to be more comprehensive
  useEffect(() => {
    const performCurrencyConversion = async () => {
      if (shippingRate) {
        try {
          setCurrencyLoading(true);
          // Convert the regular amount to Naira
          const regularAmount = Number(shippingRate.cost_breakdown.total_cost);
          const convertedRegular = await convertCurrency(
            regularAmount,
            "MYR",
            "NGN"
          );
          setNairaTotalAmount(convertedRegular);

          // Convert the COD amount to Naira
          const codAmount = regularAmount * (1 + codFeePercentage / 100);
          const convertedCod = await convertCurrency(
            Number(codAmount.toFixed(2)),
            "MYR",
            "NGN"
          );
          setNairaCodTotalAmount(convertedCod);
        } catch (error) {
          console.error("Currency conversion error:", error);
          // Set fallback values in case of error
          toast({
            title: "Currency Conversion Error",
            description: "Failed to convert currency. Using estimated values.",
            variant: "destructive",
          });
        } finally {
          setCurrencyLoading(false);
        }
      }
    };

    performCurrencyConversion();
  }, [shippingRate, codFeePercentage, paymentCurrency, toast]);

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
    // Calculate the amount based on currency and conversion status
    const paymentAmount =
      paymentCurrency === "NGN"
        ? nairaTotalAmount?.toString() || "0"
        : shippingRate.cost_breakdown.total_cost.toString();

    return (
      <PaymentForm
        amount={paymentAmount}
        currency={paymentCurrency}
        shippingAddress={formData.sender_address}
        paymentType="shipping"
        metadata={{
          requestType: "shipping",
          shipmentData: formData,
          shipmentStatus: { payment_status: "PAID" },
          shipmentId: selectedShipment?.id,
          returnUrl: "/shipping",
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
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-2">
                    No shipments pending payment
                  </p>
                  <p className="text-sm text-muted-foreground">
                    When you create a shipment without completing payment, it
                    will appear here.
                  </p>
                </div>
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
                        <div className="flex flex-wrap gap-2 mt-1">
                          <Badge
                            variant={
                              shipment.status === "DELIVERED"
                                ? "secondary"
                                : "default"
                            }
                          >
                            {shipment.status}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="bg-orange-100 text-orange-700 hover:bg-orange-200"
                          >
                            Payment: {shipment.payment_status}
                          </Badge>
                        </div>
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
                                id: "",
                                user: "",
                                cod_amount: "",
                                payment_method: "ONLINE",
                                payment_status: "PENDING",
                                payment_date: "",
                                transaction_id: "",
                                receipt: "",
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
                                weight: "0",
                                length: "0",
                                width: "0",
                                height: "0",
                                description: "",
                                declared_value: "0",
                                insurance_required: false,
                                signature_required: false,
                                tracking_number: "",
                                current_location: "",
                                estimated_delivery: null,
                                status: "PENDING",
                                base_rate: "0",
                                per_kg_rate: "0",
                                weight_charge: "0",
                                service_charge: "0",
                                total_additional_charges: "0",
                                total_cost: "0",
                                notes: "",
                                created_at: "",
                                updated_at: "",
                                staff: null,
                                service_type: "",
                                city: {
                                  name: "",
                                  postal_code: "",
                                  delivery_charge: "0",
                                },
                                extras: [],
                                delivery_charge: "0",
                              });
                            } else {
                              handlePaymentContinuation(shipment);
                            }
                          }}
                        >
                          {selectedShipment?.id === shipment.id
                            ? "Cancel"
                            : shipment.payment_status === "COD_PENDING"
                            ? "Update Shipment"
                            : "Make Payment"}
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
        price={
          paymentCurrency === "NGN"
            ? currencyLoading
              ? 0 // Show zero while loading, modal will update once conversion is complete
              : nairaTotalAmount || 0
            : Number(shippingRate?.cost_breakdown.total_cost || 0)
        }
        currencyCode={paymentCurrency}
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        metadata={{
          requestType: "shipping",
          shipmentData: { ...formData, city: formData.city.id },
          shipmentStatus: { payment_status: "PAID" },
          shipmentId: selectedShipment?.id,
          returnUrl: "/shipping",
        }}
      />

      {/* Show form only when a shipment is selected */}
      {selectedShipment && (
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="text-xl font-semibold">
                  Shipment Details
                </CardTitle>
                <CardDescription>
                  Review and update shipment information
                </CardDescription>
              </div>
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
                      readOnly
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sender_email">Email</Label>
                    <Input
                      id="sender_email"
                      type="email"
                      value={formData.sender_email}
                      readOnly
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sender_phone">Phone</Label>
                    <Input
                      id="sender_phone"
                      value={formData.sender_phone}
                      readOnly
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sender_country">Country</Label>
                    <Input
                      id="sender_country"
                      value={getCountryName(
                        formData.sender_country,
                        departureCountries
                      )}
                      readOnly
                      className="bg-muted"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="sender_address">Address</Label>
                    <Textarea
                      id="sender_address"
                      value={formData.sender_address}
                      readOnly
                      className="min-h-[80px] bg-muted"
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
                      readOnly
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recipient_email">Email</Label>
                    <Input
                      id="recipient_email"
                      type="email"
                      value={formData.recipient_email}
                      readOnly
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recipient_phone">Phone</Label>
                    <Input
                      id="recipient_phone"
                      value={formData.recipient_phone}
                      readOnly
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recipient_country">Country</Label>
                    <Input
                      id="recipient_country"
                      value={getCountryName(
                        formData.recipient_country,
                        destinationCountries
                      )}
                      readOnly
                      className="bg-muted"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="recipient_address">Address</Label>
                    <Textarea
                      id="recipient_address"
                      value={formData.recipient_address}
                      readOnly
                      className="min-h-[80px] bg-muted"
                    />
                  </div>
                </div>
              </div>

              {/* Insurance Section */}
              <div className="space-y-4">
                <h3 className="font-medium">
                  Do you need Insurance? (optional)
                </h3>
                <div className="grid gap-2">
                  {extras
                    .filter(
                      (item) =>
                        item.charge_type.toUpperCase() === "PERCENTAGE" &&
                        item.id !== "cod_charge"
                    )
                    .map((item) => {
                      const isChecked = formData.extras?.some(
                        (extra) => extra.id === item.id
                      );

                      return (
                        <div
                          key={item.id}
                          className="flex items-center space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={item.id}
                              checked={isChecked}
                              onCheckedChange={(checked) =>
                                handleExtraChange(item.id, checked as boolean)
                              }
                            />
                            <Label htmlFor={item.id}>{item.name}</Label>
                          </div>
                          <div className="ml-auto text-sm text-muted-foreground">
                            {item.value}%
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Additional Charges */}
              <div className="space-y-4">
                <h3 className="font-medium">Additional Charges</h3>
                <div className="grid gap-2">
                  {extras
                    .filter(
                      (item) => item.charge_type.toUpperCase() === "FIXED"
                    )
                    .map((item) => {
                      const isChecked = formData.extras?.some(
                        (extra) => extra.id === item.id
                      );

                      return (
                        <div
                          key={item.id}
                          className="flex items-center space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={item.id}
                              checked={isChecked}
                              disabled
                              className="opacity-50"
                            />
                            <Label
                              htmlFor={item.id}
                              className="text-muted-foreground"
                            >
                              {item.name}
                            </Label>
                          </div>
                          <div className="ml-auto text-sm text-muted-foreground">
                            RM {item.value}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Package Details */}
              <div className="space-y-4">
                <h3 className="font-medium">Package Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="package_type">Package Type</Label>
                    <Input
                      id="package_type"
                      value={formData.package_type}
                      readOnly
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service_type">Service Type</Label>
                    <Input
                      id="service_type"
                      value={getServiceTypeName(formData.service_type)}
                      readOnly
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={formData.weight}
                      readOnly
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Dimensions (cm)</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Length"
                        type="number"
                        value={formData.length}
                        readOnly
                        className="bg-muted"
                      />
                      <Input
                        placeholder="Width"
                        type="number"
                        value={formData.width}
                        readOnly
                        className="bg-muted"
                      />
                      <Input
                        placeholder="Height"
                        type="number"
                        value={formData.height}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="declared_value">Declared Value (USD)</Label>
                    <Input
                      id="declared_value"
                      type="number"
                      value={formData.declared_value}
                      readOnly
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Package Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      readOnly
                      className="min-h-[80px] bg-muted"
                    />
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              {shippingRate && (
                <Card className="border-2 shadow-sm">
                  <CardHeader className="bg-gray-50 border-b">
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      Shipping Cost Breakdown
                    </CardTitle>
                    <CardDescription>
                      Transparent breakdown of all charges associated with your
                      shipment
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {/* Base Charges */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                          Base Shipping Charges
                        </h4>
                        <div className="space-y-2 rounded-lg border bg-gray-50/50 p-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">Per KG Rate:</span>
                            </div>
                            <span className="font-medium">
                              RM {shippingRate.rate_details.per_kg_rate}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Weight className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">
                                Weight Charge ({shippingRate.weight.chargeable}{" "}
                                kg × {shippingRate.rate_details.per_kg_rate}):
                              </span>
                            </div>
                            <span className="font-medium">
                              RM {shippingRate.rate_details.weight_charge}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">
                                City Delivery Charge:
                              </span>
                            </div>
                            <span className="font-medium">
                              RM{" "}
                              {shippingRate.cost_breakdown.city_delivery_charge}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Additional Charges */}
                      {shippingRate.cost_breakdown.additional_charges.length >
                        0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            Mandatory Charges
                          </h4>
                          <div className="space-y-2 rounded-lg border bg-gray-50/50 p-4">
                            {shippingRate.cost_breakdown.additional_charges.map(
                              (charge) => (
                                <div
                                  key={charge.name}
                                  className="flex justify-between items-center"
                                >
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm">
                                      {charge.name}:
                                    </span>
                                  </div>
                                  <span className="font-medium">
                                    RM {charge.amount}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* Extras */}
                      {shippingRate.cost_breakdown.extras?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            Optional Services
                          </h4>
                          <div className="space-y-2 rounded-lg border bg-gray-50/50 p-4">
                            {shippingRate.cost_breakdown.extras.map(
                              (charge) => (
                                <div
                                  key={charge.name}
                                  className="flex justify-between items-center"
                                >
                                  <div className="flex items-center gap-2">
                                    {charge.charge_type === "PERCENTAGE" ? (
                                      <Shield className="h-4 w-4 text-blue-500" />
                                    ) : (
                                      <CheckSquare className="h-4 w-4 text-green-500" />
                                    )}
                                    <span className="text-sm">
                                      {charge.name}:
                                    </span>
                                    {charge.charge_type === "PERCENTAGE" && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-blue-50 text-blue-700"
                                      >
                                        {charge.value}% of declared value
                                      </Badge>
                                    )}
                                    {charge.quantity && charge.quantity > 1 && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        ×{charge.quantity}
                                      </Badge>
                                    )}
                                  </div>
                                  <span className="font-medium">
                                    {charge.charge_type === "PERCENTAGE"
                                      ? " "
                                      : `RM ${charge.value}`}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* Subtotal */}
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">Subtotal:</span>
                          <span className="font-semibold">
                            RM {shippingRate.cost_breakdown.total_cost}
                          </span>
                        </div>
                      </div>

                      {/* Payment Options */}
                      <div className="space-y-4 mt-6">
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                          Payment Options
                        </h4>

                        {/* Online Payment Option */}
                        <div
                          className={`rounded-lg border p-4 ${
                            paymentMethod === "ONLINE"
                              ? "border-primary bg-primary/5"
                              : "bg-white"
                          } cursor-pointer`}
                          onClick={() => setPaymentMethod("ONLINE")}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-5 h-5 rounded-full ${
                                paymentMethod === "ONLINE"
                                  ? "bg-primary"
                                  : "border border-gray-300"
                              } flex items-center justify-center flex-shrink-0 mt-1`}
                            >
                              {paymentMethod === "ONLINE" && (
                                <Check className="h-3 w-3 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <h4 className="font-medium">Pay Online</h4>
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-green-600"
                                >
                                  Recommended
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">
                                Pay the exact shipping cost using our secure
                                payment gateway.
                              </p>
                              <div className="flex justify-between text-sm font-semibold">
                                <span>Total:</span>
                                <div className="flex flex-col items-end">
                                  <span className="font-bold text-base">
                                    RM {shippingRate.cost_breakdown.total_cost}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    ≈ ₦{" "}
                                    {currencyLoading
                                      ? "Converting..."
                                      : nairaTotalAmount?.toLocaleString() ||
                                        "N/A"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* COD Option */}
                        <div
                          className={`rounded-lg border p-4 ${
                            paymentMethod === "COD"
                              ? "border-primary bg-primary/5"
                              : "bg-white"
                          } cursor-pointer`}
                          onClick={() => setPaymentMethod("COD")}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-5 h-5 rounded-full ${
                                paymentMethod === "COD"
                                  ? "bg-primary"
                                  : "border border-gray-300"
                              } flex items-center justify-center flex-shrink-0 mt-1`}
                            >
                              {paymentMethod === "COD" && (
                                <Check className="h-3 w-3 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <h4 className="font-medium">
                                  Cash on Delivery (COD)
                                </h4>
                                <Badge
                                  variant="outline"
                                  className="bg-orange-50 text-orange-600"
                                >
                                  +{codFeePercentage}% fee
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">
                                Pay when your package is delivered. A{" "}
                                {codFeePercentage}% service charge applies.
                              </p>

                              <div className="space-y-1 mb-3 text-sm bg-gray-50 p-3 rounded-md">
                                <div className="flex justify-between">
                                  <span>Base amount:</span>
                                  <span>
                                    RM {shippingRate.cost_breakdown.total_cost}
                                  </span>
                                </div>
                                <div className="flex justify-between text-orange-600">
                                  <span>COD fee ({codFeePercentage}%):</span>
                                  <span>
                                    + RM{" "}
                                    {(
                                      Number(
                                        shippingRate.cost_breakdown.total_cost
                                      ) *
                                      (codFeePercentage / 100)
                                    ).toFixed(2)}
                                  </span>
                                </div>
                              </div>

                              <div className="flex justify-between text-sm font-semibold">
                                <span>Total with COD:</span>
                                <div className="flex flex-col items-end">
                                  <span className="font-bold text-base">
                                    RM{" "}
                                    {(
                                      Number(
                                        shippingRate.cost_breakdown.total_cost
                                      ) *
                                      (1 + codFeePercentage / 100)
                                    ).toFixed(2)}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    ≈ ₦{" "}
                                    {currencyLoading
                                      ? "Converting..."
                                      : nairaCodTotalAmount?.toLocaleString() ||
                                        "N/A"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {hasChanges && (
                <p className="text-sm text-green-700 font-semibold ">
                  *When you update the shipment then please save the changes
                  before proceeding to payment.
                </p>
              )}
            </CardContent>
            <CardFooter>
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                {hasChanges && (
                  <>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleUpdate}
                      disabled={loading}
                      className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          Save Changes
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </span>
                      )}
                    </Button>
                  </>
                )}
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <Button
                    type="submit"
                    disabled={
                      loading ||
                      !shippingRate ||
                      fieldErrors.length > 0 ||
                      hasChanges ||
                      paymentMethod !== "ONLINE"
                    }
                    className="w-full sm:w-auto"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        Complete Payment (BizaPay - MYR)
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    )}
                  </Button>
                  <Button
                    onClick={handlePayStackClick}
                    type="button"
                    disabled={
                      loading ||
                      !shippingRate ||
                      fieldErrors.length > 0 ||
                      hasChanges ||
                      paymentMethod !== "ONLINE"
                    }
                    className="w-full sm:w-auto"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        Payment (PayStack - NGN)
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    )}
                  </Button>
                  <Button
                    onClick={handleCodButtonClick}
                    type="button"
                    disabled={
                      loading ||
                      !shippingRate ||
                      fieldErrors.length > 0 ||
                      hasChanges ||
                      paymentMethod !== "COD"
                    }
                    className="w-full sm:w-auto"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        Pay with COD ({codFeePercentage}% extra)
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  );
}
