import { getApiUrl } from "./works";

export interface ApiEvent {
  idEvent?: number;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  startTime?: string | null;
  start_time?: string | null;
  durationMinutes?: number;
  duration_minutes?: number;
  allDay?: boolean;
  all_day?: boolean;
  location?: string;
  maxCapacity?: number | null;
  max_capacity?: number | null;
}

export interface ApiSchool {
  idSchool: number;
  name: string;
  cnpj?: string | null;
}

export interface ApiSchoolGroup {
  idGroup: number;
  groupName: string;
  totalStudents: number;
  school?: { idSchool: number; name?: string };
  representative?: {
    idRepresentative: number;
    usuario?: {
      idUsuario?: number;
      nomeUsuario?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
    };
  };
}

export interface ApiVisitorRequest {
  firstName: string;
  lastName: string;
  cpf: string;
  email: string;
  phone?: string;
}

export interface ApiVisitorResponse {
  idVisitor: number;
  firstName: string;
  lastName: string;
  email: string;
  cpf?: string;
  phone?: string;
}

export type BookingStatus = "PENDENTE" | "CONFIRMADO" | "CANCELADO";

export interface ApiEventBookingRequest {
  id_event: number;
  id_visitor?: number;
  id_user?: number;
  id_group?: number;
  expected_participant_count: number;
  booking_date: string;
  status: BookingStatus;
  notes?: string;
}

export interface ApiEventBookingResponse {
  id_booking: number;
  expected_participant_count: number;
  booking_date: string;
  status: BookingStatus;
  notes?: string;
}

export interface EventSchedule {
  id: string;
  date: string;
  details: string;
  isoDateTime: string;
}

// A API pode envelopar a resposta em { dados }, { data } ou devolver direto.
function unwrap<T>(body: any): T {
  if (body && !Array.isArray(body)) {
    return (body.dados ?? body.data ?? body) as T;
  }
  return body as T;
}

async function requestJson<T>(
  path: string,
  options: RequestInit = {},
  signal?: AbortSignal,
): Promise<T> {
  const timeout = new AbortController();
  const timer = setTimeout(() => timeout.abort(), 8000);
  const onAbort = () => timeout.abort();
  signal?.addEventListener("abort", onAbort);

  const response = await fetch(`${getApiUrl()}/api/v1${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers ?? {}),
    },
    signal: timeout.signal,
  })
    .catch((err) => {
      if (signal?.aborted) throw err;
      throw new Error("Não foi possível conectar à API do museu.");
    })
    .finally(() => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
    });

  if (response.status === 404) throw new Error("Recurso não encontrado (404).");
  if (response.status === 429) {
    throw new Error("Muitas consultas. Aguarde um momento e tente novamente.");
  }
  if (!response.ok) {
    let errorMessage = `Erro ao consultar a API (${response.status}).`;
    try {
      const errBody = await response.json();
      const msg = errBody?.mensagem ?? errBody?.message ?? errBody?.erro;
      if (typeof msg === "string" && msg.trim()) {
        errorMessage = msg;
      } else if (Array.isArray(msg) && msg.length > 0) {
        errorMessage = msg.join(" ");
      }
    } catch {}
    const error = new Error(errorMessage) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return unwrap<T>(await response.json());
}

export async function getEvent(
  id: string,
  signal?: AbortSignal,
): Promise<ApiEvent> {
  try {
    const event = await requestJson<ApiEvent>(
      `/events/${encodeURIComponent(id)}`,
      {},
      signal,
    );
    if (event && typeof event === "object" && event.title) {
      return event;
    }
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") throw err;
  }

  // Alternativa caso GET /events/{id} falhe no backend
  const result = await requestJson<any>("/events", {}, signal);
  const list: ApiEvent[] = Array.isArray(result)
    ? result
    : (result?.content ?? result?.events ?? result?.data ?? []);
  const found = list.find((item) => String(item.idEvent) === String(id));
  if (!found) throw new Error("Evento não encontrado.");
  return found;
}

export async function listSchools(signal?: AbortSignal): Promise<ApiSchool[]> {
  const result = await requestJson<any>("/school", {}, signal);
  const list = Array.isArray(result)
    ? result
    : (result?.content ?? result?.data ?? []);
  return list as ApiSchool[];
}

export async function listSchoolGroups(
  schoolId: string,
  signal?: AbortSignal,
): Promise<ApiSchoolGroup[]> {
  const result = await requestJson<any>(
    `/school-groups?id_school=${encodeURIComponent(schoolId)}`,
    {},
    signal,
  );
  const list: ApiSchoolGroup[] = Array.isArray(result)
    ? result
    : (result?.content ?? result?.data ?? []);

  return list.filter(
    (g) => !g.school || String(g.school.idSchool) === String(schoolId),
  );
}

export async function listEventBookings(
  eventId: string,
  signal?: AbortSignal,
): Promise<ApiEventBookingResponse[]> {
  const result = await requestJson<any>(
    `/bookings?id_event=${encodeURIComponent(eventId)}`,
    {},
    signal,
  );
  return Array.isArray(result)
    ? result
    : (result?.content ?? result?.data ?? []);
}

export async function createOrFindVisitor(
  visitor: ApiVisitorRequest,
  signal?: AbortSignal,
): Promise<ApiVisitorResponse> {
  try {
    return await requestJson<ApiVisitorResponse>(
      "/visitors",
      {
        method: "POST",
        body: JSON.stringify(visitor),
      },
      signal,
    );
  } catch (err: any) {
    // 409 Conflict: visitante já cadastrado com mesmo e-mail ou CPF
    if (err?.status === 409) {
      const all = await requestJson<ApiVisitorResponse[]>(
        "/visitors",
        {},
        signal,
      );
      const cleanCpf = visitor.cpf.replace(/\D/g, "");
      const existing = (Array.isArray(all) ? all : []).find(
        (v) =>
          v.email?.toLowerCase() === visitor.email.toLowerCase() ||
          (v.cpf && v.cpf.replace(/\D/g, "") === cleanCpf),
      );
      if (existing) return existing;
    }
    throw err;
  }
}

export async function createEventBooking(
  payload: ApiEventBookingRequest,
  signal?: AbortSignal,
): Promise<ApiEventBookingResponse> {
  return await requestJson<ApiEventBookingResponse>(
    "/bookings",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    signal,
  );
}

export async function createEventBookingGroup(
  id_booking: number,
  id_group: number,
  attending_students: string[] = [],
  signal?: AbortSignal,
): Promise<void> {
  await requestJson(
    "/event-booking-groups",
    {
      method: "POST",
      body: JSON.stringify({ id_booking, id_group, attending_students }),
    },
    signal,
  );
}

/*
  Gera as opções de data/horário a partir do período do evento
  (um item por dia entre start_date e end_date, no máximo 14).
  Se o evento ainda não terminou, começa a partir de hoje.
*/
export function buildSchedules(event: ApiEvent): EventSchedule[] {
  const start = new Date(event.start_date);
  const end = new Date(event.end_date);
  if (Number.isNaN(start.getTime())) return [];

  const last = Number.isNaN(end.getTime()) || end < start ? start : end;

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (last >= today && start < today) start.setTime(today.getTime());

  const rawTime = (event.startTime ?? event.start_time ?? "").trim().slice(0, 5);
  const isAllDay = Boolean(event.allDay ?? event.all_day);

  const isoTimeMatch = event.start_date.match(/T(\d{2}:\d{2})/);
  const fallbackIsoTime =
    isoTimeMatch && isoTimeMatch[1] !== "00:00" ? isoTimeMatch[1] : "";
  const timeStr = rawTime || fallbackIsoTime;

  const timeLabel = timeStr
    ? `às ${timeStr}`
    : isAllDay
      ? "dia inteiro"
      : "";
  const schedules: EventSchedule[] = [];

  for (
    const day = new Date(start);
    day <= last && schedules.length < 14;
    day.setUTCDate(day.getUTCDate() + 1)
  ) {
    const weekday = day.toLocaleDateString("pt-BR", {
      weekday: "long",
      timeZone: "UTC",
    });
    const formattedWeekday = `${weekday[0].toUpperCase()}${weekday.slice(1)}`;
    const dateKey = day.toISOString().slice(0, 10);
    const hhmm = timeStr || "09:00";

    schedules.push({
      id: dateKey,
      date: day.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        timeZone: "UTC",
      }),
      details: timeLabel ? `${formattedWeekday}, ${timeLabel}` : formattedWeekday,
      isoDateTime: `${dateKey}T${hhmm}:00.000Z`,
    });
  }

  return schedules;
}
