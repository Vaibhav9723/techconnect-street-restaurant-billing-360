import { writeProductOnline } from "@/services/firestore/products";
import { writeCategoryOnline } from "@/services/firestore/categories";
import { addBillOnline } from "@/services/firestore/bills";
import { saveVendorSettings } from "@/services/firestore/settings";
import { Product, Category, Bill, Settings } from "@/types/schema";

export interface SyncResult {
  products: number;
  categories: number;
  bills: number;
  settings: boolean;
}

export async function flushUnsyncedData(
  uid: string,
  data: {
    products: Product[];
    categories: Category[];
    bills: Bill[];
    settings: Settings | null;
  }
): Promise<SyncResult> {
  const result: SyncResult = {
    products: 0,
    categories: 0,
    bills: 0,
    settings: false,
  };

  const unsyncedProducts = data.products.filter((p) => !p.isSynced);
  for (const product of unsyncedProducts) {
    try {
      await writeProductOnline(uid, product);
      result.products++;
    } catch (e) {
      console.error("Sync queue: product upload failed", product.id, e);
    }
  }

  const unsyncedCategories = data.categories.filter((c) => !c.isSynced);
  for (const category of unsyncedCategories) {
    try {
      await writeCategoryOnline(uid, category);
      result.categories++;
    } catch (e) {
      console.error("Sync queue: category upload failed", category.id, e);
    }
  }

  const unsyncedBills = data.bills.filter((b) => !b.isSynced);
  for (const bill of unsyncedBills) {
    try {
      await addBillOnline(uid, bill);
      result.bills++;
    } catch (e) {
      console.error("Sync queue: bill upload failed", bill.id, e);
    }
  }

  if (data.settings && !data.settings.isSynced) {
    try {
      await saveVendorSettings(uid, data.settings);
      result.settings = true;
    } catch (e) {
      console.error("Sync queue: settings upload failed", e);
    }
  }

  console.log("✅ Sync queue flushed:", result);
  return result;
}

export function markAllSynced<T extends { isSynced?: boolean }>(items: T[]): T[] {
  return items.map((item) => ({ ...item, isSynced: true }));
}