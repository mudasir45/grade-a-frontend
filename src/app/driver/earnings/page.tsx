"use client";

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
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Skeleton } from "@/components/ui/skeleton";
import { useDriverEarnings, useWithdrawFunds } from "@/hooks/use-driver";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowDownToLine,
  Calendar,
  CreditCard,
  DollarSign,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function EarningsPage() {
  const [dateRange, setDateRange] = useState<{
    start_date?: string;
    end_date?: string;
  }>({});
  const { data: earnings, isLoading, error } = useDriverEarnings(dateRange);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "bank_transfer" | "mobile_money"
  >("bank_transfer");
  const [accountDetails, setAccountDetails] = useState({
    account_number: "",
    account_name: "",
    bank_code: "",
    mobile_number: "",
    mobile_provider: "",
  });
  const withdrawMutation = useWithdrawFunds();

  const handleWithdrawalSubmit = async () => {
    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amount > (earnings?.total_earnings || 0)) {
      toast.error("Withdrawal amount cannot exceed your total earnings");
      return;
    }

    try {
      await withdrawMutation.mutateAsync({
        amount,
        payment_method: paymentMethod,
        ...(paymentMethod === "bank_transfer"
          ? {
              account_number: accountDetails.account_number,
              account_name: accountDetails.account_name,
              bank_code: accountDetails.bank_code,
            }
          : {
              mobile_number: accountDetails.mobile_number,
              mobile_provider: accountDetails.mobile_provider,
            }),
      });

      toast.success("Withdrawal request submitted successfully");
      setIsWithdrawDialogOpen(false);
      setWithdrawalAmount("");
      setAccountDetails({
        account_number: "",
        account_name: "",
        bank_code: "",
        mobile_number: "",
        mobile_provider: "",
      });
    } catch (error) {
      toast.error("Failed to process withdrawal request");
    }
  };

  if (isLoading) {
    return <EarningsSkeleton />;
  }

  if (error || !earnings) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Failed to load earnings data</p>
      </div>
    );
  }

  const { total_earnings, shipment_earnings, buy4me_earnings, commissions } =
    earnings;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Earnings</h1>
          <p className="text-muted-foreground">
            Track your earnings and withdraw funds
          </p>
        </div>
        <Button onClick={() => setIsWithdrawDialogOpen(true)}>
          <ArrowDownToLine className="mr-2 h-4 w-4" />
          Withdraw Funds
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(total_earnings)}
            </div>
            <p className="text-xs text-muted-foreground">
              Available for withdrawal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Shipment Earnings
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(shipment_earnings)}
            </div>
            <p className="text-xs text-muted-foreground">
              From delivery commissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Buy4Me Earnings
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(buy4me_earnings)}
            </div>
            <p className="text-xs text-muted-foreground">
              From shopping commissions
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commission History</CardTitle>
          <CardDescription>
            Your recent earnings from deliveries and shopping
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div className="flex items-center">
              <div className="ml-auto flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Select
                  value="all"
                  onValueChange={(value) => {
                    if (value === "all") {
                      setDateRange({});
                    } else if (value === "this_month") {
                      const now = new Date();
                      const firstDay = new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        1
                      );
                      setDateRange({
                        start_date: firstDay.toISOString().split("T")[0],
                        end_date: now.toISOString().split("T")[0],
                      });
                    } else if (value === "last_month") {
                      const now = new Date();
                      const firstDay = new Date(
                        now.getFullYear(),
                        now.getMonth() - 1,
                        1
                      );
                      const lastDay = new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        0
                      );
                      setDateRange({
                        start_date: firstDay.toISOString().split("T")[0],
                        end_date: lastDay.toISOString().split("T")[0],
                      });
                    }
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="this_month">This Month</SelectItem>
                    <SelectItem value="last_month">Last Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {commissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <DollarSign className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  No commission history found
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <div className="grid grid-cols-4 gap-4 p-4 font-medium">
                  <div>Date</div>
                  <div>Type</div>
                  <div>Reference</div>
                  <div className="text-right">Amount</div>
                </div>
                <div className="divide-y">
                  {commissions.map((commission) => (
                    <div
                      key={commission.id}
                      className="grid grid-cols-4 gap-4 p-4 text-sm"
                    >
                      <div className="text-muted-foreground">
                        {formatDate(commission.earned_at)}
                      </div>
                      <div>
                        {commission.delivery_type === "SHIPMENT"
                          ? "Shipment"
                          : "Buy4Me"}
                      </div>
                      <div className="text-muted-foreground truncate">
                        {commission.reference_id || commission.id}
                      </div>
                      <div className="text-right font-medium">
                        {formatCurrency(commission.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={isWithdrawDialogOpen}
        onOpenChange={setIsWithdrawDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
            <DialogDescription>
              Enter the amount and payment details to withdraw your earnings
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="amount"
                  placeholder="0.00"
                  className="pl-9"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  type="number"
                  min="0"
                  step="0.01"
                  max={total_earnings.toString()}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Available balance: {formatCurrency(total_earnings)}
              </p>
            </div>
            <div className="grid gap-2">
              <Label>Payment Method</Label>
              <Select
                value={paymentMethod}
                onValueChange={(value) =>
                  setPaymentMethod(value as "bank_transfer" | "mobile_money")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentMethod === "bank_transfer" ? (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="account_number">Account Number</Label>
                  <Input
                    id="account_number"
                    value={accountDetails.account_number}
                    onChange={(e) =>
                      setAccountDetails({
                        ...accountDetails,
                        account_number: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="account_name">Account Name</Label>
                  <Input
                    id="account_name"
                    value={accountDetails.account_name}
                    onChange={(e) =>
                      setAccountDetails({
                        ...accountDetails,
                        account_name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bank_code">Bank Code</Label>
                  <Input
                    id="bank_code"
                    value={accountDetails.bank_code}
                    onChange={(e) =>
                      setAccountDetails({
                        ...accountDetails,
                        bank_code: e.target.value,
                      })
                    }
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="mobile_number">Mobile Number</Label>
                  <Input
                    id="mobile_number"
                    value={accountDetails.mobile_number}
                    onChange={(e) =>
                      setAccountDetails({
                        ...accountDetails,
                        mobile_number: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="mobile_provider">Mobile Provider</Label>
                  <Select
                    value={accountDetails.mobile_provider}
                    onValueChange={(value) =>
                      setAccountDetails({
                        ...accountDetails,
                        mobile_provider: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mtn">MTN</SelectItem>
                      <SelectItem value="airtel">Airtel</SelectItem>
                      <SelectItem value="vodafone">Vodafone</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsWithdrawDialogOpen(false);
                setWithdrawalAmount("");
                setAccountDetails({
                  account_number: "",
                  account_name: "",
                  bank_code: "",
                  mobile_number: "",
                  mobile_provider: "",
                });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleWithdrawalSubmit}
              disabled={
                !withdrawalAmount ||
                parseFloat(withdrawalAmount) <= 0 ||
                parseFloat(withdrawalAmount) > total_earnings ||
                withdrawMutation.isPending
              }
            >
              {withdrawMutation.isPending ? "Processing..." : "Withdraw"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EarningsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-[150px]" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array(3)
          .fill(null)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div className="flex items-center">
              <div className="ml-auto">
                <Skeleton className="h-10 w-[180px]" />
              </div>
            </div>
            <div className="rounded-md border">
              <div className="grid grid-cols-4 gap-4 p-4">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20 ml-auto" />
              </div>
              <div className="divide-y">
                {Array(5)
                  .fill(null)
                  .map((_, i) => (
                    <div key={i} className="grid grid-cols-4 gap-4 p-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16 ml-auto" />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
