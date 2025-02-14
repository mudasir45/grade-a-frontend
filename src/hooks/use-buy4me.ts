import { baseShippingRate, serviceFeePercentage } from '@/lib/buy4me-data'
import { Buy4MeItem, Buy4MeRequest } from '@/lib/types/index'
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './use-auth'



export function useBuy4Me() {
  const { user } = useAuth()
  const [activeRequest, setActiveRequest] = useState<Buy4MeRequest | null>(null)
  const [loading, setLoading] = useState(false)

  // Create or fetch active draft request on mount
  useEffect(() => {
    const initializeRequest = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        const token = localStorage.getItem('auth_token')
        
        // Fetch existing requests
        const response = await fetch('http://localhost:8000/api/buy4me/requests/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) throw new Error('Failed to fetch requests')
        
        const data = await response.json()
        
        // Find existing draft request or create new one
        const draftRequest = data.results.find((req: Buy4MeRequest) => req.status === 'DRAFT')
        
        if (draftRequest) {
          setActiveRequest(draftRequest)
        } else {
          // Create new draft request
          const newRequestResponse = await fetch('http://localhost:8000/api/buy4me/requests/', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              shipping_address: 'will change later', // Will be set later
              notes: '',
              status: 'DRAFT'
            })
          })
          
          if (!newRequestResponse.ok) throw new Error('Failed to create request')
          
          const newRequest = await newRequestResponse.json()
          setActiveRequest(newRequest)
        }
      } catch (error) {
        console.error('Error initializing request:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeRequest()
  }, [user])

  const addToRequestList = useCallback(async (product: Omit<Buy4MeItem, 'id' | 'total_price' | 'created_at'>) => {
    if (!user || !activeRequest) throw new Error('No active request')

    const token = localStorage.getItem('auth_token')
    // console.log("activeRequest: ", activeRequest)
    const response = await fetch(`http://localhost:8000/api/buy4me/requests/${activeRequest.id}/items/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product)
    })

    if (!response.ok) {
      throw new Error('Failed to add item to request')
    }

    const newItem = await response.json()
    
    // Update active request with new item
    setActiveRequest(prev => prev ? {
      ...prev,
      items: [...prev.items, newItem]
    } : null)
    
    return newItem
  }, [user, activeRequest])

  const updateItem = useCallback(async (itemId: string, updates: Partial<Buy4MeItem>) => {
    if (!user || !activeRequest) throw new Error('No active request')

    const token = localStorage.getItem('auth_token')
    const response = await fetch(`http://localhost:8000/api/buy4me/requests/${activeRequest.id}/items/${itemId}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates)
    })

    if (!response.ok) {
      throw new Error('Failed to update item')
    }

    const updatedItem = await response.json()
    
    // Update active request with updated item
    setActiveRequest(prev => prev ? {
      ...prev,
      items: prev.items.map(item => item.id === itemId ? updatedItem : item)
    } : null)
  }, [user, activeRequest])

  const removeItem = useCallback(async (itemId: string) => {
    if (!user || !activeRequest) throw new Error('No active request')

    const token = localStorage.getItem('auth_token')
    const response = await fetch(`http://localhost:8000/api/buy4me/requests/${activeRequest.id}/items/${itemId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    })

    if (!response.ok) {
      throw new Error('Failed to remove item')
    }

    // Update active request without removed item
    setActiveRequest(prev => prev ? {
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    } : null)
  }, [user, activeRequest])

  const calculateTotals = useCallback(() => {
    if (!activeRequest) return { productsTotal: 0, serviceFee: 0, shipping: 0, total: 0 }

    const productsTotal = activeRequest.items.reduce(
      (sum, item) => sum + (parseFloat(item.unit_price) * item.quantity),
      0
    )

    const serviceFee = (productsTotal * serviceFeePercentage) / 100
    const shipping = baseShippingRate * activeRequest.items.length

    return {
      productsTotal,
      serviceFee,
      shipping,
      total: productsTotal + serviceFee + shipping
    }
  }, [activeRequest])

  const submitRequest = useCallback(async (shippingAddress: string) => {
    if (!user || !activeRequest) throw new Error('No active request')
    if (activeRequest.items.length === 0) throw new Error('No items in request')

    const token = localStorage.getItem('auth_token')
    const response = await fetch(`http://localhost:8000/api/buy4me/requests/${activeRequest.id}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shipping_address: shippingAddress,
        status: 'SUBMITTED'
      })
    })

    if (!response.ok) {
      throw new Error('Failed to submit request')
    }

    const submittedRequest = await response.json()
    setActiveRequest(null) // Clear active request after submission
    return submittedRequest
  }, [user, activeRequest])

  return {
    activeRequest,
    loading,
    addToRequestList,
    updateItem,
    removeItem,
    calculateTotals,
    submitRequest
  }
}