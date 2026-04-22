// import { writeProductOnline } from "@/services/firestore/products";
// import { writeCategoryOnline } from "@/services/firestore/categories";
// import { addBillOnline } from "@/services/firestore/bills";
// // import { saveSettings } from "@/services/firestore/settings";
// import { saveVendorSettings } from "@/services/firestore/settings";


// export async function migrateOfflineDataToOnline(
//   uid: string,
//   data: {
//     products: any[];
//     categories: any[];
//     bills: any[];
//     settings: any;
//   }
// ) {
//   // 🔹 Products (one by one)
//   for (const product of data.products) {
//     await writeProductOnline(uid, product);
//   }

//   // 🔹 Categories (one by one)
//   for (const category of data.categories) {
//     await writeCategoryOnline(uid, category);
//   }

//   // 🔹 Bills (append-only)
//   for (const bill of data.bills) {
//     await addBillOnline(uid, bill);
//   }

//   // 🔹 Settings (single doc)
//   // await saveSettings(uid, data.settings);
//    if (data.settings) {
//     const { businessMode, ...vendorSettings } = data.settings;
//     await saveVendorSettings(uid, vendorSettings);
//   }

// }

import { writeProductOnline } from "@/services/firestore/products";
import { writeCategoryOnline } from "@/services/firestore/categories";
import { addBillOnline } from "@/services/firestore/bills";
import { saveVendorSettings } from "@/services/firestore/settings";
import {
  fetchProducts,
  fetchCategories,
  fetchBills,
  fetchSettings,
} from "@/services/firestore/read";

export async function migrateOfflineDataToOnline(
  uid: string,
  data: {
    products: any[];
    categories: any[];
    bills: any[];
    settings: any;
  }
) {
  // Fetch existing remote data to avoid overwriting newer remote versions
  const [remoteProducts, remoteCategories, remoteBills] = await Promise.all([
    fetchProducts(uid).catch(() => [] as any[]),
    fetchCategories(uid).catch(() => [] as any[]),
    fetchBills(uid).catch(() => [] as any[]),
  ]);

  // Build lookup maps: id → updatedAt
  const remoteProductMap = new Map(remoteProducts.map((p: any) => [p.id, p.updatedAt ?? 0]));
  const remoteCategoryMap = new Map(remoteCategories.map((c: any) => [c.id, c.updatedAt ?? 0]));
  const remoteBillIds = new Set(remoteBills.map((b: any) => b.id));

  // Upload products: only if missing from remote OR local is newer
  for (const product of data.products) {
    const remoteTime = remoteProductMap.get(product.id);
    const localTime = product.updatedAt ?? 0;

    if (remoteTime === undefined || localTime > remoteTime) {
      await writeProductOnline(uid, product);
    }
  }

  // Upload categories: only if missing from remote OR local is newer
  for (const category of data.categories) {
    const remoteTime = remoteCategoryMap.get(category.id);
    const localTime = category.updatedAt ?? 0;

    if (remoteTime === undefined || localTime > remoteTime) {
      await writeCategoryOnline(uid, category);
    }
  }

  // Upload bills: only if missing from remote (bills are append-only)
  for (const bill of data.bills) {
    if (!remoteBillIds.has(bill.id)) {
      await addBillOnline(uid, bill);
    }
  }

  // Settings: upload only if local is newer or no remote settings exist
  if (data.settings) {
    const remoteSettings = await fetchSettings(uid).catch(() => null);
    const localTime = data.settings.updatedAt ?? 0;
    const remoteTime = remoteSettings?.updatedAt ?? 0;

    if (!remoteSettings || localTime > remoteTime) {
      const { businessMode, ...vendorSettings } = data.settings;
      await saveVendorSettings(uid, vendorSettings);
    }
  }
}