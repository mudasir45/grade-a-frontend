"use client"
import { useToast } from '@/hooks/use-toast'
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
import { Eye, Pencil, Trash2, MoreHorizontal, Search, RefreshCcw } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { ShipmentForm } from "./shipment-form"
import { UpdateStatusDialog } from './update-status-dialog'
// Update the imports and add interface for shipment type
export interface ShipmentProps {
  id: string
  user: string
  cod_amount: string
  payment_method: string
  payment_status: string
  payment_date: string | null
  transaction_id: string
  receipt: string
  sender_name: string
  sender_email: string
  sender_phone: string
  sender_address: string
  sender_country: string
  recipient_name: string
  recipient_email: string
  recipient_phone: string
  recipient_address: string
  recipient_country: string
  package_type: string
  weight: string
  length: string
  width: string
  height: string
  description: string
  declared_value: string
  insurance_required: boolean
  signature_required: boolean
  tracking_number: string
  current_location: string
  tracking_history: {
    status: string
    location: string
    timestamp: string
    description: string
  }[]
  estimated_delivery: string | null
  status: string
  base_rate: string
  per_kg_rate: string
  weight_charge: string
  service_charge: string
  total_additional_charges: string
  total_cost: string
  notes: string
  created_at: string
  updated_at: string
  staff: string
  service_type: string
}

interface ManageShipmentProps {
  shipments: ShipmentProps[]
}

export function ManageShipment({ shipments }: ManageShipmentProps) {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedShipment, setSelectedShipment] = useState<ShipmentProps | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const token = localStorage.getItem('auth_token')
  console.log(selectedShipment)
  // Filter shipments based on search term and status filter
  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch =
      shipment.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.sender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.recipient_name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || shipment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Function to get the appropriate badge color based on status
  const getStatusBadge = (status: any) => {
    switch (status) {
      case "DELIVERED":
        return <Badge className="bg-green-500">{status}</Badge>
      case "PENDING":
        return <Badge className="bg-yellow-500">{status}</Badge>
      case "PROCESSING":
        return <Badge className="bg-blue-500">{status}</Badge>
      case "CANCELLED":
        return <Badge className="bg-red-500">{status}</Badge>
      default:
        return <Badge className="bg-gray-500">{status}</Badge>
    }
  }

  // Function to handle edit click
  const handleEditClick = (shipment: any) => {
    setSelectedShipment(shipment)
    setEditDialogOpen(true)
  }

  // Function to handle view click
  const handleViewClick = (shipment: any) => {
    setSelectedShipment(shipment)
    setViewDialogOpen(true)
  }
// Function to handle view click
const handleUpdateStatusClick = (shipment: any) => {
  setSelectedShipment(shipment)
  setStatusDialogOpen(true)
}
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
      declared_value: updatedData.declared_value,
      service_charge: updatedData.service_charge,
      sender_country: updatedData.sender_country,
      recipient_country: updatedData.recipient_country,
      service_type: updatedData.service_type,
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shipments/staff-shipment/${updatedData.id}/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update shipment");
      }

      return true; // Return success
    } catch (error) {
      console.error("Error updating shipment:", error);
      return false; // Return failure
    }
  };


  // Function to handle delete click
  const handleDeleteClick = (shipment: ShipmentProps) => {
    setSelectedShipment(shipment)
    setDeleteDialogOpen(true)
  }

  // Function to handle shipment deletion
  const handleDeleteConfirm = async () => {
    if (!selectedShipment) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shipments/staff-shipment/${selectedShipment.id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete shipment');
      }

      toast({
        title: "Success",
        description: "Shipment deleted successfully",
      });

      setDeleteDialogOpen(false)
      // You might want to refresh the shipments list here

    } catch (error) {
      console.error('Error deleting shipment:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete shipment',
        variant: 'destructive'
      })
    }
  }

  return (
    <>
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
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="block lg:hidden space-y-4">
            {filteredShipments.length > 0 ? (
              filteredShipments.map((shipment) => (
                <Card key={shipment.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">{shipment.tracking_number}</div>
                    {getStatusBadge(shipment.status)}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-muted-foreground">Date:</div>
                      <div>{new Date(shipment.created_at).toLocaleDateString()}</div>
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
                      <div>{shipment.sender_country} → {shipment.recipient_country}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-muted-foreground">Amount:</div>
                      <div>{shipment.total_cost}</div>
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
                      <TableCell className="font-medium">{shipment.tracking_number}</TableCell>
                      <TableCell>{new Date(shipment.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{shipment.sender_name}</TableCell>
                      <TableCell>{shipment.recipient_name}</TableCell>
                      <TableCell>
                        {shipment.sender_country} → {shipment.recipient_country}
                      </TableCell>
                      <TableCell>{shipment.weight} kg</TableCell>
                      <TableCell>{shipment.total_cost}</TableCell>
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

      {/* Add the Dialog for editing */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-3xl xl:max-w-4xl max-h-[100%] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex text-2xl font-semibold ">Update Shipment</DialogTitle>
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
            <DialogTitle className="flex text-xl font-semibold ">Update Status</DialogTitle>
          </DialogHeader>
          <UpdateStatusDialog 
          shipmentId={selectedShipment?.id} 
          currentStatus={selectedShipment?.status} 
          setStatusDialogOpen={setStatusDialogOpen}/>
        </DialogContent>
      </Dialog>

      {/* Add the Dialog for viewing details */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-3xl xl:max-w-4xl max-h-[100%] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex text-2xl font-semibold">Shipment Details</DialogTitle>
          </DialogHeader>
          {selectedShipment && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Tracking Number</div>
                  <div>{selectedShipment.tracking_number}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Status</div>
                  <div>{getStatusBadge(selectedShipment.status)}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Created At</div>
                  <div>{new Date(selectedShipment.created_at).toLocaleString()}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text font-medium text-muted-foreground mb-2">Payment Details</div>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                    <div className="text-sm"><span className="text-muted-foreground">COD Amount: </span>{selectedShipment.cod_amount}</div>
                    <div className="text-sm"><span className="text-muted-foreground">Payment Method: </span>{selectedShipment.payment_method}</div>
                    <div className="text-sm"><span className="text-muted-foreground">Payment Status: </span>{selectedShipment.payment_status}</div>
                    {selectedShipment.payment_date && (
                      <div className="text-sm"><span className="text-muted-foreground">Payment Date: </span>{new Date(selectedShipment.payment_date).toLocaleString()}</div>
                    )}
                    {selectedShipment.transaction_id && (
                      <div className="text-sm"><span className="text-muted-foreground">Transaction ID: </span>{selectedShipment.transaction_id}</div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text font-medium text-muted-foreground mb-2">Sender Details</div>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                    <div className="text-sm"><span className="text-muted-foreground">Name: </span>{selectedShipment.sender_name}</div>
                    <div className="text-sm"><span className="text-muted-foreground">Email: </span>{selectedShipment.sender_email}</div>
                    <div className="text-sm"><span className="text-muted-foreground">Phone: </span>{selectedShipment.sender_phone}</div>
                    <div className="text-sm"><span className="text-muted-foreground">Address: </span>{selectedShipment.sender_address}</div>
                    <div className="text-sm"><span className="text-muted-foreground">Country: </span>{selectedShipment.sender_country}</div>
                  </div>
                </div>

                <div>
                  <div className="text font-medium text-muted-foreground mb-2">Receiver Details</div>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                    <div className="text-sm"><span className="text-muted-foreground">Name: </span>{selectedShipment.recipient_name}</div>
                    <div className="text-sm"><span className="text-muted-foreground">Email: </span>{selectedShipment.recipient_email}</div>
                    <div className="text-sm"><span className="text-muted-foreground">Phone: </span>{selectedShipment.recipient_phone}</div>
                    <div className="text-sm"><span className="text-muted-foreground">Address: </span>{selectedShipment.recipient_address}</div>
                    <div className="text-sm"><span className="text-muted-foreground">Country: </span>{selectedShipment.recipient_country}</div>
                  </div>
                </div>

                <div>
                  <div className="text font-medium text-muted-foreground mb-2">Parcel Details</div>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                    <div className="text-sm"><span className="text-muted-foreground">Package Type: </span>{selectedShipment.package_type}</div>
                    <div className="text-sm"><span className="text-muted-foreground">Weight: </span>{selectedShipment.weight} kg</div>
                    <div className="text-sm"><span className="text-muted-foreground">Dimensions: </span>{selectedShipment.length}x{selectedShipment.width}x{selectedShipment.height} cm</div>
                    <div className="text-sm"><span className="text-muted-foreground">Description: </span>{selectedShipment.description}</div>
                    <div className="text-sm"><span className="text-muted-foreground">Declared Value: </span>{selectedShipment.declared_value}</div>
                    <div className="text-sm"><span className="text-muted-foreground">Insurance Required: </span>{selectedShipment.insurance_required ? "Yes" : "No"}</div>
                    <div className="text-sm"><span className="text-muted-foreground">Signature Required: </span>{selectedShipment.signature_required ? "Yes" : "No"}</div>
                    <div className="text-sm"><span className="text-muted-foreground">Service Type: </span>{selectedShipment.service_type}</div>
                  </div>
                </div>

                <div>
                  <div className="text font-medium text-muted-foreground mb-2">Charges Breakdown</div>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                    <div className="text-sm"><span className="text-muted-foreground">Base Rate: </span>{selectedShipment.base_rate}</div>
                    <div className="text-sm"><span className="text-muted-foreground">Per KG Rate: </span>{selectedShipment.per_kg_rate}</div>
                    <div className="text-sm"><span className="text-muted-foreground">Weight Charge: </span>{selectedShipment.weight_charge}</div>
                    <div className="text-sm"><span className="text-muted-foreground">Service Charge: </span>{selectedShipment.service_charge}</div>
                    <div className="text-sm"><span className="text-muted-foreground">Additional Charges: </span>{selectedShipment.total_additional_charges}</div>
                    <div className="text-sm font-semibold"><span className="text-muted-foreground">Total Cost: </span>{selectedShipment.total_cost}</div>
                  </div>
                </div>

                {selectedShipment.tracking_history && selectedShipment.tracking_history.length > 0 && (
                  <div>
                    <div className="text font-medium text-muted-foreground mb-2">Tracking History</div>
                    <div className="space-y-2">
                      {selectedShipment.tracking_history.map((history, index) => (
                        <div key={index} className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                          <div className="text-sm"><span className="text-muted-foreground">Status: </span>{history.status}</div>
                          <div className="text-sm"><span className="text-muted-foreground">Location: </span>{history.location}</div>
                          <div className="text-sm"><span className="text-muted-foreground">Time: </span>{new Date(history.timestamp).toLocaleString()}</div>
                          <div className="text-sm col-span-3"><span className="text-muted-foreground">Description: </span>{history.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedShipment.notes && (
                  <div>
                    <div className="text font-medium text-muted-foreground mb-2">Notes</div>
                    <div className="text-sm">{selectedShipment.notes}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add the Dialog for delete confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this shipment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter >
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button className='mb-3 sm:mb-0' variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
