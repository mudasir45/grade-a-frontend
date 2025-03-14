"use client";

import { CreateCustomerDialog } from "@/components/staff/create-customer-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { City } from "@/lib/types/index";
import type { ShippingRate } from "@/lib/types/shipping";
import { cn, convertCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import SearchableSelect from "../ui/searchable-select";

interface FormErrors {
  sender: string[];
  recipient: string[];
  package: string[];
}

interface FieldError {
  field: string;
  message: string;
}

// Validation schemas
const emailSchema = z.string().email("Invalid email address");
const phoneSchema = z
  .string()
  .regex(
    /^\+?[1-9]\d{1,14}$/,
    "Phone number must be in international format (e.g., +1234567890)"
  );

interface ShipmentFormProps {
  mode?: "create" | "edit";
  initialData?: any; // Type this properly based on your data structure
  onUpdate?: (data: any) => Promise<boolean>;
  users?: any[];
  setIsCreated: React.Dispatch<React.SetStateAction<boolean>>;
}

// Add this interface to define the shape of your form data
interface FormData {
  sender_name: string;
  sender_phone: string;
  sender_email: string;
  sender_country: string;
  sender_address: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_email: string;
  recipient_country: string;
  recipient_address: string;
  package_type: string;
  weight: number;
  base_rate: string;
  length: number;
  width: number;
  height: number;
  description: string;
  declared_value: number;
  service_type: string;
  insurance_required: boolean;
  signature_required: boolean;
  packaging_rm: number;
  delivery_rm: number;
  total_rm: number;
  total_naira: number;
  send_via: string;
  city: string;
  additional_charges: {
    food: boolean;
    creams: boolean;
    traditional: boolean;
    electronics: boolean;
    documents: boolean;
    medications: boolean;
  };
  status?: string;
  tracking_number?: string;
}

export function ShipmentForm({
  mode = "create",
  initialData,
  onUpdate,
  users,
  setIsCreated,
}: ShipmentFormProps) {
  const { toast } = useToast();
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [errors, setErrors] = useState<FormErrors>({
    sender: [],
    recipient: [],
    package: [],
  });
  const {
    departureCountries,
    destinationCountries,
    serviceTypes,
    shippingZones,
    isLoading,
    error: dataError,
    refetch,
  } = useShippingData();
  const [cities, setCities] = useState<City[]>([]);

  // Set default service type from the first available service
  const defaultServiceType = serviceTypes[0]?.id;
  const [searchCustomerId, setSearchCustomerId] = useState("");

  const [showCreateCustomerDialog, setShowCreateCustomerDialog] =
    useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = localStorage.getItem("auth_token");
  // Initialize form data with default values
  const defaultFormData: FormData = {
    sender_name: "",
    sender_phone: "",
    sender_email: "",
    sender_country: "",
    sender_address: "",
    recipient_name: "",
    recipient_phone: "",
    recipient_email: "",
    recipient_country: "",
    recipient_address: "",
    package_type: "",
    weight: 0,
    base_rate: "",
    length: 0,
    width: 0,
    height: 0,
    description: "",
    declared_value: 0,
    service_type: defaultServiceType || "",
    insurance_required: false,
    signature_required: false,
    packaging_rm: 0,
    delivery_rm: 0,
    total_rm: 0,
    total_naira: 0,
    send_via: "",
    city: "",
    additional_charges: {
      food: false,
      creams: false,
      traditional: false,
      electronics: false,
      documents: false,
      medications: false,
    },
  };

  useEffect(() => {
    const fetchCities = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/accounts/cities/`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch cities");
      }
      const data = await response.json();
      setCities(data);
    };
    fetchCities();
  }, []);

  const [formData, setFormData] = useState<FormData>(
    mode === "edit" && initialData
      ? {
          ...defaultFormData,
          ...initialData,
          additional_charges: {
            ...defaultFormData.additional_charges,
            ...(initialData.additional_charges || {}),
          },
        }
      : defaultFormData
  );

  const additional_charges = [
    { id: "food", label: "Food stuff" },
    { id: "creams", label: "Creams, human" },
    { id: "traditional", label: "Traditional Items" },
    { id: "electronics", label: "Passport, Electronics" },
    { id: "documents", label: "Driver license, documents" },
    { id: "medications", label: "Medications" },
  ];

  // Handle field change with validation
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

  // Get error message for a field
  const getFieldError = (field: string): string | undefined => {
    return fieldErrors.find((e) => e.field === field)?.message;
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

  // Render error messages
  const renderErrors = (stepErrors: string[]) => {
    if (stepErrors.length === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 text-red-600 p-4 rounded-lg mb-4"
      >
        <ul className="list-disc list-inside space-y-1">
          {stepErrors.map((error, index) => (
            <li key={index} className="text-sm">
              {error}
            </li>
          ))}
        </ul>
      </motion.div>
    );
  };

  const [shippingRate, setShippingRate] = useState<ShippingRate | null>(null);
  const [calculating, setCalculating] = useState(false);

  // Calculate shipping rate when relevant fields change
  useEffect(() => {
    const calculateShippingRate = async () => {
      // Required fields for rate calculation
      const requiredFields = [
        "sender_country",
        "recipient_country",
        "weight",
        "length",
        "width",
        "height",
      ] as const;

      // Check if we have all required fields
      const hasRequiredFields = requiredFields.every((field) => {
        const value = formData[field];
        if (typeof value === "number") {
          return value > 0;
        }
        return Boolean(value);
      });

      // If we don't have all required fields, don't do anything
      if (!hasRequiredFields) return;

      // If we don't have service type, show guidance
      if (!formData.service_type) {
        toast({
          title: "Service Type Required",
          description: "Please select a service type to see shipping rates.",
        });
        return;
      }

      setCalculating(true);
      setShippingRate(null);

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
        // Update the delivery and total bill amounts
        setFormData((prev) => ({
          ...prev,
          delivery_rm: rate.cost_breakdown.service_price,
          total_rm: rate.cost_breakdown.total_cost,
          total_naira: rate.cost_breakdown.total_cost,
        }));
      } catch (error) {
        console.error("Rate calculation error:", error);
        toast({
          title: "Rate Calculation Failed",
          description:
            error instanceof Error
              ? error.message
              : "Failed to calculate shipping rate. Please try again.",
          variant: "destructive",
        });
      } finally {
        setCalculating(false);
      }
    };

    // Debounce the calculation to prevent too many API calls
    const timeoutId = setTimeout(calculateShippingRate, 500);
    return () => clearTimeout(timeoutId);
  }, [
    formData.sender_country,
    formData.recipient_country,
    formData.weight,
    formData.length,
    formData.width,
    formData.height,
    formData.service_type,
    formData.declared_value,
    formData.insurance_required,
    formData.packaging_rm,
  ]);

  const handleCreateShipment = async () => {
    if (!searchCustomerId) {
      toast({
        title: "Error",
        description: "Please select a customer first",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    console.log(searchCustomerId);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/shipments/create-shipment/${searchCustomerId}/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to create shipment");
      }
      const data = await response.json();

      toast({
        title: "Success",
        description: "Shipment created successfully",
      });
    } catch (error) {
      console.error("Error creating shipment:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create shipment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  //   useEffect(() => {
  //     console.log("FormData: ", formData);
  //   }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields before submission
    const senderErrors: string[] = [];
    const recipientErrors: string[] = [];
    const packageErrors: string[] = [];

    // Validate sender details
    if (!formData.sender_name) senderErrors.push("Sender name is required");
    if (!formData.sender_phone)
      senderErrors.push("Sender phone number is required");
    const senderEmailError = validateField(
      "sender_email",
      formData.sender_email
    );
    if (senderEmailError) senderErrors.push(senderEmailError);
    if (!formData.sender_country)
      senderErrors.push("Sender Country is required");
    if (!formData.sender_address)
      senderErrors.push("Sender address is required");

    // Validate recipient details
    if (!formData.recipient_name)
      recipientErrors.push("Recipient name is required");
    if (!formData.recipient_phone)
      recipientErrors.push("Recipient phone number is required");
    const receiverEmailError = validateField(
      "recipient_email",
      formData.recipient_email
    );
    if (receiverEmailError) recipientErrors.push(receiverEmailError);
    if (!formData.recipient_country)
      recipientErrors.push("Recipient city is required");
    if (!formData.recipient_address)
      recipientErrors.push("Recipient address is required");

    // Validate package details
    if (!formData.package_type) packageErrors.push("Package type is required");
    if (!formData.weight || formData.weight <= 0)
      packageErrors.push("Valid weight is required");
    if (!formData.length || formData.length <= 0)
      packageErrors.push("Valid length is required");
    if (!formData.width || formData.width <= 0)
      packageErrors.push("Valid width is required");
    if (!formData.height || formData.height <= 0)
      packageErrors.push("Valid height is required");
    if (!formData.description)
      packageErrors.push("Package description is required");

    setErrors({
      sender: senderErrors,
      recipient: recipientErrors,
      package: packageErrors,
    });

    if (
      senderErrors.length > 0 ||
      recipientErrors.length > 0 ||
      packageErrors.length > 0
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
      return;
    }
    if (mode === "create") {
      await handleCreateShipment();
    } else if (mode === "edit") {
      handleUpdateShipment();
    }
  };
  // call the (manage-shipment) onUpdate function to update the shipments
  const handleUpdateShipment = async () => {
    if (onUpdate && typeof onUpdate === "function") {
      setIsSubmitting(true);
      const success = await onUpdate(formData); // Await the function
      setIsSubmitting(false);
      if (success) {
        toast({
          title: "Success",
          description: "Shipment updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update shipment",
          variant: "destructive",
        });
      }
    }
  };
  // function to fetch last shipment data of selected customer
  const fetchLastShipment = async (userId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/shipments/last-shipment/${userId}/`
      );
      if (!response.ok) {
        setFormData(defaultFormData);
        // throw new Error('No shipment is associated with this user')
        toast({
          title: "Not Found",
          description: "No shipment is associated with this user",
        });
        return;
      }
      const data = await response.json();

      // Update form data with last shipment details
      setFormData((prev) => ({
        ...prev,
        sender_name: data.sender_name || "",
        sender_phone: data.sender_phone || "",
        sender_email: data.sender_email || "",
        sender_country: data.sender_country || "",
        sender_address: data.sender_address || "",
        recipient_name: data.recipient_name || "",
        recipient_phone: data.recipient_phone || "",
        recipient_email: data.recipient_email || "",
        recipient_country: data.recipient_country || "",
        recipient_address: data.recipient_address || "",
      }));
    } catch (error) {
      console.error("Error fetching last shipment:", error);
      toast({
        title: "Error",
        description: "Failed to fetch last shipment details",
        variant: "destructive",
      });
    }
  };

  // Update the customer search handler
  const handleCustomerSelect = (userId: string) => {
    setSearchCustomerId(userId);
    fetchLastShipment(userId);
  };

  return (
    <form className="space-y-6 flex">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <CardTitle
            className={`${
              mode === "edit" ? "hidden" : "text-2xl font-semibold"
            } mb-3 sm:mb-0`}
          >
            Create New Shipment
          </CardTitle>
          <Button
            className={`${mode === "create" ? "w-fit" : "hidden"}`}
            type="button"
            variant="secondary"
            onClick={() => setShowCreateCustomerDialog(true)}
          >
            Create New Customer
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Customer Search / Tracking Number */}
          {mode === "create" ? (
            // <div className="flex-1 space-y-2">
            //   <Label htmlFor="search-customer">Search customer</Label>
            //   <Select
            //     value={searchCustomerId}
            //     onValueChange={handleCustomerSelect}
            //   >
            //     <SelectTrigger id="search-customer">
            //       <SelectValue placeholder="Search customer by username" />
            //     </SelectTrigger>
            //     <SelectContent className="max-h-60 overflow-y-auto">
            //       {users &&
            //         users.map((user) => (
            //           <SelectItem key={user.id} value={user.id}>
            //             <span className="flex items-center gap-2">
            //               <span>{user.username}</span>
            //             </span>
            //           </SelectItem>
            //         ))}
            //     </SelectContent>
            //   </Select>
            // </div>
            <SearchableSelect
              label="Search customer"
              options={
                users?.map((user) => ({
                  value: String(user.id),
                  label: user.phone_number,
                })) || []
              }
              value={searchCustomerId}
              onChange={(value) => handleCustomerSelect(value)}
            />
          ) : (
            <div className="flex-1 space-y-2">
              <Label htmlFor="tracking-number">Tracking Number</Label>
              <Input
                id="tracking-number"
                value={formData.tracking_number}
                readOnly
                className="bg-muted"
              />
            </div>
          )}

          {/* Show only when customer selcted */}
          <div
            className={`${
              !searchCustomerId ? (mode === "create" ? "hidden" : "") : ""
            }`}
          >
            <div className="grid md:grid-cols-2 gap-4 md:gap-8">
              {/* Sender Information */}
              <div className="space-y-4">
                <h3 className="font-medium">Sender Details</h3>
                {renderErrors(errors.sender)}
                <div className="space-y-2">
                  <Label htmlFor="sender-name">Sender Name</Label>
                  <Input
                    id="sender-name"
                    placeholder="Enter sender name"
                    value={formData.sender_name}
                    onChange={(e) =>
                      handleFieldChange("sender_name", e.target.value)
                    }
                    className={cn(
                      "w-full",
                      getFieldError("sender_name") &&
                        "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                  {getFieldError("sender_name") && (
                    <p className="text-xs text-red-500 mt-1">
                      {getFieldError("sender_name")}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sender-number">Sender Phone</Label>
                  <Input
                    id="sender-number"
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.sender_phone}
                    onChange={(e) =>
                      handleFieldChange("sender_phone", e.target.value)
                    }
                    className={cn(
                      "w-full",
                      getFieldError("sender_phone") &&
                        "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                  {getFieldError("sender_phone") && (
                    <p className="text-xs text-red-500 mt-1">
                      {getFieldError("sender_phone")}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sender-email">Sender Email</Label>
                  <Input
                    id="sender-email"
                    type="email"
                    placeholder="Enter email"
                    value={formData.sender_email}
                    onChange={(e) =>
                      handleFieldChange("sender_email", e.target.value)
                    }
                    className={cn(
                      "w-full",
                      getFieldError("sender_email") &&
                        "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                  {getFieldError("sender_email") && (
                    <p className="text-xs text-red-500 mt-1">
                      {getFieldError("sender_email")}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sender-city">Sender Country</Label>
                  <Select
                    value={formData.sender_country}
                    onValueChange={(value) =>
                      setFormData({ ...formData, sender_country: value })
                    }
                  >
                    <SelectTrigger id="sender-city">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {departureCountries.map((country) => (
                        <SelectItem key={country.code} value={country.id}>
                          <span className="flex items-center gap-2">
                            <span>{country.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sender-address">Sender Address</Label>
                  <Textarea
                    id="sender-address"
                    placeholder="Enter complete address"
                    value={formData.sender_address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sender_address: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Receiver Information */}
              <div className="space-y-4">
                <h3 className="font-medium">Receiver Details</h3>
                {renderErrors(errors.recipient)}
                <div className="space-y-2">
                  <Label htmlFor="receiver-name">Receiver Name</Label>
                  <Input
                    id="receiver-name"
                    placeholder="Enter receiver name"
                    value={formData.recipient_name}
                    onChange={(e) =>
                      handleFieldChange("recipient_name", e.target.value)
                    }
                    className={cn(
                      "w-full",
                      getFieldError("recipient_name") &&
                        "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                  {getFieldError("recipient_name") && (
                    <p className="text-xs text-red-500 mt-1">
                      {getFieldError("recipient_name")}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receiver-number">Receiver Phone</Label>
                  <Input
                    id="receiver-number"
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.recipient_phone}
                    onChange={(e) =>
                      handleFieldChange("recipient_phone", e.target.value)
                    }
                    className={cn(
                      "w-full",
                      getFieldError("recipient_phone") &&
                        "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                  {getFieldError("recipient_phone") && (
                    <p className="text-xs text-red-500 mt-1">
                      {getFieldError("recipient_phone")}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receiver-email">Receiver Email</Label>
                  <Input
                    id="receiver-email"
                    type="email"
                    placeholder="Enter email"
                    value={formData.recipient_email}
                    onChange={(e) =>
                      handleFieldChange("recipient_email", e.target.value)
                    }
                    className={cn(
                      "w-full",
                      getFieldError("recipient_email") &&
                        "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                  {getFieldError("recipient_email") && (
                    <p className="text-xs text-red-500 mt-1">
                      {getFieldError("recipient_email")}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receiver-city">Receiver Country</Label>
                  <Select
                    value={formData.recipient_country}
                    onValueChange={(value) =>
                      handleFieldChange("recipient_country", value)
                    }
                  >
                    <SelectTrigger
                      id="receiver-city"
                      className={cn(
                        getFieldError("recipient_country") &&
                          "border-red-500 focus-visible:ring-red-500"
                      )}
                    >
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {destinationCountries.map((country) => (
                        <SelectItem key={country.code} value={country.id}>
                          <span className="flex items-center gap-2">
                            <span>{country.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {getFieldError("recipient_country") && (
                    <p className="text-xs text-red-500 mt-1">
                      {getFieldError("recipient_country")}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receiver-address">Receiver Address</Label>
                  <Textarea
                    id="receiver-address"
                    placeholder="Enter complete address"
                    value={formData.recipient_address}
                    onChange={(e) =>
                      handleFieldChange("recipient_address", e.target.value)
                    }
                    className={cn(
                      getFieldError("recipient_address") &&
                        "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                  {getFieldError("recipient_address") && (
                    <p className="text-xs text-red-500 mt-1">
                      {getFieldError("recipient_address")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* City Selection */}
            <div className="space-y-4 mb-5">
              <h3 className="font-medium">City Selection</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <SearchableSelect
                  label="City"
                  options={cities.map((city) => ({
                    value: city.id!,
                    label: city.name,
                  }))}
                  value={formData.city}
                  onChange={(value) =>
                    setFormData({ ...formData, city: value })
                  }
                />
                <div className="space-y-2 ob">
                  <p>Delivery Charge</p>
                  <p>
                    RM{" "}
                    {
                      cities.find((city) => city.id === formData.city)
                        ?.delivery_charge
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Parcel Details */}
            <div className="space-y-4">
              <h3 className="font-medium">Parcel Details</h3>
              {renderErrors(errors.package)}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2 col-span-full">
                  <Label htmlFor="service_type">Service Type</Label>
                  <Select
                    value={formData.service_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, service_type: value })
                    }
                  >
                    <SelectTrigger className="w-full">
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
                  <Label htmlFor="package_type">Package Type</Label>
                  <Select
                    value={formData.package_type}
                    onValueChange={(value) =>
                      handleFieldChange("package_type", value)
                    }
                  >
                    <SelectTrigger
                      className={cn(
                        "w-full",
                        getFieldError("package_type") &&
                          "border-red-500 focus-visible:ring-red-500"
                      )}
                    >
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
                  {getFieldError("package_type") && (
                    <p className="text-xs text-red-500 mt-1">
                      {getFieldError("package_type")}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    min="0.1"
                    step="0.1"
                    placeholder="Enter weight"
                    value={formData.weight}
                    onChange={(e) =>
                      handleFieldChange("weight", parseFloat(e.target.value))
                    }
                    className={cn(
                      "w-full",
                      getFieldError("weight") &&
                        "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                  {getFieldError("weight") && (
                    <p className="text-xs text-red-500 mt-1">
                      {getFieldError("weight")}
                    </p>
                  )}
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label>Dimensions (cm)</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <Input
                        placeholder="Length"
                        type="number"
                        value={formData.length}
                        onChange={(e) =>
                          handleFieldChange(
                            "length",
                            parseFloat(e.target.value)
                          )
                        }
                        className={cn(
                          "w-full",
                          getFieldError("length") &&
                            "border-red-500 focus-visible:ring-red-500"
                        )}
                      />
                      <span className="text-xs text-muted-foreground mt-1">
                        Length
                      </span>
                      {getFieldError("length") && (
                        <p className="text-xs text-red-500 mt-1">
                          {getFieldError("length")}
                        </p>
                      )}
                    </div>
                    <div>
                      <Input
                        placeholder="Width"
                        type="number"
                        value={formData.width}
                        onChange={(e) =>
                          handleFieldChange("width", parseFloat(e.target.value))
                        }
                        className={cn(
                          "w-full",
                          getFieldError("width") &&
                            "border-red-500 focus-visible:ring-red-500"
                        )}
                      />
                      <span className="text-xs text-muted-foreground mt-1">
                        Width
                      </span>
                      {getFieldError("width") && (
                        <p className="text-xs text-red-500 mt-1">
                          {getFieldError("width")}
                        </p>
                      )}
                    </div>
                    <div>
                      <Input
                        placeholder="Height"
                        type="number"
                        value={formData.height}
                        onChange={(e) =>
                          handleFieldChange(
                            "height",
                            parseFloat(e.target.value)
                          )
                        }
                        className={cn(
                          "w-full",
                          getFieldError("height") &&
                            "border-red-500 focus-visible:ring-red-500"
                        )}
                      />
                      <span className="text-xs text-muted-foreground mt-1">
                        Height
                      </span>
                      {getFieldError("height") && (
                        <p className="text-xs text-red-500 mt-1">
                          {getFieldError("height")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="packaging">Packaging (RM)</Label>
                  <Input
                    id="packaging"
                    type="number"
                    min="0"
                    placeholder="Enter the cost of packing"
                    value={formData.packaging_rm}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        packaging_rm: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="declared_value">Declared Value (USD)</Label>
                  <Input
                    id="declared_value"
                    type="number"
                    min="0"
                    value={formData.declared_value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        declared_value: parseFloat(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="description">Package Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>

            {/* Additional Charges */}
            <div className="space-y-4">
              <h3 className="font-medium">Additional Charges</h3>
              <div className="grid gap-2">
                {additional_charges.map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={item.id}
                      checked={
                        formData.additional_charges[
                          item.id as keyof typeof formData.additional_charges
                        ]
                      }
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          additional_charges: {
                            ...formData.additional_charges,
                            [item.id]: checked,
                          },
                        })
                      }
                    />
                    <Label htmlFor={item.id}>{item.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Bill */}
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="delivery_rm">Delivery(RM)</Label>
                  <Input
                    id="delivery_rm"
                    type="number"
                    value={formData.delivery_rm}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_rm">Total Bill (RM)</Label>
                  <Input
                    id="total_rm"
                    type="number"
                    value={formData.total_rm}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_naira">Total Bill (Naira)</Label>
                  <Input
                    id="total_naira"
                    type="number"
                    value={convertCurrency(formData.total_naira, "MYR", "NGN")}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>
            </div>

            {/* optional checkbox */}
            <div className="sm:col-span-2 space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="insurance_required"
                  checked={formData.insurance_required}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      insurance_required: checked as boolean,
                    })
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
                    setFormData({
                      ...formData,
                      signature_required: checked as boolean,
                    })
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

            {/* send bill */}
            <div className="space-y-4">
              <h3 className="font-medium">Send Bill Via</h3>
              <RadioGroup
                value={formData.send_via}
                onValueChange={(value) =>
                  setFormData({ ...formData, send_via: value })
                }
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="whatsapp" id="whatsapp" />
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sms" id="sms" />
                  <Label htmlFor="sms">SMS</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="both" id="both" />
                  <Label htmlFor="both">Both</Label>
                </div>
              </RadioGroup>
              <Button type="button">Send</Button>
            </div>

            {calculating && (
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Calculating shipping rate...</span>
              </div>
            )}

            {shippingRate && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Shipping Cost Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid gap-2 text-sm sm:text-base">
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
                      <span>${shippingRate.cost_breakdown.service_price}</span>
                    </div>
                    {shippingRate.cost_breakdown.additional_charges.map(
                      (charge) => (
                        <div key={charge.name} className="flex justify-between">
                          <span>{charge.name}:</span>
                          <span>${charge.amount}</span>
                        </div>
                      )
                    )}
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Total:</span>
                      <span>${shippingRate.cost_breakdown.total_cost}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex flex-col sm:flex-row gap-4 sm:justify-end mt-2">
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Print AWB
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === "create" ? "Creating..." : "Updating..."}
                  </>
                ) : mode === "edit" ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <CreateCustomerDialog
        open={showCreateCustomerDialog}
        onOpenChange={setShowCreateCustomerDialog}
        setIsCreated={setIsCreated}
      />
    </form>
  );
}
