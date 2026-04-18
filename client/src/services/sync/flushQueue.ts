import { writeProductOnline } from "@/services/firestore/products";
import { writeCategoryOnline } from "@/services/firestore/categories";
import { addBillOnline } from "@/services/firestore/bills";
import { saveVendorSettings } from "@/services/firestore/settings";
import { Product, Category, Bill, Settings } from "@/types/schema";

export interface SyncResult {
  syncedProductIds: string[];
  syncedCategoryIds: string[];
  syncedBillIds: string[];
  settingsSynced: boolean;
}

export interface FlushInput {
  products: Product[];
  categories: Category[];
  bills: Bill[];
  settings: Settings | null;
}

// ─── Helpers ────────────────────────────────────────────────────────

function buildIdMap<T extends { id: string }>(items: T[]): Map<string, T> {
  const map = new Map<string, T>();
  for (const item of items) map.set(item.id, item);
  return map;
}

/**
 * Determine if a local item needs to be uploaded to remote.
 * Returns true when:
 *  - Item does not exist on remote (missing by id)
 *  - Local updatedAt > remote updatedAt (local is newer)
 *
 * Handles deleted items correctly:
 *  - Soft-deleted local item with higher updatedAt → upload (propagate deletion)
 *  - Non-deleted local item → upload if newer or missing
 */
function needsUpload<T extends { id: string; updatedAt?: number }>(
  local: T,
  remoteMap: Map<string, T>
): boolean {
  const remote = remoteMap.get(local.id);
  if (!remote) return true; // Missing from remote
  const lTime = local.updatedAt ?? 0;
  const rTime = remote.updatedAt ?? 0;
  return lTime > rTime; // Local is newer
}

// ─── Per-type flush functions ───────────────────────────────────────

async function flushProducts(
  uid: string,
  products: Product[],
  remoteMap: Map<string, Product>
): Promise<string[]> {
  const synced: string[] = [];
  for (const product of products) {
    if (needsUpload(product, remoteMap)) {
      try {
        await writeProductOnline(uid, product);
        synced.push(product.id);
      } catch (e) {
        console.error("Flush: product upload failed", product.id, e);
      }
    }
  }
  return synced;
}

async function flushCategories(
  uid: string,
  categories: Category[],
  remoteMap: Map<string, Category>
): Promise<string[]> {
  const synced: string[] = [];
  for (const category of categories) {
    if (needsUpload(category, remoteMap)) {
      try {
        await writeCategoryOnline(uid, category);
        synced.push(category.id);
      } catch (e) {
        console.error("Flush: category upload failed", category.id, e);
      }
    }
  }
  return synced;
}

async function flushBills(
  uid: string,
  bills: Bill[],
  remoteMap: Map<string, Bill>
): Promise<string[]> {
  const synced: string[] = [];
  for (const bill of bills) {
    if (needsUpload(bill, remoteMap)) {
      try {
        await addBillOnline(uid, bill);
        synced.push(bill.id);
      } catch (e) {
        console.error("Flush: bill upload failed", bill.id, e);
      }
    }
  }
  return synced;
}

// ─── Main flush function ────────────────────────────────────────────

export async function flushUnsyncedData(
  uid: string,
  local: FlushInput,
  remote: FlushInput
): Promise<SyncResult> {
  const result: SyncResult = {
    syncedProductIds: [],
    syncedCategoryIds: [],
    syncedBillIds: [],
    settingsSynced: false,
  };

  const remoteProductMap = buildIdMap(remote.products);
  const remoteCategoryMap = buildIdMap(remote.categories);
  const remoteBillMap = buildIdMap(remote.bills);

  // Upload products, categories, bills in parallel (each type sequential internally)
  const [productIds, categoryIds, billIds] = await Promise.all([
    flushProducts(uid, local.products, remoteProductMap),
    flushCategories(uid, local.categories, remoteCategoryMap),
    flushBills(uid, local.bills, remoteBillMap),
  ]);

  result.syncedProductIds = productIds;
  result.syncedCategoryIds = categoryIds;
  result.syncedBillIds = billIds;

  // Settings: latest updatedAt wins
  if (local.settings) {
    const localTime = local.settings.updatedAt ?? 0;
    const remoteTime = remote.settings?.updatedAt ?? 0;
    if (!remote.settings || localTime > remoteTime) {
      try {
        await saveVendorSettings(uid, local.settings);
        result.settingsSynced = true;
      } catch (e) {
        console.error("Flush: settings upload failed", e);
      }
    }
  }

  console.log("✅ Flush complete:", {
    products: result.syncedProductIds.length,
    categories: result.syncedCategoryIds.length,
    bills: result.syncedBillIds.length,
    settings: result.settingsSynced,
  });

  return result;
}

// ─── Synced marking helpers ─────────────────────────────────────────

/**
 * Mark only the items whose ids are in syncedIds as isSynced: true.
 * Items not in syncedIds keep their original isSynced value.
 */
export function markItemsSynced<T extends { id: string; isSynced?: boolean }>(
  items: T[],
  syncedIds: Set<string>
): T[] {
  return items.map((item) =>
    syncedIds.has(item.id) ? { ...item, isSynced: true } : item
  );
}

/**
 * Mark all items as isSynced: true.
 * Use only when you are certain all items are on remote.
 */
export function markAllSynced<T extends { isSynced?: boolean }>(items: T[]): T[] {
  return items.map((item) => ({ ...item, isSynced: true }));
}