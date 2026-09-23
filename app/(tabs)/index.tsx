import { ARTWORKS_DATA, EVENTS_DATA, EXHIBITIONS_DATA } from "@/constants/data";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
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
import { MenuModal } from "../../components/MenuModal"; // Importação do Modal
import { SearchBar } from "../../components/SearchBar";
import { COLORS } from "../../constants/theme";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [isMenuVisible, setIsMenuVisible] = useState(false); // Controle de estado do Modal

  return (
    <View
      style={[
        styles.mainContainer,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <ScrollView style={styles.container} bounces={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            {/* Ícone de menu envolto em TouchableOpacity */}
            <TouchableOpacity onPress={() => setIsMenuVisible(true)}>
              <Ionicons name="menu" size={32} color={COLORS.secondaryBeige} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>
              MUSEU DE <Text style={styles.headerTitleHighlight}>BIRIGUI</Text>
            </Text>
            <View style={{ width: 32 }} />
          </View>
          <SearchBar />
        </View>

        <View style={styles.eventsWrapper}>
          <Text style={styles.sectionTitleDark}>Programação</Text>
          <FlatList
            data={EVENTS_DATA}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <EventCard {...item} />}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitleLight}>EXPOSIÇÕES EM CARTAZ</Text>
          <FlatList
            data={EXHIBITIONS_DATA}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ExhibitionCard {...item} />}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitleLight}>OBRAS</Text>
          <FlatList
            data={ARTWORKS_DATA}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ArtworkCard artwork={item} />}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
          />
        </View>

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

      {/* Renderização do Modal */}
      <MenuModal
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: COLORS.primaryBrown },
  container: { flex: 1, backgroundColor: COLORS.primaryBrown },
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
  headerTitle: { fontSize: 20, fontWeight: "900", color: "#000" },
  headerTitleHighlight: { color: COLORS.yellowIcon },
  eventsWrapper: {
    backgroundColor: COLORS.secondaryBeige,
    borderRadius: 24,
    paddingVertical: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
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
  section: { paddingTop: 24 },
  sectionTitleLight: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.secondaryBeige,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  flatListContent: { paddingHorizontal: 20 },
  footer: {
    backgroundColor: COLORS.secondaryBeige,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 24,
    marginTop: 40,
  },
  socialIcon: { marginHorizontal: 12 },
});
