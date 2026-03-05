import { CustomerOffer, OfferSettings } from "@/types/schema";

export function generateOfferIfEligible({
  finalBillTotal,
  settings,
  billId,
}: {
  finalBillTotal: number;
  settings: OfferSettings["billAmountOffer"];
  billId: string;
}): CustomerOffer | null {
  if (!settings?.enabled) return null;
  if (finalBillTotal < settings.minBillAmount) return null;

  const validDays = settings.validDays > 0 ? settings.validDays : 7;

  const expiresAt = new Date(
    Date.now() + validDays * 24 * 60 * 60 * 1000
  ).toISOString();

  return {
    id: Math.random().toString(36).slice(2, 8).toUpperCase(),
    type: "BILL_AMOUNT",
    valueType: settings.discountType,
    value: settings.discountValue,
    minNextBill: settings.nextBillMinAmount,
    generatedFromBillId: billId,
    generatedAt: new Date().toISOString(),
    validDays,
    expiresAt,
    redeemed: false,
  };
}

