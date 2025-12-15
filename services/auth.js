// services/auth.js
import { auth } from "../firebase";
import { signInAnonymously } from "firebase/auth";

export async function ensureSignedIn() {
  if (auth.currentUser) return auth.currentUser;
  const res = await signInAnonymously(auth);
  return res.user;
}

