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
  Search,
  Bell,
  BellRing,
  FileText,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  Check,
} from "lucide-react";

type Alert = {
  id: number;
  type: string;
  patientName: string;
  patientId: string;
  message: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  priority: string;
};

const initialAlerts: Alert[] = [
  {
    id: 1,
    type: "new_document",
    patientName: "Ronit Mahale",
    patientId: "P-001",
    message: "New lab report shared",
    description: "Complete Blood Count (CBC) results available for review",
    timestamp: "2 minutes ago",
    isRead: false,
    priority: "high",
  },
  {
    id: 2,
    type: "access_request",
    patientName: "Flavius Almeida",
    patientId: "P-002",
    message: "Access request pending",
    description: "Patient requesting to share medical history",
    timestamp: "15 minutes ago",
    isRead: false,
    priority: "normal",
  },
  {
    id: 3,
    type: "new_document",
    patientName: "Shrinidhi Naik",
    patientId: "P-003",
    message: "New imaging report shared",
    description: "Chest X-Ray results ready for review",
    timestamp: "1 hour ago",
    isRead: false,
    priority: "high",
  },
  {
    id: 4,
    type: "expiring_access",
    patientName: "Selwyn Dsouza",
    patientId: "P-004",
    message: "Access expiring soon",
    description: "Document access will expire in 24 hours",
    timestamp: "2 hours ago",
    isRead: true,
    priority: "normal",
  },
  {
    id: 5,
    type: "new_document",
    patientName: "Soham Mapare",
    patientId: "P-005",
    message: "New prescription shared",
    description: "Medication update requires acknowledgement",
    timestamp: "3 hours ago",
    isRead: true,
    priority: "normal",
  },
  {
    id: 6,
    type: "access_granted",
    patientName: "Kumari Sharma",
    patientId: "P-006",
    message: "Access granted",
    description: "Full medical history now accessible",
    timestamp: "5 hours ago",
    isRead: true,
    priority: "normal",
  },
];

export default function HospitalAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [readFilter, setReadFilter] = useState("all");

  const markAsRead = (id: number) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isRead: true } : a))
    );
  };

  const markAllAsRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
  };

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || alert.type === typeFilter;
    const matchesRead =
      readFilter === "all" ||
      (readFilter === "unread" && !alert.isRead) ||
      (readFilter === "read" && alert.isRead);
    return matchesSearch && matchesType && matchesRead;
  });

  const unreadCount = alerts.filter((a) => !a.isRead).length;
  const highPriorityCount = alerts.filter(
    (a) => a.priority === "high" && !a.isRead
  ).length;

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "new_document":
        return <FileText className="h-5 w-5 text-primary" />;
      case "access_request":
        return <User className="h-5 w-5 text-warning" />;
      case "expiring_access":
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case "access_granted":
        return <CheckCircle className="h-5 w-5 text-success" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "new_document": return "New Document";
      case "access_request": return "Access Request";
      case "expiring_access": return "Expiring Access";
      case "access_granted": return "Access Granted";
      default: return type;
    }
  };

  return (
    <DashboardLayout userType="hospital">
      <div className="space-y-6">
        {/* Main header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Incoming Alerts</h1>
            <p className="text-muted-foreground">
              Stay updated with patient document notifications.
            </p>
          </div>
          <Button
            variant="outline"
            className="self-start"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <Check className="mr-2 h-4 w-4" />
            Mark All as Read
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Unread Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <BellRing className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{unreadCount}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                High Priority
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <span className="text-2xl font-bold">{highPriorityCount}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold">{alerts.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search alerts..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="Alert Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="new_document">New Document</SelectItem>
                  <SelectItem value="access_request">Access Request</SelectItem>
                  <SelectItem value="expiring_access">Expiring Access</SelectItem>
                  <SelectItem value="access_granted">Access Granted</SelectItem>
                </SelectContent>
              </Select>
              <Select value={readFilter} onValueChange={setReadFilter}>
                <SelectTrigger className="w-full lg:w-[150px]">
                  <SelectValue placeholder="Status" />
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

        {/* List of alerts */}
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <Card
              key={alert.id}
              className={`transition-colors ${!alert.isRead ? "border-primary/30 bg-primary/5" : ""
                }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{alert.message}</h3>
                          {!alert.isRead && (
                            <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                          )}
                          {alert.priority === "high" && (
                            <Badge variant="destructive" className="text-xs">
                              High Priority
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {alert.patientName} ({alert.patientId})
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {alert.timestamp}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline">{getTypeLabel(alert.type)}</Badge>
                        {!alert.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(alert.id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Mark Read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredAlerts.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No alerts found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
