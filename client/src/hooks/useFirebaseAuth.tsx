import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch user role from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as FirestoreUser;
            setRole(userData.role);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          setRole(null);
        }
      } else {
        setRole(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
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
        await updateDoc(userDocRef, {
          devices: arrayUnion(deviceId)
        });
      }

      // Set role
      setRole(userData.role);
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (user) {
        const deviceId = getDeviceId();
        const userDocRef = doc(db, 'users', user.uid);
        
        // Remove device from user's devices array
        await updateDoc(userDocRef, {
          devices: arrayRemove(deviceId)
        });
        
        clearDeviceId();
      }
      
      await firebaseSignOut(auth);
      setRole(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
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
