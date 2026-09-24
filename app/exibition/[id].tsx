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
import { COLORS } from "../../constants/theme";

const EXHIBITIONS_DATA = [
  {
    id: "1",
    title: "A Magia das Cores Antigas",
    status: "EM CARTAZ",
    tags: ["PINTURA", "GRATUITO", "LIVRE"],
    description1:
      "Uma exposição imersiva que explora o impacto visual de artistas da década de 20. Durante esse período, o uso da cor assumiu novas perspectivas que mudaram para sempre a forma de enxergar o mundo.",
    description2:
      "Aproveite a oportunidade única de caminhar por galerias com curadoria especializada, apresentando mais de 50 obras restauradas. Recomendamos chegar cedo para evitar filas nos finais de semana.",
    schedules: [
      { date: "10/05 a 30/06", details: "Terça a Domingo, 10h às 18h" },
      { date: "Feriados", details: "10h às 14h" },
    ],
    imageSource: require("../../assets/images/react-logo.png"), // Ajuste o caminho depois
  },
];

export default function ExhibitionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // Busca o ID na API/Mock
  const exhibitionId = Array.isArray(id) ? id[0] : id;
  const exhibition = EXHIBITIONS_DATA.find((item) => item.id === exhibitionId);

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/"); // Altere para a rota inicial ou de listagem correta
    }
  }

  return (
    <View
      style={[
        styles.mainContainer,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
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

        {exhibition ? (
          <View style={styles.contentWrapper}>
            <Image source={exhibition.imageSource} style={styles.bannerImage} />

            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{exhibition.status}</Text>
            </View>

            <Text style={styles.title}>{exhibition.title}</Text>

            {exhibition.tags && exhibition.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {exhibition.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            <Text style={styles.description}>{exhibition.description1}</Text>

            <View style={styles.scheduleBox}>
              <Text style={styles.scheduleTitle}>Datas e Horários</Text>
              {exhibition.schedules.map((schedule, index) => (
                <View key={index} style={styles.scheduleItem}>
                  <Text style={styles.scheduleDate}>{schedule.date}</Text>
                  <Text style={styles.scheduleDetails}>{schedule.details}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.description}>{exhibition.description2}</Text>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="calendar-outline"
              size={48}
              color={COLORS.primaryBrown}
            />
            <Text style={styles.emptyTitle}>Exposição não encontrada</Text>
            <TouchableOpacity
              style={styles.collectionButton}
              onPress={handleBack}
            >
              <Text style={styles.collectionButtonText}>Voltar</Text>
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
  mainContainer: { flex: 1, backgroundColor: COLORS.primaryBrown },
  container: { flex: 1, backgroundColor: COLORS.secondaryBeige },
  scrollContent: { flexGrow: 1 },

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
  headerTitleHighlight: { color: COLORS.yellowIcon },
  pageSubtitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.secondaryBeige,
    marginTop: 4,
    letterSpacing: 1,
    textAlign: "center",
  },

  contentWrapper: { padding: 20, paddingBottom: 40 },
  bannerImage: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    resizeMode: "cover",
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
  statusText: { color: COLORS.textDark, fontWeight: "bold", fontSize: 14 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 16,
  },
  tagsContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: 20 },
  tag: {
    backgroundColor: COLORS.yellowIcon,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: { color: COLORS.textDark, fontWeight: "bold", fontSize: 12 },
  description: {
    fontSize: 14,
    color: COLORS.textDark,
    lineHeight: 20,
    marginBottom: 20,
  },

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
  scheduleItem: { marginBottom: 12 },
  scheduleDate: { fontSize: 14, fontWeight: "bold", color: COLORS.textDark },
  scheduleDetails: { fontSize: 14, color: COLORS.textDark },

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
