import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

// Pages
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import EmployeeList from "@/pages/employee-list";
import AdminList from "@/pages/admin-list";
import SystemSettings from "@/pages/system-settings";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";
import EmployeeDashboard from "@/pages/employee-dashboard";

// Auth context
import { AuthProvider, useAuth } from "@/hooks/useAuth";

function Router() {
  const { user, loading } = useAuth();
  const [location, setLocation] = useLocation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user && location !== "/login") {
      setLocation("/login");
    }
  }, [user, loading, location, setLocation]);

  // Auth loading screen
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login" component={Login} />

      {/* Protected routes */}
      {user && (
        <Switch>
          <Route path="/" component={Dashboard} />
          
          {/* Employee routes */}
          <Route path="/profile" component={Profile} />
          <Route path="/my-dashboard" component={EmployeeDashboard} />
          
          {/* Admin routes */}
          <Route path="/employees" component={EmployeeList} />
          
          {/* Super Admin routes */}
          <Route path="/admins" component={AdminList} />
          <Route path="/settings" component={SystemSettings} />
          
          {/* Fallback to 404 */}
          <Route component={NotFound} />
        </Switch>
      )}

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router />
      <Toaster />
    </AuthProvider>
  );
}

export default App;
