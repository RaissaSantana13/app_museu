import { LinearGradient } from "expo-linear-gradient";
import { Href, Link } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ObraDetalhes } from "../constants/data";
import { COLORS } from "../constants/theme";

interface CollectionCardProps {
  artwork: ObraDetalhes;
}

export function CollectionCard({ artwork }: CollectionCardProps) {
  return (
    <Link
      href={
        { pathname: "/artwork/[id]", params: { id: artwork.id } } as Href<any>
      }
      asChild
    >
      <TouchableOpacity style={styles.cardContainer} activeOpacity={0.9}>
        {/* Camada Inferior: Imagem centrada e completa */}
        <Image
          source={artwork.img}
          style={styles.cardImage}
          resizeMode="contain"
        />

        {/* Camada Superior: Contentor que empurra o gradiente para baixo */}
        <View style={styles.overlayContainer}>
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)", "rgba(0,0,0,1)"]}
            style={styles.gradientOverlay}
          >
            <Text style={styles.title} numberOfLines={2}>
              {artwork.title}
            </Text>
            <Text style={styles.description} numberOfLines={2}>
              {artwork.description}
            </Text>
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
  cardImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
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
