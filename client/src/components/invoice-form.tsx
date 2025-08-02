import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import type { InvoiceFormData } from "@/pages/invoice-generator";

interface InvoiceFormProps {
  formData: InvoiceFormData;
  setFormData: (data: InvoiceFormData) => void;
}

export default function InvoiceForm({ formData, setFormData }: InvoiceFormProps) {
  
  const updateInvoiceField = (field: string, value: string) => {
    setFormData({
      ...formData,
      invoice: {
        ...formData.invoice,
        [field]: value,
      },
    });
    
    // Recalculate totals
    calculateTotals();
  };

  const updateLineItem = (index: number, field: string, value: string | number) => {
    const updatedLineItems = [...formData.lineItems];
    updatedLineItems[index] = {
      ...updatedLineItems[index],
      [field]: value,
    };

    // Calculate amount for this line item
    if (field === 'quantity' || field === 'rate') {
      const quantity = field === 'quantity' ? Number(value) : updatedLineItems[index].quantity;
      const rate = field === 'rate' ? Number(value) : Number(updatedLineItems[index].rate);
      updatedLineItems[index].amount = (quantity * rate).toFixed(2);
    }

    setFormData({
      ...formData,
      lineItems: updatedLineItems,
    });

    calculateTotals();
  };

  const addLineItem = () => {
    setFormData({
      ...formData,
      lineItems: [
        ...formData.lineItems,
        {
          invoiceId: 0,
          description: "",
          quantity: 1,
          rate: "0.00",
          amount: "0.00",
        },
      ],
    });
  };

  const removeLineItem = (index: number) => {
    if (formData.lineItems.length > 1) {
      const updatedLineItems = formData.lineItems.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        lineItems: updatedLineItems,
      });
      calculateTotals();
    }
  };

  const calculateTotals = () => {
    setTimeout(() => {
      const subtotal = formData.lineItems.reduce((sum, item) => sum + Number(item.amount), 0);
      
      const discountAmount = Number(formData.invoice.discountAmount) || 0;
      const discountValue = formData.invoice.discountType === '%' 
        ? (subtotal * discountAmount / 100)
        : discountAmount;
      
      const afterDiscount = subtotal - discountValue;
      const taxRate = Number(formData.invoice.taxRate) || 0;
      const taxTotal = afterDiscount * taxRate / 100;
      const grandTotal = afterDiscount + taxTotal;

      setFormData(prev => ({
        ...prev,
        invoice: {
          ...prev.invoice,
          subtotal: subtotal.toFixed(2),
          taxTotal: taxTotal.toFixed(2),
          grandTotal: grandTotal.toFixed(2),
        },
      }));
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Invoice Details */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                value={formData.invoice.invoiceNumber}
                onChange={(e) => updateInvoiceField('invoiceNumber', e.target.value)}
                placeholder="INV-001"
              />
            </div>
            <div>
              <Label htmlFor="invoiceDate">Invoice Date</Label>
              <Input
                id="invoiceDate"
                type="date"
                value={formData.invoice.invoiceDate}
                onChange={(e) => updateInvoiceField('invoiceDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.invoice.dueDate}
                onChange={(e) => updateInvoiceField('dueDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <Select 
                value={formData.invoice.paymentTerms}
                onValueChange={(value) => updateInvoiceField('paymentTerms', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Net 30">Net 30</SelectItem>
                  <SelectItem value="Net 15">Net 15</SelectItem>
                  <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={formData.invoice.clientName}
                onChange={(e) => updateInvoiceField('clientName', e.target.value)}
                placeholder="Enter client name"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="clientAddress">Address</Label>
              <Textarea
                id="clientAddress"
                value={formData.invoice.clientAddress}
                onChange={(e) => updateInvoiceField('clientAddress', e.target.value)}
                placeholder="Enter client address"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="clientEmail">Email</Label>
              <Input
                id="clientEmail"
                type="email"
                value={formData.invoice.clientEmail}
                onChange={(e) => updateInvoiceField('clientEmail', e.target.value)}
                placeholder="client@example.com"
              />
            </div>
            <div>
              <Label htmlFor="clientPhone">Phone</Label>
              <Input
                id="clientPhone"
                type="tel"
                value={formData.invoice.clientPhone}
                onChange={(e) => updateInvoiceField('clientPhone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Services & Items</CardTitle>
            <Button onClick={addLineItem} variant="outline" size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {formData.lineItems.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-5">
                  {index === 0 && <Label className="block text-sm font-medium text-gray-700 mb-1">Description</Label>}
                  <Input
                    value={item.description}
                    onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                    placeholder="Service description"
                    className="text-sm"
                  />
                </div>
                <div className="col-span-2">
                  {index === 0 && <Label className="block text-sm font-medium text-gray-700 mb-1">Qty</Label>}
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 0)}
                    className="text-sm"
                    min="1"
                  />
                </div>
                <div className="col-span-2">
                  {index === 0 && <Label className="block text-sm font-medium text-gray-700 mb-1">Rate</Label>}
                  <Input
                    type="number"
                    step="0.01"
                    value={item.rate}
                    onChange={(e) => updateLineItem(index, 'rate', e.target.value)}
                    placeholder="0.00"
                    className="text-sm"
                  />
                </div>
                <div className="col-span-2">
                  {index === 0 && <Label className="block text-sm font-medium text-gray-700 mb-1">Amount</Label>}
                  <Input
                    value={`$${item.amount}`}
                    readOnly
                    className="text-sm bg-gray-50"
                  />
                </div>
                <div className="col-span-1">
                  <Button
                    onClick={() => removeLineItem(index)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                    disabled={formData.lineItems.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Totals & Adjustments */}
      <Card>
        <CardHeader>
          <CardTitle>Totals & Adjustments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Subtotal:</span>
              <span className="font-medium">${formData.invoice.subtotal}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Discount:</span>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.invoice.discountAmount}
                  onChange={(e) => updateInvoiceField('discountAmount', e.target.value)}
                  className="w-20 px-2 py-1 text-sm"
                  placeholder="0"
                />
                <Select 
                  value={formData.invoice.discountType}
                  onValueChange={(value) => updateInvoiceField('discountType', value)}
                >
                  <SelectTrigger className="w-16 px-2 py-1 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="%">%</SelectItem>
                    <SelectItem value="$">$</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <span className="font-medium text-green-600">
                -${formData.invoice.discountType === '%' 
                  ? ((Number(formData.invoice.subtotal) * Number(formData.invoice.discountAmount)) / 100).toFixed(2)
                  : Number(formData.invoice.discountAmount).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Tax:</span>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.invoice.taxRate}
                  onChange={(e) => updateInvoiceField('taxRate', e.target.value)}
                  className="w-20 px-2 py-1 text-sm"
                  placeholder="0"
                />
                <span className="text-sm text-gray-600">%</span>
              </div>
              <span className="font-medium">${formData.invoice.taxTotal}</span>
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-xl font-bold text-green-600">${formData.invoice.grandTotal}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
