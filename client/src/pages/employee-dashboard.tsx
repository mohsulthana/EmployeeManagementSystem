import Layout from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/common/UserAvatar";

export default function EmployeeDashboard() {
  const { user } = useAuth();

  // Fetch current user details
  const { data: currentUser, isLoading } = useQuery<User>({
    queryKey: ["/api/users", user?.id],
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

  return (
    <Layout>
      <div>
        <h2 className="text-lg font-medium mb-4">
          Welcome Back, {currentUser?.fullName.split(' ')[0] || 'User'}!
        </h2>
        
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="text-xl font-semibold">{currentUser?.department || 'Not Assigned'}</p>
                </div>
                <span className="material-icons text-primary rounded-full bg-primary bg-opacity-10 p-2">
                  business
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Position</p>
                  <p className="text-xl font-semibold">{currentUser?.position || 'Not Assigned'}</p>
                </div>
                <span className="material-icons text-blue-500 rounded-full bg-blue-500 bg-opacity-10 p-2">
                  work
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="text-xl font-semibold">{currentUser?.startDate || 'Not Set'}</p>
                </div>
                <span className="material-icons text-green-500 rounded-full bg-green-500 bg-opacity-10 p-2">
                  calendar_today
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Manager</p>
                  <p className="text-xl font-semibold">{currentUser?.manager || 'Not Assigned'}</p>
                </div>
                <span className="material-icons text-pink-500 rounded-full bg-pink-500 bg-opacity-10 p-2">
                  supervisor_account
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Personal Information */}
        <Card className="mb-6">
          <CardHeader className="border-b border-gray-200">
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/3 mb-6 md:mb-0">
                <div className="flex flex-col items-center">
                  <UserAvatar user={currentUser || { fullName: 'User' }} className="w-32 h-32 mb-4" />
                  <Button>Update Photo</Button>
                </div>
              </div>
              <div className="w-full md:w-2/3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <p className="bg-gray-50 p-2 rounded border border-gray-200">
                      {currentUser?.fullName || 'Not Set'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <p className="bg-gray-50 p-2 rounded border border-gray-200">
                      {currentUser?.email || 'Not Set'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <p className="bg-gray-50 p-2 rounded border border-gray-200">
                      {currentUser?.phone || 'Not Set'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee ID
                    </label>
                    <p className="bg-gray-50 p-2 rounded border border-gray-200">
                      EMP-{currentUser?.id || '0000'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <p className="bg-gray-50 p-2 rounded border border-gray-200">
                      {currentUser?.address || 'Not Set'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Contact
                    </label>
                    <p className="bg-gray-50 p-2 rounded border border-gray-200">
                      {currentUser?.emergencyContact || 'Not Set'}
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <Button>Edit Information</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
