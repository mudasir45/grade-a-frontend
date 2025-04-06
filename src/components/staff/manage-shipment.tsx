"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Extras } from "@/lib/types/shipping";
import { fetchCountries, getCountryNameById } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  CreditCard,
  Eye,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  RefreshCcw,
  Search,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import ShipmentDetailsDialog from "../ui/shipment-details";
import { GenerateMessageDialog } from "./generate-message-dialog";
import { ShipmentForm } from "./shipment-form";
import { UpdateStatusDialog } from "./update-status-dialog";
// Update the imports and add interface for shipment type
export interface ShipmentProps {
  id: string;
  user: string;
  user_id?: string;
  cod_amount: string;
  payment_method: string;
  payment_status: string;
  payment_date: string | null;
  transaction_id: string;
  receipt: string;
  sender_name: string;
  sender_email: string;
  sender_phone: string;
  sender_address: string;
  sender_country: string;
  recipient_name: string;
  recipient_email: string;
  recipient_phone: string;
  recipient_address: string;
  recipient_country: string;
  package_type: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  description: string;
  declared_value: string;
  insurance_required: boolean;
  signature_required: boolean;
  tracking_number: string;
  current_location: string;
  tracking_history: {
    status: string;
    location: string;
    timestamp: string;
    description: string;
  }[];
  estimated_delivery: string | null;
  status: string;
  base_rate: string;
  per_kg_rate: string;
  weight_charge: string;
  service_charge: string;
  extras_charges: string;
  delivery_charge: string;
  total_additional_charges: string;
  total_cost: string;
  notes: string;
  created_at: string;
  updated_at: string;
  staff: string;
  service_type: string;
  city: string;
  extras: Extras[];
  additional_charges: Extras[];
}

interface ManageShipmentProps {
  //   shipments: ShipmentProps[];
  user: any;
  setTotal: React.Dispatch<
    React.SetStateAction<{
      pending: number;
      cancelled: number;
      processing: number;
      delivered: number;
    }>
  >;
}

export function ManageShipment({ user, setTotal }: ManageShipmentProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] =
    useState<ShipmentProps | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [shipments, setShipments] = useState<ShipmentProps[]>([]);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
  const [countries, setCountries] = useState<any[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Sorting state
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const token = localStorage.getItem("auth_token");
  const router = useRouter();
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [paymentStatusDialogOpen, setPaymentStatusDialogOpen] = useState(false);

  // Fetch countries data
  useEffect(() => {
    const loadCountries = async () => {
      const countriesData = await fetchCountries();
      setCountries(countriesData);
    };

    loadCountries();
  }, []);

  // Get all available statuses for filtering
  const fetchAvailableStatuses = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/shipments/status-types/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch status types");
      }

      const data = await response.json();
      setAvailableStatuses(data.map((status: any) => status.status_type));
    } catch (error) {
      console.error("Error fetching status types:", error);
    }
  };

  const getStaffShipments = async () => {
    if (user) {
      // Fetch shipments for the logged-in staff
      const token = localStorage.getItem("auth_token");
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/shipments/staff-shipments/${user.id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          setShipments(data);

          // Extract unique statuses from shipments for the filter
          const uniqueStatuses: string[] = Array.from(
            new Set(data.map((s: any) => s.status as string))
          );
          setAvailableStatuses(uniqueStatuses);

          setTotal({
            pending: data.filter((d: any) => d.status === "PENDING").length,
            cancelled: data.filter((d: any) => d.status === "CANCELLED").length,
            processing: data.filter((d: any) => d.status === "PROCESSING")
              .length,
            delivered: data.filter((d: any) => d.status === "DELIVERED").length,
          });

          // Calculate total pages
          setTotalPages(Math.ceil(data.length / pageSize));
        });
    }
  };

  useEffect(() => {
    getStaffShipments();
    fetchAvailableStatuses();
  }, []);

  // Update total pages when page size changes
  useEffect(() => {
    setTotalPages(Math.ceil(filteredShipments.length / pageSize));
    // Reset to first page when changing page size
    setCurrentPage(1);
  }, [pageSize, shipments, statusFilter, searchTerm]);

  // Enhanced search function to search across all relevant fields
  const matchesSearchTerm = (shipment: ShipmentProps) => {
    if (!searchTerm.trim()) return true;

    const searchLower = searchTerm.toLowerCase();

    // Search across all relevant fields
    return (
      shipment.tracking_number?.toLowerCase().includes(searchLower) ||
      shipment.sender_name?.toLowerCase().includes(searchLower) ||
      shipment.sender_email?.toLowerCase().includes(searchLower) ||
      shipment.sender_phone?.toLowerCase().includes(searchLower) ||
      shipment.sender_address?.toLowerCase().includes(searchLower) ||
      shipment.recipient_name?.toLowerCase().includes(searchLower) ||
      shipment.recipient_email?.toLowerCase().includes(searchLower) ||
      shipment.recipient_phone?.toLowerCase().includes(searchLower) ||
      shipment.recipient_address?.toLowerCase().includes(searchLower) ||
      shipment.description?.toLowerCase().includes(searchLower) ||
      shipment.total_cost?.toString().includes(searchLower) ||
      shipment.weight?.toString().includes(searchLower) ||
      shipment.notes?.toLowerCase().includes(searchLower)
    );
  };

  // Filter shipments based on search term and status filter
  const filteredShipments = shipments.filter((shipment) => {
    const matchesStatus =
      statusFilter === "all" || shipment.status === statusFilter;

    return matchesSearchTerm(shipment) && matchesStatus;
  });

  // Sort the filtered shipments
  const sortedShipments = React.useMemo(() => {
    if (!sortField) return filteredShipments;

    return [...filteredShipments].sort((a, b) => {
      const aValue = a[sortField as keyof ShipmentProps];
      const bValue = b[sortField as keyof ShipmentProps];

      if (aValue === bValue) return 0;

      // Handle string comparison
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Handle numeric comparison
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      // Default comparison (handles mixed types)
      const comparison = String(aValue).localeCompare(String(bValue));
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredShipments, sortField, sortDirection]);

  // Get paginated data
  const paginatedShipments = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedShipments.slice(startIndex, startIndex + pageSize);
  }, [sortedShipments, currentPage, pageSize]);

  // Function to handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, set to ascending by default
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Render sort indicator
  const renderSortIcon = (field: string) => {
    if (sortField !== field) return null;

    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline ml-1" />
    );
  };

  // Function to get the appropriate badge color based on status
  const getStatusBadge = (status: any) => {
    switch (status) {
      case "DELIVERED":
        return <Badge className="bg-green-500">{status}</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-500">{status}</Badge>;
      case "PROCESSING":
        return <Badge className="bg-blue-500">{status}</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-500">{status}</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  // Function to get the appropriate badge color for payment status
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-green-500">{status}</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-500">{status}</Badge>;
      case "COD_PENDING":
        return <Badge className="bg-blue-500">COD PENDING</Badge>;
      case "COD_PAID":
        return <Badge className="bg-green-500">COD PAID</Badge>;
      case "FAILED":
        return <Badge className="bg-red-500">{status}</Badge>;
      case "REFUNDED":
        return <Badge className="bg-purple-500">{status}</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  // Function to handle edit click
  const handleEditClick = (shipment: any) => {
    console.log("selected shipment", shipment);
    setSelectedShipment(shipment);
    setEditDialogOpen(true);
  };

  // Function to handle view click
  const handleViewClick = (shipment: any) => {
    setSelectedShipment(shipment);
    setViewDialogOpen(true);
  };
  // Function to handle view click
  const handleUpdateStatusClick = (shipment: any) => {
    setSelectedShipment(shipment);
    setStatusDialogOpen(true);
  };
  // Function to handle shipment update
  const handleShipmentUpdate = async (updatedData: ShipmentProps) => {
    const payload = {
      payment_method: updatedData.payment_method,
      sender_name: updatedData.sender_name,
      sender_email: updatedData.sender_email,
      sender_phone: updatedData.sender_phone,
      sender_address: updatedData.sender_address,
      recipient_name: updatedData.recipient_name,
      recipient_email: updatedData.recipient_email,
      recipient_phone: updatedData.recipient_phone,
      recipient_address: updatedData.recipient_address,
      package_type: updatedData.package_type,
      weight: updatedData.weight,
      length: updatedData.length,
      width: updatedData.width,
      height: updatedData.height,
      description: updatedData.description,
      payment_status: updatedData.payment_status,
      declared_value: updatedData.declared_value,
      service_charge: updatedData.service_charge,
      sender_country: updatedData.sender_country,
      recipient_country: updatedData.recipient_country,
      service_type: updatedData.service_type,
      city: updatedData.city,
      additional_charges: updatedData.additional_charges,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/shipments/staff-shipment/${updatedData.id}/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update shipment");
      }

      // Refresh the shipments list
      await getStaffShipments();

      // Close the edit dialog
      setEditDialogOpen(false);

      return true; // Return success
    } catch (error) {
      console.error("Error updating shipment:", error);
      return false; // Return failure
    }
  };

  // Function to handle delete click
  const handleDeleteClick = (shipment: ShipmentProps) => {
    setSelectedShipment(shipment);
    setDeleteDialogOpen(true);
  };

  // Function to handle shipment deletion
  const handleDeleteConfirm = async () => {
    if (!selectedShipment) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/shipments/staff-shipment/${selectedShipment.id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (!response.ok) {
        return toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
        // throw new Error("Failed to delete shipment");
      }

      toast({
        title: "Success",
        description: "Shipment deleted successfully",
      });

      setDeleteDialogOpen(false);
      // Refresh the shipments list after successful deletion
      await getStaffShipments();
    } catch (error) {
      console.error("Error deleting shipment:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete shipment",
        variant: "destructive",
      });
    }
  };

  // Function to handle message generation click
  const handleGenerateMessageClick = (shipment: ShipmentProps) => {
    setSelectedShipment(shipment);
    setMessageDialogOpen(true);
  };

  // Function to handle AWB generation
  const handleGenerateAWB = async (shipment: ShipmentProps) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/shipments/generate-awb/${shipment.id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate AWB");
      }

      const data = await response.json();

      // Open the AWB PDF in a new tab
      window.open(data.awb_url, "_blank");

      toast({
        title: "Success",
        description: "AWB generated successfully",
      });
    } catch (error) {
      console.error("Error generating AWB:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to generate AWB",
        variant: "destructive",
      });
    }
  };

  // Function to get country name by ID
  const getCountryName = (countryId: string) => {
    return getCountryNameById(countryId, countries);
  };

  // Function to format route with country names
  const formatRoute = (senderCountry: string, recipientCountry: string) => {
    const senderName = getCountryName(senderCountry);
    const recipientName = getCountryName(recipientCountry);
    return `${senderName} → ${recipientName}`;
  };

  // Function to handle update payment status click
  const handleUpdatePaymentStatusClick = (shipment: ShipmentProps) => {
    setSelectedShipment(shipment);
    setPaymentStatusDialogOpen(true);
  };

  // Function to update payment status
  const handlePaymentStatusUpdate = async (newStatus: string) => {
    if (!selectedShipment) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/shipments/staff-shipment/${selectedShipment.id}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ payment_status: newStatus }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update payment status");
      }

      toast({
        title: "Success",
        description: "Payment status updated successfully",
      });

      // Refresh the shipments list
      await getStaffShipments();

      // Close the dialog
      setPaymentStatusDialogOpen(false);
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update payment status",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-2xl font-semibold">
            Manage Shipments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search shipments..."
                className="pl-8 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {availableStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={pageSize.toString()}
              onValueChange={(value) => setPageSize(Number(value))}
            >
              <SelectTrigger className="w-full sm:w-[100px]">
                <SelectValue placeholder="Show" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="block lg:hidden space-y-4">
            {paginatedShipments.length > 0 ? (
              paginatedShipments.map((shipment) => (
                <Card key={shipment.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">
                      {shipment.tracking_number}
                    </div>
                    {getStatusBadge(shipment.status)}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-muted-foreground">Date:</div>
                      <div>
                        {new Date(shipment.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-muted-foreground">Sender:</div>
                      <div>{shipment.sender_name}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-muted-foreground">Receiver:</div>
                      <div>{shipment.recipient_name}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-muted-foreground">Route:</div>
                      <div>
                        {formatRoute(
                          shipment.sender_country,
                          shipment.recipient_country
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-muted-foreground">Amount:</div>
                      <div>{shipment.total_cost}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-muted-foreground">
                        Payment Status:
                      </div>
                      <div>
                        {getPaymentStatusBadge(shipment.payment_status)}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="flex items-center gap-2"
                          onClick={() => handleGenerateAWB(shipment)}
                        >
                          <RefreshCcw className="h-4 w-4" />
                          Generate AWB
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2"
                          onClick={() =>
                            window.open(
                              `${process.env.NEXT_PUBLIC_SERVER_URL}${shipment.receipt}`,
                              "_blank"
                            )
                          }
                        >
                          <RefreshCcw className="h-4 w-4" />
                          Download Receipt
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2"
                          onClick={() => handleUpdateStatusClick(shipment)}
                        >
                          <RefreshCcw className="h-4 w-4" />
                          Update Status
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2"
                          onClick={() => handleViewClick(shipment)}
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2"
                          onClick={() => handleEditClick(shipment)}
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 text-destructive"
                          onClick={() => handleDeleteClick(shipment)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2"
                          onClick={() => handleGenerateMessageClick(shipment)}
                        >
                          <MessageSquare className="h-4 w-4" />
                          Generate Message
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2"
                          onClick={() =>
                            handleUpdatePaymentStatusClick(shipment)
                          }
                        >
                          <CreditCard className="h-4 w-4" />
                          Update Payment Status
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No shipments found.
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    onClick={() => handleSort("tracking_number")}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    Tracking # {renderSortIcon("tracking_number")}
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("created_at")}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    Date {renderSortIcon("created_at")}
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("sender_name")}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    Sender {renderSortIcon("sender_name")}
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("recipient_name")}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    Receiver {renderSortIcon("recipient_name")}
                  </TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead
                    onClick={() => handleSort("weight")}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    Weight {renderSortIcon("weight")}
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("total_cost")}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    Amount {renderSortIcon("total_cost")}
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("status")}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    Status {renderSortIcon("status")}
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("payment_status")}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    Payment Status {renderSortIcon("payment_status")}
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedShipments.length > 0 ? (
                  paginatedShipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell className="font-medium">
                        {shipment.tracking_number}
                      </TableCell>
                      <TableCell>
                        {new Date(shipment.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{shipment.sender_name}</TableCell>
                      <TableCell>{shipment.recipient_name}</TableCell>
                      <TableCell>
                        {formatRoute(
                          shipment.sender_country,
                          shipment.recipient_country
                        )}
                      </TableCell>
                      <TableCell>{shipment.weight} kg</TableCell>
                      <TableCell>{shipment.total_cost}</TableCell>
                      <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                      <TableCell>
                        {getPaymentStatusBadge(shipment.payment_status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="flex items-center gap-2"
                              onClick={() => handleGenerateAWB(shipment)}
                            >
                              <RefreshCcw className="h-4 w-4" />
                              Generate AWB
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex items-center gap-2"
                              onClick={() =>
                                window.open(
                                  `${process.env.NEXT_PUBLIC_SERVER_URL}${shipment.receipt}`,
                                  "_blank"
                                )
                              }
                            >
                              <RefreshCcw className="h-4 w-4" />
                              Download Receipt
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex items-center gap-2"
                              onClick={() => handleUpdateStatusClick(shipment)}
                            >
                              <RefreshCcw className="h-4 w-4" />
                              Update Status
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex items-center gap-2"
                              onClick={() => handleViewClick(shipment)}
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex items-center gap-2"
                              onClick={() => handleEditClick(shipment)}
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex items-center gap-2 text-destructive"
                              onClick={() => handleDeleteClick(shipment)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex items-center gap-2"
                              onClick={() =>
                                handleGenerateMessageClick(shipment)
                              }
                            >
                              <MessageSquare className="h-4 w-4" />
                              Generate Message
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex items-center gap-2"
                              onClick={() =>
                                handleUpdatePaymentStatusClick(shipment)
                              }
                            >
                              <CreditCard className="h-4 w-4" />
                              Update Payment Status
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      No shipments found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
              Showing{" "}
              {paginatedShipments.length > 0
                ? (currentPage - 1) * pageSize + 1
                : 0}{" "}
              to {Math.min(currentPage * pageSize, filteredShipments.length)} of{" "}
              {filteredShipments.length} entries
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    className={
                      currentPage === 1
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  // Show limited page numbers to avoid crowding
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 &&
                      pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNumber)}
                          isActive={pageNumber === currentPage}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }

                  // Add ellipsis for skipped pages
                  if (
                    (pageNumber === currentPage - 2 && pageNumber > 1) ||
                    (pageNumber === currentPage + 2 && pageNumber < totalPages)
                  ) {
                    return (
                      <PaginationItem key={`ellipsis-${pageNumber}`}>
                        <span className="px-4">...</span>
                      </PaginationItem>
                    );
                  }

                  return null;
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    className={
                      currentPage === totalPages
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      {/* Add the Dialog for editing */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-3xl xl:max-w-4xl max-h-[100%] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex text-2xl font-semibold ">
              Update Shipment
            </DialogTitle>
          </DialogHeader>
          <ShipmentForm
            mode="edit"
            initialData={selectedShipment}
            onUpdate={handleShipmentUpdate}
          />
        </DialogContent>
      </Dialog>

      {/* Add the Dialog for updating status */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[100%] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex text-xl font-semibold ">
              Update Status
            </DialogTitle>
          </DialogHeader>
          <UpdateStatusDialog
            getStaffShipments={getStaffShipments}
            shipmentId={selectedShipment?.id}
            currentStatus={selectedShipment?.status}
            setStatusDialogOpen={setStatusDialogOpen}
          />
        </DialogContent>
      </Dialog>

      {/* Add the Dialog for viewing details */}

      <ShipmentDetailsDialog
        viewDialogOpen={viewDialogOpen}
        setViewDialogOpen={setViewDialogOpen}
        selectedShipment={selectedShipment}
        getStatusBadge={getStatusBadge}
      />

      {/* Add the Dialog for delete confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this shipment? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="mb-3 sm:mb-0"
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <GenerateMessageDialog
        isOpen={messageDialogOpen}
        onClose={() => setMessageDialogOpen(false)}
        shipmentId={selectedShipment?.id || ""}
        userId={selectedShipment?.user_id}
      />

      {/* Add the Dialog for updating payment status */}
      <Dialog
        open={paymentStatusDialogOpen}
        onOpenChange={setPaymentStatusDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Update Payment Status
            </DialogTitle>
            <DialogDescription>
              Change the payment status for shipment #
              {selectedShipment?.tracking_number}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="grid gap-2">
              <div className="mb-4">
                <span className="text-sm font-medium">Current Status: </span>
                <span className="ml-2">
                  {selectedShipment?.payment_status &&
                    getPaymentStatusBadge(selectedShipment.payment_status)}
                </span>
              </div>

              <div className="mb-2 font-medium">Regular Payment</div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <Button
                  variant={
                    selectedShipment?.payment_status === "PENDING"
                      ? "default"
                      : "outline"
                  }
                  className="w-full justify-start"
                  onClick={() => handlePaymentStatusUpdate("PENDING")}
                >
                  <CreditCard className="mr-2 h-4 w-4 text-yellow-500" />
                  <span>PENDING</span>
                </Button>
                <Button
                  variant={
                    selectedShipment?.payment_status === "PAID"
                      ? "default"
                      : "outline"
                  }
                  className="w-full justify-start"
                  onClick={() => handlePaymentStatusUpdate("PAID")}
                >
                  <CreditCard className="mr-2 h-4 w-4 text-green-500" />
                  <span>PAID</span>
                </Button>
              </div>

              <div className="mb-2 font-medium">Cash on Delivery</div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <Button
                  variant={
                    selectedShipment?.payment_status === "COD_PENDING"
                      ? "default"
                      : "outline"
                  }
                  className="w-full justify-start"
                  onClick={() => handlePaymentStatusUpdate("COD_PENDING")}
                >
                  <CreditCard className="mr-2 h-4 w-4 text-blue-500" />
                  <span>COD PENDING</span>
                </Button>
                <Button
                  variant={
                    selectedShipment?.payment_status === "COD_PAID"
                      ? "default"
                      : "outline"
                  }
                  className="w-full justify-start"
                  onClick={() => handlePaymentStatusUpdate("COD_PAID")}
                >
                  <CreditCard className="mr-2 h-4 w-4 text-green-500" />
                  <span>COD PAID</span>
                </Button>
              </div>

              <div className="mb-2 font-medium">Issues & Refunds</div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={
                    selectedShipment?.payment_status === "FAILED"
                      ? "default"
                      : "outline"
                  }
                  className="w-full justify-start"
                  onClick={() => handlePaymentStatusUpdate("FAILED")}
                >
                  <CreditCard className="mr-2 h-4 w-4 text-red-500" />
                  <span>FAILED</span>
                </Button>
                <Button
                  variant={
                    selectedShipment?.payment_status === "REFUNDED"
                      ? "default"
                      : "outline"
                  }
                  className="w-full justify-start"
                  onClick={() => handlePaymentStatusUpdate("REFUNDED")}
                >
                  <CreditCard className="mr-2 h-4 w-4 text-purple-500" />
                  <span>REFUNDED</span>
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setPaymentStatusDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
