import { CustomerProfile } from "@/types/schema";
export type ApplyMode = "AUTO" | "MANUAL";

export function applyOffer({
  billAmount,
  customer,
  applyMode,
  couponCode,
  billId,
}: {
  billAmount: number;
  customer: CustomerProfile | null;
  applyMode: ApplyMode;
  couponCode?: string;
  billId: string;
}) {
  const offer = customer?.activeOffer;
  if (!offer) return { discount: 0 };

  const isPreview = billId === "__PREVIEW__";

  // ❌ expired
  if (new Date(offer.expiresAt).getTime() < Date.now()) {
    return { discount: 0, error: { type: "EXPIRED" } };
  }

  // ❌ already redeemed (real bill only)
  if (offer.redeemed && !isPreview) {
    return { discount: 0, error: { type: "USED" } };
  }

  // ❌ manual validation
  if (applyMode === "MANUAL") {
    const input = (couponCode || "").trim().toUpperCase();
    const expected = `OFFER-${offer.id}`.toUpperCase();

    if (!input) return { discount: 0 };
    if (input !== expected) {
      return { discount: 0, error: { type: "INVALID" } };
    }
  }

  const discount =
    offer.valueType === "PERCENT"
      ? Math.round((billAmount * offer.value) / 100)
      : offer.value;

  // 🔥 CONSUME ONLY ON REAL BILL
  if (!isPreview) {
    offer.redeemed = true;
    offer.redeemedBillId = billId;
  }

  return { discount, applied: true };
}
