import { doc, setDoc } from "firebase/firestore";
import { Bill } from "@/types/schema";
import { requireDB, sanitizeForFirestore } from "./base";

/**
 * Append-only bill write (ONLINE)
 * - Guest safe
 * - Undefined safe
 * - Offline-first compatible
 */
export async function addBillOnline(uid: string, bill: Bill) {
  const db = requireDB();

  // 🔒 sanitize before Firestore
  const safeBill = sanitizeForFirestore({
    ...bill,
    updatedAt: Date.now(), // 🔥 future-proof (sync safety)
  });

  await setDoc(
    doc(db, "vendors", uid, "bills", bill.id),
    safeBill,
    { merge: false } // bills are append-only
  );
}

