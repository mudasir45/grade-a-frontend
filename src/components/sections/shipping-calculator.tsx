"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useShippingData from "@/hooks/use-shipping-data";
import { useToast } from "@/hooks/use-toast";
import { ShippingAPI } from "@/lib/api/shipping";
import { cn, convertCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRightCircle,
  Calculator,
  CheckSquare,
  ChevronsRight,
  Info,
  Loader2,
  Plane,
  Ship,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";

const serviceIcons = {
  economy: <Ship className="h-5 w-5" />,
  regular: <Truck className="h-5 w-5" />,
  express: <Plane className="h-5 w-5" />,
};

export function ShippingCalculator() {
  const { toast } = useToast();
  const {
    departureCountries,
    destinationCountries,
    serviceTypes,
    isLoading: dataLoading,
    error: dataError,
    refetch,
  } = useShippingData();

  const [formData, setFormData] = useState({
    fromCountry: "",
    toCountry: "",
    weight: "",
    method: "",
  });
  const [loading, setLoading] = useState(false);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [result, setResult] = useState<{
    price: number;
    currency: string;
    destination_currency: string;
  } | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.fromCountry) {
      errors.fromCountry = "Please select origin country";
    }
    if (!formData.toCountry) {
      errors.toCountry = "Please select destination country";
    }
    if (!formData.weight) {
      errors.weight = "Please enter package weight";
    } else {
      const weightNum = parseFloat(formData.weight);
      if (isNaN(weightNum) || weightNum <= 0) {
        errors.weight = "Weight must be greater than 0";
      }
      if (weightNum > 1000) {
        errors.weight = "Weight cannot exceed 1000 kg";
      }
    }
    if (!formData.method) {
      errors.method = "Please select shipping method";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    const performCurrencyConversion = async () => {
      if (result) {
        try {
          setLoading(true);
          // Convert the regular amount to Naira
          const regularAmount = Number(result.price);
          const convertedRegular = await convertCurrency(
            regularAmount,
            result.currency,
            result.destination_currency
          );
          setConvertedAmount(convertedRegular);
        } catch (error) {
          console.error("Currency conversion error:", error);
          // Set fallback values in case of error
          toast({
            title: "Currency Conversion Error",
            description: "Failed to convert currency. Using estimated values.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
    };

    performCurrencyConversion();
  }, [result, toast]);

  const handleCalculate = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please check all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const rate = await ShippingAPI.calculateRate({
        origin_country: formData.fromCountry,
        destination_country: formData.toCountry,
        weight: parseFloat(formData.weight),
        length: 0,
        width: 0,
        height: 0,
        service_type: formData.method,
        calculation_type: "weight",
      });

      setResult({
        price: rate.cost_breakdown.total_cost,
        currency: rate.route.origin.currency,
        destination_currency: rate.route.destination.currency,
      });

      toast({
        title: "Rate Calculated",
        description: "Your shipping rate has been calculated successfully.",
      });
    } catch (err) {
      console.error("Calculation error:", err);
      toast({
        title: "Calculation Error",
        description:
          err instanceof Error
            ? err.message
            : "Failed to calculate shipping rate.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading shipping data...</p>
        </div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
          <p className="text-destructive">Error loading shipping data</p>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <section
      className="py-24 relative overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800"
      id="calculator"
    >
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-gradient-to-br from-red-500/10 to-orange-500/10 blur-3xl rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1 mb-4 text-sm font-medium rounded-full bg-white/10 text-white backdrop-blur-sm border border-white/20">
              Quick Estimate
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-white mb-4 mt-2">
              Shipping Rate Calculator
            </h2>
            <p className="text-lg text-gray-300">
              Get instant shipping quotes for your international deliveries
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Main calculator card */}
            <Card className="backdrop-blur-md bg-white/90 border-0 shadow-2xl overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500"></div>

              <CardContent className="p-8">
                <div className="grid gap-8">
                  {/* From/To Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        Origin
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <Select
                        value={formData.fromCountry}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            fromCountry: value,
                          }))
                        }
                      >
                        <SelectTrigger
                          className={cn(
                            "w-full h-12 bg-gray-50 border transition-colors focus:ring-2 focus:ring-blue-500/20 text-gray-900",
                            formErrors.fromCountry
                              ? "border-red-300 focus:border-red-500"
                              : "border-gray-200 focus:border-blue-500"
                          )}
                        >
                          <SelectValue
                            placeholder="Select origin country"
                            className="text-gray-900"
                          />
                        </SelectTrigger>
                        <SelectContent className="max-h-80">
                          {departureCountries.map((country) => (
                            <SelectItem key={country.id} value={country.id}>
                              <span className="flex items-center gap-2">
                                <span>{country.name}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.fromCountry && (
                        <p className="text-sm text-red-500 flex items-center mt-1">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {formErrors.fromCountry}
                        </p>
                      )}
                    </div>

                    {/* Arrow between origin and destination */}
                    <div className="absolute left-1/2 top-12 transform -translate-x-1/2 -translate-y-1/2 hidden md:block">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <ChevronsRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        Destination
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <Select
                        value={formData.toCountry}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, toCountry: value }))
                        }
                      >
                        <SelectTrigger
                          className={cn(
                            "w-full h-12 bg-gray-50 border transition-colors focus:ring-2 focus:ring-blue-500/20 text-gray-900",
                            formErrors.toCountry
                              ? "border-red-300 focus:border-red-500"
                              : "border-gray-200 focus:border-blue-500"
                          )}
                        >
                          <SelectValue
                            placeholder="Select destination country"
                            className="text-gray-900"
                          />
                        </SelectTrigger>
                        <SelectContent className="max-h-80">
                          {destinationCountries.map((country) => (
                            <SelectItem key={country.id} value={country.id}>
                              <span className="flex items-center gap-2">
                                <span>{country.name}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.toCountry && (
                        <p className="text-sm text-red-500 flex items-center mt-1">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {formErrors.toCountry}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Weight and Method */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        Package Weight (kg)
                        <span className="text-red-500 ml-1">*</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3.5 w-3.5 text-gray-400 ml-1 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-[180px] text-xs">
                                Enter the weight of your package in kilograms
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </label>
                      <Input
                        type="number"
                        placeholder="e.g. 5"
                        value={formData.weight}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            weight: e.target.value,
                          }))
                        }
                        className={cn(
                          "h-12 bg-gray-50 border transition-colors focus:ring-2 focus:ring-blue-500/20 text-gray-900",
                          formErrors.weight
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-200 focus:border-blue-500"
                        )}
                      />
                      {formErrors.weight && (
                        <p className="text-sm text-red-500 flex items-center mt-1">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {formErrors.weight}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        Shipping Method
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <Select
                        value={formData.method}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, method: value }))
                        }
                      >
                        <SelectTrigger
                          className={cn(
                            "w-full h-12 bg-gray-50 border transition-colors focus:ring-2 focus:ring-blue-500/20 text-gray-900",
                            formErrors.method
                              ? "border-red-300 focus:border-red-500"
                              : "border-gray-200 focus:border-blue-500"
                          )}
                        >
                          <SelectValue
                            placeholder="Select shipping method"
                            className="text-gray-900"
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceTypes.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              <span className="flex items-center gap-2">
                                {serviceIcons[
                                  service.id as keyof typeof serviceIcons
                                ] || null}
                                <span>{service.name}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.method && (
                        <p className="text-sm text-red-500 flex items-center mt-1">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {formErrors.method}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Calculate Button */}
                  <div className="mt-2">
                    <Button
                      onClick={handleCalculate}
                      disabled={loading}
                      className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium shadow-lg shadow-blue-500/20"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Calculating...
                        </>
                      ) : (
                        <>
                          <Calculator className="h-4 w-4 mr-2" />
                          Calculate Shipping Rate
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Results Section */}
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 p-6 rounded-xl bg-blue-50 border border-blue-100"
                    >
                      <div className="flex items-center mb-3">
                        <CheckSquare className="h-5 w-5 text-blue-500 mr-2" />
                        <h3 className="text-lg font-bold text-blue-800">
                          Estimated Shipping Cost
                        </h3>
                      </div>

                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Origin Country Cost */}
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-500">
                              <ChevronsRight className="h-4 w-4 mr-1" />
                              {
                                departureCountries.find(
                                  (c) => c.id === formData.fromCountry
                                )?.name
                              }
                            </div>
                            <div className="flex items-baseline">
                              <span className="text-2xl font-bold text-gray-900">
                                {result.price.toFixed(2)}
                              </span>
                              <span className="ml-1 text-gray-500">
                                {result.currency}
                              </span>
                            </div>
                          </div>

                          {/* Destination Country Cost */}
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-500">
                              <ChevronsRight className="h-4 w-4 mr-1" />
                              {
                                destinationCountries.find(
                                  (c) => c.id === formData.toCountry
                                )?.name
                              }
                            </div>
                            <div className="flex items-baseline">
                              <span className="text-2xl font-bold text-gray-900">
                                {convertedAmount?.toFixed(2)}
                              </span>
                              <span className="ml-1 text-gray-500">
                                {result.destination_currency}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                          <Button
                            onClick={() => {
                              window.location.href = `https://wa.me/+601136907583?text=${encodeURIComponent(
                                `Hello, I would like to ship a package weighing ${
                                  formData.weight
                                }kg from ${
                                  departureCountries.find(
                                    (c) => c.id === formData.fromCountry
                                  )?.name
                                } to ${
                                  destinationCountries.find(
                                    (c) => c.id === formData.toCountry
                                  )?.name
                                } using ${
                                  serviceTypes.find(
                                    (s) => s.id === formData.method
                                  )?.name
                                } service. The estimated cost is ${result.price.toFixed(
                                  2
                                )} ${
                                  result.currency
                                } (${convertedAmount?.toFixed(2)} ${
                                  result.destination_currency
                                }). Can you help me with this shipment?`
                              )}`;
                            }}
                            className="bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20"
                          >
                            <ArrowRightCircle className="h-4 w-4 mr-2" />
                            Proceed with Shipping
                          </Button>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 mt-4">
                        * This is an estimated cost based on the information
                        provided. Final shipping costs may vary based on actual
                        weight, dimensions, and other factors.
                      </p>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Features/Benefits Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
                <div className="flex items-start">
                  <div className="flex-shrink-0 p-2 rounded-lg bg-blue-50 text-blue-500">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900">
                      Real-Time Rates
                    </h3>
                    <p className="text-sm text-gray-500">
                      Get accurate shipping rates based on current pricing
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
                <div className="flex items-start">
                  <div className="flex-shrink-0 p-2 rounded-lg bg-purple-50 text-purple-500">
                    <Ship className="h-5 w-5" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900">
                      Multiple Options
                    </h3>
                    <p className="text-sm text-gray-500">
                      Compare different shipping methods and services
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
                <div className="flex items-start">
                  <div className="flex-shrink-0 p-2 rounded-lg bg-red-50 text-red-500">
                    <Plane className="h-5 w-5" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900">
                      Instant Estimates
                    </h3>
                    <p className="text-sm text-gray-500">
                      Quick calculations to help you plan your shipping
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
