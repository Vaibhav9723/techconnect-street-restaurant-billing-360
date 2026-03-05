import { useState, useMemo } from "react";
import { useCategories, useSettings } from "@/hooks/useEncryptedStorage";
import { useProducts } from "@/hooks/usePOSData";
import { Category, Product, Bill } from "@/types/schema";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Minus, Trash2, X, Check } from "lucide-react";
import { InvoiceModal } from "@/components/invoice-modal";

import DiscountPanel from "@/components/billing/DiscountPanel";
import CartSummary from "@/components/billing/CartSummary";
import CustomerPanel from "@/components/billing/CustomerPanel";
import PaymentPanel from "@/components/billing/PaymentPanel";
import { useBillingEngine } from "@/hooks/useBillingEngine";

type VendorBillingProps = {
  externalEngine: ReturnType<typeof useBillingEngine>;
  billType?: "counter" | "table" | "takeaway";
  tableId?: string;
  onCheckoutDone?: () => void;
};

export default function VendorBilling({
  externalEngine,
  billType = "counter",
  tableId,
  onCheckoutDone,
}: VendorBillingProps) {
  const { data: products } = useProducts();
  const { data: categories } = useCategories();
  const { data: settings } = useSettings();

  const engine = externalEngine; // ✅ ONLY THIS
  const [showManualDiscount, setShowManualDiscount] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);


  const activeProducts = useMemo(
    () => products.filter((p: Product) => !p.isDeleted),
    [products]
  );
  const [mobileView, setMobileView] = useState<"bill" | "cart">("bill");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [completedBill, setCompletedBill] = useState<Bill | null>(null);


  const filteredProducts = useMemo(() => {
    return activeProducts.filter((p) => {
      const matchesSearch = p.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesCategory =
        !selectedCategory || p.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [activeProducts, search, selectedCategory]);

  const getCartQuantity = (productId: string) =>
    engine.cart.find((i) => i.productId === productId)?.quantity || 0;

  return (
<>
  {/* ================= DESKTOP ================= */}
  <div className="hidden md:flex h-[calc(100vh-4rem)]">

    {/* PRODUCTS PANEL */}
    <div className="flex-1 flex flex-col p-6 overflow-hidden">

      {/* Search */}
      <div className="mb-4 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products"
          className="h-12 pl-12"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-3">
        <Button
          size="sm"
          variant={!selectedCategory ? "default" : "outline"}
          onClick={() => setSelectedCategory(null)}
        >
          All
        </Button>

        {categories.map((c) => (
          <Button
            key={c.id}
            size="sm"
            variant={selectedCategory === c.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(c.id)}
          >
            {c.name}
          </Button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto">
        {/* <div className="grid grid-cols-3 xl:grid-cols-4 gap-4"> */}
        {/* <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"> */}
        {/* <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"> */}
        <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filteredProducts.map((p) => {
            const qty = getCartQuantity(p.id);

            return (
              <Card
                key={p.id}
                className="relative h-36 p-3 flex flex-col justify-between cursor-pointer"
                onClick={() =>
                  engine.addToCart({
                    productId: p.id,
                    productName: p.name,
                    price: p.price,
                    quantity: 1,
                    total: p.price,
                  })
                }
              >
                {qty > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 text-xs font-bold">
                    {qty}
                  </Badge>
                )}

                <div>
                  <h3 className="text-sm font-medium line-clamp-2">
                    {p.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    ₹{p.price.toFixed(2)}
                  </p>
                </div>

                <Button size="sm" className="w-full">
                  Add
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </div>

    {/* CART PANEL */}
    {/* <div className="w-[420px] border-l flex flex-col bg-card"> */}
    {/* <div className="w-[320px] md:w-[340px] lg:w-[360px] xl:w-[420px] border-l flex flex-col bg-card"> */}
    <div className="w-[300px] lg:w-[360px] xl:w-[420px] border-l flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b flex justify-between">
        <h2 className="font-semibold">Cart</h2>

        {engine.cart.length > 0 && (
          <Button size="sm" variant="ghost" onClick={engine.clearCart}>
            <X className="h-4 w-4 mr-1" /> Clear
          </Button>
        )}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {engine.cart.map((item) => (
          <Card key={item.productId} className="p-3">
            <div className="flex justify-between">
              <h4 className="text-sm font-medium">
                {item.productName}
              </h4>

              <Button
                size="icon"
                variant="ghost"
                onClick={() =>
                  engine.removeFromCart(item.productId)
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex justify-between items-center mt-2">
              <div className="flex gap-2 items-center">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() =>
                    engine.updateQuantity(item.productId, -1)
                  }
                >
                  <Minus className="h-3 w-3" />
                </Button>

                <span className="w-6 text-center text-sm">
                  {item.quantity}
                </span>

                <Button
                  size="icon"
                  variant="outline"
                  onClick={() =>
                    engine.updateQuantity(item.productId, 1)
                  }
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <span className="font-semibold text-sm">
                ₹{item.total.toFixed(2)}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* SUMMARY + PAYMENT */}
      <div className="border-t p-4 space-y-3 bg-background sticky bottom-0">

        <CartSummary
          subtotal={engine.subtotal}
          manualDiscount={engine.manualDiscountAmount}
          autoDiscount={engine.autoDiscountAmount}
          gstAmount={engine.gstAmount}
          cgstAmount={engine.cgstAmount}
          sgstAmount={engine.sgstAmount}
          igstAmount={engine.igstAmount}
          total={engine.total}
          gstEnabled={settings.gstOn}
        />
        {/* 🔥 Manual / Coupon Toggle (Desktop bhi) */}
<div className="space-y-2">

  <div className="flex items-center justify-between">
    <span className="text-xs font-medium text-muted-foreground">
      Discount
    </span>

    <Button
      size="sm"
      variant="ghost"
      className="h-7 px-2 text-xs"
      onClick={() => {
        setShowDiscount(v => !v);
        engine.setDiscount(0);
        engine.setCouponCode("");
      }}
    >
      {showDiscount ? "Use Coupon" : "Manual"}
    </Button>
  </div>

  {showDiscount && (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1">
        <Input
          type="number"
          min="0"
          max="100"
          value={engine.discount}
          onChange={(e) =>
            engine.setDiscount(
              Math.min(100, Math.max(0, Number(e.target.value)))
            )
          }
          className="h-8 w-16 text-right text-xs"
          placeholder="%"
        />
        <span className="text-xs text-muted-foreground">%</span>
      </div>

      <span className="text-xs font-medium text-red-600 tabular-nums">
        − ₹{engine.manualDiscountAmount.toFixed(2)}
      </span>
    </div>
  )}

  {!showDiscount && settings.offers?.enabled && (
    <Input
      placeholder="Enter coupon code"
      value={engine.couponCode}
      onChange={(e) => {
        engine.setCouponCode(e.target.value.toUpperCase());
        engine.setDiscount(0);
      }}
      className="h-8 text-xs"
    />
  )}

</div>


        {/* <DiscountPanel engine={engine} /> */}
        
        <CustomerPanel engine={engine} />
        <PaymentPanel engine={engine} />

        <Button
          className="w-full h-11"
          disabled={engine.cart.length === 0}
          onClick={async () => {
            const bill = await engine.checkout({
              billType,
              tableId,
            });

            if (bill) {
              setCompletedBill(bill);
              onCheckoutDone?.();
            }
          }}
        >
          <Check className="h-4 w-4 mr-2" />
          Checkout
        </Button>
      </div>
    </div>
  </div>

{/* ================= MOBILE ================= */}
<div className="md:hidden flex flex-col h-[calc(100vh-4rem)] bg-background">
  {/* <div className="md:hidden fixed inset-0 bottom-16 flex flex-col bg-background"> */}


  {/* 🔝 Tabs */}
  {/* <div className="grid grid-cols-2 border-b bg-card"> */}
    <div className="sticky top-0 z-20 grid grid-cols-2 border-b bg-card">

    <button
      className={`py-3 text-sm font-semibold border-b-2 ${
        mobileView === "bill"
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground"
      }`}
      onClick={() => setMobileView("bill")}
    >
      Bill
    </button>

    <button
      className={`py-3 text-sm font-semibold border-b-2 ${
        mobileView === "cart"
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground"
      }`}
      onClick={() => setMobileView("cart")}
    >
      Cart
      {engine.cart.length > 0 && (
        <Badge className="ml-2">
          {engine.cart.length}
        </Badge>
      )}
    </button>
  </div>

  {/* ================= BILL (PRODUCTS) ================= */}
  {mobileView === "bill" && (
    <div className="flex-1 overflow-y-auto p-3 space-y-3">

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search product"
          className="h-10 pl-10 text-sm"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          size="sm"
          variant={!selectedCategory ? "default" : "outline"}
          onClick={() => setSelectedCategory(null)}
        >
          All
        </Button>

        {categories.map((c) => (
          <Button
            key={c.id}
            size="sm"
            variant={selectedCategory === c.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(c.id)}
          >
            {c.name}
          </Button>
        ))}
      </div>

      {/* Products */}
      <div className="grid grid-cols-2 gap-3 pb-20">
        {filteredProducts.map((p) => {
          const qty = getCartQuantity(p.id);

          return (
            <Card
              key={p.id}
              className="relative p-3 h-36 flex flex-col justify-between"
              onClick={() =>
                engine.addToCart({
                  productId: p.id,
                  productName: p.name,
                  price: p.price,
                  quantity: 1,
                  total: p.price,
                })
              }
            >
              {qty > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {qty}
                </Badge>
              )}

              <div>
                <h3 className="text-sm font-medium line-clamp-2">
                  {p.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  ₹{p.price.toFixed(2)}
                </p>
              </div>

              <Button size="sm" className="w-full">
                Add
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  )}

  {/* ================= CART ================= */}
  {mobileView === "cart" && (
    // <div className="flex flex-col flex-1">
    <div className="flex flex-col flex-1 min-h-0">

      {/* Items */}
      {/* <div className="flex-1 overflow-y-auto p-3 space-y-2"> */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {engine.cart.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Cart is empty
          </div>
        ) : (
          engine.cart.map((item) => (
            <Card key={item.productId} className="p-3">
              <div className="flex justify-between">
                <h4 className="text-sm font-medium">
                  {item.productName}
                </h4>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() =>
                    engine.removeFromCart(item.productId)
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex justify-between items-center mt-2">
                <div className="flex gap-2 items-center">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() =>
                      engine.updateQuantity(item.productId, -1)
                    }
                  >
                    <Minus className="h-3 w-3" />
                  </Button>

                  <span>{item.quantity}</span>

                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() =>
                      engine.updateQuantity(item.productId, 1)
                    }
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                <span className="font-semibold text-sm">
                  ₹{item.total.toFixed(2)}
                </span>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Summary + Payment */}
      <div className="border-t p-3 pb-20 bg-background space-y-3 sticky bottom-0">
        <CartSummary
          subtotal={engine.subtotal}
          manualDiscount={engine.manualDiscountAmount}
          autoDiscount={engine.autoDiscountAmount}
          gstAmount={engine.gstAmount}
          cgstAmount={engine.cgstAmount}
          sgstAmount={engine.sgstAmount}
          igstAmount={engine.igstAmount}
          total={engine.total}
          gstEnabled={settings.gstOn}
        />
        

        {/* <DiscountPanel engine={engine} /> */}
        <div className="space-y-2">

  {/* Toggle Row */}
  <div className="flex items-center justify-between">
    <span className="text-xs font-medium text-muted-foreground">
      Discount
    </span>

    <Button
      size="sm"
      variant="ghost"
      className="h-7 px-2 text-xs"
      onClick={() => {
        setShowDiscount(v => !v);
        engine.setDiscount(0);
        engine.setCouponCode("");
      }}
    >
      {showDiscount ? "Use Coupon" : "Manual"}
    </Button>
  </div>

  {/* Manual Discount */}
  {showDiscount && (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1">
        <Input
          type="number"
          min="0"
          max="100"
          value={engine.discount}
          onChange={(e) =>
            engine.setDiscount(
              Math.min(100, Math.max(0, Number(e.target.value)))
            )
          }
          className="h-8 w-16 text-right text-xs"
          placeholder="%"
        />
        <span className="text-xs text-muted-foreground">%</span>
      </div>

      <span className="text-xs font-medium text-red-600 tabular-nums">
        − ₹{engine.manualDiscountAmount.toFixed(2)}
      </span>
    </div>
  )}

  {/* Coupon Mode */}
  {!showDiscount && settings.offers?.enabled && (
    <Input
      placeholder="Enter coupon code"
      value={engine.couponCode}
      onChange={(e) => {
        engine.setCouponCode(e.target.value.toUpperCase());
        engine.setDiscount(0);
      }}
      className="h-8 text-xs"
    />
  )}
</div>

        <CustomerPanel engine={engine} />
        <PaymentPanel engine={engine} />

        <Button
          className="w-full"
          disabled={engine.cart.length === 0}
          onClick={async () => {
            const bill = await engine.checkout({
              billType,
              tableId,
            });

            // if (bill) {
            //   setCompletedBill(bill);
            //   onCheckoutDone?.();
            // }
            if (bill) {
              setCompletedBill(bill);

              // engine.clearCart();        // 🔥 ADD THIS
              setMobileView("bill");     // 🔥 ADD THIS (mobile fix)

              onCheckoutDone?.();
            }
          }}
        >
          Checkout
        </Button>
      </div>
    </div>
  )}
</div>

{completedBill && (
  <InvoiceModal
    bill={completedBill}
    settings={settings}
    onClose={() => setCompletedBill(null)}
  />
)}

</>


  );
}


