import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediVaultLogoIcon } from "@/components/MediVaultLogo";
import { useVerifyEmail } from "@/hooks/useAuth";

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const verifyMutation = useVerifyEmail();
    const hasRun = useRef(false);

    useEffect(() => {
        // Run only once and only if a token was provided
        if (!hasRun.current && token) {
            hasRun.current = true;
            verifyMutation.mutate(token);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isLoading = verifyMutation.isPending || (!verifyMutation.isSuccess && !verifyMutation.isError && !token);
    const isSuccess = verifyMutation.isSuccess;
    const isError = verifyMutation.isError || !token;

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md text-center animate-fade-in">
                {/* Logo */}
                <Link to="/" className="inline-flex items-center gap-2.5 mb-10 justify-center">
                    <MediVaultLogoIcon size={40} />
                    <span className="text-2xl font-semibold tracking-tight">mediVault</span>
                </Link>

                {/* Loading State */}
                {(isLoading && token) && (
                    <div className="space-y-5">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold mb-2">Verifying your email…</h1>
                            <p className="text-muted-foreground">Please wait while we confirm your email address.</p>
                        </div>
                    </div>
                )}

                {/* Success State */}
                {isSuccess && (
                    <div className="space-y-5">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <CheckCircle2 className="w-10 h-10 text-green-600" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold mb-2">Email verified!</h1>
                            <p className="text-muted-foreground">
                                Your email has been successfully verified. You can now log in to your MediVault account.
                            </p>
                        </div>
                        <Button asChild size="lg" className="w-full">
                            <Link to="/login">
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Go to Login
                            </Link>
                        </Button>
                    </div>
                )}

                {/* Error State */}
                {(isError && !isLoading) && (
                    <div className="space-y-5">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <XCircle className="w-10 h-10 text-red-600" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold mb-2">Verification failed</h1>
                            <p className="text-muted-foreground">
                                {!token
                                    ? "No verification token was found in the link. Please check the email and click the button again."
                                    : (verifyMutation.error?.message || "This verification link is invalid or has expired. Please register again.")}
                            </p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Button asChild variant="outline" size="lg">
                                <Link to="/register">Register Again</Link>
                            </Button>
                            <Button asChild variant="ghost" size="lg">
                                <Link to="/login">Back to Login</Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
