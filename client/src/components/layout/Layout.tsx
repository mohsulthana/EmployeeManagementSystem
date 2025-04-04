import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar for Desktop */}
      {!isMobile && <Sidebar />}

      {/* Mobile Sidebar (Conditional) */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={toggleSidebar}
          ></div>
          <div className="relative z-10 w-full max-w-xs">
            <Sidebar onToggle={toggleSidebar} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 flex flex-col">
        <Header onToggleSidebar={toggleSidebar} />
        <div className="p-6 flex-1">{children}</div>
      </main>
    </div>
  );
}
