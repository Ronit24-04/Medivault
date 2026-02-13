import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Shield,
  Menu,
  LayoutDashboard,
  FileText,
  User,
  Settings,
  LogOut,
  Bell,
  Upload,
  Users,
  Building2,
  Activity,
  FolderOpen,
} from "lucide-react";
import { useState } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType: "patient" | "hospital";
}

const patientNavItems = [
  { href: "/patient/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/patient/records", icon: FileText, label: "My Records" },
  { href: "/patient/upload", icon: Upload, label: "Upload Record" },
  { href: "/patient/shared", icon: Users, label: "Shared Access" },
  { href: "/patient/profile", icon: User, label: "Profile" },
  { href: "/patient/settings", icon: Settings, label: "Settings" },
];

const hospitalNavItems = [
  { href: "/hospital/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/hospital/documents", icon: FolderOpen, label: "Documents" },
  { href: "/hospital/acknowledgements", icon: FileText, label: "Acknowledgements" },
  { href: "/hospital/alerts", icon: Bell, label: "Alerts" },
  { href: "/hospital/settings", icon: Settings, label: "Settings" },
];

export function DashboardLayout({ children, userType }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = userType === "patient" ? patientNavItems : hospitalNavItems;
  const userName = userType === "patient" ? "John Doe" : "City Hospital";
  const userEmail = userType === "patient" ? "john.doe@email.com" : "admin@cityhospital.com";

  const NavContent = () => (
    <nav className="flex flex-col gap-1 p-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      <aside className="fixed left-0 top-0 z-40 hidden lg:flex h-screen w-64 flex-col border-r border-border/40 bg-sidebar">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 px-6 border-b border-sidebar-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold tracking-tight">mediVault</span>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <NavContent />
        </div>

        {/* User Section */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {userName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-16 items-center gap-2.5 px-6 border-b">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                  <Shield className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-semibold tracking-tight">mediVault</span>
              </div>
              <NavContent />
            </SheetContent>
          </Sheet>

          <div className="hidden lg:block" />

          {/* Right Section */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {userName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline-block text-sm font-medium">{userName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(`/${userType}/profile`)}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/${userType}/settings`)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/login")} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}