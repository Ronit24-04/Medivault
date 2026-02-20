import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Bell, Shield, Globe, Clock, Users, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function HospitalSettings() {
  const { toast } = useToast();

  // Hospital Profile state
  const [hospitalName, setHospitalName] = useState("City General Hospital");
  const [contactEmail, setContactEmail] = useState("contact@cityhospital.com");
  const [contactPhone, setContactPhone] = useState("+1 (555) 000-0000");
  const [address, setAddress] = useState("123 Medical Center Drive, New York, NY 10001");
  const [description, setDescription] = useState(
    "City General Hospital is a leading healthcare facility providing comprehensive medical services since 1985."
  );

  // Operating hours state
  const [weekdayStart, setWeekdayStart] = useState("08:00");
  const [weekdayEnd, setWeekdayEnd] = useState("20:00");
  const [weekendStart, setWeekendStart] = useState("09:00");
  const [weekendEnd, setWeekendEnd] = useState("17:00");
  const [emergency247, setEmergency247] = useState(true);

  // Notifications state
  const [notifyAccessRequests, setNotifyAccessRequests] = useState(true);
  const [notifyNewUploads, setNotifyNewUploads] = useState(true);
  const [notifyDailySummary, setNotifyDailySummary] = useState(false);

  // Access Control state
  const [defaultRole, setDefaultRole] = useState("viewer");
  const [requireManagerApproval, setRequireManagerApproval] = useState(true);
  const [autoRevokeInactive, setAutoRevokeInactive] = useState(false);

  // Security state
  const [require2FA, setRequire2FA] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30");

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your hospital settings have been updated successfully.",
    });
  };

  return (
    <DashboardLayout userType="hospital">
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage hospital preferences and configurations.
            </p>
          </div>
          <Button size="lg" onClick={handleSave} className="self-start sm:self-auto">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>

        {/* Hospital profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Hospital Profile
            </CardTitle>
            <CardDescription>Update your hospital's public information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hospitalName">Hospital Name</Label>
              <Input
                id="hospitalName"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Contact Phone</Label>
                <Input
                  id="phone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Operating Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Operating Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Weekday Hours</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="time"
                    value={weekdayStart}
                    onChange={(e) => setWeekdayStart(e.target.value)}
                  />
                  <span className="text-muted-foreground text-sm flex-shrink-0">to</span>
                  <Input
                    type="time"
                    value={weekdayEnd}
                    onChange={(e) => setWeekdayEnd(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Weekend Hours</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="time"
                    value={weekendStart}
                    onChange={(e) => setWeekendStart(e.target.value)}
                  />
                  <span className="text-muted-foreground text-sm flex-shrink-0">to</span>
                  <Input
                    type="time"
                    value={weekendEnd}
                    onChange={(e) => setWeekendEnd(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">24/7 Emergency Services</p>
                <p className="text-sm text-muted-foreground">
                  Emergency department available around the clock.
                </p>
              </div>
              <Switch checked={emergency247} onCheckedChange={setEmergency247} />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Configure notification preferences for staff.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New Access Requests</p>
                <p className="text-sm text-muted-foreground">
                  Notify when patients grant record access.
                </p>
              </div>
              <Switch checked={notifyAccessRequests} onCheckedChange={setNotifyAccessRequests} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New Record Uploads</p>
                <p className="text-sm text-muted-foreground">
                  Notify when patients upload new records.
                </p>
              </div>
              <Switch checked={notifyNewUploads} onCheckedChange={setNotifyNewUploads} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Daily Summary</p>
                <p className="text-sm text-muted-foreground">
                  Receive daily email summary of activities.
                </p>
              </div>
              <Switch checked={notifyDailySummary} onCheckedChange={setNotifyDailySummary} />
            </div>
          </CardContent>
        </Card>

        {/* Access Control */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Access Control
            </CardTitle>
            <CardDescription>Manage staff permissions and access levels.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="font-medium">Default Staff Role</p>
                <p className="text-sm text-muted-foreground">
                  Role assigned to new staff members.
                </p>
              </div>
              <Select value={defaultRole} onValueChange={setDefaultRole}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Require Manager Approval</p>
                <p className="text-sm text-muted-foreground">
                  New access requests need manager approval.
                </p>
              </div>
              <Switch checked={requireManagerApproval} onCheckedChange={setRequireManagerApproval} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-revoke Inactive Access</p>
                <p className="text-sm text-muted-foreground">
                  Automatically revoke access after inactivity.
                </p>
              </div>
              <Switch checked={autoRevokeInactive} onCheckedChange={setAutoRevokeInactive} />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">
                  Require 2FA for all staff accounts.
                </p>
              </div>
              <Switch checked={require2FA} onCheckedChange={setRequire2FA} />
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="font-medium">Session Timeout</p>
                <p className="text-sm text-muted-foreground">
                  Auto-logout after inactivity period.
                </p>
              </div>
              <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">IP Whitelisting</p>
                <p className="text-sm text-muted-foreground">
                  Restrict access to approved IP addresses.
                </p>
              </div>
              <Button variant="outline">Configure</Button>
            </div>
          </CardContent>
        </Card>

        {/* Integrations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Integrations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">EHR System</p>
                <p className="text-sm text-muted-foreground">Connect to external EHR systems.</p>
              </div>
              <Button variant="outline">Connect</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Lab Integration</p>
                <p className="text-sm text-muted-foreground">
                  Auto-import lab results from partner labs.
                </p>
              </div>
              <Button variant="outline">Connect</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Insurance Verification</p>
                <p className="text-sm text-muted-foreground">
                  Verify patient insurance in real-time.
                </p>
              </div>
              <Button variant="outline">Connect</Button>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Save Button */}
        <div className="flex justify-end pb-4">
          <Button size="lg" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
