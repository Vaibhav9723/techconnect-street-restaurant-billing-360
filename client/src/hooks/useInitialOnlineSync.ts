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

import { useEffect, useRef } from "react";
import { usePOSMode } from "@/context/POSModeContext";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { addBillOnline } from "@/services/firestore/bills";
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

export function useInitialOnlineSync() {
  const mode = usePOSMode();
  const { user } = useFirebaseAuth();
  const syncedRef = useRef(false);

  const products = useProducts();
  const categories = useCategories();
  const bills = useBills();
  const settings = useSettings();
  const { userProfile } = useFirebaseAuth();

  useEffect(() => {
    if (!user) return;
    if (mode !== "online") return;
    if (syncedRef.current) return;

    syncedRef.current = true;

    const run = async () => {
      try {
        console.log("🔥 Online merge sync started");

        /* ================= PRODUCTS ================= */
        const remoteProducts = await fetchProducts(user.uid);
        const mergedProducts = mergeById(
          products.data,
          remoteProducts
        );
        await products.setData(mergedProducts);

        /* ================= CATEGORIES ================= */
        const remoteCategories = await fetchCategories(user.uid);
        const mergedCategories = mergeById(
          categories.data,
          remoteCategories
        );
        await categories.setData(mergedCategories);

        /* ================= BILLS ================= */
        // Fetch remote bills ONCE — reuse for both merge + upload check
        const remoteBills = await fetchBillsAfter(user.uid, null);

        if (bills.data.length === 0) {
          // No local bills — load all from Firebase
          if (remoteBills.length) {
            await bills.replaceFromFirebase(remoteBills.reverse());
          }
        } else {
          // Merge: find bills newer than our latest
          const latestDate = bills.data[0].dateISO;
          const newBills = remoteBills.filter(b => b.dateISO > latestDate);
          if (newBills.length) {
            await bills.replaceFromFirebase([
              ...newBills.reverse(),
              ...bills.data,
            ]);
          }
        }

        /* ================= UPLOAD LOCAL OFFLINE BILLS ================= */
        // 🔒 ONLY sync if THIS USER is ONLINE POS
        if (userProfile?.posType === "online") {
          const remoteIds = new Set(remoteBills.map(b => b.id));

          for (const bill of bills.data) {
            if (!remoteIds.has(bill.id)) {
              try {
                await addBillOnline(user.uid, bill);
              } catch (e) {
                console.error("Sync failed:", bill.id);
              }
            }
          }
        }

        /* ================= SETTINGS ================= */
        const remoteSettings = await fetchSettings(user.uid);

        if (remoteSettings) {
          await settings.replaceFromFirebase(remoteSettings);
        }
        console.log("✅ Online merge sync completed");
      } catch (error) {
        console.error("❌ Online sync failed", error);
        syncedRef.current = false; // allow retry
      }
      
    };

    run();
  }, [mode, user]);
}