import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, User, Phone, Building2, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { MediVaultLogoIcon } from "@/components/MediVaultLogo";
import { useRegister } from "@/hooks/useAuth";

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<"patient" | "hospital">("patient");
  const [agreed, setAgreed] = useState(false);

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullName, setFullName] = useState("");

  const registerMutation = useRegister();

  // Password strength validation
  const passwordRequirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await registerMutation.mutateAsync({
        email,
        password,
        phoneNumber: phoneNumber || undefined,
        userType: userType,
        fullName: userType === 'patient' ? fullName : undefined,
      });

      // Redirect to login after successful registration
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      // Error is already handled by the mutation's onError
      console.error("Registration failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-12">
        <div className="max-w-md text-center text-primary-foreground">
          <div className="w-28 h-28 mx-auto mb-8 rounded-2xl bg-white/10 flex items-center justify-center">
            <MediVaultLogoIcon size={72} />
          </div>
          <h2 className="text-3xl font-bold mb-4">Join mediVault</h2>
          <p className="text-lg opacity-90">
            Start managing your medical records securely. Create your free account in minutes.
          </p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md animate-fade-in">
          <Link to="/" className="flex items-center gap-2.5 mb-8">
            <MediVaultLogoIcon size={40} />
            <span className="text-2xl font-semibold tracking-tight">mediVault</span>
          </Link>

          <h1 className="text-2xl md:text-3xl font-bold mb-2">Create your account</h1>
          <p className="text-muted-foreground mb-8">
            Get started with your free mediVault account.
          </p>

          <Tabs value={userType} onValueChange={(v) => setUserType(v as "patient" | "hospital")} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="patient">Patient</TabsTrigger>
              <TabsTrigger value="hospital">Hospital</TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={handleSubmit} className="space-y-4">
            {userType === "patient" && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    className="pl-10"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={userType === "patient"}
                    disabled={registerMutation.isPending}
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={userType === "patient" ? "john@example.com" : "admin@hospital.com"}
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={registerMutation.isPending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="pl-10"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={registerMutation.isPending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={registerMutation.isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={registerMutation.isPending}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Password Requirements */}
              {password && (
                <div className="text-xs space-y-1.5 mt-3 p-3 bg-muted/50 rounded-md">
                  <p className="font-medium text-muted-foreground mb-2">Password must contain:</p>
                  <div className="space-y-1">
                    <div className={`flex items-center gap-2 ${passwordRequirements.minLength ? 'text-green-600' : 'text-muted-foreground'}`}>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordRequirements.minLength ? 'bg-green-600' : 'bg-muted'}`}>
                        {passwordRequirements.minLength && <span className="text-white text-xs">✓</span>}
                      </div>
                      <span>At least 8 characters</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordRequirements.hasUppercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordRequirements.hasUppercase ? 'bg-green-600' : 'bg-muted'}`}>
                        {passwordRequirements.hasUppercase && <span className="text-white text-xs">✓</span>}
                      </div>
                      <span>One uppercase letter (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordRequirements.hasLowercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordRequirements.hasLowercase ? 'bg-green-600' : 'bg-muted'}`}>
                        {passwordRequirements.hasLowercase && <span className="text-white text-xs">✓</span>}
                      </div>
                      <span>One lowercase letter (a-z)</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordRequirements.hasNumber ? 'text-green-600' : 'text-muted-foreground'}`}>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordRequirements.hasNumber ? 'bg-green-600' : 'bg-muted'}`}>
                        {passwordRequirements.hasNumber && <span className="text-white text-xs">✓</span>}
                      </div>
                      <span>One number (0-9)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
                className="mt-0.5"
                disabled={registerMutation.isPending}
              />
              <Label htmlFor="terms" className="text-sm text-muted-foreground font-normal leading-relaxed">
                I agree to the{" "}
                <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
                {" "}and{" "}
                <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={!agreed || !isPasswordValid || registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
