// services/auth.js
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { ensureProfile } from "./profile";

// efter createUserWithEmailAndPassword:
export async function signUp(email, password) {
  const res = await createUserWithEmailAndPassword(auth, email.trim(), password.trim());
  await ensureProfile();
  return res.user;
}

// efter signInWithEmailAndPassword:
export async function login(email, password) {
  const res = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
  await ensureProfile();
  return res.user;
}


export async function logout() {
  await signOut(auth);
}

