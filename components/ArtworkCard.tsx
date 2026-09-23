import { Href, Link } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ObraDetalhes } from "../constants/data"; // Certifique-se de importar o tipo correto se ele estiver lá
import { COLORS } from "../constants/theme";

interface ArtworkCardProps {
  artwork: ObraDetalhes; // Recebe o objeto completo da obra, igual ao CollectionCard
}

export function ArtworkCard({ artwork }: ArtworkCardProps) {
  return (
    <Link
      href={
        { pathname: "/artwork/[id]", params: { id: artwork.id } } as Href<any>
      }
      asChild
    >
      <TouchableOpacity style={styles.card} activeOpacity={0.9}>
        {/* Caixa exclusiva para a imagem no topo */}
        <View style={styles.imageContainer}>
          <Image
            source={artwork.img}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Caixa de informações na parte inferior */}
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
    overflow: "hidden",
  },
  imageContainer: {
    width: "100%",
    height: 150,
    backgroundColor: COLORS.secondaryBeige,
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
