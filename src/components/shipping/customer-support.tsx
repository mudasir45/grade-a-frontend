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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Eye, Mail, MapPin, Phone, Send } from "lucide-react";
import { useEffect, useState } from "react";

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  category: string;
  status: string;
  created_at: string;
  admin_reply: string | null;
}

export function CustomerSupport() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [formData, setFormData] = useState({
    subject: "",
    category: "",
    message: "",
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

  // Fetch tickets on component mount
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/accounts/tickets/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subject: formData.subject.trim(),
            category: formData.category.toUpperCase(),
            message: formData.message.trim(),
          }),
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
        return "bg-yellow-500";
      case "IN_PROGRESS":
        return "bg-blue-500";
      case "RESOLVED":
        return "bg-green-500";
      case "CLOSED":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleViewTicketDetails = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setTicketDetailsOpen(true);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-6">
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
                <Send className="mr-2 h-4 w-4" />
                {loading ? "Submitting..." : "Submit Ticket"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Support Tickets List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Support Tickets</CardTitle>
            <CardDescription>
              View and track your support requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket #</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">{ticket.id}</TableCell>
                      <TableCell>{ticket.subject}</TableCell>
                      <TableCell>{ticket.category}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            ticket.status === "OPEN"
                              ? "default"
                              : ticket.status === "IN_PROGRESS"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(ticket.created_at), "PPP")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewTicketDetails(ticket)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {tickets.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No support tickets found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

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
              <div className="flex h-14 w-24 items-center justify-center rounded-full bg-primary/10">
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
                Our shipping rates vary based on package weight, dimensions, and
                destination. Use our shipping calculator for an estimate.
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
                  variant={
                    ticket.status === "OPEN"
                      ? "default"
                      : ticket.status === "IN_PROGRESS"
                      ? "secondary"
                      : "outline"
                  }
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
