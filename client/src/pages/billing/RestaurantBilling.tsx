import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import VendorBilling from "./VendorBilling";
import TableCard from "./TableCard";
import { useBillingEngine } from "@/hooks/useBillingEngine";
import { useSettings } from "@/hooks/usePOSData";

type Mode = "table" | "takeaway";

export default function RestaurantBilling() {

  const [mode, setMode] = useState<Mode>("table");
  const [activeTableId, setActiveTableId] = useState<string | null>(null);

  const { data: settings } = useSettings();

  const tableCount = settings.tableCount ?? 5;

  const tables = useMemo(() => {
    return Array.from({ length: tableCount }, (_, i) => ({
      id: `T${i + 1}`,
      name: `T${i + 1}`,
    }));
  }, [tableCount]);

  const takeawayEngine = useBillingEngine({ type: "takeaway" });

  const tableEngine = useBillingEngine({
    type: "table",
    tableId: activeTableId || "T1",
  });

  const currentEngine =
    mode === "takeaway"
      ? takeawayEngine
      : activeTableId
      ? tableEngine
      : null;

  return (

<div className="flex flex-col md:flex-row h-[calc(100vh-4rem)]">

{/* ================= MOBILE HEADER ================= */}

{/* <div className="md:hidden border-b bg-background p-2">

<div className="flex gap-2 mb-2">

<Button
size="sm"
variant={mode === "table" ? "default" : "outline"}
onClick={() => setMode("table")}
className="flex-1"
>
Tables
</Button>

<Button
size="sm"
variant={mode === "takeaway" ? "default" : "outline"}
onClick={() => {
setMode("takeaway");
setActiveTableId(null);
}}
className="flex-1"
>
Takeaway
</Button>

</div>



{mode === "table" && (

<div className="flex gap-2 overflow-x-auto">

{tables.map((t) => (

<TableCard
key={t.id}
tableId={t.id}
name={t.name}
active={activeTableId === t.id}
onSelect={() => setActiveTableId(t.id)}
/>

))}

</div>

)}

</div> */}
{/* MOBILE HEADER */}
<div className="md:hidden border-b bg-background p-2">

<div className="flex gap-2 mb-2">

<Button
size="sm"
variant={mode === "table" ? "default" : "outline"}
onClick={() => setMode("table")}
className="flex-1"
>
Tables
</Button>

<Button
size="sm"
variant={mode === "takeaway" ? "default" : "outline"}
onClick={() => setMode("takeaway")}
className="flex-1"
>
Takeaway
</Button>

</div>
{/* <div className="flex gap-2 overflow-x-auto pb-1"> */}
{mode === "table" && (


<div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
{tables.map((t) => (

<TableCard
key={t.id}
tableId={t.id}
name={`Table ${t.id.replace("T","")}`}
active={activeTableId === t.id}
onSelect={() => setActiveTableId(t.id)}
/>

))}

</div>

)}

</div>


{/* ================= TABLET SIDEBAR ================= */}

<div className="hidden md:flex lg:hidden w-[180px] flex-col border-r bg-background p-2">

<div className="flex gap-2 mb-3">

<Button
size="sm"
variant={mode === "table" ? "default" : "outline"}
onClick={() => setMode("table")}
className="flex-1"
>
Tables
</Button>

<Button
size="sm"
variant={mode === "takeaway" ? "default" : "outline"}
onClick={() => setMode("takeaway")}
className="flex-1"
>
Takeaway
</Button>

</div>

{mode === "table" && (

<div className="flex flex-col gap-2 overflow-y-auto">

{tables.map((t) => (

<TableCard
key={t.id}
tableId={t.id}
name={t.name}
active={activeTableId === t.id}
onSelect={() => setActiveTableId(t.id)}
/>

))}

</div>

)}

</div>


{/* ================= DESKTOP SIDEBAR ================= */}

<div className="hidden lg:flex w-[260px] flex-col border-r bg-background p-3">

<div className="flex gap-2 mb-3">

<Button
size="sm"
variant={mode === "table" ? "default" : "outline"}
onClick={() => setMode("table")}
className="flex-1"
>
Tables
</Button>

<Button
size="sm"
variant={mode === "takeaway" ? "default" : "outline"}
onClick={() => setMode("takeaway")}
className="flex-1"
>
Takeaway
</Button>

</div>

{mode === "table" && (

<div className="flex flex-col gap-3 overflow-y-auto">

{tables.map((t) => (

<TableCard
key={t.id}
tableId={t.id}
// name={`Table ${t.id}`}
name={`Table ${t.id.replace("T","")}`}
active={activeTableId === t.id}
onSelect={() => setActiveTableId(t.id)}
/>

))}

</div>

)}

</div>




{/* ================= BILLING ================= */}

<div className="flex-1 overflow-hidden">

{currentEngine ? (

<VendorBilling
externalEngine={currentEngine}
billType={mode === "takeaway" ? "takeaway" : "table"}
tableId={activeTableId ?? undefined}
/>

) : (

<div className="flex items-center justify-center h-full text-muted-foreground">
Select table to start billing
</div>

)}

</div>

</div>

  );
}