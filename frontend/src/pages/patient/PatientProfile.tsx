import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { patientsService } from "@/api/services";
import { useProfileStore } from "@/stores/useProfileStore";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from "@/hooks/useAuth";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, User, Mail, Phone, MapPin, Calendar, Droplets } from "lucide-react";

export default function PatientProfile() {
  const setCurrentProfile = useProfileStore((state) => state.setCurrentProfile);
  const currentProfile = useProfileStore((state) => state.currentProfile);

const [firstName, setFirstName] = useState("");
const [lastName, setLastName] = useState("");
const [phone, setPhone] = useState("");
const [bloodGroup, setBloodGroup] = useState("");
const [allergies, setAllergies] = useState("");
const [conditions, setConditions] = useState("");
const [height, setHeight] = useState("");
const [weight, setWeight] = useState("");

  const { data: user, isLoading } = useProfile();
  useEffect(() => {
  // FIRST priority → Zustand saved data
  if (currentProfile) {
    setFirstName(currentProfile.full_name?.split(" ")[0] || "");
    setLastName(currentProfile.full_name?.split(" ")[1] || "");
    setPhone(currentProfile.phone_number || "");
    setBloodGroup(currentProfile.blood_group || "");
    setAllergies(currentProfile.allergies || "");
    setConditions(currentProfile.existing_conditions || "");
    setHeight(currentProfile.height || "");
setWeight(currentProfile.weight || "");
  }
  // fallback → backend user
  else if (user) {
    setFirstName(user.email?.split("@")[0] || "");
    setPhone(user.phone_number || "");
  }
}, [user, currentProfile]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <DashboardLayout userType="patient">
      <div className="space-y-6 max-w-4xl">
        {/* Main header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal and medical information.
          </p>
        </div>

        {/* Profile picture of the user */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-semibold">
  {user?.email}
</h2>
                <p className="text-muted-foreground">
  {user?.email}
</p>
                <p className="text-sm text-muted-foreground">
                  Member since January 2024
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal information user */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
  id="firstName"
  value={firstName || user?.email?.split("@")[0] || ""}
  onChange={(e) => setFirstName(e.target.value)}
/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
               <Input
  id="lastName"
  value={lastName}
  onChange={(e) => setLastName(e.target.value)}
/>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={user?.email} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
               <Input
  id="phone"
  value={phone || user?.phone_number || ""}
  onChange={(e) => setPhone(e.target.value)}
/>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" type="date" defaultValue="1980-05-15" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select defaultValue="male">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical information of the patient */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Droplets className="h-5 w-5" />
              Medical Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <Select value={bloodGroup} onValueChange={setBloodGroup}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a+">A+</SelectItem>
                    <SelectItem value="a-">A-</SelectItem>
                    <SelectItem value="b+">B+</SelectItem>
                    <SelectItem value="b-">B-</SelectItem>
                    <SelectItem value="ab+">AB+</SelectItem>
                    <SelectItem value="ab-">AB-</SelectItem>
                    <SelectItem value="o+">O+</SelectItem>
                    <SelectItem value="o-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
  id="height"
  type="number"
  value={height}
  onChange={(e) => setHeight(e.target.value)}
/>

              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
               <Input
  id="weight"
  type="number"
  value={weight}
  onChange={(e) => setWeight(e.target.value)}
/>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
             <Input
  id="allergies"
  value={allergies}
  onChange={(e) => setAllergies(e.target.value)}
/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="conditions">Existing Conditions</Label>
              <Label htmlFor="conditions">Existing Conditions</Label>
<Input
  id="conditions"
  value={conditions}
  onChange={(e) => setConditions(e.target.value)}
/>
            </div>
          </CardContent>
        </Card>

        {/* Patient address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input id="address" defaultValue="123 Main Street" />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" defaultValue="New York" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" defaultValue="NY" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP Code</Label>
                <Input id="zip" defaultValue="10001" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency contacts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyName">Contact Name</Label>
                <Input id="emergencyName" defaultValue="Jane Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyRelation">Relationship</Label>
                <Input id="emergencyRelation" defaultValue="Spouse" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Phone Number</Label>
              <Input id="emergencyPhone" defaultValue="+1 (555) 987-6543" />
            </div>
          </CardContent>
        </Card>

        {/* save button */}
       <div className="flex justify-end">
  <Button
    size="lg"
    onClick={async () => {
      try {
        if (!currentProfile?.patient_id) return;

        const payload = {
  fullName: `${firstName} ${lastName}`,   // ✅ camelCase
  ...(bloodGroup && { bloodType: bloodGroup }),
  ...(height && { height: Number(height) }),
  ...(weight && { weight: Number(weight) }),
};
        console.log("🔥 SENDING TO BACKEND", payload);

        const updated = await patientsService.updatePatient(
          currentProfile.patient_id,
          payload
        );

        console.log("✅ BACKEND SAVED", updated);

       setCurrentProfile({
  ...updated, // backend fields
  blood_group: bloodGroup,
  allergies: allergies,
  existing_conditions: conditions,
  height: height,
  weight: weight,
});
      } catch (err) {
        console.error("❌ SAVE FAILED", err);
      }
    }}
  >
    Save Changes
  </Button>
</div>
      </div>
    </DashboardLayout>
  );
}
