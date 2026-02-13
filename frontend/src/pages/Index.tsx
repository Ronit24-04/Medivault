import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Shield,
  Lock,
  Share2,
  Smartphone,
  FileText,
  Clock,
  Users,
  CheckCircle2,
  ArrowRight,
  Building2,
  Heart,
} from "lucide-react";

const features = [
  {
    icon: Lock,
    title: "Bank-Level Security",
    description: "Your medical records are encrypted with AES-256 encryption, ensuring your data stays private and secure.",
  },
  {
    icon: Share2,
    title: "Controlled Sharing",
    description: "Share records with healthcare providers instantly, with full control over who sees what.",
  },
  {
    icon: Smartphone,
    title: "Access Anywhere",
    description: "Access your complete medical history from any device — mobile, tablet, or desktop.",
  },
  {
    icon: FileText,
    title: "Organized Records",
    description: "All your prescriptions, lab reports, and medical documents organized in one place.",
  },
  {
    icon: Clock,
    title: "Instant Access",
    description: "Emergency access features ensure doctors can view critical information when needed.",
  },
  {
    icon: Users,
    title: "Family Management",
    description: "Manage health records for your entire family from a single account.",
  },
];


export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero section */}
        <section className="relative overflow-hidden bg-gradient-hero">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
          <div className="container relative py-20 md:py-32">
            <div className="max-w-3xl mx-auto text-center animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Shield className="h-4 w-4" />
                Secure Medical Record Storage
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Your Medical Records,{" "}
                <span className="text-primary">Secured & Accessible</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Store, manage, and share your medical records securely. Access your complete health history anytime, anywhere.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/register">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="hero-outline" size="xl" asChild>
                  <Link to="/hospital/register">For Hospitals</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>


        {/* Features of the app  */}
        <section id="features" className="py-20 md:py-28">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need for Health Record Management
              </h2>
              <p className="text-lg text-muted-foreground">
                A complete solution for patients and healthcare providers to manage medical records efficiently.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="card-elevated p-6 group"
                  >
                    <div className="icon-container-lg mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section for two user's  */}
        <section id="about" className="py-20 bg-muted/30">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Built for Everyone
              </h2>
              <p className="text-lg text-muted-foreground">
                Whether you're a patient or a healthcare provider, mediVault has you covered.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Card for patient */}
              <div className="card-elevated p-8">
                <div className="icon-container-lg mb-6 bg-primary/10">
                  <Heart className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">For Patients</h3>
                <p className="text-muted-foreground mb-6">
                  Take control of your health records. Store, organize, and share your medical history securely.
                </p>
                <ul className="space-y-3 mb-8">
                  {["Upload & store records", "Share with doctors", "Family accounts"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full">
                  <Link to="/register">Create Patient Account</Link>
                </Button>
              </div>

              {/* Card for hospital */}
              <div className="card-elevated p-8">
                <div className="icon-container-lg mb-6 bg-primary/10">
                  <Building2 className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">For Hospitals</h3>
                <p className="text-muted-foreground mb-6">
                  Streamline patient record management. Access shared records and improve care coordination.
                </p>
                <ul className="space-y-3 mb-8">
                  {["Patient management", "Access shared records", "Analytics dashboard"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/hospital/register">Register Hospital</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>


        {/* CTA Section */}
        <section id="cta" className="py-20 bg-primary text-primary-foreground">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Secure Your Health Records?
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of patients and healthcare providers who trust mediVault with their medical records.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="glass" size="xl" asChild>
                <Link to="/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
