import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useProfileStore } from "@/stores/useProfileStore";
import { patientsService } from "@/api/services";
import { toast } from "sonner";

const getSavedCoordinatesFromAddress = (
  rawAddress?: string
): { latitude?: number; longitude?: number } => {
  if (!rawAddress) return {};
  try {
    const parsed = JSON.parse(rawAddress);
    const latitude =
      parsed?.latitude !== undefined ? Number(parsed.latitude) : undefined;
    const longitude =
      parsed?.longitude !== undefined ? Number(parsed.longitude) : undefined;
    return {
      latitude: Number.isFinite(latitude) ? latitude : undefined,
      longitude: Number.isFinite(longitude) ? longitude : undefined,
    };
  } catch (_error) {
    return {};
  }
};

export default function PatientUnlock() {
  const navigate = useNavigate();
  const { currentProfile, isLocked, unlockProfile, loadProfiles } = useProfileStore();
  const [pin, setPin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [isSendingAlert, setIsSendingAlert] = useState(false);

  useEffect(() => {
    if (!currentProfile) {
      loadProfiles();
    }
  }, [currentProfile, loadProfiles]);

  useEffect(() => {
    if (!isLocked) {
      navigate("/patient/dashboard", { replace: true });
    }
  }, [isLocked, navigate]);

  const handleUnlock = async () => {
    if (!currentProfile?.patient_id) {
      toast.error("No profile selected");
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      toast.error("Enter a valid 4-digit PIN");
      return;
    }

    try {
      setIsVerifying(true);
      await patientsService.verifyProfilePin(currentProfile.patient_id, pin);
      unlockProfile();
      toast.success("Profile unlocked");
      navigate("/patient/dashboard", { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid PIN");
    } finally {
      setIsVerifying(false);
      setPin("");
    }
  };

  const handleSendEmergencyAlert = async () => {
    if (!currentProfile?.patient_id) {
      toast.error("No profile selected");
      return;
    }

    try {
      setIsSendingAlert(true);
      const getCoordinates = () =>
        new Promise<{ latitude?: number; longitude?: number }>((resolve) => {
          const savedCoords = getSavedCoordinatesFromAddress(currentProfile.address);

          if (!navigator.geolocation) {
            resolve(savedCoords);
            return;
          }

          navigator.geolocation.getCurrentPosition(
            (position) =>
              resolve({
                latitude: Number(position.coords.latitude.toFixed(6)),
                longitude: Number(position.coords.longitude.toFixed(6)),
              }),
            () => resolve(savedCoords),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        });

      const coords = await getCoordinates();
      await patientsService.sendEmergencyAlert(currentProfile.patient_id, coords);
      toast.success("Emergency alert sent successfully");
      setShowEmergency(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send emergency alert");
    } finally {
      setIsSendingAlert(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/20">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Profile Locked
          </CardTitle>
          <CardDescription>
            Enter your 4-digit PIN to access your profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pin">4-digit PIN</Label>
            <Input
              id="pin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleUnlock();
                }
              }}
            />
          </div>
          <Button className="w-full" onClick={handleUnlock} disabled={isVerifying}>
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Unlock Profile"
            )}
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate("/login", { replace: true })}>
            Back to Login
          </Button>
          <Button
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            onClick={() => setShowEmergency(true)}
          >
            Emergency
          </Button>
        </CardContent>
      </Card>

      {showEmergency && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[400px] shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-red-600">
              Emergency Information
            </h2>

            <p>
              Name: <span className="font-semibold">{currentProfile?.full_name || "No profile"}</span>
            </p>
            <p>
              Blood group: <span className="font-semibold">{currentProfile?.blood_group || "N/A"}</span>
            </p>
            <p>
              Allergy:{" "}
              <span className="font-semibold text-red-500">
                {currentProfile?.allergies || "N/A"}
              </span>
            </p>
            <p>
              Conditions: <span className="font-semibold">{currentProfile?.existing_conditions || "N/A"}</span>
            </p>

            <div className="mt-5 flex gap-3">
              <button
                onClick={handleSendEmergencyAlert}
                disabled={isSendingAlert}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
              >
                {isSendingAlert ? "Sending..." : "Send Alert"}
              </button>
              <button
                onClick={() => setShowEmergency(false)}
                className="flex-1 bg-gray-900 text-white py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
