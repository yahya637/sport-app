// screens/SportFritid/EditProfileScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Alert } from "react-native";
import { g, colors } from "../../styles/styles";
import PrimaryButton from "../../components/PrimaryButton";
import { getMyProfile, upsertMyProfile } from "../../services/profile";
import { deleteMyAccountAndData } from "../../services/account";
import { useBookings } from "../../store/bookings";

export default function EditProfileScreen({ navigation }) {
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { clearLocal } = useBookings();

  useEffect(() => {
    (async () => {
      const p = await getMyProfile();
      setDisplayName(p?.displayName || "Bruger");
    })();
  }, []);

const save = async () => {
  const name = (displayName || "").trim();

  if (!name) {
    Alert.alert("Ugyldigt navn", "Skriv et navn først.");
    return;
  }

  try {
    setSaving(true);

    await upsertMyProfile({
      displayName: name,
    });

    // gå tilbage til Profile (useFocusEffect loader data igen)
    navigation.goBack();
  } catch (e) {
    Alert.alert("Fejl", e?.message || "Kunne ikke gemme navn.");
  } finally {
    setSaving(false);
  }
};


  const onDeleteAccount = () => {
    Alert.alert(
      "Slet konto",
      "Er du sikker? Dette sletter din profil og alle dine bookinger.",
      [
        { text: "Annuller", style: "cancel" },
        {
          text: "Slet",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteMyAccountAndData();
              clearLocal(); // ryd UI-cache med det samme
              // App.js skifter automatisk til AuthStack når user bliver null
            } catch (e) {
              Alert.alert("Fejl", e?.message || "Kunne ikke slette konto.");
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[g.screen, { paddingTop: 24 }]}>
      <Text style={g.title}>Rediger profil</Text>

      <View style={g.card}>
        <Text style={g.h2}>Navn</Text>

        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Dit navn"
          placeholderTextColor={colors.textMuted}
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            padding: 12,
            marginTop: 10,
            color: colors.text,
            backgroundColor: colors.surface,
          }}
        />

        <View style={{ marginTop: 12 }}>
          <PrimaryButton
            title={saving ? "Gemmer..." : "Gem"}
            onPress={save}
            style={[g.btn, { opacity: saving ? 0.7 : 1 }]}
            disabled={saving || deleting}
          />
        </View>

        <View style={{ marginTop: 12 }}>
          <PrimaryButton
            title={deleting ? "Sletter..." : "Slet konto"}
            onPress={onDeleteAccount}
            style={[g.btn, { backgroundColor: colors.danger }]}
            textStyle={g.btnTextDark}
            disabled={saving || deleting}
          />
        </View>
      </View>
    </View>
  );
}

