// services/bookings.js
import { auth, db } from "../firebase";
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";



function makeSlotKey(venueId, dateISO, time) {
  const v = String(venueId || "").trim();
  const d = String(dateISO || "").trim();
  const t = String(time || "").trim();
  return `${v}__${d}__${t}`;
}

// Brug slots til at vise availability (så man ikke skal have adgang til andres bookings)
export async function getBookedSlotsForVenue(venueId, dateISO) {
  const q = query(
    collection(db, "slots"),
    where("venueId", "==", venueId),
    where("dateISO", "==", dateISO)
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data().time).filter(Boolean);
}

export async function createBooking({
  venueId,
  venueName,
  city,
  pricePerHour,
  dateISO,
  time,
}) {
  const user = auth.currentUser;
  if (!user) throw new Error("Ingen bruger er logget ind.");

  const slotKey = makeSlotKey(venueId, dateISO, time);
  const slotRef = doc(db, "slots", slotKey);

  const bookingRef = await runTransaction(db, async (transaction) => {
    const slotSnap = await transaction.get(slotRef);
    if (slotSnap.exists()) {
      throw new Error("Tiden er allerede booket. Vælg en anden.");
    }

    const newBookingRef = doc(collection(db, "bookings"));

    transaction.set(slotRef, {
      venueId,
      dateISO,
      time,
      bookedBy: user.uid,
      createdAt: serverTimestamp(),
    });

    transaction.set(newBookingRef, {
      userId: user.uid,
      venueId,
      venueName: venueName || "",
      city: city || "",
      pricePerHour: Number(pricePerHour) || 0,
      dateISO,
      time,
      slotKey,
      createdAt: serverTimestamp(),
    });

    return newBookingRef;
  });

  return { id: bookingRef.id, slotKey };
}


export async function getMyBookings() {
  const user = auth.currentUser;
  if (!user) return [];

  const q = query(
    collection(db, "bookings"),
    where("userId", "==", user.uid)
  );

  const snap = await getDocs(q);

  const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Sortér lokalt (createdAt kan være null hvis lige oprettet)
  rows.sort((a, b) => {
    const ta = a?.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
    const tb = b?.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
    return tb - ta;
  });

  return rows;
}


// Delete uden at skulle læse booking (slotKey kommer fra UI-listen)
export async function deleteMyBooking(bookingId, slotKey) {
  const user = auth.currentUser;
  if (!user) throw new Error("Ingen bruger er logget ind.");

  const bookingRef = doc(db, "bookings", bookingId);

  // Fallback hvis gamle bookings ikke har slotKey
  const fallbackSlotKey = slotKey || null;
  const slotRef = fallbackSlotKey ? doc(db, "slots", fallbackSlotKey) : null;

  await runTransaction(db, async (transaction) => {
    transaction.delete(bookingRef);
    if (slotRef) transaction.delete(slotRef);
  });
}

export async function deleteAllMyBookings() {
  const mine = await getMyBookings();
  for (const b of mine) {
    await deleteMyBooking(b.id, b.slotKey);
  }
}

