import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CollectionCard } from "../../components/CollectionCard";
import { MenuModal } from "../../components/MenuModal";
import { SearchBar } from "../../components/SearchBar";
import { COLORS } from "../../constants/theme";
import {
  listWorkCovers,
  listWorks,
  type ArtworkSummary,
} from "../../services/works";

export default function CollectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [works, setWorks] = useState<ArtworkSummary[]>([]);
  const [covers, setCovers] = useState<Record<number, string>>({});
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    listWorks(pageNumber, controller.signal, search)
      .then((page) => {
        if (controller.signal.aborted) return;
        setWorks((current) => {
          const knownIds = new Set(current.map((work) => work.idArtwork));
          return [
            ...current,
            ...page.content.filter((work) => !knownIds.has(work.idArtwork)),
          ];
        });
        setTotal(page.totalElements);
        setTotalPages(page.totalPages);
        return listWorkCovers(
          page.content.map((work) => work.idArtwork),
          controller.signal,
        )
          .then((urls) => {
            if (!controller.signal.aborted) {
              setCovers((current) => ({ ...current, ...urls }));
            }
          })
          .catch(() => {});
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setError(
          cause instanceof Error
            ? cause.message
            : "Não foi possível carregar o acervo.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [attempt, pageNumber, search]);

  function applySearch(value: string) {
    const nextSearch = value.trim();
    if (nextSearch === search) return;

    setSearch(nextSearch);
    setPageNumber(1);
    setWorks([]);
    setCovers({});
    setTotal(0);
    setTotalPages(0);
    setError(null);
    setLoading(true);
  }

  function changeSearchInput(value: string) {
    setSearchInput(value);
    if (!value.trim()) applySearch("");
  }

  function retry() {
    setError(null);
    setLoading(true);
    setAttempt((current) => current + 1);
  }

  function loadMore() {
    setLoading(true);
    setPageNumber(pageNumber + 1);
  }

  return (
    <View
      style={[
        styles.mainContainer,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.container}>
        {/* Cabeçalho Fixo */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => setIsMenuVisible(true)}>
              <Ionicons name="menu" size={32} color={COLORS.secondaryBeige} />
            </TouchableOpacity>

            {/* Contentor do Título Duplo */}
            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle}>
                MUSEU DE{" "}
                <Text style={styles.headerTitleHighlight}>BIRIGUI</Text>
              </Text>
              <Text style={styles.pageSubtitle}>ACERVO</Text>
            </View>

            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons
                name="arrow-back"
                size={28}
                color={COLORS.secondaryBeige}
              />
            </TouchableOpacity>
          </View>
          <SearchBar
            value={searchInput}
            onChangeText={changeSearchInput}
            onSubmit={() => applySearch(searchInput)}
            onClear={() => changeSearchInput("")}
            placeholder="Buscar obras por título"
          />
        </View>

        <View style={styles.contentWrapper}>
          {loading && pageNumber === 1 ? (
            <ActivityIndicator
              accessibilityLabel="Carregando acervo"
              color={COLORS.primaryBrown}
              style={styles.resultsCount}
            />
          ) : error && pageNumber === 1 ? (
            <View>
              <Text accessibilityRole="alert" style={styles.emptyText}>
                {error}
              </Text>
              <TouchableOpacity accessibilityRole="button" onPress={retry}>
                <Text style={styles.retryText}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.resultsCount}>
                {total > 0 ? `Mostrando ${works.length} de ${total}` : "0 obras"}
              </Text>
              <FlatList
                data={works}
                keyExtractor={(item) => String(item.idArtwork)}
                renderItem={({ item }) => (
                  <CollectionCard
                    artwork={item}
                    coverUrl={covers[item.idArtwork]}
                  />
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>
                    {search ? "Nenhuma obra encontrada." : "Nenhuma obra cadastrada."}
                  </Text>
                }
                ListFooterComponent={
                  loading ? (
                    <ActivityIndicator
                      accessibilityLabel="Carregando mais obras"
                      color={COLORS.primaryBrown}
                    />
                  ) : error ? (
                    <View>
                      <Text accessibilityRole="alert" style={styles.emptyText}>
                        {error}
                      </Text>
                      <TouchableOpacity accessibilityRole="button" onPress={retry}>
                        <Text style={styles.retryText}>Tentar novamente</Text>
                      </TouchableOpacity>
                    </View>
                  ) : pageNumber < totalPages ? (
                    <TouchableOpacity accessibilityRole="button" onPress={loadMore}>
                      <Text style={styles.retryText}>Carregar mais</Text>
                    </TouchableOpacity>
                  ) : null
                }
              />
            </>
          )}
        </View>
      </View>

      <MenuModal
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: COLORS.primaryBrown },
  container: { flex: 1, backgroundColor: COLORS.secondaryBeige },
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
  titleContainer: {
    alignItems: "center", // Centraliza os dois textos
  },
  headerTitle: { fontSize: 20, fontWeight: "900", color: "#000" },
  headerTitleHighlight: {
    color: COLORS.yellowIcon,
  },
  pageSubtitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.secondaryBeige,
    marginTop: 4,
    letterSpacing: 2, // Espaçamento elegante entre as letras
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.textDark,
    opacity: 0.6,
    marginTop: 16,
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 40,
    gap: 20,
  },
  emptyText: {
    textAlign: "center",
    color: COLORS.textDark,
    opacity: 0.6,
    marginTop: 40,
    fontSize: 16,
  },
  retryText: {
    color: COLORS.primaryBrown,
    fontWeight: "bold",
    padding: 12,
    textAlign: "center",
  },
});
