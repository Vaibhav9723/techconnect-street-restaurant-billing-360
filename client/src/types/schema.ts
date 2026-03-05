
export interface Product {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  addCount?: number;
  updatedAt: number;
  // 🔒 soft delete (future-proof)
  isDeleted?: boolean;
  deletedAt?: number;
}

export interface Category {
  id: string;
  name: string;
  updatedAt: number;
}

export interface InsertCategory {
  name: string;
}

export interface InsertProduct {
  name: string;
  price: number;
  categoryId: string;
}

export interface BillItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  total: number;
}

type BillType = "counter" | "table" | "takeaway";

export interface Bill {
  id: string;
  dateISO: string;
  items: BillItem[];
  subtotal: number;
  discount: number;
  gst: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  total: number;
  token?: number;
  paymentMode: "cash" | "online" | "both";
  onlineAmount?: number;
  cashAmount?: number;
  customerName?: string; 
  customerPhone?: string;
  billType?: BillType;     
  tableId?: string; 
}

export type BusinessMode = "vendor" | "restaurant";

export interface Settings {
  businessMode: BusinessMode;
  shopName: string;
  address: string;
  gstOn: boolean;
  gstPercent: number;
  gstMode: "INCLUSIVE" | "EXCLUSIVE";
  gstType: "CGST_SGST" | "IGST";
  tokenVisible: boolean;
  printLayout: "A4" | "58mm" | "80mm";
  theme: "light" | "dark";
  primaryColor: string;
  customColor?: string;
  offers?: OfferSettings;
  updatedAt?: number;
  tableCount?: number;
  gstNumber?: string;
}

export interface CustomerProfile {
  phone: string;
  name?: string;

  totalBills: number;
  totalSpend: number;
  lastVisitAt?: string;
  activeOffer?: CustomerOffer | null;
}

export interface CustomerOffer {
  id: string;
  type: "BILL_AMOUNT" | "REPEAT_CUSTOMER";

  valueType: "PERCENT" | "FLAT";
  value: number;

  minNextBill?: number;

  generatedFromBillId: string;
  generatedAt: string;

  validDays: number;
  expiresAt: string; 
  redeemed: boolean;
  redeemedBillId?: string;
}

export interface OfferSettings {
  enabled: boolean;
  applyMode?: "AUTO" | "MANUAL";

  billAmountOffer: {
    enabled: boolean;
    minBillAmount: number;
    nextBillMinAmount: number;
    discountType: "PERCENT" | "FLAT";
    discountValue: number;
    validDays: number;
  };

  repeatCustomerOffer: {
    enabled: boolean;
    repeatCount: number;
    discountType: "PERCENT" | "FLAT";
    discountValue: number;
  };

  footerText: string;
  feedbackText: string;
  feedbackLink: string;
}


export interface TokenCounter {
  date: string;
  count: number;
}