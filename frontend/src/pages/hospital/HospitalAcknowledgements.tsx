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
  Search,
  Filter,
  CheckCircle,
  Clock,
  FileText,
  User,
  Calendar,
  Check,
  X,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AckStatus = "pending" | "acknowledged" | "rejected";

type Acknowledgement = {
  id: number;
  patientName: string;
  patientId: string;
  documentType: string;
  description: string;
  receivedDate: string;
  status: AckStatus;
  priority: string;
};

const initialAcknowledgements: Acknowledgement[] = [
  {
    id: 1,
    patientName: "Ronit Mahale",
    patientId: "P-001",
    documentType: "Lab Report",
    description: "Complete Blood Count (CBC)",
    receivedDate: "Jan 21, 2026",
    status: "pending",
    priority: "normal",
  },
  {
    id: 2,
    patientName: "Flavius Almeida",
    patientId: "P-002",
    documentType: "Prescription",
    description: "Monthly medication refill",
    receivedDate: "Jan 20, 2026",
    status: "pending",
    priority: "high",
  },
  {
    id: 3,
    patientName: "Shrinidhi Naik",
    patientId: "P-003",
    documentType: "Imaging",
    description: "Chest X-Ray Results",
    receivedDate: "Jan 19, 2026",
    status: "acknowledged",
    priority: "normal",
  },
  {
    id: 4,
    patientName: "Selwyn Dsouza",
    patientId: "P-004",
    documentType: "Lab Report",
    description: "Lipid Panel",
    receivedDate: "Jan 18, 2026",
    status: "acknowledged",
    priority: "normal",
  },
  {
    id: 5,
    patientName: "Soham Mapare",
    patientId: "P-005",
    documentType: "Consultation",
    description: "Cardiology follow-up notes",
    receivedDate: "Jan 17, 2026",
    status: "rejected",
    priority: "high",
  },
];

export default function HospitalAcknowledgements() {
  const [items, setItems] = useState<Acknowledgement[]>(initialAcknowledgements);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    id: number | null;
    action: "acknowledged" | "rejected" | null;
    patientName: string;
  }>({ open: false, id: null, action: null, patientName: "" });

  const handleAction = (id: number, action: AckStatus, patientName: string) => {
    if (action === "acknowledged" || action === "rejected") {
      setConfirmDialog({ open: true, id, action, patientName });
    }
  };

  const confirmAction = () => {
    if (confirmDialog.id !== null && confirmDialog.action) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === confirmDialog.id
            ? { ...item, status: confirmDialog.action as AckStatus }
            : item
        )
      );
    }
    setConfirmDialog({ open: false, id: null, action: null, patientName: "" });
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.patientId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || item.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const pendingCount = items.filter((a) => a.status === "pending").length;
  const acknowledgedCount = items.filter((a) => a.status === "acknowledged").length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="gap-1 whitespace-nowrap">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "acknowledged":
        return (
          <Badge variant="default" className="gap-1 bg-success text-success-foreground whitespace-nowrap">
            <CheckCircle className="h-3 w-3" />
            Acknowledged
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="gap-1 whitespace-nowrap">
            <X className="h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout userType="hospital">
      <div className="space-y-6">
        {/* Main header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Acknowledgements</h1>
          <p className="text-muted-foreground">
            Review and acknowledge received patient documents.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Review
              </CardTitle>
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
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Acknowledged
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                <span className="text-2xl font-bold">{acknowledgedCount}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Documents
              </CardTitle>
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
                  placeholder="Search by patient name, ID, or description..."
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
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
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
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div>
                            <span className="font-medium block">{item.patientName}</span>
                            <span className="text-xs text-muted-foreground">{item.patientId}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <Badge variant="outline" className="mb-1">{item.documentType}</Badge>
                          <p className="text-sm text-muted-foreground truncate max-w-[150px]">
                            {item.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {item.receivedDate}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.priority === "high" ? "destructive" : "secondary"}>
                          {item.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-right">
                        {item.status === "pending" && (
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Acknowledge"
                              className="text-success hover:text-success hover:bg-success/10"
                              onClick={() => handleAction(item.id, "acknowledged", item.patientName)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Reject"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleAction(item.id, "rejected", item.patientName)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        {item.status !== "pending" && (
                          <span className="text-xs text-muted-foreground pr-2">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredItems.length === 0 && (
              <div className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No documents found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters.</p>
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
                ? `Are you sure you want to acknowledge the document from ${confirmDialog.patientName}?`
                : `Are you sure you want to reject the document from ${confirmDialog.patientName}? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-2">
            <Button
              variant="outline"
              onClick={() =>
                setConfirmDialog({ open: false, id: null, action: null, patientName: "" })
              }
            >
              Cancel
            </Button>
            <Button
              variant={confirmDialog.action === "rejected" ? "destructive" : "default"}
              onClick={confirmAction}
            >
              {confirmDialog.action === "acknowledged" ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Acknowledge
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
