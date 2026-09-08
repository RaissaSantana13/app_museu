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
import { SearchBar } from "../../components/SearchBar";
import { COLORS } from "../../constants/theme";


// Dados estáticos para renderização visual
const EVENT_DETAIL_MOCK = {
  title: "Um dia muito especial",
  status: "DISPONÍVEL",
  tags: ["A12", "GRATUITO", "TEATRO"],
  description1:
    "A peça se passa em Roma, 1938, durante uma época turbulenta marcada pela ascensão do fascismo. Antonietta, uma dona de casa e mãe de seis filhos, e Gabriele, um homem demitido da rádio por ser homossexual, se encontram por acaso e, juntos, exploram questões sobre aceitação, amor e as forças que unem ou separam as pessoas.",
  description2:
    "Não perca a chance de ver essa adaptação emocionante de um clássico do cinema, com uma interpretação única de Reynaldo Gianecchini e Maria Casadevall. Garanta seu ingresso agora e vivencie essa história de amizade, amor e transformação que irá tocar o seu coração.",
  schedules: [
    { date: "10/05", details: "Quarta, às 19h" },
    { date: "11/05", details: "Quinta, às 19h" },
    { date: "12/05", details: "Sexta, às 19h" },
  ],
  imageSource: require("../../assets/images/react-logo.png"),
};

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  return (
    <View
      style={[
        styles.mainContainer,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <ScrollView style={styles.container} bounces={false}>
        {/* Header Fixo */}
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
          <SearchBar />
        </View>

        {/* Conteúdo do Evento */}
        <View style={styles.contentWrapper}>
          <Image
            source={EVENT_DETAIL_MOCK.imageSource}
            style={styles.bannerImage}
          />

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{EVENT_DETAIL_MOCK.status}</Text>
          </View>

          <Text style={styles.title}>{EVENT_DETAIL_MOCK.title}</Text>

          <View style={styles.tagsContainer}>
            {EVENT_DETAIL_MOCK.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.description}>
            {EVENT_DETAIL_MOCK.description1}
          </Text>

          <View style={styles.scheduleBox}>
            <Text style={styles.scheduleTitle}>Data e Horário</Text>
            {EVENT_DETAIL_MOCK.schedules.map((schedule, index) => (
              <View key={index} style={styles.scheduleItem}>
                <Text style={styles.scheduleDate}>{schedule.date}</Text>
                <Text style={styles.scheduleDetails}>{schedule.details}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.description}>
            {EVENT_DETAIL_MOCK.description2}
          </Text>

          <TouchableOpacity style={styles.subscribeButton}>
            <Text style={styles.subscribeButtonText}>INSCREVA-SE</Text>
          </TouchableOpacity>
        </View>
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

  // Header Styles
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
  headerTitle: { fontSize: 20, fontWeight: "900", color: "#000" },
  headerTitleHighlight: { color: COLORS.accentGreen },

  // Content Styles
  contentWrapper: { padding: 20 },
  bannerImage: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    resizeMode: "cover",
    marginBottom: 16,
  },
  statusBadge: {
    backgroundColor: COLORS.accentGreen,
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

  // Schedule Box Styles
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

  // Button Styles
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
});
