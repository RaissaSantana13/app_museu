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

// URL da API configurada no arquivo .env
const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, "");
const EVENTS_ENDPOINT = `${API_URL}/api/v1/events`;

// Imagens locais das exposições
const EXHIBITION_IMAGES: Record<number, any> = {
  3: require("../../assets/images/exposicao/X-33-12.webp"),
  4: require("../../assets/images/exposicao/Sao-Paulo-Tarsila-do-Amaral.jpg"),
};

const DEFAULT_IMAGE = require("../../assets/images/exposicao/X-33-12.webp");

interface ExhibitionData {
  idEvent: number;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  location?: string;
}

interface EventsApiResponse {
  dados?: ExhibitionData[];
  data?: ExhibitionData[];
  events?: ExhibitionData[];
}

// Formata as datas recebidas da API
function formatDate(dateString: string) {
  if (!dateString) return "Data não informada";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Data não informada";
  }

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function ExhibitionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [exhibition, setExhibition] = useState<ExhibitionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const exhibitionId = Array.isArray(id) ? id[0] : id;

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    async function fetchExhibition() {
      try {
        setLoading(true);
        setError("");

        if (!API_URL) {
          throw new Error("A URL da API não foi configurada no arquivo .env.");
        }

        const response = await fetch(EVENTS_ENDPOINT, {
          method: "GET",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Não foi possível carregar as exposições.");
        }

        const result: EventsApiResponse | ExhibitionData[] =
          await response.json();

        // Extrai a lista de eventos da resposta da API
        const events = Array.isArray(result)
          ? result
          : (result.dados ?? result.data ?? result.events ?? []);

        // Filtra somente os registros que representam exposições (IDs 3 e 4)
        const exhibitions = events.filter((item) =>
          [3, 4].includes(Number(item.idEvent)),
        );

        // Localiza a exposição selecionada
        const selectedExhibition = exhibitions.find(
          (item) => String(item.idEvent) === String(exhibitionId),
        );

        if (!selectedExhibition) {
          setExhibition(null);
          setError("Exposição não encontrada.");
          return;
        }

        setExhibition(selectedExhibition);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error("Erro ao buscar exposição:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Ocorreu um erro ao carregar a exposição.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    if (exhibitionId) {
      fetchExhibition();
    } else {
      setError("Identificador da exposição não informado.");
      setLoading(false);
    }

    return () => controller.abort();
  }, [exhibitionId]);

  // Seleciona a imagem local correspondente à exposição
  const imageSource = exhibition
    ? (EXHIBITION_IMAGES[exhibition.idEvent] ?? DEFAULT_IMAGE)
    : DEFAULT_IMAGE;

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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setIsMenuVisible(true)}
            >
              <Ionicons name="menu" size={32} color={COLORS.secondaryBeige} />
            </TouchableOpacity>

            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle}>
                MUSEU DE{" "}
                <Text style={styles.headerTitleHighlight}>BIRIGUI</Text>
              </Text>
              <Text style={styles.pageSubtitle}>EXPOSIÇÃO</Text>
            </View>

            <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
              <Ionicons
                name="arrow-back"
                size={28}
                color={COLORS.secondaryBeige}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Carregamento */}
        {loading && (
          <View style={styles.messageContainer}>
            <ActivityIndicator size="large" color={COLORS.primaryBrown} />
            <Text style={styles.messageText}>Carregando exposição...</Text>
          </View>
        )}

        {/* Erro ou exposição não encontrada */}
        {!loading && error !== "" && (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="calendar-outline"
              size={48}
              color={COLORS.primaryBrown}
            />

            <Text style={styles.emptyTitle}>{error}</Text>

            <TouchableOpacity
              style={styles.collectionButton}
              onPress={handleBack}
            >
              <Text style={styles.collectionButtonText}>Voltar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Detalhes da exposição */}
        {!loading && exhibition && (
          <View style={styles.contentWrapper}>
            <Image
              source={imageSource}
              style={styles.bannerImage}
              resizeMode="cover"
            />

            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>EXPOSIÇÃO</Text>
            </View>

            <Text style={styles.title}>{exhibition.title}</Text>

            {!!exhibition.location && (
              <View style={styles.locationContainer}>
                <Ionicons
                  name="location-outline"
                  size={18}
                  color={COLORS.textDark}
                />
                <Text style={styles.locationText}>{exhibition.location}</Text>
              </View>
            )}

            {!!exhibition.description && (
              <Text style={styles.description}>{exhibition.description}</Text>
            )}

            <View style={styles.scheduleBox}>
              <Text style={styles.scheduleTitle}>Datas e Horários</Text>

              <View style={styles.scheduleItem}>
                <Text style={styles.scheduleDate}>Início</Text>
                <Text style={styles.scheduleDetails}>
                  {formatDate(exhibition.start_date)}
                </Text>
              </View>

              <View style={styles.scheduleItem}>
                <Text style={styles.scheduleDate}>Término</Text>
                <Text style={styles.scheduleDetails}>
                  {formatDate(exhibition.end_date)}
                </Text>
              </View>
            </View>
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

  // Header
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

  // Conteúdo
  contentWrapper: {
    padding: 20,
    paddingBottom: 40,
  },
  bannerImage: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    marginBottom: 16,
  },
  statusBadge: {
    backgroundColor: COLORS.yellowIcon,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusText: {
    color: COLORS.textDark,
    fontWeight: "bold",
    fontSize: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 6,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textDark,
  },
  description: {
    fontSize: 14,
    color: COLORS.textDark,
    lineHeight: 20,
    marginBottom: 20,
  },

  // Datas e horários
  scheduleBox: {
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 12,
  },
  scheduleItem: {
    marginBottom: 12,
  },
  scheduleDate: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.textDark,
  },
  scheduleDetails: {
    fontSize: 14,
    color: COLORS.textDark,
  },

  // Carregamento
  messageContainer: {
    flex: 1,
    minHeight: 300,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  messageText: {
    color: COLORS.textDark,
    fontSize: 16,
    textAlign: "center",
    marginTop: 12,
  },

  // Exposição não encontrada
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginTop: 16,
    marginBottom: 24,
    textAlign: "center",
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
