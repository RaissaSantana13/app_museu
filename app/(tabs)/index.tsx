import { EXHIBITIONS_DATA } from "@/constants/data";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ArtworkCard } from "../../components/ArtworkCard";
import { EventCard } from "../../components/EventCard";
import { ExhibitionCard } from "../../components/ExhibitionCard";
import { HomeSearch } from "../../components/HomeSearch";
import { MenuModal } from "../../components/MenuModal";
import { COLORS } from "../../constants/theme";

import {
  listWorkCovers,
  listWorks,
  type ArtworkSummary,
} from "../../services/works";

const API_URL = (process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.101:3000") // o endereço da maquina que ta rodando
  .replace(/\/+$/, "");

const EVENTS_ENDPOINT = `${API_URL}/api/v1/events`;

interface EventApiResponse {
  idEvent: number;
  title: string;
  description: string;
  start_date: string;
  startTime?: string;
  durationMinutes?: number;
  end_date: string;
  allDay?: boolean;
  location: string;
  color: string;
  maxCapacity?: number;
}

function extractEvents(response: unknown): EventApiResponse[] {
  if (Array.isArray(response)) {
    return response as EventApiResponse[];
  }

  if (response && typeof response === "object") {
    const data = response as {
      data?: unknown;
      dados?: unknown;
      events?: unknown;
    };

    if (Array.isArray(data.data)) {
      return data.data as EventApiResponse[];
    }

    if (Array.isArray(data.dados)) {
      return data.dados as EventApiResponse[];
    }

    if (Array.isArray(data.events)) {
      return data.events as EventApiResponse[];
    }
  }

  return [];
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // Obras
  const [works, setWorks] = useState<ArtworkSummary[]>([]);
  const [covers, setCovers] = useState<Record<number, string>>({});
  const [loadingWorks, setLoadingWorks] = useState(true);
  const [worksError, setWorksError] = useState(false);
  const [worksAttempt, setWorksAttempt] = useState(0);

  // Eventos
  const [events, setEvents] = useState<EventApiResponse[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState(false);
  const [eventsAttempt, setEventsAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    async function fetchEvents() {
      try {
        setLoadingEvents(true);
        setEventsError(false);

        const response = await fetch(EVENTS_ENDPOINT, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          signal,
        });

        if (!response.ok) {
          throw new Error(`Erro ao buscar eventos: HTTP ${response.status}`);
        }

        const responseData: unknown = await response.json();

        if (signal.aborted) {
          return;
        }

        const eventsData = extractEvents(responseData);

        setEvents(eventsData);
      } catch (error) {
        if (signal.aborted) {
          return;
        }

        console.error("Erro ao carregar eventos:", error);

        setEventsError(true);
        setEvents([]);
      } finally {
        if (!signal.aborted) {
          setLoadingEvents(false);
        }
      }
    }

    fetchEvents();

    return () => controller.abort();
  }, [eventsAttempt]);

  function retryEvents() {
    setEventsError(false);
    setLoadingEvents(true);

    setEventsAttempt((current) => current + 1);
  }

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    listWorks(1, signal)
      .then(({ content }) => {
        if (signal.aborted) {
          return;
        }

        setWorks(content);

        return listWorkCovers(
          content.map((work) => work.idArtwork),
          signal,
        )
          .then((urls) => {
            if (!signal.aborted) {
              setCovers(urls);
            }
          })
          .catch(() => {
            if (!signal.aborted) {
              setCovers({});
            }
          });
      })
      .catch(() => {
        if (!signal.aborted) {
          setWorksError(true);
        }
      })
      .finally(() => {
        if (!signal.aborted) {
          setLoadingWorks(false);
        }
      });

    return () => controller.abort();
  }, [worksAttempt]);

  /**
   * Tenta buscar as obras novamente.
   */
  function retryWorks() {
    setWorksError(false);
    setLoadingWorks(true);

    setWorksAttempt((current) => current + 1);
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
      <ScrollView style={styles.container} bounces={false}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Abrir menu"
              onPress={() => setIsMenuVisible(true)}
            >
              <Ionicons name="menu" size={32} color={COLORS.secondaryBeige} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>
              MUSEU DE <Text style={styles.headerTitleHighlight}>BIRIGUI</Text>
            </Text>

            <View style={{ width: 32 }} />
          </View>

          <HomeSearch />
        </View>

        {/* Programação */}
        <View style={styles.eventsWrapper}>
          <Text style={styles.sectionTitleDark}>Programação</Text>

          {loadingEvents ? (
            <View style={styles.eventsLoading}>
              <ActivityIndicator
                accessibilityLabel="Carregando eventos"
                color={COLORS.primaryBrown}
              />

              <Text style={styles.eventsLoadingText}>
                Carregando programação...
              </Text>
            </View>
          ) : eventsError ? (
            <View style={styles.eventsErrorContainer}>
              <Text style={styles.eventsMessage}>
                Não foi possível carregar os eventos.
              </Text>

              <TouchableOpacity
                accessibilityRole="button"
                onPress={retryEvents}
                style={styles.retryButton}
              >
                <Text style={styles.retryButtonText}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={events}
              keyExtractor={(item) => String(item.idEvent)}
              renderItem={({ item }) => (
                <EventCard {...item} id={String(item.idEvent)} />
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.flatListContent}
              ListEmptyComponent={
                <Text style={styles.emptyEvents}>
                  Nenhum evento cadastrado.
                </Text>
              }
            />
          )}
        </View>

        {/* Exposições */}
        <View style={styles.section}>
          <Text style={styles.sectionTitleLight}>EXPOSIÇÕES EM CARTAZ</Text>

          <FlatList
            data={EXHIBITIONS_DATA}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ExhibitionCard exhibition={item} />}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
          />
        </View>

        {/* Obras */}
        <View style={styles.section}>
          <Text style={styles.sectionTitleLight}>OBRAS</Text>

          {loadingWorks ? (
            <ActivityIndicator
              accessibilityLabel="Carregando obras"
              color={COLORS.secondaryBeige}
            />
          ) : worksError ? (
            <View>
              <Text style={styles.worksMessage}>
                Não foi possível carregar as obras.
              </Text>

              <TouchableOpacity accessibilityRole="button" onPress={retryWorks}>
                <Text style={styles.worksMessage}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={works}
              keyExtractor={(item) => String(item.idArtwork)}
              renderItem={({ item }) => (
                <ArtworkCard artwork={item} coverUrl={covers[item.idArtwork]} />
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.flatListContent}
              ListEmptyComponent={
                <Text style={styles.emptyWorks}>Nenhuma obra cadastrada.</Text>
              }
            />
          )}
        </View>

        {/* Rodapé */}
        <View style={styles.footer}>
          <Ionicons
            name="logo-youtube"
            size={24}
            color={COLORS.primaryBrown}
            style={styles.socialIcon}
          />

          <Ionicons
            name="logo-facebook"
            size={24}
            color={COLORS.primaryBrown}
            style={styles.socialIcon}
          />

          <Ionicons
            name="logo-instagram"
            size={24}
            color={COLORS.primaryBrown}
            style={styles.socialIcon}
          />
        </View>
      </ScrollView>

      {/* Menu */}
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
    backgroundColor: COLORS.primaryBrown,
  },

  header: {
    backgroundColor: COLORS.primaryBrown,
    paddingTop: 16,
    paddingBottom: 24,
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

  eventsWrapper: {
    backgroundColor: COLORS.secondaryBeige,
    borderRadius: 24,
    paddingVertical: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  sectionTitleDark: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textDark,
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  eventsLoading: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },

  eventsLoadingText: {
    color: COLORS.textDark,
    marginTop: 10,
    fontSize: 14,
  },

  eventsErrorContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },

  eventsMessage: {
    color: COLORS.textDark,
    paddingVertical: 6,
  },

  retryButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
  },

  retryButtonText: {
    color: COLORS.primaryBrown,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },

  emptyEvents: {
    color: COLORS.textDark,
    paddingHorizontal: 20,
    paddingVertical: 6,
  },

  section: {
    paddingTop: 24,
  },

  sectionTitleLight: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.secondaryBeige,
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  flatListContent: {
    paddingHorizontal: 20,
  },

  worksMessage: {
    color: COLORS.secondaryBeige,
    paddingHorizontal: 20,
    paddingVertical: 6,
  },

  emptyWorks: {
    color: COLORS.secondaryBeige,
  },

  footer: {
    backgroundColor: COLORS.secondaryBeige,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 24,
    marginTop: 40,
  },

  socialIcon: {
    marginHorizontal: 12,
  },
});
