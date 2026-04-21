"use client";
import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "signaliq_favorites_v1";

function loadIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function useFavorites() {
  const [favs, setFavs] = useState<Set<string>>(new Set());

  // Hydrate after mount to avoid SSR mismatch
  useEffect(() => {
    setFavs(loadIds());
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavs(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch { /* storage full or unavailable */ }
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string) => favs.has(id), [favs]);

  return { favs, toggleFavorite, isFavorite };
}
