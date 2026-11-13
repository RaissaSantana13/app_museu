import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MenuModal } from "../components/MenuModal";
import { COLORS } from "../constants/theme";
import { login } from "../services/authService";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Estados da tela
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Função responsável pela autenticação
  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Atenção", "Preencha o e-mail e a senha.");
      return;
    }

    try {
      setLoading(true);

      // Requisição para a API NestJS
      const response = await login(email.trim(), password);

      console.log("Usuário autenticado:", response.data);

      Alert.alert("Sucesso", "Login realizado com sucesso!");

      // Redirecionamento será configurado depois
    } catch (error) {
      console.error("Erro ao realizar login:", error);

      Alert.alert(
        "Erro no login",
        error instanceof Error
          ? error.message
          : "Não foi possível realizar o login.",
      );
    } finally {
      setLoading(false);
    }
  };

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
        {/* Cabeçalho */}
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

        {/* Área de login */}
        <View style={styles.loginArea}>
          <View style={styles.loginCard}>
            <Text style={styles.title}>MUSEU DE</Text>

            <Text style={styles.titleHighlight}>BIRIGUI</Text>

            <View style={styles.form}>
              {/* Campo de e-mail */}
              <Text style={styles.label}>Conecte-se a sua conta:</Text>

              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Digite seu e-mail"
                placeholderTextColor="#777777"
                editable={!loading}
              />

              {/* Campo de senha */}
              <Text style={styles.label}>Digite sua senha:</Text>

              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Digite sua senha"
                placeholderTextColor="#777777"
                editable={!loading}
              />

              {/* Cadastro */}
              <TouchableOpacity
                onPress={() => router.push("/register")}
                style={styles.registerButton}
              >
                <Text style={styles.registerText}>
                  Não tem conta? cadastre-se
                </Text>
              </TouchableOpacity>

              {/* Botão de login */}
              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#000000" />
                ) : (
                  <Text style={styles.loginButtonText}>LOGIN</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Menu lateral */}
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
