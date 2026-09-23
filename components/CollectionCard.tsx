import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { ObraDetalhes } from "../constants/data";
import { COLORS } from "../constants/theme";

interface CollectionCardProps {
  artwork: ObraDetalhes;
  onPress?: () => void;
}

export function CollectionCard({ artwork, onPress }: CollectionCardProps) {
  return (
    <Pressable style={styles.cardContainer} onPress={onPress}>
      {/* Camada Inferior: Imagem centrada e completa */}
      <Image
        source={artwork.img}
        style={styles.cardImage}
        resizeMode="contain"
      />

      {/* Camada Superior: Contentor invisível que empurra o gradiente para baixo */}
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    height: 380,
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: COLORS.secondaryBeige, // Fundo bege para os espaços vazios laterais
  },
  cardImage: {
    position: "absolute", // Descola a imagem do fluxo para não interferir com os textos
    width: "100%",
    height: "100%",
  },
  overlayContainer: {
    flex: 1,
    justifyContent: "flex-end", // Atira o gradiente e os textos para a base do cartão
  },
  gradientOverlay: {
    padding: 20,
    paddingTop: 100, // Transição suave de transparente para preto
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
