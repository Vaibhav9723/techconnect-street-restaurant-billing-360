// import { doc, setDoc } from "firebase/firestore";
// import { requireDB } from "./base";

// export type VendorProfileSettings = {
//   shopName: string;
//   gstOn: boolean;
//   gstPercent: number;
//   gstMode: "INCLUSIVE" | "EXCLUSIVE";
//   gstType: "CGST_SGST" | "IGST";
//   printLayout: "80mm" | "58mm";
//   theme: string;
//   primaryColor: string;
//   offers: any;
//   footerText?: string;
//   feedbackText?: string;
//   feedbackLink?: string;
// };

// export async function saveVendorSettings(
//   uid: string,
//   settings: VendorProfileSettings
// ) {
//   console.log("🔥 VENDOR SETTINGS SAVE", uid);
//   const db = requireDB();

//   await setDoc(
//     doc(db, "vendors", uid, "settings", "profile"),
//     settings,
//     { merge: true }
//   );
// }


// Ab me setting ka thik kar raha hu yaha se 

import { doc, setDoc } from "firebase/firestore";
import { requireDB } from "./base";
import { Settings } from "@/types/schema";

export async function saveVendorSettings(
  uid: string,
  settings: Settings
) {
  console.log("🔥 VENDOR SETTINGS SAVE", uid);

  const db = requireDB();

  await setDoc(
    doc(db, "vendors", uid, "settings", "default"),
    settings,
    { merge: true }
  );
}
