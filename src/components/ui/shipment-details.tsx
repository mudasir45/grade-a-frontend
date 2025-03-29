import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useShippingData from "@/hooks/use-shipping-data";
import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { ShipmentProps } from "../staff/manage-shipment";

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
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    {children}
  </div>
);

// Reusable info item component
const InfoItem: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="p-4 border rounded-lg bg-gray-50">
    <div className="text-xs uppercase font-medium text-gray-500">{label}</div>
    <div className="mt-1 text-sm text-gray-900">{value}</div>
  </div>
);

// Tracking Timeline Item component
const TimelineItem: React.FC<{ history: TrackingHistory }> = ({ history }) => (
  <div className="relative pb-8 last:pb-0">
    <div className="absolute left-0 top-0 h-full w-0.5 bg-gray-200"></div>
    <div className="relative flex space-x-3">
      <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
        <div>
          <p className="text-sm text-gray-500">
            {new Date(history.timestamp).toLocaleString()}
          </p>
          <p className="text-sm font-medium text-gray-900">{history.status}</p>
          <p className="text-sm text-gray-500">{history.location}</p>
          <p className="text-sm text-gray-500">{history.description}</p>
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

  const getCityName = (cityId: string) => {
    const city = cities.find((c) => c.id === cityId);
    return city?.name || cityId;
  };

  return (
    <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg p-8 bg-white shadow-xl">
        <DialogHeader className="flex justify-between items-center border-b pb-4 mb-6">
          <DialogTitle className="text-3xl font-bold text-gray-800">
            Shipment Details
          </DialogTitle>
          <button
            onClick={() => setViewDialogOpen(false)}
            className="text-gray-600 hover:text-gray-900"
            aria-label="Close dialog"
          >
            <X size={24} />
          </button>
        </DialogHeader>

        {selectedShipment && (
          <div className="space-y-10">
            {/* Top-level details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <InfoItem
                label="Tracking Number"
                value={selectedShipment.tracking_number}
              />
              <InfoItem
                label="Status"
                value={getStatusBadge(selectedShipment.status)}
              />
              <InfoItem
                label="Created At"
                value={new Date(selectedShipment.created_at).toLocaleString()}
              />
            </div>

            {/* Payment Details */}
            <Section title="Payment Details">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <InfoItem
                  label="COD Amount"
                  value={selectedShipment.cod_amount}
                />
                <InfoItem
                  label="Payment Method"
                  value={selectedShipment.payment_method}
                />
                <InfoItem
                  label="Payment Status"
                  value={selectedShipment.payment_status}
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
              </div>
            </Section>

            {/* Sender Details */}
            <Section title="Sender Details">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <InfoItem label="Name" value={selectedShipment.sender_name} />
                <InfoItem label="Email" value={selectedShipment.sender_email} />
                <InfoItem label="Phone" value={selectedShipment.sender_phone} />
                <InfoItem
                  label="Address"
                  value={selectedShipment.sender_address}
                />
                <InfoItem
                  label="Country"
                  value={getCountryName(selectedShipment.sender_country, true)}
                />
              </div>
            </Section>

            {/* Receiver Details */}
            <Section title="Receiver Details">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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

            {/* Parcel Details */}
            <Section title="Parcel Details">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
                  value={`${selectedShipment.length}x${selectedShipment.width}x${selectedShipment.height} cm`}
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
                  label="Insurance Required"
                  value={selectedShipment.insurance_required ? "Yes" : "No"}
                />
                <InfoItem
                  label="Signature Required"
                  value={selectedShipment.signature_required ? "Yes" : "No"}
                />
                <InfoItem
                  label="Service Type"
                  value={getServiceTypeName(selectedShipment.service_type)}
                />
                <InfoItem
                  label="City"
                  value={getCityName(selectedShipment.city)}
                />
              </div>
            </Section>

            {/* Charges Breakdown */}
            <Section title="Charges Breakdown">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <InfoItem
                  label="Regulation Charges"
                  value={selectedShipment.total_additional_charges}
                />
                <InfoItem
                  label="Per KG Rate"
                  value={selectedShipment.per_kg_rate}
                />
                <InfoItem
                  label="Weight Charge"
                  value={selectedShipment.weight_charge}
                />
                {/* <InfoItem
                  label="Service Charge"
                  value={selectedShipment.service_charge}
                /> */}
                <InfoItem
                  label="Additional Charges"
                  value={selectedShipment.total_additional_charges}
                />
                <div className="p-4 border rounded-lg bg-gray-50">
                  <div className="text-xs uppercase font-medium text-gray-500">
                    Total Cost
                  </div>
                  <div className="mt-1 text-lg font-bold text-gray-800">
                    {selectedShipment.total_cost}
                  </div>
                </div>
              </div>
            </Section>

            {/* Tracking History as a Timeline */}
            {selectedShipment.tracking_history &&
              selectedShipment.tracking_history.length > 0 && (
                <Section title="Tracking History">
                  <div className="relative border-l-2 border-gray-200 pl-4">
                    {selectedShipment.tracking_history.map(
                      (history: any, index: number) => (
                        <TimelineItem key={index} history={history} />
                      )
                    )}
                  </div>
                </Section>
              )}

            {/* Notes */}
            {selectedShipment.notes && (
              <Section title="Notes">
                <div className="p-4 border rounded-lg bg-gray-50">
                  <div className="text-sm text-gray-700">
                    {selectedShipment.notes}
                  </div>
                </div>
              </Section>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ShipmentDetailsDialog;
