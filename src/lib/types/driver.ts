export interface DriverProfile {
  id: string;
  user: string;
  user_details: {
    id: string;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    address: string;
    user_type: string;
    is_verified: boolean;
    country: number;
    preferred_currency: string;
    date_joined: string;
    country_details?: {
      id: number;
      name: string;
      code: string;
    };
    default_shipping_method?: string;
  };
  vehicle_type: string;
  license_number: string;
  is_active: boolean;
  commission_rate: number;
  total_earnings: number;
  total_deliveries: number;
  created_at: string;
  updated_at: string;
}

export interface RecentCommission {
  id: string;
  driver: string;
  driver_details?: string;
  delivery_type: "SHIPMENT" | "BUY4ME";
  reference_id?: string;
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

export interface Buy4MeStatusUpdate {
  status: string;
  notes?: string;
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

export interface BulkPaymentRequest {
  payment_for: "SHIPMENT" | "BUY4ME";
  request_ids: string[];
}

export interface BulkPaymentResponse {
  message: string;
  payments_created: number;
  total_amount: number;
  failed_requests: Array<{
    id: string;
    reason: string;
  }>;
}
