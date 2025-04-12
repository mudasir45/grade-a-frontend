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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useBuy4Me } from "@/hooks/use-buy4me";
import { useToast } from "@/hooks/use-toast";
import { Currency, SupportedStore } from "@/lib/types/index";
// import { supportedStores } from "@/lib/buy4me-data";
import { motion } from "framer-motion";
import { ExternalLink, Loader2, Search, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export function EmbeddedBrowser() {
  const { toast } = useToast();
  const {
    addToRequestList,
    loading: buy4meLoading,
    getSupportedStores,
    getCurrencies,
  } = useBuy4Me();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [productUrl, setProductUrl] = useState("");
  const [supportedStores, setSupportedStores] = useState<SupportedStore[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USD");
  const [productForm, setProductForm] = useState({
    url: "",
    name: "",
    price: "",
    quantity: "1",
    color: "",
    size: "",
    notes: "",
    store_to_warehouse_delivery_charge: "0",
    currency: "USD",
  });
  const [confirmedCharges, setConfirmedCharges] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSupportedStores = async () => {
      const data = await getSupportedStores();
      setSupportedStores(data);
    };
    fetchSupportedStores();
  }, [getSupportedStores]);

  useEffect(() => {
    const fetchCurrencies = async () => {
      const currencies = await getCurrencies();
      setCurrencies(currencies);

      if (user && user.preferred_currency) {
        setSelectedCurrency(user.preferred_currency);
        setProductForm((prev) => ({
          ...prev,
          currency: user?.preferred_currency || "",
        }));
      }
    };
    fetchCurrencies();
  }, [getCurrencies, user]);

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

      const deliveryCharges = parseFloat(
        productForm.store_to_warehouse_delivery_charge
      );
      if (isNaN(deliveryCharges) || deliveryCharges < 0) {
        throw new Error("Please enter a valid delivery charge amount");
      }

      if (!confirmedCharges) {
        throw new Error(
          "Please confirm that the delivery charges are accurate"
        );
      }

      // Find the currency code based on the selected currency ID
      const selectedCurrencyObj = currencies.find(
        (currency) => currency.id.toString() === productForm.currency
      );

      if (!selectedCurrencyObj) {
        throw new Error("Selected currency is invalid");
      }

      const product = {
        product_name: productForm.name,
        unit_price: price.toString(),
        currency: selectedCurrencyObj.code, // Use currency CODE, not ID
        product_url: productForm.url,
        quantity: quantity,
        color: productForm.color,
        size: productForm.size,
        notes: productForm.notes,
        store_to_warehouse_delivery_charge: deliveryCharges.toString(),
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
        store_to_warehouse_delivery_charge: "0",
        currency: selectedCurrency, // Keep the selected currency
      });
      setConfirmedCharges(false);

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

  // Add a helper function to safely get the currency code
  const getCurrencyCodeById = (currencyId: string): string => {
    if (!currencyId) return "";

    const found = currencies.find(
      (currency) => currency.id.toString() === currencyId
    );

    return found?.code || currencyId;
  };

  if (buy4meLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center justify-center space-y-2 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            SHOP ONLINE
          </h1>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-sm sm:text-base text-muted-foreground text-center max-w-md">
            Discover and shop from popular international brands available in
            Malaysia
          </p>
        </motion.div>
      </div>

      {/* Supported Stores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {supportedStores.map((store) => (
          <motion.a
            key={store.id}
            href={store.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block p-4 rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                {store.logo ? (
                  <Image
                    src={store.logo}
                    alt={store.name}
                    width={48}
                    height={48}
                    className="object-contain p-1"
                  />
                ) : (
                  <span className="text-xl font-semibold text-muted-foreground">
                    {store.name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{store.name}</h3>
                <p className="text-xs text-muted-foreground truncate">
                  {store.description}
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
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
                <label className="text-sm font-medium">Price *</label>
                <div className="flex gap-2">
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
                    className="flex-1"
                  />
                  <Select
                    value={productForm.currency}
                    onValueChange={(value) => {
                      setSelectedCurrency(value);
                      setProductForm({ ...productForm, currency: value });
                    }}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem
                          key={currency.id}
                          value={currency.id.toString()}
                        >
                          {currency.code || currency.id.toString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                  placeholder="Specify color"
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
                  placeholder="Specify size"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Delivery Charges</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={productForm.store_to_warehouse_delivery_charge}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        store_to_warehouse_delivery_charge: e.target.value,
                      })
                    }
                    placeholder="Enter delivery charges"
                    className="flex-1"
                  />
                  <div className="w-[120px] bg-gray-100 rounded-md flex items-center justify-center px-3 text-sm text-gray-700">
                    {getCurrencyCodeById(productForm.currency)}
                  </div>
                </div>
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

              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="confirm-charges"
                    checked={confirmedCharges}
                    onChange={(e) => setConfirmedCharges(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="confirm-charges" className="text-sm">
                    I confirm that the delivery charges are accurate
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading || !confirmedCharges}>
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
