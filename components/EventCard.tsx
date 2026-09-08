import { Href, Link } from "expo-router"; // 1. Importe o Href aqui
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../constants/theme";

export function EventCard({
  id,
  title,
  startDate,
  endDate,
  imageSource,
  isSoldOut,
}: any) {
  return (
    // 2. Adicione "as Href<any>" no final do objeto href
    <Link
      href={{ pathname: "/event/[id]", params: { id } } as Href<any>}
      asChild
    >
      <TouchableOpacity style={styles.card} activeOpacity={0.9}>
        <View style={styles.imageContainer}>
          <Image source={imageSource} style={styles.image} />

          <View
            style={[
              styles.badge,
              isSoldOut ? styles.badgeSoldOut : styles.badgeAvailable,
            ]}
          >
            <Text style={styles.badgeText}>
              {isSoldOut ? "ESGOTADO" : "DISPONÍVEL"}
            </Text>
          </View>
        </View>
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
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.primaryBrown,
    borderRadius: 16,
    marginRight: 16,
    overflow: "hidden",
    width: 280,
  },
  imageContainer: { height: 140, width: "100%" },
  image: { width: "100%", height: "100%", resizeMode: "cover" },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeSoldOut: { backgroundColor: COLORS.badgeBlue },
  badgeAvailable: { backgroundColor: COLORS.accentGreen },
  badgeText: { color: COLORS.textDark, fontWeight: "bold", fontSize: 12 },
  info: { padding: 12 },
  title: {
    color: COLORS.secondaryBeige,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  date: { color: COLORS.secondaryBeige, fontSize: 12, marginBottom: 2 },
  bold: { fontWeight: "bold" },
});
