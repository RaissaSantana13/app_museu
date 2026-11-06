import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { COLORS } from "../constants/theme";

// 1. Adicionamos a interface com propriedades opcionais (?)
interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  onClear?: () => void;
}

// 2. Recebemos as propriedades na função (se não enviarem placeholder, o padrão será "Search")
export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search",
  onSubmit,
  onClear,
}: SearchBarProps) {
  const searchIcon = (
    <Ionicons name="search" size={20} color={COLORS.secondaryBeige} />
  );

  return (
    <View style={styles.container}>
      {onSubmit ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Buscar" onPress={onSubmit}>
          {searchIcon}
        </Pressable>
      ) : searchIcon}
      <TextInput
        style={styles.input}
        value={value} // Passando o valor
        onChangeText={onChangeText} // Passando a função de digitar
        placeholder={placeholder}
        accessibilityLabel={placeholder}
        onSubmitEditing={onSubmit}
        returnKeyType={onSubmit ? "search" : undefined}
        placeholderTextColor={COLORS.secondaryBeige}
      />
      {onClear && value ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Limpar busca" onPress={onClear}>
          <Ionicons name="close" size={20} color={COLORS.secondaryBeige} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.secondaryBeige,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 20,
    marginTop: 16,
  },
  input: { flex: 1, color: COLORS.secondaryBeige, fontSize: 16 },
});
