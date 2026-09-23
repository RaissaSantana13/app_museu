import { Ionicons } from "@expo/vector-icons";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MenuModal } from "@/components/MenuModal";
import { COLORS } from "@/constants/theme";

type ReservationType = "individual" | "group";

// Dados temporários enquanto não existe API
const EVENT_MOCK = {
  id: "1",
  title: "O solo vira arte",
  location: "Sala de Exposições Temporárias",
  date: "24 de maio de 2026",
  time: "14:00",
  availableSpots: 30,
};

const SCHOOL_MOCK = {
  id: "1",
  name: "E.E. Prof. Stélio Machado Loureiro",
  cnpj: "46.123.456/0001-89",
};

const GROUP_MOCK = {
  id: "1",
  name: "9º Ano B - Ensino Fundamental II",
  totalStudents: 32,
};

const REPRESENTATIVE_MOCK = {
  name: "Profa. Mariana Souza Silva",
  email: "mariana.silva@educacao.sp.gov.br",
  phone: "(18) 99123-4567",
};

export default function ReservationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();

  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const [reservationType, setReservationType] =
    useState<ReservationType>("individual");

  // Reserva individual
  const [firstName, setFirstName] = useState("Mariana");
  const [lastName, setLastName] = useState("Souza Silva");
  const [email, setEmail] = useState("mariana.silva@gmail.com");
  const [phone, setPhone] = useState("(18) 99123-4567");

  // Reserva em grupo
  const [participants, setParticipants] = useState(1);

  // Campo utilizado nas duas modalidades
  const [notes, setNotes] = useState("");

  const [formError, setFormError] = useState("");

  const notEnoughSpots =
    reservationType === "group" && participants > EVENT_MOCK.availableSpots;

  function increaseParticipants() {
    setParticipants((current) => current + 1);
  }

  function decreaseParticipants() {
    setParticipants((current) => Math.max(1, current - 1));
  }

  function handleSubmit() {
    setFormError("");

    if (reservationType === "individual") {
      if (!firstName.trim() || !lastName.trim() || !email.trim()) {
        setFormError("Preencha os campos obrigatórios.");
        return;
      }

      if (!email.includes("@")) {
        setFormError("Informe um e-mail válido.");
        return;
      }
    }

    if (reservationType === "group") {
      if (participants <= 0) {
        setFormError("Informe a quantidade de participantes.");
        return;
      }

      if (notEnoughSpots) {
        setFormError(
          "Não há vagas suficientes para essa quantidade de participantes.",
        );
        return;
      }
    }

    router.push(`/event/${String(id ?? EVENT_MOCK.id)}/confirmation` as Href);
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

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.pageTitle}>
          {reservationType === "individual"
            ? "Reserva individual"
            : "Reserva de evento"}
        </Text>

        <Text style={styles.pageDescription}>
          Agende sua visita e aproveite a programação do Museu de Birigui.
        </Text>

        {/* EVENTO */}
        <View style={styles.eventCard}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>EXPOSIÇÃO SELECIONADA</Text>
          </View>

          <Text style={styles.eventTitle}>{EVENT_MOCK.title}</Text>

          <View style={styles.eventInfo}>
            <Ionicons name="location" size={14} color={COLORS.yellowIcon} />
            <Text style={styles.eventInfoText}>{EVENT_MOCK.location}</Text>
          </View>

          <View style={styles.eventInfo}>
            <Ionicons name="calendar" size={14} color={COLORS.yellowIcon} />
            <Text style={styles.eventInfoText}>{EVENT_MOCK.date}</Text>
          </View>

          <View style={styles.eventInfo}>
            <Ionicons name="time" size={14} color={COLORS.yellowIcon} />
            <Text style={styles.eventInfoText}>{EVENT_MOCK.time}</Text>
          </View>

          <Text style={styles.availableSpots}>
            {EVENT_MOCK.availableSpots} vagas disponíveis para esta sessão
          </Text>
        </View>

        {/* TIPO DE RESERVA */}
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              reservationType === "individual" && styles.typeButtonActive,
            ]}
            onPress={() => {
              setReservationType("individual");
              setFormError("");
            }}
          >
            <Text
              style={[
                styles.typeButtonText,
                reservationType === "individual" && styles.typeButtonTextActive,
              ]}
            >
              Individual
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeButton,
              reservationType === "group" && styles.typeButtonActive,
            ]}
            onPress={() => {
              setReservationType("group");
              setFormError("");
            }}
          >
            <Text
              style={[
                styles.typeButtonText,
                reservationType === "group" && styles.typeButtonTextActive,
              ]}
            >
              Grupo escolar
            </Text>
          </TouchableOpacity>
        </View>

        {/* FORMULÁRIO INDIVIDUAL */}
        {reservationType === "individual" && (
          <>
            <Text style={styles.label}>Nome *</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Digite seu nome"
              placeholderTextColor="#8C765E"
            />

            <Text style={styles.label}>Sobrenome *</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Digite seu sobrenome"
              placeholderTextColor="#8C765E"
            />

            <Text style={styles.label}>E-mail *</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="exemplo@email.com"
              placeholderTextColor="#8C765E"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="(00) 00000-0000"
              placeholderTextColor="#8C765E"
              keyboardType="phone-pad"
            />
          </>
        )}

        {/* FORMULÁRIO DE GRUPO */}
        {reservationType === "group" && (
          <>
            <Text style={styles.label}>Escola *</Text>

            <TouchableOpacity style={styles.selectInput}>
              <Text style={styles.selectText}>{SCHOOL_MOCK.name}</Text>
              <Ionicons
                name="chevron-down"
                size={18}
                color={COLORS.primaryBrown}
              />
            </TouchableOpacity>

            <Text style={styles.helperText}>CNPJ: {SCHOOL_MOCK.cnpj}</Text>

            {/* Visual apenas, sem funcionalidade */}
            <Text style={styles.addSchoolText}>+ Cadastrar nova escola</Text>

            <Text style={styles.label}>Grupo/Turma *</Text>

            <TouchableOpacity style={styles.selectInput}>
              <Text style={styles.selectText}>{GROUP_MOCK.name}</Text>
              <Ionicons
                name="chevron-down"
                size={18}
                color={COLORS.primaryBrown}
              />
            </TouchableOpacity>

            <Text style={styles.helperText}>
              Total de {GROUP_MOCK.totalStudents} alunos pré-cadastrados nesta
              turma
            </Text>

            {/* REPRESENTANTE */}
            <View style={styles.representativeCard}>
              <Text style={styles.representativeHeader}>
                <Ionicons name="person" size={15} color={COLORS.primaryBrown} />{" "}
                Representante responsável
              </Text>

              <Text style={styles.representativeName}>
                {REPRESENTATIVE_MOCK.name}
              </Text>

              <Text style={styles.representativeText}>
                {REPRESENTATIVE_MOCK.email}
              </Text>

              <Text style={styles.representativeText}>
                {REPRESENTATIVE_MOCK.phone}
              </Text>
            </View>

            {/* PARTICIPANTES */}
            <Text style={styles.label}>Participantes esperados *</Text>

            <View
              style={[
                styles.participantsContainer,
                notEnoughSpots && styles.inputError,
              ]}
            >
              <Text style={styles.participantNumber}>{participants}</Text>

              <View style={styles.counterButtons}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={decreaseParticipants}
                >
                  <Text style={styles.counterButtonText}>−</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={increaseParticipants}
                >
                  <Text style={styles.counterButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {notEnoughSpots ? (
              <Text style={styles.errorText}>
                Não há vagas suficientes para essa quantidade de participantes.
              </Text>
            ) : (
              <Text style={styles.helperText}>
                {EVENT_MOCK.availableSpots} vagas disponíveis
              </Text>
            )}
          </>
        )}

        {/* OBSERVAÇÕES */}
        <View style={styles.notesHeader}>
          <Text style={styles.label}>Observações</Text>
          <Text style={styles.characterCounter}>{notes.length}/250</Text>
        </View>

        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={(text) => setNotes(text.slice(0, 250))}
          placeholder="Ex: Necessidade de rampa de acesso para aluno cadeirante..."
          placeholderTextColor="#8C765E"
          multiline
          textAlignVertical="top"
        />

        {/* RESUMO */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumo da reserva</Text>

          <View style={styles.divider} />

          <SummaryRow label="Evento" value={EVENT_MOCK.title} />
          <SummaryRow
            label="Data e Horário"
            value={`${EVENT_MOCK.date}, às ${EVENT_MOCK.time}`}
          />

          {reservationType === "individual" ? (
            <>
              <SummaryRow
                label="Visitante"
                value={`${firstName} ${lastName}`.trim()}
              />
              <SummaryRow label="Participantes" value="1 pessoa" />
            </>
          ) : (
            <>
              <SummaryRow label="Instituição" value={SCHOOL_MOCK.name} />
              <SummaryRow label="Grupo/Turma" value={GROUP_MOCK.name} />
              <SummaryRow
                label="Participantes"
                value={`${participants} pessoas${
                  notEnoughSpots ? " (indisponível)" : ""
                }`}
              />
            </>
          )}
        </View>

        {formError !== "" && <Text style={styles.formError}>{formError}</Text>}

        {/* BOTÃO */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            notEnoughSpots && styles.submitButtonDisabled,
          ]}
          disabled={notEnoughSpots}
          onPress={handleSubmit}
          activeOpacity={0.85}
        >
          <Text style={styles.submitButtonText}>
            {reservationType === "group"
              ? "Solicitar reserva do grupo"
              : "Solicitar reserva"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <MenuModal
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
      />
    </View>
  );
}

interface SummaryRowProps {
  label: string;
  value: string;
}

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}:</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.primaryBrown,
  },

  header: {
    backgroundColor: COLORS.primaryBrown,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
    fontSize: 13,
    fontWeight: "bold",
    color: COLORS.secondaryBeige,
    marginTop: 4,
    letterSpacing: 2,
  },

  content: {
    flex: 1,
    backgroundColor: COLORS.secondaryBeige,
  },

  contentContainer: {
    padding: 20,
    paddingBottom: 50,
  },

  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primaryBrown,
  },

  pageDescription: {
    fontSize: 13,
    color: COLORS.textDark,
    marginTop: 4,
    marginBottom: 18,
    opacity: 0.75,
  },

  eventCard: {
    backgroundColor: COLORS.primaryBrown,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.yellowIcon,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },

  badgeText: {
    fontSize: 9,
    fontWeight: "bold",
    color: COLORS.primaryBrown,
  },

  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.secondaryBeige,
    marginBottom: 12,
  },

  eventInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },

  eventInfoText: {
    fontSize: 12,
    color: COLORS.secondaryBeige,
  },

  availableSpots: {
    color: COLORS.yellowIcon,
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 6,
  },

  typeSelector: {
    flexDirection: "row",
    backgroundColor: "#DED69A",
    borderRadius: 8,
    padding: 3,
    marginBottom: 16,
  },

  typeButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 9,
    borderRadius: 6,
  },

  typeButtonActive: {
    backgroundColor: COLORS.primaryBrown,
  },

  typeButtonText: {
    color: COLORS.primaryBrown,
    fontSize: 12,
    fontWeight: "600",
  },

  typeButtonTextActive: {
    color: COLORS.yellowIcon,
  },

  label: {
    color: COLORS.primaryBrown,
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
    marginTop: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: "#D5C79C",
    backgroundColor: COLORS.secondaryBeige,
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.textDark,
    fontSize: 13,
  },

  selectInput: {
    borderWidth: 1,
    borderColor: "#D5C79C",
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  selectText: {
    flex: 1,
    color: COLORS.textDark,
    fontSize: 12,
  },

  helperText: {
    fontSize: 10,
    color: COLORS.textDark,
    opacity: 0.65,
    marginTop: 4,
  },

  addSchoolText: {
    color: COLORS.primaryBrown,
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 7,
    marginBottom: 5,
  },

  representativeCard: {
    backgroundColor: "#DED69A",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    marginBottom: 10,
  },

  representativeHeader: {
    color: COLORS.primaryBrown,
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 7,
  },

  representativeName: {
    color: COLORS.primaryBrown,
    fontSize: 12,
    fontWeight: "bold",
  },

  representativeText: {
    color: COLORS.textDark,
    fontSize: 10,
    marginTop: 2,
  },

  participantsContainer: {
    borderWidth: 1,
    borderColor: "#D5C79C",
    borderRadius: 7,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  participantNumber: {
    color: COLORS.textDark,
    fontSize: 14,
  },

  counterButtons: {
    flexDirection: "row",
    gap: 6,
  },

  counterButton: {
    width: 28,
    height: 28,
    backgroundColor: "#DED69A",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  counterButtonText: {
    color: COLORS.primaryBrown,
    fontWeight: "bold",
    fontSize: 18,
  },

  inputError: {
    borderColor: "#B3261E",
    borderWidth: 2,
  },

  errorText: {
    color: "#B3261E",
    fontSize: 10,
    marginTop: 5,
  },

  notesHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 4,
  },

  characterCounter: {
    fontSize: 9,
    color: COLORS.textDark,
    opacity: 0.6,
    marginBottom: 5,
  },

  notesInput: {
    minHeight: 85,
    borderWidth: 1,
    borderColor: "#D5C79C",
    borderRadius: 7,
    padding: 10,
    color: COLORS.textDark,
    fontSize: 12,
  },

  summaryCard: {
    borderWidth: 1,
    borderColor: "#D5C79C",
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
  },

  summaryTitle: {
    color: COLORS.primaryBrown,
    fontSize: 14,
    fontWeight: "bold",
  },

  divider: {
    height: 1,
    backgroundColor: "#D5C79C",
    marginVertical: 10,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
    marginBottom: 8,
  },

  summaryLabel: {
    color: COLORS.textDark,
    fontSize: 10,
    opacity: 0.75,
  },

  summaryValue: {
    flex: 1,
    textAlign: "right",
    color: COLORS.primaryBrown,
    fontSize: 10,
  },

  formError: {
    color: "#B3261E",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 10,
  },

  submitButton: {
    backgroundColor: COLORS.primaryBrown,
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 14,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },

  submitButtonDisabled: {
    opacity: 0.45,
  },

  submitButtonText: {
    color: COLORS.yellowIcon,
    fontWeight: "bold",
    fontSize: 13,
  },
});
