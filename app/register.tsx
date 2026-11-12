import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputInstance,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MenuModal } from "../components/MenuModal";
import { Toast, type ToastType } from "../components/Toast";
import { COLORS } from "../constants/theme";

const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, "");

async function getRegisterErrorMessage(response: Response) {
  const fallback = `Não foi possível realizar o cadastro (${response.status}).`;

  if (response.status === 429) {
    return "Muitas tentativas. Aguarde um momento e tente novamente.";
  }

  if (response.status >= 500) {
    return "Não foi possível realizar o cadastro. Tente novamente mais tarde.";
  }

  try {
    const body = (await response.json()) as {
      mensagem?: unknown;
      erro?: unknown;
      message?: unknown;
    };

    const message = body.mensagem ?? body.erro ?? body.message;

    if (Array.isArray(message)) {
      return message
        .filter((item): item is string => typeof item === "string")
        .join("\n");
    }

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  } catch {
    return fallback;
  }

  return fallback;
}

async function getRegisterSuccessMessage(response: Response) {
  try {
    const body = (await response.json()) as { mensagem?: unknown };

    if (typeof body.mensagem === "string" && body.mensagem.trim()) {
      return body.mensagem;
    }
  } catch {
    return "Usuário cadastrado com sucesso!";
  }

  return "Usuário cadastrado com sucesso!";
}

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    type: ToastType;
    message: string;
  } | null>(null);

  const firstNameInput = useRef<TextInputInstance>(null);
  const lastNameInput = useRef<TextInputInstance>(null);
  const usernameInput = useRef<TextInputInstance>(null);
  const emailInput = useRef<TextInputInstance>(null);
  const passwordInput = useRef<TextInputInstance>(null);
  const confirmPasswordInput = useRef<TextInputInstance>(null);

  const closeToast = useCallback(() => setToast(null), []);

  const showToast = useCallback((type: ToastType, message: string) => {
    setToast({ type, message });
  }, []);

  async function handleRegister() {
    if (isSubmitting) return;

    const data = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: username.trim(),
      email: email.trim(),
      password,
      confirmPassword,
    };

    if (
      !data.firstName ||
      !data.lastName ||
      !data.username ||
      !data.email ||
      !data.password ||
      !data.confirmPassword
    ) {
      showToast("error", "Preencha todos os campos obrigatórios.");
      return;
    }

    if (data.username.length < 3) {
      showToast("error", "O nome de usuário deve ter pelo menos 3 caracteres.");
      return;
    }

    if (data.password.length < 6) {
      showToast("error", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (data.password !== data.confirmPassword) {
      showToast("error", "As senhas não coincidem.");
      return;
    }

    if (!API_URL) {
      showToast("error", "A URL da API não foi configurada no arquivo .env.");
      return;
    }

    Keyboard.dismiss();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/v1/credentials/register`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const message = await getRegisterErrorMessage(response);
        showToast("error", message);
        return;
      }

      const message = await getRegisterSuccessMessage(response);
      showToast("success", message);
    } catch {
      showToast(
        "error",
        "Não foi possível conectar à API. Verifique sua conexão e tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function goToLogin() {
    closeToast();
    router.replace("/login");
  }

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
                  autoCapitalize="none"
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
                  maxLength={100}
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
                  maxLength={100}
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
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
                  style={[
                    styles.registerButton,
                    isSubmitting && styles.registerButtonDisabled,
                  ]}
                  onPress={handleRegister}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#000000" />
                  ) : (
                    <Text style={styles.registerButtonText}>REGISTRAR</Text>
                  )}
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

      <Toast
        visible={toast !== null}
        type={toast?.type}
        message={toast?.message ?? ""}
        actionLabel={toast?.type === "success" ? "IR PARA LOGIN" : undefined}
        onAction={goToLogin}
        onClose={closeToast}
        duration={toast?.type === "error" ? 5000 : 0}
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

  registerButtonDisabled: {
    opacity: 0.7,
  },

  registerButtonText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#000000",
  },
});