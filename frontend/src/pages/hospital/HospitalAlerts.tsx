import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Bell,
  Check,
  Search,
  Filter,
  MapPin,
  User,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useHospitalAlerts, useAcknowledgeHospitalAlert } from "@/hooks/useHospital";
import { HospitalAlert } from "@/api/services/hospital-admin.service";

const formatRelative = (dateString?: string) => {
  if (!dateString) return "—";
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
};

const formatDateTime = (dateString?: string) => {
  if (!dateString) return "—";
  try {
    return format(new Date(dateString), "MMM d, yyyy h:mm a");
  } catch {
    return dateString;
  }
};

export default function HospitalAlerts() {
  const { data: alerts, isLoading } = useHospitalAlerts();
  const acknowledgeAlert = useAcknowledgeHospitalAlert();

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [readFilter, setReadFilter] = useState("all");
  const [acknowledgingId, setAcknowledgingId] = useState<number | null>(null);

  // Track locally-read items (alerts that don't have acknowledge API support on "read" action)
  const [locallyRead, setLocallyRead] = useState<Set<number>>(new Set());

  const markAsRead = (alertId: number) => {
    setLocallyRead((prev) => new Set(prev).add(alertId));
  };

  const markAllAsRead = () => {
    const allIds = (alerts ?? []).map((a) => a.alert_id);
    setLocallyRead(new Set(allIds));
  };

  const isRead = (alert: HospitalAlert) =>
    alert.status === "acknowledge" || locallyRead.has(alert.alert_id);

  const filtered = (alerts ?? []).filter((alert) => {
    const read = isRead(alert);
    const matchesSearch =
      alert.patient.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (alert.alert_message ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (alert.critical_summary ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || alert.status === typeFilter;
    const matchesRead =
      readFilter === "all" ||
      (readFilter === "unread" && !read) ||
      (readFilter === "read" && read);
    return matchesSearch && matchesType && matchesRead;
  });

  const unreadCount = (alerts ?? []).filter((a) => !isRead(a)).length;

  return (
    <DashboardLayout userType="hospital">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Emergency Alerts</h1>
            <p className="text-muted-foreground">
              Real-time emergency notifications for your patients.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                {unreadCount} Unread
              </Badge>
            )}
            <Button
              variant="outline"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <Check className="mr-2 h-4 w-4" />
              Mark All as Read
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by patient name or message..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Alert Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="acknowledge">Acknowledged</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <Select value={readFilter} onValueChange={setReadFilter}>
                <SelectTrigger className="w-full lg:w-[150px]">
                  <SelectValue placeholder="Read Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Alerts List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No alerts found</h3>
              <p className="text-muted-foreground">
                {(alerts ?? []).length === 0
                  ? "No emergency alerts have been sent to your hospital yet."
                  : "Try adjusting your search or filters."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((alert) => {
              const read = isRead(alert);
              const isCritical = alert.status === "sent";

              return (
                <Card
                  key={alert.alert_id}
                  className={`transition-colors ${!read ? "border-destructive/30 bg-destructive/5" : ""}`}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      {/* Icon */}
                      <div className={`flex-shrink-0 p-2 rounded-full ${isCritical ? "bg-destructive/10" : "bg-muted"}`}>
                        <AlertCircle className={`h-5 w-5 ${isCritical ? "text-destructive" : "text-muted-foreground"}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-semibold">
                            {alert.patient.full_name}
                          </span>
                          <Badge variant={isCritical ? "destructive" : "secondary"}>
                            {alert.status}
                          </Badge>
                          {!read && (
                            <span className="h-2 w-2 rounded-full bg-destructive inline-block" />
                          )}
                        </div>

                        <p className="text-sm font-bold text-destructive mb-1">
                          {alert.alert_message || "EMERGENCY ALERT"}
                        </p>
                        {alert.critical_summary && (
                          <div className="bg-destructive/10 p-2 rounded border border-destructive/20 mb-2">
                            <p className="text-xs font-black text-destructive uppercase tracking-widest mb-1">Critical Medical Info</p>
                            <p className="text-sm font-medium text-destructive-foreground">
                              {alert.critical_summary}
                            </p>
                          </div>
                        )}

                        {alert.patient_location && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                            <MapPin className="h-3 w-3" />
                            {alert.patient_location}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Patient ID: {alert.patient.patient_id}
                          </div>
                          <span>{formatRelative(alert.sent_at)}</span>
                          {alert.acknowledged_at && (
                            <span className="flex items-center gap-1 text-success">
                              <CheckCircle className="h-3 w-3" />
                              Acknowledged {formatDateTime(alert.acknowledged_at)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!read && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsRead(alert.alert_id)}
                          >
                            <Check className="mr-1 h-3 w-3" />
                            Mark Read
                          </Button>
                        )}
                        {alert.status === "sent" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setAcknowledgingId(alert.alert_id);
                              acknowledgeAlert.mutate(alert.alert_id, {
                                onSettled: () => setAcknowledgingId(null),
                              });
                              markAsRead(alert.alert_id);
                            }}
                            disabled={acknowledgingId === alert.alert_id}
                          >
                            {acknowledgingId === alert.alert_id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Check className="mr-1 h-3 w-3" />
                            )}
                            Acknowledge
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Stats Footer */}
        {(alerts ?? []).length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Total Alerts: <strong className="text-foreground">{alerts?.length ?? 0}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  Unread: <strong className="text-foreground">{unreadCount}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Acknowledged:{" "}
                  <strong className="text-foreground">
                    {(alerts ?? []).filter((a) => a.status === "acknowledge").length}
                  </strong>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
