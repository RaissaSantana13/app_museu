import { Link, type Href } from "expo-router";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../constants/theme";
import { getLocalWorkCover, type ArtworkSummary } from "../services/works";

interface ArtworkCardProps {
  artwork: ArtworkSummary;
  coverUrl?: string;
}

export function ArtworkCard({ artwork, coverUrl }: ArtworkCardProps) {
  const [failedCover, setFailedCover] = useState<string>();
  const remoteCover = coverUrl && coverUrl !== failedCover ? coverUrl : undefined;
  const coverSource = remoteCover ? { uri: remoteCover } : getLocalWorkCover(artwork.title);

  return (
    <Link
      href={`/artwork/${artwork.idArtwork}` as Href}
      asChild
    >
      <TouchableOpacity style={styles.card} activeOpacity={0.9}>
        {coverSource ? (
          <Image
            source={coverSource}
            style={styles.image}
            resizeMode="cover"
            accessibilityLabel={`Capa de ${artwork.title}`}
            onError={remoteCover ? () => setFailedCover(remoteCover) : undefined}
          />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text style={styles.subtitle}>Imagem indisponível</Text>
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {artwork.title}
          </Text>

          {artwork.artistName ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              <Text style={styles.bold}>Artista: </Text>
              {artwork.artistName}
            </Text>
          ) : null}

          {artwork.creationYear != null ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              <Text style={styles.bold}>Ano: </Text>
              {artwork.creationYear}
            </Text>
          ) : null}
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
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
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
