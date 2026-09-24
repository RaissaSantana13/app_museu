import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MenuModal } from "../../../components/MenuModal";
import { COLORS } from "../../../constants/theme";

export default function ConfirmationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const {
    reservationType,
    eventTitle,
    date,
    schedule,
    visitorName,
    school,
    group,
    participants,
  } = useLocalSearchParams<{
    reservationType: "individual" | "group";
    eventTitle: string;
    date: string;
    schedule: string;
    visitorName?: string;
    school?: string;
    group?: string;
    participants: string;
  }>();

  /*
    Código temporário enquanto ainda não existe API.

    Futuramente esse valor deve vir de:
    event_bookings.id_booking
  */
  const reservationCode = "#2026-B849";

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
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => setIsMenuVisible(true)}>
            <Ionicons name="menu" size={32} color={COLORS.secondaryBeige} />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>
              MUSEU DE <Text style={styles.headerTitleHighlight}>BIRIGUI</Text>
            </Text>

            <Text style={styles.pageSubtitle}>RESERVA</Text>
          </View>

          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons
              name="arrow-back"
              size={28}
              color={COLORS.secondaryBeige}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* CONTEÚDO */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* ÍCONE */}
        <View style={styles.successIcon}>
          <Ionicons name="checkmark" size={34} color={COLORS.secondaryBeige} />
        </View>

        <Text style={styles.title}>Solicitação enviada!</Text>

        <Text style={styles.description}>
          Sua solicitação de reserva foi registrada.
        </Text>

        {/* STATUS */}
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>PENDENTE DE CONFIRMAÇÃO</Text>
        </View>

        {/* DETALHES */}
        <View style={styles.detailsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Detalhes da solicitação</Text>

            <Text style={styles.reservationCode}>Cód: {reservationCode}</Text>
          </View>

          <View style={styles.divider} />

          <DetailRow label="Evento" value={eventTitle ?? "-"} />

          <DetailRow
            label="Data e Hora"
            value={`${date ?? "-"}, ${schedule ?? "-"}`}
          />

          {reservationType === "individual" ? (
            <>
              <DetailRow label="Visitante" value={visitorName || "-"} />

              <DetailRow label="Participantes" value="1 pessoa" />
            </>
          ) : (
            <>
              <DetailRow label="Instituição" value={school || "-"} />

              <DetailRow label="Grupo/Turma" value={group || "-"} />

              <DetailRow
                label="Participantes"
                value={`${participants ?? "-"} pessoas`}
              />
            </>
          )}
        </View>

        {/* AVISO */}
        <View style={styles.infoContainer}>
          <Ionicons name="mail-outline" size={18} color={COLORS.primaryBrown} />

          <Text style={styles.infoText}>
            Um e-mail de confirmação será enviado quando a solicitação for
            analisada.
          </Text>
        </View>

        {/* BOTÃO */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/")}
          activeOpacity={0.85}
        >
          <Text style={styles.backButtonText}>Voltar para eventos</Text>
        </TouchableOpacity>
      </ScrollView>

      <MenuModal
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
      />
    </View>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>

      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.primaryBrown,
  },

  /*
    HEADER
  */
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
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#000",
  },

  headerTitleHighlight: {
    color: COLORS.yellowIcon,
  },

  pageSubtitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.secondaryBeige,
    marginTop: 4,
    letterSpacing: 2,
  },

  /*
    CONTEÚDO
  */
  content: {
    flex: 1,
    backgroundColor: COLORS.secondaryBeige,
  },

  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 50,
    alignItems: "center",
  },

  /*
    SUCESSO
  */
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#D9D28F",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primaryBrown,
    textAlign: "center",
  },

  description: {
    fontSize: 13,
    color: COLORS.textDark,
    textAlign: "center",
    marginTop: 6,
  },

  /*
    STATUS
  */
  statusBadge: {
    backgroundColor: "#DED69A",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
    marginBottom: 25,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.primaryBrown,
  },

  /*
    CARD
  */
  detailsCard: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#C8B991",
    borderRadius: 14,
    padding: 16,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.primaryBrown,
  },

  reservationCode: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.primaryBrown,
  },

  divider: {
    height: 1,
    backgroundColor: "#C8B991",
    marginVertical: 14,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
    marginBottom: 12,
  },

  detailLabel: {
    fontSize: 11,
    color: COLORS.textDark,
    opacity: 0.7,
  },

  detailValue: {
    flex: 1,
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.primaryBrown,
    textAlign: "right",
  },

  /*
    AVISO
  */
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 18,
    paddingHorizontal: 8,
  },

  infoText: {
    flex: 1,
    fontSize: 10,
    color: COLORS.textDark,
    textAlign: "center",
    lineHeight: 15,
  },

  /*
    BOTÃO
  */
  backButton: {
    width: "100%",
    backgroundColor: COLORS.primaryBrown,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 25,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },

  backButtonText: {
    color: COLORS.yellowIcon,
    fontSize: 13,
    fontWeight: "bold",
  },
});
