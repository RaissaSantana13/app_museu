import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../constants/theme";

export function ArtworkCard({ title, artist, year, imageSource }: any) {
  return (
    <View style={styles.card}>
      <Image source={imageSource} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle}>
          <Text style={styles.bold}>Artista: </Text>
          {artist}
        </Text>
        <Text style={styles.subtitle}>
          <Text style={styles.bold}>Ano: </Text>
          {year}
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
  subtitle: { color: COLORS.textDark, fontSize: 12, marginBottom: 2 },
  bold: { fontWeight: "bold" },
});
