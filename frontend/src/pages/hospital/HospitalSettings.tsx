import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import {
  Building2,
  Bell,
  Lock,
  Shield,
  Globe,
  Clock,
  Users,
} from "lucide-react";

export default function HospitalSettings() {
  return (
    <DashboardLayout userType="hospital">
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage hospital preferences and configurations.
          </p>
        </div>

        {/* Hospital profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Hospital Profile
            </CardTitle>
            <CardDescription>
              Update your hospital's public information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hospitalName">Hospital Name</Label>
              <Input id="hospitalName" defaultValue="City General Hospital" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Contact Email</Label>
                <Input id="email" type="email" defaultValue="contact@cityhospital.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Contact Phone</Label>
                <Input id="phone" defaultValue="+1 (555) 000-0000" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                defaultValue="123 Medical Center Drive, New York, NY 10001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of your hospital..."
                defaultValue="City General Hospital is a leading healthcare facility providing comprehensive medical services since 1985."
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
                <div className="flex gap-2">
                  <Input type="time" defaultValue="08:00" />
                  <span className="flex items-center">to</span>
                  <Input type="time" defaultValue="20:00" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Weekend Hours</Label>
                <div className="flex gap-2">
                  <Input type="time" defaultValue="09:00" />
                  <span className="flex items-center">to</span>
                  <Input type="time" defaultValue="17:00" />
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
              <Switch defaultChecked />
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
            <CardDescription>
              Configure notification preferences for staff.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New Access Requests</p>
                <p className="text-sm text-muted-foreground">
                  Notify when patients grant record access.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New Record Uploads</p>
                <p className="text-sm text-muted-foreground">
                  Notify when patients upload new records.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Daily Summary</p>
                <p className="text-sm text-muted-foreground">
                  Receive daily email summary of activities.
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Access control */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Access Control
            </CardTitle>
            <CardDescription>
              Manage staff permissions and access levels.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Default Staff Role</p>
                <p className="text-sm text-muted-foreground">
                  Role assigned to new staff members.
                </p>
              </div>
              <Select defaultValue="viewer">
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
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-revoke Inactive Access</p>
                <p className="text-sm text-muted-foreground">
                  Automatically revoke access after inactivity.
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* For security */}
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
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Session Timeout</p>
                <p className="text-sm text-muted-foreground">
                  Auto-logout after inactivity period.
                </p>
              </div>
              <Select defaultValue="30">
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
                <p className="text-sm text-muted-foreground">
                  Connect to external EHR systems.
                </p>
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

        {/* Save Button */}
        <div className="flex justify-end">
          <Button size="lg">Save Changes</Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
