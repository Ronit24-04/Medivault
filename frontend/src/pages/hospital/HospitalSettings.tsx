import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Save,
  Loader2,
} from "lucide-react";
import { useHospitalProfile, useUpdateHospitalProfile } from "@/hooks/useHospital";
import { useProfile } from "@/hooks/useAuth";

export default function HospitalSettings() {
  const { data: authProfile } = useProfile();
  const { data: hospitalProfile, isLoading } = useHospitalProfile();
  const updateProfile = useUpdateHospitalProfile();

  // Form state
  const [hospitalName, setHospitalName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Pre-fill form when profile loads
  useEffect(() => {
    if (hospitalProfile) {
      setHospitalName(hospitalProfile.hospital_name ?? "");
      setAddress(hospitalProfile.address ?? "");
      setCity(hospitalProfile.city ?? "");
      setStateVal(hospitalProfile.state ?? "");
      setPhone(hospitalProfile.phone_number ?? "");
      setEmail(hospitalProfile.email ?? authProfile?.email ?? "");
    } else if (authProfile) {
      setEmail(authProfile.email ?? "");
    }
  }, [hospitalProfile, authProfile]);

  const handleSave = () => {
    updateProfile.mutate({
      hospitalName,
      address,
      city,
      state: stateVal,
      phoneNumber: phone,
      email,
    });
  };

  const hasDirtyFields = !isLoading;

  if (isLoading) {
    return (
      <DashboardLayout userType="hospital">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="hospital">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your hospital profile and preferences.</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={updateProfile.isPending || !hasDirtyFields}
          >
            {updateProfile.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>

        {/* Hospital Profile */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="icon-container">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Hospital Profile</CardTitle>
                <CardDescription>Update your hospital's public information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="hospitalName">Hospital Name</Label>
                <div className="relative mt-1">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="hospitalName"
                    className="pl-10"
                    placeholder="Enter hospital name"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    className="pl-10"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-10"
                    placeholder="hospital@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="icon-container">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Location</CardTitle>
                <CardDescription>Update your hospital's address details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Street Address</Label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="address"
                  className="pl-10"
                  placeholder="123 Medical Street"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Mumbai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="Maharashtra"
                  value={stateVal}
                  onChange={(e) => setStateVal(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Info (Read-only) */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Read-only details from your admin account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Separator />
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-muted-foreground">Account Email</span>
              <span className="text-sm font-medium">{authProfile?.email ?? "—"}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-muted-foreground">Account Type</span>
              <span className="text-sm font-medium capitalize">{authProfile?.user_type ?? "hospital"}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-muted-foreground">Hospital Type</span>
              <span className="text-sm font-medium capitalize">
                {hospitalProfile?.hospital_type ?? "—"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
