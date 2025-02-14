'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { storage } from '@/lib/storage'
import { useAuth } from '@/hooks/use-auth'
import type { ShippingCalculation } from '@/lib/types'

export function ShippingHistory() {
  const { user } = useAuth()
  const [history, setHistory] = useState<(ShippingCalculation & { timestamp: string })[]>([])

  useEffect(() => {
    if (user) {
      const userHistory = storage.getUserShippingHistory(user.id)
      setHistory(userHistory)
    }
  }, [user])

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-lg text-muted-foreground">No shipping history yet.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Weight</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Cost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((item, index) => (
            <TableRow key={index}>
              <TableCell>
                {format(new Date(item.timestamp), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>{item.fromCountry}</TableCell>
              <TableCell>{item.toCountry}</TableCell>
              <TableCell>{item.weight} kg</TableCell>
              <TableCell className="capitalize">{item.method}</TableCell>
              <TableCell className="text-right">
                {item.currency} {item.price.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}