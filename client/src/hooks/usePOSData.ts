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
import { deleteCategoryOnline } from "@/services/firestore/categories";
import { addBillOnline } from "@/services/firestore/bills";
// import { saveSettings } from "@/services/firestore/settings";
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
    updateProductOnline,   // 🔒 ALWAYS PRESENT
    replaceFromFirebase,
  };
}

export function useCategories() {
  const mode = usePOSMode();
  const { user } = useFirebaseAuth();
  const local = useLocalCategories();

  const addOrUpdateCategory = async (category: Category) => {
    // local update
    const exists = local.data.some(c => c.id === category.id);
    const updated = exists
      ? local.data.map(c => (c.id === category.id ? category : c))
      : [...local.data, category];

    await local.setData(updated);

    // 🔥 firebase write
    if (mode === "online" && user) {
      await writeCategoryOnline(user.uid, category);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    await local.setData(local.data.filter(c => c.id !== categoryId));

    if (mode === "online" && user) {
      await deleteCategoryOnline(user.uid, categoryId);
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

  const addBill = async (bill: Bill) => {
    // 1️⃣ Always local first
    await local.setData([bill, ...local.data]);

    // 2️⃣ Online → append to Firebase
    // if (mode === "online" && user) {
    //   try {
    //     await addBillOnline(user.uid, bill);
    //   } catch (e) {
    //     console.error("Online bill write failed", e);
    //   }
    // }
    if (mode === "online" && user) {
      addBillOnline(user.uid, bill).catch((e) => {
      console.error("Online bill failed (safe)", e);
    });
}
  };

  // 🔥 Used ONLY during online login sync
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


