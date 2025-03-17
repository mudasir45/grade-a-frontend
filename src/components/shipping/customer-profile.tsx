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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useBuy4Me } from "@/hooks/use-buy4me";
import { useToast } from "@/hooks/use-toast";
import { Country, ServiceType } from "@/lib/types/index";
import { Lock } from "lucide-react";
import { useEffect, useState } from "react";
export function CustomerProfile() {
  const {
    user,
    getUser,
    loading: authLoading,
    changePassword: changePasswordRequest,
    updateUser: updateUserRequest,
  } = useAuth();
  const { toast } = useToast();
  const { getUserCountries, loading: isLoading, getServiceTypes } = useBuy4Me();
  const [loading, setLoading] = useState(false);
  const [userCountries, setUserCountries] = useState<Country[]>([]);
  const [changePassword, setChangePassword] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [formData, setFormData] = useState({
    name: user?.first_name + " " + user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone_number || "",
    country: user?.country || "",
    currency: user?.preferred_currency || "USD",
    country_details: user?.country_details || "",
    default_shipping_method: user?.default_shipping_method || "",
  });

  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);

  useEffect(() => {
    const fetchCountries = async () => {
      const countries = await getUserCountries();
      setUserCountries(countries);
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    const fetchServiceTypes = async () => {
      const serviceTypes = await getServiceTypes();
      setServiceTypes(serviceTypes);
    };
    fetchServiceTypes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await updateUserRequest({
        first_name: formData.name.split(" ")[0],
        last_name: formData.name.split(" ")[1],
        email: formData.email,
        phone_number: formData.phone,
        country: formData.country,
        preferred_currency: formData.currency,
        default_shipping_method: formData.default_shipping_method,
      });
      console.log("formData", response);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (changePassword.newPassword !== changePassword.confirmPassword) {
      toast({
        title: "Error",
        description: "New password and confirm password do not match.",
        variant: "destructive",
      });
      return;
    }
    try {
      const response = await changePasswordRequest(
        changePassword.oldPassword,
        changePassword.newPassword
      );
      console.log("response at change password", response);
      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully.",
      });
      setChangePassword({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-10 h-10 border-t-transparent border-b-transparent border-r-transparent border-l-blue-500 rounded-full animate-spin border-4"></div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>
            Manage your Buy4Me account settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select
                value={formData.country}
                onValueChange={(value) =>
                  setFormData({ ...formData, country: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  {userCountries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      <span className="flex items-center gap-2">
                        <span>
                          {country.name} ({country.code})
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Preferred Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) =>
                  setFormData({ ...formData, currency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default_shipping_method">
                Default Shipping Method
              </Label>
              <Select
                value={formData.default_shipping_method}
                onValueChange={(value) =>
                  setFormData({ ...formData, default_shipping_method: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select default shipping method" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((serviceType) => (
                    <SelectItem key={serviceType.id} value={serviceType.id}>
                      <span className="flex items-center gap-2">
                        <span>{serviceType.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <CardTitle>Notification Settings</CardTitle>
            </div>
            <CardDescription>
              Manage how you receive updates about your orders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
          </CardContent>
        </Card> */}

        {/* <Card >
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <CardTitle>Payment Methods</CardTitle>
            </div>
            <CardDescription>
              Manage your payment methods and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full">
              Add Payment Method
            </Button>
            <p className="text-sm text-muted-foreground">
              No payment methods added yet
            </p>
          </CardContent>
        </Card> */}

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>
              Manage your account security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="old-password">Old Password</Label>
              <Input
                id="old-password"
                value={changePassword.oldPassword}
                onChange={(e) =>
                  setChangePassword({
                    ...changePassword,
                    oldPassword: e.target.value,
                  })
                }
                type="password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                value={changePassword.newPassword}
                onChange={(e) =>
                  setChangePassword({
                    ...changePassword,
                    newPassword: e.target.value,
                  })
                }
                type="password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirm New Password</Label>
              <Input
                id="confirm-new-password"
                value={changePassword.confirmPassword}
                onChange={(e) =>
                  setChangePassword({
                    ...changePassword,
                    confirmPassword: e.target.value,
                  })
                }
                type="password"
              />
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handlePasswordChange}
            >
              Change Password
            </Button>
            {/* <Button variant="outline" className="w-full">
              Two-Factor Authentication
            </Button> */}
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <CardTitle>Language & Region</CardTitle>
            </div>
            <CardDescription>
              Customize your regional preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select defaultValue="en">
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Time Zone</Label>
              <Select defaultValue="utc">
                <SelectTrigger>
                  <SelectValue placeholder="Select time zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utc">UTC</SelectItem>
                  <SelectItem value="est">Eastern Time</SelectItem>
                  <SelectItem value="pst">Pacific Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}
