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

// Imagens locais dos eventos
const PROGRAM_IMAGES: Record<number, any> = {
  1: require("../../assets/prog/Um-dia-muito-Especial-4294-.webp"),
  2: require("../../assets/prog/bdf-20250718-144029-d4eeda.jpg"),
  5: require("../../assets/prog/images (7).jpg"),
  6: require("../../assets/prog/images (8).jpg"),
};

const DEFAULT_IMAGE = require("../../assets/prog/Um-dia-muito-Especial-4294-.webp");

interface EventData {
  idEvent: number;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  location?: string;
}

interface EventsApiResponse {
  dados?: EventData[];
  data?: EventData[];
  events?: EventData[];
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

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchEvent() {
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
          throw new Error("Não foi possível carregar os eventos.");
        }

        const result: EventsApiResponse | EventData[] = await response.json();

        // Extrai a lista de eventos da resposta da API
        const events = Array.isArray(result)
          ? result
          : (result.dados ?? result.data ?? result.events ?? []);

        // Localiza o evento selecionado pelo ID
        const selectedEvent = events.find(
          (item) => String(item.idEvent) === String(id),
        );

        if (!selectedEvent) {
          setEvent(null);
          setError("Evento não encontrado.");
          return;
        }

        setEvent(selectedEvent);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error("Erro ao buscar detalhes do evento:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Ocorreu um erro ao carregar o evento.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    if (id) {
      fetchEvent();
    } else {
      setError("Identificador do evento não informado.");
      setLoading(false);
    }

    return () => controller.abort();
  }, [id]);

  // Seleciona a imagem local correspondente ao evento
  const imageSource = event
    ? (PROGRAM_IMAGES[event.idEvent] ?? DEFAULT_IMAGE)
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
      <ScrollView style={styles.container} bounces={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => setIsMenuVisible(true)}>
              <Ionicons name="menu" size={32} color={COLORS.secondaryBeige} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>
              MUSEU DE <Text style={styles.headerTitleHighlight}>BIRIGUI</Text>
            </Text>

            <TouchableOpacity onPress={() => router.back()}>
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
            <Text style={styles.messageText}>Carregando evento...</Text>
          </View>
        )}

        {/* Erro ou evento não encontrado */}
        {!loading && error !== "" && (
          <View style={styles.messageContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={42}
              color={COLORS.primaryBrown}
            />

            <Text style={styles.messageText}>{error}</Text>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>VOLTAR</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Detalhes do evento */}
        {!loading && event && (
          <View style={styles.contentWrapper}>
            <Image
              source={imageSource}
              style={styles.bannerImage}
              resizeMode="cover"
            />

            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>EVENTO</Text>
            </View>

            <Text style={styles.title}>{event.title}</Text>

            {!!event.location && (
              <View style={styles.locationContainer}>
                <Ionicons
                  name="location-outline"
                  size={18}
                  color={COLORS.textDark}
                />
                <Text style={styles.locationText}>{event.location}</Text>
              </View>
            )}

            {!!event.description && (
              <Text style={styles.description}>{event.description}</Text>
            )}

            <View style={styles.scheduleBox}>
              <Text style={styles.scheduleTitle}>Data e Horário</Text>

              <View style={styles.scheduleItem}>
                <Text style={styles.scheduleDate}>Início</Text>
                <Text style={styles.scheduleDetails}>
                  {formatDate(event.start_date)}
                </Text>
              </View>

              <View style={styles.scheduleItem}>
                <Text style={styles.scheduleDate}>Término</Text>
                <Text style={styles.scheduleDetails}>
                  {formatDate(event.end_date)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.subscribeButton}
              onPress={() =>
                router.push({
                  pathname: "/event/[id]/reservation",
                  params: { id: String(event.idEvent) },
                })
              }
            >
              <Text style={styles.subscribeButtonText}>INSCREVA-SE</Text>
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

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.primaryBrown,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.secondaryBeige,
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
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#000",
  },
  headerTitleHighlight: {
    color: COLORS.yellowIcon,
  },

  // Conteúdo
  contentWrapper: {
    padding: 20,
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

  // Datas
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

  // Botão
  subscribeButton: {
    backgroundColor: COLORS.yellowIcon,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 40,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textDark,
  },

  // Mensagens de carregamento e erro
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
  backButton: {
    backgroundColor: COLORS.yellowIcon,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  backButtonText: {
    color: COLORS.textDark,
    fontWeight: "bold",
  },
});
