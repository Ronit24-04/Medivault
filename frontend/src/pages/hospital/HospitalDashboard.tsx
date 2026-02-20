import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import {
  Users,
  FileText,
  Activity,
  ArrowRight,
  TrendingUp,
  Bell,
  FolderOpen,
  Eye,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { usePatients } from "@/hooks/usePatients";
import { useRecords } from "@/hooks/useRecords";
import { useProfile } from "@/hooks/useAuth";
import { format } from "date-fns";

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "MMM d, yyyy");
  } catch {
    return dateString;
  }
};

const calculateAge = (dob?: string) => {
  if (!dob) return null;
  try {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  } catch {
    return null;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge className="bg-success/10 text-success border-success/20">Active</Badge>;
    case "completed":
      return <Badge className="bg-muted text-muted-foreground">Completed</Badge>;
    case "pending":
      return <Badge className="bg-warning/10 text-warning border-warning/20">Pending</Badge>;
    default:
      return null;
  }
};

export default function HospitalDashboard() {
  const { data: profile } = useProfile();
  const { data: patients, isLoading: patientsLoading, error: patientsError } = usePatients();
  const firstPatientId = patients?.[0]?.patient_id;
  const { data: records } = useRecords(firstPatientId || 0);
  const hospitalName = profile?.email || "Hospital";

  const stats = [
    {
      label: "Total Patients",
      value: patients?.length?.toString() || "0",
      change: "+0%",
      icon: Users,
      trend: "up",
    },
    {
      label: "Records Accessed",
      value: records?.length?.toString() || "0",
      change: "+0%",
      icon: FileText,
      trend: "up",
    },
    {
      label: "Active Sessions",
      value: patients?.length?.toString() || "0",
      change: "+0",
      icon: Activity,
      trend: "up",
    },
  ];

  const recentPatients = patients?.slice(0, 4).map((patient) => {
    const age = calculateAge(patient.date_of_birth);
    return {
      id: patient.patient_id,
      name: patient.full_name,
      age: age || 0,
      lastVisit: formatDate(patient.updated_at),
      condition: patient.relationship || "Patient",
      status: "active",
    };
  }) || [];

  if (patientsLoading) {
    return (
      <DashboardLayout userType="hospital">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (patientsError) {
    return (
      <DashboardLayout userType="hospital">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
            <p className="text-muted-foreground">
              {patientsError.message || "Failed to load dashboard"}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="hospital">
      <div className="space-y-6">
        {/* Main header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Hospital Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {hospitalName}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="card-stat">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
                    <div
                      className={`flex items-center gap-1 text-sm mt-1 ${stat.trend === "up" ? "text-success" : "text-destructive"
                        }`}
                    >
                      <TrendingUp className={`h-3 w-3 ${stat.trend === "down" ? "rotate-180" : ""}`} />
                      {stat.change}
                    </div>
                  </div>
                  <div className="icon-container">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Recent Patients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Patients</CardTitle>
              <CardDescription>Patients with recent activity</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/hospital/documents">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPatients.length > 0 ? (
              recentPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {patient.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{patient.name}</p>
                      {patient.age > 0 && (
                        <span className="text-sm text-muted-foreground">• {patient.age}y</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {patient.condition} • {patient.lastVisit}
                    </p>
                  </div>
                  {getStatusBadge(patient.status)}
                  <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                    <Link to="/hospital/documents">
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No patients yet</p>
                <p className="text-sm mt-1">Patients will appear here once they share records with you.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Link
                to="/hospital/documents"
                className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group"
              >
                <div className="icon-container-lg group-hover:scale-110 transition-transform">
                  <FolderOpen className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium text-center">Patient Documents</span>
              </Link>
              <Link
                to="/hospital/acknowledgements"
                className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group"
              >
                <div className="icon-container-lg group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium text-center">Acknowledgements</span>
              </Link>
              <Link
                to="/hospital/alerts"
                className="col-span-2 md:col-span-1 flex flex-col items-center gap-3 p-6 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group"
              >
                <div className="icon-container-lg group-hover:scale-110 transition-transform">
                  <Bell className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium text-center">Alerts</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
