// screens/SportFritid/ProfileScreen.js
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, Image, Alert } from "react-native";
import { g } from "../../styles/styles";
import BottomBar from "../../components/BottomBar";
import PrimaryButton from "../../components/PrimaryButton";
import { useBookings } from "../../store/bookings";
import { SPORTS, SPORT_IMAGES } from "../../data/sports";
import { getVenueById } from "../../data/venues";
import { useFocusEffect } from "@react-navigation/native";
import { ensureSignedIn } from "../../services/auth";
import { ensureProfile, getMyProfile } from "../../services/profile";
import { auth } from "../../firebase";

export default function ProfileScreen({ navigation }) {
  const { bookings = [], clear } = useBookings();

  const [profile, setProfile] = useState(null);
  const [memberSince, setMemberSince] = useState(null);

  const loadProfile = async () => {
    await ensureSignedIn();
    await ensureProfile();

    const p = await getMyProfile();
    setProfile(p);

    const createdAt = p?.createdAt?.toDate ? p.createdAt.toDate() : null;
    setMemberSince(createdAt ? createdAt.toLocaleDateString("da-DK") : null);
  };

useFocusEffect(
  React.useCallback(() => {
    loadProfile();
  }, [])
);

  const sportName = (id) => SPORTS.find((s) => s.id === id)?.name || "Ukendt";
  const venuePrice = (venueId) => getVenueById(venueId)?.pricePerHour ?? 0;
  const toDate = (b) =>
    new Date(`${b?.date ?? "2100-01-01"}T${b?.time ?? "00:00"}:00`);

  const { totalCount, hoursBooked, totalSpent, upcomingCount, recent5 } =
    useMemo(() => {
      const totalCount = bookings.length;
      const hoursBooked = totalCount;

      let totalSpent = 0;
      const now = new Date();
      let upcomingCount = 0;

      bookings.forEach((b) => {
        const p = b?.pricePerHour ?? venuePrice(b?.venueId);
        totalSpent += Number.isFinite(p) ? p : 0;

        const d = toDate(b);
        if (d >= now) upcomingCount++;
      });

      const recent5 = [...bookings]
        .sort((a, b) => toDate(b) - toDate(a))
        .slice(0, 5);

      return { totalCount, hoursBooked, totalSpent, upcomingCount, recent5 };
    }, [bookings]);

  const handleClear = () => {
    Alert.alert("Ryd alle bookinger", "Er du sikker?", [
      { text: "Annuller", style: "cancel" },
      { text: "Ryd", style: "destructive", onPress: () => clear() },
    ]);
  };

  const displayName = profile?.displayName || "Bruger";
  const email = profile?.email || auth.currentUser?.email || "";

  return (
    <View style={[g.screen, g.screenWithBar]}>
      <Text style={g.title}>Min profil</Text>

      <View style={g.card}>
        <Text style={g.h2}>Bruger</Text>
        <Text style={g.text}>
          <Text style={g.semibold}>Navn: </Text>
          {displayName}
        </Text>
        <Text style={g.text}>
          <Text style={g.semibold}>Email: </Text>
          {email || "Ingen (anonym)"}
        </Text>
        <Text style={g.text}>
          <Text style={g.semibold}>Medlem siden: </Text>
          {memberSince || "—"}
        </Text>

        <View style={[g.rowBetween, { marginTop: 8 }]}>
          <PrimaryButton
            title="Rediger profil"
            onPress={() => navigation.navigate("EditProfile")}
            style={[g.btn, { flex: 1, marginRight: 8 }]}
          />
          <PrimaryButton
            title="Notifikationer"
            onPress={() => Alert.alert("Ikke klar", "Notifikationer kommer senere.")}
            style={[g.btn, { flex: 1, backgroundColor: "#0b2940", borderWidth: 1 }]}
            textStyle={g.btnTextDark}
          />
        </View>

        <View style={{ marginTop: 10 }}>
          <PrimaryButton
            title="Opdater profil"
            onPress={loadProfile}
            style={[g.btn, { backgroundColor: "#111827" }]}
          />
        </View>
      </View>

      <View style={g.statsGrid}>
        <View style={g.statCard}>
          <Text style={g.statValue}>{totalCount}</Text>
          <Text style={g.statLabel}>Bookinger i alt</Text>
        </View>
        <View style={g.statCard}>
          <Text style={g.statValue}>{upcomingCount}</Text>
          <Text style={g.statLabel}>Kommende</Text>
        </View>
        <View style={g.statCard}>
          <Text style={g.statValue}>{hoursBooked}</Text>
          <Text style={g.statLabel}>Timer</Text>
        </View>
        <View style={g.statCard}>
          <Text style={g.statValue}>{totalSpent} kr</Text>
          <Text style={g.statLabel}>Forbrug</Text>
        </View>
      </View>

      <View style={g.card}>
        <Text style={g.h2}>Seneste bookinger</Text>
        {recent5.length === 0 ? (
          <Text style={[g.muted, { marginTop: 6 }]}>Ingen bookinger endnu.</Text>
        ) : (
          <FlatList
            data={recent5}
            keyExtractor={(item, idx) =>
              item?.id || `${item?.venueId}-${item?.date}-${item?.time}-${idx}`
            }
            renderItem={({ item }) => {
              const venue = getVenueById(item?.venueId);
              const sName = sportName(item?.sportId);
              const price = item?.pricePerHour ?? venuePrice(item?.venueId);
              const img =
                typeof SPORT_IMAGES[item?.sportId] === "string"
                  ? { uri: SPORT_IMAGES[item?.sportId] }
                  : SPORT_IMAGES[item?.sportId];

              return (
                <View style={g.listItem}>
                  <Image source={img} style={g.listThumb} />
                  <View style={{ flex: 1 }}>
                    <Text style={g.listTitle}>{venue?.name || "Ukendt venue"}</Text>
                    <Text style={g.listSubtitle}>
                      {sName} • {item?.date || "—"}
                      {item?.time ? ` • ${item.time}` : ""}
                    </Text>
                  </View>
                  <Text style={g.listPrice}>
                    {Number.isFinite(price) ? price : 0} kr
                  </Text>
                </View>
              );
            }}
            ItemSeparatorComponent={() => <View style={g.separator} />}
          />
        )}
      </View>

      <View style={[g.rowBetween, { marginTop: 8 }]}>
        <PrimaryButton
          title="Ryd alle"
          onPress={handleClear}
          style={[g.btn, { flex: 1, backgroundColor: "#ef4444" }]}
        />
      </View>

      <BottomBar navigation={navigation} active="profile" />
    </View>
  );
}

