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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Filter,
  CheckCircle,
  Clock,
  FileText,
  User,
  Calendar,
  Check,
  X,
  Loader2,
} from "lucide-react";
import {
  useHospitalSharedRecords,
  useUpdateSharedRecordStatus,
} from "@/hooks/useHospital";
import { HospitalSharedRecord } from "@/api/services/hospital-admin.service";
import { format } from "date-fns";

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  try {
    return format(new Date(dateString), "MMM d, yyyy");
  } catch {
    return dateString;
  }
};

type LocalStatus = "pending" | "acknowledged" | "rejected";
type AckItem = HospitalSharedRecord & { localStatus: LocalStatus };

export default function HospitalAcknowledgements() {
  const { data: sharedRecords, isLoading } = useHospitalSharedRecords();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const updateSharedRecordStatus = useUpdateSharedRecordStatus();
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    id: number | null;
    action: "acknowledged" | "rejected" | null;
    patientName: string;
  }>({ open: false, id: null, action: null, patientName: "" });

  const items: AckItem[] = (sharedRecords ?? []).map((r) => ({
    ...r,
    localStatus:
      r.status === "acknowledged"
        ? "acknowledged"
        : r.status === "rejected"
          ? "rejected"
          : "pending",
  }));

  const filtered = items.filter((item) => {
    const matchesSearch =
      item.patient.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.provider_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || item.localStatus === statusFilter;
    const matchesPriority =
      priorityFilter === "all" ||
      (priorityFilter === "high" && item.status === "active") ||
      (priorityFilter === "normal" && item.status !== "active");
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const pendingCount = items.filter((i) => i.localStatus === "pending").length;
  const acknowledgedCount = items.filter((i) => i.localStatus === "acknowledged").length;

  const handleAction = (id: number, action: "acknowledged" | "rejected", patientName: string) => {
    setConfirmDialog({ open: true, id, action, patientName });
  };

  const confirmAction = () => {
    if (confirmDialog.id !== null && confirmDialog.action) {
      updateSharedRecordStatus.mutate({
        shareId: confirmDialog.id,
        status: confirmDialog.action,
      });
    }
    setConfirmDialog({ open: false, id: null, action: null, patientName: "" });
  };

  const getStatusBadge = (status: LocalStatus) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />Pending
          </Badge>
        );
      case "acknowledged":
        return (
          <Badge className="gap-1 bg-success text-success-foreground">
            <CheckCircle className="h-3 w-3" />Acknowledged
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="gap-1">
            <X className="h-3 w-3" />Rejected
          </Badge>
        );
    }
  };

  return (
    <DashboardLayout userType="hospital">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Acknowledgements</h1>
          <p className="text-muted-foreground">Review and acknowledge received patient documents.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-warning" />
                <span className="text-2xl font-bold">{pendingCount}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Acknowledged</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                <span className="text-2xl font-bold">{acknowledgedCount}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{items.length}</span>
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
                  placeholder="Search by patient name or provider..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full lg:w-[150px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">Active Access</SelectItem>
                  <SelectItem value="normal">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Document</TableHead>
                      <TableHead className="hidden md:table-cell">Received</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((item) => (
                      <TableRow key={item.share_id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div>
                              <span className="font-medium block">{item.patient.full_name}</span>
                              <span className="text-xs text-muted-foreground">
                                ID: {item.patient.patient_id}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="mb-1">{item.provider_type}</Badge>
                          <p className="text-sm text-muted-foreground truncate max-w-[150px]">
                            {item.provider_name}
                          </p>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(item.shared_on)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.status === "active" ? "destructive" : "secondary"}>
                            {item.status === "active" ? "High" : "Normal"}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(item.localStatus)}</TableCell>
                        <TableCell className="text-right">
                          {item.localStatus === "pending" ? (
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Acknowledge"
                                className="text-success hover:text-success hover:bg-success/10"
                                onClick={() => handleAction(item.share_id, "acknowledged", item.patient.full_name)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Reject"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleAction(item.share_id, "rejected", item.patient.full_name)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground pr-2">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filtered.length === 0 && (
                  <div className="py-12 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No documents found</h3>
                    <p className="text-muted-foreground">
                      {(sharedRecords ?? []).length === 0
                        ? "No patients have shared records with your hospital yet."
                        : "Try adjusting your search or filters."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          !open && setConfirmDialog({ open: false, id: null, action: null, patientName: "" })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.action === "acknowledged" ? "Acknowledge Document" : "Reject Document"}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.action === "acknowledged"
                ? `Acknowledge the document from ${confirmDialog.patientName}?`
                : `Reject the document from ${confirmDialog.patientName}? This cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-2">
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ open: false, id: null, action: null, patientName: "" })}
            >
              Cancel
            </Button>
            <Button
              variant={confirmDialog.action === "rejected" ? "destructive" : "default"}
              onClick={confirmAction}
            >
              {confirmDialog.action === "acknowledged" ? (
                <><Check className="mr-2 h-4 w-4" />Acknowledge</>
              ) : (
                <><X className="mr-2 h-4 w-4" />Reject</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
