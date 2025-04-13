import {
  Buy4MeItem,
  Buy4MeRequest,
  Country,
  ServiceType,
} from "@/lib/types/index";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./use-auth";

export function useBuy4Me() {
  const { user } = useAuth();
  const [activeRequest, setActiveRequest] = useState<Buy4MeRequest | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const initializeRequest = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");

      // Fetch existing requests
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/buy4me/active-request/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch requests");

      const data = await response.json();
      console.log("Data", data);

      setActiveRequest(data);
      localStorage.setItem("activeRequest", JSON.stringify(data));
    } catch (error) {
      console.error("Error initializing request:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize the active request on mount
  useEffect(() => {
    initializeRequest();
  }, [user]);

  const addToRequestList = useCallback(
    async (product: Omit<Buy4MeItem, "id" | "total_price" | "created_at">) => {
      if (!user || !activeRequest) throw new Error("No active request");

      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/buy4me/requests/${activeRequest.id}/items/`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(product),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to add item to request");
        }

        const newItem = await response.json();

        // Update active request with new item
        setActiveRequest((prev) =>
          prev
            ? {
                ...prev,
                items: [...(prev.items || []), newItem],
              }
            : null
        );

        return newItem;
      } catch (error) {
        console.error("Error adding item:", error);
        throw error;
      }
    },
    [user, activeRequest]
  );

  const updateItem = useCallback(
    async (itemId: string, updates: Partial<Buy4MeItem>) => {
      if (!user || !activeRequest) throw new Error("No active request");

      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/buy4me/requests/${activeRequest.id}/items/${itemId}/`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updates),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update item");
        }

        const updatedItem = await response.json();

        // Update active request with updated item
        setActiveRequest((prev) =>
          prev
            ? {
                ...prev,
                items: (prev.items || []).map((item) =>
                  item.id === itemId ? updatedItem : item
                ),
              }
            : null
        );

        return updatedItem;
      } catch (error) {
        console.error("Error updating item:", error);
        throw error;
      }
    },
    [user, activeRequest]
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      if (!user || !activeRequest) throw new Error("No active request");

      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/buy4me/requests/${activeRequest.id}/items/${itemId}/`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to remove item");
        }

        // Update active request without removed item
        setActiveRequest((prev) =>
          prev
            ? {
                ...prev,
                items: (prev.items || []).filter((item) => item.id !== itemId),
              }
            : null
        );
      } catch (error) {
        console.error("Error removing item:", error);
        throw error;
      }
    },
    [user, activeRequest]
  );

  const calculateTotals = useCallback(() => {
    if (!activeRequest) return { productsTotal: 0, shipping: 0, total: 0 };

    const items = activeRequest.items || [];
    const productsTotal = items.reduce(
      (sum, item) => sum + parseFloat(item.unit_price) * item.quantity,
      0
    );

    // No service fee as per the new requirements
    const shipping = 0;

    return {
      productsTotal,
      shipping,
      total: productsTotal + shipping,
    };
  }, [activeRequest]);

  const submitRequest = async (
    shippingAddress: string,
    notes: string,
    payment_status: string
  ) => {
    try {
      const token = localStorage.getItem("auth_token");

      // Always get the latest activeRequest from localStorage to ensure we have the data
      // This is important for PayStack flow where state might be lost
      const storedActiveRequest = JSON.parse(
        localStorage.getItem("activeRequest") || "{}"
      );
      console.log("Active Request for submission:", storedActiveRequest);

      if (!storedActiveRequest || !storedActiveRequest.id) {
        throw new Error("No active request found");
      }

      if (!(storedActiveRequest.items || []).length) {
        throw new Error("No items in request");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/buy4me/requests/${storedActiveRequest.id}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            shipping_address: shippingAddress,
            notes: notes,
            status: "SUBMITTED",
            payment_status: payment_status,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit request");
      }

      const submittedRequest = await response.json();
      localStorage.removeItem("activeRequest");
      setActiveRequest(null); // Clear active request after submission
      return submittedRequest;
    } catch (error) {
      console.error("Error submitting request:", error);
      throw error;
    }
  };

  //get all countires
  const getUserCountries = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/accounts/user-countries/`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      return data.results as Country[];
    } catch (error) {
      console.error("Error fetching user countries:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getServiceTypes = useCallback(async () => {
    const token = localStorage.getItem("auth_token");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/shipping-rates/service-types/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch service types");
    const data = await response.json();
    return data.results as ServiceType[];
  }, []);

  const getSupportedStores = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/accounts/stores/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch supported stores");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching supported stores:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCurrencies = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/shipping-rates/currencies/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch supported stores");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching supported stores:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    activeRequest,
    loading,
    addToRequestList,
    updateItem,
    removeItem,
    calculateTotals,
    submitRequest,
    getUserCountries,
    getServiceTypes,
    getSupportedStores,
    getCurrencies,
  };
}
