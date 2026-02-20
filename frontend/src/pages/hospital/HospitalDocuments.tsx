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
  Search,
  Filter,
  FileText,
  Download,
  Eye,
  Calendar,
  User,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

type Document = {
  id: number;
  patientName: string;
  patientId: string;
  documentType: string;
  description: string;
  uploadDate: string;
  sharedDate: string;
  status: string;
};

const documents: Document[] = [
  {
    id: 1,
    patientName: "John Snow",
    patientId: "P-001",
    documentType: "Lab Report",
    description: "Complete Blood Count (CBC)",
    uploadDate: "Jan 20, 2026",
    sharedDate: "Jan 21, 2026",
    status: "active",
  },
  {
    id: 2,
    patientName: "Hemant Raikar",
    patientId: "P-002",
    documentType: "Prescription",
    description: "Monthly medication refill",
    uploadDate: "Jan 19, 2026",
    sharedDate: "Jan 19, 2026",
    status: "active",
  },
  {
    id: 3,
    patientName: "Francis Ravat",
    patientId: "P-003",
    documentType: "Imaging",
    description: "Chest X-Ray Results",
    uploadDate: "Jan 18, 2026",
    sharedDate: "Jan 18, 2026",
    status: "expired",
  },
  {
    id: 4,
    patientName: "Soham Mapare",
    patientId: "P-004",
    documentType: "Lab Report",
    description: "Lipid Panel",
    uploadDate: "Jan 17, 2026",
    sharedDate: "Jan 17, 2026",
    status: "active",
  },
  {
    id: 5,
    patientName: "Ronit Mahale",
    patientId: "P-005",
    documentType: "Consultation",
    description: "Cardiology follow-up notes",
    uploadDate: "Jan 16, 2026",
    sharedDate: "Jan 16, 2026",
    status: "active",
  },
];

export default function HospitalDocuments() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewDoc, setViewDoc] = useState<Document | null>(null);

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.patientId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      typeFilter === "all" ||
      doc.documentType.toLowerCase().replace(" ", "-") === typeFilter;
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDownload = (doc: Document) => {
    toast({
      title: "Download started",
      description: `Downloading "${doc.description}" for ${doc.patientName}.`,
    });
  };

  return (
    <DashboardLayout userType="hospital">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Patient Documents</h1>
          <p className="text-muted-foreground">
            View and manage all shared patient documents.
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by patient name, ID, or description..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <FileText className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Document Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="lab-report">Lab Reports</SelectItem>
                  <SelectItem value="prescription">Prescriptions</SelectItem>
                  <SelectItem value="imaging">Imaging</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
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
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Documents Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Document Type</TableHead>
                    <TableHead className="hidden md:table-cell">Description</TableHead>
                    <TableHead className="hidden lg:table-cell">Shared Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div>
                            <span className="font-medium block">{doc.patientName}</span>
                            <span className="text-xs text-muted-foreground">{doc.patientId}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{doc.documentType}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                        {doc.description}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {doc.sharedDate}
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
                            title="View document"
                            onClick={() => setViewDoc(doc)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Download document"
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
            </div>

            {filteredDocuments.length === 0 && (
              <div className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No documents found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Document View Modal */}
      <Dialog open={!!viewDoc} onOpenChange={(open) => !open && setViewDoc(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Document Details</DialogTitle>
            <DialogDescription>
              Shared by {viewDoc?.patientName} ({viewDoc?.patientId})
            </DialogDescription>
          </DialogHeader>

          {viewDoc && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Document Type</p>
                  <Badge variant="outline">{viewDoc.documentType}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <Badge variant={viewDoc.status === "active" ? "default" : "secondary"}>
                    {viewDoc.status}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Description</p>
                <p className="text-sm font-medium">{viewDoc.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Upload Date</p>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {viewDoc.uploadDate}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Shared Date</p>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {viewDoc.sharedDate}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    handleDownload(viewDoc);
                    setViewDoc(null);
                  }}
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
