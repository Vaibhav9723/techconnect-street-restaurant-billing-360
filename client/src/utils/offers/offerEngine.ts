import { CustomerProfile, OfferSettings } from "@/types/schema";
import { applyOffer, ApplyMode } from "./applyOffer";
import { generateOfferIfEligible } from "./generateOffer";

export function processOffers({
  customer,
  subtotalAfterManualDiscount,
  finalBillTotal,
  couponCode,
  applyMode,
  billId,
  offerSettings,
}: {
  customer: CustomerProfile | null;
  subtotalAfterManualDiscount: number;
  finalBillTotal: number;
  couponCode?: string;
  applyMode: ApplyMode;
  billId: string;
  offerSettings: OfferSettings;
}) {
  let discount = 0;
  let applied = false;

  const toasts: { title: string; description: string }[] = [];


    if (customer?.activeOffer) {
    const res = applyOffer({
        billAmount: subtotalAfterManualDiscount,
        customer,
        applyMode,
        couponCode,
        billId,
    });

    if (res.error?.type === "EXPIRED") {
      customer.activeOffer = null;
      toasts.push({
        title: "Coupon Expired",
        description: "Ye coupon ki validity khatam ho chuki hai",
      });
    }


    if (res.applied) {
      discount = res.discount;
      applied = true;

      toasts.push({
        title: "Offer Applied",
        description: `₹${discount} discount applied successfully`,
      });

      // ✅ VERY IMPORTANT 🔥
      if (billId !== "__PREVIEW__") {
        customer.activeOffer = null; // 👈 CLEAR AFTER USE
      }
    }

    if (res.error?.type === "EXPIRED") {
      customer.activeOffer = null; // ✅ correct
      toasts.push({
        title: "Coupon Expired",
        description: "Ye coupon ki validity khatam ho chuki hai",
      });
    }

    if (res.error?.type === "INVALID") {
        toasts.push({
        title: "Invalid Coupon",
        description: "Entered coupon code is not valid",
        });
    }

    // if (res.error?.type === "EMPTY") {
    //     toasts.push({
    //     title: "Coupon Required",
    //     description: "Please enter coupon code",
    //     });
    // }
    if (
      applyMode === "MANUAL" &&
      (!couponCode || couponCode.trim() === "")
    ) {
      // no toast, no error, no discount
      return { discount: 0, toasts };
    }

    }

  if (
    customer &&
    !applied &&
    offerSettings.enabled &&
    offerSettings.billAmountOffer.enabled
  ) {
    const newOffer = generateOfferIfEligible({
      finalBillTotal,
      settings: offerSettings.billAmountOffer,
      billId,
    });

    if (newOffer) {
      customer.activeOffer = newOffer;

      toasts.push({
        title: "New Coupon Generated",
        description: "Next visit ke liye coupon add ho gaya",
      });
    } else {
      // criteria fail → no coupon
      customer.activeOffer = null;
    }
  }
  
  return { discount, toasts };
}


