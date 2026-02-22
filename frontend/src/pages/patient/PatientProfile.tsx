import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { patientsService } from "@/api/services";
import apiClient from "@/api/client";
import { useProfileStore } from "@/stores/useProfileStore";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from "@/hooks/useAuth";
import {
  useCreateContact,
  useDeleteContact,
  useEmergencyContacts,
  useUpdateContact,
} from "@/hooks/useEmergency";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, User, Phone, MapPin, Droplets } from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/api\/?$/, "");
const MAX_EMERGENCY_CONTACTS = 4;

type EmergencyContactForm = {
  name: string;
  relationship: string;
  phoneNumber: string;
};

type AddressParts = {
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: string;
  longitude: string;
};

const parseAddress = (rawAddress?: string): AddressParts => {
  if (!rawAddress) {
    return {
      streetAddress: "",
      city: "",
      state: "",
      zipCode: "",
      latitude: "",
      longitude: "",
    };
  }

  try {
    const parsed = JSON.parse(rawAddress);
    return {
      streetAddress: parsed.streetAddress || "",
      city: parsed.city || "",
      state: parsed.state || "",
      zipCode: parsed.zipCode || "",
      latitude:
        parsed.latitude !== undefined && parsed.latitude !== null
          ? String(parsed.latitude)
          : "",
      longitude:
        parsed.longitude !== undefined && parsed.longitude !== null
          ? String(parsed.longitude)
          : "",
    };
  } catch (_error) {
    return {
      streetAddress: rawAddress,
      city: "",
      state: "",
      zipCode: "",
      latitude: "",
      longitude: "",
    };
  }
};

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
const [dateOfBirth, setDateOfBirth] = useState("");
const [gender, setGender] = useState("");
const [streetAddress, setStreetAddress] = useState("");
const [city, setCity] = useState("");
const [state, setState] = useState("");
const [zipCode, setZipCode] = useState("");
const [latitude, setLatitude] = useState("");
const [longitude, setLongitude] = useState("");
const [isLocatingAddress, setIsLocatingAddress] = useState(false);
const [profilePin, setProfilePin] = useState("");
const [emergencyContactsForm, setEmergencyContactsForm] = useState<EmergencyContactForm[]>(
  Array.from({ length: MAX_EMERGENCY_CONTACTS }, () => ({
    name: "",
    relationship: "",
    phoneNumber: "",
  }))
);
const [isSaving, setIsSaving] = useState(false);
const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false);
const profileImageInputRef = useRef<HTMLInputElement | null>(null);

  const { data: contacts = [] } = useEmergencyContacts();
  const createContactMutation = useCreateContact();
  const updateContactMutation = useUpdateContact();
  const deleteContactMutation = useDeleteContact();

  const { data: user, isLoading } = useProfile();
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;
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
    setDateOfBirth(
      currentProfile.date_of_birth
        ? (() => {
            const normalizedDob = new Date(currentProfile.date_of_birth)
              .toISOString()
              .slice(0, 10);
            return normalizedDob === "1900-01-01" ? "2000-01-01" : normalizedDob;
          })()
        : "2000-01-01"
    );
    setGender(currentProfile.gender || "");
    const parsedAddress = parseAddress(currentProfile.address);
    setStreetAddress(parsedAddress.streetAddress);
    setCity(parsedAddress.city);
    setState(parsedAddress.state);
    setZipCode(parsedAddress.zipCode);
    setLatitude(parsedAddress.latitude);
    setLongitude(parsedAddress.longitude);
  }
  // fallback → backend user
  else if (user) {
    setFirstName(user.email?.split("@")[0] || "");
    setPhone(user.phone_number || "");
  }
}, [user, currentProfile]);

  const patientEmergencyContacts = useMemo(() => {
    if (!currentProfile) return [];

    return contacts
      .filter(
        (contact) =>
          contact.patient_id === currentProfile.patient_id && contact.is_active
      )
      .sort((a, b) => a.priority - b.priority)
      .slice(0, MAX_EMERGENCY_CONTACTS);
  }, [contacts, currentProfile]);

  useEffect(() => {
    const nextContacts = Array.from({ length: MAX_EMERGENCY_CONTACTS }, (_, index) => {
      const contact = patientEmergencyContacts[index];
      return {
        name: contact?.name || "",
        relationship: contact?.relationship || "",
        phoneNumber: contact?.phone_number || "",
      };
    });

    setEmergencyContactsForm(nextContacts);
  }, [patientEmergencyContacts]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleSaveChanges = async () => {
    try {
      if (!currentProfile?.patient_id) return;

      setIsSaving(true);

      const payload = {
        fullName: `${firstName} ${lastName}`.trim(),
        address: JSON.stringify({
          streetAddress: streetAddress.trim(),
          city: city.trim(),
          state: state.trim(),
          zipCode: zipCode.trim(),
          latitude: latitude ? Number(latitude) : undefined,
          longitude: longitude ? Number(longitude) : undefined,
        }),
        ...(dateOfBirth && { dateOfBirth }),
        ...(gender && { gender }),
        ...(bloodGroup && { bloodType: bloodGroup }),
        ...(height && { height: Number(height) }),
        ...(weight && { weight: Number(weight) }),
        ...(profilePin ? { emergencyPin: profilePin } : {}),
      };

      if (profilePin && !/^\d{4}$/.test(profilePin)) {
        throw new Error("Profile PIN must be exactly 4 digits.");
      }

      const updated = await patientsService.updatePatient(
        currentProfile.patient_id,
        payload
      );

      for (let index = 0; index < MAX_EMERGENCY_CONTACTS; index += 1) {
        const formContact = emergencyContactsForm[index];
        const existingContact = patientEmergencyContacts[index];

        const normalizedContact = {
          name: formContact.name.trim(),
          relationship: formContact.relationship.trim(),
          phoneNumber: formContact.phoneNumber.trim(),
        };
        const hasAnyField =
          normalizedContact.name ||
          normalizedContact.relationship ||
          normalizedContact.phoneNumber;
        const isComplete =
          normalizedContact.name &&
          normalizedContact.relationship &&
          normalizedContact.phoneNumber;

        if (hasAnyField && !isComplete) {
          throw new Error(
            `Please fill all emergency contact fields for contact #${index + 1}.`
          );
        }

        if (isComplete) {
          if (existingContact) {
            await updateContactMutation.mutateAsync({
              contactId: existingContact.contact_id,
              data: {
                ...normalizedContact,
                priority: index + 1,
              },
            });
          } else {
            await createContactMutation.mutateAsync({
              patientId: currentProfile.patient_id,
              ...normalizedContact,
              priority: index + 1,
            });
          }
        } else if (existingContact) {
          await deleteContactMutation.mutateAsync(existingContact.contact_id);
        }
      }

      setCurrentProfile({
        ...updated,
        address: JSON.stringify({
          streetAddress: streetAddress.trim(),
          city: city.trim(),
          state: state.trim(),
          zipCode: zipCode.trim(),
          latitude: latitude ? Number(latitude) : undefined,
          longitude: longitude ? Number(longitude) : undefined,
        }),
        date_of_birth: dateOfBirth,
        gender,
        blood_group: bloodGroup,
        allergies: allergies,
        existing_conditions: conditions,
        height: height,
        weight: weight,
      } as any);

      toast.success("Profile updated successfully");
      setProfilePin("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const updateEmergencyContactField = (
    index: number,
    field: keyof EmergencyContactForm,
    value: string
  ) => {
    setEmergencyContactsForm((previousContacts) =>
      previousContacts.map((contact, currentIndex) =>
        currentIndex === index
          ? { ...contact, [field]: value }
          : contact
      )
    );
  };

  const handleProfileImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !currentProfile?.patient_id) return;

    try {
      setIsUploadingProfileImage(true);

      const formData = new FormData();
      formData.append("profileImage", file);

      const response = await apiClient.put(
        `/patients/${currentProfile.patient_id}/profile-image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const updatedPatient = response.data?.data;
      if (updatedPatient) {
        setCurrentProfile({
          ...currentProfile,
          ...updatedPatient,
        } as any);
      }

      toast.success("Profile image updated");
    } catch (error) {
      toast.error("Failed to upload profile image");
    } finally {
      if (profileImageInputRef.current) {
        profileImageInputRef.current.value = "";
      }
      setIsUploadingProfileImage(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported in this browser.");
      return;
    }

    const applyAddressFromCoords = async (lat: number, lng: number) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
        );
        if (!response.ok) {
          throw new Error("Reverse geocoding failed");
        }
        const data = await response.json();
        const addressData = data?.address || {};
        const normalizedLat = Number(lat.toFixed(6));
        const normalizedLng = Number(lng.toFixed(6));

        setStreetAddress(
          data?.display_name ||
            [addressData.house_number, addressData.road].filter(Boolean).join(" ")
        );
        setCity(addressData.city || addressData.town || addressData.village || "");
        setState(addressData.state || "");
        setZipCode(addressData.postcode || "");
        setLatitude(String(normalizedLat));
        setLongitude(String(normalizedLng));
        toast.success("Current location added to address.");
      } catch (_error) {
        setStreetAddress(`Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`);
        setLatitude(String(Number(lat.toFixed(6))));
        setLongitude(String(Number(lng.toFixed(6))));
        toast.success("Coordinates captured. Please complete city/state/zip manually.");
      } finally {
        setIsLocatingAddress(false);
      }
    };

    const tryIpFallback = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        if (!response.ok) {
          throw new Error("IP lookup failed");
        }
        const data = await response.json();
        if (typeof data.latitude === "number" && typeof data.longitude === "number") {
          const lat = Number(data.latitude.toFixed(6));
          const lng = Number(data.longitude.toFixed(6));
          setStreetAddress(data.org || "Approximate location");
          setCity(data.city || "");
          setState(data.region || "");
          setZipCode(data.postal || "");
          setLatitude(String(lat));
          setLongitude(String(lng));
          toast.success("Approximate address added from network.");
        } else {
          throw new Error("No coordinates");
        }
      } catch (_error) {
        toast.error("Location unavailable. Please enter address manually.");
      } finally {
        setIsLocatingAddress(false);
      }
    };

    setIsLocatingAddress(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await applyAddressFromCoords(position.coords.latitude, position.coords.longitude);
      },
      async () => {
        await tryIpFallback();
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

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
                  <AvatarImage
                    src={
                      currentProfile?.profile_image
                        ? `${API_BASE_URL}${currentProfile.profile_image}`
                        : "/placeholder.svg"
                    }
                  />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                  onClick={() => profileImageInputRef.current?.click()}
                  disabled={isUploadingProfileImage}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <input
                  ref={profileImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfileImageUpload}
                />
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-semibold">
  {currentProfile?.full_name || `${firstName} ${lastName}`.trim() || "Patient"}
</h2>
                <p className="text-muted-foreground">
  {user?.email}
</p>
                <p className="text-sm text-muted-foreground">
                  Member since {memberSince || "N/A"}
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
                <Input
                  id="dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
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
<Input
  id="conditions"
  value={conditions}
  onChange={(e) => setConditions(e.target.value)}
/>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Profile PIN Protection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="profilePin">4-digit PIN</Label>
            <Input
              id="profilePin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="Enter 4-digit PIN"
              value={profilePin}
              onChange={(e) => setProfilePin(e.target.value.replace(/\D/g, ""))}
            />
            <p className="text-xs text-muted-foreground">
              This PIN will lock/unlock your patient profile when returning to the app.
            </p>
          </CardContent>
        </Card>

        {/* Patient address */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUseCurrentLocation}
                disabled={isLocatingAddress}
              >
                {isLocatingAddress ? "Locating..." : "Use Current Location"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder="Enter your address"
              />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP Code</Label>
                <Input
                  id="zip"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="ZIP Code"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="Latitude"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="Longitude"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency contacts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {emergencyContactsForm.map((contact, index) => (
              <div key={index} className="space-y-4 rounded-md border p-4">
                <p className="text-sm font-medium">Contact #{index + 1}</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`emergencyName-${index}`}>Contact Name</Label>
                    <Input
                      id={`emergencyName-${index}`}
                      value={contact.name}
                      onChange={(e) =>
                        updateEmergencyContactField(index, "name", e.target.value)
                      }
                      placeholder="Enter contact name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`emergencyRelation-${index}`}>Relationship</Label>
                    <Input
                      id={`emergencyRelation-${index}`}
                      value={contact.relationship}
                      onChange={(e) =>
                        updateEmergencyContactField(
                          index,
                          "relationship",
                          e.target.value
                        )
                      }
                      placeholder="e.g. Spouse"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`emergencyPhone-${index}`}>Phone Number</Label>
                  <Input
                    id={`emergencyPhone-${index}`}
                    value={contact.phoneNumber}
                    onChange={(e) =>
                      updateEmergencyContactField(
                        index,
                        "phoneNumber",
                        e.target.value
                      )
                    }
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* save button */}
       <div className="flex justify-end">
  <Button
    size="lg"
    onClick={handleSaveChanges}
    disabled={isSaving}
  >
    {isSaving ? "Saving..." : "Save Changes"}
  </Button>
</div>
      </div>
    </DashboardLayout>
  );
}
