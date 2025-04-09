import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import SearchableSelect from "@/components/ui/searchable-select";
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
import { fetchCountries, getCountryNameById } from "@/lib/utils";
import { ChevronDown, ChevronUp, Eye, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import ShipmentDetailsDialog from "../ui/shipment-details";
import { ShipmentProps } from "./manage-shipment";

interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  user_type: string;
}

interface Shipment {
  id: string;
  tracking_number: string;
  sender_name: string;
  recipient_name: string;
  status: string;
  created_at: string;
  total_cost: string;
  current_location: string;
  tracking_history: {
    status: string;
    location: string;
    timestamp: string;
    description: string;
  }[];
  sender_country: string;
  recipient_country: string;
  weight: string;
  description?: string;
  notes?: string;
  sender_email?: string;
  sender_phone?: string;
  sender_address?: string;
  recipient_email?: string;
  recipient_phone?: string;
  recipient_address?: string;
}

export function UserShipments() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [countries, setCountries] = useState<any[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Sorting state
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Fetch countries data
  useEffect(() => {
    const loadCountries = async () => {
      const countriesData = await fetchCountries();
      setCountries(countriesData);
    };

    loadCountries();
  }, []);

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

  // Fetch associated users
  const fetchAssociatedUsers = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/accounts/staff-associated-users/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch associated users");
      }

      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch associated users",
        variant: "destructive",
      });
    }
  };

  // Fetch user shipments
  const fetchUserShipments = async (userId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/shipments/user-shipments/${userId}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user shipments");
      }

      const data = await response.json();
      setShipments(data);

      // Extract unique statuses from shipments for the filter
      const uniqueStatuses: string[] = Array.from(
        new Set(data.map((s: any) => s.status as string))
      );
      setAvailableStatuses(uniqueStatuses);

      // Calculate total pages
      setTotalPages(Math.ceil(data.length / pageSize));
    } catch (error) {
      console.error("Error fetching shipments:", error);
      toast({
        title: "Error",
        description: "Failed to fetch user shipments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssociatedUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchUserShipments(selectedUser);
    }
  }, [selectedUser]);

  // Update total pages when page size changes
  useEffect(() => {
    if (filteredShipments.length > 0) {
      setTotalPages(Math.ceil(filteredShipments.length / pageSize));
      // Reset to first page when changing page size
      setCurrentPage(1);
    }
  }, [pageSize, shipments, statusFilter, searchTerm]);

  // Enhanced search function to search across all relevant fields
  const matchesSearchTerm = (shipment: Shipment) => {
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
      const aValue = a[sortField as keyof Shipment];
      const bValue = b[sortField as keyof Shipment];

      if (aValue === bValue) return 0;

      // Handle string comparison
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
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

  // Format users for searchable select
  const userOptions = users.map((user) => ({
    value: user.id,
    label: `${user.first_name} ${user.last_name} (${
      user.phone_number || user.email
    })`,
  }));

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return <Badge className="bg-green-500">{status}</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-500">{status}</Badge>;
      case "IN_TRANSIT":
        return <Badge className="bg-blue-500">{status}</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-500">{status}</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  return (
    <Card className="w-full ">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">
          User Shipments History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchableSelect
            value={selectedUser}
            onChange={setSelectedUser}
            options={userOptions}
            placeholder="Search and select a user"
            className="w-full sm:w-[300px]"
          />

          {selectedUser && (
            <>
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
            </>
          )}
        </div>

        {selectedUser && (
          <div className="rounded-md border">
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
                    onClick={() => handleSort("status")}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    Status {renderSortIcon("status")}
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("total_cost")}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    Amount {renderSortIcon("total_cost")}
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">
                      Loading shipments...
                    </TableCell>
                  </TableRow>
                ) : paginatedShipments.length > 0 ? (
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
                        {shipment.sender_country && shipment.recipient_country
                          ? formatRoute(
                              shipment.sender_country,
                              shipment.recipient_country
                            )
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {shipment.weight ? `${shipment.weight} kg` : "N/A"}
                      </TableCell>
                      <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                      <TableCell>{shipment.total_cost}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedShipment(shipment);
                            setViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">
                      No shipments found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {selectedUser && paginatedShipments.length > 0 && (
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
        )}
      </CardContent>

      <ShipmentDetailsDialog
        viewDialogOpen={viewDialogOpen}
        setViewDialogOpen={setViewDialogOpen}
        selectedShipment={selectedShipment as ShipmentProps | null}
        getStatusBadge={getStatusBadge}
      />
    </Card>
  );
}
