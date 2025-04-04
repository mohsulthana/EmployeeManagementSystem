import { 
  users, 
  type User, 
  type InsertUser, 
  UserRole, 
  EmployeeStatus
} from "@shared/schema";

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
}

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
    
    const user: User = { ...insertUser, id };
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
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  async getUsersByDepartment(department: string): Promise<User[]> {
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

export const storage = new MemStorage();
