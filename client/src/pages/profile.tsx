import Layout from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { User } from "@shared/schema";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/common/UserAvatar";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});

  // Fetch current user details
  const { data: currentUser, isLoading } = useQuery<User>({
    queryKey: ["/api/users", user?.id],
    enabled: !!user,
    onSuccess: (data) => {
      setFormData(data);
    },
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      const res = await apiRequest("PUT", `/api/users/${user?.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id] });
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

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

  if (!currentUser) {
    return (
      <Layout>
        <div className="text-center">User not found</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Card>
        <CardHeader className="border-b border-gray-200">
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/3 mb-6 md:mb-0">
              <div className="flex flex-col items-center">
                <UserAvatar user={currentUser} className="w-32 h-32 mb-4" />
                <Button>Update Photo</Button>
              </div>
            </div>
            <div className="w-full md:w-2/3">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName || ""}
                        onChange={handleChange}
                      />
                    ) : (
                      <p className="bg-gray-50 p-2 rounded border border-gray-200">
                        {currentUser.fullName}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email || ""}
                        onChange={handleChange}
                      />
                    ) : (
                      <p className="bg-gray-50 p-2 rounded border border-gray-200">
                        {currentUser.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone || ""}
                        onChange={handleChange}
                      />
                    ) : (
                      <p className="bg-gray-50 p-2 rounded border border-gray-200">
                        {currentUser.phone || "Not set"}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="id">Employee ID</Label>
                    <p className="bg-gray-50 p-2 rounded border border-gray-200">
                      EMP-{currentUser.id}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="position">Position</Label>
                    <p className="bg-gray-50 p-2 rounded border border-gray-200">
                      {currentUser.position || "Not assigned"}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <p className="bg-gray-50 p-2 rounded border border-gray-200">
                      {currentUser.department || "Not assigned"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="address">Address</Label>
                    {isEditing ? (
                      <Input
                        id="address"
                        name="address"
                        value={formData.address || ""}
                        onChange={handleChange}
                      />
                    ) : (
                      <p className="bg-gray-50 p-2 rounded border border-gray-200">
                        {currentUser.address || "Not set"}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    {isEditing ? (
                      <Input
                        id="emergencyContact"
                        name="emergencyContact"
                        value={formData.emergencyContact || ""}
                        onChange={handleChange}
                      />
                    ) : (
                      <p className="bg-gray-50 p-2 rounded border border-gray-200">
                        {currentUser.emergencyContact || "Not set"}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-6">
                  {isEditing ? (
                    <div className="flex space-x-2">
                      <Button type="submit" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData(currentUser);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button type="button" onClick={() => setIsEditing(true)}>
                      Edit Information
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}
