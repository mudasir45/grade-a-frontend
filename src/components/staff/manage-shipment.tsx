"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Eye, Pencil, Trash2, MoreHorizontal, Search, FileDown, Plus } from "lucide-react"

// Sample data for the table
const shipments = [
  {
    id: "SHP-001",
    trackingNumber: "TRK12345678",
    senderName: "John Smith",
    receiverName: "Jane Doe",
    origin: "Lagos",
    destination: "Abuja",
    date: "2025-02-25",
    weight: "2.5",
    amount: "₦4,500",
    status: "delivered",
  },
  {
    id: "SHP-002",
    trackingNumber: "TRK87654321",
    senderName: "Michael Johnson",
    receiverName: "Sarah Williams",
    origin: "Kano",
    destination: "Port Harcourt",
    date: "2025-02-26",
    weight: "1.8",
    amount: "₦3,200",
    status: "in-transit",
  },
  {
    id: "SHP-003",
    trackingNumber: "TRK11223344",
    senderName: "David Brown",
    receiverName: "Emily Davis",
    origin: "Ibadan",
    destination: "Enugu",
    date: "2025-02-26",
    weight: "3.2",
    amount: "₦5,800",
    status: "pending",
  },
  {
    id: "SHP-004",
    trackingNumber: "TRK55667788",
    senderName: "Robert Wilson",
    receiverName: "Olivia Taylor",
    origin: "Abuja",
    destination: "Lagos",
    date: "2025-02-27",
    weight: "4.0",
    amount: "₦7,200",
    status: "in-transit",
  },
  {
    id: "SHP-005",
    trackingNumber: "TRK99001122",
    senderName: "Daniel Martinez",
    receiverName: "Sophia Anderson",
    origin: "Benin",
    destination: "Kaduna",
    date: "2025-02-27",
    weight: "1.5",
    amount: "₦2,700",
    status: "pending",
  },
]

export function ManageShipment() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Filter shipments based on search term and status filter
  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch =
      shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.receiverName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || shipment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Function to get the appropriate badge color based on status
  const getStatusBadge = (status:any) => {
    switch (status) {
      case "delivered":
        return <Badge className="bg-green-500">Delivered</Badge>
      case "in-transit":
        return <Badge className="bg-blue-500">In Transit</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      default:
        return <Badge className="bg-gray-500">{status}</Badge>
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <CardTitle className="text-2xl font-semibold">Manage Shipments</CardTitle>
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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-transit">In Transit</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mobile Card View */}
        <div className="block sm:hidden space-y-4">
          {filteredShipments.length > 0 ? (
            filteredShipments.map((shipment) => (
              <Card key={shipment.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium">{shipment.trackingNumber}</div>
                  {getStatusBadge(shipment.status)}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Date:</div>
                    <div>{shipment.date}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Sender:</div>
                    <div>{shipment.senderName}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Receiver:</div>
                    <div>{shipment.receiverName}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Route:</div>
                    <div>{shipment.origin} → {shipment.destination}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Amount:</div>
                    <div>{shipment.amount}</div>
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
                      <DropdownMenuItem className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2">
                        <Pencil className="h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2 text-destructive">
                        <Trash2 className="h-4 w-4" />
                        Delete
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
        <div className="hidden sm:block rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Sender</TableHead>
                <TableHead>Receiver</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShipments.length > 0 ? (
                filteredShipments.map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell className="font-medium">{shipment.trackingNumber}</TableCell>
                    <TableCell>{shipment.date}</TableCell>
                    <TableCell>{shipment.senderName}</TableCell>
                    <TableCell>{shipment.receiverName}</TableCell>
                    <TableCell>
                      {shipment.origin} → {shipment.destination}
                    </TableCell>
                    <TableCell>{shipment.weight} kg</TableCell>
                    <TableCell>{shipment.amount}</TableCell>
                    <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2">
                            <Pencil className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2 text-destructive">
                            <Trash2 className="h-4 w-4" />
                            Delete
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
        <div className="flex justify-center sm:justify-end">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem className="hidden sm:block">
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem className="hidden sm:block">
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  )
}

