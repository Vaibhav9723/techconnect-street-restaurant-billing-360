import { writeProductOnline } from "@/services/firestore/products";
import { writeCategoryOnline } from "@/services/firestore/categories";
import { addBillOnline } from "@/services/firestore/bills";
// import { saveSettings } from "@/services/firestore/settings";
import { saveVendorSettings } from "@/services/firestore/settings";


export async function migrateOfflineDataToOnline(
  uid: string,
  data: {
    products: any[];
    categories: any[];
    bills: any[];
    settings: any;
  }
) {
  // 🔹 Products (one by one)
  for (const product of data.products) {
    await writeProductOnline(uid, product);
  }

  // 🔹 Categories (one by one)
  for (const category of data.categories) {
    await writeCategoryOnline(uid, category);
  }

  // 🔹 Bills (append-only)
  for (const bill of data.bills) {
    await addBillOnline(uid, bill);
  }

  // 🔹 Settings (single doc)
  // await saveSettings(uid, data.settings);
   if (data.settings) {
    const { businessMode, ...vendorSettings } = data.settings;
    await saveVendorSettings(uid, vendorSettings);
  }

}
