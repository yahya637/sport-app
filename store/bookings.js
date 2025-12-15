// store/bookings.js
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getMyBookings } from "../services/bookings";

const Ctx = createContext();

function keyFor(uid) {
  return `@bookings:${uid || "none"}`;
}

export function BookingsProvider({ children }) {
  const [bookings, setBookings] = useState([]);
  const [ready, setReady] = useState(false);
  const [loadingRemote, setLoadingRemote] = useState(false);
  const [uid, setUid] = useState(null);

  const storageKey = useMemo(() => keyFor(uid), [uid]);

  // Følg auth-state: når uid ændrer sig, så skift cache og UI
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      const newUid = user?.uid || null;

      // instant UI clean ved logout
      if (!newUid) setBookings([]);

      setUid(newUid);
    });
    return unsub;
  }, []);

  // Load cache for current uid
  useEffect(() => {
    (async () => {
      setReady(false);
      try {
        if (!uid) {
          setBookings([]);
          setReady(true);
          return;
        }
        const raw = await AsyncStorage.getItem(storageKey);
        setBookings(raw ? JSON.parse(raw) : []);
      } catch {
        setBookings([]);
      }
      setReady(true);
    })();
  }, [storageKey, uid]);

  // Persist cache when bookings change
  useEffect(() => {
    if (!ready) return;
    if (!uid) return;
    AsyncStorage.setItem(storageKey, JSON.stringify(bookings)).catch(() => {});
  }, [bookings, ready, uid, storageKey]);

  const refreshFromRemote = async () => {
    const current = auth.currentUser;
    if (!current) return;

    setLoadingRemote(true);
    try {
      const remote = await getMyBookings();
      setBookings(Array.isArray(remote) ? remote : []);
    } finally {
      setLoadingRemote(false);
    }
  };

  const add = (b) => setBookings((prev) => [b, ...prev]);
  const removeLocal = (id) => setBookings((prev) => prev.filter((b) => b.id !== id));
  const clearLocal = () => setBookings([]);

  return (
    <Ctx.Provider
      value={{
        bookings,
        ready,
        loadingRemote,
        refreshFromRemote,
        add,
        removeLocal,
        clearLocal,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useBookings = () => useContext(Ctx);

