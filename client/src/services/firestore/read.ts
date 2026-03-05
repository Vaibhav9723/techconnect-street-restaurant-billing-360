import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { requireDB } from "./base";
import { Product, Category, Bill, Settings } from "@/types/schema";

export async function fetchProducts(uid: string): Promise<Product[]> {
  const db = requireDB();
  const snap = await getDocs(collection(db, "vendors", uid, "products"));

  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Product, "id">),
  }));
}

export async function fetchCategories(uid: string): Promise<Category[]> {
  const db = requireDB();
  const snap = await getDocs(collection(db, "vendors", uid, "categories"));

  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Category, "id">),
  }));
}

export async function fetchBills(uid: string): Promise<Bill[]> {
  const db = requireDB();
  const snap = await getDocs(collection(db, "vendors", uid, "bills"));

  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Bill, "id">),
  }));
}

// export async function fetchSettings(uid: string): Promise<Settings | null> {
//   const db = requireDB();

//   const mainSnap = await getDoc(
//     doc(db, "vendors", uid, "settings", "main")
//   );

//   const profileSnap = await getDoc(
//     doc(db, "vendors", uid, "settings", "profile")
//   );

//   if (!mainSnap.exists() || !profileSnap.exists()) return null;

//   return {
//     ...(profileSnap.data() as any), // vendor editable
//     ...(mainSnap.data() as any),    // admin locked (businessMode)
//   } as Settings;
// }

export async function fetchSettings(uid: string): Promise<Settings | null> {
  const db = requireDB();

  const snap = await getDoc(
    doc(db, "vendors", uid, "settings", "default")
  );

  if (!snap.exists()) return null;

  return snap.data() as Settings;
}


export async function fetchBillsAfter(
  uid: string,
  afterDate: string | null
): Promise<Bill[]> {
  const db = requireDB();

  const ref = collection(db, "vendors", uid, "bills");

  const q = afterDate
    ? query(ref, where("dateISO", ">", afterDate), orderBy("dateISO"))
    : query(ref, orderBy("dateISO"));

  const snap = await getDocs(q);

  return snap.docs.map(d => ({
    id: d.id,
    ...(d.data() as Omit<Bill, "id">),
  }));
}


