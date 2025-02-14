'use client'

import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { Box, CheckCircle, Clock, Home, Package, Truck } from 'lucide-react'

interface OrderStatus {
  status: string
  timestamp: string
  description: string
}

interface OrderTrackingProps {
  order: {
    id: string
    status: string
    created_at: string
  }
}

export function OrderTracking({ order }: OrderTrackingProps) {
  const steps = [
    { 
      icon: Clock, 
      label: 'Draft', 
      status: 'DRAFT',
      description: 'Order created'
    },
    { 
      icon: Package, 
      label: 'Submitted', 
      status: 'SUBMITTED',
      description: 'Order submitted for processing'
    },
    { 
      icon: Box, 
      label: 'Order Placed', 
      status: 'ORDER_PLACED',
      description: 'Order placed with seller'
    },
    { 
      icon: Truck, 
      label: 'In Transit', 
      status: 'IN_TRANSIT',
      description: 'Items in transit to warehouse'
    },
    { 
      icon: Home, 
      label: 'Warehouse Arrived', 
      status: 'WAREHOUSE_ARRIVED',
      description: 'Items arrived at warehouse'
    },
    { 
      icon: Truck, 
      label: 'Shipped to Customer', 
      status: 'SHIPPED_TO_CUSTOMER',
      description: 'Items shipped to customer'
    },
    { 
      icon: CheckCircle, 
      label: 'Completed', 
      status: 'COMPLETED',
      description: 'Order completed'
    }
  ]

  const currentStatusIndex = steps.findIndex(step => step.status === order.status)
  const isCancelled = order.status === 'CANCELLED'

  return (
    <div className="py-8">
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2" />
        
        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isCompleted = !isCancelled && index <= currentStatusIndex
            const isCurrent = index === currentStatusIndex

            return (
              <motion.div
                key={step.status}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center"
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center relative z-10',
                    isCompleted ? 'bg-green-500' : 'bg-gray-200',
                    isCurrent ? 'ring-4 ring-green-100' : '',
                    isCancelled && 'bg-red-200'
                  )}
                >
                  <Icon className={cn(
                    'h-5 w-5',
                    isCompleted ? 'text-white' : 'text-gray-500',
                    isCancelled && 'text-red-500'
                  )} />
                </div>
                <span className="mt-2 text-sm font-medium">{step.label}</span>
                <span className="mt-1 text-xs text-gray-500">
                  {isCurrent && format(new Date(order.created_at), 'MMM d, yyyy')}
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Show cancelled status if applicable */}
      {isCancelled && (
        <div className="mt-8 p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-red-800 font-medium">Order Cancelled</p>
          <p className="text-sm text-red-600">
            This order was cancelled on {format(new Date(order.created_at), 'MMM d, yyyy')}
          </p>
        </div>
      )}
    </div>
  )
}