import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EmployeeStatus, UserRole } from "@shared/schema";

interface StatusBadgeProps {
  status: EmployeeStatus | UserRole;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  let color = "";
  
  switch (status) {
    // Employee statuses
    case EmployeeStatus.ACTIVE:
      color = "bg-green-100 text-green-800";
      break;
    case EmployeeStatus.INACTIVE:
      color = "bg-red-100 text-red-800";
      break;
    case EmployeeStatus.ON_LEAVE:
      color = "bg-yellow-100 text-yellow-800";
      break;
      
    // User roles  
    case UserRole.SUPERADMIN:
      color = "bg-purple-100 text-purple-800";
      break;
    case UserRole.ADMIN:
      color = "bg-blue-100 text-blue-800";
      break;
    case UserRole.EMPLOYEE:
      color = "bg-gray-100 text-gray-800";
      break;
    
    default:
      color = "bg-gray-100 text-gray-800";
  }
  
  return (
    <Badge variant="outline" className={cn(color, "font-normal", className)}>
      {status === "on_leave" ? "On Leave" : status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
