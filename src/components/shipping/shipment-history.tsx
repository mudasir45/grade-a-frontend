"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { ShippingAPI } from "@/lib/api/shipping";
import { NewShipmentResponse } from "@/lib/types/shipping";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Download, Eye, Filter, Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { TrackingDialog } from "./tracking-dialog";
import { getStatusBadge, ShipmentProps } from "../staff/manage-shipment";
import ShipmentDetailsDialog from "../ui/shipment-details";

export function ShipmentHistory() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState<ShipmentProps[]>([]);
  const [selectedShipment, setSelectedShipment] =
    useState<ShipmentProps | null>(null);
  const [trackingDialog, setTrackingDialog] = useState<{
    open: boolean;
    trackingNumber: string;
  }>({
    open: false,
    trackingNumber: "",
  });

  // Fetch shipments on component mount
  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      const response = await ShippingAPI.getShipments();
      setShipments(response);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch shipments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredShipments = shipments.filter(
    (shipment) =>
      shipment.tracking_number
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      shipment.current_location
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      shipment.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.payment_status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "DELIVERED":
        return "bg-green-500";
      case "IN_TRANSIT":
        return "bg-blue-500";
      case "PROCESSING":
        return "bg-yellow-500";
      case "PENDING":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PAID":
        return "bg-green-500";
      case "PENDING":
        return "bg-orange-500";
      case "FAILED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const downloadHistory = () => {
    // Generate CSV data
    const headers = [
      "Shipment ID",
      "Date",
      "Tracking Number",
      "Status",
      "Payment Status",
      "Location",
      "Cost",
    ];
    const rows = filteredShipments.map((shipment) => [
      shipment.id,
      formatDate(shipment.created_at),
      shipment.tracking_number,
      shipment.status,
      shipment.payment_status,
      shipment.current_location || "Not available",
      formatCurrency(Number(shipment.total_cost)),
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\n"
    );

    // Create and trigger download
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `shipment_history_${formatDate(new Date().toISOString())}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Shipment History</CardTitle>
              <CardDescription>
                View and manage your past shipments
              </CardDescription>
            </div>
            <Button
              onClick={downloadHistory}
              disabled={filteredShipments.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Download History
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by tracking number, location, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shipment ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Tracking Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShipments.map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell className="font-medium">{shipment.id}</TableCell>
                    <TableCell>{formatDate(shipment.created_at)}</TableCell>
                    <TableCell>{shipment.tracking_number}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div
                          className={`h-2 w-2 rounded-full mr-2 ${getStatusColor(
                            shipment.status
                          )}`}
                        />
                        <span>{shipment.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div
                          className={`h-2 w-2 rounded-full mr-2 ${getPaymentStatusColor(
                            shipment.payment_status
                          )}`}
                        />
                        <span>{shipment.payment_status}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {shipment.current_location || "Not available"}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(Number(shipment.total_cost))}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedShipment(shipment);
                          setTrackingDialog({
                            open: true,
                            trackingNumber: shipment.tracking_number,
                          });
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredShipments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No shipments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ShipmentDetailsDialog
        viewDialogOpen={trackingDialog.open}
        setViewDialogOpen={() =>
          setTrackingDialog({ open: false, trackingNumber: "" })
        }
        selectedShipment={selectedShipment}
        getStatusBadge={getStatusBadge}
      />
    </div>
  );
}
