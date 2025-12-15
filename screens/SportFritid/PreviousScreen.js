// screens/SportFritid/PreviousScreen.js
import React from "react";
import { View, Text, FlatList, Pressable, StyleSheet, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { g, colors } from "../../styles/styles";
import BottomBar from "../../components/BottomBar";


import { useBookings } from "../../store/bookings";
import { deleteMyBooking } from "../../services/bookings";

const fmt = (iso, time) => {
  try {
    const d = new Date(iso);
    const dStr = d.toLocaleDateString("da-DK", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    return `${dStr} kl. ${time}`;
  } catch {
    return `${iso} kl. ${time}`;
  }
};

export default function PreviousScreen({ navigation }) {
  const { bookings, ready, loadingRemote, refreshFromRemote, removeLocal } = useBookings();

  const load = async () => {
   
    await refreshFromRemote();
  };

  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [])
  );

  const onDeleteOne = (item) => {
    Alert.alert("Slet booking", "Er du sikker?", [
      { text: "Annuller", style: "cancel" },
      {
        text: "Slet",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMyBooking(item.id, item.slotKey);
            removeLocal(item.id); // UI instant
          } catch (e) {
            Alert.alert("Fejl", e?.message || "Kunne ikke slette booking.");
          } finally {
            await refreshFromRemote(); // hold UI i sync
          }
        },
      },
    ]);
  };



  if (!ready || loadingRemote) {
    return (
      <View style={[g.screen, g.center]}>
        <Text style={{ color: colors.text }}>Indlæser…</Text>
      </View>
    );
  }

  return (
    <View style={[g.screen, g.screenWithBar]}>
      <Text style={g.title}>Mine bookinger</Text>

      {!bookings || bookings.length === 0 ? (
        <View style={[g.card, g.center]}>
          <Text style={{ color: colors.textMuted }}>Ingen bookinger endnu.</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={bookings}
            keyExtractor={(b) => b.id}
            contentContainerStyle={s.pb80}
            ItemSeparatorComponent={() => <View style={g.divider} />}
            renderItem={({ item }) => {
              const price = item?.pricePerHour ?? item?.price ?? 0;

              return (
                <View style={g.card}>
                  <View style={g.rowBetween}>
                    <Text style={[g.text, s.bold]}>{item.venueName || "Venue"}</Text>
                    <Text style={s.price}>{price} kr./t</Text>
                  </View>

                  <Text style={{ color: colors.textMuted }}>{item.city || "—"}</Text>

                  <Text style={[{ color: colors.text }, s.mt8]}>
                    {fmt(item.dateISO, item.time)}
                  </Text>

                  <View style={[g.rowBetween, s.mt10]}>
                    <Pressable
                      onPress={() => onDeleteOne(item)}
                      hitSlop={10}
                      style={s.linkHit}
                    >
                      <Text style={s.linkDanger}>Slet</Text>
                    </Pressable>
                    <View />
                  </View>
                </View>
              );
            }}
          />


        </>
      )}

      <BottomBar navigation={navigation} active="bookings" />
    </View>
  );
}

const s = StyleSheet.create({
  bold: { fontWeight: "800" },
  price: { fontWeight: "800", color: colors.text },
  mt8: { marginTop: 8 },
  mt10: { marginTop: 10 },
  pb80: { paddingBottom: 80 },
  linkHit: { paddingVertical: 4, paddingHorizontal: 2 },
  linkDanger: { color: colors.danger, fontWeight: "800" },
  linkMuted: { color: colors.textMuted, fontWeight: "800" },
});

