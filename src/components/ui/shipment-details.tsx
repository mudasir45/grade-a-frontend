import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useShippingData from "@/hooks/use-shipping-data";
import {
  ArrowRight,
  Calendar,
  CreditCard,
  DollarSign,
  MapPin,
  Package2,
  Shield,
  Tag,
  Truck,
  User,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { ShipmentProps } from "../staff/manage-shipment";
import { Badge } from "./badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

// Define interfaces for shipment details and tracking history.
interface TrackingHistory {
  status: string;
  location: string;
  timestamp: string | Date;
  description: string;
}

interface ShipmentDetailsDialogProps {
  viewDialogOpen: boolean;
  setViewDialogOpen: (open: boolean) => void;
  selectedShipment: ShipmentProps | null;
  getStatusBadge: (status: string) => JSX.Element;
}

// Reusable section component
const Section: React.FC<{
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div className="space-y-4 mb-6">
    <div className="flex items-center gap-2">
      {icon}
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
    <div className="pl-7">{children}</div>
  </div>
);

// Reusable info item component
const InfoItem: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
    <div className="text-xs uppercase font-medium text-gray-500">{label}</div>
    <div className="mt-1 text-sm text-gray-900">{value}</div>
  </div>
);

// Tracking Timeline Item component
const TimelineItem: React.FC<{ history: TrackingHistory }> = ({ history }) => (
  <div className="relative pb-8 last:pb-0">
    <div className="absolute left-0 top-0 h-full w-0.5 bg-gray-200"></div>
    <div className="relative flex space-x-3">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary shadow-md text-white text-xs ring-4 ring-white z-10">
        <MapPin className="h-4 w-4" />
      </div>
      <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
        <div>
          <p className="text-sm font-medium text-gray-900">{history.status}</p>
          <p className="text-sm text-gray-700 mt-1">{history.description}</p>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <MapPin className="mr-1.5 h-3 w-3 flex-shrink-0" />
            <span>{history.location}</span>
          </div>
        </div>
        <div className="whitespace-nowrap text-right text-sm text-gray-500">
          <time dateTime={new Date(history.timestamp).toISOString()}>
            {new Date(history.timestamp).toLocaleString()}
          </time>
        </div>
      </div>
    </div>
  </div>
);

const ShipmentDetailsDialog: React.FC<ShipmentDetailsDialogProps> = ({
  viewDialogOpen,
  setViewDialogOpen,
  selectedShipment,
  getStatusBadge,
}) => {
  const {
    departureCountries,
    destinationCountries,
    serviceTypes,
    isLoading,
    error: dataError,
  } = useShippingData();

  const [cities, setCities] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("details");

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
      }
    };
    fetchCities();
  }, []);

  // Helper functions to get names from IDs
  const getCountryName = (countryId: string, isDeparture: boolean) => {
    const countries = isDeparture ? departureCountries : destinationCountries;
    const country = countries.find((c) => c.id === countryId);
    return country?.name || countryId;
  };

  const getServiceTypeName = (serviceTypeId: string) => {
    const serviceType = serviceTypes.find((s) => s.id === serviceTypeId);
    return serviceType?.name || serviceTypeId;
  };

  const getCityName = (cityId: string | any) => {
    // If city is already an object with a name property, return it
    if (typeof cityId === "object" && cityId !== null) {
      return cityId.name || "Unknown";
    }
    // Otherwise look it up by ID
    const city = cities.find((c) => c.id === cityId);
    return city?.name || cityId;
  };

  // Categorize extras
  const categorizeExtras = (extras: any[]) => {
    if (!extras || !Array.isArray(extras))
      return { insurance: [], additional: [] };

    return {
      insurance: extras.filter((extra) => extra.charge_type === "PERCENTAGE"),
      additional: extras.filter((extra) => extra.charge_type === "FIXED"),
    };
  };

  // Generate header summary card data
  const generateSummaryData = () => {
    if (!selectedShipment) return [];

    return [
      {
        icon: <Tag className="h-4 w-4 text-primary" />,
        label: "Tracking Number",
        value: selectedShipment.tracking_number,
      },
      {
        icon: <Truck className="h-4 w-4 text-primary" />,
        label: "Status",
        value: getStatusBadge(selectedShipment.status),
      },
      {
        icon: <DollarSign className="h-4 w-4 text-primary" />,
        label: "Total Cost",
        value: selectedShipment.total_cost,
      },
      {
        icon: <CreditCard className="h-4 w-4 text-primary" />,
        label: "Payment Status",
        value: selectedShipment.payment_status,
      },
      {
        icon: <Calendar className="h-4 w-4 text-primary" />,
        label: "Created At",
        value: new Date(selectedShipment.created_at).toLocaleString(),
      },
    ];
  };

  if (!selectedShipment) {
    return null;
  }

  const { insurance, additional } = categorizeExtras(
    selectedShipment.extras || []
  );
  const additionalCharges = selectedShipment.additional_charges || [];

  return (
    <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg p-6 bg-white shadow-xl">
        <DialogHeader className="flex justify-between items-center border-b pb-4 mb-6">
          <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Package2 className="h-6 w-6 text-primary" />
            Shipment Details
          </DialogTitle>
          <button
            onClick={() => setViewDialogOpen(false)}
            className="text-gray-600 hover:text-gray-900 rounded-full p-1 hover:bg-gray-100 transition-colors"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </DialogHeader>

        {/* Summary Card */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {generateSummaryData().map((item, index) => (
              <div key={index} className="flex flex-col">
                <div className="flex items-center text-xs text-gray-500 mb-1 gap-1">
                  {item.icon}
                  {item.label}
                </div>
                <div className="font-medium">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <Tabs
          defaultValue="details"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="tracking">Tracking History</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            {/* Route Visualization */}
            <div className="bg-gray-50 p-4 rounded-lg border mb-6">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
                <div className="font-medium">
                  {getCountryName(selectedShipment.sender_country, true)}
                </div>
                <div className="flex items-center text-primary">
                  <div className="h-1 w-12 bg-primary rounded"></div>
                  <ArrowRight className="h-5 w-5" />
                </div>
                <div className="font-medium">
                  {getCountryName(selectedShipment.recipient_country, false)}
                </div>
              </div>
            </div>

            {/* Sender & Recipient Info - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Section
                title="Sender Details"
                icon={<User className="h-5 w-5 text-blue-500" />}
              >
                <div className="grid grid-cols-1 gap-3">
                  <InfoItem label="Name" value={selectedShipment.sender_name} />
                  <InfoItem
                    label="Email"
                    value={selectedShipment.sender_email}
                  />
                  <InfoItem
                    label="Phone"
                    value={selectedShipment.sender_phone}
                  />
                  <InfoItem
                    label="Address"
                    value={selectedShipment.sender_address}
                  />
                  <InfoItem
                    label="Country"
                    value={getCountryName(
                      selectedShipment.sender_country,
                      true
                    )}
                  />
                </div>
              </Section>

              <Section
                title="Recipient Details"
                icon={<User className="h-5 w-5 text-green-500" />}
              >
                <div className="grid grid-cols-1 gap-3">
                  <InfoItem
                    label="Name"
                    value={selectedShipment.recipient_name}
                  />
                  <InfoItem
                    label="Email"
                    value={selectedShipment.recipient_email}
                  />
                  <InfoItem
                    label="Phone"
                    value={selectedShipment.recipient_phone}
                  />
                  <InfoItem
                    label="Address"
                    value={selectedShipment.recipient_address}
                  />
                  <InfoItem
                    label="Country"
                    value={getCountryName(
                      selectedShipment.recipient_country,
                      false
                    )}
                  />
                </div>
              </Section>
            </div>

            {/* Parcel Details */}
            <Section
              title="Parcel Details"
              icon={<Package2 className="h-5 w-5 text-amber-500" />}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <InfoItem
                  label="Package Type"
                  value={selectedShipment.package_type}
                />
                <InfoItem
                  label="Weight"
                  value={`${selectedShipment.weight} kg`}
                />
                <InfoItem
                  label="Dimensions"
                  value={`${selectedShipment.length}×${selectedShipment.width}×${selectedShipment.height} cm`}
                />
                <InfoItem
                  label="Description"
                  value={selectedShipment.description}
                />
                <InfoItem
                  label="Declared Value"
                  value={selectedShipment.declared_value}
                />

                <InfoItem
                  label="Service Type"
                  value={getServiceTypeName(selectedShipment.service_type)}
                />
                <InfoItem
                  label="City"
                  value={
                    selectedShipment.city
                      ? getCityName(selectedShipment.city)
                      : "N/A"
                  }
                />
              </div>
            </Section>

            {/* Notes */}
            {selectedShipment.notes && (
              <Section
                title="Notes"
                icon={<Tag className="h-5 w-5 text-purple-500" />}
              >
                <div className="p-4 border rounded-lg bg-gray-50">
                  <div className="text-sm text-gray-700">
                    {selectedShipment.notes}
                  </div>
                </div>
              </Section>
            )}
          </TabsContent>

          <TabsContent value="tracking">
            {/* Tracking History as a Timeline */}
            {selectedShipment.tracking_history &&
            selectedShipment.tracking_history.length > 0 ? (
              <Section
                title="Tracking History"
                icon={<Truck className="h-5 w-5 text-primary" />}
              >
                <div className="relative border-l-2 border-gray-200 pl-6 ml-3">
                  {selectedShipment.tracking_history.map(
                    (history: any, index: number) => (
                      <TimelineItem key={index} history={history} />
                    )
                  )}
                </div>

                {selectedShipment.estimated_delivery && (
                  <div className="mt-6 p-4 border border-dashed rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span className="font-medium">Estimated Delivery:</span>
                      <span>
                        {new Date(
                          selectedShipment.estimated_delivery
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </Section>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <Truck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No tracking information available yet.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="financial">
            {/* Payment Details */}
            <Section
              title="Payment Details"
              icon={<CreditCard className="h-5 w-5 text-indigo-500" />}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <InfoItem
                  label="Payment Method"
                  value={selectedShipment.payment_method}
                />
                <InfoItem
                  label="Payment Status"
                  value={
                    <Badge
                      className={`${
                        selectedShipment.payment_status === "PAID" ||
                        selectedShipment.payment_status === "COD_PAID"
                          ? "bg-green-500"
                          : selectedShipment.payment_status === "PENDING" ||
                            selectedShipment.payment_status === "COD_PENDING"
                          ? "bg-yellow-500"
                          : selectedShipment.payment_status === "FAILED"
                          ? "bg-red-500"
                          : selectedShipment.payment_status === "REFUNDED"
                          ? "bg-purple-500"
                          : "bg-gray-500"
                      }`}
                    >
                      {selectedShipment.payment_status}
                    </Badge>
                  }
                />
                {selectedShipment.payment_date && (
                  <InfoItem
                    label="Payment Date"
                    value={new Date(
                      selectedShipment.payment_date
                    ).toLocaleString()}
                  />
                )}
                {selectedShipment.transaction_id && (
                  <InfoItem
                    label="Transaction ID"
                    value={selectedShipment.transaction_id}
                  />
                )}
                {selectedShipment.cod_amount && (
                  <InfoItem
                    label="COD Amount"
                    value={selectedShipment.cod_amount}
                  />
                )}
              </div>
            </Section>

            {/* Charges Breakdown */}
            <Section
              title="Charges Breakdown"
              icon={<DollarSign className="h-5 w-5 text-emerald-500" />}
            >
              <div className="space-y-4">
                {/* Base Charges */}

                {/* Insurance Extras */}
                {insurance.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                      <Shield className="h-4 w-4 text-blue-500" />
                      Insurance
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {insurance.map((item, index) => (
                        <InfoItem
                          key={`insurance-${index}`}
                          label={item.name || "Insurance"}
                          value={
                            <div>
                              <div>{item.value}% of declared value</div>
                              {item.quantity && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Quantity: {item.quantity}
                                </div>
                              )}
                            </div>
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Charges */}
                {(additional.length > 0 || additionalCharges.length > 0) && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                      <Tag className="h-4 w-4 text-amber-500" />
                      Additional Charges
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {additional.map((item, index) => (
                        <InfoItem
                          key={`additional-${index}`}
                          label={item.name || "Additional Charge"}
                          value={
                            <div>
                              <div>{item.value}</div>
                              {item.quantity && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Quantity: {item.quantity}
                                </div>
                              )}
                            </div>
                          }
                        />
                      ))}
                      {additionalCharges.map((item, index) => (
                        <InfoItem
                          key={`additional-charge-${index}`}
                          label={item.name || "Additional Charge"}
                          value={item.value || item.value || 0}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Summary</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <InfoItem
                      label="Per KG Rate"
                      value={selectedShipment.per_kg_rate}
                    />
                    <InfoItem
                      label="Weight Charge"
                      value={selectedShipment.weight_charge}
                    />
                    <InfoItem
                      label="City Delivery Charge"
                      value={selectedShipment.delivery_charge}
                    />

                    <InfoItem
                      label="Extras Charges"
                      value={selectedShipment.extras_charges}
                    />
                    <InfoItem
                      label="Regulation Charges"
                      value={selectedShipment.total_additional_charges}
                    />
                    <div className="p-4 border-2 border-primary rounded-lg bg-primary/5">
                      <div className="text-xs uppercase font-bold text-primary">
                        Total Cost
                      </div>
                      <div className="mt-1 text-lg font-bold text-gray-900">
                        {selectedShipment.total_cost}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Section>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ShipmentDetailsDialog;
