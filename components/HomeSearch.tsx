import { Link, type Href } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { EXHIBITIONS_DATA } from "../constants/data";
import { COLORS } from "../constants/theme";
import { getApiUrl, listWorks, normalizeTitle } from "../services/works";
import { SearchBar } from "./SearchBar";

interface SearchResult {
  href: Href;
  title: string;
  category: "Obra" | "Evento" | "Exposição";
}

const exhibitionTitles = new Set(
  EXHIBITIONS_DATA.map(({ title }) => normalizeTitle(title)),
);

async function searchEvents(term: string, signal: AbortSignal): Promise<SearchResult[]> {
  const query = new URLSearchParams({ search: term });
  const response = await fetch(`${getApiUrl()}/api/v1/events?${query}`, { signal });
  if (!response.ok) throw new Error("Não foi possível buscar eventos.");

  const { dados } = (await response.json()) as {
    dados: { idEvent: number; title: string; type?: "event" | "exhibition" }[];
  };
  const isExhibition = (event: (typeof dados)[number]) => {
    if (event.type) return event.type === "exhibition";
    const title = normalizeTitle(event.title);
    return exhibitionTitles.has(title) || /^exposicao(?:\s|:|-|$)/.test(title);
  };
  const exhibitions = dados.filter(isExhibition);
  const events = dados.filter((event) => !isExhibition(event));
  return [
    ...events.slice(0, 5).map((event): SearchResult => ({
      href: `/event/${event.idEvent}` as Href,
      title: event.title,
      category: "Evento",
    })),
    ...exhibitions.slice(0, 5).map((event): SearchResult => ({
      href: `/exibition/${event.idEvent}?source=api` as Href,
      title: event.title,
      category: "Exposição",
    })),
  ];
}

export function HomeSearch() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<{
    term: string;
    items: SearchResult[];
    failures: number;
  }>();
  const term = input.trim();

  useEffect(() => {
    if (term.length < 2) return;

    const controller = new AbortController();
    const { signal } = controller;
    const timer = setTimeout(async () => {
      const [works, events] = await Promise.allSettled([
        listWorks(1, signal, term),
        searchEvents(term, signal),
      ]);
      if (signal.aborted) return;

      const items: SearchResult[] = works.status === "fulfilled"
        ? works.value.content.slice(0, 5).map((work) => ({
            href: `/artwork/${work.idArtwork}` as Href,
            title: work.title,
            category: "Obra",
          }))
        : [];
      if (events.status === "fulfilled") items.push(...events.value);

      setResults({
        term,
        items,
        failures: Number(works.status === "rejected") + Number(events.status === "rejected"),
      });
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [term]);

  const currentResults = results?.term === term ? results : undefined;

  return (
    <>
      <SearchBar
        value={input}
        onChangeText={(value) => {
          if (value.trim() !== term) setResults(undefined);
          setInput(value);
        }}
        onClear={() => {
          setInput("");
          setResults(undefined);
        }}
        placeholder="Buscar obras, eventos e exposições"
      />
      {term.length >= 2 && (
        <View style={styles.results}>
          {!currentResults ? (
            <ActivityIndicator accessibilityLabel="Buscando" color={COLORS.primaryBrown} />
          ) : (
            <>
              {currentResults.items.map((item) => (
                <Link key={String(item.href)} href={item.href} asChild>
                  <Pressable style={styles.row}>
                    <Text style={styles.category}>{item.category}</Text>
                    <Text style={styles.title}>{item.title}</Text>
                  </Pressable>
                </Link>
              ))}
              {currentResults.failures > 0 ? (
                <Text style={styles.message}>
                  {currentResults.failures === 2
                    ? "Não foi possível carregar a busca."
                    : "Parte dos resultados está indisponível."}
                </Text>
              ) : currentResults.items.length === 0 ? (
                <Text style={styles.message}>Nenhum resultado encontrado.</Text>
              ) : null}
            </>
          )}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  results: {
    backgroundColor: COLORS.secondaryBeige,
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 8,
    paddingVertical: 8,
  },
  row: { paddingHorizontal: 16, paddingVertical: 10 },
  category: { color: COLORS.primaryBrown, fontSize: 12, fontWeight: "bold" },
  title: { color: COLORS.textDark, fontSize: 16 },
  message: { color: COLORS.textDark, padding: 12 },
});
