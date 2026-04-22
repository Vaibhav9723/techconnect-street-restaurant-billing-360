import { doc, setDoc } from "firebase/firestore";
import { requireDB, sanitizeForFirestore } from "./base";
import { Settings } from "@/types/schema";

export async function saveVendorSettings(
  uid: string,
  settings: Settings
) {
  console.log("🔥 VENDOR SETTINGS SAVE", uid);

  const db = requireDB();

  // 🔒 sanitize before Firestore + add updatedAt
  const safeSettings = sanitizeForFirestore({
    ...settings,
    updatedAt: Date.now(),
  });

  await setDoc(
    doc(db, "vendors", uid, "settings", "default"),
    safeSettings,
    { merge: true }
  );
}