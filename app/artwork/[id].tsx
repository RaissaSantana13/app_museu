import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MenuModal } from "../../components/MenuModal";
import { COLORS } from "../../constants/theme";
import {
  getLocalWorkCover,
  getWorkById,
  listWorkCovers,
  type ArtworkDetails,
} from "../../services/works";

export default function ArtworkDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const artworkId = Array.isArray(id) ? id[0] : id;

  return (
    <ArtworkDetailsContent
      key={artworkId ?? "invalid"}
      artworkId={artworkId}
    />
  );
}

interface ArtworkDetailsContentProps {
  artworkId?: string;
}

function ArtworkDetailsContent({
  artworkId,
}: ArtworkDetailsContentProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [artwork, setArtwork] = useState<ArtworkDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [loadingCover, setLoadingCover] = useState(false);
  const [localCoverFailed, setLocalCoverFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    async function loadArtwork() {
      try {
        const numericId =
          artworkId && /^\d+$/.test(artworkId)
            ? Number(artworkId)
            : NaN;

        const work = await getWorkById(numericId, signal);

        if (signal.aborted) return;

        setArtwork(work);

        // A API responde com 404 quando a obra não existe.
        if (!work) return;

        // Libera os textos enquanto consulta a imagem.
        setLoadingCover(true);
        setLoading(false);

        try {
          const covers = await listWorkCovers(
            [work.idArtwork],
            signal,
          );

          if (signal.aborted) return;

          // Sem capa cadastrada, utiliza a imagem local.
          setCoverUrl(covers[work.idArtwork] ?? null);
        } catch (cause: unknown) {
          if (signal.aborted) return;

          console.warn("Não foi possível buscar a capa:", cause);
          setCoverUrl(null);
        } finally {
          if (!signal.aborted) {
            setLoadingCover(false);
          }
        }
      } catch (cause: unknown) {
        if (signal.aborted) return;

        setError(
          cause instanceof Error
            ? cause.message
            : "Não foi possível carregar os detalhes da obra.",
        );
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadArtwork();

    return () => controller.abort();
  }, [artworkId, attempt]);

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/collection/collection");
    }
  }

  function retry() {
    setError(null);
    setArtwork(null);
    setCoverUrl(null);
    setLoadingCover(false);
    setLocalCoverFailed(false);
    setLoading(true);
    setAttempt((current) => current + 1);
  }

  const localCover =
    artwork && !localCoverFailed
      ? getLocalWorkCover(artwork.title)
      : undefined;

  const coverSource = coverUrl
    ? { uri: coverUrl }
    : localCover;

  function handleImageError() {
    if (coverUrl) {
      // Se a imagem remota falhar, tenta a imagem local.
      setCoverUrl(null);
    } else {
      // Se a imagem local também falhar, mostra o aviso.
      setLocalCoverFailed(true);
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
        {/* Cabeçalho */}
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

        {loading ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator
              size="large"
              color={COLORS.primaryBrown}
              accessibilityLabel="Carregando detalhes da obra"
            />

            <Text style={styles.loadingText}>
              Carregando detalhes da obra...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={48}
              color={COLORS.primaryBrown}
            />

            <Text style={styles.emptyTitle}>
              Não foi possível carregar
            </Text>

            <Text
              style={styles.emptyDescription}
              accessibilityRole="alert"
            >
              {error}
            </Text>

            <TouchableOpacity
              style={styles.collectionButton}
              onPress={retry}
              activeOpacity={0.85}
              accessibilityRole="button"
            >
              <Text style={styles.collectionButtonText}>
                Tentar novamente
              </Text>
            </TouchableOpacity>
          </View>
        ) : artwork ? (
          <View style={styles.contentWrapper}>
            {/* Imagem da API, com alternativa local */}
            <View style={styles.imageContainer}>
              {loadingCover ? (
                <View style={styles.imagePlaceholder}>
                  <ActivityIndicator
                    color={COLORS.primaryBrown}
                    accessibilityLabel="Carregando imagem da obra"
                  />
                </View>
              ) : coverSource ? (
                <Image
                  key={coverUrl ?? "local"}
                  source={coverSource}
                  style={styles.artworkImage}
                  resizeMode="contain"
                  accessible
                  accessibilityLabel={`Imagem de ${artwork.title}`}
                  onError={handleImageError}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons
                    name="image-outline"
                    size={48}
                    color={COLORS.primaryBrown}
                  />

                  <Text style={styles.placeholderText}>
                    Imagem indisponível
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.title} accessibilityRole="header">
              {artwork.title}
            </Text>

            {!!artwork.type?.trim() && (
              <View style={styles.tagsContainer}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>
                    {artwork.type}
                  </Text>
                </View>
              </View>
            )}

            {/* Ficha técnica */}
            <View style={styles.detailsBox}>
              <Text
                style={styles.sectionTitle}
                accessibilityRole="header"
              >
                Ficha técnica
              </Text>

              <DetailItem
                label="Ano de criação"
                value={
                  artwork.creationYear != null
                    ? String(artwork.creationYear)
                    : undefined
                }
              />

              <DetailItem
                label="Artista / fabricante"
                value={artwork.artistName ?? undefined}
              />

              <DetailItem
                label="Técnica"
                value={artwork.technique ?? undefined}
              />
            </View>

            {/* Descrição recebida da API */}
            <View style={styles.aboutSection}>
              <Text
                style={styles.sectionTitle}
                accessibilityRole="header"
              >
                Sobre esta obra
              </Text>

              <Text style={styles.fullDescription}>
                {artwork.description?.trim() ||
                  "Descrição não informada."}
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
              onPress={() =>
                router.replace("/collection/collection")
              }
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
  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 14,
    color: COLORS.textDark,
    textAlign: "center",
    marginTop: 8,
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

  // Descrição
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

  // Carregamento, erro e obra inexistente
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textDark,
    textAlign: "center",
    marginTop: 16,
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