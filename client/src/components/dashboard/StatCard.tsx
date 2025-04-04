import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: "primary" | "info" | "success" | "warning" | "secondary" | "error";
  className?: string;
}

const colorMap = {
  primary: "text-primary-light bg-primary-light bg-opacity-10",
  info: "text-blue-500 bg-blue-500 bg-opacity-10",
  success: "text-green-500 bg-green-500 bg-opacity-10",
  warning: "text-yellow-500 bg-yellow-500 bg-opacity-10",
  secondary: "text-pink-500 bg-pink-500 bg-opacity-10",
  error: "text-red-500 bg-red-500 bg-opacity-10",
};

export function StatCard({ title, value, icon, color, className }: StatCardProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl md:text-3xl font-semibold mt-1">{value}</p>
          </div>
          <span className={cn("material-icons rounded-full p-2", colorMap[color])}>
            {icon}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
