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
import { toast } from "sonner";
import { usePatientId } from "@/hooks/usePatientId";
import { useRecords } from "@/hooks/useRecords";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useSharedAccess,
  useSharedAccessStats,
  useRevokeShare,
  useCreateShare,
  useSharedFiles,
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
  { value: "Specific Records Only", label: "Specific Records Only" },
];

const DURATION_OPTIONS = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "365", label: "1 year" },
  { value: "0", label: "No expiry" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { value: "emergency", label: "Emergency", color: "bg-red-100 text-red-700 border-red-200 animate-pulse" },
];

const getPriorityBadge = (priority?: string) => {
  if (!priority) return null;
  const option = PRIORITY_OPTIONS.find((o) => o.value === priority);
  return (
    <Badge className={`${option?.color || "bg-muted text-muted-foreground"} border font-medium`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  );
};

function ShareDialog({ patientId }: { patientId: number }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [accessLevel, setAccessLevel] = useState("");
  const [duration, setDuration] = useState("");
  const [priority, setPriority] = useState("medium");
  const [selectedRecordIds, setSelectedRecordIds] = useState<number[]>([]);
  const { data: records, isLoading: recordsLoading } = useRecords(patientId);
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

    const sharedRecordIds =
      accessLevel === "Specific Records Only"
        ? JSON.stringify(selectedRecordIds)
        : undefined;

    createShare(
      {
        patientId,
        data: {
          hospitalId: selectedHospital.hospital_id,
          providerName: selectedHospital.email || selectedHospital.hospital_name,
          providerType: "Hospital",
          accessLevel,
          expiresOn: computeExpiresOn(),
          sharedRecordIds,
          priority,
        },
      },
      {
        onSuccess: () => {
          setOpen(false);
          setSearchQuery("");
          setSelectedHospital(null);
          setAccessLevel("");
          setDuration("");
          setPriority("medium");
          setSelectedRecordIds([]);
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
            <Select value={accessLevel} onValueChange={(val) => {
              setAccessLevel(val);
              if (val !== "Specific Records Only") setSelectedRecordIds([]);
            }}>
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

          {/* Specific Record Selection */}
          {accessLevel === "Specific Records Only" && (
            <div className="space-y-2">
              <Label>Select Records ({selectedRecordIds.length} selected)</Label>
              <div className="border rounded-md max-h-[180px] overflow-y-auto p-2 space-y-1">
                {recordsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : records && records.length > 0 ? (
                  records.map((record) => (
                    <div key={record.record_id} className="flex items-center space-x-2 p-1 hover:bg-accent rounded-sm transition-colors cursor-pointer" onClick={() => {
                      setSelectedRecordIds(prev =>
                        prev.includes(record.record_id)
                          ? prev.filter(id => id !== record.record_id)
                          : [...prev, record.record_id]
                      );
                    }}>
                      <Checkbox
                        id={`record-${record.record_id}`}
                        checked={selectedRecordIds.includes(record.record_id)}
                        onCheckedChange={() => { }} // Handled by div click for better UX
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{record.title}</p>
                        <p className="text-[10px] text-muted-foreground">{record.category} • {format(new Date(record.record_date), "MMM d, yyyy")}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">No records found to share.</p>
                )}
              </div>
            </div>
          )}

          {/* Duration */}
          <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
  const [viewFilesOpen, setViewFilesOpen] = useState(false);
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
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRevokeAccess = (shareId: number) => {
    if (!patientId) return;
    revokeShareMutation.mutate({ patientId, shareId });
  };

  const handleViewFiles = (share: SharedAccessType) => {
    setSelectedShare(share);
    setViewFilesOpen(true);
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
                    <TableHead>Priority</TableHead>
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
                            <div className="flex flex-col gap-0.5">
                              <p className="text-sm text-muted-foreground">{share.provider_type}</p>
                              {share.hospital_notes && (
                                <div className="flex items-start gap-1 text-[11px] bg-accent/50 text-muted-foreground px-1.5 py-0.5 rounded border border-border mt-1">
                                  <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                  <span className="italic line-clamp-1">{share.hospital_notes}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline">{share.access_level}</Badge>
                      </TableCell>
                      <TableCell>
                        {getPriorityBadge(share.priority)}
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewFiles(share)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Shared Files
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleShowQR(share)}>
                                <QrCode className="mr-2 h-4 w-4" />
                                Show QR Code
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
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Share Access</DialogTitle>
              <DialogDescription>
                Scan this QR code to quickly grant access or copy the link below.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center space-y-6 py-4">
              <div className="p-4 bg-white rounded-xl shadow-sm border border-border">
                {selectedShare && (
                  <QRCodeDisplay
                    value={generateShareUrl(selectedShare.share_id)}
                    size={200}
                  />
                )}
              </div>
              <div className="w-full space-y-2">
                <Label className="text-xs text-muted-foreground">Share Link</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={selectedShare ? generateShareUrl(selectedShare.share_id) : ""}
                    className="flex-1 bg-muted/50 text-xs"
                  />
                  <Button size="icon" variant="outline" onClick={handleCopyLink}>
                    {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Files Dialog */}
        <ViewFilesDialog
          patientId={patientId || 0}
          share={selectedShare}
          open={viewFilesOpen}
          onOpenChange={setViewFilesOpen}
        />
      </div>
    </DashboardLayout>
  );
}

function ViewFilesDialog({ patientId, share, open, onOpenChange }: {
  patientId: number;
  share: SharedAccessType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: files, isLoading } = useSharedFiles(patientId, share?.share_id ?? null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Files Shared with {share?.provider_name}</DialogTitle>
          <DialogDescription>
            You have granted {share?.access_level.toLowerCase()} access to the following files.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-muted/50 p-2 rounded border border-border/50">
              <p className="text-muted-foreground mb-0.5 font-medium uppercase tracking-wider">Status</p>
              {share && getStatusBadge(share.status)}
            </div>
            <div className="bg-muted/50 p-2 rounded border border-border/50">
              <p className="text-muted-foreground mb-0.5 font-medium uppercase tracking-wider">Priority</p>
              {share && getPriorityBadge(share.priority)}
            </div>
          </div>

          {share?.hospital_notes && (
            <div className="bg-accent/30 p-3 rounded-md border border-border text-sm italic">
              <p className="text-xs text-muted-foreground non-italic mb-1 font-semibold flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Hospital Feedback:
              </p>
              "{share.hospital_notes}"
            </div>
          )}

          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Shared Documents
            </h4>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : files && files.length > 0 ? (
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                {files.map((file: any) => (
                  <div key={file.record_id} className="flex items-center justify-between p-2.5 rounded-lg bg-accent/30 border border-border/50 text-sm hover:bg-accent/50 transition-colors">
                    <div className="min-w-0 flex-1 mr-2">
                      <p className="font-medium truncate">{file.title}</p>
                      <p className="text-xs text-muted-foreground">{file.category} • {formatDate(file.record_date)}</p>
                    </div>
                    <Button variant="ghost" size="icon-sm" asChild>
                      <a href={file.file_path} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-muted/20 rounded-lg border border-dashed border-border">
                <p className="text-sm text-muted-foreground">No specific files match this access level.</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
