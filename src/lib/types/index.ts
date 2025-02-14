export interface NavItem {
  title: string;
  href: string;
  description?: string;
}

export interface Service {
  title: string;
  description: string;
  icon: string;
  link: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
}

export interface CounterStat {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
}

export interface ShippingRate {
  weightBand: string;
  economy: number;
  regular: number;
}

export interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    country: string;
    user_type: string;
    [key: string]: any; // For dynamic properties
  }
  
  export interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string, country: string, user_type: string) => Promise<void>;
    logout: () => void;
  }

export type Buy4MeRequestStatus = 
  | 'DRAFT' 
  | 'SUBMITTED' 
  | 'ORDER_PLACED' 
  | 'IN_TRANSIT' 
  | 'WAREHOUSE_ARRIVED' 
  | 'SHIPPED_TO_CUSTOMER' 
  | 'COMPLETED';

export interface Buy4MeItem {
  id?: string;
  product_name: string;
  product_url: string;
  quantity: number;
  unit_price: string;
  currency: string;
  color?: string;
  size?: string;
  notes?: string;
  total_price?: string;
  created_at?: string;
}

export interface Buy4MeRequest {
  id: string;
  user: string;
  status: Buy4MeRequestStatus;
  total_cost: string;
  shipping_address: string;
  notes?: string;
  items: Buy4MeItem[];
  created_at: string;
  updated_at: string;
}

export interface PaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'succeeded' | 'canceled';
  payment_method_types: string[];
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}