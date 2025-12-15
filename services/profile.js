// services/profile.js
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

export async function ensureProfile() {
  const user = auth.currentUser;
  if (!user) throw new Error("Ingen bruger er logget ind.");

  const ref = doc(db, "profiles", user.uid);
  const snap = await getDoc(ref);

  // Opret kun hvis den ikke findes
  if (!snap.exists()) {
    const data = {
      displayName: user.displayName || "Bruger",
      email: user.email || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(ref, data);
    return data;
  }

  // Sync email hvis den mangler i profilen men findes på auth-user
  const data = snap.data();
  if ((!data?.email || data.email === "") && user.email) {
    await updateDoc(ref, { email: user.email, updatedAt: serverTimestamp() });
    return { ...data, email: user.email };
  }

  return data;
}

export async function getMyProfile() {
  const user = auth.currentUser;
  if (!user) return null;

  const ref = doc(db, "profiles", user.uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

// Brug denne i EditProfileScreen (Gem navn)
export async function upsertMyProfile(partial = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error("Ingen bruger er logget ind.");

  const ref = doc(db, "profiles", user.uid);

  // Firestore tåler ikke undefined -> altid string
  const data = {
    displayName: (partial.displayName ?? "").trim() || user.displayName || "Bruger",
    email: (partial.email ?? user.email ?? "") || "",
    updatedAt: serverTimestamp(),
  };

  // Opret hvis den ikke findes + merge så vi ikke overskriver andet
  await setDoc(ref, data, { merge: true });

  return data;
}

// Hvis du stadig bruger den andre steder, så behold den.
// Her sikrer vi også, at profilen eksisterer først.
export async function updateMyProfile(partial = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error("Ingen bruger er logget ind.");

  await ensureProfile();

  // fjern undefined felter så updateDoc ikke crasher
  const clean = Object.fromEntries(
    Object.entries(partial).filter(([, v]) => v !== undefined)
  );

  await updateDoc(doc(db, "profiles", user.uid), {
    ...clean,
    updatedAt: serverTimestamp(),
  });
}

