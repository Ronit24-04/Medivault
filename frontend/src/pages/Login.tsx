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

  const loginMutation = useLogin();
  const setProfiles = useProfileStore((state) => state.setProfiles);
  const unlockProfile = useProfileStore((state) => state.unlockProfile);
   

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      toast.error(error instanceof Error ? error.message : "Login failed");
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

          <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back</h1>
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
    </div>
  );
}
