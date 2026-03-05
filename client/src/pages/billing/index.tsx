import VendorBilling from "./VendorBilling";
import RestaurantBilling from "./RestaurantBilling";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useBillingEngine } from "@/hooks/useBillingEngine";
import { useSettings } from "@/hooks/usePOSData";

export default function Billing() {
  const { userProfile, loading } = useFirebaseAuth();
  console.log("Business Mode:", userProfile?.businessMode);
  const { data: settings } = useSettings();

  const businessMode =
  userProfile?.businessMode ||
  settings?.businessMode ||
  "vendor";

  // if (loading || !userProfile) {
  //   return <div className="p-6">Loading POS…</div>;
  // }
  if (loading) {
    return <div className="p-6">Loading POS…</div>;
  }

  // 🔥 OFFLINE SAFE
  // const businessMode =userProfile?.businessMode || "vendor";

  // 🔥 ALWAYS call hook (no conditional)
  const vendorEngine = useBillingEngine({ type: "takeaway" });

  // if (userProfile.businessMode === "restaurant")
  if (businessMode === "restaurant") 
  {
    return <RestaurantBilling />;
  }

  return (
    <VendorBilling
      externalEngine={vendorEngine}
      billType="counter"
    />
  );
}
