import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  FileText,
  Calendar,
  Upload,
  Share2,
  Clock,
  Activity,
  ArrowRight,
  Plus,
  Eye,
  HeartPulse,
  Pill,
  TestTube,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useRecords } from "@/hooks/useRecords";
import { useSharedAccessStats } from "@/hooks/useSharedAccess";
import { format } from "date-fns";
import { useProfileStore } from "@/stores/useProfileStore";
import { useEffect } from "react";

// Helper function to get icon based on record type
const getRecordIcon = (recordType: string) => {
  const type = recordType.toLowerCase();
  if (type.includes('lab') || type.includes('test')) return TestTube;
  if (type.includes('prescription') || type.includes('medication')) return Pill;
  if (type.includes('cardio') || type.includes('heart')) return HeartPulse;
  return Activity;
};

// Helper function to format date
const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "MMM d, yyyy");
  } catch {
    return dateString;
  }
};

export default function PatientDashboard() {
  const { currentProfile, loadProfiles, isLoading: profilesLoading } = useProfileStore();

  // Load profiles on mount
  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const patientId = currentProfile?.patient_id;

  // Fetch medical records for the current profile
  const { data: records, isLoading: recordsLoading, error: recordsError } = useRecords(
    patientId || 0,
    { isCritical: undefined }
  );

  // Fetch shared access stats
  const { data: sharedStats } = useSharedAccessStats(patientId || 0);

  // Calculate quick stats from real data
  const quickStats = [
    {
      label: "Total Records",
      value: records?.length?.toString() || "0",
      icon: FileText,
      color: "text-primary"
    },
    {
      label: "Shared With",
      value: sharedStats?.activeShares?.toString() || "0",
      icon: Share2,
      color: "text-success"
    },
    {
      label: "Last Upload",
      value: records?.[0] ? formatDate(records[0].created_at) : "N/A",
      icon: Clock,
      color: "text-warning"
    },
  ];

  // Get recent records (last 3)
  const recentRecords = records?.slice(0, 3).map(record => {
    const Icon = getRecordIcon(record.record_type);
    return {
      id: record.record_id,
      title: record.title,
      type: record.record_type,
      date: formatDate(record.record_date),
      hospital: record.hospital_name || "Unknown Hospital",
      icon: Icon,
      status: record.is_critical ? "critical" : "normal",
    };
  }) || [];



  // Loading state
  if (profilesLoading || recordsLoading) {
    return (
      <DashboardLayout userType="patient">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (recordsError || !currentProfile) {
    return (
      <DashboardLayout userType="patient">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
            <p className="text-muted-foreground">
              {recordsError?.message || !currentProfile ? "No profile selected" : "Failed to load dashboard"}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="patient">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Welcome back, {currentProfile?.full_name || "User"}
            </h1>
            <p className="text-muted-foreground">Here's an overview of your health records.</p>
          </div>
          <Button asChild>
            <Link to="/patient/upload">
              <Plus className="mr-2 h-4 w-4" />
              Upload Record
            </Link>
          </Button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="card-stat">
                <div className="flex items-center gap-4">
                  <div className={`icon-container ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Recent records */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Records</CardTitle>
              <CardDescription>Your latest medical documents</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/patient/records">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentRecords.length > 0 ? (
              recentRecords.map((record) => {
                const Icon = record.icon;
                return (
                  <div
                    key={record.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group"
                  >
                    <div className="icon-container">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{record.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {record.hospital} • {record.date}
                      </p>
                    </div>
                    <Badge
                      variant={record.status === "critical" ? "destructive" : "secondary"}
                      className="hidden sm:inline-flex"
                    >
                      {record.status}
                    </Badge>
                    <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No medical records yet</p>
                <Button variant="link" asChild className="mt-2">
                  <Link to="/patient/upload">Upload your first record</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick actions for most used functions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Link
                to="/patient/upload"
                className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group"
              >
                <div className="icon-container-lg group-hover:scale-110 transition-transform">
                  <Upload className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium">Upload Record</span>
              </Link>
              <Link
                to="/patient/shared"
                className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group"
              >
                <div className="icon-container-lg group-hover:scale-110 transition-transform">
                  <Share2 className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium">Share Access</span>
              </Link>
              <Link
                to="/patient/records"
                className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group"
              >
                <div className="icon-container-lg group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium">View All Records</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
