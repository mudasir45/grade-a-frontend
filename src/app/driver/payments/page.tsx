"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  BadgeDollarSign,
  Download,
  FileText,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Payment {
  id: string;
  amount: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  payment_method: string;
  reference: string;
  created_at: string;
}

interface PaymentStats {
  totalEarnings: number;
  pendingPayments: number;
  lastPaymentAmount: number;
  lastPaymentDate: string;
}

export default function DriverPayments() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalEarnings: 0,
    pendingPayments: 0,
    lastPaymentAmount: 0,
    lastPaymentDate: "",
  });

  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: "",
    payment_method: "",
    account_number: "",
    account_name: "",
    bank_code: "",
  });

  useEffect(() => {
    fetchPayments();
    fetchPaymentStats();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/driver/payments");
      const data = await response.json();
      setPayments(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch payment history",
        variant: "destructive",
      });
    }
  };

  const fetchPaymentStats = async () => {
    try {
      const response = await fetch("/api/driver/payments/stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch payment statistics",
        variant: "destructive",
      });
    }
  };

  const handleWithdrawal = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/driver/payments/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(withdrawalForm),
      });

      if (!response.ok) throw new Error("Withdrawal request failed");

      toast({
        title: "Success",
        description: "Withdrawal request has been submitted successfully",
      });

      setShowWithdrawDialog(false);
      fetchPayments();
      fetchPaymentStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process withdrawal request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => (window.location.href = "/driver/dashboard")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">Payment Management</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
            <BadgeDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalEarnings.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Lifetime earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Payments
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.pendingPayments.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Available to withdraw
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Payment</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.lastPaymentAmount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.lastPaymentDate
                ? `Received on ${new Date(
                    stats.lastPaymentDate
                  ).toLocaleDateString()}`
                : "No payments yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Payment History</h2>
        <div className="space-x-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => {
              // Handle download statement
            }}
          >
            <Download className="h-4 w-4" />
            Download Statement
          </Button>
          <Dialog
            open={showWithdrawDialog}
            onOpenChange={setShowWithdrawDialog}
          >
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Withdraw Funds
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Withdraw Funds</DialogTitle>
                <DialogDescription>
                  Enter your withdrawal details below
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={withdrawalForm.amount}
                    onChange={(e) =>
                      setWithdrawalForm({
                        ...withdrawalForm,
                        amount: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select
                    value={withdrawalForm.payment_method}
                    onValueChange={(value) =>
                      setWithdrawalForm({
                        ...withdrawalForm,
                        payment_method: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">
                        Bank Transfer
                      </SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {withdrawalForm.payment_method === "bank_transfer" && (
                  <>
                    <div className="space-y-2">
                      <Label>Account Name</Label>
                      <Input
                        placeholder="Enter account name"
                        value={withdrawalForm.account_name}
                        onChange={(e) =>
                          setWithdrawalForm({
                            ...withdrawalForm,
                            account_name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Account Number</Label>
                      <Input
                        placeholder="Enter account number"
                        value={withdrawalForm.account_number}
                        onChange={(e) =>
                          setWithdrawalForm({
                            ...withdrawalForm,
                            account_number: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Bank Code</Label>
                      <Input
                        placeholder="Enter bank code"
                        value={withdrawalForm.bank_code}
                        onChange={(e) =>
                          setWithdrawalForm({
                            ...withdrawalForm,
                            bank_code: e.target.value,
                          })
                        }
                      />
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowWithdrawDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleWithdrawal} disabled={loading}>
                  {loading ? "Processing..." : "Withdraw"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    {new Date(payment.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{payment.reference}</TableCell>
                  <TableCell className="capitalize">
                    {payment.payment_method.replace("_", " ")}
                  </TableCell>
                  <TableCell>${payment.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        {
                          "bg-yellow-100 text-yellow-800":
                            payment.status === "PENDING",
                          "bg-blue-100 text-blue-800":
                            payment.status === "PROCESSING",
                          "bg-green-100 text-green-800":
                            payment.status === "COMPLETED",
                          "bg-red-100 text-red-800":
                            payment.status === "FAILED",
                        }
                      )}
                    >
                      {payment.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
