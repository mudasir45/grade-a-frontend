"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import SearchableSelect from "@/components/ui/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ShippingAPI } from "@/lib/api/shipping";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  CheckCircle,
  Eye,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  Send,
} from "lucide-react";
import { useEffect, useState } from "react";

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  category: string;
  status: string;
  created_at: string;
  admin_reply: string | null;
  shipment?: string | null;
}

interface Shipment {
  id: string;
  tracking_number: string;
  sender_name: string;
  recipient_name: string;
  status: string;
}

export function CustomerSupport() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [formData, setFormData] = useState({
    subject: "",
    category: "",
    message: "",
    shipment: "",
  });
  const [formErrors, setFormErrors] = useState({
    subject: "",
    category: "",
    message: "",
  });
  const [ticketDetailsOpen, setTicketDetailsOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null
  );
  const [openShipmentCombobox, setOpenShipmentCombobox] = useState(false);
  const [shipmentSearchQuery, setShipmentSearchQuery] = useState("");
  const [shipmentsLoading, setShipmentsLoading] = useState(false);
  const [shipmentsError, setShipmentsError] = useState<string | null>(null);

  // Fetch tickets and shipments on component mount
  useEffect(() => {
    fetchTickets();
    fetchShipments();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/accounts/tickets/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }

      const data = await response.json();
      setTickets(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch support tickets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchShipments = async () => {
    try {
      setShipmentsLoading(true);
      setShipmentsError(null);
      const response = await ShippingAPI.getShipments();
      setShipments(response);
      console.log(`Loaded ${response.length} shipments`);
    } catch (error) {
      console.error("Failed to fetch shipments:", error);
      setShipmentsError("Couldn't load your shipments. Please try again.");
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch shipments",
        variant: "destructive",
      });
    } finally {
      setShipmentsLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {
      subject: "",
      category: "",
      message: "",
    };

    if (!formData.subject.trim()) {
      errors.subject = "Subject is required";
    }

    if (!formData.category) {
      errors.category = "Category is required";
    }

    if (!formData.message.trim()) {
      errors.message = "Message is required";
    }

    setFormErrors(errors);
    return !Object.values(errors).some((error) => error !== "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("auth_token");
      const payload = {
        subject: formData.subject.trim(),
        category: formData.category.toUpperCase(),
        message: formData.message.trim(),
        ...(formData.shipment ? { shipment: formData.shipment } : {}),
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/accounts/tickets/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create ticket");
      }

      toast({
        title: "Support Ticket Created",
        description: "We will respond to your inquiry shortly.",
      });

      setFormData({
        subject: "",
        category: "",
        message: "",
        shipment: "",
      });

      // Refresh tickets list
      fetchTickets();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create support ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "RESOLVED":
        return "bg-green-100 text-green-800 border-green-300";
      case "CLOSED":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const handleViewTicketDetails = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setTicketDetailsOpen(true);
  };

  const filteredShipments = shipments.filter(
    (shipment) =>
      shipment.tracking_number
        .toLowerCase()
        .includes(shipmentSearchQuery.toLowerCase()) ||
      shipment.sender_name
        .toLowerCase()
        .includes(shipmentSearchQuery.toLowerCase()) ||
      shipment.recipient_name
        .toLowerCase()
        .includes(shipmentSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
            <CardDescription>
              Submit a support ticket and we'll get back to you as soon as
              possible
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input
                  required
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  placeholder="Brief description of your issue"
                  className={formErrors.subject ? "border-red-500" : ""}
                />
                {formErrors.subject && (
                  <p className="text-sm text-red-500">{formErrors.subject}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Related Shipment (Optional)
                </label>
                {shipmentsLoading ? (
                  <div className="flex items-center space-x-2 h-10 px-3 py-2 border rounded-md">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      Loading shipments...
                    </span>
                  </div>
                ) : shipmentsError ? (
                  <div className="flex items-center justify-between h-10 px-3 py-2 border border-red-200 bg-red-50 rounded-md">
                    <span className="text-sm text-red-600">
                      {shipmentsError}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={fetchShipments}
                      className="text-red-600 hover:text-red-700 hover:bg-red-100 h-7 px-2"
                    >
                      Retry
                    </Button>
                  </div>
                ) : shipments.length === 0 ? (
                  <div className="flex items-center space-x-2 h-10 px-3 py-2 border rounded-md bg-muted">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      You don't have any shipments yet
                    </span>
                  </div>
                ) : (
                  <SearchableSelect
                    options={shipments.map((shipment) => ({
                      value: shipment.id,
                      label: `#${shipment.tracking_number} - ${shipment.sender_name} to ${shipment.recipient_name}`,
                    }))}
                    value={formData.shipment}
                    onChange={(value) =>
                      setFormData({ ...formData, shipment: value })
                    }
                    placeholder="Select a shipment..."
                  />
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger
                    className={formErrors.category ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shipping">Shipping Issue</SelectItem>
                    <SelectItem value="tracking">Tracking Issue</SelectItem>
                    <SelectItem value="payment">Payment Issue</SelectItem>
                    <SelectItem value="delivery">Delivery Issue</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.category && (
                  <p className="text-sm text-red-500">{formErrors.category}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  required
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Describe your issue in detail"
                  rows={5}
                  className={formErrors.message ? "border-red-500" : ""}
                />
                {formErrors.message && (
                  <p className="text-sm text-red-500">{formErrors.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Send className="mr-2 h-4 w-4" />
                    Submit Ticket
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Get in touch with our support team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Phone Support</h3>
                  <p className="text-sm text-muted-foreground">
                    +60 11-3690 7583
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Mon-Fri, 9:00 AM - 6:00 PM
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Email Support</h3>
                  <p className="text-sm text-muted-foreground">
                    gradeaplus21@gmail.com
                  </p>
                  <p className="text-sm text-muted-foreground">
                    24/7 Response Time
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Location</h3>
                  <p className="text-sm text-muted-foreground">
                    Shop 23, Victory plaza, beside Mobil filling station, ilepo
                    oke odo bus stop, along abule egba/iyana paja express way,
                    Lagos, Nigeria.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>FAQs</CardTitle>
              <CardDescription>Common questions and answers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">How do I track my shipment?</h3>
                <p className="text-sm text-muted-foreground">
                  You can track your shipment using the tracking number provided
                  in your shipping confirmation email.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">What are your shipping rates?</h3>
                <p className="text-sm text-muted-foreground">
                  Our shipping rates vary based on package weight, dimensions,
                  and destination. Use our shipping calculator for an estimate.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">How long does shipping take?</h3>
                <p className="text-sm text-muted-foreground">
                  Delivery times vary by destination and service level chosen.
                  Standard shipping typically takes 5-7 business days.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Support Tickets List - Full Width */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl font-semibold">
              Your Support Tickets
            </CardTitle>
            <CardDescription>
              View and track your support requests
            </CardDescription>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            {tickets.length} Tickets
          </Badge>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="relative mb-4 h-24 w-24 text-muted-foreground">
                <Mail className="h-16 w-16 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                <CheckCircle className="h-8 w-8 absolute bottom-0 right-0 text-primary" />
              </div>
              <h3 className="mb-1 text-lg font-medium">
                No support tickets found
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                You haven't created any support tickets yet. Use the form above
                to submit your first inquiry.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg transition-colors hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewTicketDetails(ticket)}
                  >
                    <div className="space-y-2 mb-3 sm:mb-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h3 className="font-medium">{ticket.subject}</h3>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs whitespace-nowrap",
                            getStatusColor(ticket.status)
                          )}
                        >
                          {ticket.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 text-sm text-muted-foreground">
                        <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs">
                          {ticket.category}
                        </span>
                        <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs">
                          {format(new Date(ticket.created_at), "PPP")}
                        </span>
                        {ticket.shipment && (
                          <span className="inline-flex items-center rounded-md bg-indigo-50 text-indigo-700 px-2 py-1 text-xs">
                            <Package className="mr-1 h-3 w-3" />
                            Shipment
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {ticket.message}
                      </p>
                    </div>
                    <div>
                      <Button variant="ghost" size="sm" className="sm:ml-2">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <TicketDetailsDialog
        ticket={selectedTicket}
        open={ticketDetailsOpen}
        onOpenChange={setTicketDetailsOpen}
      />
    </div>
  );
}

function TicketDetailsDialog({
  ticket,
  open,
  onOpenChange,
}: {
  ticket: SupportTicket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!ticket) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "RESOLVED":
        return "bg-green-100 text-green-800 border-green-300";
      case "CLOSED":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Support Ticket Details
          </DialogTitle>
          <DialogDescription>
            Ticket #{ticket.id} - {format(new Date(ticket.created_at), "PPP")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">
                Subject
              </h4>
              <p className="mt-1">{ticket.subject}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">
                Category
              </h4>
              <p className="mt-1">{ticket.category}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">
                Status
              </h4>
              <p className="mt-1">
                <Badge
                  variant="outline"
                  className={cn("px-2 py-0.5", getStatusColor(ticket.status))}
                >
                  {ticket.status}
                </Badge>
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">
                Created
              </h4>
              <p className="mt-1">
                {format(new Date(ticket.created_at), "PPP p")}
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm text-muted-foreground">
              Your Message
            </h4>
            <p className="mt-1 whitespace-pre-wrap">{ticket.message}</p>
          </div>

          {ticket.admin_reply && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium text-sm text-muted-foreground">
                Admin Reply
              </h4>
              <p className="mt-1 whitespace-pre-wrap">{ticket.admin_reply}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
