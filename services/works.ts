export interface ArtworkSummary {
  idArtwork: number;
  title: string;
  artistName?: string | null;
  creationYear?: number | null;
  description?: string | null;
}

interface WorksPage {
  content: ArtworkSummary[];
  totalElements: number;
  totalPages: number;
}

export function getApiUrl() {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, "");
  if (!baseUrl) {
    throw new Error("Configure EXPO_PUBLIC_API_URL para acessar o acervo.");
  }
  return baseUrl;
}

const WORKS_PAGE_SIZE = 20;

export function normalizeTitle(title: string) {
  return title.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

async function fetchWorksPage(
  page: number,
  pageSize: number,
  signal: AbortSignal,
): Promise<WorksPage> {
  const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  const response = await fetch(
    `${getApiUrl()}/api/v1/works?${query}`,
    { signal },
  ).catch(() => {
    throw new Error("Não foi possível conectar à API do acervo.");
  });

  if (response.status === 429) {
    throw new Error("Muitas consultas. Aguarde um momento e tente novamente.");
  }
  if (!response.ok) {
    throw new Error(`Não foi possível carregar o acervo (${response.status}).`);
  }

  const { dados } = (await response.json()) as { dados?: WorksPage };
  if (
    !dados ||
    !Array.isArray(dados.content) ||
    !Number.isInteger(dados.totalElements) ||
    !Number.isInteger(dados.totalPages)
  ) {
    throw new Error("A API retornou um formato inesperado para o acervo.");
  }

  return dados;
}

export async function listWorks(
  page: number,
  signal: AbortSignal,
  search = "",
): Promise<WorksPage> {
  const term = normalizeTitle(search);
  if (!term) return fetchWorksPage(page, WORKS_PAGE_SIZE, signal);

  const matches: ArtworkSummary[] = [];
  let totalPages = 1;
  for (let catalogPage = 1; catalogPage <= totalPages; catalogPage++) {
    const result = await fetchWorksPage(catalogPage, 100, signal);
    totalPages = result.totalPages;
    matches.push(...result.content.filter((work) => normalizeTitle(work.title).includes(term)));
  }

  const start = (page - 1) * WORKS_PAGE_SIZE;
  return {
    content: matches.slice(start, start + WORKS_PAGE_SIZE),
    totalElements: matches.length,
    totalPages: Math.ceil(matches.length / WORKS_PAGE_SIZE),
  };
}

interface MediaPage {
  content: {
    idArtwork: number | null;
    isMain: boolean;
    mimeType: string | null;
    url: string;
  }[];
  totalPages: number;
}

export async function listWorkCovers(
  artworkIds: number[],
  signal: AbortSignal,
): Promise<Record<number, string>> {
  const baseUrl = getApiUrl();
  const pendingIds = new Set(artworkIds);
  const covers: Record<number, string> = {};

  for (let page = 1; pendingIds.size > 0; page++) {
    const response = await fetch(
      `${baseUrl}/api/v1/files?page=${page}&pageSize=100`,
      { signal },
    );
    if (!response.ok) throw new Error("Não foi possível carregar as capas.");

    const { dados } = (await response.json()) as { dados: MediaPage };
    for (const media of dados.content) {
      if (
        media.idArtwork !== null &&
        pendingIds.has(media.idArtwork) &&
        media.isMain &&
        media.mimeType?.startsWith("image/") &&
        media.url.startsWith("/media/files/")
      ) {
        covers[media.idArtwork] = baseUrl + media.url;
        pendingIds.delete(media.idArtwork);
      }
    }
    if (page >= dados.totalPages) break;
  }

  return covers;
}
