import { useState, useMemo } from "react";
import { nanoid } from "nanoid";
import { Bill, BillItem } from "@/types/schema";
import { useBills, useSettings } from "@/hooks/usePOSData";
import { useToast } from "@/hooks/use-toast";
import { useRunningCarts } from "./useRunningCarts";
import { useTokens } from "@/hooks/useEncryptedStorage";
import { processOffers } from "@/utils/offers/offerEngine";
import { saveCustomer, getCustomer } from "@/utils/customerProfile";

type PaymentMode = "cash" | "online" | "both";

export type CheckoutMeta = {
  billType: "counter" | "table" | "takeaway";
  tableId?: string;
};

export function useBillingEngine(
  cartKey:
    | { type: "takeaway" }
    | { type: "table"; tableId: string }
) {
  const { data: running, setData: setRunning } = useRunningCarts();
  const { addBill } = useBills();
  const { data: settings } = useSettings();
  const { toast } = useToast();
  const { data: tokens, setData: setTokens } = useTokens();

  const cart =
    cartKey.type === "takeaway"
      ? running.takeaway
      : running.tables[cartKey.tableId] ?? [];

  const [discount, setDiscount] = useState(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("cash");
  const [onlineAmount, setOnlineAmount] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [couponCode, setCouponCode] = useState("");

  const updateCart = (newCart: BillItem[]) => {
    const updated =
      cartKey.type === "takeaway"
        ? { ...running, takeaway: newCart }
        : {
            ...running,
            tables: {
              ...running.tables,
              [cartKey.tableId]: newCart,
            },
          };

    setRunning(updated);
  };

  const addToCart = (item: BillItem) => {
    const existing = cart.find(
      (i) => i.productId === item.productId
    );

    let newCart;

    if (existing) {
      newCart = cart.map((i) =>
        i.productId === item.productId
          ? {
              ...i,
              quantity: i.quantity + 1,
              total: (i.quantity + 1) * i.price,
            }
          : i
      );
    } else {
      newCart = [...cart, item];
    }

    updateCart(newCart);
  };

  const updateQuantity = (productId: string, delta: number) => {
    const newCart = cart
      .map((i) =>
        i.productId === productId
          ? {
              ...i,
              quantity: i.quantity + delta,
              total: (i.quantity + delta) * i.price,
            }
          : i
      )
      .filter((i) => i.quantity > 0);

    updateCart(newCart);
  };

  const removeFromCart = (productId: string) => {
    updateCart(cart.filter((i) => i.productId !== productId));
  };

  const clearCart = () => {
    updateCart([]);
    setDiscount(0);
    setPaymentMode("cash");
    setOnlineAmount(0);
    setCustomerName("");
    setCustomerPhone("");
    setCouponCode("");
  };

  const subtotal = useMemo(
    () => cart.reduce((s, i) => s + i.total, 0),
    [cart]
  );

  const manualDiscountAmount = (subtotal * discount) / 100;

  const autoDiscountAmount = useMemo(() => {
    if (!settings.offers?.enabled) return 0;

    let customerProfile = null;

    if (customerPhone) {
      customerProfile =
        getCustomer(customerPhone) || {
          phone: customerPhone,
          name: customerName || undefined,
          totalBills: 0,
          totalSpend: 0,
          activeOffer: null,
        };
    }

    const previewSubtotal = subtotal - manualDiscountAmount;

    const result = processOffers({
      customer: customerProfile,
      subtotalAfterManualDiscount: previewSubtotal,
      finalBillTotal: previewSubtotal,
      couponCode,
      applyMode: settings.offers.applyMode ?? "AUTO",
      billId: "__PREVIEW__",
      offerSettings: settings.offers,
    });

    return result.discount || 0;
  }, [
    subtotal,
    manualDiscountAmount,
    couponCode,
    customerPhone,
    customerName,
    settings.offers,
  ]);

  const finalDiscountAmount =
    manualDiscountAmount + autoDiscountAmount;

  const afterDiscount = subtotal - finalDiscountAmount;

  let gstAmount = 0;
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  let total = afterDiscount;

  if (settings.gstOn) {
    const percent = settings.gstPercent;

    if (settings.gstMode === "EXCLUSIVE") {
      gstAmount = (afterDiscount * percent) / 100;
      total = afterDiscount + gstAmount;
    }

    if (settings.gstMode === "INCLUSIVE") {
      gstAmount =
        (afterDiscount * percent) / (100 + percent);
      total = afterDiscount;
    }

    if (settings.gstType === "CGST_SGST") {
      cgstAmount = gstAmount / 2;
      sgstAmount = gstAmount / 2;
    }

    if (settings.gstType === "IGST") {
      igstAmount = gstAmount;
    }
  }

  const cashAmount =
    paymentMode === "cash"
      ? total
      : paymentMode === "both"
      ? total - onlineAmount
      : 0;

  const checkout = async (
    meta: CheckoutMeta
  ): Promise<Bill | null> => {
    if (cart.length === 0) {
      toast({
        variant: "destructive",
        title: "Cart is empty",
      });
      return null;
    }

    const today = new Date().toISOString().split("T")[0];
    let currentToken = tokens;

    if (currentToken.date !== today) {
      currentToken = { date: today, count: 0 };
    }

    const tokenNumber = settings.tokenVisible
      ? currentToken.count + 1
      : undefined;

    if (settings.tokenVisible) {
      await setTokens({ ...currentToken, count: tokenNumber! });
    }

    let customerProfile = null;

    if (customerPhone) {
      customerProfile =
        getCustomer(customerPhone) || {
          phone: customerPhone,
          name: customerName || undefined,
          totalBills: 0,
          totalSpend: 0,
          activeOffer: null,
        };
    }

    let autoOfferDiscount = 0;

    if (settings.offers?.enabled) {
      const result = processOffers({
        customer: customerProfile,
        subtotalAfterManualDiscount: subtotal - manualDiscountAmount,
        finalBillTotal: total,
        couponCode,
        applyMode: settings.offers.applyMode ?? "AUTO",
        billId: nanoid(),
        offerSettings: settings.offers,
      });

      autoOfferDiscount = result.discount;
      result.toasts.forEach((t) => toast(t));
    }

    const finalDiscount = manualDiscountAmount + autoOfferDiscount;
    const finalAfterDiscount = subtotal - finalDiscount;

    let finalGstAmount = 0;
    let finalCgst = 0;
    let finalSgst = 0;
    let finalIgst = 0;
    let finalTotal = finalAfterDiscount;

if (settings.gstOn) {
  const percent = settings.gstPercent;

  if (settings.gstMode === "EXCLUSIVE") {
    finalGstAmount = (finalAfterDiscount * percent) / 100;
    finalTotal = finalAfterDiscount + finalGstAmount;
  }

  if (settings.gstMode === "INCLUSIVE") {
    finalGstAmount =
      (finalAfterDiscount * percent) / (100 + percent);
    finalTotal = finalAfterDiscount;
  }

  if (settings.gstType === "CGST_SGST") {
    finalCgst = finalGstAmount / 2;
    finalSgst = finalGstAmount / 2;
  }

  if (settings.gstType === "IGST") {
    finalIgst = finalGstAmount;
  }
}


    const bill: Bill = {
      id: nanoid(),
      dateISO: new Date().toISOString(),
      items: cart,
      subtotal,
      discount: finalDiscount,
      cgst: finalCgst,
      sgst: finalSgst,
      igst: finalIgst,
      gst: finalGstAmount,
      total: finalTotal,
      token: tokenNumber,
      paymentMode,
      billType: meta.billType,
      tableId: meta.tableId,
      customerName: customerName || "Guest Customer",
      customerPhone: customerPhone || undefined,
    };

    if (paymentMode === "online") {
      bill.onlineAmount = finalTotal;
    }

    if (paymentMode === "both") {
      bill.onlineAmount = onlineAmount;
      bill.cashAmount = finalTotal - onlineAmount;
    }

    if (paymentMode === "cash") {
      bill.cashAmount = finalTotal;
    }

    if (customerProfile) {
      customerProfile.totalBills += 1;
      customerProfile.totalSpend += finalTotal;
      customerProfile.lastVisitAt = new Date().toISOString();
      saveCustomer(customerProfile);
    }

    await addBill(bill);
    clearCart();

    return bill;
  };

  return {
    cart,
    discount,
    autoDiscountAmount,
    paymentMode,
    onlineAmount,
    customerName,
    customerPhone,
    couponCode,

    setDiscount,
    setPaymentMode,
    setOnlineAmount,
    setCustomerName,
    setCustomerPhone,
    setCouponCode,

    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    checkout,

    subtotal,
    manualDiscountAmount,
    gstAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    total,
    cashAmount,
  };
}

