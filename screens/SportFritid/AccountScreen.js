import React from "react";
import { View, Text, Alert } from "react-native";
import { g, colors } from "../../styles/styles";
import PrimaryButton from "../../components/PrimaryButton";
import { logout } from "../../services/auth";
import { useBookings } from "../../store/bookings";

export default function AccountScreen() {
  const { clearLocal } = useBookings();

  const onLogout = () => {
    Alert.alert("Log ud", "Vil du logge ud?", [
      { text: "Annuller", style: "cancel" },
      {
        text: "Log ud",
        style: "destructive",
        onPress: async () => {
          await logout();
          clearLocal();
        },
      },
    ]);
  };

  return (
    <View style={g.screen}>
      <Text style={g.title}>Konto</Text>

      <View style={g.card}>
        <Text style={[g.text, { color: colors.textMuted, marginBottom: 12 }]}>
          Du kan logge ud her.
        </Text>

        <PrimaryButton
          title="Log ud"
          onPress={onLogout}
          style={{ backgroundColor: colors.danger }}
        />
      </View>
    </View>
  );
}

