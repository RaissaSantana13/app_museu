import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
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
import { ARTWORKS_DATA } from "../../constants/data";
import { COLORS } from "../../constants/theme";

export default function CollectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredArtworks = useMemo(() => {
    return ARTWORKS_DATA.filter(
      (artwork) =>
        artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artwork.description.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm]);

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
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Buscar obras..."
          />
        </View>

        <View style={styles.contentWrapper}>
          <Text style={styles.resultsCount}>
            {filteredArtworks.length}{" "}
            {filteredArtworks.length === 1
              ? "obra encontrada"
              : "obras encontradas"}
          </Text>

          <FlatList
            data={filteredArtworks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <CollectionCard artwork={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                Nenhuma obra encontrada para esta pesquisa.
              </Text>
            }
          />
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
});
