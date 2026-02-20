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
import { useHospitalSharedRecords } from "@/hooks/useHospital";
import { HospitalSharedRecord } from "@/api/services/hospital-admin.service";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  try {
    return format(new Date(dateString), "MMM d, yyyy");
  } catch {
    return dateString;
  }
};

export default function HospitalDocuments() {
  const { toast } = useToast();
  const { data: sharedRecords, isLoading } = useHospitalSharedRecords();

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewDoc, setViewDoc] = useState<HospitalSharedRecord | null>(null);

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
    toast({
      title: "Download started",
      description: `Requesting records access for ${doc.patient.full_name}.`,
    });
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
                          <Badge variant={doc.status === "active" ? "default" : "secondary"}>
                            {doc.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
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
                  <Badge variant={viewDoc.status === "active" ? "default" : "secondary"}>
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
    </DashboardLayout>
  );
}
