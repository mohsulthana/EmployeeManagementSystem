import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const [, navigate] = useLocation();

  // Demo credentials
  const demoUsers = [
    { role: "Employee", username: "employee", password: "password" },
    { role: "Admin", username: "hradmin", password: "password" },
    { role: "Super Admin", username: "admin", password: "password" },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError("");
      await login({ username, password });
      navigate("/");
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  const loginAsDemoUser = async (username: string, password: string) => {
    try {
      setError("");
      await login({ username, password });
      navigate("/");
    } catch (err) {
      setError("Failed to login with demo account");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <span className="material-icons text-4xl text-primary">people</span>
          </div>
          <CardTitle className="text-2xl">EmployeeHub</CardTitle>
          <p className="text-sm text-gray-500">
            Log in to access the employee management system
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="text-sm text-gray-500 mb-2">Demo Accounts:</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
            {demoUsers.map((user) => (
              <Button
                key={user.role}
                variant="outline"
                className="text-xs"
                onClick={() => loginAsDemoUser(user.username, user.password)}
              >
                Login as {user.role}
              </Button>
            ))}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
