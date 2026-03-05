import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DiscountPanelProps = {
  engine: {
    discount: number;
    setDiscount: (v: number) => void;
    autoDiscountAmount: number;
    couponCode: string;
    setCouponCode: (v: string) => void;
  };
  offersEnabled?: boolean;
};

export default function DiscountPanel({
  engine,
  offersEnabled,
}: DiscountPanelProps) {
  return (
    <div className="space-y-2">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          Discount
        </span>
      </div>

      {/* MANUAL DISCOUNT */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Input
            type="number"
            min={0}
            max={100}
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

        {engine.discount > 0 && (
          <span className="text-xs text-red-600 font-medium">
            Manual discount applied
          </span>
        )}
      </div>

      {/* COUPON (AUTO / MANUAL OFFER) */}
      {offersEnabled && (
        <Input
          placeholder="Coupon code"
          value={engine.couponCode}
          onChange={(e) => {
            engine.setCouponCode(e.target.value.toUpperCase());
            engine.setDiscount(0); // 🔥 manual discount disable
          }}
          className="h-8 text-xs"
        />
      )}

      {/* AUTO DISCOUNT PREVIEW */}
      {engine.autoDiscountAmount > 0 && (
        <div className="text-xs text-red-600">
          Auto Discount: − ₹{engine.autoDiscountAmount.toFixed(2)}
        </div>
      )}
    </div>
  );
}
