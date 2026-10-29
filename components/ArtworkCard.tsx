import { Href, Link } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ObraDetalhes } from "../constants/data";
import { COLORS } from "../constants/theme";

interface ArtworkCardProps {
  artwork: ObraDetalhes;
}

export function ArtworkCard({ artwork }: ArtworkCardProps) {
  return (
    <Link
      href={
        {
          pathname: "/artwork/[id]",
          params: { id: artwork.id },
        } as Href<any>
      }
      asChild
    >
      <TouchableOpacity style={styles.card} activeOpacity={0.9}>
        <Image source={artwork.img} style={styles.image} resizeMode="cover" />

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {artwork.title}
          </Text>

          {artwork.artist && (
            <Text style={styles.subtitle} numberOfLines={1}>
              <Text style={styles.bold}>Artista: </Text>
              {artwork.artist}
            </Text>
          )}

          {artwork.year && (
            <Text style={styles.subtitle} numberOfLines={1}>
              <Text style={styles.bold}>Ano: </Text>
              {artwork.year}
            </Text>
          )}
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
    height: 250,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: 150,
  },

  info: {
    flex: 1,
    padding: 12,
    backgroundColor: COLORS.secondaryBeige,
  },

  title: {
    color: COLORS.textDark,
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },

  subtitle: {
    color: COLORS.textDark,
    fontSize: 12,
    marginBottom: 2,
  },

  bold: {
    fontWeight: "bold",
  },
});
