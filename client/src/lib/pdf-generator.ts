import type { InvoiceFormData } from "@/pages/invoice-generator";

export function generatePDF(formData: InvoiceFormData) {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert('Please allow popups to generate PDF');
    return;
  }

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

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice ${formData.invoice.invoiceNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          line-height: 1.5;
          color: #374151;
          background: white;
          padding: 40px;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
        }
        
        .logo-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .logo {
          width: 64px;
          height: 64px;
          background: #2563eb;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          font-weight: bold;
        }
        
        .company-info h1 {
          font-size: 24px;
          font-weight: bold;
          color: #111827;
          margin-bottom: 4px;
        }
        
        .company-info p {
          color: #6b7280;
        }
        
        .invoice-title {
          text-align: right;
        }
        
        .invoice-title h2 {
          font-size: 36px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 4px;
        }
        
        .invoice-title p {
          color: #6b7280;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 40px;
        }
        
        .info-section h3 {
          font-weight: 600;
          color: #111827;
          margin-bottom: 12px;
        }
        
        .info-section .company-name {
          font-weight: 500;
          color: #111827;
          margin-bottom: 4px;
        }
        
        .details-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 40px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
        }
        
        .detail-item p:first-child {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #6b7280;
          margin-bottom: 4px;
        }
        
        .detail-item p:last-child {
          font-weight: 500;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 40px;
        }
        
        thead th {
          padding: 12px 0;
          border-bottom: 2px solid #e5e7eb;
          text-align: left;
          font-weight: 600;
          color: #111827;
          font-size: 14px;
        }
        
        thead th:nth-child(2) { text-align: center; width: 80px; }
        thead th:nth-child(3), thead th:nth-child(4) { text-align: right; width: 100px; }
        
        tbody td {
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
        }
        
        tbody td:nth-child(2) { text-align: center; }
        tbody td:nth-child(3), tbody td:nth-child(4) { text-align: right; }
        tbody td:nth-child(4) { font-weight: 500; color: #111827; }
        
        .totals {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 40px;
        }
        
        .totals-section {
          width: 320px;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        .total-row.subtotal {
          color: #6b7280;
        }
        
        .total-row.discount .value {
          color: #059669;
        }
        
        .total-row.final {
          font-size: 18px;
          font-weight: bold;
          border-top: 1px solid #e5e7eb;
          padding-top: 8px;
          margin-top: 8px;
        }
        
        .total-row.final .value {
          color: #059669;
        }
        
        .disclaimer {
          margin-top: 40px;
          padding: 16px;
          background: #dbeafe;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
        }
        
        .disclaimer h4 {
          font-weight: 600;
          color: #1e3a8a;
          margin-bottom: 8px;
        }
        
        .disclaimer p {
          color: #1e40af;
          font-size: 14px;
          line-height: 1.6;
        }
        
        .contact {
          margin-top: 24px;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
        
        .contact a {
          color: #2563eb;
          text-decoration: none;
        }
        
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo-section">
          <div class="logo">🧾</div>
          <div class="company-info">
            <h1>Skittle B3x OPC</h1>
            <p>Professional Services</p>
          </div>
        </div>
        <div class="invoice-title">
          <h2>INVOICE</h2>
          <p>${formData.invoice.invoiceNumber}</p>
        </div>
      </div>
      
      <div class="info-grid">
        <div class="info-section">
          <h3>From:</h3>
          <div class="company-name">Skittle B3x OPC</div>
          <div>123 Business Street</div>
          <div>City, State 12345</div>
          <div>contact@skittleb3x.com</div>
          <div>+1 (555) 123-4567</div>
        </div>
        <div class="info-section">
          <h3>Bill To:</h3>
          <div class="company-name">${formData.invoice.clientName || 'Client Name'}</div>
          <div style="white-space: pre-line;">${formData.invoice.clientAddress || 'Client Address'}</div>
          ${formData.invoice.clientEmail ? `<div>${formData.invoice.clientEmail}</div>` : ''}
          ${formData.invoice.clientPhone ? `<div>${formData.invoice.clientPhone}</div>` : ''}
        </div>
      </div>
      
      <div class="details-grid">
        <div class="detail-item">
          <p>Invoice Date</p>
          <p>${formData.invoice.invoiceDate ? formatDate(formData.invoice.invoiceDate) : '-'}</p>
        </div>
        <div class="detail-item">
          <p>Due Date</p>
          <p>${formData.invoice.dueDate ? formatDate(formData.invoice.dueDate) : '-'}</p>
        </div>
        <div class="detail-item">
          <p>Payment Terms</p>
          <p>${formData.invoice.paymentTerms}</p>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${formData.lineItems.map(item => `
            <tr>
              <td>${item.description || 'Service'}</td>
              <td>${item.quantity}</td>
              <td>$${Number(item.rate).toFixed(2)}</td>
              <td>$${Number(item.amount).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="totals">
        <div class="totals-section">
          <div class="total-row subtotal">
            <span>Subtotal:</span>
            <span>$${Number(formData.invoice.subtotal).toFixed(2)}</span>
          </div>
          ${Number(formData.invoice.discountAmount) > 0 ? `
            <div class="total-row discount">
              <span>Discount (${formData.invoice.discountAmount}${formData.invoice.discountType}):</span>
              <span class="value">-$${calculateDiscountValue()}</span>
            </div>
          ` : ''}
          ${Number(formData.invoice.taxRate) > 0 ? `
            <div class="total-row">
              <span>Tax (${formData.invoice.taxRate}%):</span>
              <span>$${Number(formData.invoice.taxTotal).toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="total-row final">
            <span>Total:</span>
            <span class="value">$${Number(formData.invoice.grandTotal).toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <div class="disclaimer">
        <h4>Important Notice</h4>
        <p>This invoice serves as proof of order completion and service delivery. Please retain this document for your records. Payment is due according to the terms specified above. Thank you for choosing Skittle B3x OPC for your professional service needs.</p>
      </div>
      
      <div class="contact">
        <p>Questions about this invoice? Contact us at <a href="mailto:billing@skittleb3x.com">billing@skittleb3x.com</a></p>
      </div>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  // Wait for content to load, then print and close
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };
}
