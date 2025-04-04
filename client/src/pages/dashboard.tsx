import Layout from "@/components/layout/Layout";
import { StatCard } from "@/components/dashboard/StatCard";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UserRole } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user } = useAuth();

  // Fetch stats
  const { data: stats, isLoading } = useQuery<{
    totalEmployees: number;
    totalAdmins: number;
    departments: number;
    activeUsers: number;
    newHires: number;
  }>({
    queryKey: ["/api/stats"],
    enabled: !!user,
  });

  // Loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  // Dashboard content based on user role
  return (
    <Layout>
      <div>
        <h2 className="text-lg font-medium mb-4">
          Welcome, {user?.fullName || "User"}!
        </h2>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Employees"
            value={stats?.totalEmployees || 0}
            icon="groups"
            color="primary"
          />

          {user?.role !== UserRole.EMPLOYEE && (
            <>
              <StatCard
                title="Departments"
                value={stats?.departments || 0}
                icon="business"
                color="info"
              />
              <StatCard
                title="New Hires (This Month)"
                value={stats?.newHires || 0}
                icon="person_add"
                color="success"
              />
            </>
          )}

          {user?.role === UserRole.SUPERADMIN && (
            <>
              <StatCard
                title="Administrators"
                value={stats?.totalAdmins || 0}
                icon="admin_panel_settings"
                color="secondary"
              />
              <StatCard
                title="Active Users"
                value={stats?.activeUsers || 0}
                icon="verified_user"
                color="warning"
              />
            </>
          )}

          {user?.role === UserRole.EMPLOYEE && (
            <>
              <StatCard
                title="Department"
                value="Engineering"
                icon="business"
                color="info"
              />
              <StatCard
                title="Position"
                value="Senior Developer"
                icon="work"
                color="success"
              />
              <StatCard
                title="Manager"
                value="Sarah Wilson"
                icon="supervisor_account"
                color="secondary"
              />
            </>
          )}
        </div>

        {/* Quick Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {user?.role === UserRole.EMPLOYEE && (
                <>
                  <Button asChild>
                    <Link href="/profile">
                      <span className="material-icons mr-2">person</span>
                      View Profile
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/my-dashboard">
                      <span className="material-icons mr-2">dashboard</span>
                      My Dashboard
                    </Link>
                  </Button>
                </>
              )}

              {(user?.role === UserRole.ADMIN || user?.role === UserRole.SUPERADMIN) && (
                <>
                  <Button asChild>
                    <Link href="/employees">
                      <span className="material-icons mr-2">people</span>
                      Manage Employees
                    </Link>
                  </Button>
                </>
              )}

              {user?.role === UserRole.SUPERADMIN && (
                <>
                  <Button asChild>
                    <Link href="/admins">
                      <span className="material-icons mr-2">admin_panel_settings</span>
                      Manage Administrators
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/settings">
                      <span className="material-icons mr-2">settings</span>
                      System Settings
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity (Placeholder) */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <span className="material-icons bg-blue-100 text-blue-500 p-2 rounded-full">
                  login
                </span>
                <div>
                  <p className="font-medium">System Login</p>
                  <p className="text-sm text-gray-500">You logged in to the system</p>
                  <p className="text-xs text-gray-400">Just now</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <span className="material-icons bg-green-100 text-green-500 p-2 rounded-full">
                  visibility
                </span>
                <div>
                  <p className="font-medium">Profile Viewed</p>
                  <p className="text-sm text-gray-500">You viewed your profile information</p>
                  <p className="text-xs text-gray-400">Yesterday</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
