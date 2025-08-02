import { Receipt } from "lucide-react";
import type { InvoiceFormData } from "@/pages/invoice-generator";

interface InvoicePreviewProps {
  formData: InvoiceFormData;
}

export default function InvoicePreview({ formData }: InvoicePreviewProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDiscountValue = () => {
    const subtotal = Number(formData.invoice.subtotal);
    const discountAmount = Number(formData.invoice.discountAmount) || 0;
    
    return formData.invoice.discountType === '%' 
      ? (subtotal * discountAmount / 100).toFixed(2)
      : discountAmount.toFixed(2);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8" id="invoice-preview">
      {/* Invoice Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
            <Receipt className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Skittle B3x OPC</h1>
            <p className="text-gray-600">Professional Services</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-bold text-blue-600">INVOICE</h2>
          <p className="text-sm text-gray-600 mt-1">{formData.invoice.invoiceNumber}</p>
        </div>
      </div>

      {/* Company & Client Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">From:</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p className="font-medium text-gray-900">Skittle B3x OPC</p>
            <p>123 Business Street</p>
            <p>City, State 12345</p>
            <p>contact@skittleb3x.com</p>
            <p>+1 (555) 123-4567</p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Bill To:</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p className="font-medium text-gray-900">
              {formData.invoice.clientName || 'Client Name'}
            </p>
            <div className="whitespace-pre-line">
              {formData.invoice.clientAddress || 'Client Address'}
            </div>
            {formData.invoice.clientEmail && <p>{formData.invoice.clientEmail}</p>}
            {formData.invoice.clientPhone && <p>{formData.invoice.clientPhone}</p>}
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Invoice Date</p>
          <p className="font-medium">
            {formData.invoice.invoiceDate ? formatDate(formData.invoice.invoiceDate) : '-'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Due Date</p>
          <p className="font-medium">
            {formData.invoice.dueDate ? formatDate(formData.invoice.dueDate) : '-'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Payment Terms</p>
          <p className="font-medium">{formData.invoice.paymentTerms}</p>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 text-sm font-semibold text-gray-900">Description</th>
              <th className="text-center py-3 text-sm font-semibold text-gray-900 w-16">Qty</th>
              <th className="text-right py-3 text-sm font-semibold text-gray-900 w-24">Rate</th>
              <th className="text-right py-3 text-sm font-semibold text-gray-900 w-24">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {formData.lineItems.map((item, index) => (
              <tr key={index}>
                <td className="py-3 text-sm text-gray-600">
                  {item.description || `Service ${index + 1}`}
                </td>
                <td className="py-3 text-sm text-gray-600 text-center">{item.quantity}</td>
                <td className="py-3 text-sm text-gray-600 text-right">
                  ${Number(item.rate).toFixed(2)}
                </td>
                <td className="py-3 text-sm font-medium text-gray-900 text-right">
                  ${Number(item.amount).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-end">
          <div className="w-80 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">${Number(formData.invoice.subtotal).toFixed(2)}</span>
            </div>
            {Number(formData.invoice.discountAmount) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Discount ({formData.invoice.discountAmount}{formData.invoice.discountType}):
                </span>
                <span className="font-medium text-green-600">-${calculateDiscountValue()}</span>
              </div>
            )}
            {Number(formData.invoice.taxRate) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax ({formData.invoice.taxRate}%):</span>
                <span className="font-medium">${Number(formData.invoice.taxTotal).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
              <span>Total:</span>
              <span className="text-green-600">${Number(formData.invoice.grandTotal).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">Important Notice</h4>
        <p className="text-sm text-blue-800 leading-relaxed">
          This invoice serves as proof of order completion and service delivery. Please retain this document for your records. 
          Payment is due according to the terms specified above. Thank you for choosing Skittle B3x OPC for your professional service needs.
        </p>
      </div>

      {/* Payment Instructions */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Questions about this invoice? Contact us at{' '}
          <a href="mailto:billing@skittleb3x.com" className="text-blue-600 hover:underline">
            billing@skittleb3x.com
          </a>
        </p>
      </div>
    </div>
  );
}
