'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { formatCurrency } from '@/lib/utils'
import { Download, Search, Filter, Eye } from 'lucide-react'

export function ShipmentHistory() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedShipment, setSelectedShipment] = useState<any>(null)

  // Mock shipment data
  const shipments = [
    {
      id: 'SHP001',
      date: '2024-03-15',
      trackingNumber: 'TRK123456789',
      status: 'Delivered',
      from: 'Kuala Lumpur, MY',
      to: 'Singapore, SG',
      cost: 150.00
    },
    {
      id: 'SHP002',
      date: '2024-03-10',
      trackingNumber: 'TRK987654321',
      status: 'In Transit',
      from: 'Singapore, SG',
      to: 'Jakarta, ID',
      cost: 200.00
    }
  ]

  const filteredShipments = shipments.filter(shipment =>
    shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.to.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-500'
      case 'in transit':
        return 'bg-blue-500'
      case 'pending':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  const downloadHistory = () => {
    // Generate CSV data
    const headers = ['Shipment ID', 'Date', 'Tracking Number', 'Status', 'From', 'To', 'Cost']
    const rows = filteredShipments.map(shipment => [
      shipment.id,
      format(new Date(shipment.date), 'MM/dd/yyyy'),
      shipment.trackingNumber,
      shipment.status,
      shipment.from,
      shipment.to,
      formatCurrency(shipment.cost)
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    // Create and trigger download
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `shipment_history_${format(new Date(), 'yyyyMMdd')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Shipment History</CardTitle>
              <CardDescription>
                View and manage your past shipments
              </CardDescription>
            </div>
            <Button onClick={downloadHistory} disabled={filteredShipments.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Download History
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search shipments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shipment ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Tracking Number</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShipments.map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell className="font-medium">{shipment.id}</TableCell>
                    <TableCell>
                      {format(new Date(shipment.date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>{shipment.trackingNumber}</TableCell>
                    <TableCell>{shipment.from}</TableCell>
                    <TableCell>{shipment.to}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full mr-2 ${getStatusColor(shipment.status)}`} />
                        <span>{shipment.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(shipment.cost)}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedShipment(shipment)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredShipments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No shipments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}