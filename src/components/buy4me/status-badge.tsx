'use client'

import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  className?: string
}

export function OrderStatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig: Record<string, { label: string; color: string }> = {
    DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
    SUBMITTED: { label: 'Submitted', color: 'bg-blue-100 text-blue-800' },
    ORDER_PLACED: { label: 'Order Placed', color: 'bg-indigo-100 text-indigo-800' },
    IN_TRANSIT: { label: 'In Transit', color: 'bg-yellow-100 text-yellow-800' },
    WAREHOUSE_ARRIVED: { label: 'Warehouse Arrived', color: 'bg-purple-100 text-purple-800' },
    SHIPPED_TO_CUSTOMER: { label: 'Shipped to Customer', color: 'bg-orange-100 text-orange-800' },
    COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-800' },
    CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  }

  const config = statusConfig[status] || { 
    label: status, 
    color: 'bg-gray-100 text-gray-800' 
  }

  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
      config.color,
      className
    )}>
      {config.label}
    </span>
  )
} 