  import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
  import { 
    signInWithEmailAndPassword, 
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User as FirebaseUser
  } from 'firebase/auth';
  import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
  import { auth, db, isFirebaseConfigured } from '@/lib/firebase';
  import { getDeviceId, clearDeviceId } from '@/utils/deviceId';

  type UserRole = 'admin' | 'client' | null;

  interface FirestoreUser {
    businessName:string;
    email: string;
    role: 'admin' | 'client';
    active: boolean;
    expiry: number; 
    deviceLimit: number;
    devices: string[];
    licenseId?: string;
    posType?: "offline" | "online";
    businessMode?: "vendor" | "restaurant";
  }


  interface FirebaseAuthContextType {
    user: FirebaseUser | null;
    role: UserRole;
    userProfile: FirestoreUser | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
  }

  const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

  export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [role, setRole] = useState<UserRole>(null);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<FirestoreUser | null>(null);
   
    useEffect(() => {
      const interval = setInterval(() => {
        const days = parseInt(localStorage.getItem('subscription_days_left') || '0', 10);
        const lastShown = parseInt(localStorage.getItem('subscription_last_shown') || '0', 10);
        const now = Date.now();

        if (days > 0 && days <= 30) {
          if (now - lastShown >= 3 * 60 * 60 * 1000) { // 3 hours
            localStorage.setItem("subscription_last_shown", now.toString());
            window.dispatchEvent(new Event("subscription-expiry-warning"));
          }
        }
      }, 60 * 1000); // check every 1 min (lightweight)

      return () => clearInterval(interval);
    }, []);

    useEffect(() => {
    if (!isFirebaseConfigured() || !auth) {
      setLoading(false);
      return;
    }

  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    setUser(firebaseUser);

    if (!firebaseUser) {
      setRole(null);
      setUserProfile(null);
      setLoading(false);
      return;
    }

    if (!db) {
      console.error("Firestore not initialized");
      setRole(null);
      setUserProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data() as FirestoreUser;
        setRole(userData.role);
        setUserProfile(userData);
      } else {
        setRole(null);
        setUserProfile(null);
      }
    } catch (err) {
      console.error("User fetch error:", err);
      setRole(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  });

  return () => unsubscribe();
}, []);



    const login = async (email: string, password: string) => {
    if (!isFirebaseConfigured() || !auth || !db) {
      throw new Error("Firebase not configured");
    }

    try {
      // LOGIN
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCred.user;

      const userRef = doc(db, "users", firebaseUser.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        await firebaseSignOut(auth);
        throw new Error("User data missing");
      }

      const userData = snap.data() as FirestoreUser;

      // 🔐 LICENSE CHECK (MOST IMPORTANT)
      const requiredLicense = import.meta.env.VITE_LICENSE_ID;

      if (requiredLicense) {
        if (!userData.licenseId || userData.licenseId !== requiredLicense) {
          await firebaseSignOut(auth);
          throw new Error(
            "This installation of TechConnect POS is not licensed. Please contact support."
          );
        }
      }

      // ACTIVE CHECK
      if (!userData.active) {
        await firebaseSignOut(auth);
        throw new Error("Your account is inactive.");
      }

      // EXPIRY CHECK
      const expiryDate = new Date(userData.expiry);
      const today = new Date();
      const daysLeft = Math.ceil(
        (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      // STORE DAYS LEFT
      localStorage.setItem("subscription_days_left", daysLeft.toString());

      // Expired completely
      if (expiryDate < today) {
        await firebaseSignOut(auth);
        throw new Error("Your subscription has expired.");
      }

      // Login time warning (<=30 days)
      if (daysLeft <= 30) {
        localStorage.setItem("subscription_last_shown", "0"); // force first popup
        localStorage.setItem("show_expiry_modal", "1");
      }

      // DEVICE MANAGEMENT
      const deviceId = getDeviceId();
      const devices = userData.devices || [];

      if (!devices.includes(deviceId)) {
        if (devices.length >= userData.deviceLimit) {
          await firebaseSignOut(auth);
          throw new Error(`Device limit reached.`);
        }

        try {
          await updateDoc(userRef, { devices: arrayUnion(deviceId) });
        } catch (err) {
          console.error("Device update error:", err);
        }
      }

      setRole(userData.role);

    } catch (err: any) {
      console.error("Login error:", err);
      throw err;
    }
  };


    const logout = async () => {
      const deviceId = getDeviceId();
      const currentUser = user;
      setUser(null);
      setRole(null);
      setUserProfile(null);

      if (!isFirebaseConfigured() || !auth) {
        clearDeviceId();
        return;
      }

      let firestoreDone = false;
      let authDone = false;

      try {
        if (currentUser && db) {
          try {
            await updateDoc(doc(db, "users", currentUser.uid), {
              devices: arrayRemove(deviceId)
            });
            firestoreDone = true;
          } catch (err) {
            console.warn("Device remove failed:", err);
          }
        } else {
          firestoreDone = true;
        }

        try {
          await firebaseSignOut(auth);
          authDone = true;
        } catch (err) {}

      } catch {}

      if (firestoreDone && authDone) clearDeviceId();
    };

    return (
      <FirebaseAuthContext.Provider
        value={{ user, role, userProfile, loading, login, logout }}
      >
        {children}
      </FirebaseAuthContext.Provider>

    );
  }

  export function useFirebaseAuth() {
    const ctx = useContext(FirebaseAuthContext);
    if (!ctx) throw new Error("useFirebaseAuth must be inside provider");
    return ctx;
  }
