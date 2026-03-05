import { Input } from "@/components/ui/input";

type CustomerPanelProps = {
  engine: {
    customerName: string;
    customerPhone: string;
    setCustomerName: (v: string) => void;
    setCustomerPhone: (v: string) => void;
  };
};

export default function CustomerPanel({ engine }: CustomerPanelProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Input
        value={engine.customerName}
        onChange={(e) => engine.setCustomerName(e.target.value)}
        placeholder="Customer name"
        className="h-9 text-sm"
      />

      <Input
        value={engine.customerPhone}
        onChange={(e) =>
          engine.setCustomerPhone(e.target.value.replace(/\D/g, ""))
        }
        placeholder="WhatsApp number"
        maxLength={10}
        inputMode="numeric"
        className="h-9 text-sm"
      />
    </div>
  );
}
