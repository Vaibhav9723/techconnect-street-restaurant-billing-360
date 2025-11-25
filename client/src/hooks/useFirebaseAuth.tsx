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
  email: string;
  role: 'admin' | 'client';
  active: boolean;
  expiry: string;
  deviceLimit: number;
  devices: string[];
}

interface FirebaseAuthContextType {
  user: FirebaseUser | null;
  role: UserRole;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  // Listen to auth state changes
  useEffect(() => {
    // If Firebase is not configured, set loading to false and return
    if (!isFirebaseConfigured() || !auth) {
      setLoading(false);
      return () => {}; // Return empty cleanup function
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser && db) {
        // Keep loading true while fetching role
        setLoading(true);
        // Fetch user role from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as FirestoreUser;
            setRole(userData.role);
          } else {
            setRole(null);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          setRole(null);
        }
        setLoading(false);
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    if (!isFirebaseConfigured() || !auth || !db) {
      throw new Error('Firebase is not configured. Please add your Firebase credentials to the .env file.');
    }

    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Fetch user document from Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await firebaseSignOut(auth);
        throw new Error('User data not found');
      }

      const userData = userDoc.data() as FirestoreUser;

      // Check if user is active
      if (!userData.active) {
        await firebaseSignOut(auth);
        throw new Error('Your account is inactive. Please contact support.');
      }

      // Check expiry
      const expiryDate = new Date(userData.expiry);
      const today = new Date();
      if (expiryDate < today) {
        await firebaseSignOut(auth);
        throw new Error('Your account has expired. Please renew your subscription.');
      }

      // Get device ID
      const deviceId = getDeviceId();

      // Check device limit
      const devices = userData.devices || [];
      if (!devices.includes(deviceId)) {
        if (devices.length >= userData.deviceLimit) {
          await firebaseSignOut(auth);
          throw new Error(`Device limit reached. Maximum ${userData.deviceLimit} devices allowed.`);
        }
        
        // Add device to user's devices array
        try {
          await updateDoc(userDocRef, {
            devices: arrayUnion(deviceId)
          });
        } catch (updateError) {
          console.error('Failed to update device list:', updateError);
          // Continue login even if device update fails
        }
      }

      // Set role
      setRole(userData.role);
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    // Capture device ID BEFORE clearing it (needed for Firestore cleanup)
    const deviceId = getDeviceId();
    
    // Eagerly clear local state first to prevent stale sessions
    const currentUser = user;
    setUser(null);
    setRole(null);

    if (!isFirebaseConfigured() || !auth) {
      // If Firebase not configured, just clear device ID and return
      clearDeviceId();
      return;
    }

    // Track success of both cleanup operations
    let firestoreCleanupSuccess = false;
    let firebaseSignOutSuccess = false;

    // Best-effort cleanup in Firebase/Firestore
    try {
      // Try to remove device from Firestore
      if (currentUser && db) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          
          // Remove device from user's devices array
          await updateDoc(userDocRef, {
            devices: arrayRemove(deviceId)
          });
          
          firestoreCleanupSuccess = true;
        } catch (firestoreError) {
          // IMPORTANT: Don't clear device ID on Firestore failure
          // Keep it so subsequent logout can retry removing it
          console.warn(
            'Failed to remove device from Firestore. Device ID retained for retry. ' +
            'Please logout again when online.',
            firestoreError
          );
        }
      } else {
        // No user/db to clean up - consider this "success"
        firestoreCleanupSuccess = true;
      }
      
      // Sign out from Firebase (even if device removal failed)
      try {
        await firebaseSignOut(auth);
        firebaseSignOutSuccess = true;
      } catch (signOutError) {
        console.warn('Firebase sign-out failed:', signOutError);
      }
    } catch (error) {
      // Outer error handler (shouldn't normally reach here)
      console.warn('Unexpected logout error:', error);
    }

    // Only clear device ID if BOTH operations succeeded
    // This ensures device can be removed on retry if either operation failed
    if (firestoreCleanupSuccess && firebaseSignOutSuccess) {
      clearDeviceId();
    } else {
      console.warn(
        'Device ID retained for retry. ' +
        `Firestore cleanup: ${firestoreCleanupSuccess ? 'success' : 'failed'}, ` +
        `Firebase sign-out: ${firebaseSignOutSuccess ? 'success' : 'failed'}`
      );
    }
  };

  return (
    <FirebaseAuthContext.Provider value={{ user, role, loading, login, logout }}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within FirebaseAuthProvider');
  }
  return context;
}
