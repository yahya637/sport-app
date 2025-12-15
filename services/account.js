// services/account.js
import { auth, db } from "../firebase";
import { deleteUser } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { getMyBookings, deleteMyBooking } from "./bookings";

export async function deleteMyAccountAndData() {
  const user = auth.currentUser;
  if (!user) throw new Error("Ingen bruger er logget ind.");

  // 1) slet alle bookings + slots (kun brugerens egne)
  const mine = await getMyBookings();
  for (const b of mine) {
    await deleteMyBooking(b.id, b.slotKey);
  }

  // 2) slet profile-doc (hvis den findes)
  await deleteDoc(doc(db, "profiles", user.uid)).catch(() => {});

  // 3) slet auth-bruger
  await deleteUser(user);
}

