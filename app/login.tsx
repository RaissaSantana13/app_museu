import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MenuModal } from "../components/MenuModal";
import { COLORS } from "../constants/theme";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View
      style={[
        styles.mainContainer,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <View style={styles.background}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setIsMenuVisible(true)}>
            <Ionicons name="menu" size={32} color={COLORS.secondaryBeige} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons
              name="arrow-back"
              size={28}
              color={COLORS.secondaryBeige}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.loginArea}>
          <View style={styles.loginCard}>
            <Text style={styles.title}>MUSEU DE</Text>

            <Text style={styles.titleHighlight}>BIRIGUI</Text>

            <View style={styles.form}>
              <Text style={styles.label}>Conecte-se a sua conta:</Text>

              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.label}>Digite sua senha:</Text>

              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <TouchableOpacity
                onPress={() => router.push("/register")}
                style={styles.registerButton}
              >
                <Text style={styles.registerText}>
                  Não tem conta? cadastre-se
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => {
                  // lógica de login
                }}
              >
                <Text style={styles.loginButtonText}>LOGIN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <MenuModal
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.primaryBrown,
  },

  background: {
    flex: 1,
    backgroundColor: COLORS.primaryBrown,
  },

  header: {
    height: 70,
    top: -10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },

  loginArea: {
    flex: 1,
    justifyContent: "center",
  },

  loginCard: {
    backgroundColor: COLORS.secondaryBeige,
    marginHorizontal: 30,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 35,
    borderRadius: 36,
  },

  title: {
    textAlign: "center",
    fontSize: 30,
    fontWeight: "900",
    color: "#000000",
  },

  titleHighlight: {
    textAlign: "center",
    fontSize: 30,
    fontWeight: "900",
    color: COLORS.primaryBrown,
    marginTop: 2,
    marginBottom: 48,
  },

  form: {
    width: "100%",
  },

  label: {
    fontSize: 14,
    color: "#000000",
    marginBottom: 6,
  },

  input: {
    height: 40,
    backgroundColor: "#D8CE8D",
    borderRadius: 25,
    paddingHorizontal: 18,
    fontSize: 15,
    marginBottom: 12,
  },

  registerButton: {
    alignSelf: "flex-start",
    marginTop: 0,
    marginBottom: 30,
  },

  registerText: {
    fontSize: 11,
    color: COLORS.primaryBrown,
    textDecorationLine: "underline",
  },

  loginButton: {
    height: 48,
    backgroundColor: COLORS.yellowIcon,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
  },

  loginButtonText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#000000",
  },
});
