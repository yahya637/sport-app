import React, { useState } from "react";
import { View, Text, TextInput, Alert } from "react-native";
import { g, colors } from "../../styles/styles";
import PrimaryButton from "../../components/PrimaryButton";
import { login, signUp } from "../../services/auth";

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const e = (email || "").trim();
    const p = (password || "").trim();

    if (!e || !p) {
      Alert.alert("Manglende info", "Skriv email og password.");
      return;
    }
    if (p.length < 6) {
      Alert.alert("Password", "Password skal være mindst 6 tegn.");
      return;
    }

    try {
      setLoading(true);
      if (mode === "login") await login(e, p);
      else await signUp(e, p);
      // ingen navigation her hvis du bruger auth gate
    } catch (err) {
      Alert.alert("Fejl", err?.message || "Kunne ikke logge ind.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
  };

  return (
    <View style={g.screen}>
      <Text style={g.title}>{mode === "login" ? "Login" : "Opret bruger"}</Text>

      <View style={g.card}>
        <Text style={g.h2}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="email@eksempel.dk"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          keyboardType="email-address"
          selectionColor={colors.primary}
          style={inputStyle}
        />

        <Text style={[g.h2, { marginTop: 14 }]}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="mindst 6 tegn"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          selectionColor={colors.primary}
          style={inputStyle}
        />

        <View style={{ marginTop: 14 }}>
          <PrimaryButton
            title={loading ? "Arbejder..." : mode === "login" ? "Log ind" : "Opret"}
            onPress={submit}
            disabled={loading}
            style={{ opacity: loading ? 0.6 : 1 }}
          />
        </View>

        <Text
          onPress={() => setMode(mode === "login" ? "signup" : "login")}
          style={{ color: colors.textMuted, fontWeight: "700", marginTop: 12, alignSelf: "center" }}
        >
          {mode === "login" ? "Ingen bruger? Opret her" : "Har du en bruger? Login her"}
        </Text>
      </View>
    </View>
  );
}

