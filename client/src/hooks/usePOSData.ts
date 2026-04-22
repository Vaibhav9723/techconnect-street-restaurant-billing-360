// import { usePOSMode } from "@/context/POSModeContext";
// import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";

// import {
//   useProducts as useLocalProducts,
//   useCategories as useLocalCategories,
//   useBills as useLocalBills,
//   useSettings as useLocalSettings,
// } from "@/hooks/useEncryptedStorage";

// import { writeProductOnline } from "@/services/firestore/products";
// import { writeCategoryOnline } from "@/services/firestore/categories";
// import { deleteCategoryOnline } from "@/services/firestore/categories";
// import { addBillOnline } from "@/services/firestore/bills";
// import { saveVendorSettings } from "@/services/firestore/settings";

// import { Product, Category, Bill, Settings } from "@/types/schema";

// export function useProducts() {
//   const mode = usePOSMode();
//   const { user } = useFirebaseAuth();
//   const local = useLocalProducts();

//   const setData = async (products: Product[]) => {
//     await local.setData(products);
//   };

//   const updateProductOnline = async (product: Product): Promise<void> => {
//     if (mode === "online" && user) {
//       try {
//         await writeProductOnline(user.uid, product);
//         const current = local.data;
//         const updated = current.map((p) =>
//           p.id === product.id ? { ...p, isSynced: true } : p
//         );
//         await local.setData(updated);
//       } catch (e) {
//         console.error("Product online write failed (will retry on reconnect)", e);
//       }
//     }
//   };

//   const replaceFromFirebase = async (products: Product[]) => {
//     const marked = products.map((p) => ({ ...p, isSynced: true }));
//     await local.setData(marked);
//     await local.reload();
//   };

//   return {
//     ...local,
//     setData,
//     updateProductOnline,
//     replaceFromFirebase,
//   };
// }

// export function useCategories() {
//   const mode = usePOSMode();
//   const { user } = useFirebaseAuth();
//   const local = useLocalCategories();

//   const addOrUpdateCategory = async (category: Category) => {
//     const categoryWithSync: Category = {
//       ...category,
//       isSynced: false,
//       updatedAt: Date.now(),
//     };

//     const exists = local.data.some((c) => c.id === categoryWithSync.id);
//     const updated = exists
//       ? local.data.map((c) => (c.id === categoryWithSync.id ? categoryWithSync : c))
//       : [...local.data, categoryWithSync];

//     await local.setData(updated);

//     if (mode === "online" && user) {
//       try {
//         await writeCategoryOnline(user.uid, categoryWithSync);
//         const current = local.data;
//         const synced = current.map((c) =>
//           c.id === categoryWithSync.id ? { ...c, isSynced: true } : c
//         );
//         await local.setData(synced);
//       } catch (e) {
//         console.error("Category online write failed (will retry on reconnect)", e);
//       }
//     }
//   };

//   const deleteCategory = async (categoryId: string) => {
//     const category = local.data.find((c) => c.id === categoryId);
//     if (!category) return;

//     const softDeleted: Category = {
//       ...category,
//       isDeleted: true,
//       deletedAt: Date.now(),
//       updatedAt: Date.now(),
//       isSynced: false,
//     };

//     const updated = local.data.map((c) =>
//       c.id === categoryId ? softDeleted : c
//     );
//     await local.setData(updated);

//     if (mode === "online" && user) {
//       try {
//         await writeCategoryOnline(user.uid, softDeleted);
//         const current = local.data;
//         const synced = current.map((c) =>
//           c.id === categoryId ? { ...c, isSynced: true } : c
//         );
//         await local.setData(synced);
//       } catch (e) {
//         console.error("Category delete sync failed (will retry on reconnect)", e);
//       }
//     }
//   };

//   const replaceFromFirebase = async (categories: Category[]) => {
//     const marked = categories.map((c) => ({ ...c, isSynced: true }));
//     await local.setData(marked);
//     await local.reload();
//   };

//   return {
//     ...local,
//     addOrUpdateCategory,
//     deleteCategory,
//     replaceFromFirebase,
//   };
// }

// export function useBills() {
//   const mode = usePOSMode();
//   const { user } = useFirebaseAuth();
//   const local = useLocalBills();

//   const addBill = async (bill: Bill) => {
//     const billWithSync: Bill = {
//       ...bill,
//       isSynced: false,
//     };

//     await local.setData([billWithSync, ...local.data]);

//     if (mode === "online" && user) {
//       try {
//         await addBillOnline(user.uid, billWithSync);
//         const current = local.data;
//         const updated = [billWithSync, ...current].map((b) =>
//           b.id === billWithSync.id ? { ...b, isSynced: true } : b
//         );
//         await local.setData(updated);
//       } catch (e) {
//         console.error("Online bill write failed (will retry on reconnect)", e);
//       }
//     }
//   };

//   const replaceFromFirebase = async (bills: Bill[]) => {
//     const marked = bills.map((b) => ({ ...b, isSynced: true }));
//     await local.setData(marked);
//     await local.reload();
//   };

//   return {
//     ...local,
//     addBill,
//     replaceFromFirebase,
//   };
// }

// export function useSettings() {
//   const mode = usePOSMode();
//   const { user } = useFirebaseAuth();
//   const local = useLocalSettings();

//   const setData = async (settings: Settings) => {
//     const settingsWithSync: Settings = {
//       ...settings,
//       isSynced: false,
//       updatedAt: Date.now(),
//     };

//     await local.setData(settingsWithSync);

//     if (mode === "online" && user) {
//       try {
//         await saveVendorSettings(user.uid, settingsWithSync);
//         await local.setData({ ...settingsWithSync, isSynced: true });
//       } catch (e) {
//         console.error("Settings online write failed (will retry on reconnect)", e);
//       }
//     }
//   };

//   const replaceFromFirebase = async (settings: Settings) => {
//     await local.setData({ ...settings, isSynced: true });
//     await local.reload();
//   };

//   return {
//     ...local,
//     setData,
//     replaceFromFirebase,
//   };
// }

import { useRef } from "react";
import { usePOSMode } from "@/context/POSModeContext";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";

import {
  useProducts as useLocalProducts,
  useCategories as useLocalCategories,
  useBills as useLocalBills,
  useSettings as useLocalSettings,
} from "@/hooks/useEncryptedStorage";

import { writeProductOnline } from "@/services/firestore/products";
import { writeCategoryOnline } from "@/services/firestore/categories";
import { addBillOnline } from "@/services/firestore/bills";
import { saveVendorSettings } from "@/services/firestore/settings";

import { Product, Category, Bill, Settings } from "@/types/schema";

export function useProducts() {
  const mode = usePOSMode();
  const { user } = useFirebaseAuth();
  const local = useLocalProducts();

  const setData = async (products: Product[]) => {
    await local.setData(products);
  };

  const updateProductOnline = async (product: Product): Promise<void> => {
    if (mode === "online" && user) {
      await writeProductOnline(user.uid, product);
    }
  };

  const replaceFromFirebase = async (products: Product[]) => {
    await local.setData(products);
    await local.reload();
  };

  return {
    ...local,
    setData,
    updateProductOnline,
    replaceFromFirebase,
  };
}

export function useCategories() {
  const mode = usePOSMode();
  const { user } = useFirebaseAuth();
  const local = useLocalCategories();

  // Ref to avoid stale closure in async operations
  const localRef = useRef(local);
  localRef.current = local;

  const addOrUpdateCategory = async (category: Category) => {
    // 1. Compute new state from ref (always fresh, no stale closure)
    const currentData = localRef.current.data;
    const exists = currentData.some(c => c.id === category.id);
    const updated = exists
      ? currentData.map(c => (c.id === category.id ? category : c))
      : [...currentData, category];

    // 2. Save to local immediately
    await local.setData(updated);

    // 3. Firebase write (after local save, never re-read local.data)
    if (mode === "online" && user) {
      await writeCategoryOnline(user.uid, category);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    // Soft delete: mark as deleted instead of removing
    const now = Date.now();
    const currentData = localRef.current.data;
    const category = currentData.find(c => c.id === categoryId);
    if (!category) return;

    const deletedCategory: Category = {
      ...category,
      isDeleted: true,
      deletedAt: now,
      updatedAt: now,
    };

    const updated = currentData.map(c =>
      c.id === categoryId ? deletedCategory : c
    );

    // Save to local immediately
    await local.setData(updated);

    // Firebase write (soft delete via setDoc)
    if (mode === "online" && user) {
      await writeCategoryOnline(user.uid, deletedCategory);
    }
  };

  const replaceFromFirebase = async (categories: Category[]) => {
    await local.setData(categories);
    await local.reload();
  };

  return {
    ...local,
    addOrUpdateCategory,
    deleteCategory,
    replaceFromFirebase,
  };
}

export function useBills() {
  const mode = usePOSMode();
  const { user } = useFirebaseAuth();
  const local = useLocalBills();

  // Ref to avoid stale closure in async operations
  const localRef = useRef(local);
  localRef.current = local;

  const addBill = async (bill: Bill) => {
    // 1. Compute new state from ref (always fresh, no stale closure)
    const newBills = [bill, ...localRef.current.data];

    // 2. Save to local immediately
    await local.setData(newBills);

    // 3. Firebase write (after local save, never re-read local.data)
    if (mode === "online" && user) {
      addBillOnline(user.uid, bill).catch((e) => {
        console.error("Online bill failed (safe)", e);
      });
    }
  };

  // Used ONLY during online login sync
  const replaceFromFirebase = async (bills: Bill[]) => {
    await local.setData(bills);
    await local.reload();
  };

  return {
    ...local,
    addBill,
    replaceFromFirebase,
  };
}

export function useSettings() {
  const mode = usePOSMode();
  const { user } = useFirebaseAuth();
  const local = useLocalSettings();

  const setData = async (settings: Settings) => {
    await local.setData(settings);

    if (mode === "online" && user) {
      await saveVendorSettings(user.uid, settings);
    }
  };

  const replaceFromFirebase = async (settings: Settings) => {
    await local.setData(settings);
    await local.reload();
  };

  return {
    ...local,
    setData,
    replaceFromFirebase,
  };
}
