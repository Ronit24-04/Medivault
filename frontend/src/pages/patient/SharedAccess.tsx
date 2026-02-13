import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  Plus,
  Shield,
  Clock,
  Eye,
  Trash2,
  Settings,
  Users,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  QrCode,
  Copy,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { showSuccess } from "@/lib/toast";

const sharedWith = [
  {
    id: 1,
    name: "City General Hospital",
    type: "Hospital",
    access: "Full Records",
    sharedOn: "Jan 10, 2026",
    expiresOn: "Apr 10, 2026",
    status: "active",
    recordsAccessed: 12,
  },
  {
    id: 2,
    name: "Dr. Sarah Wilson",
    type: "Doctor",
    access: "Cardiology Records",
    sharedOn: "Jan 5, 2026",
    expiresOn: "Feb 5, 2026",
    status: "active",
    recordsAccessed: 5,
  },
  {
    id: 3,
    name: "Metro Health Clinic",
    type: "Hospital",
    access: "Lab Reports Only",
    sharedOn: "Dec 15, 2025",
    expiresOn: "Jan 15, 2026",
    status: "expired",
    recordsAccessed: 3,
  },
];

const pendingRequests = [
  {
    id: 1,
    name: "Regional Medical Center",
    type: "Hospital",
    requestedAccess: "Full Records",
    requestedOn: "Jan 20, 2026",
    reason: "Scheduled surgery consultation",
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/20">Active</Badge>;
    case "expired":
      return <Badge className="bg-muted text-muted-foreground hover:bg-muted/80">Expired</Badge>;
    case "pending":
      return <Badge className="bg-warning/10 text-warning border-warning/20 hover:bg-warning/20">Pending</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function SharedAccess() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedShare, setSelectedShare] = useState<typeof sharedWith[0] | null>(null);
  const [copied, setCopied] = useState(false);

  const filteredShares = sharedWith.filter((share) => {
    const matchesSearch = share.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || share.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const generateShareUrl = (shareId: number) => {
    return `${window.location.origin}/shared/${shareId}`;
  };

  const handleShowQR = (share: typeof sharedWith[0]) => {
    setSelectedShare(share);
    setQrDialogOpen(true);
    setCopied(false);
  };

  const handleCopyLink = () => {
    if (selectedShare) {
      navigator.clipboard.writeText(generateShareUrl(selectedShare.id));
      setCopied(true);
      showSuccess("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const stats = [
    { label: "Active Shares", value: sharedWith.filter(s => s.status === "active").length, icon: Users, color: "text-success" },
    { label: "Pending Requests", value: pendingRequests.length, icon: Clock, color: "text-warning" },
    { label: "Total Shared", value: sharedWith.length, icon: Shield, color: "text-primary" },
    { label: "Records Accessed", value: sharedWith.reduce((acc, s) => acc + s.recordsAccessed, 0), icon: Eye, color: "text-info" },
  ];

  return (
    <DashboardLayout userType="patient">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Shared Access</h1>
            <p className="text-muted-foreground">
              Manage who can access your medical records.
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Share Records
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Your Records</DialogTitle>
                <DialogDescription>
                  Grant access to a healthcare provider.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider Email or ID</Label>
                  <Input id="provider" placeholder="hospital@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="access">Access Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select access level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Records</SelectItem>
                      <SelectItem value="lab">Lab Reports Only</SelectItem>
                      <SelectItem value="prescriptions">Prescriptions Only</SelectItem>
                      <SelectItem value="imaging">Imaging Records Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Access Duration</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full">Grant Access</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
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

        {/* shows pending requests */}
        {pendingRequests.length > 0 && (
          <Card className="border-warning/50 bg-warning/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-warning" />
                Pending Access Requests ({pendingRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead className="hidden sm:table-cell">Requested Access</TableHead>
                    <TableHead className="hidden md:table-cell">Reason</TableHead>
                    <TableHead className="hidden sm:table-cell">Requested On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              <Building2 className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{request.name}</p>
                            <p className="text-sm text-muted-foreground">{request.type}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline">{request.requestedAccess}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {request.reason}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {request.requestedOn}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" className="gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Approve</span>
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1">
                            <XCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">Decline</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Use filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search providers..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
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

        {/* Shared access table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Active & Past Shares
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredShares.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead className="hidden sm:table-cell">Access Level</TableHead>
                    <TableHead className="hidden md:table-cell">Records Accessed</TableHead>
                    <TableHead className="hidden lg:table-cell">Expires</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShares.map((share) => (
                    <TableRow key={share.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {share.type === "Hospital" ? (
                                <Building2 className="h-4 w-4" />
                              ) : (
                                share.name.charAt(0)
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{share.name}</p>
                            <p className="text-sm text-muted-foreground">{share.type}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline">{share.access}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {share.recordsAccessed} records
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {share.expiresOn}
                      </TableCell>
                      <TableCell>{getStatusBadge(share.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon-sm" className="hidden sm:inline-flex">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" className="hidden sm:inline-flex">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleShowQR(share)}>
                                <QrCode className="mr-2 h-4 w-4" />
                                Show QR Code
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Settings className="mr-2 h-4 w-4" />
                                Edit Access
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Revoke Access
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No shared access found</h3>
                <p className="text-muted-foreground">
                  You haven't shared your records with anyone yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security information */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Your Data is Protected</h3>
                <p className="text-sm text-muted-foreground">
                  All shared records are encrypted and you can revoke access at any
                  time. Healthcare providers can only view the records you
                  explicitly grant access to.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR code dialog */}
        <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Share Access via QR Code
              </DialogTitle>
              <DialogDescription>
                {selectedShare && `Share your ${selectedShare.access.toLowerCase()} with ${selectedShare.name}`}
              </DialogDescription>
            </DialogHeader>
            {selectedShare && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <QRCodeDisplay
                    value={generateShareUrl(selectedShare.id)}
                    title=""
                    description=""
                    size={180}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Share Link</Label>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={generateShareUrl(selectedShare.id)}
                      className="text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyLink}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground text-center">
                  <p>Access expires: {selectedShare.expiresOn}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
