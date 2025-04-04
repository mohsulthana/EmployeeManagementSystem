import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AdminForm } from "@/components/forms/AdminForm";
import { UserAvatar } from "@/components/common/UserAvatar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { User, UserRole } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminList() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);

  // Fetch admins
  const { data: admins = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users", { role: [UserRole.ADMIN, UserRole.SUPERADMIN] }],
  });

  // Filter admins based on search query
  const filteredAdmins = admins.filter((admin) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      admin.fullName.toLowerCase().includes(query) ||
      admin.email.toLowerCase().includes(query) ||
      admin.department?.toLowerCase().includes(query) ||
      admin.role.toLowerCase().includes(query)
    );
  });

  // Create admin mutation
  const createMutation = useMutation({
    mutationFn: async (userData: any) => {
      const res = await apiRequest("POST", "/api/users", userData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Administrator created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create administrator",
        variant: "destructive",
      });
    },
  });

  // Delete admin mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/users/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setDeleteUserId(null);
      toast({
        title: "Success",
        description: "Administrator deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete administrator",
        variant: "destructive",
      });
    },
  });

  // Create DataTable columns
  const columns = [
    {
      header: "Admin ID",
      accessorKey: "id" as keyof User,
      cell: (row: User) => <span>ADM-{row.id}</span>,
    },
    {
      header: "Full Name",
      accessorKey: "fullName" as keyof User,
      cell: (row: User) => (
        <div className="flex items-center">
          <UserAvatar user={row} className="w-8 h-8 mr-3" />
          <span>{row.fullName}</span>
        </div>
      ),
    },
    {
      header: "Department",
      accessorKey: "department" as keyof User,
    },
    {
      header: "Role",
      accessorKey: "role" as keyof User,
      cell: (row: User) => (
        <StatusBadge status={row.role as UserRole} />
      ),
    },
    {
      header: "Last Login",
      accessorKey: "lastLogin" as keyof User,
      cell: (row: User) => (row.lastLogin ? new Date(row.lastLogin).toLocaleString() : "Never"),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (row: User) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary">
            <span className="material-icons text-base">edit</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-red-500"
            onClick={() => setDeleteUserId(row.id)}
          >
            <span className="material-icons text-base">delete</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <Card>
        <CardHeader className="border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <CardTitle>Administrator Management</CardTitle>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <span className="material-icons text-sm mr-1">add</span> Add Administrator
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={filteredAdmins}
            onSearch={setSearchQuery}
          />
        </CardContent>
      </Card>

      {/* Add Admin Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add New Administrator</DialogTitle>
          </DialogHeader>
          <AdminForm
            onSubmit={createMutation.mutateAsync}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteUserId !== null} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this administrator? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserId && deleteMutation.mutate(deleteUserId)}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
