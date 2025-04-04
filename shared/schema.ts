import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles enum
export enum UserRole {
  EMPLOYEE = "employee",
  ADMIN = "admin",
  SUPERADMIN = "superadmin",
}

// Employee status enum
export enum EmployeeStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  ON_LEAVE = "on_leave",
}

// Users table (for all users regardless of role)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: Object.values(UserRole) }).notNull().default(UserRole.EMPLOYEE),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  department: text("department"),
  position: text("position"),
  startDate: text("start_date"),
  manager: text("manager"),
  status: text("status", { enum: Object.values(EmployeeStatus) }).default(EmployeeStatus.ACTIVE),
  address: text("address"),
  emergencyContact: text("emergency_contact"),
  lastLogin: timestamp("last_login"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  lastLogin: true,
});

// Schema for user login
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Department schema
export const departmentSchema = z.object({
  name: z.string().min(1, "Department name is required"),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type Department = z.infer<typeof departmentSchema>;
