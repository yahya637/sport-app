import React, { useMemo, useState } from "react";
import { View, Text, FlatList, Image, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { g } from "../../styles/styles";
import BottomBar from "../../components/BottomBar";
import PrimaryButton from "../../components/PrimaryButton";

import { useBookings } from "../../store/bookings";
import { SPORTS, SPORT_IMAGES } from "../../data/sports";
import { getVenueById } from "../../data/venues";

import { ensureSignedIn, logout } from "../../services/auth";
import { getMyProfile } from "../../services/profile";
import { auth } from "../../firebase";

export default function ProfileScreen({ navigation }) {
  const { bookings = [], refreshFromRemote, clearLocal } = useBookings();

  const [profile, setProfile] = useState(null);
  const [memberSince, setMemberSince] = useState(null);

  const loadAll = async () => {
   

    const p = await getMyProfile();
    setProfile(p);

    const createdAt = p?.createdAt?.toDate ? p.createdAt.toDate() : null;
    setMemberSince(createdAt ? createdAt.toLocaleDateString("da-DK") : null);

    await refreshFromRemote();
  };

  useFocusEffect(
    React.useCallback(() => {
      loadAll();
    }, [])
  );

  const sportName = (id) => SPORTS.find((s) => s.id === id)?.name || "Sport";
  const venuePrice = (venueId) => getVenueById(venueId)?.pricePerHour ?? 0;
  const toDate = (b) =>
    new Date(`${b?.dateISO ?? "2100-01-01"}T${b?.time ?? "00:00"}:00`);

  const { totalCount, hoursBooked, totalSpent, upcomingCount, recent5 } =
    useMemo(() => {
      const totalCount = bookings.length;
      const hoursBooked = totalCount;

      let totalSpent = 0;
      const now = new Date();
      let upcomingCount = 0;

      bookings.forEach((b) => {
        const p = b?.pricePerHour ?? b?.price ?? venuePrice(b?.venueId);
        totalSpent += Number.isFinite(p) ? p : 0;

        const d = toDate(b);
        if (d >= now) upcomingCount++;
      });

      const recent5 = [...bookings]
        .sort((a, b) => toDate(b) - toDate(a))
        .slice(0, 5);

      return { totalCount, hoursBooked, totalSpent, upcomingCount, recent5 };
    }, [bookings]);

  const user = auth.currentUser;
  const isAnonymous = !!user?.isAnonymous;

  const displayName = profile?.displayName || "Bruger";
  const email = profile?.email || user?.email || "";

  const handleAuthButton = async () => {
    if (isAnonymous) {
      navigation.navigate("Auth");
      return;
    }

    Alert.alert("Log ud", "Vil du logge ud?", [
      { text: "Annuller", style: "cancel" },
      {
        text: "Log ud",
        style: "destructive",
        onPress: async () => {
          await logout();

          // ryd UI state så du ikke ser gamle bookings efter logout
          clearLocal();

          // lav ny anonym user + reload alt
          await loadAll();
        },
      },
    ]);
  };

  return (
    <View style={[g.screen, g.screenWithBar]}>
      <Text style={g.title}>Min profil</Text>

      {/* Brugeroplysninger */}
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

        <View style={[g.rowBetween, { marginTop: 10 }]}>
          <PrimaryButton
            title="Rediger profil"
            onPress={() => navigation.navigate("EditProfile")}
            style={[g.btn, { flex: 1, marginRight: 8 }]}
          />
          <PrimaryButton
            title={isAnonymous ? "Login / Opret" : "Log ud"}
            onPress={handleAuthButton}
            style={[
              g.btn,
              {
                flex: 1,
                backgroundColor: isAnonymous ? "#0b2940" : "#ef4444",
                borderWidth: 1,
              },
            ]}
            textStyle={g.btnTextDark}
          />
        </View>
      </View>

      {/* Stats */}
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

      {/* Seneste bookinger */}
      <View style={g.card}>
        <Text style={g.h2}>Seneste bookinger</Text>
        {recent5.length === 0 ? (
          <Text style={[g.muted, { marginTop: 6 }]}>
            Ingen bookinger endnu.
          </Text>
        ) : (
          <FlatList
            data={recent5}
            keyExtractor={(item, idx) => item?.id || `${idx}`}
            renderItem={({ item }) => {
              const venue = getVenueById(item?.venueId);
              const price =
                item?.pricePerHour ?? item?.price ?? venuePrice(item?.venueId);

              const sName = item?.sportId ? sportName(item.sportId) : "Sport";
              const img =
                item?.sportId && SPORT_IMAGES[item?.sportId]
                  ? typeof SPORT_IMAGES[item?.sportId] === "string"
                    ? { uri: SPORT_IMAGES[item?.sportId] }
                    : SPORT_IMAGES[item?.sportId]
                  : null;

              return (
                <View style={g.listItem}>
                  {img ? (
                    <Image source={img} style={g.listThumb} />
                  ) : (
                    <View
                      style={[
                        g.listThumb,
                        { backgroundColor: "#111827" },
                      ]}
                    />
                  )}

                  <View style={{ flex: 1 }}>
                    <Text style={g.listTitle}>
                      {item?.venueName || venue?.name || "Ukendt venue"}
                    </Text>
                    <Text style={g.listSubtitle}>
                      {sName} • {item?.dateISO || "—"}
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

      <BottomBar navigation={navigation} active="profile" />
    </View>
  );
}


