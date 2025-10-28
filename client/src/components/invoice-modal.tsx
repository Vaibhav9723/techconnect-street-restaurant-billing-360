import { useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bill, Settings } from '@shared/schema';
import { format } from 'date-fns';
import { Printer, Download, X } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { cn } from '@/lib/utils';

interface InvoiceModalProps {
  bill: Bill;
  settings: Settings;
  onClose: () => void;
}

export function InvoiceModal({ bill, settings, onClose }: InvoiceModalProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;

    const options = {
      margin: settings.printLayout === 'A4' ? 10 : 5,
      filename: `invoice-${bill.token || bill.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: {
        unit: 'mm',
        format: settings.printLayout === 'A4' ? 'a4' : settings.printLayout === '80mm' ? [80, 200] : [58, 200],
        orientation: 'portrait',
      },
    };

    try {
      await html2pdf().set(options).from(invoiceRef.current).save();
    } catch (error) {
      console.error('PDF generation error:', error);
    }
  };

  const isReceipt = settings.printLayout === '58mm' || settings.printLayout === '80mm';

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          'max-h-[90vh] overflow-y-auto',
          isReceipt ? 'max-w-sm' : 'max-w-3xl'
        )}
        data-testid="dialog-invoice"
      >
        <DialogHeader className="print:hidden">
          <DialogTitle>Invoice Preview</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Invoice Preview */}
          <div
            ref={invoiceRef}
            className={cn(
              'bg-white text-black p-6',
              isReceipt && 'max-w-xs mx-auto'
            )}
            data-testid="invoice-preview"
          >
            {settings.printLayout === 'A4' ? (
              <A4Invoice bill={bill} settings={settings} />
            ) : (
              <ReceiptInvoice bill={bill} settings={settings} />
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 print:hidden">
            <Button
              className="flex-1"
              onClick={handlePrint}
              data-testid="button-print"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button
              className="flex-1"
              variant="outline"
              onClick={handleDownloadPDF}
              data-testid="button-download-pdf"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function A4Invoice({ bill, settings }: { bill: Bill; settings: Settings }) {
  return (
    <div className="font-mono">
      {/* Header */}
      <div className="text-center mb-6 pb-4 border-b-2 border-black">
        <h1 className="text-2xl font-bold mb-2">{settings.shopName}</h1>
        {settings.address && (
          <p className="text-sm">{settings.address}</p>
        )}
      </div>

      {/* Bill Info */}
      <div className="flex justify-between mb-6 text-sm">
        <div>
          {bill.token && settings.tokenVisible && (
            <p className="font-bold">Token: #{bill.token}</p>
          )}
          <p>Date: {format(new Date(bill.dateISO), 'dd/MM/yyyy')}</p>
          <p>Time: {format(new Date(bill.dateISO), 'hh:mm a')}</p>
        </div>
        <div className="text-right">
          <p>Bill ID: {bill.id.slice(0, 8)}</p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-6 text-sm">
        <thead>
          <tr className="border-b-2 border-black">
            <th className="text-left py-2">Item</th>
            <th className="text-center py-2">Qty</th>
            <th className="text-right py-2">Price</th>
            <th className="text-right py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((item, idx) => (
            <tr key={idx} className="border-b border-gray-300">
              <td className="py-2">{item.productName}</td>
              <td className="text-center py-2">{item.quantity}</td>
              <td className="text-right py-2 tabular-nums">₹{item.price.toFixed(2)}</td>
              <td className="text-right py-2 tabular-nums">₹{item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-64 space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="tabular-nums">₹{bill.subtotal.toFixed(2)}</span>
          </div>
          {bill.discount > 0 && (
            <div className="flex justify-between">
              <span>Discount:</span>
              <span className="tabular-nums">-₹{bill.discount.toFixed(2)}</span>
            </div>
          )}
          {settings.gstOn && (
            <div className="flex justify-between">
              <span>GST ({settings.gstPercent}%):</span>
              <span className="tabular-nums">+₹{bill.gst.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg pt-2 border-t-2 border-black">
            <span>Total:</span>
            <span className="tabular-nums">₹{bill.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm pt-4 border-t border-gray-300">
        <p>Thank you for your business!</p>
      </div>
    </div>
  );
}

function ReceiptInvoice({ bill, settings }: { bill: Bill; settings: Settings }) {
  return (
    <div className="font-mono text-sm">
      {/* Header */}
      <div className="text-center mb-4 pb-3 border-b border-dashed border-black">
        <h1 className="text-lg font-bold mb-1">{settings.shopName}</h1>
        {settings.address && (
          <p className="text-xs">{settings.address}</p>
        )}
      </div>

      {/* Bill Info */}
      <div className="mb-4 text-xs space-y-1">
        {bill.token && settings.tokenVisible && (
          <p className="font-bold">Token: #{bill.token}</p>
        )}
        <p>Date: {format(new Date(bill.dateISO), 'dd/MM/yyyy hh:mm a')}</p>
        <p>Bill: {bill.id.slice(0, 8)}</p>
      </div>

      <div className="border-b border-dashed border-black mb-3" />

      {/* Items */}
      <div className="space-y-2 mb-4 text-xs">
        {bill.items.map((item, idx) => (
          <div key={idx}>
            <div className="flex justify-between font-medium">
              <span>{item.productName}</span>
              <span className="tabular-nums">₹{item.total.toFixed(2)}</span>
            </div>
            <div className="text-xs text-gray-600 ml-2">
              {item.quantity} x ₹{item.price.toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <div className="border-b border-dashed border-black mb-3" />

      {/* Totals */}
      <div className="space-y-1 text-xs mb-4">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span className="tabular-nums">₹{bill.subtotal.toFixed(2)}</span>
        </div>
        {bill.discount > 0 && (
          <div className="flex justify-between">
            <span>Discount:</span>
            <span className="tabular-nums">-₹{bill.discount.toFixed(2)}</span>
          </div>
        )}
        {settings.gstOn && (
          <div className="flex justify-between">
            <span>GST ({settings.gstPercent}%):</span>
            <span className="tabular-nums">+₹{bill.gst.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="border-b border-black mb-3" />

      <div className="flex justify-between font-bold text-base mb-4">
        <span>TOTAL:</span>
        <span className="tabular-nums">₹{bill.total.toFixed(2)}</span>
      </div>

      <div className="border-b border-dashed border-black mb-3" />

      {/* Footer */}
      <div className="text-center text-xs">
        <p>Thank you!</p>
      </div>
    </div>
  );
}
