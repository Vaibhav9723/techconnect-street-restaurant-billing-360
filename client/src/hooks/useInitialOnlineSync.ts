// import { useEffect, useRef } from "react";
// import { usePOSMode } from "@/context/POSModeContext";
// import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
// import { addBillOnline } from "@/services/firestore/bills";
// import {
//   fetchProducts,
//   fetchCategories,
//   fetchBillsAfter,
//   fetchSettings,
// } from "@/services/firestore/read";

// import {
//   useProducts,
//   useCategories,
//   useBills,
//   useSettings,
// } from "@/hooks/usePOSData";

// import { mergeById } from "@/services/sync/mergeById";

// export function useInitialOnlineSync() {
//   const mode = usePOSMode();
//   const { user } = useFirebaseAuth();
//   const syncedRef = useRef(false);

//   const products = useProducts();
//   const categories = useCategories();
//   const bills = useBills();
//   const settings = useSettings();
//   const { userProfile } = useFirebaseAuth();

//   useEffect(() => {
//     if (!user) return;
//     if (mode !== "online") return;
//     // if (syncedRef.current) return;

//     // syncedRef.current = true;

//     const run = async () => {
//       try {
//         console.log("🔥 Online merge sync started");

//         /* ================= PRODUCTS ================= */
//         const remoteProducts = await fetchProducts(user.uid);
//         const mergedProducts = mergeById(
//           products.data,
//           remoteProducts
//         );
//         await products.setData(mergedProducts);

//         /* ================= CATEGORIES ================= */
//         const remoteCategories = await fetchCategories(user.uid);
//         const mergedCategories = mergeById(
//           categories.data,
//           remoteCategories
//         );
//         await categories.setData(mergedCategories);

//         /* ================= BILLS (APPEND ONLY) ================= */
//         if (bills.data.length === 0) {
//           const allBills = await fetchBillsAfter(user.uid, null);
//           if (allBills.length) {
//             await bills.replaceFromFirebase(allBills.reverse());
//           }
//         } else {
//           const latestDate = bills.data[0].dateISO;
//           const newBills = await fetchBillsAfter(user.uid, latestDate);
//           if (newBills.length) {
//             await bills.replaceFromFirebase([
//               ...newBills.reverse(),
//               ...bills.data,
//             ]);
//           }
//         }

//         // 🔥 UPLOAD LOCAL OFFLINE BILLS TO FIREBASE

//         // 🔒 ONLY sync if THIS USER is ONLINE POS
// if (userProfile?.posType !== "online") return;

// const remoteBills = await fetchBillsAfter(user.uid, null);
// const remoteIds = new Set(remoteBills.map(b => b.id));

// for (const bill of bills.data) {
//   if (!remoteIds.has(bill.id)) {
//     try {
//       await addBillOnline(user.uid, bill);
//     } catch (e) {
//       console.error("Sync failed:", bill.id);
//     }
//   }
// }

//         /* ================= SETTINGS ================= */
//       const remoteSettings = await fetchSettings(user.uid);

//         if (remoteSettings) {
//           await settings.replaceFromFirebase(remoteSettings);
//         }
//         console.log("✅ Online merge sync completed");
//       } catch (error) {
//         console.error("❌ Online sync failed", error);
//         syncedRef.current = false; // allow retry
//       }
      
//     };

//     run();
//   }, [mode, user,bills.data.length]);
// }

// ─── FILE: client/src/hooks/useInitialOnlineSync.ts ────────────────

import { useEffect, useRef, useCallback } from "react";
import { usePOSMode } from "@/context/POSModeContext";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import {
  fetchProducts,
  fetchCategories,
  fetchBillsAfter,
  fetchSettings,
} from "@/services/firestore/read";

import {
  useProducts,
  useCategories,
  useBills,
  useSettings,
} from "@/hooks/usePOSData";

import { mergeById } from "@/services/sync/mergeById";
import { flushUnsyncedData } from "@/services/sync/flushQueue";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { Product, Category, Bill, Settings } from "@/types/schema";

const RETRY_DELAY_MS = 500;

export function useInitialOnlineSync() {
  const mode = usePOSMode();
  const { user, userProfile } = useFirebaseAuth();
  const syncingRef = useRef(false);

  const products = useProducts();
  const categories = useCategories();
  const bills = useBills();
  const settings = useSettings();

  const productsRef = useRef(products);
  productsRef.current = products;
  const categoriesRef = useRef(categories);
  categoriesRef.current = categories;
  const billsRef = useRef(bills);
  billsRef.current = bills;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const runFullSync = useCallback(async () => {
    if (!user) return;
    if (syncingRef.current) return;

    const pRef = productsRef.current;
    const cRef = categoriesRef.current;
    const bRef = billsRef.current;
    const sRef = settingsRef.current;

    if (pRef.isLoading || cRef.isLoading || bRef.isLoading || sRef.isLoading) {
      setTimeout(runFullSync, RETRY_DELAY_MS);
      return;
    }

    if (pRef.error || cRef.error || bRef.error || sRef.error) {
      console.error("Cannot sync: data load error");
      return;
    }

    syncingRef.current = true;

    try {
      const uid = user.uid;

      // 1. Fetch remote
      const [remoteProducts, remoteCategories, remoteBills, remoteSettings] =
        await Promise.all([
          fetchProducts(uid).catch(() => [] as Product[]),
          fetchCategories(uid).catch(() => [] as Category[]),
          fetchBillsAfter(uid, null).catch(() => [] as Bill[]),
          fetchSettings(uid).catch(() => null as Settings | null),
        ]);

      // 2. Merge local + remote by id + updatedAt
      const mergedProducts = mergeById(pRef.data, remoteProducts);
      const mergedCategories = mergeById(cRef.data, remoteCategories);
      const mergedBills = mergeById(bRef.data, remoteBills);

      let mergedSettings = sRef.data;
      if (remoteSettings) {
        const localTime = sRef.data.updatedAt ?? 0;
        const remoteTime = remoteSettings.updatedAt ?? 0;
        if (remoteTime > localTime) {
          mergedSettings = { ...remoteSettings };
        }
      }

      // 3. Save merged to local
      await Promise.all([
        pRef.setData(mergedProducts),
        cRef.setData(mergedCategories),
        bRef.setData(mergedBills),
        sRef.replaceFromFirebase(mergedSettings),
      ]);

      // 4. Flush: upload items missing from remote or newer (id + updatedAt)
      await flushUnsyncedData(
        uid,
        {
          products: mergedProducts,
          categories: mergedCategories,
          bills: mergedBills,
          settings: mergedSettings,
        },
        {
          products: remoteProducts,
          categories: remoteCategories,
          bills: remoteBills,
          settings: remoteSettings,
        }
      );

      console.log("✅ Full sync completed");
    } catch (error) {
      console.error("❌ Full sync failed", error);
    } finally {
      syncingRef.current = false;
    }
  }, [user]);

  useEffect(() => {
    if (mode === "online" && user) {
      runFullSync();
    }
  }, [mode, user, runFullSync]);

  useOnlineStatus(() => {
    if (modeRef.current === "online" || userProfile?.posType === "online") {
      runFullSync();
    }
  });
}