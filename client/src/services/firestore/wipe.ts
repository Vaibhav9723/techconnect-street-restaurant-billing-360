import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { requireDB } from "./base";

/**
 * Delete ALL vendor data from Firebase (products, categories, bills, settings)
 */
export async function wipeFirebaseData(uid: string): Promise<void> {
  const db = requireDB();

  const subcollections = ["products", "categories", "bills", "settings"] as const;

  for (const name of subcollections) {
    const ref = collection(db, "vendors", uid, name);
    const snap = await getDocs(ref);

    if (snap.docs.length === 0) continue;

    let batch = writeBatch(db);
    let count = 0;

    for (const d of snap.docs) {
      batch.delete(doc(db, "vendors", uid, name, d.id));
      count++;

      if (count === 500) {
        await batch.commit();
        batch = writeBatch(db);
        count = 0;
      }
    }

    if (count > 0) {
      await batch.commit();
    }
  }
}