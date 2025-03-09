import { api } from "@/lib/api";
import type {
  Buy4MeStatusUpdate,
  DriverDashboardResponse,
  DriverEarningsResponse,
  DriverShipmentResponse,
  ShipmentStatusUpdate,
  WithdrawalRequest,
} from "@/lib/types/driver";

export const DRIVER_API = {
  // Dashboard
  getDashboard: async (): Promise<DriverDashboardResponse> => {
    try {
      const response = await api.get("/accounts/driver/dashboard/");
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch driver dashboard data");
    }
  },

  // Shipments
  getShipments: async (params?: {
    status?: string;
    active_only?: boolean;
  }): Promise<DriverShipmentResponse[]> => {
    try {
      const response = await api.get("/accounts/driver/shipments/", {
        params,
      });
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch driver shipments");
    }
  },

  // Buy4Me Orders
  getBuy4meOrders: async (params?: {
    status?: string;
    active_only?: boolean;
  }): Promise<DriverShipmentResponse[]> => {
    try {
      const response = await api.get("/accounts/driver/buy4me/", { params });
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch Buy4me orders");
    }
  },

  // Update Shipment Status
  updateShipmentStatus: async (
    shipmentId: string,
    data: ShipmentStatusUpdate
  ): Promise<void> => {
    try {
      await api.post(`/accounts/driver/shipments/${shipmentId}/update/`, data);
    } catch (error) {
      throw new Error("Failed to update shipment status");
    }
  },

  // Update Buy4Me Status
  updateBuy4meStatus: async (
    requestId: string,
    data: Buy4MeStatusUpdate
  ): Promise<void> => {
    try {
      await api.post(`/accounts/driver/buy4me/${requestId}/update/`, data);
    } catch (error) {
      throw new Error("Failed to update Buy4me status");
    }
  },

  // Earnings
  getEarnings: async (params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<DriverEarningsResponse> => {
    try {
      const response = await api.get("/accounts/driver/earnings/", { params });
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch earnings data");
    }
  },

  // Withdraw Funds
  withdrawFunds: async (data: WithdrawalRequest): Promise<void> => {
    try {
      await api.post("/accounts/driver/withdraw/", data);
    } catch (error) {
      throw new Error("Failed to process withdrawal request");
    }
  },

  // Get Payment History
  getPaymentHistory: async (): Promise<any> => {
    try {
      const response = await api.get("/accounts/driver/payments/history/");
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch payment history");
    }
  },

  // Get Payment Stats
  getPaymentStats: async (): Promise<any> => {
    try {
      const response = await api.get("/accounts/driver/payments/stats/");
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch payment statistics");
    }
  },
};
