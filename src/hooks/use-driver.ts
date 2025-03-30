import { DRIVER_API } from "@/lib/api/driver";
import type {
  BulkPaymentRequest,
  Buy4MeStatusUpdate,
  DriverDashboardResponse,
  DriverEarningsResponse,
  ShipmentStatusUpdate,
  WithdrawalRequest,
} from "@/lib/types/driver";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Dashboard Query
export const useDriverDashboard = () => {
  return useQuery<DriverDashboardResponse>({
    queryKey: ["driverDashboard"],
    queryFn: DRIVER_API.getDashboard,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

// Shipments Query
export const useDriverShipments = (params?: {
  status?: string;
  active_only?: boolean;
}) => {
  return useQuery<any>({
    queryKey: ["driverShipments", params],
    queryFn: () => DRIVER_API.getShipments(params),
  });
};

// Buy4Me Orders Query
export const useDriverBuy4meOrders = (params?: {
  status?: string;
  active_only?: boolean;
}) => {
  return useQuery<any>({
    queryKey: ["driverBuy4me", params],
    queryFn: () => DRIVER_API.getBuy4meOrders(params),
  });
};

// Update Shipment Status Mutation
export const useUpdateShipmentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      shipmentId,
      data,
    }: {
      shipmentId: string;
      data: ShipmentStatusUpdate;
    }) => DRIVER_API.updateShipmentStatus(shipmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driverShipments"] });
      queryClient.invalidateQueries({ queryKey: ["driverDashboard"] });
    },
  });
};

// Update Buy4Me Status Mutation
export const useUpdateBuy4meStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      data,
    }: {
      requestId: string;
      data: Buy4MeStatusUpdate;
    }) => DRIVER_API.updateBuy4meStatus(requestId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driverBuy4me"] });
      queryClient.invalidateQueries({ queryKey: ["driverDashboard"] });
    },
  });
};

// Earnings Query
export const useDriverEarnings = (params?: {
  start_date?: string;
  end_date?: string;
}) => {
  return useQuery<DriverEarningsResponse>({
    queryKey: ["driverEarnings", params],
    queryFn: () => DRIVER_API.getEarnings(params),
  });
};

// Withdraw Funds Mutation
export const useWithdrawFunds = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WithdrawalRequest) => DRIVER_API.withdrawFunds(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driverEarnings"] });
      queryClient.invalidateQueries({ queryKey: ["paymentHistory"] });
      queryClient.invalidateQueries({ queryKey: ["paymentStats"] });
    },
  });
};

// Payment History Query
export const usePaymentHistory = () => {
  return useQuery({
    queryKey: ["paymentHistory"],
    queryFn: DRIVER_API.getPaymentHistory,
  });
};

// Payment Stats Query
export const usePaymentStats = () => {
  return useQuery({
    queryKey: ["paymentStats"],
    queryFn: DRIVER_API.getPaymentStats,
  });
};

// Bulk Payment Processing Mutation
export const useBulkPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkPaymentRequest) =>
      DRIVER_API.processBulkPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driverShipments"] });
      queryClient.invalidateQueries({ queryKey: ["driverBuy4me"] });
      queryClient.invalidateQueries({ queryKey: ["driverDashboard"] });
      queryClient.invalidateQueries({ queryKey: ["driverEarnings"] });
    },
  });
};

// Shipment Details Query
export const useShipmentDetails = (shipmentId: string) => {
  return useQuery({
    queryKey: ["shipmentDetails", shipmentId],
    queryFn: () => DRIVER_API.getShipmentDetails(shipmentId),
    enabled: !!shipmentId,
  });
};

// Buy4Me Order Details Query
export const useBuy4meOrderDetails = (orderId: string) => {
  return useQuery({
    queryKey: ["buy4meOrderDetails", orderId],
    queryFn: () => DRIVER_API.getBuy4meOrderDetails(orderId),
    enabled: !!orderId,
  });
};
