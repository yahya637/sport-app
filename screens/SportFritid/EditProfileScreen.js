// screens/SportFritid/EditProfileScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Alert } from "react-native";
import { g } from "../../styles/styles";
import PrimaryButton from "../../components/PrimaryButton";
import { getMyProfile, updateMyProfile } from "../../services/profile";

export default function EditProfileScreen({ navigation }) {
  const [displayName, setDisplayName] = useState("");

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
    await updateMyProfile({ displayName: name });
    navigation.goBack();
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
          style={{
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
            marginTop: 10,
          }}
        />

        <View style={{ marginTop: 12 }}>
          <PrimaryButton title="Gem" onPress={save} style={g.btn} />
        </View>
      </View>
    </View>
  );
}

