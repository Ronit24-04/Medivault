import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Shield, Download, Smartphone, Wifi, WifiOff, CheckCircle2, ArrowLeft } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // This checks if the app is already installed on the device
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const features = [
    {
      icon: WifiOff,
      title: "Works Offline",
      description: "Access your medical records even without an internet connection.",
    },
    {
      icon: Smartphone,
      title: "Install on Home Screen",
      description: "Add mediVault to your home screen for quick access like a native app.",
    },
    {
      icon: Shield,
      title: "Fast & Secure",
      description: "Loads instantly and keeps your data secure with encryption.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12 md:py-20">
        <div className="container max-w-4xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          {/* Status banner */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg mb-8 ${isOnline ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
            {isOnline ? (
              <>
                <Wifi className="h-4 w-4" />
                <span className="text-sm font-medium">You're online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4" />
                <span className="text-sm font-medium">You're offline - The app still works!</span>
              </>
            )}
          </div>

          {/* Hero sectiobn */}
          <div className="text-center mb-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary mx-auto mb-6">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Install mediVault</h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Install mediVault on your device for instant access to your medical records, even offline.
            </p>
          </div>

          {/* Install button */}
          <Card className="mb-12">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                {isInstalled ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    App Installed!
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    Install the App
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {isInstalled
                  ? "mediVault is installed on your device. You can access it from your home screen."
                  : deferredPrompt
                  ? "Click below to install mediVault on your device."
                  : "To install, use your browser's menu and select 'Add to Home Screen' or 'Install App'."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              {isInstalled ? (
                <Button asChild>
                  <Link to="/patient/dashboard">Go to Dashboard</Link>
                </Button>
              ) : deferredPrompt ? (
                <Button size="lg" onClick={handleInstallClick}>
                  <Download className="mr-2 h-5 w-5" />
                  Install mediVault
                </Button>
              ) : (
                <div className="text-center text-sm text-muted-foreground space-y-2">
                  <p><strong>On iPhone:</strong> Tap Share → Add to Home Screen</p>
                  <p><strong>On Android:</strong> Tap Menu → Install App</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="text-center">
                  <CardHeader>
                    <div className="icon-container-lg mx-auto mb-2">
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
