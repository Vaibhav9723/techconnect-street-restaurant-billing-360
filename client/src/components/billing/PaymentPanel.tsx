import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type PaymentPanelProps = {
  engine: {
    paymentMode: "cash" | "online" | "both";
    onlineAmount: number;
    setPaymentMode: (v: "cash" | "online" | "both") => void;
    setOnlineAmount: (v: number) => void;
    total: number;
    cashAmount: number;
  };
};

export default function PaymentPanel({ engine }: PaymentPanelProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium">Payment Mode</label>

      <Select
        value={engine.paymentMode}
        onValueChange={engine.setPaymentMode}
      >
        <SelectTrigger className="h-9 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="cash">Cash</SelectItem>
          <SelectItem value="online">Online</SelectItem>
          <SelectItem value="both">Both</SelectItem>
        </SelectContent>
      </Select>

      {engine.paymentMode === "both" && (
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            value={engine.onlineAmount}
            onChange={(e) =>
              engine.setOnlineAmount(
                Math.min(
                  engine.total,
                  Math.max(0, Number(e.target.value))
                )
              )
            }
            placeholder="Online amount"
            className="h-8 text-xs"
          />

          <Input
            value={engine.cashAmount.toFixed(2)}
            disabled
            className="h-8 text-xs bg-muted"
          />
        </div>
      )}
    </div>
  );
}
