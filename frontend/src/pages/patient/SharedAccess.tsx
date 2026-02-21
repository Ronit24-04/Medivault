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
  Search,
  Filter,
  QrCode,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  UserCircle,
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
import { usePatientId } from "@/hooks/usePatientId";
import {
  useCreateShare,
  useSharedAccess,
  useSharedAccessStats,
  useRevokeShare,
} from "@/hooks/useSharedAccess";
import { SharedAccess as SharedAccessType } from "@/api/services";
import { format } from "date-fns";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/20">Active</Badge>;
    case "expired":
      return <Badge className="bg-muted text-muted-foreground hover:bg-muted/80">Expired</Badge>;
    case "revoked":
      return <Badge className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20">Revoked</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  try {
    return format(new Date(dateString), "MMM d, yyyy");
  } catch {
    return dateString;
  }
};

export default function SharedAccess() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedShare, setSelectedShare] = useState<SharedAccessType | null>(null);
  const [copied, setCopied] = useState(false);
  const [providerEmail, setProviderEmail] = useState("");
  const [accessLevel, setAccessLevel] = useState("");
  const [accessDuration, setAccessDuration] = useState("");

  const { patientId } = usePatientId();
  const { data: shares, isLoading, error } = useSharedAccess(patientId || 0);
  const { data: stats } = useSharedAccessStats(patientId || 0);
  const revokeShareMutation = useRevokeShare();
  const createShareMutation = useCreateShare();

  const filteredShares = (shares || []).filter((share) => {
    const matchesSearch = share.provider_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || share.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const generateShareUrl = (shareId: number) => {
    return `${window.location.origin}/shared/${shareId}`;
  };

  const handleShowQR = (share: SharedAccessType) => {
    setSelectedShare(share);
    setQrDialogOpen(true);
    setCopied(false);
  };

  const handleCopyLink = () => {
    if (selectedShare) {
      navigator.clipboard.writeText(generateShareUrl(selectedShare.share_id));
      setCopied(true);
      showSuccess("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRevokeAccess = (shareId: number) => {
    if (!patientId) return;
    revokeShareMutation.mutate({ patientId, shareId });
  };

  const handleGrantAccess = async () => {
    if (!patientId) return;

    if (!providerEmail.trim()) {
      return;
    }

    if (!accessLevel) {
      return;
    }

    if (!accessDuration) {
      return;
    }

    const durationDays = Number(accessDuration);
    const expiresOn = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    await createShareMutation.mutateAsync({
      patientId,
      data: {
        providerName: providerEmail.trim(),
        providerType: "Hospital",
        accessLevel,
        expiresOn,
      },
    });

    setProviderEmail("");
    setAccessLevel("");
    setAccessDuration("");
    setShareDialogOpen(false);
  };

  const statsData = [
    { label: "Active Shares", value: stats?.activeShares || 0, icon: Users, color: "text-success" },
    { label: "Pending Requests", value: stats?.pendingRequests || 0, icon: Clock, color: "text-warning" },
    { label: "Total Shared", value: stats?.totalShares || 0, icon: Shield, color: "text-primary" },
    { label: "Records Accessed", value: stats?.totalRecordsAccessed || 0, icon: Eye, color: "text-info" },
  ];

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout userType="patient">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading shared access...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout userType="patient">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
            <p className="text-muted-foreground">
              {error?.message || "Failed to load shared access"}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
          <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
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
                  Grant access only to a registered MediVault hospital.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="provider">Hospital Email</Label>
                  <Input
                    id="provider"
                    placeholder="registered-hospital@example.com"
                    type="email"
                    value={providerEmail}
                    onChange={(e) => setProviderEmail(e.target.value)}
                    disabled={createShareMutation.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="access">Access Level</Label>
                  <Select
                    value={accessLevel}
                    onValueChange={setAccessLevel}
                    disabled={createShareMutation.isPending}
                  >
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
                  <Select
                    value={accessDuration}
                    onValueChange={setAccessDuration}
                    disabled={createShareMutation.isPending}
                  >
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
                <Button
                  className="w-full"
                  onClick={handleGrantAccess}
                  disabled={
                    createShareMutation.isPending ||
                    !providerEmail.trim() ||
                    !accessLevel ||
                    !accessDuration
                  }
                >
                  {createShareMutation.isPending ? "Granting Access..." : "Grant Access"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map((stat) => {
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
                  <SelectItem value="revoked">Revoked</SelectItem>
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
                    <TableRow key={share.share_id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {share.provider_type === "Hospital" ? (
                                <Building2 className="h-4 w-4" />
                              ) : share.provider_type === "EmergencyContact" ? (
                                <UserCircle className="h-4 w-4" />
                              ) : (
                                share.provider_name.charAt(0)
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{share.provider_name}</p>
                            <p className="text-sm text-muted-foreground">{share.provider_type}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline">{share.access_level}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {share.records_accessed_count} records
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {formatDate(share.expires_on)}
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
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleRevokeAccess(share.share_id)}
                              >
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
                {selectedShare && `Share your ${selectedShare.access_level.toLowerCase()} with ${selectedShare.provider_name}`}
              </DialogDescription>
            </DialogHeader>
            {selectedShare && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <QRCodeDisplay
                    value={generateShareUrl(selectedShare.share_id)}
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
                      value={generateShareUrl(selectedShare.share_id)}
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
                  <p>Access expires: {formatDate(selectedShare.expires_on)}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
