import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MenuModal } from "../../components/MenuModal";
import { ARTWORKS_DATA } from "../../constants/data";
import { COLORS } from "../../constants/theme";

export default function ArtworkDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // O ID recebido corresponde ao ID cadastrado no data.ts.
  const artworkId = Array.isArray(id) ? id[0] : id;

  const artwork = ARTWORKS_DATA.find(
    (item) => item.id === artworkId,
  );

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      // Permite retornar mesmo ao abrir a tela por um link direto.
      router.replace("/collection/collection");
    }
  }

  return (
    <View
      style={[
        styles.mainContainer,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Mesmo padrão visual da tela de detalhes do evento. */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setIsMenuVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Abrir menu"
            >
              <Ionicons
                name="menu"
                size={32}
                color={COLORS.secondaryBeige}
              />
            </TouchableOpacity>

            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle}>
                MUSEU DE{" "}
                <Text style={styles.headerTitleHighlight}>
                  BIRIGUI
                </Text>
              </Text>

              <Text style={styles.pageSubtitle}>
                DETALHES DA OBRA
              </Text>
            </View>

            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel="Voltar"
            >
              <Ionicons
                name="arrow-back"
                size={28}
                color={COLORS.secondaryBeige}
              />
            </TouchableOpacity>
          </View>
        </View>

        {artwork ? (
          <View style={styles.contentWrapper}>
            {/* contain mantém a peça inteira visível. */}
            <View style={styles.imageContainer}>
              <Image
                source={artwork.img}
                style={styles.artworkImage}
                resizeMode="contain"
                accessible
                accessibilityLabel={`Imagem de ${artwork.title}`}
              />
            </View>

            <Text style={styles.title} accessibilityRole="header">
              {artwork.title}
            </Text>

            {artwork.categories.length > 0 && (
              <View style={styles.tagsContainer}>
                {artwork.categories.map((category) => (
                  <View key={category} style={styles.tag}>
                    <Text style={styles.tagText}>{category}</Text>
                  </View>
                ))}
              </View>
            )}

            <Text style={styles.description}>
              {artwork.description}
            </Text>

            <View style={styles.detailsBox}>
              <Text
                style={styles.sectionTitle}
                accessibilityRole="header"
              >
                Ficha técnica
              </Text>

              <DetailItem label="Período" value={artwork.year} />

              <DetailItem
                label="Artista / fabricante"
                value={artwork.artist}
              />

              <DetailItem label="Material" value={artwork.material} />
            </View>

            <View style={styles.aboutSection}>
              <Text
                style={styles.sectionTitle}
                accessibilityRole="header"
              >
                Sobre esta obra
              </Text>

              <Text style={styles.fullDescription}>
                {artwork.fullDescription}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="image-outline"
              size={48}
              color={COLORS.primaryBrown}
            />

            <Text style={styles.emptyTitle}>
              Obra não encontrada
            </Text>

            <Text style={styles.emptyDescription}>
              Não encontramos uma obra com esse identificador.
              Acesse o acervo para escolher outra peça.
            </Text>

            <TouchableOpacity
              style={styles.collectionButton}
              onPress={() => router.replace("/collection/collection")}
              activeOpacity={0.85}
              accessibilityRole="button"
            >
              <Text style={styles.collectionButtonText}>
                Ir para o acervo
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <MenuModal
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
      />
    </View>
  );
}

interface DetailItemProps {
  label: string;
  value?: string;
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>

      <Text style={styles.detailValue}>
        {value?.trim() || "Não informado"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.primaryBrown,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.secondaryBeige,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Cabeçalho
  header: {
    backgroundColor: COLORS.primaryBrown,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerButton: {
    width: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#000",
    textAlign: "center",
  },
  headerTitleHighlight: {
    color: COLORS.yellowIcon,
  },
  pageSubtitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.secondaryBeige,
    marginTop: 4,
    letterSpacing: 1,
    textAlign: "center",
  },

  // Imagem e apresentação
  contentWrapper: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    padding: 20,
    paddingBottom: 40,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.05)",
    marginBottom: 20,
    padding: 12,
  },
  artworkImage: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  tag: {
    maxWidth: "100%",
    backgroundColor: COLORS.yellowIcon,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  tagText: {
    color: COLORS.textDark,
    fontWeight: "bold",
    fontSize: 12,
  },
  description: {
    fontSize: 14,
    color: COLORS.textDark,
    lineHeight: 22,
    marginBottom: 20,
  },

  // Ficha técnica
  detailsBox: {
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 14,
  },
  detailItem: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.primaryBrown,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.textDark,
    lineHeight: 21,
  },

  // Descrição completa
  aboutSection: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    paddingTop: 20,
  },
  fullDescription: {
    fontSize: 14,
    color: COLORS.textDark,
    lineHeight: 23,
  },

  // Obra inexistente
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.textDark,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 14,
    color: COLORS.textDark,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  collectionButton: {
    backgroundColor: COLORS.primaryBrown,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  collectionButtonText: {
    color: COLORS.yellowIcon,
    fontSize: 14,
    fontWeight: "bold",
  },
});