import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MenuModal } from "../../../components/MenuModal";
import {
  type EscolaDetalhes,
  type RepresentanteDetalhes,
  type TurmaDetalhes,
} from "../../../constants/data";
import { COLORS } from "../../../constants/theme";
import {
  buildSchedules,
  createEventBooking,
  createEventBookingGroup,
  createOrFindVisitor,
  getEvent,
  listEventBookings,
  listSchoolGroups,
  listSchools,
  type EventSchedule,
} from "../../../services/events";

type ReservationType = "individual" | "group";

/*
  Dados do evento vindos da API (GET /api/v1/events/{id}).
  Os dados que o usuário precisa preencher NÃO começam preenchidos.
*/
interface EventInfo {
  title: string;
  location: string;
  schedules: EventSchedule[];
}

export default function ReservationScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const [eventInfo, setEventInfo] = useState<EventInfo>({
    title: "",
    location: "",
    schedules: [],
  });
  const [spotsLimit, setSpotsLimit] = useState(Infinity);
  const [schools, setSchools] = useState<EscolaDetalhes[]>([]);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setLoadingEvent(true);
        setLoadError("");

        const event = await getEvent(String(id), controller.signal);
        setEventInfo({
          title: event.title,
          location: event.location?.trim() || "Museu de Birigui",
          schedules: buildSchedules(event),
        });
        const maxSpots = event.maxCapacity ?? event.max_capacity ?? Infinity;
        setSpotsLimit(maxSpots);

        if (Number.isFinite(maxSpots)) {
          try {
            const bookings = await listEventBookings(
              String(id),
              controller.signal,
            );
            const bookedCount = bookings
              .filter((b) => b.status !== "CANCELADO")
              .reduce(
                (sum, b) => sum + (Number(b.expected_participant_count) || 0),
                0,
              );
            setSpotsLimit(Math.max(0, maxSpots - bookedCount));
          } catch {}
        }

        try {
          const apiSchools = await listSchools(controller.signal);
          setSchools(
            apiSchools.map((school) => ({
              id: String(school.idSchool),
              name: school.name,
              cnpj: school.cnpj ?? "",
            })),
          );
        } catch {
          setSchools([]);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setLoadError(
          err instanceof Error ? err.message : "Erro ao carregar o evento.",
        );
      } finally {
        if (!controller.signal.aborted) setLoadingEvent(false);
      }
    }

    load();
    return () => controller.abort();
  }, [id]);

  const [reservationType, setReservationType] =
    useState<ReservationType>("individual");

  /*
    Data e horário
  */
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);
  const scheduleCarouselRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const [carouselScrollAnim] = useState(() => new Animated.Value(0));
  const carouselScrollXRef = useRef(0);
  const [carouselWidth, setCarouselWidth] = useState(0);
  const [carouselContentWidth, setCarouselContentWidth] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const maxCarouselScroll = Math.max(0, carouselContentWidth - carouselWidth);
  const canScrollCarousel = maxCarouselScroll > 4;

  useEffect(() => {
    const syncArrows = (x: number) => {
      carouselScrollXRef.current = x;
      const nextLeft = x > 8;
      const nextRight = x < maxCarouselScroll - 8;
      setCanScrollLeft((prev) => (prev === nextLeft ? prev : nextLeft));
      setCanScrollRight((prev) => (prev === nextRight ? prev : nextRight));
    };

    syncArrows(carouselScrollXRef.current);
    const idListener = carouselScrollAnim.addListener(({ value }) => {
      syncArrows(value);
    });
    return () => carouselScrollAnim.removeListener(idListener);
  }, [carouselScrollAnim, maxCarouselScroll]);

  const thumbTranslateX = useMemo(
    () =>
      carouselScrollAnim.interpolate({
        inputRange: [0, Math.max(1, maxCarouselScroll)],
        outputRange: [0, 44],
        extrapolate: "clamp",
      }),
    [carouselScrollAnim, maxCarouselScroll],
  );

  const handleCarouselScroll = useMemo(
    () =>
      Animated.event(
        [{ nativeEvent: { contentOffset: { x: carouselScrollAnim } } }],
        { useNativeDriver: true },
      ),
    [carouselScrollAnim],
  );

  function scrollScheduleCarousel(direction: "left" | "right") {
    const step = 176;
    const nextX =
      direction === "right"
        ? Math.min(maxCarouselScroll, carouselScrollXRef.current + step)
        : Math.max(0, carouselScrollXRef.current - step);
    scheduleCarouselRef.current?.scrollTo({ x: nextX, animated: true });
  }

  /*
    Individual
  */
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  /*
    Grupo escolar
  */
  const [selectedSchool, setSelectedSchool] = useState<EscolaDetalhes | null>(
    null,
  );

  const [selectedGroup, setSelectedGroup] = useState<TurmaDetalhes | null>(
    null,
  );
  const [availableGroups, setAvailableGroups] = useState<TurmaDetalhes[]>([]);
  const [representativesMap, setRepresentativesMap] = useState<
    Record<string, RepresentanteDetalhes>
  >({});

  const [showSchools, setShowSchools] = useState(false);
  const [showGroups, setShowGroups] = useState(false);

  const [participants, setParticipants] = useState("");

  /*
    Campos comuns
  */
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const participantCount = Number(participants);

  const selectedScheduleData = eventInfo.schedules.find(
    (schedule) => schedule.id === selectedSchedule,
  );

  const selectedRepresentative = selectedGroup
    ? representativesMap[selectedGroup.representativeId]
    : undefined;

  const notEnoughSpots =
    reservationType === "group" &&
    participants !== "" &&
    participantCount > spotsLimit;

  function handleReservationType(type: ReservationType) {
    setReservationType(type);
    setFormError("");
  }

  async function selectSchool(school: EscolaDetalhes) {
    setSelectedSchool(school);
    setSelectedGroup(null);
    setAvailableGroups([]);
    setShowSchools(false);
    setShowGroups(false);

    try {
      const apiGroups = await listSchoolGroups(school.id);
      const reps: Record<string, RepresentanteDetalhes> = {};
      const mappedGroups: TurmaDetalhes[] = apiGroups.map((g) => {
        const repId = g.representative
          ? String(g.representative.idRepresentative)
          : "";
        if (g.representative?.usuario) {
          const u = g.representative.usuario;
          const repName =
            u.nomeUsuario ||
            `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() ||
            "Representante";
          reps[repId] = {
            id: repId,
            name: repName,
            email: u.email ?? "",
            phone: u.phone ?? "",
          };
        }
        return {
          id: String(g.idGroup),
          schoolId: school.id,
          name: g.groupName,
          totalStudents: g.totalStudents ?? 0,
          representativeId: repId,
        };
      });
      setRepresentativesMap(reps);
      setAvailableGroups(mappedGroups);
    } catch {
      setAvailableGroups([]);
    }
  }

  function selectGroup(group: TurmaDetalhes) {
    setSelectedGroup(group);
    setShowGroups(false);
  }

  async function handleSubmit() {
    setFormError("");

    /*
      Data e horário são obrigatórios
    */
    if (!selectedSchedule || !selectedScheduleData) {
      setFormError("Selecione uma data e horário.");
      return;
    }

    const cleanCpf = cpf.replace(/\D/g, "");

    /*
      Validação individual
    */
    if (reservationType === "individual") {
      if (
        !firstName.trim() ||
        !lastName.trim() ||
        !cleanCpf ||
        !email.trim()
      ) {
        setFormError("Preencha todos os campos obrigatórios.");
        return;
      }

      if (cleanCpf.length !== 11) {
        setFormError("Informe um CPF válido (11 dígitos).");
        return;
      }

      if (!email.includes("@")) {
        setFormError("Informe um e-mail válido.");
        return;
      }

      if (spotsLimit < 1) {
        setFormError("Não há vagas disponíveis para este evento.");
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

    try {
      setSubmitting(true);

      let visitorId: number | undefined;
      if (reservationType === "individual") {
        const visitor = await createOrFindVisitor({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          cpf: cleanCpf,
          email: email.trim(),
          ...(phone.trim() ? { phone: phone.trim() } : {}),
        });
        visitorId = visitor.idVisitor;
      }

      const booking = await createEventBooking({
        id_event: Number(id),
        ...(visitorId ? { id_visitor: visitorId } : {}),
        ...(reservationType === "group" && selectedGroup
          ? { id_group: Number(selectedGroup.id) }
          : {}),
        expected_participant_count:
          reservationType === "group" ? participantCount : 1,
        booking_date: selectedScheduleData.isoDateTime,
        status: "PENDENTE",
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });

      if (reservationType === "group" && selectedGroup && booking.id_booking) {
        try {
          await createEventBookingGroup(
            booking.id_booking,
            Number(selectedGroup.id),
            [],
          );
        } catch {}
      }

      router.push({
        pathname: "/event/[id]/confirmation",
        params: {
          id: String(id),
          bookingId: String(booking.id_booking ?? ""),
          bookingStatus: booking.status ?? "PENDENTE",
          reservationType,
          eventTitle: eventInfo.title,
          date: selectedScheduleData.date,
          schedule: selectedScheduleData.details,
          visitorName:
            reservationType === "individual"
              ? `${firstName} ${lastName}`.trim()
              : "",
          school:
            reservationType === "group" ? (selectedSchool?.name ?? "") : "",
          group:
            reservationType === "group" ? (selectedGroup?.name ?? "") : "",
          participants: reservationType === "group" ? participants : "1",
        },
      });
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Não foi possível registrar a reserva na API.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingEvent || loadError) {
    return (
      <View
        style={[
          styles.mainContainer,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            backgroundColor: COLORS.secondaryBeige,
          }}
        >
          {loadingEvent ? (
            <ActivityIndicator size="large" color={COLORS.primaryBrown} />
          ) : (
            <>
              <Text
                style={{
                  color: COLORS.textDark,
                  textAlign: "center",
                  marginBottom: 16,
                }}
              >
                {loadError}
              </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text
                  style={{ color: COLORS.primaryBrown, fontWeight: "bold" }}
                >
                  Voltar
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
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

          <Text style={styles.eventTitle}>{eventInfo.title}</Text>

          <View style={styles.eventInfo}>
            <Ionicons name="location" size={15} color={COLORS.yellowIcon} />

            <Text style={styles.eventInfoText}>{eventInfo.location}</Text>
          </View>

          <Text style={styles.availableSpots}>
            {Number.isFinite(spotsLimit)
              ? `${spotsLimit} vagas disponíveis`
              : "Vagas sujeitas à disponibilidade"}
          </Text>
        </View>

        {/* DATA E HORÁRIO */}
        <View style={styles.scheduleHeader}>
          <Text style={[styles.sectionTitle, styles.scheduleHeaderTitle]}>
            Data e horário *
          </Text>

          {canScrollCarousel && (
            <View style={styles.scheduleHint}>
              <Text style={styles.scheduleHintText}>Deslize</Text>

              <TouchableOpacity
                style={[
                  styles.scheduleArrowButton,
                  !canScrollLeft && styles.scheduleArrowDisabled,
                ]}
                disabled={!canScrollLeft}
                onPress={() => scrollScheduleCarousel("left")}
                accessibilityRole="button"
                accessibilityLabel="Ver datas anteriores"
              >
                <Ionicons
                  name="chevron-back"
                  size={15}
                  color={COLORS.primaryBrown}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.scheduleArrowButton,
                  !canScrollRight && styles.scheduleArrowDisabled,
                ]}
                disabled={!canScrollRight}
                onPress={() => scrollScheduleCarousel("right")}
                accessibilityRole="button"
                accessibilityLabel="Ver próximas datas"
              >
                <Ionicons
                  name="chevron-forward"
                  size={15}
                  color={COLORS.primaryBrown}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Animated.ScrollView
          ref={scheduleCarouselRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onLayout={(event) =>
            setCarouselWidth(event.nativeEvent.layout.width)
          }
          onContentSizeChange={(width) => setCarouselContentWidth(width)}
          onScroll={handleCarouselScroll}
          style={[
            styles.scheduleCarousel,
            !canScrollCarousel && styles.scheduleCarouselNoScroll,
          ]}
          contentContainerStyle={styles.scheduleCarouselContent}
        >
          {eventInfo.schedules.length === 0 && (
            <Text style={styles.helperText}>Nenhuma data disponível.</Text>
          )}

          {eventInfo.schedules.map((schedule) => {
            const isSelected = selectedSchedule === schedule.id;

            return (
              <TouchableOpacity
                key={schedule.id}
                style={[
                  styles.scheduleCard,
                  isSelected && styles.scheduleCardSelected,
                ]}
                onPress={() => {
                  setSelectedSchedule(schedule.id);
                  setFormError("");
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${schedule.details}, ${schedule.date}`}
              >
                <Text
                  style={[
                    styles.scheduleWeekday,
                    isSelected && styles.scheduleTextSelected,
                  ]}
                >
                  {schedule.weekdayShort}
                </Text>

                <Text
                  style={[
                    styles.scheduleDay,
                    isSelected && styles.scheduleDaySelected,
                  ]}
                >
                  {schedule.day}
                </Text>

                <Text
                  style={[
                    styles.scheduleMonth,
                    isSelected && styles.scheduleTextSelected,
                  ]}
                >
                  {schedule.month}
                </Text>

                {!!schedule.time && (
                  <View
                    style={[
                      styles.scheduleTimeBadge,
                      isSelected && styles.scheduleTimeBadgeSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.scheduleTime,
                        isSelected && styles.scheduleTimeSelected,
                      ]}
                    >
                      {schedule.time}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </Animated.ScrollView>

        {canScrollCarousel && (
          <View style={styles.scheduleProgressWrapper}>
            <View style={styles.scheduleProgressTrack}>
              <Animated.View
                style={[
                  styles.scheduleProgressThumb,
                  { transform: [{ translateX: thumbTranslateX }] },
                ]}
              />
            </View>
          </View>
        )}

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

            <Text style={styles.label}>CPF *</Text>

            <TextInput
              style={styles.input}
              value={cpf}
              onChangeText={setCpf}
              placeholder="000.000.000-00"
              placeholderTextColor="#8C765E"
              keyboardType="number-pad"
              maxLength={14}
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
                {schools.length > 0 ? (
                  schools.map((school) => (
                    <TouchableOpacity
                      key={school.id}
                      style={styles.option}
                      onPress={() => selectSchool(school)}
                    >
                      <Text style={styles.optionText}>{school.name}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.option}>
                    <Text style={styles.placeholderText}>
                      Nenhuma escola cadastrada na API.
                    </Text>
                  </View>
                )}
              </View>
            )}

            {selectedSchool && (
              <Text style={styles.helperText}>CNPJ: {selectedSchool.cnpj}</Text>
            )}

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
                {availableGroups.length > 0 ? (
                  availableGroups.map((group) => (
                    <TouchableOpacity
                      key={group.id}
                      style={styles.option}
                      onPress={() => selectGroup(group)}
                    >
                      <Text style={styles.optionText}>{group.name}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.option}>
                    <Text style={styles.placeholderText}>
                      Nenhuma turma cadastrada na API.
                    </Text>
                  </View>
                )}
              </View>
            )}

            {selectedGroup && (
              <Text style={styles.helperText}>
                {selectedGroup.totalStudents} alunos cadastrados nesta turma
              </Text>
            )}

            {/* REPRESENTANTE */}
            {selectedRepresentative && (
              <View style={styles.representativeCard}>
                <Text style={styles.representativeTitle}>
                  Representante responsável
                </Text>

                <Text style={styles.representativeName}>
                  {selectedRepresentative.name}
                </Text>

                <View style={styles.representativeInfo}>
                  <Ionicons name="mail" size={14} color={COLORS.primaryBrown} />

                  <Text style={styles.representativeText}>
                    {selectedRepresentative.email}
                  </Text>
                </View>

                <View style={styles.representativeInfo}>
                  <Ionicons name="call" size={14} color={COLORS.primaryBrown} />

                  <Text style={styles.representativeText}>
                    {selectedRepresentative.phone}
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
                {Number.isFinite(spotsLimit)
                  ? `${spotsLimit} vagas disponíveis`
                  : "Vagas sujeitas à disponibilidade"}
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

          <SummaryRow label="Evento" value={eventInfo.title} />

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
            (notEnoughSpots || submitting) && styles.submitButtonDisabled,
          ]}
          disabled={notEnoughSpots || submitting}
          onPress={handleSubmit}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={COLORS.yellowIcon} />
          ) : (
            <Text style={styles.submitButtonText}>
              {reservationType === "group"
                ? "Solicitar reserva do grupo"
                : "Solicitar reserva"}
            </Text>
          )}
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
  scheduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  scheduleHeaderTitle: {
    marginBottom: 0,
  },

  scheduleHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  scheduleHintText: {
    fontSize: 11,
    color: COLORS.primaryBrown,
    opacity: 0.75,
    marginRight: 2,
  },

  scheduleArrowButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#DED69A",
    alignItems: "center",
    justifyContent: "center",
  },

  scheduleArrowDisabled: {
    opacity: 0.35,
  },

  scheduleCarousel: {
    marginHorizontal: -20,
    marginBottom: 10,
  },

  scheduleCarouselNoScroll: {
    marginBottom: 20,
  },

  scheduleCarouselContent: {
    paddingHorizontal: 20,
    gap: 10,
  },

  scheduleProgressWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },

  scheduleProgressTrack: {
    width: 72,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#DED69A",
    overflow: "hidden",
  },

  scheduleProgressThumb: {
    width: 28,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primaryBrown,
  },

  scheduleCard: {
    width: 78,
    borderWidth: 1,
    borderColor: "#C8B991",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: "center",
  },

  scheduleCardSelected: {
    backgroundColor: COLORS.primaryBrown,
    borderColor: COLORS.primaryBrown,
  },

  scheduleWeekday: {
    fontSize: 11,
    fontWeight: "bold",
    color: COLORS.textDark,
    opacity: 0.75,
  },

  scheduleDay: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.primaryBrown,
    marginVertical: 2,
  },

  scheduleDaySelected: {
    color: COLORS.yellowIcon,
  },

  scheduleMonth: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textDark,
  },

  scheduleTimeBadge: {
    marginTop: 8,
    backgroundColor: "#DED69A",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },

  scheduleTimeBadgeSelected: {
    backgroundColor: COLORS.yellowIcon,
  },

  scheduleTime: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.primaryBrown,
  },

  scheduleTimeSelected: {
    color: COLORS.textDark,
  },

  scheduleTextSelected: {
    color: COLORS.secondaryBeige,
    opacity: 1,
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
