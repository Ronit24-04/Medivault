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
} from "lucide-react";
import { useHospitalSharedRecords, useSharedRecordFiles } from "@/hooks/useHospital";
import {
  HospitalSharedRecord,
  SharedRecordFile,
} from "@/api/services/hospital-admin.service";
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

export default function HospitalDocuments() {
  const { data: sharedRecords, isLoading } = useHospitalSharedRecords();

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewDoc, setViewDoc] = useState<HospitalSharedRecord | null>(null);
  const [viewFilesShare, setViewFilesShare] = useState<HospitalSharedRecord | null>(null);
  const [selectedFile, setSelectedFile] = useState<SharedRecordFile | null>(null);
  const { data: sharedFiles, isLoading: isLoadingFiles } = useSharedRecordFiles(
    viewFilesShare?.share_id || null
  );

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

  const getStatusVariant = (status: string) => {
    if (status === "rejected") return "destructive" as const;
    if (status === "active") return "default" as const;
    return "secondary" as const;
  };

  const isImageFile = (file: SharedRecordFile) =>
    file.file_type?.startsWith("image/") ||
    /\.(png|jpg|jpeg|gif|webp)$/i.test(file.file_path);

  const isPdfFile = (file: SharedRecordFile) =>
    file.file_type === "application/pdf" || /\.pdf$/i.test(file.file_path);

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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
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
                    {filtered.map((doc) => (
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
                          <Badge variant={getStatusVariant(doc.status)}>
                            {doc.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="View"
                              onClick={() => {
                                setViewFilesShare(doc);
                                setSelectedFile(null);
                              }}
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
                          </div>
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
                  <Badge variant={getStatusVariant(viewDoc.status)}>
                    {viewDoc.status}
                  </Badge>
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
              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1"
                  onClick={() => { handleDownload(viewDoc); setViewDoc(null); }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline" onClick={() => setViewDoc(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* File Viewer Modal */}
      <Dialog
        open={!!viewFilesShare}
        onOpenChange={(open) => {
          if (!open) {
            setViewFilesShare(null);
            setSelectedFile(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Shared Files</DialogTitle>
            <DialogDescription>
              {viewFilesShare
                ? `Files shared by ${viewFilesShare.patient.full_name}`
                : "Loading shared files"}
            </DialogDescription>
          </DialogHeader>

          {isLoadingFiles ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !sharedFiles || sharedFiles.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No files available for this shared access.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-2">
              <div className="space-y-2 max-h-[420px] overflow-auto pr-2">
                {sharedFiles.map((file) => (
                  <Button
                    key={file.record_id}
                    variant={selectedFile?.record_id === file.record_id ? "default" : "outline"}
                    className="w-full justify-start text-left h-auto py-3"
                    onClick={() => setSelectedFile(file)}
                  >
                    <div className="truncate">
                      <p className="font-medium truncate">{file.title}</p>
                      <p className="text-xs opacity-80">{formatDate(file.record_date)}</p>
                    </div>
                  </Button>
                ))}
              </div>

              <div className="lg:col-span-2 border rounded-md min-h-[420px] p-3">
                {!selectedFile ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Select a file to preview
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{selectedFile.title}</h3>
                      <Button
                        size="sm"
                        onClick={() => window.open(selectedFile.file_path, "_blank")}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                    {isImageFile(selectedFile) && (
                      <img
                        src={selectedFile.file_path}
                        alt={selectedFile.title}
                        className="max-h-[340px] w-full object-contain rounded-md border"
                      />
                    )}
                    {isPdfFile(selectedFile) && (
                      <iframe
                        src={selectedFile.file_path}
                        title={selectedFile.title}
                        className="w-full h-[340px] rounded-md border"
                      />
                    )}
                    {!isImageFile(selectedFile) && !isPdfFile(selectedFile) && (
                      <div className="text-sm text-muted-foreground">
                        Preview is not available for this file type. Use Download to open it.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
