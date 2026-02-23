import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
  FileText,
  Download,
  Eye,
  Calendar,
  User,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  useHospitalSharedRecords,
  useAcceptShare,
  useRejectShare,
  useSharedRecordFiles,
} from "@/hooks/useHospital";
import { HospitalSharedRecord } from "@/api/services/hospital-admin.service";
import { format } from "date-fns";
import { toast } from "sonner";

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  try {
    return format(new Date(dateString), "MMM d, yyyy");
  } catch {
    return dateString;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge className="bg-success/10 text-success border-success/20">Active</Badge>;
    case "pending":
      return <Badge className="bg-warning/10 text-warning border-warning/20">Pending</Badge>;
    case "expired":
      return <Badge variant="secondary">Expired</Badge>;
    case "revoked":
      return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Revoked</Badge>;
    case "rejected":
      return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Rejected</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function HospitalDocuments() {
  const { data: sharedRecords, isLoading } = useHospitalSharedRecords();
  const { mutate: acceptShare, isPending: isAccepting } = useAcceptShare();
  const { mutate: rejectShare, isPending: isRejecting } = useRejectShare();

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewDoc, setViewDoc] = useState<HospitalSharedRecord | null>(null);
  const [actioningShareId, setActioningShareId] = useState<number | null>(null);
  const { data: files, isLoading: filesLoading } = useSharedRecordFiles(viewDoc?.share_id ?? null);

  const filtered = (sharedRecords ?? []).filter((doc) => {
    const matchesSearch =
      doc.patient.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.provider_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.access_level.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      typeFilter === "all" || doc.provider_type.toLowerCase() === typeFilter;
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDownload = (doc: HospitalSharedRecord) => {
    toast.info(`Requesting records access for ${doc.patient.full_name}.`);
  };

  const handleAccept = (shareId: number) => {
    setActioningShareId(shareId);
    acceptShare(shareId, { onSettled: () => setActioningShareId(null) });
  };

  const handleReject = (shareId: number) => {
    setActioningShareId(shareId);
    rejectShare(shareId, { onSettled: () => setActioningShareId(null) });
  };

  const handleDownloadFile = (file: any) => {
    const a = document.createElement("a");
    a.href = file.file_path;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.download = file.title;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <DashboardLayout userType="hospital">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Patient Documents</h1>
          <p className="text-muted-foreground">
            View and manage all shared patient records.
          </p>
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
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <FileText className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Provider Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="hospital">Hospital</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="emergencycontact">Emergency Contact</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
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
                      <TableHead>Provider</TableHead>
                      <TableHead className="hidden md:table-cell">Access Level</TableHead>
                      <TableHead className="hidden lg:table-cell">Shared Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((doc) => {
                      const isActioning = actioningShareId === doc.share_id;
                      return (
                        <TableRow key={doc.share_id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <div>
                                <span className="font-medium block">{doc.patient.full_name}</span>
                                <span className="text-xs text-muted-foreground">
                                  ID: {doc.patient.patient_id}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <Badge variant="outline" className="mb-1">
                                {doc.provider_type}
                              </Badge>
                              <p className="text-sm text-muted-foreground truncate max-w-[150px]">
                                {doc.provider_name}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="text-sm">{doc.access_level}</span>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDate(doc.shared_on)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(doc.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {doc.status === "pending" ? (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Accept"
                                    disabled={isActioning || isAccepting || isRejecting}
                                    onClick={() => handleAccept(doc.share_id)}
                                    className="text-success hover:text-success hover:bg-success/10"
                                  >
                                    {isActioning ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <CheckCircle className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Reject"
                                    disabled={isActioning || isAccepting || isRejecting}
                                    onClick={() => handleReject(doc.share_id)}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    {isActioning ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <XCircle className="h-4 w-4" />
                                    )}
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="View"
                                    onClick={() => setViewDoc(doc)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Download"
                                    onClick={() => handleDownload(doc)}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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

      {/* View Modal */}
      <Dialog open={!!viewDoc} onOpenChange={(open) => !open && setViewDoc(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Shared Access Details</DialogTitle>
            <DialogDescription>
              Record shared by {viewDoc?.patient.full_name}
            </DialogDescription>
          </DialogHeader>
          {viewDoc && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Provider Type</p>
                  <Badge variant="outline">{viewDoc.provider_type}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  {getStatusBadge(viewDoc.status)}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Provider Name</p>
                <p className="text-sm font-medium">{viewDoc.provider_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Access Level</p>
                <p className="text-sm font-medium">{viewDoc.access_level}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Shared On</p>
                  <p className="text-sm">{formatDate(viewDoc.shared_on)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Expires On</p>
                  <p className="text-sm">{formatDate(viewDoc.expires_on) ?? "Never"}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Records Accessed</p>
                <p className="text-sm font-medium">{viewDoc.records_accessed_count}</p>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Shared Files
                </p>
                {filesLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : files && files.length > 0 ? (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {files.map((file) => (
                      <div
                        key={file.record_id}
                        className="flex items-center justify-between p-2 rounded-md bg-muted/50 border border-border/50 text-sm"
                      >
                        <div className="min-w-0 flex-1 mr-2">
                          <p className="font-medium truncate">{file.title}</p>
                          <p className="text-xs text-muted-foreground">{file.category} • {formatDate(file.record_date)}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDownloadFile(file)}
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No specific files shared.</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="w-full" onClick={() => setViewDoc(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
