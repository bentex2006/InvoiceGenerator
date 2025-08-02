import { pgTable, text, serial, integer, decimal, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  invoiceDate: text("invoice_date").notNull(),
  dueDate: text("due_date").notNull(),
  paymentTerms: text("payment_terms").notNull(),
  clientName: text("client_name").notNull(),
  clientAddress: text("client_address").notNull(),
  clientEmail: text("client_email"),
  clientPhone: text("client_phone"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
  discountType: text("discount_type").default("%"), // "%" or "$"
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0"),
  taxTotal: decimal("tax_total", { precision: 10, scale: 2 }).default("0"),
  grandTotal: decimal("grand_total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const lineItems = pgTable("line_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull(),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull(),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLineItemSchema = createInsertSchema(lineItems).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertLineItem = z.infer<typeof insertLineItemSchema>;
export type LineItem = typeof lineItems.$inferSelect;

export interface InvoiceWithLineItems extends Invoice {
  lineItems: LineItem[];
}
