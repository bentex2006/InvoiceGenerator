import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import InvoiceForm from "@/components/invoice-form";
import InvoicePreview from "@/components/invoice-preview";
import { Button } from "@/components/ui/button";
import { Receipt, Save, PrinterCheck, Download, Plus } from "lucide-react";
import { generatePDF } from "@/lib/pdf-generator";
import type { InvoiceWithLineItems, InsertInvoice, InsertLineItem } from "@shared/schema";

export interface InvoiceFormData {
  invoice: InsertInvoice;
  lineItems: InsertLineItem[];
}

const defaultFormData: InvoiceFormData = {
  invoice: {
    invoiceNumber: "",
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentTerms: "Net 30",
    clientName: "",
    clientAddress: "",
    clientEmail: "",
    clientPhone: "",
    subtotal: "0.00",
    discountAmount: "0.00",
    discountType: "%",
    taxRate: "0.00",
    taxTotal: "0.00",
    grandTotal: "0.00",
  },
  lineItems: [{
    invoiceId: 0,
    description: "",
    quantity: 1,
    rate: "0.00",
    amount: "0.00",
  }],
};

export default function InvoiceGenerator() {
  const { id } = useParams();
  const { toast } = useToast();
  const [formData, setFormData] = useState<InvoiceFormData>(defaultFormData);

  // Fetch invoice if editing
  const { data: invoice, isLoading } = useQuery<InvoiceWithLineItems>({
    queryKey: ["/api/invoices", id],
    enabled: !!id && id !== "new",
  });

  // Fetch next invoice number for new invoices
  const { data: nextNumberData } = useQuery<{ nextNumber: string }>({
    queryKey: ["/api/invoices/next-number"],
    enabled: !id || id === "new",
  });

  // Save/Update invoice mutation
  const saveInvoiceMutation = useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      const url = id && id !== "new" ? `/api/invoices/${id}` : "/api/invoices";
      const method = id && id !== "new" ? "PUT" : "POST";
      const response = await apiRequest(method, url, data);
      return response.json();
    },
    onSuccess: (savedInvoice) => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Invoice saved",
        description: `Invoice ${savedInvoice.invoiceNumber} has been saved successfully.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save invoice. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Initialize form data
  useEffect(() => {
    if (invoice) {
      setFormData({
        invoice: {
          invoiceNumber: invoice.invoiceNumber,
          invoiceDate: invoice.invoiceDate,
          dueDate: invoice.dueDate,
          paymentTerms: invoice.paymentTerms,
          clientName: invoice.clientName,
          clientAddress: invoice.clientAddress,
          clientEmail: invoice.clientEmail || "",
          clientPhone: invoice.clientPhone || "",
          subtotal: invoice.subtotal,
          discountAmount: invoice.discountAmount || "0.00",
          discountType: invoice.discountType || "%",
          taxRate: invoice.taxRate || "0.00",
          taxTotal: invoice.taxTotal || "0.00",
          grandTotal: invoice.grandTotal,
        },
        lineItems: invoice.lineItems.length > 0 ? invoice.lineItems.map(item => ({
          invoiceId: item.invoiceId,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
        })) : defaultFormData.lineItems,
      });
    } else if (nextNumberData) {
      setFormData(prev => ({
        ...prev,
        invoice: {
          ...prev.invoice,
          invoiceNumber: nextNumberData.nextNumber,
        },
      }));
    }
  }, [invoice, nextNumberData]);

  const handleSave = () => {
    saveInvoiceMutation.mutate(formData);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    generatePDF(formData);
    toast({
      title: "PDF Generated",
      description: "Invoice PDF has been downloaded successfully.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Receipt className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Skittle B3x OPC</h1>
                <p className="text-sm text-gray-600">Invoice Generator</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={saveInvoiceMutation.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                {saveInvoiceMutation.isPending ? "Saving..." : "Save Draft"}
              </Button>
              <Button variant="outline" onClick={handlePrint}>
                <PrinterCheck className="mr-2 h-4 w-4" />
                PrinterCheck
              </Button>
              <Button onClick={handleDownloadPDF}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <InvoiceForm 
            formData={formData}
            setFormData={setFormData}
          />
          <div className="lg:sticky lg:top-8">
            <InvoicePreview formData={formData} />
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          size="icon"
          className="w-12 h-12 rounded-full shadow-lg hover:scale-105 transition-transform"
          onClick={() => window.location.href = "/"}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
