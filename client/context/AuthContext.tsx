import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getAuthInstance,
  getGoogleProvider,
  getDbInstance,
} from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  signInWithPopup,
  updateProfile,
  User,
} from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { ensureUserDoc, UserProfile } from "@/lib/user";

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubAuth: (() => void) | undefined;
    let unsubProfile: (() => void) | undefined;
    try {
      const _auth = getAuthInstance();
      unsubAuth = onAuthStateChanged(_auth, async (u) => {
        setUser(u);
        if (unsubProfile) {
          unsubProfile();
          unsubProfile = undefined;
        }
        if (u) {
          try {
            const ensured = await ensureUserDoc(u.uid, u.email, u.displayName);
            setProfile(ensured);
          } catch (e) {
            console.warn("ensureUserDoc failed: ", e);
          }
          try {
            const db = getDbInstance();
            const ref = doc(db, "users", u.uid);
            unsubProfile = onSnapshot(ref, (snap) => {
              if (snap.exists()) {
                setProfile(snap.data() as UserProfile);
              }
            });
          } catch (e) {
            console.warn("Profile realtime disabled: ", e);
          }
        } else {
          setProfile(null);
        }
        setLoading(false);
      });
    } catch (e) {
      console.warn("Auth disabled: ", e);
      setUser(null);
      setProfile(null);
      setLoading(false);
    }
    return () => {
      if (unsubAuth) unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      profile,
      loading,
      async signIn(email, password) {
        const _auth = getAuthInstance();
        await signInWithEmailAndPassword(_auth, email, password);
      },
      async signUp(name, email, password) {
        const _auth = getAuthInstance();
        const cred = await createUserWithEmailAndPassword(
          _auth,
          email,
          password,
        );
        if (cred.user && name) {
          await updateProfile(cred.user, { displayName: name });
        }
        await ensureUserDoc(cred.user!.uid, cred.user!.email, name);
      },
      async signInWithGoogle() {
        const _auth = getAuthInstance();
        await signInWithPopup(_auth, getGoogleProvider());
      },
      async signOut() {
        const _auth = getAuthInstance();
        await fbSignOut(_auth);
      },
    }),
    [user, profile, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
