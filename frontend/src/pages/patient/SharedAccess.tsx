import { useState, useEffect, useRef } from "react";
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
  MapPin,
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
  useSharedAccess,
  useSharedAccessStats,
  useRevokeShare,
  useCreateShare,
} from "@/hooks/useSharedAccess";
import { SharedAccess as SharedAccessType } from "@/api/services";
import { sharedAccessService } from "@/api/services/shared-access.service";
import { Hospital } from "@/api/types";
import { format, addDays, addYears } from "date-fns";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/20">Active</Badge>;
    case "expired":
      return <Badge className="bg-muted text-muted-foreground hover:bg-muted/80">Expired</Badge>;
    case "revoked":
      return <Badge className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20">Revoked</Badge>;
    case "pending":
      return <Badge className="bg-warning/10 text-warning border-warning/20 hover:bg-warning/20">Pending</Badge>;
    case "rejected":
      return <Badge className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20">Rejected</Badge>;
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

const ACCESS_LEVEL_OPTIONS = [
  { value: "Full Records", label: "Full Records" },
  { value: "Lab Reports Only", label: "Lab Reports Only" },
  { value: "Prescriptions Only", label: "Prescriptions Only" },
  { value: "Imaging Records Only", label: "Imaging Records Only" },
];

const DURATION_OPTIONS = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "365", label: "1 year" },
  { value: "0", label: "No expiry" },
];

function ShareDialog({ patientId }: { patientId: number }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [accessLevel, setAccessLevel] = useState("");
  const [duration, setDuration] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { mutate: createShare, isPending: isSubmitting } = useCreateShare();

  // Debounced hospital search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery || searchQuery.trim().length < 1) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await sharedAccessService.searchHospitals(searchQuery);
        setSearchResults(results);
        setShowDropdown(results.length > 0);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelectHospital = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setSearchQuery(hospital.hospital_name);
    setShowDropdown(false);
  };

  const handleClearHospital = () => {
    setSelectedHospital(null);
    setSearchQuery("");
  };

  const computeExpiresOn = (): string | undefined => {
    if (!duration || duration === "0") return undefined;
    const days = parseInt(duration, 10);
    const date = days === 365 ? addYears(new Date(), 1) : addDays(new Date(), days);
    return date.toISOString();
  };

  const handleSubmit = () => {
    if (!selectedHospital || !accessLevel || !duration) return;
    createShare(
      {
        patientId,
        data: {
          hospitalId: selectedHospital.hospital_id,
          providerName: selectedHospital.email || selectedHospital.hospital_name,
          providerType: "Hospital",
          accessLevel,
          expiresOn: computeExpiresOn(),
        },
      },
      {
        onSuccess: () => {
          setOpen(false);
          setSearchQuery("");
          setSelectedHospital(null);
          setAccessLevel("");
          setDuration("");
        },
      }
    );
  };

  const isFormValid = !!selectedHospital && !!accessLevel && !!duration;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Share Records
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Records</DialogTitle>
          <DialogDescription>
            Search for a hospital by name and grant them access to your records.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {/* Hospital search */}
          <div className="space-y-2">
            <Label>Search Hospital</Label>
            <div className="relative" ref={dropdownRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10 pr-10"
                placeholder="Type hospital name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (selectedHospital) setSelectedHospital(null);
                }}
                autoComplete="off"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {showDropdown && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-52 overflow-y-auto">
                  {searchResults.map((h) => (
                    <button
                      key={h.hospital_id}
                      type="button"
                      className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-accent text-left transition-colors"
                      onClick={() => handleSelectHospital(h)}
                    >
                      <Building2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{h.hospital_name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {h.city}, {h.state}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedHospital && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary/5 border border-primary/20">
                <Building2 className="h-4 w-4 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{selectedHospital.hospital_name}</p>
                  <p className="text-xs text-muted-foreground">{selectedHospital.city}, {selectedHospital.state}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={handleClearHospital}
                >
                  <Trash2 className="h-3 w-3 text-muted-foreground" />
                </Button>
              </div>
            )}
          </div>

          {/* Access level */}
          <div className="space-y-2">
            <Label>Access Level</Label>
            <Select value={accessLevel} onValueChange={setAccessLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select access level" />
              </SelectTrigger>
              <SelectContent>
                {ACCESS_LEVEL_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>Access Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Info note */}
          <p className="text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
            The hospital will receive a pending request and must accept it before gaining access.
          </p>

          <Button
            className="w-full"
            disabled={!isFormValid || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Request...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Send Access Request
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function SharedAccess() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedShare, setSelectedShare] = useState<SharedAccessType | null>(null);
  const [copied, setCopied] = useState(false);

  const { patientId } = usePatientId();
  const { data: shares, isLoading, error } = useSharedAccess(patientId || 0);
  const { data: stats } = useSharedAccessStats(patientId || 0);
  const revokeShareMutation = useRevokeShare();

  const filteredShares = (shares || []).filter((share) => {
    const matchesSearch = share.provider_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || share.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Count pending shares directly from the shares list
  const pendingCount = (shares || []).filter((s) => s.status === "pending").length;

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

  const statsData = [
    { label: "Active Shares", value: stats?.activeShares || 0, icon: Users, color: "text-success" },
    { label: "Pending Requests", value: pendingCount, icon: Clock, color: "text-warning" },
    { label: "Total Shared", value: stats?.totalShares || 0, icon: Shield, color: "text-primary" },
    { label: "Records Accessed", value: stats?.totalRecordsAccessed || 0, icon: Eye, color: "text-info" },
  ];

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
          {patientId && <ShareDialog patientId={patientId} />}
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

        {/* Filters */}
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
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
              Active &amp; Past Shares
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
                  {(shares || []).length === 0
                    ? "You haven't shared your records with anyone yet."
                    : "Try adjusting your search or filters."}
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
