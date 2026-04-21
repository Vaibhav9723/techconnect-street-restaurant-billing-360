// ─── FILE: client/src/services/sync/flushQueue.ts ──────────────────

import { writeProductOnline } from "@/services/firestore/products";
import { writeCategoryOnline } from "@/services/firestore/categories";
import { addBillOnline } from "@/services/firestore/bills";
import { saveVendorSettings } from "@/services/firestore/settings";
import { Product, Category, Bill, Settings } from "@/types/schema";

export interface SyncResult {
  uploadedProductIds: string[];
  uploadedCategoryIds: string[];
  uploadedBillIds: string[];
  settingsUploaded: boolean;
}

export interface FlushInput {
  products: Product[];
  categories: Category[];
  bills: Bill[];
  settings: Settings | null;
}

function buildIdMap<T extends { id: string }>(items: T[]): Map<string, T> {
  const map = new Map<string, T>();
  for (const item of items) map.set(item.id, item);
  return map;
}

function needsUpload<T extends { id: string; updatedAt?: number }>(
  local: T,
  remoteMap: Map<string, T>
): boolean {
  const remote = remoteMap.get(local.id);
  if (!remote) return true;
  return (local.updatedAt ?? 0) > (remote.updatedAt ?? 0);
}

async function flushType<T extends { id: string; updatedAt?: number }>(
  uid: string,
  items: T[],
  remoteMap: Map<string, T>,
  uploadFn: (uid: string, item: T) => Promise<void>
): Promise<string[]> {
  const uploaded: string[] = [];
  for (const item of items) {
    if (needsUpload(item, remoteMap)) {
      try {
        await uploadFn(uid, item);
        uploaded.push(item.id);
      } catch (e) {
        console.error("Flush upload failed", item.id, e);
      }
    }
  }
  return uploaded;
}

export async function flushUnsyncedData(
  uid: string,
  local: FlushInput,
  remote: FlushInput
): Promise<SyncResult> {
  const result: SyncResult = {
    uploadedProductIds: [],
    uploadedCategoryIds: [],
    uploadedBillIds: [],
    settingsUploaded: false,
  };

  const remoteProductMap = buildIdMap(remote.products);
  const remoteCategoryMap = buildIdMap(remote.categories);
  const remoteBillMap = buildIdMap(remote.bills);

  const [productIds, categoryIds, billIds] = await Promise.all([
    flushType(uid, local.products, remoteProductMap, writeProductOnline),
    flushType(uid, local.categories, remoteCategoryMap, writeCategoryOnline),
    flushType(uid, local.bills, remoteBillMap, addBillOnline),
  ]);

  result.uploadedProductIds = productIds;
  result.uploadedCategoryIds = categoryIds;
  result.uploadedBillIds = billIds;

  if (local.settings) {
    const localTime = local.settings.updatedAt ?? 0;
    const remoteTime = remote.settings?.updatedAt ?? 0;
    if (!remote.settings || localTime > remoteTime) {
      try {
        await saveVendorSettings(uid, local.settings);
        result.settingsUploaded = true;
      } catch (e) {
        console.error("Flush: settings upload failed", e);
      }
    }
  }

  return result;
}