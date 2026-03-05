type CartSummaryProps = {
  subtotal: number;
  manualDiscount: number;
  autoDiscount: number;
  gstAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  total: number;
  gstEnabled: boolean;
};

export default function CartSummary({
  subtotal,
  manualDiscount,
  autoDiscount,
  cgstAmount,
  sgstAmount,
  igstAmount,
  gstAmount,
  total,
  gstEnabled,
}: CartSummaryProps) {
  return (
    <div className="text-sm space-y-1">
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>₹{subtotal.toFixed(2)}</span>
      </div>

      {manualDiscount > 0 && (
        <div className="flex justify-between text-red-600">
          <span>Manual Discount</span>
          <span>− ₹{manualDiscount.toFixed(2)}</span>
        </div>
      )}

      {autoDiscount > 0 && (
        <div className="flex justify-between text-red-600">
          <span>Coupon Discount</span>
          <span>− ₹{autoDiscount.toFixed(2)}</span>
        </div>
      )}

      {/* {gstEnabled && (
        <div className="flex justify-between">
          <span>GST</span>
          <span>₹{gstAmount.toFixed(2)}</span>
        </div>
      )} */}
      {gstEnabled && cgstAmount > 0 && (
  <div className="flex justify-between text-sm">
    <span>CGST</span>
    <span>₹{cgstAmount.toFixed(2)}</span>
  </div>
)}

{gstEnabled && sgstAmount > 0 && (
  <div className="flex justify-between text-sm">
    <span>SGST</span>
    <span>₹{sgstAmount.toFixed(2)}</span>
  </div>
)}

{gstEnabled && igstAmount > 0 && (
  <div className="flex justify-between text-sm">
    <span>IGST</span>
    <span>₹{igstAmount.toFixed(2)}</span>
  </div>
)}


      <div className="flex justify-between font-bold border-t pt-1">
        <span>Total</span>
        <span>₹{total.toFixed(2)}</span>
      </div>
    </div>
  );
}
