import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../constants/theme";

interface ArtworkCardProps {
  title: string;
  artist?: string;
  year?: string;
  img: any;
}

export function ArtworkCard({ title, artist, year, img }: ArtworkCardProps) {
  return (
    <View style={styles.card}>
      {/* Caixa exclusiva para a imagem no topo */}
      <View style={styles.imageContainer}>
        {/* 'contain' garante que a obra inteira cabe sem cortes */}
        <Image source={img} style={styles.image} resizeMode="contain" />
      </View>

      {/* Caixa de informações na parte inferior */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        {artist && (
          <Text style={styles.subtitle} numberOfLines={1}>
            <Text style={styles.bold}>Artista: </Text>
            {artist}
          </Text>
        )}

        {year && (
          <Text style={styles.subtitle} numberOfLines={1}>
            <Text style={styles.bold}>Ano: </Text>
            {year}
          </Text>
        )}
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
  imageContainer: {
    width: "100%",
    height: 150, // Altura fixa para a imagem não empurrar os textos
    backgroundColor: COLORS.secondaryBeige, // Os espaços vazios fundem-se com o cartão
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  image: {
    width: "100%",
    height: "100%",
  },
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
