import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React from "react";
import { X } from "react-feather";
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
  getStatusBadge: (status: string) => React.ReactNode;
}

// Reusable section component
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="mb-8">
    <h3 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
      {title}
    </h3>
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
    <div className="mt-1 text-lg font-semibold text-gray-700">{value}</div>
  </div>
);

// Tracking Timeline Item component
const TimelineItem: React.FC<{ history: TrackingHistory }> = ({ history }) => (
  <div className="relative pl-8 pb-8">
    {/* Vertical line marker */}
    <div className="absolute top-0 left-0 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
    <div className="ml-4">
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-gray-800">
          {history.status}
        </span>
        <span className="text-sm text-gray-500">
          {new Date(history.timestamp).toLocaleString()}
        </span>
      </div>
      <div className="mt-1 text-sm text-gray-600">{history.location}</div>
      <p className="mt-2 text-gray-700">{history.description}</p>
    </div>
  </div>
);

const ShipmentDetailsDialog: React.FC<ShipmentDetailsDialogProps> = ({
  viewDialogOpen,
  setViewDialogOpen,
  selectedShipment,
  getStatusBadge,
}) => {
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
                  value={selectedShipment.sender_country}
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
                  value={selectedShipment.recipient_country}
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
                  value={selectedShipment.service_type}
                />
              </div>
            </Section>

            {/* Charges Breakdown */}
            <Section title="Charges Breakdown">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <InfoItem
                  label="Base Rate"
                  value={selectedShipment.base_rate}
                />
                <InfoItem
                  label="Per KG Rate"
                  value={selectedShipment.per_kg_rate}
                />
                <InfoItem
                  label="Weight Charge"
                  value={selectedShipment.weight_charge}
                />
                <InfoItem
                  label="Service Charge"
                  value={selectedShipment.service_charge}
                />
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
                    {selectedShipment.tracking_history.map((history, index) => (
                      <TimelineItem key={index} history={history} />
                    ))}
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
