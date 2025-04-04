import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmployeeForm } from "@/components/forms/EmployeeForm";
import { UserAvatar } from "@/components/common/UserAvatar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmployeeStatus, UserRole, User } from "@shared/schema";
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

export default function EmployeeList() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);

  // Fetch employees
  const { data: employees = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users", { role: UserRole.EMPLOYEE, department: filterDepartment }],
  });

  // Filter employees based on search query
  const filteredEmployees = employees.filter((employee) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      employee.fullName.toLowerCase().includes(query) ||
      employee.email.toLowerCase().includes(query) ||
      employee.department?.toLowerCase().includes(query) ||
      employee.position?.toLowerCase().includes(query)
    );
  });

  // Create employee mutation
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
        description: "Employee created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create employee",
        variant: "destructive",
      });
    },
  });

  // Delete employee mutation
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
        description: "Employee deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete employee",
        variant: "destructive",
      });
    },
  });

  // Get available departments for filtering
  const departments = Array.from(
    new Set(employees.map((employee) => employee.department).filter(Boolean))
  ).map((dept) => ({
    label: dept as string,
    value: dept as string,
  }));

  // Create DataTable columns
  const columns = [
    {
      header: "Employee ID",
      accessorKey: "id" as keyof User,
      cell: (row: User) => <span>EMP-{row.id}</span>,
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
      header: "Position",
      accessorKey: "position" as keyof User,
    },
    {
      header: "Status",
      accessorKey: "status" as keyof User,
      cell: (row: User) => (
        <StatusBadge status={row.status as EmployeeStatus} />
      ),
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
          <CardTitle>Employee Management</CardTitle>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <span className="material-icons text-sm mr-1">add</span> Add Employee
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={filteredEmployees}
            filterOptions={{
              key: "department" as keyof User,
              options: departments,
              placeholder: "All Departments",
            }}
            onSearch={setSearchQuery}
            onFilter={setFilterDepartment}
            paginationOptions={{
              pageIndex: 0,
              pageSize: 10,
              pageCount: Math.ceil(filteredEmployees.length / 10),
              onPageChange: () => {}, // Simple pagination for demo
            }}
          />
        </CardContent>
      </Card>

      {/* Add Employee Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
          </DialogHeader>
          <EmployeeForm
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
              Are you sure you want to delete this employee? This action cannot be undone.
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
