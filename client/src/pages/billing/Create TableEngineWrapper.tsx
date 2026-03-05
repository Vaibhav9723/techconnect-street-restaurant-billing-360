import { useBillingEngine } from "@/hooks/useBillingEngine";
import VendorBilling from "./VendorBilling";

export default function TableEngineWrapper({
  tableId,
}: {
  tableId: string;
}) {
  const engine = useBillingEngine({
    type: "table",
    tableId,
  });

  return (
    <VendorBilling
      externalEngine={engine}
      billType="table"
      tableId={tableId}
    />
  );
}
