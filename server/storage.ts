import { users, invoices, lineItems, type User, type InsertUser, type Invoice, type InsertInvoice, type LineItem, type InsertLineItem, type InvoiceWithLineItems } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Invoice operations
  getInvoice(id: number): Promise<InvoiceWithLineItems | undefined>;
  getInvoices(): Promise<InvoiceWithLineItems[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: number): Promise<boolean>;
  
  // Line item operations
  getLineItemsByInvoiceId(invoiceId: number): Promise<LineItem[]>;
  createLineItem(lineItem: InsertLineItem): Promise<LineItem>;
  updateLineItem(id: number, lineItem: Partial<InsertLineItem>): Promise<LineItem | undefined>;
  deleteLineItem(id: number): Promise<boolean>;
  deleteLineItemsByInvoiceId(invoiceId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private invoices: Map<number, Invoice>;
  private lineItems: Map<number, LineItem>;
  private currentUserId: number;
  private currentInvoiceId: number;
  private currentLineItemId: number;

  constructor() {
    this.users = new Map();
    this.invoices = new Map();
    this.lineItems = new Map();
    this.currentUserId = 1;
    this.currentInvoiceId = 1;
    this.currentLineItemId = 1;
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
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getInvoice(id: number): Promise<InvoiceWithLineItems | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;
    
    const lineItems = await this.getLineItemsByInvoiceId(id);
    return { ...invoice, lineItems };
  }

  async getInvoices(): Promise<InvoiceWithLineItems[]> {
    const invoicesWithLineItems: InvoiceWithLineItems[] = [];
    
    for (const invoice of this.invoices.values()) {
      const lineItems = await this.getLineItemsByInvoiceId(invoice.id);
      invoicesWithLineItems.push({ ...invoice, lineItems });
    }
    
    return invoicesWithLineItems.sort((a, b) => b.id - a.id);
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const id = this.currentInvoiceId++;
    const now = new Date().toISOString();
    const invoice: Invoice = { 
      ...insertInvoice, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.invoices.set(id, invoice);
    return invoice;
  }

  async updateInvoice(id: number, updateData: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;
    
    const updatedInvoice: Invoice = {
      ...invoice,
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }

  async deleteInvoice(id: number): Promise<boolean> {
    const deleted = this.invoices.delete(id);
    if (deleted) {
      await this.deleteLineItemsByInvoiceId(id);
    }
    return deleted;
  }

  async getLineItemsByInvoiceId(invoiceId: number): Promise<LineItem[]> {
    return Array.from(this.lineItems.values()).filter(
      (item) => item.invoiceId === invoiceId
    );
  }

  async createLineItem(insertLineItem: InsertLineItem): Promise<LineItem> {
    const id = this.currentLineItemId++;
    const lineItem: LineItem = { ...insertLineItem, id };
    this.lineItems.set(id, lineItem);
    return lineItem;
  }

  async updateLineItem(id: number, updateData: Partial<InsertLineItem>): Promise<LineItem | undefined> {
    const lineItem = this.lineItems.get(id);
    if (!lineItem) return undefined;
    
    const updatedLineItem: LineItem = { ...lineItem, ...updateData };
    this.lineItems.set(id, updatedLineItem);
    return updatedLineItem;
  }

  async deleteLineItem(id: number): Promise<boolean> {
    return this.lineItems.delete(id);
  }

  async deleteLineItemsByInvoiceId(invoiceId: number): Promise<void> {
    for (const [id, lineItem] of this.lineItems.entries()) {
      if (lineItem.invoiceId === invoiceId) {
        this.lineItems.delete(id);
      }
    }
  }
}

export const storage = new MemStorage();
