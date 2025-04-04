import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const [location] = useLocation();
  const [title, setTitle] = useState("Dashboard");
  const isMobile = useMobile();

  // Update page title based on location
  useEffect(() => {
    switch (location) {
      case "/":
        setTitle("Dashboard");
        break;
      case "/profile":
        setTitle("My Profile");
        break;
      case "/my-dashboard":
        setTitle("My Dashboard");
        break;
      case "/employees":
        setTitle("Employee Management");
        break;
      case "/admins":
        setTitle("Administrator Management");
        break;
      case "/settings":
        setTitle("System Settings");
        break;
      default:
        setTitle("Dashboard");
    }
  }, [location]);

  return (
    <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
      <div className="flex items-center">
        {isMobile && (
          <Button variant="ghost" size="icon" className="mr-4" onClick={onToggleSidebar}>
            <span className="material-icons">menu</span>
          </Button>
        )}
        <h1 className="text-xl font-medium">{title}</h1>
      </div>
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon">
          <span className="material-icons">notifications</span>
        </Button>
        <Button variant="ghost" size="icon">
          <span className="material-icons">help_outline</span>
        </Button>
      </div>
    </header>
  );
}
