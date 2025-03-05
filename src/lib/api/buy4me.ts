import { Buy4MeRequest } from "../types/index";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://dev.ukcallcanter.com/api";

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface RequestListParams {
  page?: number;
  status?: string;
  search?: string;
}

export class Buy4MeAPI {
  private static getHeaders() {
    const token = localStorage.getItem("auth_token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  static async getRequests(
    params: RequestListParams = {}
  ): Promise<PaginatedResponse<Buy4MeRequest>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append("page", params.page.toString());
    if (params.status) searchParams.append("status", params.status);
    if (params.search) searchParams.append("search", params.search);

    const response = await fetch(
      `${API_BASE_URL}/buy4me/requests/?${searchParams.toString()}`,
      {
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch requests");
    }

    return response.json();
  }

  static async createRequest(data: {
    shipping_address: string;
    notes?: string;
    status: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/buy4me/requests/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to create request");
    }

    return response.json();
  }

  static async updateRequest(
    id: string,
    data: {
      shipping_address?: string;
      notes?: string;
      status?: string;
    }
  ) {
    const response = await fetch(`${API_BASE_URL}/buy4me/requests/${id}/`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to update request");
    }

    return response.json();
  }

  static async addItemToRequest(
    requestId: string,
    data: {
      product_name: string;
      product_url: string;
      quantity: number;
      unit_price: string;
      currency: string;
      color?: string;
      size?: string;
      notes?: string;
    }
  ) {
    const response = await fetch(
      `${API_BASE_URL}/buy4me/requests/${requestId}/items/`,
      {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to add item to request");
    }

    return response.json();
  }

  static async updateItem(
    requestId: string,
    itemId: string,
    data: {
      quantity?: number;
      color?: string;
      size?: string;
      notes?: string;
    }
  ) {
    const response = await fetch(
      `${API_BASE_URL}/buy4me/requests/${requestId}/items/${itemId}/`,
      {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update item");
    }

    return response.json();
  }

  static async removeItem(requestId: string, itemId: string) {
    const response = await fetch(
      `${API_BASE_URL}/buy4me/requests/${requestId}/items/${itemId}/`,
      {
        method: "DELETE",
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to remove item");
    }
  }

  static async updateRequestStatus(requestId: string, status: string) {
    const response = await fetch(
      `${API_BASE_URL}/buy4me/requests/${requestId}/update_status/`,
      {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify({ status }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update request status");
    }

    return response.json();
  }

  static async getOrders(params: {
    page?: number;
    status?: string;
    search?: string;
  }) {
    const response = await this.getRequests({
      ...params,
      status: params.status === "all" ? "" : params.status,
    });
    return response;
  }

  static async getOrderDetails(orderId: string) {
    const response = await fetch(`${API_BASE_URL}/buy4me/orders/${orderId}/`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch order details");
    }

    return response.json();
  }

  static async getBuy4meStats() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/accounts/users/buy4me_dashboard/`,
        {
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch buy4me stats");
      }
      return response.json();
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("Failed to fetch buy4me stats");
    }
  }
}
