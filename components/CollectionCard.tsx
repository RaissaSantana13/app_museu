import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, type Href } from "expo-router";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../constants/theme";
import type { ArtworkSummary } from "../services/works";

interface CollectionCardProps {
  artwork: ArtworkSummary;
  coverUrl?: string;
}

export function CollectionCard({ artwork, coverUrl }: CollectionCardProps) {
  const [failedCover, setFailedCover] = useState<string>();
  const details = [artwork.artistName, artwork.creationYear]
    .filter((value) => value != null && value !== "")
    .join(" · ");

  return (
    <Link
      href={`/artwork/${artwork.idArtwork}` as Href}
      asChild
    >
      <TouchableOpacity style={styles.cardContainer} activeOpacity={0.9}>
        {coverUrl && coverUrl !== failedCover ? (
          <Image
            source={{ uri: coverUrl }}
            style={styles.cover}
            resizeMode="contain"
            accessibilityLabel={`Capa de ${artwork.title}`}
            onError={() => setFailedCover(coverUrl)}
          />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="image-outline" size={48} color={COLORS.textDark} />
            <Text style={styles.placeholderText}>Imagem indisponível</Text>
          </View>
        )}
        <View style={styles.overlayContainer}>
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)", "rgba(0,0,0,1)"]}
            style={styles.gradientOverlay}
          >
            <Text style={styles.title} numberOfLines={2}>
              {artwork.title}
            </Text>
            {details ? (
              <Text style={styles.description} numberOfLines={1}>
                {details}
              </Text>
            ) : null}
            {artwork.description ? (
              <Text style={styles.description} numberOfLines={2}>
                {artwork.description}
              </Text>
            ) : null}
          </LinearGradient>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    height: 380,
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: COLORS.secondaryBeige,
  },
  cover: {
    ...StyleSheet.absoluteFill,
    width: "100%",
    height: "100%",
  },
  placeholder: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  placeholderText: {
    color: COLORS.textDark,
  },
  overlayContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  gradientOverlay: {
    padding: 20,
    paddingTop: 100,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.yellowIcon,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },
});
