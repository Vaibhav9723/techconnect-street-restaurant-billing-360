import { OfferSettings } from "@/types/schema";

export const DEFAULT_OFFER_SETTINGS: OfferSettings = {
  enabled: false,

  billAmountOffer: {
    enabled: false,
    minBillAmount: 500,
    nextBillMinAmount: 300,
    discountType: "PERCENT",
    discountValue: 10,
    validDays: 7,
  },

  repeatCustomerOffer: {
    enabled: false,
    repeatCount: 3,
    discountType: "FLAT",
    discountValue: 50,
  },

  footerText: "",
  feedbackText: "",
  feedbackLink: "",
};
