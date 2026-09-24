import { Href, Link } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../constants/theme";

// Tipagem baseada no que virá da sua API/Mock
export interface ExhibitionDetails {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  imageSource: any;
}

interface ExhibitionCardProps {
  exhibition: ExhibitionDetails;
}

export function ExhibitionCard({ exhibition }: ExhibitionCardProps) {
  return (
    <Link
      href={
        {
          pathname: "/exhibition/[id]",
          params: { id: exhibition.id },
        } as Href<any>
      }
      asChild
    >
      <TouchableOpacity style={styles.card} activeOpacity={0.9}>
        <Image source={exhibition.imageSource} style={styles.image} />

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {exhibition.title}
          </Text>

          <Text style={styles.date} numberOfLines={1}>
            <Text style={styles.bold}>Início | </Text>
            {exhibition.startDate}
          </Text>

          <Text style={styles.date} numberOfLines={1}>
            <Text style={styles.bold}>Término | </Text>
            {exhibition.endDate}
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
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
  image: {
    width: "100%",
    aspectRatio: 1,
    resizeMode: "cover",
  },
  info: { padding: 12 },
  title: {
    color: COLORS.textDark,
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  date: {
    color: COLORS.textDark,
    fontSize: 12,
    marginBottom: 2,
  },
  bold: { fontWeight: "bold" },
});
