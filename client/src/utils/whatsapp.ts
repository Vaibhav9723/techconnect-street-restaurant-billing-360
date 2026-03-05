import { Bill, Settings } from "@/types/schema";
import { getCustomer } from "@/utils/customerProfile";

export function sendInvoiceWhatsApp(bill: Bill, settings: Settings) {
  if (!bill.customerPhone) return;

  const phone = `91${bill.customerPhone}`;
  const lines: string[] = [];

  // HEADER
  lines.push(settings.shopName);
  if (settings.address) lines.push(settings.address);
  lines.push("");

  // BILL META
  if (settings.tokenVisible && bill.token) {
    lines.push(`Token: #${bill.token}`);
  }
  lines.push(`Bill No: ${bill.id.slice(0, 8)}`);
  lines.push(`Date: ${new Date(bill.dateISO).toLocaleString()}`);
  lines.push("");

  // ITEMS
  lines.push("Items:");
  bill.items.forEach((item) => {
    lines.push(
      `${item.productName}  ₹${item.price} x ${item.quantity} = ₹${item.total}`
    );
  });

  lines.push("");
  lines.push(`Subtotal: ₹${bill.subtotal.toFixed(2)}`);

  if (bill.discount > 0) {
    lines.push(`Discount: -₹${bill.discount.toFixed(2)}`);
  }

  if (settings.gstOn) {
    lines.push(`GST (${settings.gstPercent}%): ₹${bill.gst.toFixed(2)}`);
  }

  lines.push(`TOTAL: ₹${bill.total.toFixed(2)}`);
  lines.push("");

  // PAYMENT
  lines.push(`Payment Mode: ${bill.paymentMode.toUpperCase()}`);
  if (bill.paymentMode === "both") {
    lines.push(`Online: ₹${bill.onlineAmount}`);
    lines.push(`Cash: ₹${bill.cashAmount}`);
  }

  // OFFER (ONLY IF NOT REDEEMED)
  const customer = getCustomer(bill.customerPhone);
  const offer = customer?.activeOffer;

  if (offer && !offer.redeemed) {
    lines.push("");
    lines.push("Next Visit Offer");

    // percentage only (as per your rule)
    lines.push(`Get ${offer.value}% OFF`);

    if (offer.minNextBill) {
      lines.push(`Min Bill: ₹${offer.minNextBill}`);
    }

    lines.push(`Coupon Code: OFFER-${offer.id}`);
  }

  // FOOTER
  if (settings.offers?.footerText) {
    lines.push("");
    lines.push(settings.offers.footerText);
  }

  if (settings.offers?.feedbackText) {
    lines.push("");
    lines.push(settings.offers.feedbackText);
    if (settings.offers.feedbackLink) {
      lines.push(settings.offers.feedbackLink);
    }
  }

  lines.push("");
  lines.push("Thank you for your visit!");

  const message = encodeURIComponent(lines.join("\n"));
  const url = `https://wa.me/${phone}?text=${message}`;
  window.open(url, "_blank");
}
