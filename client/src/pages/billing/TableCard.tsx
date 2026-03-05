import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBillingEngine } from "@/hooks/useBillingEngine";

interface TableCardProps {
  tableId: string;
  name: string;
  active: boolean;
  onSelect: () => void;
}

export default function TableCard({
  tableId,
  name,
  active,
  onSelect,
}: TableCardProps) {

  const engine = useBillingEngine({
    type: "table",
    tableId,
  });

  const occupied = engine.cart.length > 0;

  return (

<Card
onClick={onSelect}
className={`cursor-pointer border-2 transition-all
p-3 min-w-[80px]

${active
  ? "border-blue-500"
  : occupied
  ? "border-red-500 bg-red-600 text-white"
  : "border-green-500 bg-green-600 text-white"
}
`}
>

{/* DESKTOP + TABLET */}
<div className="hidden md:flex flex-col">

<div className="flex justify-between items-center">

<span className="font-semibold text-sm">
{name}
</span>

{occupied && (
<Badge className="text-[10px] bg-white text-red-600">
Occupied
</Badge>
)}

</div>

<div className="text-sm mt-2 font-medium">
₹ {engine.total.toFixed(2)}
</div>

</div>


{/* MOBILE */}
<div className="flex md:hidden justify-between items-center gap-3">

<span className="font-semibold text-sm">
{name.replace("Table ","T")}
</span>

<span className="text-xs font-medium">
₹{engine.total.toFixed(0)}
</span>

</div>

</Card>

  );
}
