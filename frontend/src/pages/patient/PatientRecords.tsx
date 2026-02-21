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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Plus,
  FileText,
  Download,
  Share2,
  Eye,
  TestTube,
  Activity,
  Pill,
  Stethoscope,
  Image as ImageIcon,
  MoreVertical,
  FolderOpen,
  Clock,
  Loader2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRecords, useDeleteRecord } from "@/hooks/useRecords";
import { useProfileStore } from "@/stores/useProfileStore";
import { format } from "date-fns";
import { MedicalRecord } from "@/api/types";

// Helper function to get icon based on record type
const getRecordIcon = (recordType?: string) => {
  const type = (recordType || '').toLowerCase();
  if (type.includes('lab') || type.includes('test')) return TestTube;
  if (type.includes('prescription') || type.includes('medication')) return Pill;
  if (type.includes('cardio') || type.includes('heart')) return Activity;
  if (type.includes('radiology') || type.includes('xray') || type.includes('scan')) return ImageIcon;
  if (type.includes('general') || type.includes('checkup')) return Stethoscope;
  return FileText;
};

// Helper function to format date
const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "MMM d, yyyy");
  } catch {
    return dateString;
  }
};

// Helper function to format file size
const formatFileSize = (bytes?: number) => {
  if (!bytes) return "N/A";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const categories = [
  { value: "all", label: "All Categories" },
  { value: "lab", label: "Lab Reports" },
  { value: "prescription", label: "Prescriptions" },
  { value: "radiology", label: "Radiology" },
  { value: "cardiology", label: "Cardiology" },
  { value: "general", label: "General" },
];

const getStatusBadge = (isCritical: boolean) => {
  if (isCritical) {
    return <Badge className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20">Critical</Badge>;
  }
  return <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/20">Normal</Badge>;
};

export default function PatientRecords() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewingRecord, setViewingRecord] = useState<MedicalRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<MedicalRecord | null>(null);

  const handleDownload = (record: MedicalRecord) => {
    const a = document.createElement("a");
    a.href = record.file_path;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.download = record.title;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const currentProfile = useProfileStore((s) => s.currentProfile);
  const patientId = currentProfile?.patient_id;

  // Fetch medical records
  const { data: records, isLoading, error } = useRecords(patientId || 0);

  // Delete mutation
  const { mutate: deleteRecord, isPending: isDeleting } = useDeleteRecord();

  const handleDeleteConfirm = () => {
    if (!deletingRecord || !patientId) return;
    deleteRecord(
      { patientId, recordId: deletingRecord.record_id },
      { onSettled: () => setDeletingRecord(null) }
    );
  };

  // Filter records based on search and category
  const filteredRecords = records?.filter((record) => {
    const matchesSearch =
      record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (record.facility_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (record.physician_name?.toLowerCase() || "").includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      record.category.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  }) || [];

  // Calculate stats from real data
  const stats = [
    {
      label: "Total Records",
      value: records?.length || 0,
      icon: FileText,
      color: "text-primary"
    },
    {
      label: "Lab Reports",
      value: records?.filter(r => r.category.toLowerCase().includes("lab")).length || 0,
      icon: TestTube,
      color: "text-info"
    },
    {
      label: "Prescriptions",
      value: records?.filter(r => r.category.toLowerCase().includes("prescription")).length || 0,
      icon: Pill,
      color: "text-success"
    },
    {
      label: "Recent Uploads",
      value: records?.filter(r => {
        const daysDiff = Math.floor((Date.now() - new Date(r.created_at).getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff <= 7;
      }).length || 0,
      icon: Clock,
      color: "text-warning"
    },
  ];

  return (
    <DashboardLayout userType="patient">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">My Records</h1>
            <p className="text-muted-foreground">View and manage all your medical records.</p>
          </div>
          <Button asChild>
            <Link to="/patient/upload">
              <Plus className="mr-2 h-4 w-4" />
              Upload Record
            </Link>
          </Button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
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

        {/* filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search records, hospitals, doctors..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Records table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Medical Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Loading records...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
                  <p className="text-muted-foreground">{error.message || "Failed to load records"}</p>
                </div>
              </div>
            ) : filteredRecords.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Record</TableHead>
                    <TableHead className="hidden md:table-cell">Type</TableHead>
                    <TableHead className="hidden lg:table-cell">Hospital</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => {
                    const Icon = getRecordIcon(record.category);
                    return (
                      <TableRow key={record.record_id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="icon-container flex-shrink-0">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{record.title}</p>
                              <p className="text-sm text-muted-foreground md:hidden">
                                {record.category}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="outline">{record.category}</Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {record.facility_name || "N/A"}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">
                          {formatDate(record.record_date)}
                        </TableCell>
                        <TableCell>{getStatusBadge(record.is_critical)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="hidden sm:inline-flex"
                              title="View record"
                              onClick={() => setViewingRecord(record)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="hidden sm:inline-flex"
                              title="Download record"
                              onClick={() => handleDownload(record)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="hidden sm:inline-flex text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Delete record"
                              onClick={() => setDeletingRecord(record)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon-sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setViewingRecord(record)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Record
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownload(record)}>
                                  <Download className="mr-2 h-4 w-4" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                  onClick={() => setDeletingRecord(record)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No records found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || selectedCategory !== "all"
                    ? "Try adjusting your search or filter to find what you're looking for."
                    : "You haven't uploaded any medical records yet."}
                </p>
                <Button asChild>
                  <Link to="/patient/upload">Upload Your First Record</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Record Viewer Modal */}
      <Dialog open={!!viewingRecord} onOpenChange={(open) => !open && setViewingRecord(null)}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {viewingRecord?.title}
            </DialogTitle>
          </DialogHeader>

          {/* Record metadata */}
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground border-b pb-3">
            {viewingRecord?.category && (
              <Badge variant="outline">{viewingRecord.category}</Badge>
            )}
            {viewingRecord?.record_date && (
              <span>📅 {formatDate(viewingRecord.record_date)}</span>
            )}
            {viewingRecord?.physician_name && (
              <span>👨‍⚕️ {viewingRecord.physician_name}</span>
            )}
            {viewingRecord?.facility_name && (
              <span>🏥 {viewingRecord.facility_name}</span>
            )}
            {viewingRecord?.file_size_bytes && (
              <span>📦 {formatFileSize(viewingRecord.file_size_bytes)}</span>
            )}
          </div>

          {/* File viewer */}
          <div className="flex-1 overflow-auto rounded-lg bg-muted/30 min-h-[400px] flex items-center justify-center">
            {viewingRecord?.file_type?.startsWith("image/") ? (
              <img
                src={viewingRecord.file_path}
                alt={viewingRecord.title}
                className="max-w-full max-h-[60vh] object-contain rounded-lg"
              />
            ) : viewingRecord?.file_type === "application/pdf" ? (
              <iframe
                src={viewingRecord.file_path}
                title={viewingRecord.title}
                className="w-full h-[60vh] rounded-lg border-0"
              />
            ) : (
              <div className="text-center p-8">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground mb-4">Preview not available for this file type.</p>
                <Button onClick={() => viewingRecord && handleDownload(viewingRecord)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download to View
                </Button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              className="flex-1"
              onClick={() => viewingRecord && handleDownload(viewingRecord)}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button
              variant="outline"
              onClick={() => viewingRecord && window.open(viewingRecord.file_path, "_blank")}
            >
              <Eye className="mr-2 h-4 w-4" />
              Open in New Tab
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingRecord}
        onOpenChange={(open) => !open && !isDeleting && setDeletingRecord(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete Record?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-semibold text-foreground">
                {deletingRecord?.title}
              </span>{" "}
              from your account and remove the file from our servers. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
