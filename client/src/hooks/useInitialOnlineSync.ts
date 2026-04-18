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
import { flushUnsyncedData, markItemsSynced } from "@/services/sync/flushQueue";
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

  // Refs to avoid stale closures in async functions
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

    // Wait for all data to finish loading before syncing
    if (pRef.isLoading || cRef.isLoading || bRef.isLoading || sRef.isLoading) {
      setTimeout(runFullSync, RETRY_DELAY_MS);
      return;
    }

    // Skip if data failed to load
    if (pRef.error || cRef.error || bRef.error || sRef.error) {
      console.error("Cannot sync: data load error", {
        products: pRef.error,
        categories: cRef.error,
        bills: bRef.error,
        settings: sRef.error,
      });
      return;
    }

    syncingRef.current = true;

    try {
      console.log("🔄 Full sync started");
      const uid = user.uid;

      // ─── 1. Fetch all remote data ───────────────────────────────
      const [remoteProducts, remoteCategories, remoteBills, remoteSettings] =
        await Promise.all([
          fetchProducts(uid).catch((e) => {
            console.error("Fetch products failed", e);
            return [] as Product[];
          }),
          fetchCategories(uid).catch((e) => {
            console.error("Fetch categories failed", e);
            return [] as Category[];
          }),
          fetchBillsAfter(uid, null).catch((e) => {
            console.error("Fetch bills failed", e);
            return [] as Bill[];
          }),
          fetchSettings(uid).catch((e) => {
            console.error("Fetch settings failed", e);
            return null as Settings | null;
          }),
        ]);

      // ─── 2. Merge local + remote (id + updatedAt based) ─────────
      const localProducts = pRef.data;
      const localCategories = cRef.data;
      const localBills = bRef.data;
      const localSettings = sRef.data;

      const mergedProducts = mergeById(localProducts, remoteProducts);
      const mergedCategories = mergeById(localCategories, remoteCategories);
      const mergedBills = mergeById(localBills, remoteBills);

      // Settings: latest updatedAt wins
      let mergedSettings = localSettings;
      if (remoteSettings) {
        const localTime = localSettings.updatedAt ?? 0;
        const remoteTime = remoteSettings.updatedAt ?? 0;
        if (remoteTime > localTime) {
          mergedSettings = { ...remoteSettings };
        }
      }

      // ─── 3. Save merged data to local ──────────────────────────
      await Promise.all([
        pRef.setData(mergedProducts),
        cRef.setData(mergedCategories),
        bRef.setData(mergedBills),
        sRef.replaceFromFirebase(mergedSettings),
      ]);

      // ─── 4. Flush: upload items missing/newer on local side ─────
      const flushResult = await flushUnsyncedData(
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

      // ─── 5. Mark only successfully uploaded items as isSynced ───
      const syncedPIds = new Set(flushResult.syncedProductIds);
      const syncedCIds = new Set(flushResult.syncedCategoryIds);
      const syncedBIds = new Set(flushResult.syncedBillIds);

      const markPromises: Promise<void>[] = [];

      if (syncedPIds.size > 0) {
        markPromises.push(
          pRef.setData(markItemsSynced(productsRef.current.data, syncedPIds))
        );
      }
      if (syncedCIds.size > 0) {
        markPromises.push(
          cRef.setData(markItemsSynced(categoriesRef.current.data, syncedCIds))
        );
      }
      if (syncedBIds.size > 0) {
        markPromises.push(
          bRef.setData(markItemsSynced(billsRef.current.data, syncedBIds))
        );
      }
      if (flushResult.settingsSynced) {
        markPromises.push(
          sRef.replaceFromFirebase({
            ...settingsRef.current.data,
            isSynced: true,
          })
        );
      }

      await Promise.all(markPromises);

      console.log("✅ Full sync completed");
    } catch (error) {
      console.error("❌ Full sync failed", error);
    } finally {
      syncingRef.current = false;
    }
  }, [user]);

  // Sync on initial online mode
  useEffect(() => {
    if (mode === "online" && user) {
      runFullSync();
    }
  }, [mode, user, runFullSync]);

  // Sync on reconnect
  useOnlineStatus(() => {
    if (modeRef.current === "online" || userProfile?.posType === "online") {
      runFullSync();
    }
  });
}