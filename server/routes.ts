import express, { type Express, Request, Response } from "express";
import session from "express-session";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema,
  loginSchema,
  UserRole,
  EmployeeStatus,
  type User
} from "@shared/schema";
import { z } from "zod";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.session.user) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

// Middleware to check role
const hasRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: Function) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (roles.includes(req.session.user.role as UserRole)) {
      return next();
    }
    
    return res.status(403).json({ message: "Forbidden" });
  };
};

// Only super admins
const isSuperAdmin = hasRole([UserRole.SUPERADMIN]);

// Admins and super admins
const isAdmin = hasRole([UserRole.ADMIN, UserRole.SUPERADMIN]);

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "my-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production" },
    })
  );

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(credentials.username);
      
      if (!user || user.password !== credentials.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In a real app, we would update lastLogin here
      
      // Set the user in the session
      req.session.user = {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      };
      
      res.json({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/auth/me", isAuthenticated, (req, res) => {
    res.json(req.session.user);
  });
  
  // User routes
  app.get("/api/users", isAuthenticated, async (req, res) => {
    try {
      let users: User[];
      
      const { role, department } = req.query;
      
      if (role) {
        users = await storage.getUsersByRole(role as UserRole);
      } else if (department) {
        users = await storage.getUsersByDepartment(department as string);
      } else {
        users = await storage.getAllUsers();
      }
      
      // Filter based on user role
      if (req.session.user.role === UserRole.EMPLOYEE) {
        // Employees can only see their own data
        users = users.filter(user => user.id === req.session.user.id);
      } else if (req.session.user.role === UserRole.ADMIN) {
        // Admins cannot see super admins
        users = users.filter(user => user.role !== UserRole.SUPERADMIN);
      }
      
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check permission
      if (
        req.session.user.role === UserRole.EMPLOYEE && 
        req.session.user.id !== user.id
      ) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      if (
        req.session.user.role === UserRole.ADMIN && 
        user.role === UserRole.SUPERADMIN
      ) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/users", isAdmin, async (req, res) => {
    try {
      // Admin cannot create super admin users
      if (
        req.session.user.role === UserRole.ADMIN && 
        req.body.role === UserRole.SUPERADMIN
      ) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const userData = insertUserSchema.parse(req.body);
      const newUser = await storage.createUser(userData);
      
      res.status(201).json(newUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.put("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Permission checks
      if (req.session.user.role === UserRole.EMPLOYEE) {
        // Employees can only update their own data
        if (req.session.user.id !== userId) {
          return res.status(403).json({ message: "Forbidden" });
        }
        
        // And they can't change their role
        if (req.body.role && req.body.role !== user.role) {
          return res.status(403).json({ message: "Cannot change role" });
        }
      } else if (req.session.user.role === UserRole.ADMIN) {
        // Admins cannot update super admins
        if (user.role === UserRole.SUPERADMIN) {
          return res.status(403).json({ message: "Forbidden" });
        }
        
        // And they can't promote to super admin
        if (req.body.role === UserRole.SUPERADMIN) {
          return res.status(403).json({ message: "Cannot promote to super admin" });
        }
      }
      
      const updatedUser = await storage.updateUser(userId, req.body);
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete("/api/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Admins cannot delete super admins
      if (
        req.session.user.role === UserRole.ADMIN && 
        user.role === UserRole.SUPERADMIN
      ) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Cannot delete yourself
      if (req.session.user.id === userId) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      const result = await storage.deleteUser(userId);
      
      if (result) {
        res.json({ message: "User deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete user" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Stats route
  app.get("/api/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getUserStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
