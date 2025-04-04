import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/common/UserAvatar";
import { useMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [location] = useLocation();
  const { user, logout, isAdmin, isSuperAdmin } = useAuth();
  const isMobile = useMobile();

  if (!user) return null;

  const sidebarItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: "dashboard",
      allowedRoles: ["employee", "admin", "superadmin"],
    },
    {
      title: "My Profile",
      href: "/profile",
      icon: "person",
      allowedRoles: ["employee", "admin", "superadmin"],
    },
    {
      title: "My Dashboard",
      href: "/my-dashboard",
      icon: "home",
      allowedRoles: ["employee", "admin", "superadmin"],
    },
    {
      title: "Employees",
      href: "/employees",
      icon: "groups",
      allowedRoles: ["admin", "superadmin"],
    },
    {
      title: "Administrators",
      href: "/admins",
      icon: "admin_panel_settings",
      allowedRoles: ["superadmin"],
    },
    {
      title: "System Settings",
      href: "/settings",
      icon: "settings",
      allowedRoles: ["superadmin"],
    },
  ];

  return (
    <nav className="w-full md:w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary flex items-center">
          <span className="material-icons mr-2">people</span>
          EmployeeHub
        </h1>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onToggle}>
            <span className="material-icons">close</span>
          </Button>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center space-x-3 mb-4">
          <UserAvatar user={user} className="w-12 h-12" />
          <div>
            <h2 className="text-sm font-semibold">{user.fullName}</h2>
            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <ul className="p-2">
          {sidebarItems
            .filter((item) => item.allowedRoles.includes(user.role))
            .map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <a
                    className={cn(
                      "flex items-center py-3 px-4 rounded-md text-gray-700 hover:bg-gray-100",
                      location === item.href && "bg-primary bg-opacity-10 border-l-3 border-primary text-primary"
                    )}
                  >
                    <span className="material-icons mr-3 text-current">{item.icon}</span>
                    {!collapsed && item.title}
                  </a>
                </Link>
              </li>
            ))}
        </ul>
      </div>

      <div className="p-4 mt-auto">
        <Separator className="mb-4" />
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          onClick={() => logout()}
        >
          <span className="material-icons mr-3">logout</span>
          Logout
        </Button>
      </div>
    </nav>
  );
}
