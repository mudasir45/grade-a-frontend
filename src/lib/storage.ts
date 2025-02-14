'use client'

import { User, ShippingCalculation } from './types'
import { Request } from '@/hooks/use-buy4me'

const USERS_KEY = 'redbox_users'
const SHIPPING_HISTORY_KEY = 'redbox_shipping_history'
const REQUESTS_KEY = 'redbox_orders'
const ORDERS_KEY = 'redbox_orders'

// Sample order status progression
const sampleOrderStatuses = [
  {
    status: 'pending',
    description: 'Order placed successfully',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    status: 'processing',
    description: 'Order is being processed',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    status: 'purchased',
    description: 'Items have been purchased',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    status: 'warehouse',
    description: 'Items arrived at warehouse',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    status: 'shipping',
    description: 'Package is in transit',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    status: 'delivered',
    description: 'Package has been delivered',
    timestamp: new Date().toISOString()
  }
]

export const storage = {
  // User Management
  saveUser: (user: User) => {
    const users = storage.getUsers()
    users.push(user)
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  },

  getUsers: (): User[] => {
    const users = localStorage.getItem(USERS_KEY)
    return users ? JSON.parse(users) : []
  },

  getUserByEmail: (email: string): User | null => {
    const users = storage.getUsers()
    return users.find(user => user.email === email) || null
  },

  // Shipping History
  saveShippingCalculation: (calculation: ShippingCalculation) => {
    const history = storage.getShippingHistory()
    history.push({
      ...calculation,
      timestamp: new Date().toISOString()
    })
    localStorage.setItem(SHIPPING_HISTORY_KEY, JSON.stringify(history))
  },

  getShippingHistory: (): (ShippingCalculation & { timestamp: string })[] => {
    const history = localStorage.getItem(SHIPPING_HISTORY_KEY)
    return history ? JSON.parse(history) : []
  },

  getUserShippingHistory: (userId: string) => {
    return storage.getShippingHistory().filter(calc => calc.userId === userId)
  },

  // Buy4Me Requests
  saveRequests: (userId: string, requests: Request[]) => {
    const key = `${REQUESTS_KEY}_${userId}`
    localStorage.setItem(key, JSON.stringify(requests))
  },

  getRequests: (userId: string): Request[] => {
    const key = `${REQUESTS_KEY}_${userId}`
    const requests = localStorage.getItem(key)
    return requests ? JSON.parse(requests) : []
  },

  // Buy4Me Orders
  saveOrder: (order: any) => {
    const orders = storage.getOrders()
    // Initialize order status
    order.status = [{
      status: 'pending',
      description: 'Order placed successfully',
      timestamp: new Date().toISOString()
    }]
    orders.push(order)
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
    return order
  },

  getOrders: () => {
    const orders = localStorage.getItem(ORDERS_KEY)
    if (!orders) return []
    
    // Ensure each order has proper status array
    const parsedOrders = JSON.parse(orders)
    return parsedOrders.map((order: any) => ({
      ...order,
      status: Array.isArray(order.status) ? order.status : [{
        status: 'pending',
        description: 'Order placed successfully',
        timestamp: order.createdAt || new Date().toISOString()
      }]
    }))
  },

  getUserOrders: (userId: string) => {
    return storage.getOrders().filter(order => order.userId === userId)
  },

  // Update order status
  updateOrderStatus: (orderId: string, newStatus: string) => {
    const orders = storage.getOrders()
    const orderIndex = orders.findIndex(o => o.id === orderId)
    if (orderIndex === -1) return null

    const statusIndex = sampleOrderStatuses.findIndex(s => s.status === newStatus)
    if (statusIndex === -1) return null

    // Update with all statuses up to the new status
    orders[orderIndex].status = sampleOrderStatuses.slice(0, statusIndex + 1)
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
    return orders[orderIndex]
  },

  // Clear all data (for testing)
  clearAll: () => {
    localStorage.removeItem(USERS_KEY)
    localStorage.removeItem(SHIPPING_HISTORY_KEY)
    localStorage.removeItem(REQUESTS_KEY)
    localStorage.removeItem(ORDERS_KEY)
  }
}