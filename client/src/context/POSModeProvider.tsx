import { ReactNode, useEffect, useState } from "react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { POSModeContext, POSMode } from "./POSModeContext";
// import { doc, getDoc } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import { requireDB } from "@/services/firestore/base";
export default function POSModeProvider({ children }: { children: ReactNode }) {

  const [mode, setMode] = useState<POSMode>("offline");
  const { userProfile } = useFirebaseAuth();
  // const isOnline = navigator.onLine;

// const { user } = useFirebaseAuth();
//   useEffect(() => {
//   if (!user) {
//     setMode("offline");
//     return;
//   }
//   // const load = async () => {
//   //   try {
//   //     const db = requireDB();
//   //     const snap = await getDoc(doc(db, "users", user.uid));

//   //     if (snap.exists()) {
//   //       const posType = snap.data().posType;
//   //       setMode(posType === "online" ? "online" : "offline");
//   //     } else {
//   //       setMode("offline");
//   //     }
//   //   } catch (err) {
//   //     // 🔥 OFFLINE FALLBACK (MOST IMPORTANT)
//   //     console.warn("POSMode fallback to offline (no internet)");
//   //     setMode("offline");
//   //   }
//   // };
//   // load();

// }, [user]);

useEffect(() => {
  if (!userProfile) {
    setMode("offline");
    return;
  }

  const isOnline = navigator.onLine;

  setMode(
    isOnline && userProfile.posType === "online"
      ? "online"
      : "offline"
  );
}, [userProfile]);


  useEffect(() => {
    const handleOnline = () => {
      if (userProfile?.posType === "online") {
        setMode("online");
      }
    };

    const handleOffline = () => {
      setMode("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [userProfile]);

  return (
    <POSModeContext.Provider value={mode}>
      {children}
    </POSModeContext.Provider>
  );
}
