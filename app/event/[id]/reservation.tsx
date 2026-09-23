import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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

import { MenuModal } from "../../../components/MenuModal";
import { COLORS } from "../../../constants/theme";

type ReservationType = "individual" | "group";

interface School {
  id: string;
  name: string;
  cnpj: string;
}

interface SchoolGroup {
  id: string;
  schoolId: string;
  name: string;
  totalStudents: number;
}

interface Schedule {
  id: string;
  date: string;
  details: string;
}

/*
  Dados temporários.

  Quando a API existir, esses dados deverão vir do backend.

  Os dados que o usuário precisa preencher NÃO começam preenchidos.
*/
const EVENT_DATA = {
  title: "Um dia muito especial",
  location: "Museu de Birigui",
  availableSpots: 30,

  schedules: [
    {
      id: "1",
      date: "10/05",
      details: "Quarta, às 19h",
    },
    {
      id: "2",
      date: "11/05",
      details: "Quinta, às 19h",
    },
    {
      id: "3",
      date: "12/05",
      details: "Sexta, às 19h",
    },
  ] as Schedule[],
};

const SCHOOLS: School[] = [
  {
    id: "1",
    name: "E.E. Prof. Stélio Machado Loureiro",
    cnpj: "46.123.456/0001-89",
  },
  {
    id: "2",
    name: "E.E. Dr. Carlos Carvalho Rosa",
    cnpj: "12.345.678/0001-90",
  },
];

const GROUPS: SchoolGroup[] = [
  {
    id: "1",
    schoolId: "1",
    name: "9º Ano B",
    totalStudents: 32,
  },
  {
    id: "2",
    schoolId: "1",
    name: "8º Ano A",
    totalStudents: 28,
  },
  {
    id: "3",
    schoolId: "2",
    name: "3º Ano A",
    totalStudents: 25,
  },
];

/*
  Também temporário enquanto não há API/autenticação integrada.
*/
const REPRESENTATIVE = {
  name: "Mariana Souza Silva",
  email: "mariana@educacao.sp.gov.br",
  phone: "(18) 99123-4567",
};

export default function ReservationScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const [reservationType, setReservationType] =
    useState<ReservationType>("individual");

  /*
    Data e horário
  */
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);

  /*
    Individual
  */
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  /*
    Grupo escolar
  */
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  const [selectedGroup, setSelectedGroup] = useState<SchoolGroup | null>(null);

  const [showSchools, setShowSchools] = useState(false);
  const [showGroups, setShowGroups] = useState(false);

  const [participants, setParticipants] = useState("");

  /*
    Campos comuns
  */
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");

  const participantCount = Number(participants);

  const selectedScheduleData = EVENT_DATA.schedules.find(
    (schedule) => schedule.id === selectedSchedule,
  );

  const availableGroups = GROUPS.filter(
    (group) => group.schoolId === selectedSchool?.id,
  );

  const notEnoughSpots =
    reservationType === "group" &&
    participants !== "" &&
    participantCount > EVENT_DATA.availableSpots;

  function handleReservationType(type: ReservationType) {
    setReservationType(type);
    setFormError("");
  }

  function selectSchool(school: School) {
    setSelectedSchool(school);

    // Se trocar de escola, remove a turma selecionada anteriormente.
    setSelectedGroup(null);

    setShowSchools(false);
    setShowGroups(false);
  }

  function selectGroup(group: SchoolGroup) {
    setSelectedGroup(group);
    setShowGroups(false);
  }

  function handleSubmit() {
    setFormError("");

    /*
      Data e horário são obrigatórios
    */
    if (!selectedSchedule) {
      setFormError("Selecione uma data e horário.");
      return;
    }

    /*
      Validação individual
    */
    if (reservationType === "individual") {
      if (!firstName.trim() || !lastName.trim() || !email.trim()) {
        setFormError("Preencha todos os campos obrigatórios.");
        return;
      }

      if (!email.includes("@")) {
        setFormError("Informe um e-mail válido.");
        return;
      }
    }

    /*
      Validação de grupo
    */
    if (reservationType === "group") {
      if (!selectedSchool) {
        setFormError("Selecione uma escola.");
        return;
      }

      if (!selectedGroup) {
        setFormError("Selecione uma turma.");
        return;
      }

      if (!participants || participantCount <= 0) {
        setFormError("Informe a quantidade de participantes esperados.");
        return;
      }

      if (notEnoughSpots) {
        setFormError(
          "Não há vagas suficientes para essa quantidade de participantes.",
        );
        return;
      }
    }

    /*
      Por enquanto apenas navega para a confirmação.

      Quando houver API, aqui futuramente será feita a requisição
      para criar a reserva.
    */
    router.push({
      pathname: "/event/[id]/confirmation",
      params: {
        id: String(id),

        reservationType,

        eventTitle: EVENT_DATA.title,

        date: selectedScheduleData?.date ?? "",
        schedule: selectedScheduleData?.details ?? "",

        visitorName:
          reservationType === "individual"
            ? `${firstName} ${lastName}`.trim()
            : "",

        school: reservationType === "group" ? (selectedSchool?.name ?? "") : "",

        group: reservationType === "group" ? (selectedGroup?.name ?? "") : "",

        participants: reservationType === "group" ? participants : "1",
      },
    });
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

      {/* CONTEÚDO */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.pageTitle}>Reserva de evento</Text>

        <Text style={styles.pageDescription}>
          Escolha a data e preencha as informações da reserva.
        </Text>

        {/* EVENTO */}
        <View style={styles.eventCard}>
          <View style={styles.eventBadge}>
            <Text style={styles.eventBadgeText}>EVENTO SELECIONADO</Text>
          </View>

          <Text style={styles.eventTitle}>{EVENT_DATA.title}</Text>

          <View style={styles.eventInfo}>
            <Ionicons name="location" size={15} color={COLORS.yellowIcon} />

            <Text style={styles.eventInfoText}>{EVENT_DATA.location}</Text>
          </View>

          <Text style={styles.availableSpots}>
            {EVENT_DATA.availableSpots} vagas disponíveis
          </Text>
        </View>

        {/* DATA E HORÁRIO */}
        <Text style={styles.sectionTitle}>Data e horário *</Text>

        <View style={styles.scheduleContainer}>
          {EVENT_DATA.schedules.map((schedule) => {
            const isSelected = selectedSchedule === schedule.id;

            return (
              <TouchableOpacity
                key={schedule.id}
                style={[
                  styles.scheduleOption,
                  isSelected && styles.scheduleOptionSelected,
                ]}
                onPress={() => {
                  setSelectedSchedule(schedule.id);
                  setFormError("");
                }}
              >
                <View>
                  <Text
                    style={[
                      styles.scheduleDate,
                      isSelected && styles.scheduleTextSelected,
                    ]}
                  >
                    {schedule.date}
                  </Text>

                  <Text
                    style={[
                      styles.scheduleDetails,
                      isSelected && styles.scheduleTextSelected,
                    ]}
                  >
                    {schedule.details}
                  </Text>
                </View>

                {isSelected && (
                  <Ionicons
                    name="checkmark-circle"
                    size={23}
                    color={COLORS.yellowIcon}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* TIPO DE RESERVA */}
        <Text style={styles.sectionTitle}>Tipo de reserva</Text>

        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              reservationType === "individual" && styles.typeButtonActive,
            ]}
            onPress={() => handleReservationType("individual")}
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
            onPress={() => handleReservationType("group")}
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

        {/* RESERVA INDIVIDUAL */}
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

        {/* RESERVA DE GRUPO */}
        {reservationType === "group" && (
          <>
            {/* ESCOLA */}
            <Text style={styles.label}>Escola *</Text>

            <TouchableOpacity
              style={styles.select}
              onPress={() => setShowSchools(!showSchools)}
            >
              <Text
                style={[
                  styles.selectText,
                  !selectedSchool && styles.placeholderText,
                ]}
              >
                {selectedSchool ? selectedSchool.name : "Selecione uma escola"}
              </Text>

              <Ionicons
                name={showSchools ? "chevron-up" : "chevron-down"}
                size={18}
                color={COLORS.primaryBrown}
              />
            </TouchableOpacity>

            {showSchools && (
              <View style={styles.optionsContainer}>
                {SCHOOLS.map((school) => (
                  <TouchableOpacity
                    key={school.id}
                    style={styles.option}
                    onPress={() => selectSchool(school)}
                  >
                    <Text style={styles.optionText}>{school.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {selectedSchool && (
              <Text style={styles.helperText}>CNPJ: {selectedSchool.cnpj}</Text>
            )}

            {/* SOMENTE VISUAL */}
            <Text style={styles.addSchool}>+ Cadastrar nova escola</Text>

            {/* TURMA */}
            <Text style={styles.label}>Grupo / Turma *</Text>

            <TouchableOpacity
              style={[styles.select, !selectedSchool && styles.selectDisabled]}
              disabled={!selectedSchool}
              onPress={() => setShowGroups(!showGroups)}
            >
              <Text
                style={[
                  styles.selectText,
                  !selectedGroup && styles.placeholderText,
                ]}
              >
                {selectedGroup ? selectedGroup.name : "Selecione uma turma"}
              </Text>

              <Ionicons
                name={showGroups ? "chevron-up" : "chevron-down"}
                size={18}
                color={COLORS.primaryBrown}
              />
            </TouchableOpacity>

            {showGroups && selectedSchool && (
              <View style={styles.optionsContainer}>
                {availableGroups.map((group) => (
                  <TouchableOpacity
                    key={group.id}
                    style={styles.option}
                    onPress={() => selectGroup(group)}
                  >
                    <Text style={styles.optionText}>{group.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {selectedGroup && (
              <Text style={styles.helperText}>
                {selectedGroup.totalStudents} alunos cadastrados nesta turma
              </Text>
            )}

            {/* REPRESENTANTE */}
            {selectedGroup && (
              <View style={styles.representativeCard}>
                <Text style={styles.representativeTitle}>
                  Representante responsável
                </Text>

                <Text style={styles.representativeName}>
                  {REPRESENTATIVE.name}
                </Text>

                <View style={styles.representativeInfo}>
                  <Ionicons name="mail" size={14} color={COLORS.primaryBrown} />

                  <Text style={styles.representativeText}>
                    {REPRESENTATIVE.email}
                  </Text>
                </View>

                <View style={styles.representativeInfo}>
                  <Ionicons name="call" size={14} color={COLORS.primaryBrown} />

                  <Text style={styles.representativeText}>
                    {REPRESENTATIVE.phone}
                  </Text>
                </View>
              </View>
            )}

            {/* PARTICIPANTES */}
            <Text style={styles.label}>Participantes esperados *</Text>

            <TextInput
              style={[styles.input, notEnoughSpots && styles.inputError]}
              value={participants}
              onChangeText={(value) =>
                setParticipants(value.replace(/[^0-9]/g, ""))
              }
              placeholder="Digite a quantidade de participantes"
              placeholderTextColor="#8C765E"
              keyboardType="number-pad"
            />

            {notEnoughSpots ? (
              <Text style={styles.errorText}>
                Não há vagas suficientes para essa quantidade de participantes.
              </Text>
            ) : (
              <Text style={styles.helperText}>
                {EVENT_DATA.availableSpots} vagas disponíveis
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
          onChangeText={(value) => setNotes(value.slice(0, 250))}
          placeholder="Informe alguma necessidade ou observação..."
          placeholderTextColor="#8C765E"
          multiline
          textAlignVertical="top"
        />

        {/* RESUMO */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumo da reserva</Text>

          <View style={styles.divider} />

          <SummaryRow label="Evento" value={EVENT_DATA.title} />

          <SummaryRow label="Data" value={selectedScheduleData?.date ?? "-"} />

          <SummaryRow
            label="Horário"
            value={selectedScheduleData?.details ?? "-"}
          />

          {reservationType === "individual" && (
            <>
              <SummaryRow
                label="Visitante"
                value={
                  firstName || lastName
                    ? `${firstName} ${lastName}`.trim()
                    : "-"
                }
              />

              <SummaryRow label="Participantes" value="1 pessoa" />
            </>
          )}

          {reservationType === "group" && (
            <>
              <SummaryRow label="Escola" value={selectedSchool?.name ?? "-"} />

              <SummaryRow label="Turma" value={selectedGroup?.name ?? "-"} />

              <SummaryRow
                label="Participantes"
                value={participants ? `${participants} pessoas` : "-"}
              />
            </>
          )}
        </View>

        {/* ERRO DO FORMULÁRIO */}
        {formError !== "" && <Text style={styles.formError}>{formError}</Text>}

        {/* BOTÃO */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            notEnoughSpots && styles.submitButtonDisabled,
          ]}
          disabled={notEnoughSpots}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>
            {reservationType === "group"
              ? "Solicitar reserva do grupo"
              : "Solicitar reserva"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MENU */}
      <MenuModal
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
      />
    </View>
  );
}

/*
  Linha do resumo
*/
interface SummaryRowProps {
  label: string;
  value: string;
}

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>

      <Text style={styles.summaryValue}>{value}</Text>
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
    padding: 20,
    paddingBottom: 50,
  },

  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textDark,
  },

  pageDescription: {
    fontSize: 13,
    color: COLORS.textDark,
    opacity: 0.7,
    marginTop: 5,
    marginBottom: 20,
  },

  /*
    EVENTO
  */
  eventCard: {
    backgroundColor: COLORS.primaryBrown,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },

  eventBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.yellowIcon,
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 10,
  },

  eventBadgeText: {
    fontSize: 9,
    fontWeight: "bold",
    color: COLORS.textDark,
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
    gap: 7,
    marginBottom: 6,
  },

  eventInfoText: {
    fontSize: 12,
    color: COLORS.secondaryBeige,
  },

  availableSpots: {
    color: COLORS.yellowIcon,
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 8,
  },

  /*
    TÍTULOS
  */
  sectionTitle: {
    color: COLORS.textDark,
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 8,
  },

  /*
    DATA / HORÁRIO
  */
  scheduleContainer: {
    gap: 8,
    marginBottom: 20,
  },

  scheduleOption: {
    borderWidth: 1,
    borderColor: "#C8B991",
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  scheduleOptionSelected: {
    backgroundColor: COLORS.primaryBrown,
    borderColor: COLORS.primaryBrown,
  },

  scheduleDate: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.textDark,
  },

  scheduleDetails: {
    marginTop: 3,
    fontSize: 12,
    color: COLORS.textDark,
  },

  scheduleTextSelected: {
    color: COLORS.secondaryBeige,
  },

  /*
    TIPO DE RESERVA
  */
  typeSelector: {
    flexDirection: "row",
    backgroundColor: "#DED69A",
    borderRadius: 9,
    padding: 4,
    marginBottom: 15,
  },

  typeButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 7,
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

  /*
    INPUTS
  */
  label: {
    color: COLORS.textDark,
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#C8B991",
    backgroundColor: COLORS.secondaryBeige,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: COLORS.textDark,
    fontSize: 13,
  },

  placeholderText: {
    color: "#8C765E",
  },

  /*
    SELECTS
  */
  select: {
    borderWidth: 1,
    borderColor: "#C8B991",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  selectDisabled: {
    opacity: 0.5,
  },

  selectText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textDark,
  },

  optionsContainer: {
    borderWidth: 1,
    borderColor: "#C8B991",
    borderRadius: 8,
    marginTop: 4,
    overflow: "hidden",
  },

  option: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD2AE",
  },

  optionText: {
    color: COLORS.textDark,
    fontSize: 12,
  },

  helperText: {
    color: COLORS.textDark,
    opacity: 0.65,
    fontSize: 10,
    marginTop: 5,
  },

  addSchool: {
    color: COLORS.primaryBrown,
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 8,
  },

  /*
    REPRESENTANTE
  */
  representativeCard: {
    backgroundColor: "#DED69A",
    borderRadius: 10,
    padding: 13,
    marginTop: 15,
  },

  representativeTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: COLORS.primaryBrown,
    marginBottom: 7,
  },

  representativeName: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 5,
  },

  representativeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 3,
  },

  representativeText: {
    fontSize: 10,
    color: COLORS.textDark,
  },

  /*
    ERROS
  */
  inputError: {
    borderColor: "#B3261E",
    borderWidth: 2,
  },

  errorText: {
    color: "#B3261E",
    fontSize: 10,
    marginTop: 5,
  },

  /*
    OBSERVAÇÕES
  */
  notesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 4,
  },

  characterCounter: {
    color: COLORS.textDark,
    opacity: 0.5,
    fontSize: 9,
    marginBottom: 6,
  },

  notesInput: {
    borderWidth: 1,
    borderColor: "#C8B991",
    borderRadius: 8,
    minHeight: 90,
    padding: 12,
    color: COLORS.textDark,
    fontSize: 12,
  },

  /*
    RESUMO
  */
  summaryCard: {
    borderWidth: 1,
    borderColor: "#C8B991",
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
  },

  summaryTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.primaryBrown,
  },

  divider: {
    height: 1,
    backgroundColor: "#C8B991",
    marginVertical: 12,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
    marginBottom: 9,
  },

  summaryLabel: {
    fontSize: 11,
    color: COLORS.textDark,
    opacity: 0.7,
  },

  summaryValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 11,
    color: COLORS.textDark,
    fontWeight: "600",
  },

  formError: {
    color: "#B3261E",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 12,
  },

  /*
    BOTÃO
  */
  submitButton: {
    backgroundColor: COLORS.primaryBrown,
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 15,
    marginTop: 16,
  },

  submitButtonDisabled: {
    opacity: 0.45,
  },

  submitButtonText: {
    color: COLORS.yellowIcon,
    fontSize: 13,
    fontWeight: "bold",
  },
});
