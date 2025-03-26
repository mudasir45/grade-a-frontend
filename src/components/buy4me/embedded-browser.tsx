"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useBuy4Me } from "@/hooks/use-buy4me";
import { useToast } from "@/hooks/use-toast";
// import { supportedStores } from "@/lib/buy4me-data";
import { motion } from "framer-motion";
import { ExternalLink, Loader2, Search, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

interface SupportedStore {
  id: number;
  name: string;
  description: string;
  url: string;
  is_active: boolean;
}

export function EmbeddedBrowser() {
  const { toast } = useToast();
  const {
    addToRequestList,
    loading: buy4meLoading,
    getSupportedStores,
  } = useBuy4Me();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [productUrl, setProductUrl] = useState("");
  const [supportedStores, setSupportedStores] = useState<SupportedStore[]>([]);
  const [productForm, setProductForm] = useState({
    url: "",
    name: "",
    price: "",
    quantity: "1",
    color: "",
    size: "",
    notes: "",
  });
  const [urlError, setUrlError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSupportedStores = async () => {
      const data = await getSupportedStores();
      setSupportedStores(data);
    };
    fetchSupportedStores();
  }, [getSupportedStores]);

  // Add URL validation function
  const validateProductUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      const isSupportedStore = supportedStores.some((store) => {
        const storeUrl = new URL(store.url);
        return urlObj.hostname === storeUrl.hostname;
      });

      if (!isSupportedStore) {
        setUrlError(
          "This URL is not from a supported store. Please use a URL from one of our supported stores."
        );
        return false;
      }

      setUrlError(null);
      return true;
    } catch (error) {
      setUrlError("Please enter a valid URL");
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setUrlError(null);

      if (!productForm.url || !productForm.name || !productForm.price) {
        throw new Error("Please fill in all required fields");
      }

      // Validate URL before proceeding
      if (!validateProductUrl(productForm.url)) {
        return;
      }

      const price = parseFloat(productForm.price);
      if (isNaN(price) || price <= 0) {
        throw new Error("Please enter a valid price");
      }

      const quantity = parseInt(productForm.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        throw new Error("Please enter a valid quantity");
      }

      const product = {
        product_name: productForm.name,
        unit_price: price.toString(),
        currency: "USD",
        product_url: productForm.url,
        quantity: quantity,
        color: productForm.color,
        size: productForm.size,
        notes: productForm.notes,
      };

      await addToRequestList(product);

      // Reset forms
      setProductUrl("");
      setProductForm({
        url: "",
        name: "",
        price: "",
        quantity: "1",
        color: "",
        size: "",
        notes: "",
      });

      toast({
        title: "Product Added",
        description: "The item has been added to your request list.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to add product to request list.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add URL validation on input change
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setProductForm({ ...productForm, url });
    if (url) {
      validateProductUrl(url);
    } else {
      setUrlError(null);
    }
  };

  if (buy4meLoading) {
    return <div>Loading...</div>;
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
            <p className="mt-2 text-sm text-muted-foreground">
              {store.description}
            </p>
          </motion.a>
        ))}
      </div>

      {/* URL Analysis */}
      <Card className="hidden">
        <CardHeader>
          <CardTitle>Analyze Product URL</CardTitle>
          <CardDescription>
            Enter a product URL from any supported store to fetch details
            automatically
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
            <Button disabled={analyzing || !productUrl}>
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
                  onChange={handleUrlChange}
                  placeholder="Product URL"
                  className={urlError ? "border-red-500" : ""}
                />
                {urlError && <p className="text-sm text-red-500">{urlError}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Product Name *</label>
                <Input
                  required
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm({ ...productForm, name: e.target.value })
                  }
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
                  onChange={(e) =>
                    setProductForm({ ...productForm, price: e.target.value })
                  }
                  placeholder="Enter price"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity</label>
                <Input
                  type="number"
                  min="1"
                  value={productForm.quantity}
                  onChange={(e) =>
                    setProductForm({ ...productForm, quantity: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Color</label>
                <Input
                  value={productForm.color}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      color: e.target.value,
                    })
                  }
                  placeholder="Size, color, or other specifications"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Size</label>
                <Input
                  value={productForm.size}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      size: e.target.value,
                    })
                  }
                  placeholder="Size, color, or other specifications"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Additional Notes</label>
                <Textarea
                  value={productForm.notes}
                  onChange={(e) =>
                    setProductForm({ ...productForm, notes: e.target.value })
                  }
                  placeholder="Any special instructions or notes"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                {loading ? "Adding..." : "Add to Request List"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
