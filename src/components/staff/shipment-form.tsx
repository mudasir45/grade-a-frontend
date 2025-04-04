"use client";

import { CreateCustomerDialog } from "@/components/staff/create-customer-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Extras, type ShippingRate } from "@/lib/types/shipping";
import { cn, convertCurrency, getCountryCurrencyCode } from "@/lib/utils";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import SearchableSelect from "../ui/searchable-select";

// @ts-ignore: Temporarily suppressing SearchableSelect prop type errors

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
const emailSchema = z.string().email("Invalid email address").optional();

interface ShipmentFormProps {
  mode?: "create" | "edit";
  initialData?: any; // Type this properly based on your data structure
  onUpdate?: (data: any) => Promise<boolean>;
  users?: any[];
  setIsCreated?: React.Dispatch<React.SetStateAction<boolean>>;
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
  declared_value: string;
  service_type: string;
  insurance_required: boolean;
  signature_required: boolean;
  delivery_rm: number;
  total_rm: number;
  total_naira: number;
  send_via: string;
  city: string;
  additional_charges: Extras[];
  cost_breakdown?: any; // Added for storing shipping cost breakdown
  status?: string;
  tracking_number?: string;
  calculation_type: "weight" | "dimensions";
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
  const [extras, setExtras] = useState<Extras[]>([]);
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  console.log("selected initial Data", initialData);

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
  }, []);

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
    declared_value: "0",
    service_type: defaultServiceType || "",
    insurance_required: false,
    signature_required: false,
    delivery_rm: 0,
    total_rm: 0,
    total_naira: 0,
    send_via: "",
    city: "",
    additional_charges: [],
    calculation_type: "weight",
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

  const [formData, setFormData] = useState<FormData>(() => {
    if (mode === "edit" && initialData) {
      console.log("Initializing form data in edit mode:", initialData);

      // Format additional charges if available
      const additionalCharges = Array.isArray(initialData.additional_charges)
        ? initialData.additional_charges.map((charge: any) => ({
            id: String(charge.id || ""),
            name: charge.name || "",
            charge_type: charge.charge_type || "",
            value: parseFloat(charge.value?.toString() || "0"),
            quantity: charge.quantity || 1,
          }))
        : [];

      // Handle city conversion to string
      const cityValue = initialData.city ? String(initialData.city.id) : "";

      // Handle service type conversion to string
      const serviceTypeValue = initialData.service_type
        ? String(initialData.service_type)
        : "";

      const calculation_type = initialData.weight > 0 ? "weight" : "dimensions";

      // Create a new object with all the correct data
      const editFormData = {
        ...defaultFormData,
        ...initialData,

        // Ensure string type for IDs
        city: cityValue,
        service_type: serviceTypeValue,
        // Make sure numeric fields are properly parsed
        weight: parseFloat(initialData.weight?.toString() || "0"),
        length: parseFloat(initialData.length?.toString() || "0"),
        width: parseFloat(initialData.width?.toString() || "0"),
        height: parseFloat(initialData.height?.toString() || "0"),
        declared_value: initialData.declared_value?.toString() || "0",
        calculation_type: calculation_type,
        delivery_rm: parseFloat(initialData.delivery_rm?.toString() || "0"),
        total_rm: parseFloat(initialData.total_rm?.toString() || "0"),
        total_naira: parseFloat(initialData.total_naira?.toString() || "0"),
        additional_charges: initialData.extras,
      };

      console.log("Initialized form data:", editFormData);

      return editFormData;
    }
    return {
      ...defaultFormData,
      calculation_type: "weight",
    };
  });

  // Handle form changes
  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle field change for any form field
  const handleFieldChange = (
    nameOrEvent:
      | string
      | React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    valueInput?: any
  ) => {
    console.log("handleFieldChange called with:", nameOrEvent, valueInput);

    if (typeof nameOrEvent === "string") {
      // Called with name and value separately
      setFormData((prev) => ({ ...prev, [nameOrEvent]: valueInput }));

      // Only validate email fields
      if (typeof valueInput === "string" && nameOrEvent.includes("email")) {
        const error = validateField(nameOrEvent, valueInput);
        if (error) {
          setFieldErrors((prev) => [
            ...prev.filter((e) => e.field !== nameOrEvent),
            { field: nameOrEvent, message: error },
          ]);
        } else {
          setFieldErrors((prev) => prev.filter((e) => e.field !== nameOrEvent));
        }
      }
    } else {
      // Called with event object
      const { name, value } = nameOrEvent.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Only validate email fields
      if (typeof value === "string" && name.includes("email")) {
        const error = validateField(name, value);
        if (error) {
          setFieldErrors((prev) => [
            ...prev.filter((e) => e.field !== name),
            { field: name, message: error },
          ]);
        } else {
          setFieldErrors((prev) => prev.filter((e) => e.field !== name));
        }
      }
    }
  };

  // Get error message for a field
  const getFieldError = (field: string): string | undefined => {
    return fieldErrors.find((e) => e.field === field)?.message;
  };

  // Validate field
  const validateField = (field: string, value: string): string | null => {
    if (field.includes("email") && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return "Please enter a valid email address";
      }
    }

    return null;
  };

  async function fetchConvertedAmount() {
    setLoading(true);
    try {
      const result = await convertCurrency(formData.total_naira, "MYR", "NGN");
      setConvertedAmount(result);
    } catch (error) {
      console.error("Error converting currency:", error);
      setConvertedAmount(0);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    // Only fetch if there's a valid total_naira amount
    if (formData.total_naira && formData.total_naira > 0) {
      fetchConvertedAmount();
    }
  }, [formData.total_naira]);

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
      const baseRequiredFields = [
        "sender_country",
        "recipient_country",
        "service_type",
        "city",
      ] as const;

      // Check if we have all base required fields
      const hasBaseRequiredFields = baseRequiredFields.every((field) => {
        const value = formData[field];
        return Boolean(value);
      });

      // Check calculation type specific requirements
      const hasCalculationFields =
        formData.calculation_type === "weight"
          ? Boolean(formData.weight && formData.weight > 0)
          : Boolean(
              formData.length &&
                formData.length > 0 &&
                formData.width &&
                formData.width > 0 &&
                formData.height &&
                formData.height > 0
            );

      // If we don't have all required fields, don't do anything
      if (!hasBaseRequiredFields || !hasCalculationFields) return;

      setCalculating(true);
      setShippingRate(null);

      try {
        const rate = await ShippingAPI.calculateRate({
          origin_country: formData.sender_country,
          destination_country: formData.recipient_country,
          weight: formData.calculation_type === "weight" ? formData.weight : 0,
          length:
            formData.calculation_type === "dimensions" ? formData.length : 0,
          width:
            formData.calculation_type === "dimensions" ? formData.width : 0,
          height:
            formData.calculation_type === "dimensions" ? formData.height : 0,
          service_type: formData.service_type,
          declared_value: formData.declared_value || "0",
          insurance_required: formData.insurance_required || false,
          additional_charges: formData.additional_charges.map((charge) => ({
            id: charge.id || "",
            name: charge.name || "",
            charge_type: charge.charge_type || "",
            value: parseFloat(charge.value?.toString() || "0"),
            quantity: charge.quantity || 1,
          })),
          city: formData.city,
          calculation_type: formData.calculation_type,
        });

        setShippingRate(rate);
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
    formData.city,
    formData.additional_charges,
    formData.calculation_type,
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

    if (!shippingRate) {
      toast({
        title: "Error",
        description: "Please calculate shipping rate first",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    console.log(searchCustomerId);
    try {
      // Format the data properly before sending
      const formattedData = {
        ...formData,
        additional_charges: Array.isArray(formData.additional_charges)
          ? formData.additional_charges.map((charge: Partial<Extras>) => ({
              id: charge.id || "",
              name: charge.name || "",
              charge_type: charge.charge_type || "",
              value: parseFloat(charge.value?.toString() || "0"),
              quantity: charge.quantity || 1,
            }))
          : [],
        // Include cost breakdown from shipping rate calculation
        cost_breakdown: {
          service_price: shippingRate.cost_breakdown.service_price,
          weight_charge: shippingRate.rate_details.weight_charge,
          city_delivery_charge:
            shippingRate.cost_breakdown.city_delivery_charge,
          additional_charges: shippingRate.cost_breakdown.additional_charges,
          extras: shippingRate.cost_breakdown.extras.map(
            (extra: Partial<Extras>) => ({
              ...extra,
              value: parseFloat(extra.value?.toString() || "0"),
              quantity: extra.quantity || 1,
            })
          ),
          total_cost: shippingRate.cost_breakdown.total_cost,
        },
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/shipments/create-shipment/${searchCustomerId}/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
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

      // Reset the form after successful creation
      setFormData(defaultFormData);
      setSearchCustomerId("");
      setConvertedAmount(0);
      setShippingRate(null);
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

  useEffect(() => {
    console.log("FormData: ", formData);
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const senderErrors: string[] = [];
    const recipientErrors: string[] = [];
    const packageErrors: string[] = [];

    // Validate sender details
    if (!formData.sender_name) senderErrors.push("Sender name is required");
    if (!formData.sender_phone)
      senderErrors.push("Sender phone number is required");
    if (!formData.sender_country)
      senderErrors.push("Sender Country is required");
    if (!formData.sender_address)
      senderErrors.push("Sender address is required");

    // Validate recipient details
    if (!formData.recipient_name)
      recipientErrors.push("Recipient name is required");
    if (!formData.recipient_phone)
      recipientErrors.push("Recipient phone number is required");
    if (!formData.recipient_country)
      recipientErrors.push("Recipient city is required");
    if (!formData.recipient_address)
      recipientErrors.push("Recipient address is required");

    // Validate package details
    if (!formData.package_type) packageErrors.push("Package type is required");
    if (!formData.description)
      packageErrors.push("Package description is required");

    // Validate based on calculation type
    if (formData.calculation_type === "weight") {
      if (!formData.weight || formData.weight <= 0) {
        packageErrors.push("Valid weight is required");
      }
    } else {
      if (!formData.length || formData.length <= 0)
        packageErrors.push("Valid length is required");
      if (!formData.width || formData.width <= 0)
        packageErrors.push("Valid width is required");
      if (!formData.height || formData.height <= 0)
        packageErrors.push("Valid height is required");
    }

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
      // Don't require shipping rate in edit mode if we already have total_rm
      const needsShippingRate = !formData.total_rm || formData.total_rm <= 0;

      console.log("formData before update: ", formData);

      if (needsShippingRate && !shippingRate) {
        toast({
          title: "Error",
          description: "Please calculate shipping rate first",
          variant: "destructive",
        });
        return;
      }

      setIsSubmitting(true);

      // Format the data properly before updating
      const formattedData = {
        ...formData,
        additional_charges: Array.isArray(formData.additional_charges)
          ? formData.additional_charges.map((charge: Partial<Extras>) => ({
              id: charge.id || "",
              name: charge.name || "",
              charge_type: charge.charge_type || "",
              value: parseFloat(charge.value?.toString() || "0"),
              quantity: charge.quantity || 1,
            }))
          : [],
      };

      // Add cost breakdown from shipping rate if available
      if (shippingRate) {
        formattedData.cost_breakdown = {
          service_price: shippingRate.cost_breakdown.service_price,
          weight_charge: shippingRate.rate_details.weight_charge,
          city_delivery_charge:
            shippingRate.cost_breakdown.city_delivery_charge,
          additional_charges: shippingRate.cost_breakdown.additional_charges,
          extras: shippingRate.cost_breakdown.extras.map(
            (extra: Partial<Extras>) => ({
              ...extra,
              value: parseFloat(extra.value?.toString() || "0"),
              quantity: extra.quantity || 1,
            })
          ),
          total_cost: shippingRate.cost_breakdown.total_cost,
        };
      }

      const success = await onUpdate(formattedData); // Await the function
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
      // Reset shipping rate and related fields
      setShippingRate(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/shipments/last-shipment/${userId}/`
      );
      if (!response.ok) {
        setFormData({
          ...defaultFormData,
          // Keep the customer ID and reset everything else
          additional_charges: [],
        });

        toast({
          title: "Not Found",
          description: "No shipment is associated with this user",
        });
        return;
      }
      const data = await response.json();

      // Update form data with last shipment details but reset calculation-related fields
      setFormData((prev) => ({
        ...defaultFormData, // Reset to defaults
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
        // All other fields will be reset to defaults
        additional_charges: [], // Clear additional charges
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
    // Reset shipping rate when a new user is selected
    setShippingRate(null);
    fetchLastShipment(userId);
  };

  // Add a function to reset calculations
  const resetCalculations = () => {
    setShippingRate(null);
    setFormData((prev) => ({
      ...prev,
      delivery_rm: 0,
      total_rm: 0,
      total_naira: 0,
      additional_charges: [],
    }));
    setConvertedAmount(0);
  };

  // Add back the useEffect for debugging in edit mode
  useEffect(() => {
    if (mode === "edit" && initialData) {
      console.log("Edit mode active with initialData:", initialData);

      // Log the extras for debugging
      console.log("Available extras:", extras);

      // Log the current additional charges
      console.log("Current additional charges:", formData.additional_charges);

      // Check which charges should be selected
      if (Array.isArray(formData.additional_charges) && Array.isArray(extras)) {
        const selectedExtras = extras.filter((item) =>
          formData.additional_charges.some(
            (charge) => String(charge.id) === String(item.id)
          )
        );
        console.log("Extras that should be selected:", selectedExtras);
      }
    }
  }, [mode, initialData, extras, formData.additional_charges]);

  // Add a specific effect to handle city selection in edit mode
  useEffect(() => {
    if (mode === "edit" && initialData && cities.length > 0) {
      console.log("Fixing city selection in edit mode");
      console.log("Current city value:", formData.city);
      console.log("Initial city value:", initialData.city);

      // Ensure city ID is properly formatted for comparison with options
      const cityId = initialData.city ? String(initialData.city) : "";

      // Find the matching city in the cities array
      const cityExists = cities.some((city) => String(city.id) === cityId);
      console.log("City exists in options:", cityExists);

      if (cityId && !cityExists) {
        console.log(
          "City ID doesn't match any options, searching by name instead"
        );
        // If city ID doesn't match, try to find by name if available
        const cityByName = cities.find(
          (city) =>
            city.name === initialData.city_name ||
            city.name === initialData.city
        );

        if (cityByName) {
          console.log(
            "Found city by name:",
            cityByName.name,
            "with ID:",
            cityByName.id
          );
          setFormData((prev) => ({
            ...prev,
            city: String(cityByName.id),
          }));
        }
      } else if (cityId && cityExists && formData.city !== cityId) {
        // If city ID exists but doesn't match formData.city, update it
        console.log("Setting city to:", cityId);
        setFormData((prev) => ({
          ...prev,
          city: cityId,
        }));
      }
    }
  }, [mode, initialData, cities, formData.city]);

  // Add another effect to handle service type selection in edit mode
  useEffect(() => {
    if (mode === "edit" && initialData && serviceTypes.length > 0) {
      console.log("Fixing service type selection in edit mode");
      console.log("Current service type value:", formData.service_type);
      console.log("Initial service type value:", initialData.service_type);

      // Ensure service type ID is properly formatted
      const serviceTypeId = initialData.service_type
        ? String(initialData.service_type)
        : "";

      // Check if service type exists in options
      const serviceTypeExists = serviceTypes.some(
        (service) => String(service.id) === serviceTypeId
      );
      console.log("Service type exists in options:", serviceTypeExists);

      if (
        serviceTypeId &&
        serviceTypeExists &&
        formData.service_type !== serviceTypeId
      ) {
        console.log("Setting service type to:", serviceTypeId);
        setFormData((prev) => ({
          ...prev,
          service_type: serviceTypeId,
        }));
      }
    }
  }, [mode, initialData, serviceTypes, formData.service_type]);

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
                  key={`city-${mode}-${formData.city}-${cities.length}`}
                  label="City"
                  options={cities.map((city) => ({
                    value: String(city.id),
                    label: city.name,
                  }))}
                  value={String(formData.city || "")}
                  onChange={(value) => {
                    console.log("City changed to:", value);
                    const selectedCity = cities.find(
                      (city) => String(city.id) === String(value)
                    );
                    console.log("Selected city:", selectedCity);
                    if (selectedCity) {
                      handleFieldChange("city", value);
                    }
                  }}
                  className="col-span-1"
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
              <h3 className="font-medium">Package Details</h3>
              {renderErrors(errors.package)}
              <div className="grid md:grid-cols-2 gap-6">
                <SearchableSelect
                  key={`service-type-select-${mode}-${formData.service_type}-${serviceTypes.length}`}
                  label="Service Type"
                  options={serviceTypes.map((type) => ({
                    value: String(type.id),
                    label: type.name,
                  }))}
                  value={String(formData.service_type || "")}
                  onChange={(value) => {
                    console.log("Service type selected:", value);
                    handleFieldChange("service_type", value);
                  }}
                  className="col-span-2"
                />

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
                  <Label>Calculation Method</Label>
                  <Select
                    value={formData.calculation_type}
                    onValueChange={(value) => {
                      // Reset the other values when switching
                      if (value === "weight") {
                        setFormData((prev) => ({
                          ...prev,
                          calculation_type: value,
                          length: 0,
                          width: 0,
                          height: 0,
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          calculation_type: value as "weight" | "dimensions",
                          weight: 0,
                        }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select calculation method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weight">Weight Based</SelectItem>
                      <SelectItem value="dimensions">
                        Dimensional Based
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.calculation_type === "weight" ? (
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
                ) : (
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
                            handleFieldChange(
                              "width",
                              parseFloat(e.target.value)
                            )
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
                )}

                <div className="space-y-2">
                  <Label htmlFor="declared_value">
                    Declared Value (
                    {getCountryCurrencyCode(
                      formData.sender_country,
                      departureCountries
                    )}
                    )
                  </Label>
                  <Input
                    type="text"
                    value={formData.declared_value}
                    onChange={(e) =>
                      handleFieldChange(
                        "declared_value",
                        `${e.target.value} ${getCountryCurrencyCode(
                          formData.sender_country,
                          departureCountries
                        )}`
                      )
                    }
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="description">Package Description</Label>
                  <Textarea
                    placeholder="Enter description of items being shipped"
                    value={formData.description}
                    onChange={(e) =>
                      handleFieldChange("description", e.target.value)
                    }
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>

            {/* Additional Charges */}
            <div className="space-y-4 mt-6">
              <h3 className="font-medium">Additional Charges & others</h3>
              <div className="grid gap-2">
                {extras.map((item) => {
                  //   console.log(`Checking extra: ${item.id} - ${item.name}`);

                  // Check if the extra is already added by ID matching
                  const isChecked =
                    Array.isArray(formData.additional_charges) &&
                    formData.additional_charges.some((charge) => {
                      // Convert both IDs to strings for comparison
                      const itemId = String(item.id);
                      const chargeId = String(charge.id);
                      const matches = itemId === chargeId;

                      if (matches && mode === "edit") {
                        // console.log(
                        //   `Found matching charge: ${chargeId} matches ${itemId}`
                        // );
                      }

                      return matches;
                    });

                  // Initialize quantity with a safe default
                  let quantity = 1;

                  // Find matching charge to get quantity if it exists
                  if (Array.isArray(formData.additional_charges)) {
                    const foundCharge = formData.additional_charges.find(
                      (charge) => String(charge.id) === String(item.id)
                    );

                    if (foundCharge) {
                      quantity = foundCharge.quantity || 1;
                    }
                  }

                  // Log selection state for debugging
                  console.log(
                    `Extra: ${item.id} - ${item.name}, isChecked: ${isChecked}, quantity: ${quantity}`
                  );

                  return (
                    <div key={item.id} className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={item.id}
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              // Add the charge if it's not already there
                              if (
                                !formData.additional_charges.some(
                                  (charge) => charge.id === item.id
                                )
                              ) {
                                const newCharges = [
                                  ...formData.additional_charges,
                                  {
                                    id: item.id,
                                    name: item.name,
                                    charge_type: item.charge_type,
                                    value: item.value,
                                    // For percentage charges, always set quantity to 1
                                    quantity:
                                      item.charge_type.toUpperCase() ===
                                      "PERCENTAGE"
                                        ? 1
                                        : 1,
                                  },
                                ];
                                handleFieldChange(
                                  "additional_charges",
                                  newCharges
                                );
                              }
                            } else {
                              // Remove the charge
                              const newCharges =
                                formData.additional_charges.filter(
                                  (charge) => charge.id !== item.id
                                );
                              handleFieldChange(
                                "additional_charges",
                                newCharges
                              );
                            }
                          }}
                        />
                        <Label htmlFor={item.id}>{item.name}</Label>
                      </div>

                      {isChecked &&
                        item.charge_type.toUpperCase() !== "PERCENTAGE" && (
                          <div className="flex items-center space-x-2">
                            <Label
                              htmlFor={`quantity-${item.id}`}
                              className="text-sm"
                            >
                              Quantity:
                            </Label>
                            <Input
                              id={`quantity-${item.id}`}
                              type="number"
                              min={1}
                              value={quantity}
                              className="w-20"
                              onChange={(e) => {
                                // Skip for percentage charges
                                if (
                                  item.charge_type.toUpperCase() ===
                                  "PERCENTAGE"
                                ) {
                                  return;
                                }

                                const newQuantity =
                                  parseInt(e.target.value) || 1;
                                const newCharges =
                                  formData.additional_charges.map((charge) =>
                                    charge.id === item.id
                                      ? {
                                          ...charge,
                                          quantity: newQuantity,
                                        }
                                      : charge
                                  );
                                handleFieldChange(
                                  "additional_charges",
                                  newCharges
                                );
                              }}
                            />
                          </div>
                        )}

                      <div className="ml-auto text-sm text-muted-foreground">
                        {item.charge_type.toUpperCase() === "PERCENTAGE"
                          ? `${item.value}%`
                          : `RM ${item.value}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {calculating && (
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Calculating shipping rate...</span>
              </div>
            )}

            {shippingRate && (
              <Card className="mt-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">
                    Shipping Cost Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid gap-2 text-sm sm:text-base">
                    <div className="flex justify-between">
                      <span>Shipping Type Charges:</span>
                      <span>RM {shippingRate.rate_details.per_kg_rate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>
                        Weight Charge (RM{" "}
                        {shippingRate.rate_details.per_kg_rate}/KG):
                      </span>
                      <span>RM {shippingRate.rate_details.weight_charge}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>City Delivery Charges:</span>
                      <span>
                        RM {shippingRate.cost_breakdown.city_delivery_charge}
                      </span>
                    </div>

                    {shippingRate.cost_breakdown.additional_charges.length >
                      0 && <h1 className="font-bold text-xl">Fixed Charges</h1>}

                    {shippingRate.cost_breakdown.additional_charges.map(
                      (charge) => (
                        <div key={charge.name} className="flex justify-between">
                          <span>{charge.name}:</span>
                          <span>RM {charge.amount}</span>
                        </div>
                      )
                    )}

                    {shippingRate.cost_breakdown.extras.length > 0 && (
                      <h1 className="font-bold text-xl">Additional Charges</h1>
                    )}

                    {shippingRate.cost_breakdown.extras.map((charge) => (
                      <div key={charge.name} className="flex justify-between">
                        <span>
                          {charge.name}{" "}
                          {charge.quantity && charge.quantity > 1
                            ? `(${charge.quantity}x)`
                            : ""}
                          :
                        </span>
                        <span>
                          {charge.charge_type.toUpperCase() === "PERCENTAGE"
                            ? `${charge.value}%`
                            : `RM ${(
                                charge.value * (charge.quantity || 1)
                              ).toFixed(2)}`}
                        </span>
                      </div>
                    ))}

                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Total:</span>
                      <span>
                        RM {shippingRate.cost_breakdown.total_cost.toFixed(2)}
                      </span>
                    </div>

                    {/* Total Bill */}
                    <div className="space-y-4 pt-4">
                      <div className="grid md:grid-cols-3 gap-6">
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
                          <Label htmlFor="total_naira">
                            Total Bill (Naira)
                          </Label>
                          <Input
                            id="total_naira"
                            type="number"
                            value={loading ? "Loading..." : convertedAmount}
                            readOnly
                            className="bg-muted"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex flex-col sm:flex-row gap-4 sm:justify-end mt-2">
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
