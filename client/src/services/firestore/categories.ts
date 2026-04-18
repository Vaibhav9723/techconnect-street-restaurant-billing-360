// import { doc, setDoc, deleteDoc } from "firebase/firestore";
// import { Category } from "@/types/schema";
// import { requireDB } from "./base";

// export async function writeCategoryOnline(uid: string, category: Category) {
//   console.log("🔥 CATEGORY ONLINE WRITE", uid, category.id);  
//   const db = requireDB();
//   await setDoc(
//     doc(db, "vendors", uid, "categories", category.id),
//     category
//   );
// }

// export async function deleteCategoryOnline(uid: string, categoryId: string) {
//   const db = requireDB();
//   await deleteDoc(doc(db, "vendors", uid, "categories", categoryId));
// }

// import { doc, setDoc, deleteDoc } from "firebase/firestore";
// import { Category } from "@/types/schema";
// import { requireDB, sanitizeForFirestore } from "./base";

// export async function writeCategoryOnline(uid: string, category: Category) {
//   console.log("🔥 CATEGORY ONLINE WRITE", uid, category.id);
//   const db = requireDB();

//   // 🔒 sanitize before Firestore + add updatedAt
//   const safeCategory = sanitizeForFirestore({
//     ...category,
//     updatedAt: Date.now(),
//   });

//   await setDoc(
//     doc(db, "vendors", uid, "categories", category.id),
//     safeCategory
//   );
// }

// export async function deleteCategoryOnline(uid: string, categoryId: string) {
//   const db = requireDB();
//   await deleteDoc(doc(db, "vendors", uid, "categories", categoryId));
// }

import { doc, setDoc } from "firebase/firestore";
import { Category } from "@/types/schema";
import { requireDB, sanitizeForFirestore } from "./base";

export async function writeCategoryOnline(uid: string, category: Category) {
  console.log("🔥 CATEGORY ONLINE WRITE", uid, category.id);
  const db = requireDB();

  const safeCategory = sanitizeForFirestore({
    ...category,
    updatedAt: Date.now(),
  });

  await setDoc(
    doc(db, "vendors", uid, "categories", category.id),
    safeCategory,
    { merge: true }
  );
}

export async function deleteCategoryOnline(uid: string, categoryId: string) {
  const db = requireDB();

  const softDeleted = sanitizeForFirestore({
    id: categoryId,
    isDeleted: true,
    deletedAt: Date.now(),
    updatedAt: Date.now(),
    isSynced: true,
  });

  await setDoc(
    doc(db, "vendors", uid, "categories", categoryId),
    softDeleted,
    { merge: true }
  );
}