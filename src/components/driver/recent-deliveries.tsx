"use client";

import { formatCurrency, formatDate } from "@/lib/utils";
import { Package, ShoppingBag } from "lucide-react";

interface RecentDeliveriesProps {
  commissions: Array<{
    id: string;
    delivery_type: "SHIPMENT" | "BUY4ME";
    amount: number;
    earned_at: string;
    description: string;
    reference_id?: string;
  }>;
}

export function RecentDeliveries({ commissions }: RecentDeliveriesProps) {
  if (!commissions || commissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Package className="h-10 w-10 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No recent deliveries found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {commissions.map((commission) => (
        <div
          key={commission.id}
          className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
        >
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-gray-100 p-2">
              {commission.delivery_type === "SHIPMENT" ? (
                <Package className="h-4 w-4 text-gray-600" />
              ) : (
                <ShoppingBag className="h-4 w-4 text-gray-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">
                {commission.delivery_type === "SHIPMENT"
                  ? "Shipment"
                  : "Buy4Me"}{" "}
                {commission.reference_id && `#${commission.reference_id}`}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(commission.earned_at)}
              </p>
              {commission.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {commission.description}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">
              {formatCurrency(commission.amount)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
