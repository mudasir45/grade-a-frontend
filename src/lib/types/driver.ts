export interface DriverProfile {
  id: string;
  user: {
    email: string;
    username: string;
  };
  vehicle_type: string;
  is_active: boolean;
  commission_rate: number;
  total_deliveries: number;
  total_earnings: number;
}

export interface RecentCommission {
  id: string;
  delivery_type: "SHIPMENT" | "BUY4ME";
  amount: number;
  earned_at: string;
  description: string;
}

export interface DriverDashboardResponse {
  driver_profile: DriverProfile;
  pending_deliveries: {
    shipments: number;
    buy4me: number;
    total: number;
  };
  earnings_today: number;
  recent_commissions: RecentCommission[];
}

export interface DriverShipmentResponse {
  id: string;
  tracking_number: string;
  status: ShipmentStatus;
  current_location: string;
  estimated_delivery?: string;
  pickup_address: string;
  delivery_address: string;
  customer_name: string;
  customer_phone: string;
  amount: number;
  commission: number;
  created_at: string;
  type: "delivery" | "buy4me";
}

export type ShipmentStatus =
  | "PENDING"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "FAILED"
  | "SHOPPING"
  | "PURCHASED"
  | "DELIVERING"
  | "COMPLETED";

export interface ShipmentStatusUpdate {
  status_location_id: number;
  custom_description?: string;
}

export interface DriverEarningsResponse {
  total_earnings: number;
  shipment_earnings: number;
  buy4me_earnings: number;
  commissions: RecentCommission[];
}

export interface WithdrawalRequest {
  amount: number;
  payment_method: "bank_transfer" | "mobile_money";
  account_number?: string;
  account_name?: string;
  bank_code?: string;
  mobile_number?: string;
  mobile_provider?: string;
}

export interface PaymentHistoryItem {
  id: string;
  amount: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  payment_method: string;
  reference: string;
  created_at: string;
}

export interface PaymentStats {
  totalEarnings: number;
  pendingPayments: number;
  lastPaymentAmount: number;
  lastPaymentDate: string;
}
