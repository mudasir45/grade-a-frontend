"use client";

import { formatCurrency } from "@/lib/utils";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface EarningsChartProps {
  commissions: Array<{
    id: string;
    delivery_type: "SHIPMENT" | "BUY4ME";
    amount: number;
    earned_at: string;
    description: string;
    reference_id?: string;
  }>;
}

export function EarningsChart({ commissions }: EarningsChartProps) {
  // Process data for the chart
  const processChartData = () => {
    if (!commissions || commissions.length === 0) {
      return [];
    }

    // Group by date and delivery type
    const groupedData = commissions.reduce((acc, commission) => {
      const date = new Date(commission.earned_at).toLocaleDateString();

      if (!acc[date]) {
        acc[date] = {
          date,
          SHIPMENT: 0,
          BUY4ME: 0,
        };
      }

      acc[date][commission.delivery_type] += commission.amount;

      return acc;
    }, {} as Record<string, { date: string; SHIPMENT: number; BUY4ME: number }>);

    // Convert to array and sort by date
    return Object.values(groupedData)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7); // Get last 7 days
  };

  const chartData = processChartData();

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        Not enough data to display chart
      </div>
    );
  }

  // Format currency with compact notation
  const formatCompactCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "MYR",
      notation: "compact",
    }).format(value);
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          fontSize={12}
          tickFormatter={(value) => {
            const date = new Date(value);
            return `${date.getDate()}/${date.getMonth() + 1}`;
          }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          fontSize={12}
          tickFormatter={(value) => formatCompactCurrency(value)}
        />
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Bar
          dataKey="SHIPMENT"
          name="Shipment"
          fill="#4f46e5"
          radius={[4, 4, 0, 0]}
          barSize={20}
        />
        <Bar
          dataKey="BUY4ME"
          name="Buy4Me"
          fill="#8b5cf6"
          radius={[4, 4, 0, 0]}
          barSize={20}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
