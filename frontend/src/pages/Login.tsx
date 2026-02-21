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

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<"patient" | "hospital">("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showEmergency, setShowEmergency] = useState(false);
  const [isSendingAlert, setIsSendingAlert] = useState(false);

  const loginMutation = useLogin();
  const currentProfile = useProfileStore((state) => state.currentProfile);
   

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await loginMutation.mutateAsync({
        email,
        password,
      });
      console.log("LOGIN RESULT 👉", result);

      // Navigate based on user type from the response
      const userType = result.admin.user_type.toUpperCase();

      if (userType === "PATIENT") {
        navigate("/patient/dashboard");
      } else if (userType === "HOSPITAL") {
        navigate("/hospital/dashboard");
      } else {
        // Default fallback
        navigate("/patient/dashboard");
      }
    } catch (error) {
      // Error is already handled by the mutation's onError
    }
  };

  const handleSendEmergencyAlert = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.error("Please sign in before sending an emergency alert.");
      return;
    }

    if (!currentProfile?.patient_id) {
      toast.error("No patient profile selected. Please sign in first.");
      return;
    }

    try {
      setIsSendingAlert(true);
      await patientsService.sendEmergencyAlert(currentProfile.patient_id);
      toast.success("Emergency alert sent successfully");
      setShowEmergency(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send emergency alert"
      );
    } finally {
      setIsSendingAlert(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 relative flex items-center justify-center p-6 md:p-12">
          {/* 🚨 Emergency Floating Button */}
<button
  onClick={() => setShowEmergency(true)}
  className="absolute top-6 right-6 z-50 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-700 transition"
>
  🚨 Emergency
</button>
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo of the app */}
          <Link to="/" className="flex items-center gap-2.5 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-semibold tracking-tight">mediVault</span>
          </Link>

          <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-muted-foreground mb-8">
            Sign in to access your medical records securely.
          </p>

          <Tabs value={userType} onValueChange={(v) => setUserType(v as "patient" | "hospital")} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="patient">Patient</TabsTrigger>
              <TabsTrigger value="hospital">Hospital</TabsTrigger>
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
      {/* Emergency Modal */}
{showEmergency && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl w-[400px] shadow-xl">
      <h2 className="text-xl font-semibold mb-4 text-red-600">
        Emergency Information
      </h2>

      <p><b>Name:</b> {currentProfile?.full_name || "No profile"}</p>
<p><b>Blood Group:</b> {currentProfile?.blood_group}</p>

<p className="text-red-500 font-medium">
  Allergy: {currentProfile?.allergies}
</p>

<p>
  Conditions: {currentProfile?.existing_conditions}
</p>
     

      <div className="mt-5 flex gap-3">
  {/* 🚨 Send Alert Button */}
  <button
    onClick={handleSendEmergencyAlert}
    disabled={isSendingAlert}
    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
  >
    {isSendingAlert ? "Sending..." : "Send Alert"}
  </button>

  {/* Close Button */}
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
