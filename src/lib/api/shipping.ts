"use client";

import { ShipmentRequest } from "../types/shipping";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://dev.ukcallcanter.com/api";

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface TrackingResponse {
  tracking_number: string;
  status: string;
  current_location: string;
  estimated_delivery: string | null;
  shipment_details: {
    origin: {
      name: string;
      country: string;
    };
    destination: {
      name: string;
      country: string;
    };
    service: string;
    package: {
      weight: number;
      dimensions: {
        length: number;
        width: number;
        height: number;
      };
    };
  };
  tracking_history: {
    status: string;
    location: string;
    timestamp: string;
    description: string;
  }[];
}

export class ShippingAPI {
  private static getHeaders() {
    const token = localStorage.getItem("auth_token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  static async createShipment(data: ShipmentRequest) {
    try {
      const response = await fetch(`${API_BASE_URL}/shipments/`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to create shipment");
      }

      return response.json();
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("Failed to create shipment");
    }
  }

  static async updateShipment(id: string, data: ShipmentRequest) {
    try {
      const response = await fetch(`${API_BASE_URL}/shipments/${id}/`, {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to update shipment");
      }

      return response.json();
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("Failed to update shipment");
    }
  }

  static async getShipments(
    params: {
      page?: number;
      status?: string;
      search?: string;
    } = {}
  ) {
    try {
      const query = new URLSearchParams();
      if (params.page) query.append("page", params.page.toString());
      if (params.status) query.append("status", params.status);
      if (params.search) query.append("search", params.search);

      const response = await fetch(`${API_BASE_URL}/shipments/${query}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch shipments");
      }

      return response.json();
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("Failed to fetch shipments");
    }
  }

  static async getShipmentDetails(id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/shipments/${id}/`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch shipment details");
      }

      return response.json();
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("Failed to fetch shipment details");
    }
  }

  static async trackShipment(
    trackingNumber: string
  ): Promise<TrackingResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/shipments/track/${trackingNumber}/`,
        { headers: { "Content-Type": "application/json" } }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to track shipment");
      }

      return response.json();
    } catch (error) {
      console.error("Tracking error:", error);
      throw error instanceof Error
        ? error
        : new Error("Failed to track shipment");
    }
  }

  static async calculateRate(data: {
    origin_country: string;
    destination_country: string;
    weight: number;
    length: number;
    width: number;
    height: number;
    service_type: string;
    declared_value?: number;
    insurance_required?: boolean;
  }) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/shipping-rates/calculate/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to calculate shipping rate");
      }

      return response.json();
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("Failed to calculate shipping rate");
    }
  }

  static async createSupportTicket(data: {
    subject: string;
    category: string;
    message: string;
    shipment_id?: string;
  }) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/shipping/support/tickets/`,
        {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create support ticket");
      }

      return response.json();
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("Failed to create support ticket");
    }
  }

  static async updateShipmentStatus(id: string, status: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/shipments/${id}/status/`, {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update shipment status");
      }

      return response.json();
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("Failed to update shipment status");
    }
  }

  static async getShipmentStats() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/accounts/users/dashboard/`,
        {
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch shipment stats");
      }

      return response.json();
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("Failed to fetch shipment stats");
    }
  }
}
