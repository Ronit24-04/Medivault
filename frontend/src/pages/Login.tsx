import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProfileStore } from "@/stores/useProfileStore";
import { patientsService } from "@/api/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Mail, Lock, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useLogin } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertCircle, MapPin, CheckCircle2, Phone } from "lucide-react";
import { format } from "date-fns";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<"patient" | "hospital">("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useLogin();
  const setProfiles = useProfileStore((state) => state.setProfiles);
  const unlockProfile = useProfileStore((state) => state.unlockProfile);

  // Emergency State
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false);
  const [emergencyEmail, setEmergencyEmail] = useState("");
  const [emergencyStep, setEmergencyStep] = useState<"email" | "info" | "success">("email");
  const [emergencyPatient, setEmergencyPatient] = useState<any>(null);
  const [isFetchingInfo, setIsFetchingInfo] = useState(false);
  const [isSendingAlert, setIsSendingAlert] = useState(false);
  const [hospitalInfo, setHospitalInfo] = useState<any>(null);

  const handleFetchEmergencyInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    // if (!emergencyEmail) return; // This line will be replaced by the new logic

    try {
      setIsFetchingInfo(true);
      const emailToUse = emergencyEmail || localStorage.getItem("emergencyEmail");
      if (!emailToUse) {
        toast.error("Please enter patient email");
        return;
      }
      const info = await patientsService.getPublicEmergencyInfo(emailToUse);
      setEmergencyPatient(info);
      setEmergencyStep("info");
      if (!emergencyEmail && emailToUse) setEmergencyEmail(emailToUse);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch information");
    } finally {
      setIsFetchingInfo(false);
    }
  };

  const handleConfirmAlert = async () => {
    try {
      setIsSendingAlert(true);

      // Get current location if possible
      const coords = await new Promise<{ latitude?: number; longitude?: number }>((resolve) => {
        if (!navigator.geolocation) return resolve({});
        navigator.geolocation.getCurrentPosition(
          (p) => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
          () => resolve({}),
          { timeout: 5000 }
        );
      });

      // Play sound
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3");
      audio.play().catch(e => console.warn("Failed to play alert sound:", e));

      const effectiveEmail = emergencyEmail || localStorage.getItem("emergencyEmail");
      if (!effectiveEmail) throw new Error("Patient email missing");

      const result = await patientsService.sendEmergencyAlertByEmail(effectiveEmail, coords);
      setHospitalInfo(result?.hospital_details || { name: "Nearest Emergency Center" });
      setEmergencyStep("success");
      toast.success("Emergency alert sent successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send alert");
    } finally {
      setIsSendingAlert(false);
    }
  };

  const resetEmergency = () => {
    setIsEmergencyDialogOpen(false);
    setEmergencyEmail("");
    setEmergencyStep("email");
    setEmergencyPatient(null);
    setHospitalInfo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    try {
      const result = await loginMutation.mutateAsync({
        email,
        password,
        userType,
      });
      unlockProfile();
      console.log("LOGIN RESULT 👉", result);

      // Navigate based on user type from the response
      const loggedInUserType = result.admin.user_type.toUpperCase();

      if (loggedInUserType === "PATIENT") {
        localStorage.setItem("emergencyEmail", email);
        try {
          const profiles = await patientsService.getPatients();
          setProfiles(profiles);
        } catch (_error) {
          // Dashboard can still load profiles on mount; don't block login navigation.
        }
        navigate("/patient/dashboard");
      } else if (loggedInUserType === "HOSPITAL") {
        navigate("/hospital/dashboard");
      } else {
        // Default fallback
        navigate("/patient/dashboard");
      }
    } catch (error) {
      // Error is already handled by the mutation's onError callback in useLogin hook
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 relative flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo of the app */}
          <Link to="/" className="flex items-center gap-2.5 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-semibold tracking-tight">mediVault</span>
          </Link>

          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl md:text-3xl font-bold">Welcome back</h1>
            <Button
              variant="destructive"
              size="sm"
              className="bg-red-600 hover:bg-red-700 h-8 text-xs px-3 shadow-md"
              onClick={() => {
                const storedEmail = localStorage.getItem("emergencyEmail");
                if (storedEmail) {
                  setEmergencyEmail(storedEmail);
                  handleFetchEmergencyInfo(new Event('submit') as any);
                }
                setIsEmergencyDialogOpen(true);
              }}
            >
              <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
              Emergency Help
            </Button>
          </div>
          <p className="text-muted-foreground mb-8">
            Sign in to access your medical records securely.
          </p>

          <Tabs value={userType} onValueChange={(v) => setUserType(v as "patient" | "hospital")} className="mb-6">
            <TabsList className="grid w-full grid-cols-2 rounded-lg bg-muted p-1">
              <TabsTrigger
                value="patient"
                className="rounded-md border-b-2 border-transparent transition-all data-[state=active]:border-green-500 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Patient
              </TabsTrigger>
              <TabsTrigger
                value="hospital"
                className="rounded-md border-b-2 border-transparent transition-all data-[state=active]:border-green-500 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Hospital
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <form
            onSubmit={(e) => {
              console.log("🔥 FORM SUBMITTED");
              handleSubmit(e);
            }}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loginMutation.isPending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loginMutation.isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={loginMutation.isPending}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Emergency button moved to top */}

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Create account
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-12">
        <div className="max-w-md text-center text-primary-foreground">
          <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-white/10 flex items-center justify-center">
            <Shield className="h-12 w-12" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Secure Access</h2>
          <p className="text-lg opacity-90">
            Your medical records are protected with bank-level encryption. Access them anytime, anywhere.
          </p>
        </div>
      </div>

      {/* Emergency Dialog */}
      <Dialog open={isEmergencyDialogOpen} onOpenChange={(open) => !open && resetEmergency()}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-6 w-6" />
              Emergency Assistance
            </DialogTitle>
            <DialogDescription>
              {emergencyStep === "email"
                ? "Enter the patient's account email to access critical medical information."
                : emergencyStep === "info"
                  ? "Review the medical information below for the patient."
                  : "The emergency alert has been broadcasted."}
            </DialogDescription>
          </DialogHeader>

          {emergencyStep === "email" && (
            <form onSubmit={handleFetchEmergencyInfo} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="emergency-email">Patient's Account Email</Label>
                <Input
                  id="emergency-email"
                  type="email"
                  placeholder="e.g. patient@example.com"
                  value={emergencyEmail}
                  onChange={(e) => setEmergencyEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isFetchingInfo}>
                {isFetchingInfo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Fetch Medical Info"}
              </Button>
            </form>
          )}

          {emergencyStep === "info" && emergencyPatient && (
            <div className="space-y-4 py-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 p-3 rounded-lg border">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Full Name</span>
                  <p className="font-bold text-lg">{emergencyPatient.full_name}</p>
                </div>
                <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                  <span className="text-xs text-destructive uppercase tracking-wider font-semibold">Blood Group</span>
                  <p className="font-bold text-xl text-destructive">{emergencyPatient.blood_type || "N/A"}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                  <span className="text-xs text-orange-700 uppercase tracking-wider font-semibold flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Allergies
                  </span>
                  <p className="text-sm font-medium mt-1">{emergencyPatient.allergies || "None reported"}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <span className="text-xs text-blue-700 uppercase tracking-wider font-semibold">Existing Conditions</span>
                  <p className="text-sm font-medium mt-1">{emergencyPatient.chronic_conditions || "None reported"}</p>
                </div>
                <div className="bg-muted/30 p-3 rounded-lg border">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Date of Birth</span>
                  <p className="text-sm font-medium">
                    {emergencyPatient.date_of_birth ? format(new Date(emergencyPatient.date_of_birth), "MMMM d, yyyy") : "N/A"}
                  </p>
                </div>
              </div>

              <div className="bg-destructive/5 p-4 rounded-xl border-2 border-dashed border-destructive/30 mt-6 relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-xs text-destructive uppercase tracking-widest font-black text-center mb-1">Critical Action</p>
                  <p className="text-sm text-center text-muted-foreground mb-4">Clicking the button below will notify emergency contacts and the nearest hospital.</p>
                  <Button
                    variant="destructive"
                    className="w-full h-12 text-lg font-bold shadow-lg shadow-destructive/20"
                    onClick={handleConfirmAlert}
                    disabled={isSendingAlert}
                  >
                    {isSendingAlert ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Confirm & Send Alert"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {emergencyStep === "success" && (
            <div className="py-8 text-center animate-in zoom-in-95">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Alert Dispatched!</h3>
              <div className="bg-primary/5 p-5 rounded-xl border-2 border-primary/20 mb-8 text-left space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-black">Dispatched To</p>
                    <p className="font-bold text-lg text-primary">{hospitalInfo?.name || "Nearest Emergency Center"}</p>
                  </div>
                </div>
                {hospitalInfo?.address && (
                  <div className="pt-2 border-t border-primary/10 pl-1">
                    <p className="text-sm font-medium text-foreground">{hospitalInfo.address}</p>
                    <p className="text-xs text-muted-foreground">{hospitalInfo.city}, {hospitalInfo.state}</p>
                    {hospitalInfo.phone && (
                      <p className="text-sm font-bold text-primary mt-2 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {hospitalInfo.phone}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <Button onClick={resetEmergency} variant="outline" className="w-full">
                Back to Login
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
