import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type ScrollViewInstance,
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
const ERROR_COLOR = "#B3261E";

type FieldName =
  | "firstName"
  | "lastName"
  | "username"
  | "email"
  | "password"
  | "confirmPassword";

type FieldErrors = Partial<Record<FieldName, string>>;

interface RegisterFormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

function validateRegisterData(data: RegisterFormData): FieldErrors {
  const errors: FieldErrors = {};

  if (!data.firstName) {
    errors.firstName = "Informe o primeiro nome.";
  }

  if (!data.lastName) {
    errors.lastName = "Informe o último nome.";
  }

  if (!data.username) {
    errors.username = "Informe o nome de usuário.";
  } else if (data.username.length < 3) {
    errors.username = "O nome de usuário deve ter pelo menos 3 caracteres.";
  }

  if (!data.email) {
    errors.email = "Informe o e-mail.";
  }

  if (!data.password) {
    errors.password = "Informe a senha.";
  } else if (data.password.length < 6) {
    errors.password = "A senha deve ter pelo menos 6 caracteres.";
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = "Confirme a senha.";
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "As senhas não coincidem.";
  }

  return errors;
}

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<FieldName | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
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
  const scrollView = useRef<ScrollViewInstance>(null);

  const closeToast = useCallback(() => setToast(null), []);

  const showToast = useCallback((type: ToastType, message: string) => {
    setToast({ type, message });
  }, []);

  function clearFieldError(field: FieldName) {
    setFieldErrors((current) => {
      if (!current[field]) return current;

      const next = { ...current };
      delete next[field];
      return next;
    });

    setFormError("");
  }

  function getFocusProps(field: FieldName) {
    return {
      onFocus: () => setFocusedField(field),
      onBlur: () =>
        setFocusedField((current) => (current === field ? null : current)),
    };
  }

  useEffect(() => {
    if (focusedField !== "password" && focusedField !== "confirmPassword") {
      return;
    }

    const timeout = setTimeout(() => {
      scrollView.current?.scrollToEnd({ animated: true });
    }, 300);

    return () => clearTimeout(timeout);
  }, [focusedField]);

  async function handleRegister() {
    if (isSubmitting) return;

    const data: RegisterFormData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: username.trim(),
      email: email.trim(),
      password,
      confirmPassword,
    };

    const errors = validateRegisterData(data);

    setFieldErrors(errors);
    setFormError("");

    if (Object.keys(errors).length > 0) return;

    if (!API_URL) {
      setFormError("A URL da API não foi configurada no arquivo .env.");
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
      setFormError(
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
        <View pointerEvents="none" style={styles.circleTop} />
        <View pointerEvents="none" style={styles.circleBottom} />

        <View style={styles.header}>
          <TouchableOpacity
            accessibilityLabel="Abrir menu"
            accessibilityRole="button"
            activeOpacity={0.8}
            hitSlop={8}
            onPress={() => setIsMenuVisible(true)}
            style={styles.headerButton}
          >
            <Ionicons name="menu" size={24} color={COLORS.secondaryBeige} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            MUSEU DE <Text style={styles.headerTitleHighlight}>BIRIGUI</Text>
          </Text>

          <TouchableOpacity
            accessibilityLabel="Voltar"
            accessibilityRole="button"
            activeOpacity={0.8}
            hitSlop={8}
            onPress={() => router.back()}
            style={styles.headerButton}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={COLORS.secondaryBeige}
            />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={styles.loginArea}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : Platform.OS === "android"
                ? "height"
                : undefined
          }
        >
          <ScrollView
            ref={scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.loginCard}>
              <View style={styles.logoBadge}>
                <Ionicons
                  name="person-add-outline"
                  size={30}
                  color={COLORS.yellowIcon}
                />
              </View>

              <Text style={styles.title}>Crie sua conta</Text>

              <Text style={styles.subtitle}>
                Preencha seus dados para se cadastrar e acessar o museu.
              </Text>

              <View style={styles.form}>
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name="person-outline"
                    size={16}
                    color={COLORS.primaryBrown}
                  />
                  <Text style={styles.sectionTitle}>Seus dados</Text>
                </View>

                <Text style={styles.label}>Primeiro nome</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedField === "firstName" && styles.inputWrapperFocused,
                    !!fieldErrors.firstName && styles.inputWrapperError,
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={18}
                    color={COLORS.primaryBrown}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    ref={firstNameInput}
                    style={styles.input}
                    value={firstName}
                    onChangeText={(value) => {
                      setFirstName(value);
                      clearFieldError("firstName");
                    }}
                    placeholder="Digite seu primeiro nome"
                    placeholderTextColor="rgba(154, 76, 22, 0.55)"
                    selectionColor={COLORS.primaryBrown}
                    autoCapitalize="words"
                    maxLength={100}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => lastNameInput.current?.focus()}
                    {...getFocusProps("firstName")}
                  />
                </View>
                {!!fieldErrors.firstName && (
                  <Text style={styles.fieldError}>{fieldErrors.firstName}</Text>
                )}

                <Text style={styles.label}>Último nome</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedField === "lastName" && styles.inputWrapperFocused,
                    !!fieldErrors.lastName && styles.inputWrapperError,
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={18}
                    color={COLORS.primaryBrown}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    ref={lastNameInput}
                    style={styles.input}
                    value={lastName}
                    onChangeText={(value) => {
                      setLastName(value);
                      clearFieldError("lastName");
                    }}
                    placeholder="Digite seu último nome"
                    placeholderTextColor="rgba(154, 76, 22, 0.55)"
                    selectionColor={COLORS.primaryBrown}
                    autoCapitalize="words"
                    maxLength={100}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => usernameInput.current?.focus()}
                    {...getFocusProps("lastName")}
                  />
                </View>
                {!!fieldErrors.lastName && (
                  <Text style={styles.fieldError}>{fieldErrors.lastName}</Text>
                )}

                <Text style={styles.label}>Nome de usuário</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedField === "username" && styles.inputWrapperFocused,
                    !!fieldErrors.username && styles.inputWrapperError,
                  ]}
                >
                  <Ionicons
                    name="at-outline"
                    size={18}
                    color={COLORS.primaryBrown}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    ref={usernameInput}
                    style={styles.input}
                    value={username}
                    onChangeText={(value) => {
                      setUsername(value);
                      clearFieldError("username");
                    }}
                    placeholder="Escolha um nome de usuário"
                    placeholderTextColor="rgba(154, 76, 22, 0.55)"
                    selectionColor={COLORS.primaryBrown}
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={100}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => emailInput.current?.focus()}
                    {...getFocusProps("username")}
                  />
                </View>
                {!!fieldErrors.username && (
                  <Text style={styles.fieldError}>{fieldErrors.username}</Text>
                )}

                <Text style={styles.label}>E-mail</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedField === "email" && styles.inputWrapperFocused,
                    !!fieldErrors.email && styles.inputWrapperError,
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color={COLORS.primaryBrown}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    ref={emailInput}
                    style={styles.input}
                    value={email}
                    onChangeText={(value) => {
                      setEmail(value);
                      clearFieldError("email");
                    }}
                    placeholder="voce@email.com"
                    placeholderTextColor="rgba(154, 76, 22, 0.55)"
                    selectionColor={COLORS.primaryBrown}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    maxLength={100}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => passwordInput.current?.focus()}
                    {...getFocusProps("email")}
                  />
                </View>
                {!!fieldErrors.email && (
                  <Text style={styles.fieldError}>{fieldErrors.email}</Text>
                )}

                <View style={[styles.sectionHeader, styles.sectionHeaderSpaced]}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={16}
                    color={COLORS.primaryBrown}
                  />
                  <Text style={styles.sectionTitle}>Segurança</Text>
                </View>

                <Text style={styles.label}>Senha</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedField === "password" && styles.inputWrapperFocused,
                    !!fieldErrors.password && styles.inputWrapperError,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={COLORS.primaryBrown}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    ref={passwordInput}
                    style={styles.input}
                    value={password}
                    onChangeText={(value) => {
                      setPassword(value);
                      clearFieldError("password");
                      clearFieldError("confirmPassword");
                    }}
                    placeholder="Mínimo de 6 caracteres"
                    placeholderTextColor="rgba(154, 76, 22, 0.55)"
                    selectionColor={COLORS.primaryBrown}
                    secureTextEntry={!showPassword}
                    textContentType="newPassword"
                    autoCapitalize="none"
                    maxLength={100}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => confirmPasswordInput.current?.focus()}
                    {...getFocusProps("password")}
                  />
                  <TouchableOpacity
                    accessibilityLabel={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                    accessibilityRole="button"
                    activeOpacity={0.7}
                    hitSlop={8}
                    onPress={() => setShowPassword((current) => !current)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={COLORS.primaryBrown}
                    />
                  </TouchableOpacity>
                </View>
                {!!fieldErrors.password && (
                  <Text style={styles.fieldError}>{fieldErrors.password}</Text>
                )}

                <Text style={styles.label}>Confirme a senha</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedField === "confirmPassword" &&
                      styles.inputWrapperFocused,
                    !!fieldErrors.confirmPassword && styles.inputWrapperError,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={COLORS.primaryBrown}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    ref={confirmPasswordInput}
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={(value) => {
                      setConfirmPassword(value);
                      clearFieldError("confirmPassword");
                    }}
                    placeholder="Repita a senha"
                    placeholderTextColor="rgba(154, 76, 22, 0.55)"
                    selectionColor={COLORS.primaryBrown}
                    secureTextEntry={!showConfirmPassword}
                    textContentType="newPassword"
                    autoCapitalize="none"
                    maxLength={100}
                    returnKeyType="done"
                    onSubmitEditing={handleRegister}
                    {...getFocusProps("confirmPassword")}
                  />
                  <TouchableOpacity
                    accessibilityLabel={
                      showConfirmPassword
                        ? "Ocultar confirmação de senha"
                        : "Mostrar confirmação de senha"
                    }
                    accessibilityRole="button"
                    activeOpacity={0.7}
                    hitSlop={8}
                    onPress={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? "eye-off-outline" : "eye-outline"
                      }
                      size={20}
                      color={COLORS.primaryBrown}
                    />
                  </TouchableOpacity>
                </View>
                {!!fieldErrors.confirmPassword && (
                  <Text style={styles.fieldError}>
                    {fieldErrors.confirmPassword}
                  </Text>
                )}

                {!!formError && (
                  <View style={styles.formErrorBox}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={18}
                      color={ERROR_COLOR}
                    />
                    <Text style={styles.formError}>{formError}</Text>
                  </View>
                )}

                <TouchableOpacity
                  accessibilityRole="button"
                  activeOpacity={0.85}
                  style={[
                    styles.registerButton,
                    isSubmitting && styles.registerButtonDisabled,
                  ]}
                  onPress={handleRegister}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={COLORS.textDark} />
                  ) : (
                    <>
                      <Ionicons
                        name="person-add-outline"
                        size={20}
                        color={COLORS.textDark}
                      />
                      <Text style={styles.registerButtonText}>REGISTRAR</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  accessibilityRole="button"
                  activeOpacity={0.7}
                  onPress={() => router.push("/login")}
                  style={styles.loginLink}
                >
                  <Text style={styles.loginLinkText}>
                    Já tem uma conta?{" "}
                    <Text style={styles.loginLinkHighlight}>Faça login</Text>
                  </Text>
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
    overflow: "hidden",
  },

  circleTop: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(227, 218, 201, 0.08)",
  },

  circleBottom: {
    position: "absolute",
    bottom: -90,
    left: -70,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(255, 193, 7, 0.08)",
  },

  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },

  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(227, 218, 201, 0.14)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.secondaryBeige,
    letterSpacing: 0.4,
  },

  headerTitleHighlight: {
    color: COLORS.yellowIcon,
  },

  loginArea: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 32,
  },

  loginCard: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    backgroundColor: COLORS.secondaryBeige,
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
  },

  logoBadge: {
    alignSelf: "center",
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.primaryBrown,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  title: {
    textAlign: "center",
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.textDark,
  },

  subtitle: {
    textAlign: "center",
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.primaryBrown,
    marginTop: 6,
    marginBottom: 22,
    paddingHorizontal: 8,
  },

  form: {
    width: "100%",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },

  sectionHeaderSpaced: {
    marginTop: 10,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.primaryBrown,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textDark,
    marginBottom: 6,
    marginLeft: 4,
  },

  inputWrapper: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D8CE8D",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "transparent",
    paddingHorizontal: 14,
    marginBottom: 14,
  },

  inputWrapperFocused: {
    borderColor: COLORS.primaryBrown,
  },

  inputWrapperError: {
    borderColor: ERROR_COLOR,
  },

  inputIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 0,
    paddingVertical: 0,
    fontSize: 15,
    color: COLORS.textDark,
  },

  fieldError: {
    color: ERROR_COLOR,
    fontSize: 12,
    marginTop: -8,
    marginBottom: 12,
    marginLeft: 4,
  },

  formErrorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(179, 38, 30, 0.08)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },

  formError: {
    flex: 1,
    color: ERROR_COLOR,
    fontSize: 13,
    lineHeight: 18,
  },

  registerButton: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.yellowIcon,
    borderRadius: 16,
    marginTop: 4,
    shadowColor: COLORS.primaryBrown,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },

  registerButtonDisabled: {
    opacity: 0.7,
  },

  registerButtonText: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.textDark,
    letterSpacing: 0.5,
  },

  loginLink: {
    alignSelf: "center",
    marginTop: 18,
    paddingVertical: 4,
  },

  loginLinkText: {
    fontSize: 13,
    color: COLORS.primaryBrown,
  },

  loginLinkHighlight: {
    fontWeight: "800",
    textDecorationLine: "underline",
  },
});