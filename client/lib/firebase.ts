import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

function readConfig() {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as
      | string
      | undefined,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as
      | string
      | undefined,
    appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
  };
}

function isConfigComplete(cfg: Record<string, string | undefined>) {
  return Boolean(
    cfg.apiKey &&
      cfg.authDomain &&
      cfg.projectId &&
      cfg.appId &&
      cfg.storageBucket &&
      cfg.messagingSenderId,
  );
}

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _googleProvider: GoogleAuthProvider | null = null;

export function getFirebaseApp() {
  if (_app) return _app;

  const cfg = readConfig();
  if (!isConfigComplete(cfg)) {
    throw new Error(
      "Firebase is not configured. Please set VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID and VITE_FIREBASE_APP_ID in your environment.",
    );
  }

  if (!getApps().length) {
    _app = initializeApp({
      apiKey: cfg.apiKey!,
      authDomain: cfg.authDomain!,
      projectId: cfg.projectId!,
      storageBucket: cfg.storageBucket!,
      messagingSenderId: cfg.messagingSenderId!,
      appId: cfg.appId!,
    });
  } else {
    _app = getApps()[0]!;
  }
  return _app;
}

export function getAuthInstance() {
  if (_auth) return _auth;
  const app = getFirebaseApp();
  _auth = getAuth(app);
  return _auth;
}

export function getDbInstance() {
  if (_db) return _db;
  const app = getFirebaseApp();
  _db = getFirestore(app);
  return _db;
}

export function getGoogleProvider() {
  if (_googleProvider) return _googleProvider;
  _googleProvider = new GoogleAuthProvider();
  return _googleProvider;
}
