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
import { useProfile } from "@/hooks/useAuth";
import { useHospitalProfile, useHospitalSharedRecords, useHospitalAlerts } from "@/hooks/useHospital";
import { format } from "date-fns";

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  try {
    return format(new Date(dateString), "MMM d, yyyy");
  } catch {
    return dateString;
  }
};

export default function HospitalDashboard() {
  const { data: authProfile } = useProfile();
  const { data: hospitalProfile, isLoading: profileLoading } = useHospitalProfile();
  const { data: sharedRecords, isLoading: recordsLoading } = useHospitalSharedRecords();
  const { data: alerts } = useHospitalAlerts();

  const isLoading = profileLoading || recordsLoading;

  const hospitalName = hospitalProfile?.hospital_name || authProfile?.email || "Hospital";
  const activeRecords = sharedRecords?.filter((r) => r.status === "active") ?? [];
  const pendingShares = sharedRecords?.filter((r) => r.status === "pending") ?? [];
  const pendingAlerts = alerts?.filter((a) => a.status === "sent") ?? [];
  const uniquePatients = new Set(sharedRecords?.map((r) => r.patient_id)).size;

  const stats = [
    {
      label: "Total Patients",
      value: uniquePatients.toString(),
      icon: Users,
      tone: "default",
    },
    {
      label: "Active Records",
      value: activeRecords.length.toString(),
      icon: FileText,
      tone: "default",
    },
    {
      label: "Pending Alerts",
      value: pendingAlerts.length.toString(),
      icon: Activity,
      tone: "destructive",
    },
  ];

  const recentPatients = sharedRecords?.slice(0, 4).map((record) => ({
    id: record.share_id,
    patientId: record.patient_id,
    name: record.patient.full_name,
    lastVisit: formatDate(record.shared_on),
    status: record.status,
  })) ?? [];

  const getStatusVariant = (status: string) => {
    if (status === "rejected") return "destructive" as const;
    if (status === "active") return "default" as const;
    return "secondary" as const;
  };

  if (isLoading) {
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

  return (
    <DashboardLayout userType="hospital">
      <div className="space-y-6">
        {/* Header */}
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
            const isPendingAlertsCard = stat.tone === "destructive";
            return (
              <Card
                key={stat.label}
                className={`card-stat ${isPendingAlertsCard ? "border-destructive/30 bg-destructive/5" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p
                      className={`text-2xl md:text-3xl font-bold ${isPendingAlertsCard ? "text-destructive" : ""
                        }`}
                    >
                      {stat.value}
                    </p>
                    <div
                      className={`flex items-center gap-1 text-sm mt-1 ${isPendingAlertsCard ? "text-destructive" : "text-success"
                        }`}
                    >
                      <TrendingUp className="h-3 w-3" />
                      {isPendingAlertsCard ? "Needs Attention" : "Live"}
                    </div>
                  </div>
                  <div className={`icon-container ${isPendingAlertsCard ? "text-destructive" : ""}`}>
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
              <CardTitle>Recent Shared Records</CardTitle>
              <CardDescription>Patients who recently shared access with you</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/hospital/documents">
                View All <ArrowRight className="ml-1 h-4 w-4" />
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
                      {patient.name.split(" ").map((n: string) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{patient.name}</p>
                    <p className="text-sm text-muted-foreground">Shared {patient.lastVisit}</p>
                  </div>
                  <Badge variant={getStatusVariant(patient.status)}>
                    {patient.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    asChild
                  >
                    <Link to="/hospital/documents">
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No shared records yet</p>
                <p className="text-sm mt-1">
                  Patients will appear here once they share records with your hospital.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Shared Access Banner */}
        {pendingShares.length > 0 && (
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-warning flex-shrink-0" />
                <p className="font-medium">
                  {pendingShares.length} pending access request
                  {pendingShares.length > 1 ? "s" : ""} awaiting your review
                </p>
              </div>
              <Button variant="outline" size="sm" className="border-warning/50 text-warning hover:bg-warning/10" asChild>
                <Link to="/hospital/documents">Review</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Alerts Summary Banner */}
        {pendingAlerts.length > 0 && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                <p className="font-medium">
                  {pendingAlerts.length} pending emergency alert
                  {pendingAlerts.length > 1 ? "s" : ""} require attention
                </p>
              </div>
              <Button variant="destructive" size="sm" asChild>
                <Link to="/hospital/alerts">View Alerts</Link>
              </Button>
            </CardContent>
          </Card>
        )}

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
