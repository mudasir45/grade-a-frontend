import { City } from ".";

export interface Shipment {
  id: string;
  tracking_number: string;
  status: ShipmentStatus;
  sender_name: string;
  sender_email: string;
  sender_phone: string;
  sender_address: string;
  sender_country: string;
  recipient_name: string;
  recipient_email: string;
  recipient_phone: string;
  recipient_address: string;
  recipient_country: string;
  package_type: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  description: string;
  declared_value: number;
  service_type: "economy" | "standard" | "express";
  insurance_required: boolean;
  signature_required: boolean;
  shipping_cost: number;
  created_at: string;
  updated_at: string;
  payment_status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED" | "CANCELLED";
}

export interface ShipmentRequest {
  id?: string;
  sender_name: string;
  sender_email: string;
  sender_phone: string;
  sender_address: string;
  sender_country: string;
  recipient_name: string;
  recipient_email: string;
  recipient_phone: string;
  recipient_address: string;
  recipient_country: string;
  package_type: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  description: string;
  declared_value: number;
  service_type: string;
  city: string;
  additional_charges?: Extras[];
  notes?: string;
  payment_method?: "ONLINE" | "COD";
  payment_details?: {
    card?: {
      number: string;
      expiry_month: string;
      expiry_year: string;
      cvv: string;
      holder_name: string;
    };
    bank_transfer?: {
      account_name: string;
      account_number: string;
      bank_code: string;
    };
    wallet?: {
      wallet_type: string;
      token: string;
    };
  };
}

// export interface ShipmentRequest {
//   sender_name: string;
//   sender_email: string;
//   sender_phone: string;
//   sender_address: string;
//   sender_country: string;
//   recipient_name: string;
//   recipient_email: string;
//   recipient_phone: string;
//   recipient_address: string;
//   recipient_country: string;
//   package_type: string;
// }

export type ShipmentStatus =
  | "PENDING" // Initial state when created
  | "PROCESSING" // Being processed at facility
  | "IN_TRANSIT" // In transit to destination
  | "DELIVERED" // Successfully delivered
  | "CANCELLED"; // Cancelled by user/admin

export interface TrackingUpdate {
  timestamp: string;
  location: string;
  status: string;
  description: string;
}

// export interface ShippingRate {
//   base_rate: number
//   weight_charge: number
//   dimensional_charge: number
//   zone_charge: number
//   service_charge: number
//   insurance_charge: number
//   fuel_surcharge: number
//   total: number
//   currency: string
// }

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  message: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  created_at: string;
  updated_at: string;
}

interface Route {
  origin: Location;
  destination: Location;
  zone: Zone;
}

interface Location {
  id: string;
  name: string;
  code: string;
}

interface Zone {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
  delivery_time: string;
  price: number;
}

interface Dimensions {
  length: number;
  width: number;
  height: number;
  volume: number;
}

interface WeightCalculation {
  dimensions: Dimensions;
  actual_weight: number;
}

interface RateDetails {
  base_rate: number;
  per_kg_rate: number;
  weight_charge: number;
}

interface AdditionalCharge {
  name: string;
  type: string;
  value: number;
  amount: number;
  description: string;
}

interface RateDetails {
  per_kg_rate: number;
  weight_charge: number;
}

interface CostBreakdown {
  weight_charge: number;
  service_price: number;
  city_delivery_charge: number;
  additional_charges: AdditionalCharge[];
  extras: Extras[];
  total_cost: number;
  extras_total: number;
}

export interface ShippingRate {
  route: Route;
  service: Service;
  weight: {
    actual: number;
    volumetric: number;
    chargeable: number;
  };
  rate_details: RateDetails;
  cost_breakdown: CostBreakdown;
}

export interface Address {
  name: string;
  email: string;
  phone: string;
  address: string;
  country: string;
}

export type PaymentStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "REFUNDED"
  | "CANCELLED";

export interface ShipmentResponse {
  id: string;
  tracking_number: string;
  status: ShipmentStatus;
  current_location: string;
  estimated_delivery?: string;
  sender: Address;
  recipient: Address;
  package: {
    type: string;
    weight: number;
    dimensions: Dimensions;
    description: string;
    declared_value: number;
  };
  service: {
    type: string;
    insurance_required: boolean;
    signature_required: boolean;
  };
  costs: {
    base_rate: number;
    per_kg_rate: number;
    weight_charge: number;
    service_charge: number;
    total_additional_charges: number;
    total_cost: number;
  };
  payment: {
    id: string;
    status: PaymentStatus;
    amount: number;
    currency: string;
    method: string;
  };
  tracking_history: TrackingUpdate[];
  payment_status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

export interface NewShipmentResponse {
  id: string;
  tracking_number: string;
  user: string;
  cod_amount: string;
  payment_method: string;
  payment_status: PaymentStatus;
  payment_date: string;
  transaction_id: string;
  receipt?: string;
  sender_name: string;
  sender_email: string;
  sender_phone: string;
  sender_address: string;
  sender_country: string;
  recipient_name: string;
  recipient_email: string;
  recipient_phone: string;
  recipient_address: string;
  recipient_country: string;
  package_type: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  description: string;
  declared_value: string;
  insurance_required: boolean;
  signature_required: boolean;
  current_location: string;
  estimated_delivery?: string | null;
  status: ShipmentStatus;
  base_rate: string;
  per_kg_rate: string;
  weight_charge: string;
  service_charge: string;
  total_additional_charges: string;
  total_cost: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  staff?: string | null;
  service_type: string;
  city: City;
  extras: Extras[];
  delivery_charge: string;
}

export interface Extras {
  id: string;
  name: string;
  charge_type: string;
  value: number;
  quantity?: number;
}
