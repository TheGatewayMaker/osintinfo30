import { getDbInstance } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  increment,
  updateDoc,
  runTransaction,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

export type UserProfile = {
  uid: string;
  email: string | null;
  name: string | null;
  username?: string;
  role?: "user" | "admin";
  uniquePurchaseId: string;
  freeSearches: number;
  purchasedSearches: number;
  usedSearches: number;
  totalSearchesRemaining: number;
  createdAt?: unknown;
  updatedAt?: unknown;
};

function db() {
  return getDbInstance();
}

function baseFromEmail(email: string) {
  const local = email.split("@")[0] || "user";
  const cleaned = local.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return cleaned || "user";
}

export function computeRemaining(p?: Partial<UserProfile> | null) {
  const free = Number(p?.freeSearches ?? 0) || 0;
  const purchased = Number(p?.purchasedSearches ?? 0) || 0;
  const used = Number(p?.usedSearches ?? 0) || 0;
  const derived = Math.max(0, free + purchased - used);
  const explicit = Number(p?.totalSearchesRemaining);
  return Number.isFinite(explicit) && explicit >= 0 ? explicit : derived;
}

export function isFirestorePermissionDenied(error: unknown) {
  if (!error) return false;
  if (typeof error === "string") {
    return /missing or insufficient permissions/i.test(error);
  }
  const anyError = error as Record<string, unknown>;
  const { code, name, message } = anyError as {
    code?: unknown;
    name?: unknown;
    message?: unknown;
  };
  if (typeof code === "string" && code.toLowerCase().includes("permission")) {
    return true;
  }
  if (typeof name === "string" && name.toLowerCase().includes("permission")) {
    return true;
  }
  return (
    typeof message === "string" &&
    /missing or insufficient permissions/i.test(message)
  );
}

async function findUniqueUsername(base: string): Promise<string> {
  const _db = db();
  let candidate = base || "user";
  let i = 1;
  // Try a bounded number of checks; if rules block collection reads, fall back to random suffix
  while (i <= 50) {
    try {
      const q = collection(_db, "users");
      const { getDocs, where, query, limit } = await import("firebase/firestore");
      const snap = await getDocs(query(q, where("username", "==", candidate), limit(1)));
      if (snap.empty) return candidate;
      i += 1;
      candidate = `${base}${i}`;
    } catch (err) {
      return `${base}-${cryptoRandomSuffix()}`;
    }
  }
  return `${base}-${cryptoRandomSuffix()}`;
}

function cryptoRandomSuffix() {
  try {
    const arr = new Uint32Array(1);
    // @ts-ignore
    (globalThis.crypto || (window as any).crypto).getRandomValues(arr);
    return (arr[0] % 100000).toString().padStart(5, "0");
  } catch {
    return Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, "0");
  }
}

async function normalizeExistingProfile(uid: string, existing: UserProfile) {
  const _db = db();
  const ref = doc(_db, "users", uid);
  const free = Math.min(2, Number(existing.freeSearches ?? 0) || 0);
  const purchased = Number(existing.purchasedSearches ?? 0) || 0;
  const used = Number(existing.usedSearches ?? 0) || 0;
  const derivedRemaining = Math.max(0, free + purchased - used);
  const explicitRemaining = Number(existing.totalSearchesRemaining);
  const needsFreeFix = free !== existing.freeSearches;
  const needsRemainingFix =
    !Number.isFinite(explicitRemaining) ||
    explicitRemaining !== derivedRemaining;

  if (needsFreeFix || needsRemainingFix) {
    await updateDoc(ref, {
      ...(needsFreeFix ? { freeSearches: free } : {}),
      ...(needsRemainingFix
        ? { totalSearchesRemaining: derivedRemaining }
        : {}),
      updatedAt: serverTimestamp(),
    });
    return {
      ...existing,
      freeSearches: free,
      totalSearchesRemaining: derivedRemaining,
    } as UserProfile;
  }
  return existing;
}

export async function ensureUserDoc(
  uid: string,
  email: string | null,
  name: string | null,
) {
  const _db = db();
  const ref = doc(collection(_db, "users"), uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const uniquePurchaseId = uuidv4();
    let username: string | undefined = undefined;
    if (email) {
      const base = baseFromEmail(email);
      username = await findUniqueUsername(base);
    }
    const profile: UserProfile = {
      uid,
      email,
      name,
      username,
      role: "user",
      uniquePurchaseId,
      freeSearches: 2,
      purchasedSearches: 0,
      usedSearches: 0,
      totalSearchesRemaining: 2,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(ref, profile);
    return profile;
  } else {
    const existing = snap.data() as UserProfile;
    let updated = existing;
    if (!existing.username && email) {
      const base = baseFromEmail(email);
      const username = await findUniqueUsername(base);
      await updateDoc(ref, { username, updatedAt: serverTimestamp() });
      updated = { ...existing, username } as UserProfile;
    }
    // normalize values (clamp free to 2 and sync remaining)
    return await normalizeExistingProfile(uid, updated);
  }
}

export async function incrementPurchasedSearches(uid: string, amount: number) {
  const _db = db();
  const ref = doc(_db, "users", uid);
  await updateDoc(ref, {
    purchasedSearches: increment(amount),
    totalSearchesRemaining: increment(amount),
    updatedAt: serverTimestamp(),
  });
}

export async function consumeSearchCredit(uid: string, count = 1) {
  const _db = db();
  const ref = doc(_db, "users", uid);
  await runTransaction(_db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) {
      throw new Error("User profile not found");
    }
    const data = snap.data() as UserProfile;

    const free = Math.max(0, Number(data.freeSearches ?? 0) || 0);
    const purchased = Math.max(0, Number(data.purchasedSearches ?? 0) || 0);
    const used = Math.max(0, Number(data.usedSearches ?? 0) || 0);

    const explicit = Number(data.totalSearchesRemaining);
    const currentRemaining = Number.isFinite(explicit)
      ? Math.max(0, explicit)
      : Math.max(0, free + purchased - used);

    if (currentRemaining < count) {
      throw new Error("No searches remaining");
    }

    const newUsed = used + count;
    const newRemaining = Math.max(0, currentRemaining - count);

    tx.update(ref, {
      usedSearches: newUsed,
      totalSearchesRemaining: newRemaining,
      updatedAt: serverTimestamp(),
    });
  });
}
