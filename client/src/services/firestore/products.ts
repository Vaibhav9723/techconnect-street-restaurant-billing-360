import { doc, setDoc } from "firebase/firestore";
import { Product } from "@/types/schema";
import { requireDB } from "./base";

export async function writeProductOnline(
  uid: string,
  product: Product
) {
  const db = requireDB();
  await setDoc(
    doc(db, "vendors", uid, "products", product.id),
    product,
    { merge: true }
  );
}
