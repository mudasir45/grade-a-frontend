"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useDriverBuy4meOrders,
  useUpdateBuy4meStatus,
} from "@/hooks/use-driver";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Clock,
  DollarSign,
  MapPin,
  Package,
  ShoppingBag,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Buy4MePage() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );
  const {
    data: orders,
    isLoading,
    error,
  } = useDriverBuy4meOrders({ status: statusFilter });
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const updateStatusMutation = useUpdateBuy4meStatus();

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !selectedStatus) return;

    try {
      await updateStatusMutation.mutateAsync({
        requestId: selectedOrder,
        data: {
          status: selectedStatus,
          notes: notes,
        },
      });

      toast.success("Buy4Me order status updated successfully");
      setIsDialogOpen(false);
      setSelectedOrder(null);
      setSelectedStatus("");
      setNotes("");
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const handleOpenStatusDialog = (orderId: string) => {
    setSelectedOrder(orderId);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <Buy4MeSkeleton />;
  }

  if (error || !orders) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Failed to load Buy4Me orders</p>
      </div>
    );
  }

  // Handle the paginated response structure
  const ordersData = Array.isArray(orders) ? orders : orders.results || [];

  const activeOrders = ordersData.filter((o: any) =>
    [
      "DRAFT",
      "PENDING",
      "ORDER_PLACED",
      "SHOPPING",
      "PURCHASED",
      "DELIVERING",
    ].includes(o.status)
  );

  const completedOrders = ordersData.filter((o: any) =>
    ["DELIVERED", "COMPLETED", "CANCELLED"].includes(o.status)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buy4Me Orders</h1>
          <p className="text-muted-foreground">
            Manage your assigned Buy4Me shopping and delivery orders
          </p>
        </div>
        <Select
          value={statusFilter || "all"}
          onValueChange={(value) =>
            setStatusFilter(value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="ORDER_PLACED">Order Placed</SelectItem>
            <SelectItem value="SHOPPING">Shopping</SelectItem>
            <SelectItem value="PURCHASED">Purchased</SelectItem>
            <SelectItem value="DELIVERING">Delivering</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Active ({activeOrders.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-40">
                <ShoppingBag className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  No active Buy4Me orders found
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeOrders.map((order: any) => (
                <Buy4MeCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={handleOpenStatusDialog}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-40">
                <ShoppingBag className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  No completed Buy4Me orders found
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedOrders.map((order: any) => (
                <Buy4MeCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={handleOpenStatusDialog}
                  isCompleted
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Select a new status for this Buy4Me order
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ORDER_PLACED">Order Placed</SelectItem>
                  <SelectItem value="SHOPPING">Shopping</SelectItem>
                  <SelectItem value="PURCHASED">Purchased</SelectItem>
                  <SelectItem value="DELIVERING">Delivering</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Textarea
                placeholder="Add notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setSelectedOrder(null);
                setSelectedStatus("");
                setNotes("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={!selectedStatus || updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface Buy4MeCardProps {
  order: any;
  onUpdateStatus: (id: string) => void;
  isCompleted?: boolean;
}

function Buy4MeCard({
  order,
  onUpdateStatus,
  isCompleted = false,
}: Buy4MeCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "ORDER_PLACED":
        return "bg-blue-100 text-blue-800";
      case "SHOPPING":
        return "bg-purple-100 text-purple-800";
      case "PURCHASED":
        return "bg-indigo-100 text-indigo-800";
      case "DELIVERING":
        return "bg-orange-100 text-orange-800";
      case "DELIVERED":
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ");
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{order.id}</CardTitle>
            <CardDescription>{formatDate(order.created_at)}</CardDescription>
          </div>
          <Badge className={getStatusColor(order.status)}>
            {formatStatus(order.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2">
          <User className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium">Customer</p>
            <p className="text-xs text-muted-foreground">{order.user}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-xs font-medium">Items</p>
            <p className="text-xs text-muted-foreground">
              {order.items?.length || 0} items to purchase
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-xs font-medium">Shipping Address</p>
            <p className="text-xs text-muted-foreground">
              {order.shipping_address}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-xs font-medium">Total Cost</p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(order.total_cost)}
            </p>
          </div>
        </div>
        {order.notes && (
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs font-medium">Notes</p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {order.notes}
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {!isCompleted && (
          <Button className="w-full" onClick={() => onUpdateStatus(order.id)}>
            Update Status
          </Button>
        )}
        {isCompleted && (
          <Button
            className="w-full"
            variant="outline"
            onClick={() => onUpdateStatus(order.id)}
          >
            View Details
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function Buy4MeSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-[180px]" />
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array(6)
              .fill(null)
              .map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24 mt-1" />
                      </div>
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Array(5)
                      .fill(null)
                      .map((_, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <Skeleton className="h-4 w-4 mt-0.5" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-full mt-1" />
                          </div>
                        </div>
                      ))}
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
