import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface User {
  fullName: string;
  role?: string;
}

interface UserAvatarProps {
  user: User;
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  const initials = user.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <Avatar className={cn("bg-gray-200", className)}>
      <AvatarFallback className="text-gray-500">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
