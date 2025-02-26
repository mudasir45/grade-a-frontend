'use client'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useBuy4Me } from '@/hooks/use-buy4me'
import { useToast } from '@/hooks/use-toast'
import { supportedStores } from '@/lib/buy4me-data'
import { analyzeUrl } from '@/lib/url-analyzer'
import { motion } from 'framer-motion'
import { ExternalLink, Loader2, Search, ShoppingCart } from 'lucide-react'
import { useState } from 'react'

export function EmbeddedBrowser() {
  const { toast } = useToast()
  const { addToRequestList, loading: buy4meLoading } = useBuy4Me()
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [productUrl, setProductUrl] = useState('')
  const [productForm, setProductForm] = useState({
    url: '',
    name: '',
    price: '',
    quantity: '1',
    specifications: '',
    notes: ''
  })

  const handleAnalyzeUrl = async () => {
    if (!productUrl) {
      toast({
        title: 'Error',
        description: 'Please enter a product URL',
        variant: 'destructive',
      })
      return
    }

    setAnalyzing(true)
    try {
      const data = await analyzeUrl(productUrl)

      setProductForm({
        url: data.url,
        name: data.name,
        price: data.price.toString(),
        quantity: '1',
        specifications: '',
        notes: ''
      })

      toast({
        title: 'Success',
        description: 'Product details fetched successfully',
      })
    } catch (error) {
      console.error('Error analyzing URL:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to analyze URL',
        variant: 'destructive',
      })
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      if (!productForm.url || !productForm.name || !productForm.price) {
        throw new Error('Please fill in all required fields')
      }

      const price = parseFloat(productForm.price)
      if (isNaN(price) || price <= 0) {
        throw new Error('Please enter a valid price')
      }

      const quantity = parseInt(productForm.quantity)
      if (isNaN(quantity) || quantity <= 0) {
        throw new Error('Please enter a valid quantity')
      }

      const product = {
        product_name: productForm.name,
        unit_price: price.toString(),
        currency: 'USD',
        product_url: productForm.url,
        quantity: quantity,
        specifications: productForm.specifications,
        notes: productForm.notes
      }

      await addToRequestList(product)
      
      // Reset forms
      setProductUrl('')
      setProductForm({
        url: '',
        name: '',
        price: '',
        quantity: '1',
        specifications: '',
        notes: ''
      })

      toast({
        title: 'Product Added',
        description: 'The item has been added to your request list.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add product to request list.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (buy4meLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-8">
      {/* Supported Stores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {supportedStores.map((store) => (
          <motion.a
            key={store.id}
            href={store.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{store.name}</h3>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{store.description}</p>
          </motion.a>
        ))}
      </div>

      {/* URL Analysis */}
      <Card className='hidden'>
        <CardHeader>
          <CardTitle>Analyze Product URL</CardTitle>
          <CardDescription>
            Enter a product URL from any supported store to fetch details automatically
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              placeholder="Paste product URL here"
              className="flex-1"
            />
            <Button 
              onClick={handleAnalyzeUrl} 
              disabled={analyzing || !productUrl}
            >
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Analyze URL
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Product Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add Product to Request List</CardTitle>
          <CardDescription>
            Review and edit product details before adding to your request list
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Product URL *</label>
                <Input
                  required
                  type="url"
                  value={productForm.url}
                  onChange={(e) => setProductForm({ ...productForm, url: e.target.value })}
                  placeholder="Product URL"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Product Name *</label>
                <Input
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Enter product name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Price (USD) *</label>
                <Input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  placeholder="Enter price"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity</label>
                <Input
                  type="number"
                  min="1"
                  value={productForm.quantity}
                  onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Specifications</label>
                <Input
                  value={productForm.specifications}
                  onChange={(e) => setProductForm({ ...productForm, specifications: e.target.value })}
                  placeholder="Size, color, or other specifications"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Additional Notes</label>
                <Textarea
                  value={productForm.notes}
                  onChange={(e) => setProductForm({ ...productForm, notes: e.target.value })}
                  placeholder="Any special instructions or notes"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                {loading ? 'Adding...' : 'Add to Request List'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}