import { useEffect, useState } from "react";
import { Dialog, DialogContent,DialogDescription,DialogTitle } from "@/components/ui/dialog";

export default function SubscriptionExpiryModal() {
  const [open, setOpen] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const handler = () => {
      const days = parseInt(localStorage.getItem("subscription_days_left") || "0", 10);
      setDaysLeft(days);
      setOpen(true);
    };

    // On login (flag set)
    if (localStorage.getItem("show_expiry_modal") === "1") {
      handler();
      localStorage.removeItem("show_expiry_modal");
    }

    // On auto 3 hour event
    window.addEventListener("subscription-expiry-warning", handler);

    return () => {
      window.removeEventListener("subscription-expiry-warning", handler);
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="space-y-4 text-center">
        {/* <h2 className="text-xl font-bold text-red-600">Subscription Expiring Soon</h2> */}
        <DialogTitle className="text-xl font-bold text-red-600">
          Subscription Expiring Soon
        </DialogTitle>
        {/* <p className="text-sm"> */}
           <DialogDescription>
            Your subscription will expire in <b>{daysLeft}</b> days.  
            Please renew to avoid service interruption.
          </DialogDescription>
          
        {/* </p> */}

        <button
          onClick={() => setOpen(false)}
          className="w-full py-2 bg-primary text-white rounded"
        >
          OK
        </button>
      </DialogContent>
    </Dialog>
  );
}
