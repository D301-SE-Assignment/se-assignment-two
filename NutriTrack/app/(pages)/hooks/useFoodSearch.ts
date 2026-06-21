import { useEffect, useRef, useState } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

export interface FoodSearchResult {
  id: string;
  name: string;
  brand?: string;
  caloriesPer100g: number | null; // null if the product has no energy data
}

interface UseFoodSearchResult {
  results: FoodSearchResult[];
  searching: boolean;
  error: string | null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const SEARCH_URL = "https://world.openfoodfacts.org/cgi/search.pl";
const DEBOUNCE_MS = 450;

function buildSearchUrl(query: string): string {
  const params = new URLSearchParams({
    search_terms: query,
    search_simple: "1",
    action: "process",
    json: "1",
    page_size: "15",
    fields: "code,product_name,brands,nutriments",
  });
  return `${SEARCH_URL}?${params.toString()}`;
}

function parseProducts(json: any): FoodSearchResult[] {
  const products = json?.products ?? [];
  return products
    .filter((p: any) => p.product_name && p.product_name.trim().length > 0)
    .map((p: any) => ({
      id: p.code ?? p.product_name,
      name: p.product_name,
      brand: p.brands || undefined,
      caloriesPer100g:
        typeof p.nutriments?.["energy-kcal_100g"] === "number"
          ? p.nutriments["energy-kcal_100g"]
          : null,
    }));
}

// ── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Debounced search against the Open Food Facts public API.
 * Pass an empty string to clear results without making a request.
 */
export function useFoodSearch(query: string): UseFoodSearchResult {
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setSearching(false);
      setError(null);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      // Cancel any in-flight request before starting a new one
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setSearching(true);
      setError(null);

      try {
        const res = await fetch(buildSearchUrl(trimmed), {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Search failed (${res.status})`);
        const json = await res.json();
        setResults(parseProducts(json));
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError("Couldn't search food database. Check your connection.");
          setResults([]);
        }
      } finally {
        setSearching(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return { results, searching, error };
}
