import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../constants/theme";

export function ExhibitionCard({
  title,
  startDate,
  endDate,
  imageSource,
}: any) {
  return (
    <View style={styles.card}>
      <Image source={imageSource} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.date}>
          <Text style={styles.bold}>Início | </Text>
          {startDate}
        </Text>
        <Text style={styles.date}>
          <Text style={styles.bold}>Término | </Text>
          {endDate}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.secondaryBeige,
    borderRadius: 16,
    marginRight: 16,
    width: 180,
    overflow: "hidden",
  },
  image: { width: "100%", aspectRatio: 1, resizeMode: "cover" },
  info: { padding: 12 },
  title: {
    color: COLORS.textDark,
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  date: { color: COLORS.textDark, fontSize: 12, marginBottom: 2 },
  bold: { fontWeight: "bold" },
});
