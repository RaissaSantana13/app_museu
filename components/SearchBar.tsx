import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { COLORS } from "../constants/theme";

// 1. Adicionamos a interface com propriedades opcionais (?)
interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
}

// 2. Recebemos as propriedades na função (se não enviarem placeholder, o padrão será "Search")
export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search",
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Ionicons
        name="search"
        size={20}
        color={COLORS.secondaryBeige}
        style={styles.icon}
      />
      <TextInput
        style={styles.input}
        value={value} // Passando o valor
        onChangeText={onChangeText} // Passando a função de digitar
        placeholder={placeholder}
        placeholderTextColor={COLORS.secondaryBeige}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.secondaryBeige,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 20,
    marginTop: 16,
  },
  icon: { marginRight: 8 },
  input: { flex: 1, color: COLORS.secondaryBeige, fontSize: 16 },
});
