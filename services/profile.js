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
  if (!user) return null;

  const ref = doc(db, "profiles", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const data = {
      displayName: user.displayName || "Bruger",
      email: user.email || "",
      createdAt: serverTimestamp(),
    };
    await setDoc(ref, data);
    return data;
  }

  return snap.data();
}

export async function getMyProfile() {
  const user = auth.currentUser;
  if (!user) return null;

  const snap = await getDoc(doc(db, "profiles", user.uid));
  return snap.exists() ? snap.data() : null;
}

export async function updateMyProfile(partial) {
  const user = auth.currentUser;
  if (!user) return;

  await updateDoc(doc(db, "profiles", user.uid), partial);
}

