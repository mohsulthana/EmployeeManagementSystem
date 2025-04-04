import { 
  users, 
  type User, 
  type InsertUser, 
  UserRole, 
  EmployeeStatus
} from "@shared/schema";
import { eq, and, sql, desc, count, or } from "drizzle-orm";
import { db, pool } from "./db";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Query operations
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: UserRole): Promise<User[]>;
  getUsersByDepartment(department: string): Promise<User[]>; 
  
  // Stats
  getUserStats(): Promise<{
    totalEmployees: number;
    totalAdmins: number;
    departments: number;
    activeUsers: number;
    newHires: number;
  }>;
  
  // Initialize database
  initDb(): Promise<void>;
}

export class PostgresStorage implements IStorage {
  // Using imported db and pool from db.ts
  constructor() {
    // The db and pool are imported at the top of the file
  }
  
  async initDb(): Promise<void> {
    // Check if users table exists and has data
    try {
      const userCount = await db.select({ count: count() }).from(users);
      
      // If no users exist, seed the database
      if (userCount[0].count === 0) {
        await this.seedData();
      }
    } catch (error) {
      console.error("Error initializing database:", error);
      // Table might not exist yet - create it
      await this.createTables();
      await this.seedData();
    }
  }
  
  private async createTables(): Promise<void> {
    // Execute SQL to create the tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT '${UserRole.EMPLOYEE}',
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT,
        department TEXT,
        position TEXT,
        start_date TEXT,
        manager TEXT,
        status TEXT DEFAULT '${EmployeeStatus.ACTIVE}',
        address TEXT,
        emergency_contact TEXT,
        last_login TIMESTAMP
      );
    `);
  }
  
  private async seedData(): Promise<void> {
    const initialUsers: InsertUser[] = [
      {
        username: "admin",
        password: "password", // In a real app, this would be hashed
        role: UserRole.SUPERADMIN,
        fullName: "Maria Garcia",
        email: "maria.garcia@company.com",
        department: "Executive",
        position: "CTO",
        status: EmployeeStatus.ACTIVE,
      },
      {
        username: "hradmin",
        password: "password",
        role: UserRole.ADMIN,
        fullName: "James Brown",
        email: "james.brown@company.com",
        department: "HR",
        position: "HR Manager",
        status: EmployeeStatus.ACTIVE,
      },
      {
        username: "employee",
        password: "password",
        role: UserRole.EMPLOYEE,
        fullName: "Alex Johnson",
        email: "alex.johnson@company.com",
        department: "Engineering",
        position: "Senior Developer",
        startDate: "Jan 15, 2022",
        manager: "Sarah Wilson",
        phone: "(555) 123-4567",
        address: "123 Main St, Seattle, WA 98101",
        emergencyContact: "Jane Johnson (555) 987-6543",
        status: EmployeeStatus.ACTIVE,
      },
      {
        username: "swilson",
        password: "password",
        role: UserRole.EMPLOYEE,
        fullName: "Sarah Wilson",
        email: "sarah.wilson@company.com",
        department: "Engineering",
        position: "Engineering Manager",
        status: EmployeeStatus.ACTIVE,
      },
      {
        username: "mlee",
        password: "password",
        role: UserRole.EMPLOYEE,
        fullName: "Michael Lee",
        email: "michael.lee@company.com",
        department: "Marketing",
        position: "Marketing Specialist",
        status: EmployeeStatus.ON_LEAVE,
      },
      {
        username: "echen",
        password: "password",
        role: UserRole.EMPLOYEE,
        fullName: "Emily Chen",
        email: "emily.chen@company.com",
        department: "Sales",
        position: "Sales Representative",
        status: EmployeeStatus.ACTIVE,
      },
    ];

    // Insert users in sequence
    for (const user of initialUsers) {
      try {
        await this.createUser(user);
      } catch (error) {
        console.error(`Error seeding user ${user.username}:`, error);
      }
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });
    
    return result.length > 0;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUsersByRole(role: UserRole): Promise<User[]> {
    // Handle case when an array of roles is provided (for admin+superadmin)
    if (Array.isArray(role)) {
      return await db
        .select()
        .from(users)
        .where(
          or(...role.map(r => eq(users.role, r)))
        );
    }
    
    return await db
      .select()
      .from(users)
      .where(eq(users.role, role));
  }

  async getUsersByDepartment(department: string): Promise<User[]> {
    if (!department) {
      return this.getAllUsers();
    }
    
    return await db
      .select()
      .from(users)
      .where(eq(users.department, department));
  }

  async getUserStats(): Promise<{
    totalEmployees: number;
    totalAdmins: number;
    departments: number;
    activeUsers: number;
    newHires: number;
  }> {
    // Count employees
    const employeesCount = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, UserRole.EMPLOYEE));
    
    // Count admins
    const adminsCount = await db
      .select({ count: count() })
      .from(users)
      .where(
        or(
          eq(users.role, UserRole.ADMIN),
          eq(users.role, UserRole.SUPERADMIN)
        )
      );
    
    // Count active users
    const activeUsersCount = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.status, EmployeeStatus.ACTIVE));
    
    // Get unique departments
    const departmentsResult = await db
      .select({ department: users.department })
      .from(users)
      .where(sql`${users.department} IS NOT NULL`)
      .groupBy(users.department);
    
    // For demo purposes, hardcode new hires count
    // In a real app, we'd filter by start_date
    const newHires = 5;
    
    return {
      totalEmployees: Number(employeesCount[0].count) || 0,
      totalAdmins: Number(adminsCount[0].count) || 0,
      departments: departmentsResult.length,
      activeUsers: Number(activeUsersCount[0].count) || 0,
      newHires,
    };
  }
}

// For backward compatibility, keep the in-memory storage available
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private currentId: number;
  private departments: Set<string>;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
    this.departments = new Set();
    
    // Add some initial data for testing
    this.seedData();
  }

  async initDb(): Promise<void> {
    // Nothing to do for in-memory storage
    return;
  }

  private seedData() {
    const initialUsers: InsertUser[] = [
      {
        username: "admin",
        password: "password", // In a real app, this would be hashed
        role: UserRole.SUPERADMIN,
        fullName: "Maria Garcia",
        email: "maria.garcia@company.com",
        department: "Executive",
        position: "CTO",
        status: EmployeeStatus.ACTIVE,
      },
      {
        username: "hradmin",
        password: "password",
        role: UserRole.ADMIN,
        fullName: "James Brown",
        email: "james.brown@company.com",
        department: "HR",
        position: "HR Manager",
        status: EmployeeStatus.ACTIVE,
      },
      {
        username: "employee",
        password: "password",
        role: UserRole.EMPLOYEE,
        fullName: "Alex Johnson",
        email: "alex.johnson@company.com",
        department: "Engineering",
        position: "Senior Developer",
        startDate: "Jan 15, 2022",
        manager: "Sarah Wilson",
        phone: "(555) 123-4567",
        address: "123 Main St, Seattle, WA 98101",
        emergencyContact: "Jane Johnson (555) 987-6543",
        status: EmployeeStatus.ACTIVE,
      },
      {
        username: "swilson",
        password: "password",
        role: UserRole.EMPLOYEE,
        fullName: "Sarah Wilson",
        email: "sarah.wilson@company.com",
        department: "Engineering",
        position: "Engineering Manager",
        status: EmployeeStatus.ACTIVE,
      },
      {
        username: "mlee",
        password: "password",
        role: UserRole.EMPLOYEE,
        fullName: "Michael Lee",
        email: "michael.lee@company.com",
        department: "Marketing",
        position: "Marketing Specialist",
        status: EmployeeStatus.ON_LEAVE,
      },
      {
        username: "echen",
        password: "password",
        role: UserRole.EMPLOYEE,
        fullName: "Emily Chen",
        email: "emily.chen@company.com",
        department: "Sales",
        position: "Sales Representative",
        status: EmployeeStatus.ACTIVE,
      },
    ];

    initialUsers.forEach(user => {
      this.createUser(user);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    
    // Add department to the set if it doesn't exist
    if (insertUser.department) {
      this.departments.add(insertUser.department);
    }
    
    // Ensure all required fields are present
    const user: User = { 
      username: insertUser.username,
      password: insertUser.password,
      fullName: insertUser.fullName,
      email: insertUser.email,
      role: insertUser.role || UserRole.EMPLOYEE, // Ensure role is not undefined
      phone: insertUser.phone || null,
      department: insertUser.department || null,
      position: insertUser.position || null,
      startDate: insertUser.startDate || null,
      manager: insertUser.manager || null,
      status: insertUser.status || EmployeeStatus.ACTIVE,
      address: insertUser.address || null,
      emergencyContact: insertUser.emergencyContact || null,
      id,
      lastLogin: null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    
    if (!existingUser) {
      return undefined;
    }
    
    // Add department to the set if it doesn't exist
    if (updates.department) {
      this.departments.add(updates.department);
    }
    
    const updatedUser = { ...existingUser, ...updates };
    this.users.set(id, updatedUser);
    
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUsersByRole(role: UserRole): Promise<User[]> {
    if (Array.isArray(role)) {
      return Array.from(this.users.values()).filter(user => role.includes(user.role as UserRole));
    }
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  async getUsersByDepartment(department: string): Promise<User[]> {
    if (!department) {
      return this.getAllUsers();
    }
    return Array.from(this.users.values()).filter(
      user => user.department === department
    );
  }

  async getUserStats(): Promise<{
    totalEmployees: number;
    totalAdmins: number;
    departments: number;
    activeUsers: number;
    newHires: number;
  }> {
    const allUsers = Array.from(this.users.values());
    const employees = allUsers.filter(user => user.role === UserRole.EMPLOYEE);
    const admins = allUsers.filter(user => user.role === UserRole.ADMIN || user.role === UserRole.SUPERADMIN);
    const activeUsers = allUsers.filter(user => user.status === EmployeeStatus.ACTIVE);
    
    // For demo purposes, consider users added in the last month as new hires
    const newHires = 5; // In a real app, we would calculate this based on startDate
    
    return {
      totalEmployees: employees.length,
      totalAdmins: admins.length,
      departments: this.departments.size,
      activeUsers: activeUsers.length,
      newHires,
    };
  }
}

// Create and export the PostgreSQL storage instance
export const storage = new PostgresStorage();
