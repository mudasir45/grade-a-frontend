import { api } from "@/lib/api";
import type {
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
      const response = await api.get("/driver/dashboard/");
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
      const response = await api.get("/driver/shipments/", { params });
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
      const response = await api.get("/driver/buy4me/", { params });
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
      await api.patch(`/driver/shipments/${shipmentId}/status/`, data);
    } catch (error) {
      throw new Error("Failed to update shipment status");
    }
  },

  // Update Buy4Me Status
  updateBuy4meStatus: async (
    requestId: string,
    data: ShipmentStatusUpdate
  ): Promise<void> => {
    try {
      await api.patch(`/driver/buy4me/${requestId}/status/`, data);
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
      const response = await api.get("/driver/earnings/", { params });
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch earnings data");
    }
  },

  // Withdraw Funds
  withdrawFunds: async (data: WithdrawalRequest): Promise<void> => {
    try {
      await api.post("/driver/withdraw/", data);
    } catch (error) {
      throw new Error("Failed to process withdrawal request");
    }
  },

  // Get Payment History
  getPaymentHistory: async (): Promise<any> => {
    try {
      const response = await api.get("/driver/payments/history/");
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch payment history");
    }
  },

  // Get Payment Stats
  getPaymentStats: async (): Promise<any> => {
    try {
      const response = await api.get("/driver/payments/stats/");
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch payment statistics");
    }
  },
};
