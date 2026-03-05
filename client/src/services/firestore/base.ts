import { collection, Firestore } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Ensure Firestore is initialized
 */
export function requireDB(): Firestore {
  if (!db) throw new Error("Firestore not initialized");
  return db;
}

/**
 * Vendor scoped collection helper
 */
export function vendorCollection(
  db: Firestore,
  uid: string,
  name: string
) {
  return collection(db, "vendors", uid, name);
}

/**
 * 🔒 CRITICAL: Remove undefined values (deep)
 * Firestore does NOT allow undefined at any level
 */
export function sanitizeForFirestore<T>(input: T): T {
  if (Array.isArray(input)) {
    return input
      .map(sanitizeForFirestore)
      .filter(v => v !== undefined) as T;
  }

  if (input && typeof input === "object") {
    const obj: any = {};
    Object.entries(input as any).forEach(([key, value]) => {
      if (value === undefined) return;
      obj[key] = sanitizeForFirestore(value);
    });
    return obj;
  }

  return input;
}
