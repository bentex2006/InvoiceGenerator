import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInvoiceSchema, insertLineItemSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all invoices
  app.get("/api/invoices", async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  // Get a specific invoice
  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid invoice ID" });
      }

      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  // Create a new invoice
  app.post("/api/invoices", async (req, res) => {
    try {
      const invoiceData = insertInvoiceSchema.parse(req.body.invoice);
      const lineItemsData = z.array(insertLineItemSchema).parse(req.body.lineItems);

      // Create the invoice
      const invoice = await storage.createInvoice(invoiceData);

      // Create line items
      const lineItems = [];
      for (const lineItemData of lineItemsData) {
        const lineItem = await storage.createLineItem({
          ...lineItemData,
          invoiceId: invoice.id
        });
        lineItems.push(lineItem);
      }

      res.status(201).json({ ...invoice, lineItems });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  // Update an invoice
  app.put("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid invoice ID" });
      }

      const invoiceData = insertInvoiceSchema.partial().parse(req.body.invoice);
      const lineItemsData = req.body.lineItems ? z.array(insertLineItemSchema).parse(req.body.lineItems) : undefined;

      // Update the invoice
      const updatedInvoice = await storage.updateInvoice(id, invoiceData);
      if (!updatedInvoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      // Update line items if provided
      let lineItems = await storage.getLineItemsByInvoiceId(id);
      if (lineItemsData) {
        // Delete existing line items
        await storage.deleteLineItemsByInvoiceId(id);
        
        // Create new line items
        lineItems = [];
        for (const lineItemData of lineItemsData) {
          const lineItem = await storage.createLineItem({
            ...lineItemData,
            invoiceId: id
          });
          lineItems.push(lineItem);
        }
      }

      res.json({ ...updatedInvoice, lineItems });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update invoice" });
    }
  });

  // Delete an invoice
  app.delete("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid invoice ID" });
      }

      const deleted = await storage.deleteInvoice(id);
      if (!deleted) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      res.json({ message: "Invoice deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete invoice" });
    }
  });

  // Generate next invoice number
  app.get("/api/invoices/next-number", async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      const lastNumber = invoices.length > 0 ? 
        Math.max(...invoices.map(inv => {
          const match = inv.invoiceNumber.match(/INV-(\d+)/);
          return match ? parseInt(match[1]) : 0;
        })) : 0;
      
      const nextNumber = `INV-${String(lastNumber + 1).padStart(3, '0')}`;
      res.json({ nextNumber });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate invoice number" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
