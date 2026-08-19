import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { COLORS } from "../constants/theme";

export function SearchBar() {
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
        placeholder="Search"
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
