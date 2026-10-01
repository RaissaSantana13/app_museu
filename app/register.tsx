import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MenuModal } from "../components/MenuModal";
import { COLORS } from "../constants/theme";

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const firstNameInput = useRef<TextInput>(null);
  const lastNameInput = useRef<TextInput>(null);
  const usernameInput = useRef<TextInput>(null);
  const emailInput = useRef<TextInput>(null);
  const passwordInput = useRef<TextInput>(null);
  const confirmPasswordInput = useRef<TextInput>(null);

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

        <KeyboardAvoidingView
          style={styles.loginArea}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <View style={styles.loginCard}>
              <Text style={styles.title}>MUSEU DE</Text>

              <Text style={styles.titleHighlight}>BIRIGUI</Text>

              <View style={styles.form}>
                <Text style={styles.label}>Primeiro nome:</Text>
                <TextInput
                  ref={firstNameInput}
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  maxLength={100}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => lastNameInput.current?.focus()}
                />

                <Text style={styles.label}>Último nome:</Text>
                <TextInput
                  ref={lastNameInput}
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  maxLength={100}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => usernameInput.current?.focus()}
                />

                <Text style={styles.label}>Username:</Text>
                <TextInput
                  ref={usernameInput}
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="words"
                  maxLength={100}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => emailInput.current?.focus()}
                />

                <Text style={styles.label}>E-mail:</Text>
                <TextInput
                  ref={emailInput}
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  maxLength={100}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => passwordInput.current?.focus()}
                />

                <Text style={styles.label}>Senha:</Text>
                <TextInput
                  ref={passwordInput}
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  textContentType="newPassword"
                  autoCapitalize="none"
                  maxLength={20}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => confirmPasswordInput.current?.focus()}
                />

                <Text style={styles.label}>Confirme a senha:</Text>
                <TextInput
                  ref={confirmPasswordInput}
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  textContentType="newPassword"
                  autoCapitalize="none"
                  maxLength={20}
                  returnKeyType="done"
                />

                <TouchableOpacity
                  onPress={() => router.push("/login")}
                  style={styles.loginButton}
                >
                  <Text style={styles.registerText}>
                    Já tem uma conta? Faça login
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.registerButton}
                  onPress={() => {
                    // lógica de registro
                  }}
                >
                  <Text style={styles.registerButtonText}>REGISTRAR</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 16,
  },

  loginCard: {
    backgroundColor: COLORS.secondaryBeige,
    marginHorizontal: 30,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 30,
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
    marginBottom: 28,
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

  loginButton: {
    alignSelf: "flex-start",
    marginTop: 0,
    marginBottom: 30,
  },

  registerText: {
    fontSize: 11,
    color: COLORS.primaryBrown,
    textDecorationLine: "underline",
  },

  registerButton: {
    height: 48,
    backgroundColor: COLORS.yellowIcon,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
  },

  registerButtonText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#000000",
  },
});