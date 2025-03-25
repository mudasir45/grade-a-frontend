import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SearchableSelect from "@/components/ui/searchable-select";
import { useDriverDashboard } from "@/hooks/use-driver";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

interface DriverPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentMethod: "paystack" | "bizapay";
}

export function DriverPaymentModal({
  isOpen,
  onClose,
  paymentMethod,
}: DriverPaymentModalProps) {
  const [paymentType, setPaymentType] = useState<"SHIPMENT" | "BUY4ME">(
    "SHIPMENT"
  );
  const [selectedItem, setSelectedItem] = useState("");
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: driverData } = useDriverDashboard();

  // Get shipments and buy4me requests from driver data
  const shipmentOptions = driverData?.pending_deliveries?.shipments
    ? Array(driverData.pending_deliveries.shipments)
        .fill(null)
        .map((_, index) => ({
          value: `SRS${255054 + index}`,
          label: `Shipment #${255054 + index}`,
        }))
    : [];

  const buy4meOptions = driverData?.pending_deliveries?.buy4me
    ? Array(driverData.pending_deliveries.buy4me)
        .fill(null)
        .map((_, index) => ({
          value: `BUY${255054 + index}`,
          label: `Buy4Me #${255054 + index}`,
        }))
    : [];

  const validateBizaPayFields = () => {
    if (name.length < 5) {
      toast({
        title: "Validation Error",
        description: "Name must be at least 5 characters long",
        variant: "destructive",
      });
      return false;
    }
    if (!phone || phone.length < 10) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!selectedItem || !amount || !email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === "bizapay" && !validateBizaPayFields()) {
      return;
    }

    try {
      setLoading(true);

      if (paymentMethod === "paystack") {
        // Store payment data in localStorage for PayStack
        localStorage.setItem(
          "paymentData",
          JSON.stringify({
            amount: Number(amount),
            driver_id: driverData?.driver_profile?.user,
            payment_for: paymentType,
            item_id: selectedItem,
            requestType: "driver",
          })
        );

        const response = await fetch("/api/paystack/initiate-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            amount: Number(amount) * 100, // Convert to kobo
            metadata: {
              name,
              phone,
              requestType: "driver",
              driver_id: driverData?.driver_profile?.user,
              payment_for: paymentType,
              item_id: selectedItem,
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to initialize payment");
        }

        const data = await response.json();
        console.log("PayStack response:", data);
        window.location.href = data.data.authorization_url;
      } else {
        // Store payment data in localStorage for BizaPay
        localStorage.setItem(
          "paymentData",
          JSON.stringify({
            amount: Number(amount),
            driver_id: driverData?.driver_profile?.user,
            payment_for: paymentType,
            item_id: selectedItem,
            requestType: "driver",
          })
        );

        // BizaPay implementation
        const response = await fetch("/api/bizapay/initiate-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payerName: name,
            payerEmail: email,
            payerPhone: phone,
            amount: Number(amount),
            orderId: selectedItem,
            webReturnUrl: `${window.location.origin}/payment-confirmation`,
            metadata: JSON.stringify({
              payment_for: paymentType,
              item_id: selectedItem,
              driver_id: driverData?.driver_profile?.user,
              requestType: "driver",
            }),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to initialize payment");
        }

        const data = await response.json();
        console.log("BizaPay response:", data);
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Error",
        description: "Failed to initialize payment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initialize name and phone from driver data when modal opens
  useEffect(() => {
    if (isOpen && driverData?.driver_profile?.user_details) {
      const { first_name, last_name, phone_number } =
        driverData.driver_profile.user_details;
      setName(`${first_name} ${last_name}`.trim());
      setPhone(phone_number || "");
      setEmail(driverData.driver_profile.user_details.email || "");
    }
  }, [isOpen, driverData]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Make Payment (
            {paymentMethod === "paystack" ? "PayStack" : "BizaPay"})
          </DialogTitle>
          <DialogDescription>
            Pay for your shipment or Buy4Me request
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Payment Type</Label>
            <SearchableSelect
              options={[
                { value: "SHIPMENT", label: "Shipment" },
                { value: "BUY4ME", label: "Buy4Me" },
              ]}
              value={paymentType}
              onChange={(value) => {
                setPaymentType(value as "SHIPMENT" | "BUY4ME");
                setSelectedItem("");
              }}
            />
          </div>
          <div>
            <Label>
              Select{" "}
              {paymentType === "SHIPMENT" ? "Shipment" : "Buy4Me Request"}
            </Label>
            <SearchableSelect
              options={
                paymentType === "SHIPMENT" ? shipmentOptions : buy4meOptions
              }
              value={selectedItem}
              onChange={setSelectedItem}
              placeholder={`Select ${
                paymentType === "SHIPMENT" ? "a shipment" : "a Buy4Me request"
              }`}
            />
          </div>
          {paymentMethod === "bizapay" && (
            <>
              <div>
                <Label>Full Name (minimum 5 characters)</Label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  minLength={5}
                  required
                />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            </>
          )}
          <div>
            <Label>Amount</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <Button
            className="w-full"
            onClick={handlePayment}
            disabled={
              loading ||
              !selectedItem ||
              !amount ||
              !email ||
              (paymentMethod === "bizapay" && (!name || !phone))
            }
          >
            {loading ? "Processing..." : "Pay Now"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
